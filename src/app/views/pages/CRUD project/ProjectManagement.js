import React, { useState, useEffect } from 'react';
import './ProjectManagement.css'; // Import file CSS
import { Button, Input } from 'reactstrap';
import { LucideEdit, LucideTrash } from "lucide-react";
import { useNavigate } from 'react-router-dom'; // Import hook điều hướng

const ProjectManagement = () => {
    const navigate = useNavigate(); // Khởi tạo hook điều hướng
    const [projects, setProjects] = useState([]); // State để lưu danh sách dự án
    const [searchTerm, setSearchTerm] = useState(''); // State cho từ khóa tìm kiếm
    const [searchQuery, setSearchQuery] = useState(''); // State cho từ khóa khi bấm nút tìm kiếm

    // Hàm lấy dữ liệu từ API sử dụng JSON
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await fetch('https://backend-pbl5-134t.onrender.com/api/projects/', {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json(); // Chuyển đổi dữ liệu nhận được sang JSON
                setProjects(data); // Lưu dữ liệu dự án vào state
            } catch (error) {
                console.error('Lỗi khi lấy dữ liệu dự án:', error);
            }
        };
        fetchProjects();
    }, []); // Chỉ chạy 1 lần khi component được mount

    const handleCreateProject = () => {
        navigate('/createproject'); // Chuyển sang trang CreateProject
    };

    const handleViewProjectDetail = (projectId) => {
        navigate(`/projects/${projectId}`); // Điều hướng sang trang chi tiết dự án
    };

    // Hàm xử lý xóa dự án
    const handleDeleteProject = async (projectId) => {
        const confirmed = window.confirm("Bạn có chắc muốn xóa dự án này không?");
        if (!confirmed) return;

        try {
            const response = await fetch(`https://backend-pbl5-134t.onrender.com/api/projects/${projectId}/`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                // Xóa dự án khỏi danh sách sau khi xóa thành công
                setProjects(projects.filter(project => project.project_id !== projectId));
            } else {
                throw new Error('Lỗi khi xóa dự án');
            }
        } catch (error) {
            console.error('Lỗi khi xóa dự án:', error);
        }
    };

    // Lọc danh sách dự án theo nhiều thuộc tính (project_name, status, start_date, end_date, manager)
    const filteredProjects = projects.filter(project =>
        (project.project_name && project.project_name.toLowerCase().includes(searchQuery.toLowerCase())) || 
        (project.status && project.status.toLowerCase().includes(searchQuery.toLowerCase())) || 
        (project.manager && typeof project.manager === 'string' && project.manager.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (project.start_date && project.start_date.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (project.end_date && project.end_date.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Hàm xử lý khi bấm nút tìm kiếm
    const handleSearch = () => {
        setSearchQuery(searchTerm); // Cập nhật từ khóa tìm kiếm khi bấm nút
    };

    return (
        <div className="project-management-container">
            <div className="header">
                <Button className="create-project-btn" onClick={handleCreateProject}>
                    Tạo dự án mới
                </Button>
                <Input
                    className="search-input"
                    placeholder="Tìm kiếm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)} // Cập nhật giá trị input khi người dùng nhập
                />
                <Button className="search-btn" onClick={handleSearch}>
                    Tìm kiếm
                </Button>
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
                    {filteredProjects.map((project, index) => (
                        <tr key={project.project_id}>
                            <td>{index + 1}</td>
                            <td
                                className="project-name-link"
                                onClick={() => handleViewProjectDetail(project.project_id)}
                            >
                                {project.project_name || 'N/A'}
                            </td>
                            <td>{`${project.start_date} - ${project.end_date}` || 'Không xác định'}</td>
                            <td>{project.status || 'Không xác định'}</td>
                            <td>{project.manager || 'Không xác định'}</td>
                            <td>
                                <Button variant="icon" className="edit-btn">
                                    <LucideEdit />
                                </Button>
                                <Button variant="icon" className="delete-btn" onClick={() => handleDeleteProject(project.project_id)}>
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
