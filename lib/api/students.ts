import { API_BASE_URL, getAuthHeaders } from './config';
import { Student } from '../types';

export const getStudents = async (): Promise<Student[]> => {
  const response = await fetch(`${API_BASE_URL}/students`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch students');
  }

  const data = await response.json();
  return data.data.map((student: any) => ({
    id: student._id,
    rollNumber: student.rollNumber,
    name: student.name,
    class: student.class,
    section: student.section,
    phone: student.contact?.phone,
    schoolId: student.school?._id || student.school, // populate might be used
    schoolName: student.school?.name || '',
  }));
};

export const createStudent = async (studentData: any): Promise<Student> => {
  const response = await fetch(`${API_BASE_URL}/students`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(studentData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create student');
  }

  const data = await response.json();
  const student = data.data;
  return {
    id: student._id,
    rollNumber: student.rollNumber,
    name: student.name,
    class: student.class,
    section: student.section,
    phone: student.contact?.phone,
    schoolId: student.school,
    schoolName: '', // Might need to fetch school name separately or rely on returned data if populated
  };
};
