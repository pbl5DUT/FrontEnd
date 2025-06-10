'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Sửa import cho Next.js 13+
import styles from './ProjectList.module.css';
import { Project, ProjectFormData } from '../../types/project';
import { useProjects } from '../../hooks/useProjects';
import CreateProjectModal from '../modal/CreateProjectModal/CreateProjectModal';
import { Employee } from '@/modules/employee/types/employee.types';
import { employeeService } from '@/modules/employee/services/employeeService';
import { getCurrentUser } from '@/modules/auth/services/authService';
import { useChatService } from '@/modules/chat-room/services/useChatService';

const ProjectList: React.FC = () => {
  const router = useRouter();
  const {
    projects,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    totalPages,
    getPageNumbers,
    deleteProject,
    getProjectStatusOptions,
    addProject
  } = useProjects();

  const [isModalOpen, setIsModalOpen] = useState(false);  const [managers, setManagers] = useState<{ id: string; full_name: string }[]>([]);
  const [users, setUsers] = useState<{ user_id: string; full_name: string }[]>([]);
  
  // Get current user ID for chat service
  const currentUser = getCurrentUser();
  const userId = currentUser ? parseInt(currentUser.user_id, 10) : 0;
  const { createChatRoom } = useChatService(userId);
  
  useEffect(() => {
    // Fetch managers và users khi component được mount
    fetchManagers();
    fetchUsers();
  }, []);

  const fetchManagers = async () => {
    try {
      const data = await employeeService.getEmployees();

      setManagers(
        data.filter((employee) => employee.role === 'Manage').map((employee) => ({
          id: employee.user_id.toString(),
          full_name: employee.full_name,
        }))
      );
    } catch (error) {
      console.error('Failed to fetch managers:', error);
      // Có thể set error state hoặc hiển thị toast notification
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await employeeService.getEmployees();
      
      setUsers(
        data.filter((employee) => employee.role === 'User').map((employee) => ({ // Sửa lỗi assignment
          user_id: employee.user_id.toString(),
          full_name: employee.full_name,
        }))
      );
    } catch (error) {
      console.error('Failed to fetch users:', error);
      // Có thể set error state hoặc hiển thị toast notification
    }
  };

  if (loading) return <div className={styles.loading}>Đang tải dữ liệu...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  const statusOptions = getProjectStatusOptions();

  // Hàm chuyển đến trang chi tiết dự án
  const handleViewProject = (projectId: string): void => {
    console.log('Navigating to project ID:', projectId);
    router.push(`/projects/${projectId}`);
  };

  const handleCreateProject = (): void => {
    setIsModalOpen(true);
  };

  const handleCloseModal = (): void => {
    setIsModalOpen(false);
  };
  // Cập nhật hàm này để sử dụng addProject từ useProjects hook
  const handleSubmitCreateProject = async (projectData: ProjectFormData): Promise<void> => {
    try {
      await addProject(projectData);
      setIsModalOpen(false); // Đóng modal sau khi tạo thành công
      
      console.log('Project and chat room created successfully');
      // Có thể hiển thị thông báo thành công nếu cần
    } catch (error) {
      console.error('Error creating project:', error);
      // Hiển thị thông báo lỗi nếu cần
    }
  };

  const handleDeleteProject = (projectId: string): void => {
    if (window.confirm('Bạn có chắc muốn xóa dự án này?')) {
      deleteProject(projectId);
    }
  };

  return (
    <div className={styles.projectList}>
      <div className={styles.header}>
        <h2>Danh sách dự án</h2>
        <button className={styles.addButton} onClick={handleCreateProject}>
          Tạo dự án mới
        </button>
      </div>

      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Tìm kiếm dự án..."
          className={styles.searchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className={styles.filterSelect}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Tất cả trạng thái</option>
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th>
            <th>Tên dự án</th>
            <th>Mô tả</th>
            <th>Thời gian</th>
            <th>Trạng thái</th>
            <th>Tiến độ</th>
            <th>Quản lý</th>
            <th>Thành viên</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {projects.length > 0 ? (
            projects.map((project, index) => (
              <tr key={project.project_id}>
                <td>{(currentPage - 1) * 10 + index + 1}</td>
                <td>{project.project_name}</td>
                <td>{project.description}</td>
                <td>
                  {project.start_date} - {project.end_date}
                </td>
                <td>
                  <span
                    className={`${styles.statusBadge} ${
                      styles[project.status.toLowerCase().replace(/\s+/g, '_')]
                    }`}
                  >
                    {project.status}
                  </span>
                </td>
                <td>
                  <div className={styles.progressContainer}>
                    <div
                      className={`${styles.progressBar} ${
                        (project.progress || 0) < 30
                          ? styles.low
                          : (project.progress || 0) < 70
                          ? styles.medium
                          : styles.high
                      }`}
                      style={{ width: `${project.progress || 0}%` }}
                    ></div>
                    <span>{project.progress || 0}%</span>
                  </div>
                </td>
                <td>{project.manager?.full_name || 'Chưa có quản lý'}</td>
                <td>
                  <div className={styles.memberAvatars}>
                    {project.members && project.members.length > 0 ? (
                      <div className={styles.avatarGroup}>
                        {project.members.slice(0, 3).map((member, idx) => (
                          <div
                            key={idx}
                            className={styles.avatarWrapper}
                            title={`${member.user.full_name} (${member.role_in_project})`}
                          >
                            {member.user.avatar ? (
                              <img
                                src={member.user.avatar}
                                alt={member.user.full_name}
                                className={styles.avatar}
                              />
                            ) : (
                              <div className={styles.avatarPlaceholder}>
                                {member.user.full_name.charAt(0)}
                              </div>
                            )}
                          </div>
                        ))}
                        {project.members.length > 3 && (
                          <div className={styles.avatarMore}>
                            +{project.members.length - 3}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className={styles.noMembers}>Chưa có thành viên</span>
                    )}
                  </div>
                </td>
                <td className={styles.actions}>
                  <button
                    className={styles.viewButton}
                    title="Xem chi tiết"
                    onClick={() => handleViewProject(project.project_id as string)}
                  >
                    <img
                      src="/assets/icons/list.png"
                      alt="Xem chi tiết"
                      className={styles.icon}
                    />
                  </button>

                  <button
                    className={styles.deleteButton}
                    title="Xóa"
                    onClick={() => handleDeleteProject(project.project_id)}
                  >
                    <img
                      src="/assets/icons/delete.png"
                      alt="Xóa"
                      className={styles.icon}
                    />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={9} className={styles.emptyState}>
                <p>Không có dự án nào. Hãy tạo dự án mới để bắt đầu.</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageButton}
            onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
          >
            ‹
          </button>

          {getPageNumbers().map((pageNum, index) => (
            <button
              key={index}
              className={`${styles.pageButton} ${
                pageNum === currentPage ? styles.active : ''
              } ${pageNum === '...' ? styles.dots : ''}`}
              onClick={() =>
                typeof pageNum === 'number' && setCurrentPage(pageNum)
              }
              disabled={pageNum === '...'}
            >
              {pageNum}
            </button>
          ))}

          <button
            className={styles.pageButton}
            onClick={() =>
              setCurrentPage(Math.min(currentPage + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            ›
          </button>
        </div>
      )}

      {/* Cập nhật component CreateProjectModal với props để hỗ trợ thêm thành viên */}
      <CreateProjectModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onCreateProject={handleSubmitCreateProject}
        managers={managers}
        users={users} // Truyền danh sách users cho việc chọn thành viên
      />
    </div>
  );
};

export default ProjectList;