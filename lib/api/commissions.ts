import { apiRequest } from './config';
import { Commission } from '../types';

export const getCommissions = async (): Promise<Commission[]> => {
  const data = await apiRequest('/commissions');
  return data.data.map((commission: any) => ({
    id: commission._id,
    schoolId: commission.school?._id || commission.school,
    schoolName: commission.school?.name || '',
    month: commission.month,
    totalSales: commission.totalSales,
    baseAmount: commission.baseAmount,
    commissionRate: commission.commissionRate,
    commissionAmount: commission.commissionAmount,
    status: commission.status,
    settledDate: commission.settledDate ? new Date(commission.settledDate).toISOString().split('T')[0] : undefined,
    reference: commission.reference
  }));
};

export const settleCommission = async (id: string, settleData: any): Promise<Commission> => {
  try {
    const data = await apiRequest(`/commissions/${id}/settle`, {
      method: 'PUT',
      body: JSON.stringify(settleData)
    });
    return data.data;
  } catch (error) {
    // Fallback to standard PUT if specific route doesn't exist
    const data = await apiRequest(`/commissions/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...settleData, status: 'settled' })
    });
    return data.data;
  }
};
