"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './project.module.css'; 
import Popover from '../../components/popover';
import ProjectUpdateForm from './editProject';
import CreateProject from './createProject';
import ViewProject from './viewProject';
const ProjectManagement = () => {
    type Project = {
        code: string;
        project_name: string;
        description: string;
        status: string;
        start_date: string;
        end_date: string;
        manager: number;
    };

    const router = useRouter();
    const [popoverType, setPopoverType] = useState<null | 'create' | 'edit' | 'delete' | 'view'>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProject, setSelectedProject] = useState<any>(null);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await fetch('https://backend-pbl5-134t.onrender.com/api/projects/', {
                    headers: { 'Content-Type': 'application/json' }
                });
                if (!response.ok) throw new Error('Network error');
                const data = await response.json();
                setProjects(data);
            } catch (error) {
                console.error('Lỗi khi lấy dữ liệu dự án:', error);
            }
        };
        fetchProjects();
    }, []);
    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <button
                    className={styles.btnCreate}
                    onClick={() => setPopoverType('create')}
                >
                    Tạo dự án mới
                </button>
                <input type="text" placeholder="Tìm kiếm" className={styles.searchBar} />
            </header>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Tên dự án</th>
                        <th>Mô tả</th>
                        <th>Thời gian</th>
                        <th>Tiến độ </th>
                        <th>Quản lý</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                       {projects.map((project, index) => (
                        <tr key={project.project_name || index}>
                            <td>{index + 1}</td>
                            <td>  {project.project_name || 'N/A'} </td>
                            <td>{project.description || 'Không xác định'}</td>
                            <td>{`${project.start_date || 'Không xác định'} - ${project.end_date || 'Không xác định'}`}</td>
                            <td>{project.status || 'Không xác định'}</td>
                            <td>{project.manager || 'Không xác định'}</td>
                            <td>
                                <button
                                    className={styles.btnView}
                                    onClick={() => {
                                        setPopoverType('view');
                                        setSelectedProject(projects);
                                    }}
                                >
                                    👁️
                                </button>
                                <button
                                    className={styles.btnEdit}
                                    onClick={() => {
                                        setPopoverType('edit');
                                        setSelectedProject(projects);
                                    }}
                                >
                                    ✏️
                                </button>
                                <button
                                    className={styles.btnDelete}
                                    onClick={() => {
                                        setPopoverType('delete');
                                        setSelectedProject(projects);
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
                    <h3>Thêm dự án mới</h3>
                    <CreateProject onClose={() => setPopoverType(null)} />
                </Popover>
            )}

            {popoverType === 'view' && selectedProject && (
                            <Popover onClose={() => setPopoverType(null)}>
                                <ViewProject
                                    project_name="manager"
                                    // {selectedProject.project_name}
                                    onClose={() => setPopoverType(null)}
                                />
                            </Popover>
                        )}

        {popoverType === 'edit' && selectedProject && (
             <Popover onClose={() => setPopoverType(null)}>
             <ProjectUpdateForm
                     project={selectedProject}
                     onUpdate={(updatedProject) => {
             setProjects((prevProjects) =>
                prevProjects.map((proj) =>
            proj.code === updatedProject.code ? updatedProject : proj
          )
        );
        setPopoverType(null); // Đóng popover sau khi lưu
      }}
      onClose={() => setPopoverType(null)} 
    />
  </Popover>

)}
{/* 
            {popoverType === 'delete' && selectedProject.code && (
    <Popover onClose={() => setPopoverType(null)}>
        <DeleteProject
            project={selectedProject}
            onDeleteSuccess={() => {
                setProjects((prevProjects) =>
                    prevProjects.filter((proj) => proj.code !== selectedProject.code)
                );
                setPopoverType(null); 
            }}
            onCancel={() => setPopoverType(null)} 
        />
    </Popover>
)} */}

            {/* {popoverType === 'delete' && selectedEmployee.user_id && (
                <Popover onClose={() => setPopoverType(null)}>
                    <DeleteProject
                        project={selectedProject} // Truyền nhân viên được chọn, bao gồm user_id
                        onDeleteSuccess={() => {
                            setEmployees((prevEmployees) =>
                                prevEmployees.filter((emp) => emp.user_id !== selectedEmployee.user_id)
                            );
                            setPopoverType(null); 
                        }}
                        onCancel={() => setPopoverType(null)} 
                    />
                </Popover>
            )} */}
        </div>
    );
};

export default ProjectManagement;
