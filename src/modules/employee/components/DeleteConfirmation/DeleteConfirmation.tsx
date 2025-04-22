import React from 'react';
import styles from './DeleteConfirmation.module.css';
import { Employee } from '../../services/employeeService';

interface DeleteConfirmationProps {
  employee: Employee;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({
  employee,
  onConfirm,
  onCancel,
}) => {
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Xác nhận xóa</h3>
      <p className={styles.message}>
        Bạn có chắc chắn muốn xóa nhân viên <strong>{employee.full_name}</strong>?
      </p>
      <p className={styles.warning}>
        Hành động này không thể hoàn tác!
      </p>
      <div className={styles.actions}>
        <button 
          className={styles.cancelButton}
          onClick={onCancel}
        >
          Hủy
        </button>
        <button 
          className={styles.deleteButton}
          onClick={onConfirm}
        >
          Xóa
        </button>
      </div>
    </div>
  );
};
