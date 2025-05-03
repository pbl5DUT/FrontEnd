import React from 'react';
import styles from './EmployeeList.module.css';
import { useEmployees } from '../../hooks/useEmployees';

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
  } = useEmployees();

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>Lỗi: {error}</div>;

  return (
    <div className={styles.employeeList}>
      <div className={styles.header}>
        <h2>Danh sách nhân viên</h2>
        <button className={styles.addButton}>Thêm nhân viên</button>
      </div>
      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Tìm kiếm nhân viên..."
          className={styles.searchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className={styles.filterSelect}
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        >
          <option value="">Tất cả phòng ban</option>
          <option value="Engineering">Phòng kỹ thuật</option>
          <option value="Marketing">Phòng marketing</option>
          <option value="Sales">Phòng kinh doanh</option>
        </select>
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
                  onClick={() => {
                    if (window.confirm('Bạn có chắc muốn xóa nhân viên này?')) {
                      deleteEmployee(employee.user_id);
                    }
                  }}
                >
                  <img
                    src="/assets/icons/delete.png"
                    alt="Xem chi tiết"
                    className={styles.icon}
                  />
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
  );
};
