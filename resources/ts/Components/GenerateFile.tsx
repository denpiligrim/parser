import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Typography,
  Divider,
} from '@mui/material';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

type Product = {
  url: string;
  name: string;
  images: string[];
  price: number;
  monthlyPayment?: number;
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
};

const GenerateFile: React.FC<ExportCardProps> = ({ products, changeCompleted }) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<string[]>(['CSV']);

  const handleCategoryChange = (categoryName: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((c) => c !== categoryName)
        : [...prev, categoryName]
    );
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
      selectedCategories.length === 0
        ? products
        : products.filter((category) =>
            selectedCategories.includes(category.categoryName)
          );

    for (const format of selectedFormats) {
      for (const category of filteredProducts) {
        const fileName =
          selectedCategories.length === 0
            ? `all_categories.${format.toLowerCase()}`
            : `${category.categoryName}.${format.toLowerCase()}`;

        let content = '';
        if (format === 'CSV') {
          content = generateCSV(category.products);
        } else if (format === 'XLSX') {
          content = generateXLSX(category.products); // Replace with actual XLSX generation
        } else if (format === 'YML') {
          content = generateYML(category.products);
        }

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });

        if (filteredProducts.length > 1 || selectedFormats.length > 1) {
          zip.file(fileName, blob);
        } else {
          filesToDownload.push({ name: fileName, blob });
        }
      }
    }

    if (Object.keys(zip.files).length > 0) {
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, 'export.zip');
    } else {
      filesToDownload.forEach((file) => saveAs(file.blob, file.name));
    }
  };

  const generateCSV = (products: Product[]): string => {
    const headers = ['URL', 'Name', 'Images', 'Price', 'Monthly Payment', 'Attributes'];
    const rows = products.map((product) => [
      product.url,
      product.name,
      product.images.join('; '),
      product.price,
      product.monthlyPayment || '',
      JSON.stringify(product.attributes),
    ]);

    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  };

  const generateYML = (products: Product[]): string => {
    return `<products>\n${products
      .map(
        (product) =>
          `  <product>\n    <url>${product.url}</url>\n    <name>${product.name}</name>\n    <images>${product.images.join(
            ', '
          )}</images>\n    <price>${product.price}</price>\n    <monthlyPayment>${
            product.monthlyPayment || ''
          }</monthlyPayment>\n    <attributes>${JSON.stringify(
            product.attributes
          )}</attributes>\n  </product>`
      )
      .join('\n')}\n</products>`;
  };

  const generateXLSX = (products: Product[]): string => {
    return `XLSX generation placeholder for ${products.length} products.`;
  };

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
          <FormControlLabel
            control={
              <Checkbox
                checked={selectedCategories.length === 0}
                onChange={() =>
                  setSelectedCategories(
                    selectedCategories.length === 0
                      ? products.map((category) => category.categoryName)
                      : []
                  )
                }
              />
            }
            label="Все категории"
          />
          <Divider component="div" />
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
        <Typography variant="subtitle1" color="textSecondary" gutterBottom mt={2}>
          Выберите формат файла:
        </Typography>
        <FormGroup>
          {['CSV', 'XLSX', 'YML'].map((format) => (
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
      </CardContent>
      <CardActions sx={{ justifyContent: 'center' }}>
        <Button variant="contained"  color="primary" onClick={generateFiles}>
          Экспорт
        </Button>
      </CardActions>
    </Card>
  );
};

export default GenerateFile;