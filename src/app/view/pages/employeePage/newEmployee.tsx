import { useState, useEffect } from "react";
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
        provinceId: "",
        cityId: "",
        address: "",
        position: "",
        avatar: null,
    });

    const [provinces, setProvinces] = useState([]);
    const [cities, setCities] = useState([]);

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        // Lấy danh sách tỉnh
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

    useEffect(() => {
        // Lấy danh sách quận/huyện khi người dùng chọn tỉnh
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

    const handleSubmit = async (e: React.FormEvent) => {
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
        if (!formData.email) {
            newErrors.email = "Email là bắt buộc.";
        } else {
            try {
                // Gọi API kiểm tra email
                const response = await fetch(
                    `https://emailvalidation.abstractapi.com/v1/?api_key=c9c45f9cbdae4c968fb6024af971fdf8&email=${formData.email}`
                ); 
                const data = await response.json();
    
                if (!data.is_valid_format.value) {
                    newErrors.email = "Email không hợp lệ.";
                } else if (data.deliverability === "UNDELIVERABLE") {
                    newErrors.email = "Email không thể gửi được.";
                }
            } catch (error) {
                console.error("Error validating email:", error);
                newErrors.email = "Không thể kiểm tra email. Vui lòng thử lại.";
            }
        }
        if (!formData.provinceId) newErrors.province = "Tỉnh là bắt buộc.";
        if (!formData.cityId) newErrors.city = "Thành phố là bắt buộc.";
        if (!formData.address) newErrors.address = "Địa chỉ thường trú là bắt buộc.";
        if (!formData.position) newErrors.position = "Vị trí công việc là bắt buộc.";
    
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
    
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
                {errors.firstName && <p className={styles.error}>{errors.firstName}</p>}
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
                {errors.firstName && <p className={styles.error}>{errors.lastName}</p>}
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
            {errors.firstName && <p className={styles.error}>{errors.birthDate}</p>}
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
            {errors.firstName && <p className={styles.error}>{errors.phone}</p>}
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
            {errors.email && <p className={styles.error}>{errors.email}</p>}
        </div>
        <div className={styles.row}>
            <div className={styles.column}>
            <label className={styles.label}>Tỉnh:</label>
                <select
                    className={styles.input}
                    name="provinceId"
                    value={formData.provinceId}
                    onChange={handleChange}
                >
                    <option value="">Chọn tỉnh</option>
                    {provinces.map((province: any) => (
                        <option key={province.id} value={province.id}>
                            {province.name}
                        </option>
                    ))}
                </select>
                {errors.provinceId && <p className={styles.error}>{errors.provinceId}</p>}
            </div>
            <div className={styles.column}>
            <label className={styles.label}>Thành quận, huyện:</label>
                <select
                    className={styles.input}
                    name="cityId"
                    value={formData.cityId}
                    onChange={handleChange}
                >
                    <option value="">Chọn quận, huyện</option>
                    {cities.map((city: any) => (
                        <option key={city.id} value={city.id}>
                            {city.name}
                        </option>
                    ))}
                </select>
                {errors.cityId && <p className={styles.error}>{errors.cityId}</p>}
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
            {errors.firstName && <p className={styles.error}>{errors.address}</p>}
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
            {errors.firstName && <p className={styles.error}>{errors.position}</p>}
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