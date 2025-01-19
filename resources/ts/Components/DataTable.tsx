import { DataGrid, GridColDef, GridRenderCellParams, GridRowSelectionModel } from '@mui/x-data-grid';
import { ruRU } from '@mui/x-data-grid/locales';
import Paper from '@mui/material/Paper';
import { Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Table, TableBody, TableCell, TableContainer, TableRow, TextField, Tooltip, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CloseIcon from '@mui/icons-material/Close';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import InfoIcon from '@mui/icons-material/Info';
import DeleteIcon from '@mui/icons-material/Delete';
import React, { useState } from 'react';

type Product = {
  id: string;
  alias: string;
  [key: string]: any;
};

type CategoryData = {
  categoryId: string;
  categoryName: string;
  products: Product[];
};

const paginationModel = { page: 0, pageSize: 10 };

export default function DataTable({ data, categoryName, changeProducts }) {

  const [open, setOpen] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openFieldModal, setOpenFieldModal] = useState(false);
  const [currentAttr, setCurrentAttr] = useState(0);
  const [currentProduct, setCurrentProduct] = useState(0);
  const [currentField, setCurrentField] = useState('url');
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>([]);
  const [openImageModal, setOpenImageModal] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleClickOpenEditModal = () => {
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
  };
  const handleClickOpenFieldModal = () => {
    setOpenFieldModal(true);
  };

  const handleCloseFieldModal = () => {
    setOpenFieldModal(false);
  };

  const handleOpenImageModal = (imageUrl: string) => {
    setCurrentImage(imageUrl);
    setOpenImageModal(true);
  };

  const handleCloseImageModal = () => {
    setCurrentImage(null);
    setOpenImageModal(false);
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
      renderCell: (params: GridRenderCellParams<any, Date>) => (
        <>
          <IconButton size="small" title='Редактировать url' onClick={() => {
            setCurrentField('url');
            setCurrentProduct(parseInt(params.id as string) - 1);
            handleClickOpenFieldModal();
          }}>
            <EditIcon fontSize="inherit" />
          </IconButton>
          {params.value.toString()}
        </>
      ),
      width: 150
    },
    {
      field: 'name',
      headerName: 'Название товара',
      renderCell: (params: GridRenderCellParams<any, Date>) => (
        <>
          <IconButton size="small" title='Редактировать название товара' onClick={() => {
            setCurrentField('name');
            setCurrentProduct(parseInt(params.id as string) - 1);
            handleClickOpenFieldModal();
          }}>
            <EditIcon fontSize="inherit" />
          </IconButton>
          {params.value.toString()}
        </>
      ),
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
            <img key={'image' + i} src={img} loading='lazy' alt='Image' height={50} style={{ border: '1px solid #bdbdbd', margin: '1px', cursor: 'zoom-in' }} onClick={() => handleOpenImageModal(img)} />
          ))}
        </Box>
      ),
      width: 200
    },
    {
      field: 'price',
      headerName: 'Цена',
      type: 'number',
      renderCell: (params: GridRenderCellParams<any, Date>) => (
        <>
          <IconButton size="small" title='Редактировать цену товара' onClick={() => {
            setCurrentField('price');
            setCurrentProduct(parseInt(params.id as string) - 1);
            handleClickOpenFieldModal();
          }}>
            <EditIcon fontSize="inherit" />
          </IconButton>
          {params.value.toString()}
        </>
      ),
      width: 100,
    },
    {
      field: 'monthlyPayment',
      headerName: 'Оплата частями',
      description: 'Оплата частями при расчете на 48 месяцев без первого взноса.',
      renderCell: (params: GridRenderCellParams<any, Date>) => (
        <>
          <IconButton size="small" title='Редактировать оплату частями' onClick={() => {
            setCurrentField('monthlyPayment');
            setCurrentProduct(parseInt(params.id as string) - 1);
            handleClickOpenFieldModal();
          }}>
            <EditIcon fontSize="inherit" />
          </IconButton>
          {params.value.toString()}
        </>
      ),
      width: 100
    },
    {
      field: 'attributes',
      headerName: 'Характеристики',
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<any, Date>) => (
        <>
          <IconButton size="small" title='Посмотреть характеристики' onClick={() => {
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

  const changeCategory = (newValue: string) => {
    changeProducts((prevProducts) =>
      updateCategoryName(prevProducts, categoryName, newValue)
    );
  }

  const changeField = (productIndex: number, fieldName: string, newValue: string) => {
    changeProducts((prevProducts) =>
      updateProductField(prevProducts, categoryName, productIndex, fieldName, newValue)
    );
  }

  const handleDeleteSelected = () => {
    changeProducts(prev => {
      return prev.map((category) => {
        if (category.categoryName === categoryName) {
          return {
            ...category,
            products: category.products.filter(
              (_, index) => !selectionModel.includes(index + 1) // Исключаем товары с указанными индексами
            ),
          };
        }
        return category;
      })
    });
    setSelectionModel([]);
  };

  return (
    <>
      <Card sx={{ maxWidth: 1200, margin: 'auto', mt: 3 }}>
        <CardContent>
          <Typography variant="h5" component="div" gutterBottom>
            {categoryName}
            <IconButton size="small" title='Редактировать категорию' onClick={handleClickOpenEditModal}>
              <EditIcon fontSize="inherit" />
            </IconButton>
          </Typography>
          <Paper sx={{ height: 'auto', width: '100%' }}>
            <Box display="flex" justifyContent="flex-end" mb={2}>
              <Button
                variant="contained"
                size='small'
                color="primary"
                startIcon={<DeleteIcon />}
                onClick={handleDeleteSelected}
                disabled={selectionModel.length === 0} // Кнопка активна только при выделении
              >
                Удалить выбранные {selectionModel.length > 0 && '(' + selectionModel.length + ')'}
              </Button>
            </Box>
            <DataGrid
              rows={data.map((el: any, i: number) => {
                return {
                  id: i + 1,
                  siteLink: el.url,
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
              disableRowSelectionOnClick
              localeText={ruRU.components.MuiDataGrid.defaultProps.localeText}
              sx={{ border: 0 }}
              onRowSelectionModelChange={(newSelection) => setSelectionModel(newSelection)}
              rowSelectionModel={selectionModel}
            />
          </Paper>
        </CardContent>
      </Card>
      <Dialog
        closeAfterTransition={false}
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
                        <TableCell align="left" sx={{ color: "primary.main" }}>
                          {item.itemDescription && (
                            <Tooltip arrow title={<div dangerouslySetInnerHTML={{ __html: item.itemDescription }} />}>
                              <IconButton size="small" title='Описание'>
                                <InfoIcon fontSize="inherit" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {item.name}
                        </TableCell>
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
        closeAfterTransition={false}
        open={openEditModal}
        onClose={handleCloseEditModal}
        maxWidth='md'
        sx={{
          '.MuiDialog-paper': {
            width: '100%'
          }
        }}
      >
        <DialogTitle>
          Редактирование категории
          <CloseIcon sx={{ float: 'right', cursor: 'pointer', "&:hover": { opacity: '.7' } }} onClick={handleCloseEditModal} />
        </DialogTitle>
        <DialogContent>
          <TextField fullWidth variant="outlined" value={categoryName} onChange={e => changeCategory(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditModal}>Закрыть</Button>
        </DialogActions>
      </Dialog>
      <Dialog
        closeAfterTransition={false}
        open={openFieldModal}
        onClose={handleCloseFieldModal}
        maxWidth='md'
        sx={{
          '.MuiDialog-paper': {
            width: '100%'
          }
        }}
      >
        <DialogTitle>
          Редактирование поля
          <CloseIcon sx={{ float: 'right', cursor: 'pointer', "&:hover": { opacity: '.7' } }} onClick={handleCloseFieldModal} />
        </DialogTitle>
        <DialogContent>
          <TextField fullWidth variant="outlined" value={data[currentProduct][currentField]} onChange={e => changeField(currentProduct, currentField, e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseFieldModal}>Закрыть</Button>
        </DialogActions>
      </Dialog>
      <Dialog
        closeAfterTransition={false}
        open={openImageModal}
        onClose={handleCloseImageModal}
        fullScreen
        PaperProps={{
          style: { backgroundColor: 'transparent', boxShadow: 'none' },
        }}
      >
        <DialogContent
          onClick={handleCloseImageModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            cursor: 'zoom-out',
          }}
        >
          {currentImage && (
            <img
              src={currentImage}
              alt="Full-size"
              loading='lazy'
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                cursor: 'zoom-out',
                objectFit: 'contain',
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// https://www.21vek.by/small_tech_apps/
// https://www.21vek.by/meat_grinder_accessories/
// https://www.21vek.by/toaster_accessories/
// https://www.21vek.by/yogurt_maker_accessories/