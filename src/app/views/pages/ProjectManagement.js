import React from 'react';
import './ProjectManagement.css'; // Import file CSS
import { Button, Input } from 'reactstrap';
import { LucideEdit, LucideTrash } from "lucide-react";
import { useNavigate } from 'react-router-dom'; // Import hook điều hướng

const ProjectManagement = () => {
    const navigate = useNavigate(); // Khởi tạo hook điều hướng

    const projects = [
        { id: 1, name: 'Shopee', time: '12/5/2024 - 30/04/2025', status: 'Đang tiến hành', members: 18 },
        { id: 2, name: 'Shopee', time: '12/5/2024 - 30/04/2025', status: 'Hoàn thành', members: 18 },
        { id: 3, name: 'Shopee', time: '12/5/2024 - 30/04/2025', status: 'Trễ hạn', members: 18 },
        { id: 4, name: 'Shopee', time: '12/5/2024 - 30/04/2025', status: 'Đang tiến hành', members: 18 },
        // Thêm các dòng dữ liệu khác nếu cần
    ];

    const handleCreateProject = () => {
        navigate('/createproject'); // Chuyển sang trang CreateProject
    };

    return (
        <div className="project-management-container">
            <div className="header">
                <Button className="create-project-btn" onClick={handleCreateProject}>
                    Tạo dự án mới
                </Button>
                <Input className="search-input" placeholder="Tìm kiếm" />
            </div>
            <table className="project-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Dự án</th>
                        <th>Thời gian</th>
                        <th>Tiến độ</th>
                        <th>Thành viên</th>
                        <th>#</th>
                    </tr>
                </thead>
                <tbody>
                    {projects.map((project, index) => (
                        <tr key={index}>
                            <td>{project.id}</td>
                            <td>{project.name}</td>
                            <td>{project.time}</td>
                            <td>{project.status}</td>
                            <td>{project.members}</td>
                            <td>
                                <Button variant="icon" className="edit-btn">
                                    <LucideEdit />
                                </Button>
                                <Button variant="icon" className="delete-btn">
                                    <LucideTrash />
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ProjectManagement;
