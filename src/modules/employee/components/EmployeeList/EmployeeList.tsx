import React, { useState, useCallback } from 'react';
import styles from './EmployeeList.module.css';
import { useEmployees } from '../../hooks/useEmployees';
import { useRouter } from 'next/router';
import CreateEmployee from '../EmployeeCreate/CreateEmployee';
import { employeeService } from '../../services/employeeService';

export const EmployeeList = () => {
  const {
    employees = [],
    loading,
    error,
    searchTerm,
    setSearchTerm,
    department,
    setDepartment,
    deleteEmployee,
    currentPage,
    setCurrentPage,
    totalPages,
    getPageNumbers,
    refreshEmployees,  // Hàm để tải lại danh sách nhân viên
  } = useEmployees();

  const router = useRouter(); // Initialize router

  // State để kiểm soát form tạo nhân viên
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleAddEmployeeClick = useCallback(() => {
    setShowCreateForm(true);
  }, []);

 const handleDeleteEmployee = useCallback(
  async (employeeId: number) => {
    console.log("Đang xoá nhân viên với ID:", employeeId);
    if (window.confirm('Bạn có chắc muốn xóa nhân viên này?')) {
      try {
        // Gọi service xóa nhân viên và chờ đợi kết quả
        await employeeService.deleteEmployee(employeeId);

        // Hiển thị thông báo thành công
        alert('Xóa nhân viên thành công');

        // Cập nhật lại danh sách nhân viên sau khi xóa
        refreshEmployees();
      } catch (err) {
        // Xử lý lỗi nếu có
        alert('Lỗi khi xóa nhân viên');
        console.error(err);
      }
    }
  },
  [refreshEmployees]
);


  // Callback khi tạo nhân viên thành công, gọi lại hàm fetchEmployees để cập nhật danh sách
  const handleCreateEmployeeSuccess = () => {
    setShowCreateForm(false); // Đóng modal khi tạo nhân viên thành công
    refreshEmployees(); // Gọi lại hàm để tải lại danh sách nhân viên
  };

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>Lỗi: {error}</div>;

  return (
    <div className={styles.container}>
      <div className={showCreateForm ? styles.blurredBackground : ''}>
        <div className={styles.header}>
          <h2>Danh sách nhân viên</h2>
          {/* Nút "Thêm nhân viên" */}
          <button onClick={handleAddEmployeeClick} className={styles.addButton}>
            Thêm nhân viên
          </button>
        </div>

        {/* Bảng nhân viên */}
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
            {employees.map((employee) => (
              <tr key={employee.user_id}>
                <td>{employee.user_id}</td>
                <td>{employee.full_name}</td>
                <td>{employee.email}</td>
                <td>{employee.department}</td>
                <td>{employee.position}</td>
                <td>{employee.role}</td>
                <td className={styles.actions}>
                  <button className={styles.viewButton} title="Xem chi tiết">
                    <img
                      src="/assets/icons/list.png"
                      alt="Xem chi tiết"
                      className={styles.icon}
                    />
                  </button>

                  <button
                    className={styles.deleteButton}
                    title="Xóa"
                    onClick={() => handleDeleteEmployee(employee.user_id)} // Chuyển employee.user_id thành string

                  >
                    <img
                      src="/assets/icons/delete.png"
                      alt="Xóa"
                      className={styles.icon}
                    />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              className={styles.pageButton}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              ‹
            </button>

            {getPageNumbers().map((pageNum, index) => (
              <button
                key={index}
                className={`${styles.pageButton} ${
                  pageNum === currentPage ? styles.active : ''
                } ${pageNum === '...' ? styles.dots : ''}`}
                onClick={() =>
                  typeof pageNum === 'number' && setCurrentPage(pageNum)
                }
                disabled={pageNum === '...'}
              >
                {pageNum}
              </button>
            ))}

            <button
              className={styles.pageButton}
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              ›
            </button>
          </div>
        )}
      </div>

      {/* Modal form khi showCreateForm là true */}
      {showCreateForm && (
        <div className={styles.modalOverlay}>
          <CreateEmployee onClose={() => setShowCreateForm(false)} onCreateSuccess={handleCreateEmployeeSuccess} />
        </div>
      )}
    </div>
  );
};
