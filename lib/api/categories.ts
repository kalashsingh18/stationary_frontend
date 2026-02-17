import { apiRequest } from './config';
import { Category } from '../types';

export const getCategories = async (): Promise<Category[]> => {
  const data = await apiRequest('/categories');
  return data.data.map((category: any) => ({
    id: category._id,
    name: category.name,
    description: category.description,
    productCount: category.productCount || 0,
  }));
};

export const createCategory = async (categoryData: any): Promise<Category> => {
  const data = await apiRequest('/categories', {
    method: 'POST',
    body: JSON.stringify(categoryData),
  });
  const category = data.data;
  return {
    id: category._id,
    name: category.name,
    description: category.description,
    productCount: category.productCount || 0,
  };
};

export const updateCategory = async (id: string, categoryData: any): Promise<Category> => {
  const data = await apiRequest(`/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(categoryData),
  });
  const category = data.data;
  return {
    id: category._id,
    name: category.name,
    description: category.description,
    productCount: category.productCount || 0,
  };
};

export const deleteCategory = async (id: string): Promise<void> => {
  await apiRequest(`/categories/${id}`, {
    method: 'DELETE',
  });
};
