import { apiRequest } from './config';
import { School } from '../types';

export const getSchools = async (): Promise<School[]> => {
  const data = await apiRequest('/schools');
  // Transform backend _id to frontend id if necessary, or ensure types match
  return data.data.map((school: any) => ({
    id: school._id, // Map _id to id
    name: school.name,
    contactPerson: school.contact?.email || '', // Backend structure might differ slightly, adjusting mapping
    phone: school.contact?.phone || '',
    email: school.contact?.email || '',
    address: school.address ? `${school.address.city}, ${school.address.state}` : '',
    commissionPercentage: school.commissionRate,
    status: school.isActive ? 'active' : 'inactive',
    totalStudents: 0, // details might come from separate stats or need aggregation
    totalSales: 0,
    commissionEarned: 0,
    ...school // spread other props just in case
  }));
};

export const createSchool = async (schoolData: any): Promise<School> => {
  const data = await apiRequest('/schools', {
    method: 'POST',
    body: JSON.stringify(schoolData),
  });
  const school = data.data;
  return {
      id: school._id,
      name: school.name,
      contactPerson: school.contact?.email || '',
      phone: school.contact?.phone || '',
      email: school.contact?.email || '',
      address: school.address ? `${school.address.city}, ${school.address.state}` : '',
      commissionPercentage: school.commissionRate,
      status: school.isActive ? 'active' : 'inactive',
      totalStudents: 0,
      totalSales: 0,
      commissionEarned: 0,
  };
};
