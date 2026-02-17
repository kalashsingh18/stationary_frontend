import { apiRequest } from './config';
import { Product } from '../types';

export const getProducts = async (): Promise<Product[]> => {
  const data = await apiRequest('/products');
  return data.data.map((product: any) => ({
    id: product._id,
    name: product.name,
    productCode: product.sku,
    barcode: product.barcode,
    categoryId: product.category?._id || product.category,
    categoryName: product.category?.name || '',
    purchasePrice: product.basePrice,
    sellingPrice: product.sellingPrice,
    gstRate: product.gstRate,
    currentStock: product.stock, 
    reorderLevel: product.minStockLevel,
    supplier: product.supplier?.name || '', 
    status: product.isActive ? 'active' : 'inactive',
  }));
};

export const createProduct = async (productData: any): Promise<Product> => {
  const payload = {
      ...productData,
      sku: productData.productCode,
      basePrice: productData.purchasePrice,
  };
  
  const data = await apiRequest('/products', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  const product = data.data;
  return {
    id: product._id,
    name: product.name,
    productCode: product.sku,
    barcode: product.barcode || '',
    categoryId: product.category, 
    categoryName: '', 
    purchasePrice: product.basePrice,
    sellingPrice: product.sellingPrice,
    gstRate: product.gstRate,
    currentStock: product.stock,
    reorderLevel: product.minStockLevel,
    supplier: product.supplier,
    status: product.isActive ? 'active' : 'inactive',
  };
};

export const updateProduct = async (id: string, productData: any): Promise<Product> => {
    const payload = {
        ...productData,
        sku: productData.productCode,
        basePrice: productData.purchasePrice,
    };

    const data = await apiRequest(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  
    const product = data.data;
    return {
      id: product._id,
      name: product.name,
      productCode: product.sku,
      barcode: product.barcode,
      categoryId: product.category,
      categoryName: '',
      purchasePrice: product.basePrice,
      sellingPrice: product.sellingPrice,
      gstRate: product.gstRate,
      currentStock: product.stock,
      reorderLevel: product.minStockLevel,
      supplier: product.supplier,
      status: product.isActive ? 'active' : 'inactive',
    };
  };

export const deleteProduct = async (id: string): Promise<void> => {
  await apiRequest(`/products/${id}`, {
    method: 'DELETE',
  });
};
