"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Sử dụng useRouter để điều hướng
import './ProjectManagement.css'; // Import file CSS

const ProjectManagement = () => {

    type Project = {
        project_name: string;
        description: string;
        status: string;
        start_date: string;
        end_date: string;
        manager: number;
    };

    const router = useRouter(); // Khởi tạo hook điều hướng
    const [projects, setProjects] = useState<Project[]>([]); 
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
        router.push('./createProject'); // Điều hướng đến trang tạo dự án
    };

    const handleViewProjectDetail = (projectName : string) => {
        router.push(`/projects/${projectName}`); // Điều hướng đến trang chi tiết dự án
    };

    // Hàm xử lý xóa dự án
    const handleDeleteProject = async (projectName : string) => {
        const confirmed = window.confirm("Bạn có chắc muốn xóa dự án này không?");
        if (!confirmed) return;

        try {
            const response = await fetch(`https://backend-pbl5-134t.onrender.com/api/projects/${projectName}/`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                setProjects(projects.filter(project => project.project_name !== projectName));
            } else {
                throw new Error('Lỗi khi xóa dự án');
            }
        } catch (error) {
            console.error('Lỗi khi xóa dự án:', error);
        }
    };

    // Lọc danh sách dự án theo nhiều thuộc tính
    const filteredProjects = projects.filter(project =>
        (project.project_name && project.project_name.toLowerCase().includes(searchQuery.toLowerCase())) || 
        (project.status && project.status.toLowerCase().includes(searchQuery.toLowerCase())) || 
        (project.manager && project.manager.toString().includes(searchQuery)) ||
        (project.start_date && project.start_date.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (project.end_date && project.end_date.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleSearch = () => {
        setSearchQuery(searchTerm); // Cập nhật từ khóa tìm kiếm khi bấm nút
    };

    return (
        <div className="project-management-container">
            <div className="header">
                <button className="create-project-btn" onClick={handleCreateProject}>
                    Tạo dự án mới
                </button>
                <input
                    className="search-input"
                    type="text"
                    placeholder="Tìm kiếm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)} // Cập nhật giá trị input khi người dùng nhập
                />
                <button className="search-btn" onClick={handleSearch}>
                    Tìm kiếm
                </button>
            </div>
            <table className="project-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Dự án</th>
                        <th>Mô tả</th>
                        <th>Thời gian</th>
                        <th>Tiến độ</th>
                        <th>Quản lý</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredProjects.map((project, index) => (
                        <tr key={project.project_name || index}>
                            <td>{index + 1}</td>
                            <td
                                className="project-name-link"
                                onClick={() => handleViewProjectDetail(project.project_name || '')}
                            >
                                {project.project_name || 'N/A'}
                            </td>
                            <td>{project.description || 'Không xác định'}</td>
                            <td>{`${project.start_date || 'Không xác định'} - ${project.end_date || 'Không xác định'}`}</td>
                            <td>{project.status || 'Không xác định'}</td>
                            <td>{project.manager || 'Không xác định'}</td>
                            <td>
                                <button className="edit-btn" onClick={() => handleViewProjectDetail(project.project_name || '')}>
                                    ✏️
                                </button>
                                <button className="delete-btn" onClick={() => handleDeleteProject(project.project_name || '')}>
                                    🗑️
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ProjectManagement;