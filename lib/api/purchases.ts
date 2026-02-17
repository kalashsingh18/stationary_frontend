import { API_BASE_URL, getAuthHeaders } from './config';
import { PurchaseOrder } from '../types';

export const getPurchases = async (): Promise<PurchaseOrder[]> => {
  const response = await fetch(`${API_BASE_URL}/purchases`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch purchases');
  }

  const data = await response.json();
  return data.data.map((purchase: any) => ({
    id: purchase._id,
    purchaseNumber: purchase.purchaseNumber,
    supplierId: purchase.supplier?._id || purchase.supplier,
    supplierName: purchase.supplier?.name || '',
    date: new Date(purchase.createdAt).toISOString().split('T')[0], // Using createdAt as date
    items: purchase.items.map((item: any) => ({
        productId: item.product?._id || item.product,
        productName: item.product?.name || '',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total
    })),
    totalAmount: purchase.totalAmount,
    paymentStatus: purchase.paymentStatus,
  }));
};

export const createPurchase = async (purchaseData: any): Promise<PurchaseOrder> => {
  const response = await fetch(`${API_BASE_URL}/purchases`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(purchaseData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create purchase order');
  }

  const data = await response.json();
  const purchase = data.data;
     return {
    id: purchase._id,
    purchaseNumber: purchase.purchaseNumber,
    supplierId: purchase.supplier, // Might be ID
    supplierName: '', // Need to populate
    date: new Date(purchase.createdAt).toISOString().split('T')[0],
    items: purchase.items,
    totalAmount: purchase.totalAmount,
    paymentStatus: purchase.paymentStatus,
  };
};

export const updatePurchaseStatus = async (id: string, status: string): Promise<PurchaseOrder> => {
    // This endpoint might need to be created or we usage generic update
    const response = await fetch(`${API_BASE_URL}/purchases/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ paymentStatus: status })
    });

    if (!response.ok) {
        throw new Error('Failed to update purchase status');
    }

    const data = await response.json();
    return data.data; // Type mapping might be needed similar to getPurchases
}
