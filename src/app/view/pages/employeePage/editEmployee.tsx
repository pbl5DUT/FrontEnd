import { useState, useEffect } from "react";
import styles from './page.module.css';

export default function EditEmployee({ employeeId, onClose, onSave }: { 
    employeeId: string; 
    onClose: () => void; 
    onSave: (updatedEmployee: any) => void; 
}) {
    const [formData, setFormData] = useState({
        employeeId: "",
        firstName: "",
        lastName: "",
        gender: "male",
        birthDate: "",
        phone: "",
        email: "",
        provinceId: "",
        cityId: "",
        address: "",
        position: "",
        avatar: null,
    });

    const [provinces, setProvinces] = useState([]);
    const [cities, setCities] = useState([]);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Lấy thông tin chi tiết của nhân viên từ API
    useEffect(() => {
        async function fetchEmployeeDetails() {
            try {
                const response = await fetch(`https://backend-pbl5-134t.onrender.com/api/users/`);
                if (!response.ok) {
                    throw new Error("Failed to fetch employee details");
                }
                const data = await response.json();
                setFormData({
                    employeeId: data.user_id || "",
                    firstName: data.first_name || "",
                    lastName: data.last_name || "",
                    gender: data.gender || "male",
                    birthDate: data.birth_date || "",
                    phone: data.phone || "",
                    email: data.email || "",
                    provinceId: data.province_id || "",
                    cityId: data.city_id || "",
                    address: data.address || "",
                    position: data.position || "",
                    avatar: null, // Avatar sẽ được cập nhật nếu cần
                });
            } catch (error) {
                console.error("Error fetching employee details:", error);
            }
        }
        fetchEmployeeDetails();
    }, [employeeId]);

    // Lấy danh sách tỉnh
    useEffect(() => {
        async function fetchProvinces() {
            try {
                const response = await fetch("https://esgoo.net/api-tinhthanh/1/0.htm");
                const data = await response.json();
                setProvinces(data.data || []);
            } catch (error) {
                console.error("Error fetching provinces:", error);
            }
        }
        fetchProvinces();
    }, []);

    // Lấy danh sách quận/huyện khi người dùng chọn tỉnh
    useEffect(() => {
        async function fetchCities() {
            if (!formData.provinceId) return;
            try {
                const response = await fetch(`https://esgoo.net/api-tinhthanh/2/${formData.provinceId}.htm`);
                const data = await response.json();
                setCities(data.data || []);
            } catch (error) {
                console.error("Error fetching cities:", error);
            }
        }
        fetchCities();
    }, [formData.provinceId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, files } = e.target as HTMLInputElement;
        setFormData((prev) => ({
            ...prev,
            [name]: files ? files[0] : value,
        }));
        setErrors((prev) => ({
            ...prev,
            [name]: "",
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors: { [key: string]: string } = {};
        const phoneRegex = /^(0|84)[0-9]{9}$/;

        if (!formData.firstName) newErrors.firstName = "Họ và tên đệm là bắt buộc.";
        if (!formData.lastName) newErrors.lastName = "Tên là bắt buộc.";
        if (!formData.birthDate) newErrors.birthDate = "Ngày sinh là bắt buộc.";
        if (!formData.phone) newErrors.phone = "Số điện thoại là bắt buộc.";
        else if (!phoneRegex.test(formData.phone)) {
            newErrors.phone = "Số điện thoại không hợp lệ. Phải bắt đầu bằng 0 hoặc 84 và có 9 chữ số.";
        }
        if (!formData.email) newErrors.email = "Email là bắt buộc.";
        if (!formData.provinceId) newErrors.provinceId = "Tỉnh là bắt buộc.";
        if (!formData.cityId) newErrors.cityId = "Quận/Huyện là bắt buộc.";
        if (!formData.address) newErrors.address = "Địa chỉ thường trú là bắt buộc.";
        if (!formData.position) newErrors.position = "Vị trí công việc là bắt buộc.";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Gọi hàm `onSave` để lưu thông tin nhân viên đã chỉnh sửa
        onSave(formData);
        onClose();
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <div>
                <label className={styles.label}>Mã nhân viên:</label>
                <input type="text" className={styles.input} value={formData.employeeId} readOnly />
            </div>
            <div>
                <label className={styles.label}>Họ và tên đệm:</label>
                <input
                    type="text"
                    className={styles.input}
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                />
                {errors.firstName && <p className={styles.error}>{errors.firstName}</p>}
            </div>
            <div>
                <label className={styles.label}>Tên:</label>
                <input
                    type="text"
                    className={styles.input}
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                />
                {errors.lastName && <p className={styles.error}>{errors.lastName}</p>}
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
    );
}