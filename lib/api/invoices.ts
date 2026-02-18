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
        productName: item.productName || '',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        gstRate: item.gstRate,
        gstAmount: item.gstAmount,
        total: item.totalPrice
    })),
    subtotal: invoice.subtotal,
    discount: invoice.discount,
    gstAmount: invoice.gstAmount,
    totalAmount: invoice.totalAmount,
    commissionAmount: invoice.commissionAmount,
    paymentStatus: invoice.paymentStatus,
    paymentMethod: invoice.paymentMethod
  }));
};

export const createInvoice = async (invoiceData: any): Promise<Invoice> => {
  const data = await apiRequest('/invoices', {
    method: 'POST',
    body: JSON.stringify(invoiceData),
  });

  const invoice = data.data;

  return {
    id: invoice._id,
    invoiceNumber: invoice.invoiceNumber,
    date: new Date(invoice.createdAt).toISOString().split('T')[0],
    studentId: invoice.student,
    studentName: '', 
    rollNumber: '',
    schoolId: invoice.school,
    schoolName: '',
    items: invoice.items.map((item: any) => ({
        productId: item.product?._id || item.product,
        productName: item.productName || '',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        gstRate: item.gstRate,
        gstAmount: item.gstAmount,
        total: item.totalPrice
    })),
    subtotal: invoice.subtotal,
    discount: invoice.discount,
    gstAmount: invoice.gstAmount,
    totalAmount: invoice.totalAmount,
    commissionAmount: invoice.commissionAmount,
    paymentStatus: invoice.paymentStatus,
    paymentMethod: invoice.paymentMethod
  };
};

export async function updateInvoice(id: string, data: any): Promise<Invoice> {
    const response = await apiRequest(`/invoices/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
    const invoice = response.data;
    return {
        id: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        date: new Date(invoice.invoiceDate).toISOString().split('T')[0],
        studentId: invoice.student?._id || invoice.student,
        studentName: invoice.student?.name || '',
        rollNumber: invoice.student?.rollNumber || '',
        schoolId: invoice.school?._id || invoice.school,
        schoolName: invoice.school?.name || '',
        items: invoice.items.map((item: any) => ({
            productId: item.product?._id || item.product,
            productName: item.productName || '',
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            gstRate: item.gstRate,
            gstAmount: item.gstAmount,
            total: item.totalPrice
        })),
        subtotal: invoice.subtotal,
        discount: invoice.discount || 0,
        gstAmount: invoice.gstAmount,
        totalAmount: invoice.totalAmount,
        commissionAmount: invoice.commissionAmount,
        paymentStatus: invoice.paymentStatus,
        paymentMethod: invoice.paymentMethod
    };
}
