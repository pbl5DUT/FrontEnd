import React, { useState } from 'react';
import styles from './EmployeeAdd.module.css';
import { Employee } from '../../services/employeeService';

interface EmployeeAddProps {
  onSave: (employee: Omit<Employee, 'user_id' | 'created_at'>) => Promise<void>;
  onClose: () => void;
}

interface ValidationErrors {
  [key: string]: string[] | ValidationErrors;
}

interface FormData {
  full_name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  department: string;
  position: string;
  role: string;
  gender: string;
  birth_date: string;
  province: string;
  district: string;
  avatar: File | null;
  enterprise: {
    Name: string;
    Email: string;
    PhoneNumber: string;
    Address: string;
    Industry: string;
  };
}

export const EmployeeAdd: React.FC<EmployeeAddProps> = ({ onSave, onClose }) => {
  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    department: '',
    position: '',
    role: '',
    gender: '',
    birth_date: '',
    province: '',
    district: '',
    avatar: null,
    enterprise: {
      Name: '',
      Email: '',
      PhoneNumber: '',
      Address: '',
      Industry: ''
    }
  });

  const [errors, setErrors] = useState<ValidationErrors>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('enterprise.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        enterprise: {
          ...prev.enterprise,
          [field]: value
        }
      }));

      setErrors(prev => ({
        ...prev,
        enterprise: {
          ...((prev.enterprise || {}) as ValidationErrors),
          [field]: []
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));

      setErrors(prev => ({
        ...prev,
        [name]: []
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSave(formData as Omit<Employee, 'user_id' | 'created_at'>);
      onClose();
    } catch (error) {
      if (error && typeof error === 'object') {
        setErrors(error as ValidationErrors);
      }
    }
  };

  const getFieldError = (fieldName: string): string | undefined => {
    const fieldError = fieldName.split('.').reduce((obj: any, key) => obj?.[key], errors);
    return Array.isArray(fieldError) ? fieldError[0] : undefined;
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Thêm nhân viên mới</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formSection}>
          <h3>Thông tin cá nhân</h3>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Họ và tên *</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className={getFieldError('full_name') ? styles.inputError : ''}
              />
              {getFieldError('full_name') && (
                <span className={styles.errorMessage}>{getFieldError('full_name')}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={getFieldError('email') ? styles.inputError : ''}
              />
              {getFieldError('email') && (
                <span className={styles.errorMessage}>{getFieldError('email')}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label>Mật khẩu *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={getFieldError('password') ? styles.inputError : ''}
              />
              {getFieldError('password') && (
                <span className={styles.errorMessage}>{getFieldError('password')}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label>Vai trò *</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={getFieldError('role') ? styles.inputError : ''}
              >
                <option value="">Chọn vai trò</option>
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Staff">Staff</option>
              </select>
              {getFieldError('role') && (
                <span className={styles.errorMessage}>{getFieldError('role')}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label>Phòng ban *</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className={getFieldError('department') ? styles.inputError : ''}
              >
                <option value="">Chọn phòng ban</option>
                <option value="Engineering">Phòng kỹ thuật</option>
                <option value="Marketing">Phòng marketing</option>
                <option value="Sales">Phòng kinh doanh</option>
              </select>
              {getFieldError('department') && (
                <span className={styles.errorMessage}>{getFieldError('department')}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label>Chức vụ *</label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                className={getFieldError('position') ? styles.inputError : ''}
              />
              {getFieldError('position') && (
                <span className={styles.errorMessage}>{getFieldError('position')}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label>Giới tính</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">Chọn giới tính</option>
                <option value="Male">Nam</option>
                <option value="Female">Nữ</option>
                <option value="Other">Khác</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Ngày sinh *</label>
              <input
                type="date"
                name="birth_date"
                value={formData.birth_date}
                onChange={handleChange}
                className={getFieldError('birth_date') ? styles.inputError : ''}
              />
              {getFieldError('birth_date') && (
                <span className={styles.errorMessage}>{getFieldError('birth_date')}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label>Số điện thoại</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className={styles.formSection}>
          <h3>Thông tin doanh nghiệp</h3>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Tên doanh nghiệp *</label>
              <input
                type="text"
                name="enterprise.Name"
                value={formData.enterprise.Name}
                onChange={handleChange}
                className={getFieldError('enterprise.Name') ? styles.inputError : ''}
              />
              {getFieldError('enterprise.Name') && (
                <span className={styles.errorMessage}>{getFieldError('enterprise.Name')}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label>Địa chỉ doanh nghiệp *</label>
              <input
                type="text"
                name="enterprise.Address"
                value={formData.enterprise.Address}
                onChange={handleChange}
                className={getFieldError('enterprise.Address') ? styles.inputError : ''}
              />
              {getFieldError('enterprise.Address') && (
                <span className={styles.errorMessage}>{getFieldError('enterprise.Address')}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label>Số điện thoại doanh nghiệp *</label>
              <input
                type="tel"
                name="enterprise.PhoneNumber"
                value={formData.enterprise.PhoneNumber}
                onChange={handleChange}
                className={getFieldError('enterprise.PhoneNumber') ? styles.inputError : ''}
              />
              {getFieldError('enterprise.PhoneNumber') && (
                <span className={styles.errorMessage}>{getFieldError('enterprise.PhoneNumber')}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label>Email doanh nghiệp *</label>
              <input
                type="email"
                name="enterprise.Email"
                value={formData.enterprise.Email}
                onChange={handleChange}
                className={getFieldError('enterprise.Email') ? styles.inputError : ''}
              />
              {getFieldError('enterprise.Email') && (
                <span className={styles.errorMessage}>{getFieldError('enterprise.Email')}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label>Ngành nghề *</label>
              <input
                type="text"
                name="enterprise.Industry"
                value={formData.enterprise.Industry}
                onChange={handleChange}
                className={getFieldError('enterprise.Industry') ? styles.inputError : ''}
              />
              {getFieldError('enterprise.Industry') && (
                <span className={styles.errorMessage}>{getFieldError('enterprise.Industry')}</span>
              )}
            </div>
          </div>
        </div>

        <div className={styles.formSection}>
          <h3>Địa chỉ</h3>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Tỉnh/Thành phố</label>
              <input
                type="text"
                name="province"
                value={formData.province}
                onChange={handleChange}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Quận/Huyện</label>
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleChange}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Địa chỉ chi tiết</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <button type="button" onClick={onClose} className={styles.cancelButton}>
            Hủy
          </button>
          <button type="submit" className={styles.submitButton}>
            Thêm nhân viên
          </button>
        </div>
      </form>
    </div>
  );
}; 