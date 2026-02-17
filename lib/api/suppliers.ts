import { apiRequest } from './config';
import { Supplier } from '../types';

export const getSuppliers = async (): Promise<Supplier[]> => {
  const data = await apiRequest('/suppliers');
  return data.data.map((supplier: any) => ({
    id: supplier._id,
    name: supplier.name,
    code: supplier.code,
    contact: {
      phone: supplier.contact?.phone || '',
      email: supplier.contact?.email || '',
      contactPerson: supplier.contact?.contactPerson || '',
    },
    gstin: supplier.gstin,
    paymentTerms: supplier.paymentTerms,
    address: supplier.address ? `${supplier.address.street || ''} ${supplier.address.city || ''}` : '',
  }));
};

export const createSupplier = async (supplierData: any): Promise<Supplier> => {
  const data = await apiRequest('/suppliers', {
    method: 'POST',
    body: JSON.stringify(supplierData),
  });

  const supplier = data.data;
  return {
    id: supplier._id,
    name: supplier.name,
    code: supplier.code,
    contact: {
      phone: supplier.contact?.phone || '',
      email: supplier.contact?.email || '',
      contactPerson: supplier.contact?.contactPerson || '',
    },
    gstin: supplier.gstin,
    paymentTerms: supplier.paymentTerms,
    address: supplier.address ? `${supplier.address.street || ''} ${supplier.address.city || ''}` : '',
  };
};

export const updateSupplier = async (id: string, supplierData: any): Promise<Supplier> => {
    const data = await apiRequest(`/suppliers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(supplierData),
    });
  
    const supplier = data.data;
    return {
      id: supplier._id,
      name: supplier.name,
      code: supplier.code,
      contact: {
        phone: supplier.contact?.phone || '',
        email: supplier.contact?.email || '',
        contactPerson: supplier.contact?.contactPerson || '',
      },
      gstin: supplier.gstin,
      paymentTerms: supplier.paymentTerms,
      address: supplier.address ? `${supplier.address.street || ''} ${supplier.address.city || ''}` : '',
    };
  };

export const deleteSupplier = async (id: string): Promise<void> => {
  await apiRequest(`/suppliers/${id}`, {
    method: 'DELETE',
  });
};
