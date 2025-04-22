import { useState, useEffect } from 'react';
import { Employee, employeeService } from '../services/employeeService';

export const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [department, setDepartment] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchEmployees();
  }, [currentPage, searchTerm, department]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await employeeService.getEmployees();
      setEmployees(data);
      // Tạm thời set totalPages là 1, sau này có thể tính dựa trên số lượng nhân viên
      setTotalPages(1);
      setError(null);
    } catch (err) {
      setError('Có lỗi xảy ra khi tải danh sách nhân viên');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createEmployee = async (employee: Omit<Employee, 'user_id' | 'created_at'>): Promise<Employee> => {
    try {
      const newEmployee = await employeeService.createEmployee(employee);
      await fetchEmployees(); // Tải lại danh sách sau khi thêm
      return newEmployee;
    } catch (error) {
      console.error('Error creating employee:', error);
      throw error;
    }
  };

  const deleteEmployee = async (id: number) => {
    try {
      await employeeService.deleteEmployee(id);
      await fetchEmployees(); // Tải lại danh sách sau khi xóa
    } catch (err) {
      setError('Có lỗi xảy ra khi xóa nhân viên');
      console.error(err);
    }
  };

  const updateEmployee = async (id: number, data: Partial<Employee>) => {
    try {
      await employeeService.updateEmployee(id, data);
      await fetchEmployees(); // Tải lại danh sách sau khi cập nhật
      return true;
    } catch (err) {
      setError('Có lỗi xảy ra khi cập nhật nhân viên');
      console.error(err);
      return false;
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  return {
    employees,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    department,
    setDepartment,
    createEmployee,
    deleteEmployee,
    updateEmployee,
    currentPage,
    setCurrentPage,
    totalPages,
    getPageNumbers,
  };
}; 