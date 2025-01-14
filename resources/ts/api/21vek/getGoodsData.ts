import axios from 'axios';

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
          categoryData.categoryId = resp.data.categoryId;
          categoryData.categoryName = resp.data.categoryName;
        }

        const products = data.map((product: any) => ({
          id: product.code,
          alias: getLastPartOfPath(product.link),
        }));

        categoryData.products.push(...products);
      } catch (error) {
        console.error(`Error fetching data for link: ${link}, page: ${currentPage}`, error);
        break;
      }

      currentPage++;
    } while (currentPage <= lastPage);

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
        console.error(`Error fetching product data for alias: ${product.alias}`, error);
      }
    }

    parsedProducts.push(parsedCategory);
  }

  return parsedProducts;
};