'use client';

import { useEffect, useState } from 'react';
import Popover from '../../components/popover';
import styles from './page.module.css';
import CreateEmployee from './newEmployee';
import ViewEmployee from './viewEmployee';
import DeleteEmployee from './deleteEmployee';
import EditEmployee from './editEmployee';

export default function EmployeePage() {

    type Employee = {
        user_id: string;
        full_name: string;
        email: string;
        department: string;
        role: string;
        employeeId: string; 
        [key: string]: any;
    };
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [popoverType, setPopoverType] = useState<null | 'create' | 'edit' | 'delete' | 'view'>(null);
    const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch('https://backend-pbl5-134t.onrender.com/api/users/');
                if (!response.ok) {
                    throw new Error('Failed to fetch employees');
                }
                const data = await response.json();
    
                // Thêm thuộc tính `projects` mặc định nếu không có
                const updatedData = data.map((employee: any) => ({
                    ...employee,
                    projects: [], // Thêm `projects` mặc định là mảng rỗng
                }));
    
                setEmployees(updatedData);
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
                    onClick={() => setPopoverType('create')}
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
                                <button
                                    className={styles.btnView}
                                    onClick={() => {
                                        setPopoverType('view');
                                        setSelectedEmployee(employee);
                                    }}
                                >
                                    👁️
                                </button>
                                <button
                                    className={styles.btnEdit}
                                    onClick={() => {
                                        setPopoverType('edit');
                                        setSelectedEmployee(employee);
                                    }}
                                >
                                    ✏️
                                </button>
                                <button
                                    className={styles.btnDelete}
                                    onClick={() => {
                                        setPopoverType('delete');
                                        setSelectedEmployee(employee);
                                    }}
                                >
                                    🗑️
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {popoverType === 'create' && (
                <Popover onClose={() => setPopoverType(null)}>
                    <h3>Thêm nhân viên mới</h3>
                    <CreateEmployee onClose={() => setPopoverType(null)} />
                </Popover>
            )}

            {popoverType === 'view' && selectedEmployee && (
                <Popover onClose={() => setPopoverType(null)}>
                    <ViewEmployee
                        employee={selectedEmployee || { projects: [] }} // Đảm bảo `projects` luôn là một mảng
                        onClose={() => setPopoverType(null)}
                    />
                </Popover>
            )}

            {popoverType === 'delete' && selectedEmployee.user_id && (
                <Popover onClose={() => setPopoverType(null)}>
                    <DeleteEmployee
                        employee={selectedEmployee}
                        onDeleteSuccess={() => {
                            setEmployees((prevEmployees) =>
                                prevEmployees.filter((emp) => emp.user_id !== selectedEmployee.user_id)
                            );
                            setPopoverType(null); 
                        }}
                        onCancel={() => setPopoverType(null)} 
                    />
                </Popover>
            )}

            {popoverType === 'edit' && selectedEmployee && (
                <Popover onClose={() => setPopoverType(null)}>
                    <EditEmployee
                        employeeId={selectedEmployee.user_id}
                        onClose={() => setPopoverType(null)}
                        onSave={(updatedEmployee) => {
                            setEmployees((prevEmployees) =>
                                prevEmployees.map((emp) =>
                                    emp.user_id === updatedEmployee.user_id ? updatedEmployee : emp
                                )
                            );
                            setPopoverType(null);
                        }}
                    />
                </Popover>
            )}
        </div>
    );
}

