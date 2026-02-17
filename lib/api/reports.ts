import { apiRequest } from './config';

export const getSalesReports = async (period: string) => {
  const data = await apiRequest(`/reports/sales?period=${period}`);
  return data.data;
};

export const getSchoolPerformance = async () => {
    const data = await apiRequest('/reports/school-performance');
    return data.data;
};

export const getInventoryValuation = async () => {
    const data = await apiRequest('/reports/inventory-valuation');
    return data.data;
};
