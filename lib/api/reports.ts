import { API_BASE_URL, getAuthHeaders } from './config';

export const getSalesReports = async (period: string) => {
  const response = await fetch(`${API_BASE_URL}/reports/sales?period=${period}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch sales reports');
  }

  const data = await response.json();
  return data.data;
};

export const getSchoolPerformance = async () => {
    const response = await fetch(`${API_BASE_URL}/reports/school-performance`, {
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        throw new Error('Failed to fetch school performance');
    }

    const data = await response.json();
    return data.data;
};

export const getInventoryValuation = async () => {
    const response = await fetch(`${API_BASE_URL}/reports/inventory-valuation`, {
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        throw new Error('Failed to fetch inventory valuation');
    }

    const data = await response.json();
    return data.data;
};
