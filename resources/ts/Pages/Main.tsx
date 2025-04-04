import React, { useState } from 'react';
import { Box, Button, Checkbox, CircularProgress, Divider, FormControl, FormControlLabel, FormGroup, MenuItem, Select, Step, StepLabel, Stepper, TextField, Typography } from '@mui/material';
import axios from 'axios';
import ExportCard from '../Components/ExportCard';
import DataTable from '../Components/DataTable';
import GenerateFile from '../Components/GenerateFile';
import * as cheerio from 'cheerio';

const steps = [
  'Ввод данных',
  'Получение информации',
  'Редактирование',
  'Выгрузка в файл',
];

type Product = {
  id: string;
  alias: string;
  [key: string]: any; // For additional product information
};

type CategoryData = {
  categoryId: string;
  categoryName: string;
  products: Product[];
};

async function getImages(query: string, count: number): Promise<string[]> {
  try {
    // Формируем URL для поиска
    const apiURL = `/api/21vek/productImages?text=${encodeURIComponent(query)}`;
    const response = await axios.get(apiURL, {
      headers: {
        'Accept': 'text/html',
      },
    });

    // Загружаем HTML в Cheerio
    const $ = cheerio.load(response.data);

    // Ищем div с id, который начинается с ImagesApp
    const imagesAppDiv = $("div[id^='ImagesApp']");

    if (!imagesAppDiv.length) {
      throw new Error("Не удалось найти элемент с id, начинающимся на 'ImagesApp'");
    }

    // Получаем JSON из атрибута data-state
    const dataState = imagesAppDiv.attr("data-state");
    if (!dataState) {
      throw new Error("Не удалось найти атрибут data-state в элементе");
    }

    // Парсим JSON
    const data = JSON.parse(dataState);
    const entities = data?.initialState?.serpList?.items?.entities;

    if (!entities) {
      throw new Error("Не удалось найти entities в data.initialState.serpList.items");
    }

    // Берем первые `count` изображений
    const imageLinks = Object.values(entities)
      .filter((entity: any) => entity?.origUrl) // Фильтруем только объекты с origUrl
      .slice(0, count) // Ограничиваем количество изображений
      .map((entity: any) => entity.origUrl);

    return imageLinks;
  } catch (error) {
    console.error("Ошибка при получении изображений:", error);
    return [];
  }
}

