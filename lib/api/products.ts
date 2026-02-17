import { API_BASE_URL, getAuthHeaders } from './config';
import { Product } from '../types';

export const getProducts = async (): Promise<Product[]> => {
  const response = await fetch(`${API_BASE_URL}/products`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }

  const data = await response.json();
  return data.data.map((product: any) => ({
    id: product._id,
    name: product.name,
    productCode: product.sku, // Backend uses 'sku'
    barcode: product.barcode,
    categoryId: product.category?._id || product.category,
    categoryName: product.category?.name || '',
    purchasePrice: product.basePrice, // Backend uses 'basePrice'
    sellingPrice: product.sellingPrice,
    gstRate: product.gstRate,
    currentStock: product.stock, 
    reorderLevel: product.minStockLevel, // Backend uses 'minStockLevel'
    supplier: product.supplier?.name || '', 
    status: product.isActive ? 'active' : 'inactive',
  }));
};

export const createProduct = async (productData: any): Promise<Product> => {
  // Map frontend fields to backend fields
  const payload = {
      ...productData,
      sku: productData.productCode,
      basePrice: productData.purchasePrice,
      // Backend expects 'category' as ID, which is what we are likely passing
  }
  
  const response = await fetch(`${API_BASE_URL}/products`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create product');
  }

  const data = await response.json();
  const product = data.data;
  return {
    id: product._id,
    name: product.name,
    productCode: product.sku, // Map backend sku to frontend productCode
    barcode: product.barcode || '', // Backend might not strict require barcode but our type does
    categoryId: product.category, 
    categoryName: '', 
    purchasePrice: product.basePrice, // Map backend basePrice to frontend purchasePrice
    sellingPrice: product.sellingPrice,
    gstRate: product.gstRate,
    currentStock: product.stock,
    reorderLevel: product.minStockLevel, // Backend uses minStockLevel? Model says minStockLevel. Frontend uses reorderLevel.
    supplier: product.supplier,
    status: product.isActive ? 'active' : 'inactive',
  };
};

export const updateProduct = async (id: string, productData: any): Promise<Product> => {
    const payload = {
        ...productData,
        sku: productData.productCode,
        basePrice: productData.purchasePrice,
    }

    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
  
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update product');
    }
  
    const data = await response.json();
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
  const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to delete product');
  }
};
