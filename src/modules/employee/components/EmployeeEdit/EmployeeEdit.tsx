import React, { useState, useEffect } from 'react';
import styles from './EmployeeEdit.module.css';
import { Employee } from '../../services/employeeService';

interface EmployeeEditProps {
  employee: Employee;
  onClose: () => void;
  onSave: (updatedEmployee: Partial<Employee>) => void;
}

export const EmployeeEdit: React.FC<EmployeeEditProps> = ({ employee, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Employee>>({
    full_name: '',
    email: '',
    department: '',
    role: '',
    position: '',
    phone: '',
    address: '',
    gender: '',
    avatar: null,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (employee) {
      setFormData({
        full_name: employee.full_name || '',
        email: employee.email || '',
        department: employee.department || '',
        role: employee.role || '',
        position: employee.position || '',
        phone: employee.phone || '',
        address: employee.address || '',
        gender: employee.gender || '',
        avatar: employee.avatar || null,
      });
    }
  }, [employee]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: '',
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({
          ...prev,
          avatar: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.full_name) newErrors.full_name = 'Họ và tên là bắt buộc';
    if (!formData.email) newErrors.email = 'Email là bắt buộc';
    if (!formData.department) newErrors.department = 'Phòng ban là bắt buộc';
    if (!formData.role) newErrors.role = 'Vai trò là bắt buộc';
    if (!formData.position) newErrors.position = 'Chức vụ là bắt buộc';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Chỉnh sửa thông tin nhân viên</h2>
      
      <div className={styles.content}>
        <form onSubmit={handleSubmit}>
          <div className={styles.avatarSection}>
            <img
              src={formData.avatar || '/default-avatar.png'}
              alt="Avatar"
              className={styles.avatar}
            />
            <label htmlFor="avatarInput" className={styles.changeAvatarButton}>
              Đổi ảnh
            </label>
            <input
              type="file"
              id="avatarInput"
              accept="image/*"
              className={styles.avatarInput}
              onChange={handleAvatarChange}
            />
          </div>
          
          <div className={styles.formFields}>
            <div className={styles.formGroup}>
              <label>Mã nhân viên:</label>
              <input
                type="text"
                value={employee.user_id}
                readOnly
                className={styles.readOnlyInput}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>Họ và tên:</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className={errors.full_name ? styles.inputError : styles.input}
              />
              {errors.full_name && <span className={styles.errorMessage}>{errors.full_name}</span>}
            </div>
            
            <div className={styles.formGroup}>
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? styles.inputError : styles.input}
              />
              {errors.email && <span className={styles.errorMessage}>{errors.email}</span>}
            </div>
            
            <div className={styles.formGroup}>
              <label>Phòng ban:</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className={errors.department ? styles.inputError : styles.input}
              >
                <option value="">Chọn phòng ban</option>
                <option value="Engineering">Phòng kỹ thuật</option>
                <option value="Marketing">Phòng marketing</option>
                <option value="Sales">Phòng kinh doanh</option>
              </select>
              {errors.department && <span className={styles.errorMessage}>{errors.department}</span>}
            </div>
            
            <div className={styles.formGroup}>
              <label>Chức vụ:</label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                className={errors.position ? styles.inputError : styles.input}
              />
              {errors.position && <span className={styles.errorMessage}>{errors.position}</span>}
            </div>
            
            <div className={styles.formGroup}>
              <label>Vai trò:</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={errors.role ? styles.inputError : styles.input}
              >
                <option value="">Chọn vai trò</option>
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Developer">Developer</option>
                <option value="Staff">Staff</option>
              </select>
              {errors.role && <span className={styles.errorMessage}>{errors.role}</span>}
            </div>
            
            <div className={styles.formGroup}>
              <label>Điện thoại:</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={styles.input}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>Địa chỉ:</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={styles.input}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>Giới tính:</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={styles.input}
              >
                <option value="">Chọn giới tính</option>
                <option value="Male">Nam</option>
                <option value="Female">Nữ</option>
                <option value="Other">Khác</option>
              </select>
            </div>
          </div>
          
          <div className={styles.actions}>
            <button type="submit" className={styles.saveButton}>
              Lưu thay đổi
            </button>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 