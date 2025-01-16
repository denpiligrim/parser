import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { ruRU } from '@mui/x-data-grid/locales';
import Paper from '@mui/material/Paper';
import { Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Table, TableBody, TableCell, TableContainer, TableRow, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CloseIcon from '@mui/icons-material/Close';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import React, { useState } from 'react';

type CategoryData = {
  categoryId: string;
  categoryName: string;
  products: Product[];
};

const paginationModel = { page: 0, pageSize: 10 };

export default function DataTable({ data, changeProducts }) {

  const [open, setOpen] = useState(false);
  const [currentAttr, setCurrentAttr] = useState(0);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const columns: GridColDef[] = [
    {
      field: 'siteLink',
      headerName: '',
      width: 40,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderHeader: (params: any) => (
        <OpenInNewIcon fontSize="small" />
      ),
      renderCell: (params: any) => (
        <IconButton aria-label="delete" size="small" title='Посмотреть на сайте' href={params.value} target='_blank'>
          <OpenInNewIcon fontSize="inherit" />
        </IconButton>
      ),
    },
    // {
    //   field: 'categoryName',
    //   headerName: 'Категория',
    //   sortable: false,
    //   filterable: false,
    //   width: 200
    // },
    {
      field: 'url',
      headerName: 'Ссылка',
      sortable: false,
      filterable: false,
      width: 150
    },
    {
      field: 'name',
      headerName: 'Название товара',
      width: 200
    },
    {
      field: 'images',
      headerName: 'Изображения',
      sortable: false,
      filterable: false,      
      renderCell: (params: any) => (
        <Box>
          {params.value.map((img, i) => (
            <img key={'image' + i} src={img} alt='Image' height={50} style={{ border: '1px solid #bdbdbd', margin: '1px' }} />
          ))}
        </Box>
      ),
      width: 200
    },
    {
      field: 'price',
      headerName: 'Цена',
      type: 'number',
      width: 100,
    },
    {
      field: 'monthlyPayment',
      headerName: 'Оплата частями',
      description: 'Оплата частями при расчете на 48 месяцев без первого взноса.',
      width: 100
    },
    {
      field: 'attributes',
      headerName: 'Характеристики',
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<any, Date>) => (
        <>
          <IconButton aria-label="delete" size="small" title='Посмотреть характеристики' onClick={() => {
            setCurrentAttr(parseInt(params.id as string) - 1);
            handleClickOpen();
          }}>
            <OpenInFullIcon fontSize="inherit" />
          </IconButton>
          {params.value[0].groupItems[0].name + ': ' + params.value[0].groupItems[0].value.slice(0, 9) + '...'}
        </>
      ),
      width: 200
    }
  ];

  const updateProductField = (
    products: CategoryData[],
    categoryName: string,
    productIndex: number,
    fieldName: string,
    newValue: any
  ): CategoryData[] => {
    return products.map((category) => {
      if (category.categoryName === categoryName) {
        return {
          ...category,
          products: category.products.map((product, index) =>
            index === productIndex
              ? { ...product, [fieldName]: newValue }
              : product
          ),
        };
      }
      return category;
    });
  };

  const updateCategoryName = (
    products: CategoryData[],
    categoryName: string,
    newValue: string
  ): CategoryData[] => {
    return products.map((category) =>
      category.categoryName === categoryName
        ? { ...category, categoryName: newValue }
        : category
    );
  };

  const changeField = (field: string, i: string | number) => {
    changeProducts((prevProducts) =>
      updateProductField(prevProducts, 'Электроника', 0, 'price', 1200)
    );
  }

  return (
    <>
      <Card sx={{ maxWidth: 1200, margin: 'auto', mt: 3 }}>
        <CardContent>
          <Typography variant="h5" component="div" gutterBottom>
            {data[0].categoryName}
            <IconButton aria-label="delete" size="small" title='Редактировать категорию' onClick={() => changeField('categoryName', data[0].categoryName)}>
              <EditIcon fontSize="inherit" />
            </IconButton>
          </Typography>
          <Paper sx={{ height: 'auto', width: '100%' }}>
            <DataGrid
              rows={data.map((el: any, i: number) => {
                return {
                  id: i + 1,
                  siteLink: el.url,
                  // categoryName: el.categoryName,
                  url: el.url,
                  name: el.name,
                  images: el.images,
                  price: el.price,
                  monthlyPayment: el.monthlyPayment,
                  attributes: el.attributes
                }
              })}
              columns={columns}
              initialState={{ pagination: { paginationModel } }}
              pageSizeOptions={[10, 20, 40]}
              checkboxSelection
              localeText={ruRU.components.MuiDataGrid.defaultProps.localeText}
              sx={{ border: 0 }}
            />
          </Paper>
        </CardContent>
      </Card>
      <Dialog
        open={open}
        onClose={handleClose}
      >
        <DialogTitle>
          Характеристики товара
          <CloseIcon sx={{ float: 'right', cursor: 'pointer', "&:hover": { opacity: '.7' } }} onClick={handleClose} />
        </DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" fontWeight={500} component="div" gutterBottom>
            {data[currentAttr].name}
          </Typography>
          {data[currentAttr].attributes.map((group, i) => (
            <React.Fragment key={group.group}>
              <Typography variant="subtitle2" component="div" gutterBottom>
                {group.group}
              </Typography>
              <TableContainer>
                <Table aria-label="simple table">
                  <TableBody>
                    {group.groupItems.map((item, i) => (
                      <TableRow
                        key={'groupItem' + i}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell align="left" sx={{ color: "primary.main" }}>{item.name}</TableCell>
                        <TableCell align="left">{item.value}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </React.Fragment>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Закрыть</Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={open}
        onClose={handleClose}
      >
        <DialogTitle>
          Характеристики товара
          <CloseIcon sx={{ float: 'right', cursor: 'pointer', "&:hover": { opacity: '.7' } }} onClick={handleClose} />
        </DialogTitle>
        <DialogContent>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

// https://www.21vek.by/small_tech_apps/
// https://www.21vek.by/meat_grinder_accessories/
// https://www.21vek.by/toaster_accessories/
// https://www.21vek.by/yogurt_maker_accessories/