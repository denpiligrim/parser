import React, { useState } from 'react';
import { Box, Button, CircularProgress, FormControl, MenuItem, Select, Step, StepLabel, Stepper, TextField, Typography } from '@mui/material';
import axios from 'axios';

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

export const getGoodsData = async (categoryLinks: string[]) => {
  const allData: CategoryData[] = [];
  const parsedProducts: CategoryData[] = [];
  const errors: string[] = [];

  const getLastPartOfPath = (path: string) => {
    const parts = path.split('/');
    const lastPart = parts[parts.length - 1];
    return lastPart.replace(/\.[^/.]+$/, ''); // Remove the file extension
  };

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

        const { data } = resp.data.products;
        const { currentPage: current, lastPage: last } = resp.data.products.meta;

        currentPage = current;
        lastPage = last;

        if (!categoryData.categoryId) {
          categoryData.categoryId = resp.data.category.templateId;
          categoryData.categoryName = resp.data.category.name;
        }

        const products = data.map((product: any) => ({
          id: product.code,
          alias: getLastPartOfPath(product.link),
        }));

        categoryData.products.push(...products);
      } catch (error) {
        const errorMsg = `Error fetching data for link: ${link}, page: ${currentPage}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }

    } while (currentPage < lastPage);

    allData.push(categoryData);
  }

  for (const category of allData) {
    const parsedCategory: CategoryData = {
      categoryId: category.categoryId,
      categoryName: category.categoryName,
      products: [],
    };

    for (const product of category.products) {
      try {
        const resp = await axios.post('/api/21vek/productData', {
          alias: product.alias,
        });

        parsedCategory.products.push({
          ...product,
          ...resp.data, // Merge the full product info
        });
      } catch (error) {
        const errorMsg = `Error fetching product data for alias: ${product.alias}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
    }

    parsedProducts.push(parsedCategory);
  }

  console.log('Errors:', errors);
  console.log(parsedProducts);
  
  return parsedProducts;
};

const Main: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [donor, setDonor] = useState('21vek.by');
  const [links, setLinks] = useState('');

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setLoading(true);
      if (activeStep === 0) {
        setActiveStep(1);
        const categoriesLinks = links.split(/[\n,]+/).map(link => link.trim()).filter(link => link.length > 0 && link.startsWith('http'));
        getGoodsData(categoriesLinks);
      } else if (activeStep === 2) {

      }
      setTimeout(() => {
        setLoading(false);
        setActiveStep((prevStep) => prevStep + 1);
      }, 2000); // Имитация загрузки

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
          {steps.map((label) => (
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
              <Box mt={2} sx={{ textAlign: 'center' }}>
                {activeStep < steps.length - 1 && (
                  <Button disabled={links.length === 0} variant="contained" onClick={handleNext}>
                    Далее
                  </Button>
                )}
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Main;