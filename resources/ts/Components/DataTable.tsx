import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { ruRU } from '@mui/x-data-grid/locales';
import Paper from '@mui/material/Paper';
import { Card, CardContent, IconButton, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

const columns: GridColDef[] = [
  {
    field: 'categoryName',
    headerName: 'Категория',
    width: 200
  },
  {
    field: 'url',
    headerName: 'Ссылка',
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
    width: 150
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
    headerName: 'Атрибуты',
    description: 'This column has a value getter and is not sortable.',
    width: 200
  }
];

const paginationModel = { page: 0, pageSize: 10 };

export default function DataTable({ data }) {
  return (
    <Card sx={{ maxWidth: 1200, margin: 'auto', mt: 3 }}>
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom>
          {data[0].categoryName}
          <IconButton aria-label="delete" size="small" title='Редактировать категорию'>
            <EditIcon fontSize="inherit" />
          </IconButton>
        </Typography>
        <Paper sx={{ height: 'auto', width: '100%' }}>
          <DataGrid
            rows={data.map((el: any, i: number) => {
              return {
                id: i + 1,
                categoryName: el.categoryName,
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
  );
}

// https://www.21vek.by/small_tech_apps/
// https://www.21vek.by/meat_grinder_accessories/
// https://www.21vek.by/toaster_accessories/