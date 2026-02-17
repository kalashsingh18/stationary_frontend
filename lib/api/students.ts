import { apiRequest } from './config';
import { Student } from '../types';

export const getStudents = async (): Promise<Student[]> => {
  const data = await apiRequest('/students');

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
  const data = await apiRequest('/students', {
    method: 'POST',
    body: JSON.stringify(studentData),
  });

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
