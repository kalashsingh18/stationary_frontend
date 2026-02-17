import { API_BASE_URL, getAuthHeaders } from './config';
import { Category } from '../types';

export const getCategories = async (): Promise<Category[]> => {
  const response = await fetch(`${API_BASE_URL}/categories`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }

  const data = await response.json();
  return data.data.map((category: any) => ({
    id: category._id,
    name: category.name,
    description: category.description,
    productCount: category.productCount || 0, // Backend might calculate this or we might need separate logic
  }));
};
export const createCategory = async (categoryData: any): Promise<Category> => {
  const response = await fetch(`${API_BASE_URL}/categories`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(categoryData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create category');
  }

  const data = await response.json();
  const category = data.data;
  return {
    id: category._id,
    name: category.name,
    description: category.description,
    productCount: category.productCount || 0,
  };
};

export const updateCategory = async (id: string, categoryData: any): Promise<Category> => {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(categoryData),
    });
  
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update category');
    }
  
    const data = await response.json();
    const category = data.data;
    return {
      id: category._id,
      name: category.name,
      description: category.description,
      productCount: category.productCount || 0,
    };
  };

export const deleteCategory = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to delete category');
  }
};
