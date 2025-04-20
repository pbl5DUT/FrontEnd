import { useState, useEffect } from 'react';
import { Employee, employeeService } from '../services/employeeService';

export const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [department, setDepartment] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await employeeService.getEmployees();
      setEmployees(data);
      setError(null);
    } catch (err) {
      setError('Không thể tải danh sách nhân viên');
    } finally {
      setLoading(false);
    }
  };

  const deleteEmployee = async (id: number) => {
    try {
      await employeeService.deleteEmployee(id);
      setEmployees(employees.filter(emp => emp.user_id !== id));
    } catch (err) {
      setError('Không thể xóa nhân viên');
    }
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !department || employee.department === department;
    return matchesSearch && matchesDepartment;
  });

  // Tính toán phân trang
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Tạo mảng số trang để hiển thị
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5; // Số trang hiển thị tối đa
    
    if (totalPages <= maxVisiblePages) {
      // Nếu tổng số trang ít hơn hoặc bằng số trang hiển thị tối đa
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Nếu tổng số trang nhiều hơn số trang hiển thị tối đa
      if (currentPage <= 3) {
        // Nếu đang ở gần đầu
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Nếu đang ở gần cuối
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        // Nếu đang ở giữa
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    return pageNumbers;
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Reset về trang 1 khi thay đổi bộ lọc
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, department]);

  return {
    employees: paginatedEmployees,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    department,
    setDepartment,
    deleteEmployee,
    refreshEmployees: fetchEmployees,
    currentPage,
    setCurrentPage,
    totalPages,
    getPageNumbers,
  };
}; 