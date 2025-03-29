import { useState } from "react";
import styles from './page.module.css';

export default function NewEmployee({ onClose }: { onClose: () => void }) {
    const [formData, setFormData] = useState({
        employeeId: "NV02",
        firstName: "",
        lastName: "",
        gender: "male",
        birthDate: "",
        phone: "",
        email: "",
        province: "",
        city: "",
        address: "",
        position: "",
        avatar: null,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, files } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: files ? files[0] : value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Form Data:", formData);
        onClose(); 
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
        <div>
            <label className={styles.label}>Mã nhân viên:</label>
            <input type="text" className={styles.input} value={formData.employeeId} readOnly />
        </div>
        <div className={styles.row}>
            <div className={styles.column}>
                <label className={styles.label}>Họ và tên đệm:</label>
                <input
                    type="text"
                    className={styles.input}
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                />
            </div>
            <div className={styles.column}>
                <label className={styles.label}>Tên:</label>
                <input
                    type="text"
                    className={styles.input}
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                />
            </div>
        </div>
        <div>
            <label className={styles.label}>Giới tính:</label>
            <div className={styles.row}>
                <label>
                    <input
                        type="radio"
                        name="gender"
                        value="male"
                        checked={formData.gender === "male"}
                        onChange={handleChange}
                    />{" "}
                    Nam
                </label>
                <label>
                    <input
                        type="radio"
                        name="gender"
                        value="female"
                        checked={formData.gender === "female"}
                        onChange={handleChange}
                    />{" "}
                    Nữ
                </label>
            </div>
        </div>
        <div>
            <label className={styles.label}>Ngày sinh:</label>
            <input
                type="date"
                className={styles.input}
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
            />
        </div>
        <div>
            <label className={styles.label}>Số điện thoại:</label>
            <input
                type="text"
                className={styles.input}
                name="phone"
                value={formData.phone}
                onChange={handleChange}
            />
        </div>
        <div>
            <label className={styles.label}>Email:</label>
            <input
                type="email"
                className={styles.input}
                name="email"
                value={formData.email}
                onChange={handleChange}
            />
        </div>
        <div className={styles.row}>
            <div className={styles.column}>
                <label className={styles.label}>Tỉnh:</label>
                <input
                    type="text"
                    className={styles.input}
                    name="province"
                    value={formData.province}
                    onChange={handleChange}
                />
            </div>
            <div className={styles.column}>
                <label className={styles.label}>Thành phố:</label>
                <input
                    type="text"
                    className={styles.input}
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                />
            </div>
        </div>
        <div>
            <label className={styles.label}>Địa chỉ thường trú:</label>
            <input
                type="text"
                className={styles.input}
                name="address"
                value={formData.address}
                onChange={handleChange}
            />
        </div>
        <div>
            <label className={styles.label}>Vị trí công việc:</label>
            <input
                type="text"
                className={styles.input}
                name="position"
                value={formData.position}
                onChange={handleChange}
            />
        </div>
        <div>
            <label className={styles.label}>Ảnh đại diện:</label>
            <input
                type="file"
                accept="image/*"
                className={styles.input}
                name="avatar"
                onChange={handleChange}
            />
        </div>
        <div className={styles.actions}>
            <button type="submit" className={styles.btnSubmit}>
                Thêm nhân viên
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
    );
}