const Main: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentProcess, setCurrentProcess] = useState('');
  const [products, setProducts] = useState<CategoryData[]>([]);
  const [donor, setDonor] = useState('21vek.by');
  const [links, setLinks] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [checkedImages, setCheckedImages] = useState(true);

  const getGoodsData = async (categoryLinks: string[]) => {
    const allData: CategoryData[] = [];
    const parsedProducts: CategoryData[] = [];
    const errors: string[] = [];
    let totalProducts = 0;
    const cartegoryPercent = 15 / categoryLinks.length;

    const getLastPartOfPath = (path: string) => {
      const parts = path.split('/');
      const lastPart = parts[parts.length - 1];
      return lastPart.replace(/\.[^/.]+$/, ''); // Remove the file extension
    };

    setCurrentProcess('Получаем категории');
    for (const link of categoryLinks) {
      let currentPage = 1;
      let lastPage = 1;
      const categoryData: CategoryData = {
        categoryId: '',
        categoryName: '',
        products: [],
      };

      do {
        try {
          const resp = await axios.post('/api/21vek/productList', {
            url: link,
            page: currentPage,
          });

          if (resp.data.data && resp.data.data.products && resp.data.data.products.meta) {
            const { data } = resp.data.data.products;
            const meta = resp.data.data.products.meta;

            // Correctly extract currentPage and lastPage from response
            lastPage = meta.lastPage;

            if (!categoryData.categoryId) {
              categoryData.categoryId = resp.data.data.category.templateId || 'Unknown';
              categoryData.categoryName = resp.data.data.category.name || 'Unknown';
            }

            const products = data.map((product: any) => ({
              id: product.code,
              alias: getLastPartOfPath(product.link),
            }));

            categoryData.products.push(...products);
            setCurrentProcess('Получаем список товаров в категории "' + categoryData.categoryName + '"');
            totalProducts += products.length;
          } else {
            errors.push(`Invalid response format for category link: ${link}, page: ${currentPage}`);
            break;
          }
        } catch (err) {
          const errorMsg = `Error fetching data for link: ${link}, page: ${currentPage}`;
          console.error(errorMsg);
          errors.push(errorMsg);
          break; // Exit the pagination loop on error
        }

        currentPage++; // Increment currentPage AFTER processing the response
      } while (currentPage <= lastPage); // Ensure loop terminates correctly

      setProgress(prev => prev + cartegoryPercent);
      allData.push(categoryData);
    }

    const productPercent = 85 / totalProducts;

    // Fetch detailed product information
    for (const category of allData) {
      let processedProducts = 0;
      const parsedCategory: CategoryData = {
        categoryId: category.categoryId,
        categoryName: category.categoryName,
        products: [],
      };

      for (const product of category.products) {
        setCurrentProcess(`Загружаем товары в категории "${parsedCategory.categoryName}": ${processedProducts + 1} из ${category.products.length}`);
        try {
          const resp = await axios.post('/api/21vek/productData', {
            alias: product.alias,
          });

          if (resp.data.data) {
            const gallery = resp.data.data.gallery.filter((el: any) => el.type === "image").map(el => el.fullSize || el.preview || el.miniature);
            let updatedGallery = [];
            if (checkedImages) updatedGallery = await getImages(resp.data.data.name, gallery.length);

            parsedCategory.products.push({
              ...product,
              categoryName: parsedCategory.categoryName,
              url: 'https://www.21vek.by' + resp.data.data.link,
              name: resp.data.data.name,
              images: checkedImages && updatedGallery.length > 0 ? updatedGallery : gallery,
              price: resp.data.data.prices.salePrice ? resp.data.data.prices.salePrice : resp.data.data.prices.price,
              monthlyPayment: resp.data.data.prices.salePrice ? Math.floor(resp.data.data.prices.salePrice / 48) : Math.floor(resp.data.data.prices.price / 48),
              attributes: resp.data.data.attributes,
              description: resp.data.data.description
            });
          } else {
            const errorMsg = `Invalid product data for alias: ${product.alias}`;
            console.error(errorMsg);
            errors.push(errorMsg);
          }
        } catch (err) {
          const errorMsg = `Error fetching product data for alias: ${product.alias}`;
          console.error(errorMsg);
          errors.push(errorMsg);
        }

        processedProducts++;
        setProgress((prev) => prev + productPercent);
      }

      parsedProducts.push(parsedCategory);
    }

    setCurrentProcess(`Количество категорий: ${categoryLinks.length}. Количество товаров: ${totalProducts}.`);
    setProgress(100);
    setProducts(parsedProducts);
    console.log('Errors:', errors);
    setActiveStep(2);

    return parsedProducts;
  };

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(1);
      let categoriesLinks = links.split(/[\n,]+/).map(link => link.trim()).filter(link => link.length > 0 && link.startsWith('http'));
      categoriesLinks = categoriesLinks.filter((item, index) => categoriesLinks.indexOf(item) === index);
      getGoodsData(categoriesLinks);
    }
  };

  const changeDonor = (e: any) => {
    const value = e.target.value;
    if (value !== donor) {
      setActiveStep(0);
      setDonor(value);
    }
  }
  const changeLinks = (e: any) => {
    const value = e.target.value;
    setLinks(value);
  }

  return (
    <Box height="auto" minHeight='100vh'>
      <Box sx={{ textAlign: 'right', backgroundColor: 'rgba(0, 0, 0, 0.06)' }}>
        <FormControl variant='filled' sx={{ minWidth: 130, backgroundColor: 'white' }} size="small">
          <Select
            value={donor}
            label="Сайт-донор"
            onChange={changeDonor}
          >
            <MenuItem value={'21vek.by'}>21vek.by</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Box p={3}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label, i) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Box mt={4}>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="200px">
              <CircularProgress />
            </Box>
          ) : (
            <>
              {activeStep === 0 ? (
                <Box sx={{ textAlign: 'center' }}>
                  <Box>
                    <Typography variant='h5' component='h1'>Введите ссылки на категории товаров</Typography>
                    <Typography variant='caption' component='p' color='textSecondary'>(через запятую или с новой строки)</Typography>
                    <TextField
                      label="Ссылки на категории"
                      value={links}
                      onChange={changeLinks}
                      multiline
                      sx={{
                        width: '100%',
                        maxWidth: '500px',
                        my: 4,
                        backgroundColor: 'white'
                      }}
                    />
                  </Box>
                  <Box>
                    <FormGroup>
                      <FormControlLabel
                        sx={{
                          width: '100%',
                          maxWidth: '500px',
                          mx: 'auto'
                        }}
                        control={
                          <Checkbox
                            checked={checkedImages}
                            onChange={(e, checked) =>
                              setCheckedImages(checked)
                            }
                          />
                        }
                        label="Загружать картинки из Яндекса"
                      />
                    </FormGroup>
                  </Box>
                  <Box mt={2} sx={{ textAlign: 'center' }}>
                    {activeStep < steps.length - 1 && (
                      <Button disabled={links.length === 0} variant="contained" onClick={handleNext}>
                        Далее
                      </Button>
                    )}
                  </Box>
                </Box>
              ) : activeStep === 1 ? (
                <ExportCard progress={progress} currentProcess={currentProcess} />
              ) : activeStep === 2 ? (
                <>
                  {products.length > 0 && products.map((el, i) => (
                    <React.Fragment key={'table' + i}>
                      {el.products.length > 0 && <DataTable data={el.products} categoryName={el.categoryName} changeProducts={setProducts} />}
                      {i !== products.length - 1 && <Divider variant="middle" component="div" sx={{ maxWidth: 1200, mx: 'auto', mt: 3 }} />}
                    </React.Fragment>
                  ))}
                  <Box mt={2} sx={{ textAlign: 'center' }}>
                    {activeStep < steps.length - 1 && (
                      <Button variant="contained" onClick={() => setActiveStep(3)}>
                        Далее
                      </Button>
                    )}
                  </Box>
                </>
              ) : (
                <GenerateFile products={products} changeCompleted={setIsCompleted} goBack={setActiveStep} />
              )}
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Main;