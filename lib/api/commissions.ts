import { API_BASE_URL, getAuthHeaders } from './config';
import { Commission } from '../types';

export const getCommissions = async (): Promise<Commission[]> => {
  const response = await fetch(`${API_BASE_URL}/commissions`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch commissions');
  }

  const data = await response.json();
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
    // This roughly matches specific update logic or could be a specific endpoint
    const response = await fetch(`${API_BASE_URL}/commissions/${id}/settle`, { // Assuming specific route or PUT
        method: 'PUT', // or POST
        headers: getAuthHeaders(),
        body: JSON.stringify(settleData)
    });

    if (!response.ok) {
         // Fallback to standard PUT if specific route doesn't exist, though typically specialized actions have their own routes or use generic update
        const updateResponse = await fetch(`${API_BASE_URL}/commissions/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ ...settleData, status: 'settled' })
        });
        
        if (!updateResponse.ok) {
            throw new Error('Failed to settle commission');
        }
         const data = await updateResponse.json();
         return data.data;
    }

    const data = await response.json();
    return data.data;
};
