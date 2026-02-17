import { apiRequest } from './config';
import { Invoice } from '../types';

export const getInvoices = async (): Promise<Invoice[]> => {
  const data = await apiRequest('/invoices');
  return data.data.map((invoice: any) => ({
    id: invoice._id,
    invoiceNumber: invoice.invoiceNumber,
    date: new Date(invoice.createdAt).toISOString().split('T')[0],
    studentId: invoice.student?._id || invoice.student,
    studentName: invoice.student?.name || '',
    rollNumber: invoice.student?.rollNumber || '',
    schoolId: invoice.school?._id || invoice.school,
    schoolName: invoice.school?.name || '',
    items: invoice.items.map((item: any) => ({
        productId: item.product?._id || item.product,
        productName: item.product?.name || '',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        gstRate: item.gstRate,
        gstAmount: item.gstAmount,
        total: item.total
    })),
    subtotal: invoice.subtotal,
    discount: invoice.discount,
    gstAmount: invoice.gstAmount,
    totalAmount: invoice.totalAmount,
    commissionAmount: invoice.commissionAmount
  }));
};

export const createInvoice = async (invoiceData: any): Promise<Invoice> => {
  const data = await apiRequest('/invoices', {
    method: 'POST',
    body: JSON.stringify(invoiceData),
  });

  const invoice = data.data;

  // Ideally we return the mapped object, but here simplified for creation usage
  return {
    id: invoice._id,
    invoiceNumber: invoice.invoiceNumber,
    date: new Date(invoice.createdAt).toISOString().split('T')[0],
    studentId: invoice.student,
    studentName: '', // populate needed
    rollNumber: '',
    schoolId: invoice.school,
    schoolName: '',
    items: invoice.items,
    subtotal: invoice.subtotal,
    discount: invoice.discount,
    gstAmount: invoice.gstAmount,
    totalAmount: invoice.totalAmount,
    commissionAmount: invoice.commissionAmount
  };
};
