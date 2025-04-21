import React, { useState, useMemo } from 'react';
import styles from './EmployeeList.module.css';
import { useEmployees } from '../../hooks/useEmployees';
import { EmployeeEdit } from '../EmployeeEdit/EmployeeEdit';
import { EmployeeAdd } from '../EmployeeAdd/EmployeeAdd';
import { DeleteConfirmation } from '../DeleteConfirmation/DeleteConfirmation';
import { Employee } from '../../services/employeeService';
import Popover from '@/components/popover/popover';

export const EmployeeList = () => {
  const { 
    employees,
    loading, 
    error,
    deleteEmployee,
    updateEmployee,
    createEmployee,
    currentPage,
    setCurrentPage,
    totalPages,
    getPageNumbers
  } = useEmployees();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Filter employees based on search term and department
  const filteredEmployees = useMemo(() => {
    return employees.filter(employee => {
      const matchesSearch = 
        employee.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.phone.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDepartment = 
        !selectedDepartment || employee.department === selectedDepartment;

      return matchesSearch && matchesDepartment;
    });
  }, [employees, searchTerm, selectedDepartment]);

  const handleAdd = () => {
    setShowAddModal(true);
  };

  const handleAddSave = async (newEmployee: Omit<Employee, 'user_id' | 'created_at'>) => {
    try {
      await createEmployee(newEmployee);
      setShowAddModal(false);
    } catch (error) {
      // Lỗi sẽ được xử lý trong component EmployeeAdd
      throw error;
    }
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowEditModal(true);
  };

  const handleDelete = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedEmployee && selectedEmployee.user_id !== undefined) {
      await deleteEmployee(selectedEmployee.user_id);
      setShowDeleteModal(false);
      setSelectedEmployee(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedEmployee(null);
  };

  const handleSave = async (updatedEmployee: Partial<Employee>) => {
    if (selectedEmployee && selectedEmployee.user_id !== undefined) {
      const dataToUpdate = {
        full_name: updatedEmployee.full_name,
        email: updatedEmployee.email,
        department: updatedEmployee.department,
        role: updatedEmployee.role,
        position: updatedEmployee.position,
        phone: updatedEmployee.phone,
        address: updatedEmployee.address,
        gender: updatedEmployee.gender,
      };
      
      const success = await updateEmployee(selectedEmployee.user_id, dataToUpdate);
      if (success) {
        setShowEditModal(false);
        setSelectedEmployee(null);
      }
    }
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setSelectedEmployee(null);
  };

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>Lỗi: {error}</div>;

  return (
    <div className={styles.employeeList}>
      <div className={styles.header}>
        <h2>Danh sách nhân viên</h2>
        <button className={styles.addButton} onClick={handleAdd}>
          Thêm nhân viên
        </button>
      </div>
      
      <div className={styles.filters}>
        <div className={styles.searchContainer}>
          <input 
            type="text" 
            placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..." 
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className={styles.filterContainer}>
          <select 
            className={styles.filterSelect}
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
          >
            <option value="">Tất cả phòng ban</option>
            <option value="Engineering">Phòng kỹ thuật</option>
            <option value="Marketing">Phòng marketing</option>
            <option value="Sales">Phòng kinh doanh</option>
          </select>
        </div>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Họ tên</th>
            <th>Email</th>
            <th>Phòng ban</th>
            <th>Chức vụ</th>
            <th>Vai trò</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {filteredEmployees.map((employee) => (
            <tr key={employee.user_id}>
              <td>{employee.user_id}</td>
              <td>{employee.full_name}</td>
              <td>{employee.email}</td>
              <td>{employee.department}</td>
              <td>{employee.position}</td>
              <td>{employee.role}</td>
              <td className={styles.actions}>
                <button className={styles.viewButton} title="Xem chi tiết">👁️</button>
                <button 
                  className={styles.editButton} 
                  title="Chỉnh sửa"
                  onClick={() => handleEdit(employee)}
                >
                  ✏️
                </button>
                <button 
                  className={styles.deleteButton} 
                  title="Xóa"
                  onClick={() => handleDelete(employee)}
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageButton}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            ‹
          </button>
          
          {getPageNumbers().map((pageNum: number | string, index) => (
            <button
              key={index}
              className={`${styles.pageButton} ${pageNum === currentPage ? styles.active : ''} ${pageNum === '...' ? styles.dots : ''}`}
              onClick={() => typeof pageNum === 'number' && setCurrentPage(pageNum)}
              disabled={pageNum === '...'}
            >
              {pageNum}
            </button>
          ))}

          <button
            className={styles.pageButton}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            ›
          </button>
        </div>
      )}

      {showAddModal && (
        <Popover onClose={() => setShowAddModal(false)}>
          <EmployeeAdd
            onSave={handleAddSave}
            onClose={() => setShowAddModal(false)}
          />
        </Popover>
      )}

      {showEditModal && selectedEmployee && (
        <Popover onClose={handleCloseModal}>
          <EmployeeEdit
            employee={selectedEmployee}
            onClose={handleCloseModal}
            onSave={handleSave}
          />
        </Popover>
      )}

      {showDeleteModal && selectedEmployee && (
        <Popover onClose={handleCancelDelete}>
          <DeleteConfirmation
            employee={selectedEmployee}
            onConfirm={handleConfirmDelete}
            onCancel={handleCancelDelete}
          />
        </Popover>
      )}
    </div>
  );
}; 