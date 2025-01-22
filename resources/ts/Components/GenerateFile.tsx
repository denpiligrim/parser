import React, { useState } from 'react';
import {
  Grid2 as Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Typography,
  Divider,
  Radio,
} from '@mui/material';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

type Product = {
  categoryName: string;
  url: string;
  name: string;
  images: string[];
  price: number;
  monthlyPayment?: number;
  description: string;
  attributes: Record<string, any>;
};

type CategoryData = {
  categoryId: string;
  categoryName: string;
  products: Product[];
};

type ExportCardProps = {
  products: any;
  changeCompleted: any;
  goBack: any;
};

const GenerateFile: React.FC<ExportCardProps> = ({ products, changeCompleted, goBack }) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(products.map(c => c.categoryName));
  const [selectedFormats, setSelectedFormats] = useState<string[]>(['XLSX']);
  const [selectedArgument, setSelectedArgument] = useState<string[]>(['в одном файле']);

  const handleCategoryChange = (categoryName: string) => {
    if (products.length === 1) {
      setSelectedCategories([products[0].categoryName]);
    } else {
      setSelectedCategories((prev) =>
        prev.includes(categoryName)
          ? prev.filter((c) => c !== categoryName)
          : [...prev, categoryName]
      );
    }
  };

  const handleFormatChange = (format: string) => {
    setSelectedFormats((prev) =>
      prev.includes(format)
        ? prev.filter((f) => f !== format)
        : [...prev, format]
    );
  };

  const generateFiles = async () => {
    if (selectedFormats.length === 0) {
      alert('Выберите хотя бы один формат файла!');
      return;
    }

    changeCompleted(true);

    const zip = new JSZip();
    const filesToDownload: { name: string; blob: Blob }[] = [];

    const filteredProducts =
      selectedCategories.length === products.length
        ? products
        : products.filter((category) =>
          selectedCategories.includes(category.categoryName)
        );

    for (const format of selectedFormats) {
      if (selectedArgument.includes('в одном файле')) {
        // Генерация одного файла для всех категорий
        const fileName = selectedCategories.length === 1 ? `${filteredProducts[0].categoryName}.${format.toLowerCase()}` : `Все категории.${format.toLowerCase()}`;
        let content = '';

        if (format === 'CSV') {
          content = generateCSV(filteredProducts.flatMap((c) => c.products));
        } else if (format === 'XLSX') {
          const excelBuffer = generateXLSX(filteredProducts.flatMap((c) => c.products));
          const blob = new Blob([excelBuffer], {
            type: 'application/octet-stream',
          });
          filesToDownload.push({ name: fileName, blob });
          continue;
        } else if (format === 'YML') {
          content = generateYML(filteredProducts.flatMap((c) => c.products));
        }

        const blob = new Blob([content], {
          type: format === 'XLSX' ? 'application/octet-stream' : 'text/plain;charset=utf-8',
        });

        filesToDownload.push({ name: fileName, blob });
      } else {
        // Генерация отдельного файла для каждой категории
        for (const category of filteredProducts) {
          const fileName = `${category.categoryName}.${format.toLowerCase()}`;
          let content = '';

          if (format === 'CSV') {
            content = generateCSV(category.products);
          } else if (format === 'XLSX') {
            const excelBuffer = generateXLSX(category.products);
            const blob = new Blob([excelBuffer], {
              type: 'application/octet-stream',
            });
            filesToDownload.push({ name: fileName, blob });
            continue;
          } else if (format === 'YML') {
            content = generateYML(category.products);
          }

          const blob = new Blob([content], {
            type: format === 'XLSX' ? 'application/octet-stream' : 'text/plain;charset=utf-8',
          });

          zip.file(fileName, blob);
        }
      }
    }

    if (filesToDownload.length === 1) {
      // Если только один файл, скачиваем его напрямую
      const { name, blob } = filesToDownload[0];
      saveAs(blob, name);
    } else {
      // Создание ZIP-архива для нескольких файлов
      filesToDownload.forEach(({ name, blob }) => zip.file(name, blob));
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, 'Экспорт.zip');
    }
  };

  const generateCSV = (products: Product[]): string => {
    const headers = ['Категория', 'Название', 'Фото', 'Цена', 'Описание'];
    const rows = products.map((product) => [
      product.categoryName,
      product.name,
      product.images.length > 0 ? product.images[0] : '',
      product.price,
      product.description
    ]);

    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  };

  const generateYML = (products: Product[]): string => {
    return `<products>\n${products
      .map(
        (product) =>
          `  <product>\n   <product_category>${product.categoryName}</product_category>\n    <product_name>${product.name}</product_name>\n    <product_image>${product.images.length > 0 ? product.images[0] : ''}</product_image>\n    <product_price>${product.price}</product_price>\n    <product_description>${product.description || ''
          }</product_description>\n    <product_attributes>
          ${product.attributes.map(attr => {
          return '<product_attribute_group>' + '<product_attribute_group_name>' + attr.group + '</product_attribute_group_name>' + attr.groupItems.map(item => {
            return '<product_attribute_group_item>' + '<product_attribute_group_item_name>' + item.name + '</product_attribute_group_item_name> ' + '<product_attribute_group_item_value>' + item.value + '</product_attribute_group_item_value>' + '</product_attribute_group_item>'
          }) + '</product_attribute_group>'
        })}
          </product_attributes>\n  </product>`
      )
      .join('\n')}\n</products>`;
  };

  const generateXLSX = (products: Product[]): any => {
    const worksheetData = [
      ['Категория', 'Название', 'Фото', 'Цена', 'Описание'], // Заголовки
      ...products.map((product) => [
        product.categoryName,
        product.name,
        product.images.length > 0 ? product.images[0] : '',
        product.price,
        getProductDescriptionHTML(product.description, product.attributes)
      ]),
    ];

    // Создаём рабочий лист
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Создаём книгу
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');

    // Генерируем файл в формате Blob
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    return excelBuffer;
  };

  function getProductDescriptionHTML(descr, attr) {
    const d = `<p>${descr}</p>`;
    const attributes = attr.map(attr => {
      return '<h4>' + attr.group + '</h4>' + attr.groupItems.map(item => {
        return '<p>' + '<b>' + item.name + ':</b> ' + item.value + '</p>'
      }).join('')
    }).join('');

    return d + '<h3>Характеристики</h3>' + attributes;
  }

  return (
    <Card sx={{ maxWidth: 600, margin: 'auto', mt: 5 }}>
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom>
          Экспорт товаров
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" gutterBottom>
          Выберите категории:
        </Typography>
        <FormGroup>
          {products.length > 1 && (
            <>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedCategories.length === products.length}
                    onChange={(e, checked) =>
                      setSelectedCategories(checked ? products.map(c => c.categoryName) : [])
                    }
                  />
                }
                label="Все категории"
              />
              <Divider component="div" />
            </>
          )}
          {products.map((category) => (
            <FormControlLabel
              key={category.categoryName}
              control={
                <Checkbox
                  checked={selectedCategories.includes(category.categoryName)}
                  onChange={() => handleCategoryChange(category.categoryName)}
                />
              }
              label={category.categoryName}
            />
          ))}
        </FormGroup>
        <Grid container>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle1" color="textSecondary" gutterBottom mt={2}>
              Выберите формат файла:
            </Typography>
            <FormGroup>
              {['XLSX', 'CSV', 'YML'].map((format) => (
                <FormControlLabel
                  key={format}
                  control={
                    <Checkbox
                      checked={selectedFormats.includes(format)}
                      onChange={() => handleFormatChange(format)}
                    />
                  }
                  label={format}
                />
              ))}
            </FormGroup>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle1" color="textSecondary" gutterBottom mt={2}>
              Параметры выгрузки категорий:
            </Typography>
            <FormGroup>
              {['в одном файле', 'раздельно'].map((arg) => (
                <FormControlLabel
                  key={arg}
                  control={
                    <Radio
                      checked={selectedArgument.includes(arg)}
                      onChange={() => setSelectedArgument([arg])}
                    />
                  }
                  label={arg}
                />
              ))}
            </FormGroup>
          </Grid>
        </Grid>
      </CardContent>
      <CardActions sx={{ justifyContent: 'center' }}>
        <Button variant="text" color="primary" onClick={() => goBack(2)}>
          Назад
        </Button>
        <Button variant="contained" color="primary" onClick={generateFiles}>
          Экспорт
        </Button>
      </CardActions>
    </Card>
  );
};

export default GenerateFile;