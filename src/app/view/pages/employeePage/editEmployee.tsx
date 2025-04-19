import { useState } from "react";
import styles from './page.module.css';

export default function EditEmployee({ employee, onClose, onSave }: { 
    employee: any; 
    onClose: () => void; 
    onSave: (updatedEmployee: any) => void; 
}) {
    const [formData, setFormData] = useState({
        employeeId: employee.user_id || "",
        fullName: employee.full_name || "",
        email: employee.email || "",
        department: employee.department || "",
        role: employee.role || "",
        avatar: employee.avatar || "/default-avatar.png",
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        setErrors((prev) => ({
            ...prev,
            [name]: "",
        }));
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setFormData((prev) => ({
                    ...prev,
                    avatar: reader.result as string, // Hiển thị ảnh mới
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors: { [key: string]: string } = {};
        if (!formData.fullName) newErrors.fullName = "Họ và tên là bắt buộc.";
        if (!formData.email) newErrors.email = "Email là bắt buộc.";
        if (!formData.department) newErrors.department = "Phòng ban là bắt buộc.";
        if (!formData.role) newErrors.role = "Vai trò là bắt buộc.";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Gọi hàm `onSave` để lưu thông tin nhân viên đã chỉnh sửa
        onSave(formData);
        onClose();
    };

    return (
        <div className={styles.viewEmployeeContainer}>
            {/* Header */}
            <div className={styles.viewEmployeeHeaderContainer}>
                <div className={styles.avatarContainer}>
                    <img
                        src={formData.avatar}
                        alt="Avatar"
                        className={styles.avatar}
                    />
                    <label htmlFor="avatarInput" className={styles.changeAvatarButton} >
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
                <div className={styles.employeeInfo}>
                    <form onSubmit={handleSubmit}>
                        <div>
                            <label className={styles.label}><strong>Mã nhân viên:</strong></label>
                            <input
                                type="text"
                                className={styles.input}
                                value={formData.employeeId}
                                readOnly
                            />
                        </div>
                        <div>
                            <label className={styles.label}><strong>Họ và tên:</strong></label>
                            <input
                                type="text"
                                className={styles.input}
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                            />
                            {errors.fullName && <p className={styles.error}>{errors.fullName}</p>}
                        </div>
                        <div>
                            <label className={styles.label}><strong>Email:</strong></label>
                            <input
                                type="email"
                                className={styles.input}
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                            {errors.email && <p className={styles.error}>{errors.email}</p>}
                        </div>
                        <div>
                            <label className={styles.label}><strong>Phòng ban:</strong></label>
                            <input
                                type="text"
                                className={styles.input}
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                            />
                            {errors.department && <p className={styles.error}>{errors.department}</p>}
                        </div>
                        <div>
                            <label className={styles.label}><strong>Vai trò:</strong></label>
                            <input
                                type="text"
                                className={styles.input}
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                            />
                            {errors.role && <p className={styles.error}>{errors.role}</p>}
                        </div>
                        <div className={styles.actions}>
                            <button type="submit" className={styles.btnSubmit}>
                                Lưu thay đổi
                            </button>
                            <button
                                type="button"
                                className={styles.btnCancel}
                                onClick={onClose}
                            >
                                Hủy
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}