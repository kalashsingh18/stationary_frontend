import { apiRequest } from './config';
import { PurchaseOrder } from '../types';

export const getPurchases = async (): Promise<PurchaseOrder[]> => {
  const data = await apiRequest('/purchases');
  return data.data.map((purchase: any) => ({
    id: purchase._id,
    purchaseNumber: purchase.purchaseNumber,
    supplierId: purchase.supplier?._id || purchase.supplier,
    supplierName: purchase.supplier?.name || '',
    date: new Date(purchase.createdAt).toISOString().split('T')[0],
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
  const data = await apiRequest('/purchases', {
    method: 'POST',
    body: JSON.stringify(purchaseData),
  });

  const purchase = data.data;
     return {
    id: purchase._id,
    purchaseNumber: purchase.purchaseNumber,
    supplierId: purchase.supplier,
    supplierName: '',
    date: new Date(purchase.createdAt).toISOString().split('T')[0],
    items: purchase.items,
    totalAmount: purchase.totalAmount,
    paymentStatus: purchase.paymentStatus,
  };
};

export const updatePurchaseStatus = async (id: string, status: string): Promise<PurchaseOrder> => {
    const data = await apiRequest(`/purchases/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ paymentStatus: status })
    });

    return data.data;
};
