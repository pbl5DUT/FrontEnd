'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { employeeService } from '@/modules/employee/services/employeeService';
import styles from './CreateEmployee.module.css';

export default function CreateEmployeeForm({
  onClose,
  onCreateSuccess,
}: {
  onClose?: () => void;
  onCreateSuccess?: () => void;
}) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'User',
    department: 'Marketing',
    gender: 'Male',
    birth_date: '',
    phone: '',
    province: 'Hà Nội',
    district: 'Hoàn Kiếm',
    address: '',
    position: 'Marketing Specialist',
    enterprise_id: 'ent-1',
    avatar: '',
  });

  const [provinces, setProvinces] = useState<{ id: string; name: string }[]>([]);
  const [districts, setDistricts] = useState([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [emailToCheck, setEmailToCheck] = useState('');
  const [checkingEmail, setCheckingEmail] = useState(false);

  useEffect(() => {
    fetch('https://esgoo.net/api-tinhthanh/1/0.htm')
      .then((res) => res.json())
      .then((data) => {
        const provincesWithId = data.data.map((province: any) => ({
          ...province,
          id: province.id || province.name,
        }));
        setProvinces(provincesWithId);
      })
      .catch((err) => console.error('Error fetching provinces:', err));
  }, []);

  useEffect(() => {
    const selectedProvince = provinces.find((p) => p.name === formData.province);
    if (!selectedProvince) return;

    fetch(`https://esgoo.net/api-tinhthanh/2/${selectedProvince.id}.htm`)
      .then((res) => res.json())
      .then((data) => {
        setDistricts(data?.data || []);
      })
      .catch((err) => {
        console.error('Error fetching districts:', err);
        setDistricts([]);
      });
  }, [formData.province, provinces]);

  useEffect(() => {
    if (!emailToCheck) return;

    const timeout = setTimeout(async () => {
      setCheckingEmail(true);
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/check-email/?email=${encodeURIComponent(emailToCheck)}`);
        const data = await res.json();
        if (data.exists) {
          setErrors((prev) => ({ ...prev, email: 'Email đã tồn tại.' }));
        }
      } catch (error) {
        console.error('Lỗi kiểm tra email:', error);
      } finally {
        setCheckingEmail(false);
      }
    }, 600);

    return () => clearTimeout(timeout);
  }, [emailToCheck]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'email') {
      setEmailToCheck(value);
    }

    setErrors((prev) => ({
      ...prev,
      [name]: '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { [key: string]: string } = {};
    const phoneRegex = /^(0|84)[0-9]{9}$/;

    if (!formData.full_name) newErrors.full_name = 'Tên là bắt buộc.';
    if (!formData.birth_date) newErrors.birth_date = 'Ngày sinh là bắt buộc.';
    if (!formData.phone) newErrors.phone = 'Số điện thoại là bắt buộc.';
    else if (!phoneRegex.test(formData.phone)) newErrors.phone = 'Số điện thoại không hợp lệ.';
    if (!formData.email) newErrors.email = 'Email là bắt buộc.';
    if (!formData.province) newErrors.province = 'Tỉnh là bắt buộc.';
    if (!formData.district) newErrors.district = 'Quận/Huyện là bắt buộc.';
    if (!formData.address) newErrors.address = 'Địa chỉ là bắt buộc.';
    if (!formData.position) newErrors.position = 'Vị trí là bắt buộc.';
    if (!formData.password) newErrors.password = 'Mật khẩu là bắt buộc.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const payload = {
        ...formData,
        avatar: formData.avatar.trim() === '' ? null : formData.avatar,
      };

      await employeeService.createEmployee(payload);

      await fetch('http://127.0.0.1:8000/api/send-password-email/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      alert('Tạo nhân viên thành công và đã gửi mật khẩu qua email!');

      // Sử dụng onCreateSuccess nếu có
      if (onCreateSuccess) {
        onCreateSuccess(); // gọi hàm xử lý sau khi tạo nhân viên thành công
      } else {
        // Nếu không có onCreateSuccess, thì đóng modal hoặc chuyển trang
        if (onClose) {
          onClose(); // nếu có modal thì đóng lại
        } else {
          router.push('/employee'); // chuyển trang nếu không ở modal
        }
      }
    } catch (error) {
      console.error('Lỗi tạo nhân viên:', error);
      alert('Không thể tạo nhân viên. Vui lòng thử lại.');
    }
  };

  const handleCancel = () => {
    if (onClose) {
      onClose(); // modal
    } else {
      router.push('/employee'); // hoặc redirect
    }
  };

  return (
    <div className={styles.formContainer}>
      <form className={styles.form} onSubmit={handleSubmit}>

        <div className={styles.row}>
          <div>
            <label className={styles.label}>Họ và tên:</label>
            <input type="text" name="full_name" className={styles.input} value={formData.full_name} onChange={handleChange} />
            {errors.full_name && <p className={styles.error}>{errors.full_name}</p>}
          </div>
          <div>
            <label className={styles.label}>Ngày sinh:</label>
            <input type="date" name="birth_date" className={styles.input} value={formData.birth_date} onChange={handleChange} />
            {errors.birth_date && <p className={styles.error}>{errors.birth_date}</p>}
          </div>
          <div>
            <label className={styles.label}>Giới tính:</label>
            <select name="gender" className={styles.input} value={formData.gender} onChange={handleChange}>
              <option value="Male">Nam</option>
              <option value="Female">Nữ</option>
            </select>
          </div>
        </div>

        <div className={styles.row}>
          <div>
            <label className={styles.label}>Tỉnh/TP:</label>
            <select name="province" className={styles.input} value={formData.province} onChange={handleChange}>
              {provinces.map((p) => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>
            {errors.province && <p className={styles.error}>{errors.province}</p>}
          </div>
          <div>
            <label className={styles.label}>Quận/Huyện:</label>
            <select name="district" className={styles.input} value={formData.district} onChange={handleChange}>
              {districts.map((d: any) => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
            {errors.district && <p className={styles.error}>{errors.district}</p>}
          </div>
          <div>
            <label className={styles.label}>Địa chỉ:</label>
            <input type="text" name="address" className={styles.input} value={formData.address} onChange={handleChange} />
            {errors.address && <p className={styles.error}>{errors.address}</p>}
          </div>
        </div>

        <div className={styles.row}>
          <div>
            <label className={styles.label}>Số điện thoại:</label>
            <input type="text" name="phone" className={styles.input} value={formData.phone} onChange={handleChange} />
            {errors.phone && <p className={styles.error}>{errors.phone}</p>}
          </div>
          <div>
            <label className={styles.label}>Vai trò:</label>
            <select name="role" className={styles.input} value={formData.role} onChange={handleChange}>
              <option value="User">User</option>
              <option value="Admin">Admin</option>
              <option value="Manage">Manage</option>
            </select>
          </div>
        </div>

        <div className={styles.row}>
          <div>
            <label className={styles.label}>Email:</label>
            <input type="email" name="email" className={styles.input} value={formData.email} onChange={handleChange} />
            {checkingEmail && <p className={styles.info}>Đang kiểm tra email...</p>}
            {errors.email && <p className={styles.error}>{errors.email}</p>}
          </div>
          <div>
            <label className={styles.label}>Mật khẩu:</label>
            <input type="password" name="password" className={styles.input} value={formData.password} onChange={handleChange} />
            {errors.password && <p className={styles.error}>{errors.password}</p>}
          </div>
        </div>

        <div className={styles.row}>
          <div>
            <label className={styles.label}>Bộ phận:</label>
            <input type="text" name="department" className={styles.input} value={formData.department} onChange={handleChange} />
          </div>
          <div>
            <label className={styles.label}>Vị trí:</label>
            <input type="text" name="position" className={styles.input} value={formData.position} onChange={handleChange} />
            {errors.position && <p className={styles.error}>{errors.position}</p>}
          </div>
        </div>

        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.button}>
            Tạo nhân viên
          </button>
          {onClose && (
          <button type="button" className={styles.cancelButton} onClick={onClose}>
            Huỷ
          </button>
        )}
        </div>
      </form>
    </div>
  );
}
