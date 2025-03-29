'use client';

import { useEffect, useState } from 'react';
import Popover from '../../components/popover';
import styles from './page.module.css';
import CreateEmployee from './newEmployee';

export default function EmployeePage() {
    const [employees, setEmployees] = useState([]);
    const [isCreatePopoverOpen, setIsCreatePopoverOpen] = useState(false); // Trạng thái mở Popover "Tạo nhân viên"

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch('https://backend-pbl5-134t.onrender.com/api/users/');
                if (!response.ok) {
                    throw new Error('Failed to fetch employees');
                }
                const data = await response.json();
                setEmployees(data);
            } catch (error) {
                console.error('Error fetching employees:', error);
            }
        }
        fetchData();
    }, []);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <button
                    className={styles.btnCreate}
                    onClick={() => setIsCreatePopoverOpen(true)} // Mở Popover "Tạo nhân viên"
                >
                    Tạo nhân viên mới
                </button>
                <input type="text" placeholder="Tìm kiếm" className={styles.searchBar} />
            </header>
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
                    {employees.map((employee: any, index: number) => (
                        <tr key={employee.user_id}>
                            <td>{index + 1}</td>
                            <td>{employee.user_id}</td>
                            <td>{employee.full_name}</td>
                            <td>{employee.email}</td>
                            <td>{employee.department}</td>
                            <td>{employee.role}</td>
                            <td>
                                <button className={styles.btnEdit}>✏️</button>
                                <button className={styles.btnDelete}>🗑️</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {isCreatePopoverOpen && (
                <Popover onClose={() => setIsCreatePopoverOpen(false)}>
                    <h3>Thêm nhân viên mới</h3>
                    <CreateEmployee onClose={() => setIsCreatePopoverOpen(false)} />
                </Popover>
            )}
        </div>
    );
}