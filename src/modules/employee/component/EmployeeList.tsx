'use client';

import { useState } from 'react';
import styles from './EmployeeList.module.css';
import { Employee } from '../types/employee.types';

interface EmployeeListProps {
  employees: Employee[];
  onView: (employee: Employee) => void;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}

export const EmployeeList = ({ employees, onView, onEdit, onDelete }: EmployeeListProps) => {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>#</th>
          <th>Mã nhân viên</th>
          <th>Họ và tên</th>
          <th>Email</th>
          <th>Phòng ban</th>
          <th>Vai trò</th>
          <th>Hành động</th>
        </tr>
      </thead>
      <tbody>
        {employees.map((employee, index) => (
          <tr key={employee.user_id}>
            <td>{index + 1}</td>
            <td>{employee.user_id}</td>
            <td>{employee.full_name}</td>
            <td>{employee.email}</td>
            <td>{employee.department}</td>
            <td>{employee.role}</td>
            <td>
              <button className={styles.btnView} onClick={() => onView(employee)}>👁️</button>
              <button className={styles.btnEdit} onClick={() => onEdit(employee)}>✏️</button>
              <button className={styles.btnDelete} onClick={() => onDelete(employee)}>🗑️</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

