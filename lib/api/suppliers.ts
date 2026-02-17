import { API_BASE_URL, getAuthHeaders } from './config';
import { Supplier } from '../types';

export const getSuppliers = async (): Promise<Supplier[]> => {
  const response = await fetch(`${API_BASE_URL}/suppliers`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch suppliers');
  }

  const data = await response.json();
  return data.data.map((supplier: any) => ({
    id: supplier._id,
    name: supplier.name,
    code: supplier.code,
    phone: supplier.contact?.phone || '',
    gstin: supplier.gstin,
    paymentTerms: supplier.paymentTerms,
    address: supplier.address ? `${supplier.address.street || ''} ${supplier.address.city || ''}` : '', // Flatten address
    // Add other fields if necessary
  }));
};

export const createSupplier = async (supplierData: any): Promise<Supplier> => {
  const response = await fetch(`${API_BASE_URL}/suppliers`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(supplierData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create supplier');
  }

  const data = await response.json();
  const supplier = data.data;
  return {
    id: supplier._id,
    name: supplier.name,
    code: supplier.code,
    phone: supplier.contact?.phone || '',
    gstin: supplier.gstin,
    paymentTerms: supplier.paymentTerms,
    address: supplier.address ? `${supplier.address.street || ''} ${supplier.address.city || ''}` : '',
  };
};

export const updateSupplier = async (id: string, supplierData: any): Promise<Supplier> => {
    const response = await fetch(`${API_BASE_URL}/suppliers/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(supplierData),
    });
  
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update supplier');
    }
  
    const data = await response.json();
    const supplier = data.data;
    return {
      id: supplier._id,
      name: supplier.name,
      code: supplier.code,
      phone: supplier.contact?.phone || '',
      gstin: supplier.gstin,
      paymentTerms: supplier.paymentTerms,
      address: supplier.address ? `${supplier.address.street || ''} ${supplier.address.city || ''}` : '',
    };
  };

export const deleteSupplier = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/suppliers/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to delete supplier');
  }
};
