'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/router'; // Thay đổi từ next/navigation sang next/router
import styles from './ProjectList.module.css';
import { Project } from '../../types/project';
import { useProjects } from '../../hooks/useProjects';

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
  } = useProjects();

  if (loading) return <div className={styles.loading}>Đang tải dữ liệu...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  const statusOptions = getProjectStatusOptions();

  // Hàm chuyển đến trang chi tiết dự án
  const handleViewProject = (projectId: string): void => {
    router.push(`/projects/${projectId}`);
  };

  const handleCreateProject = (): void => {
    router.push('/projects/create');
  };

  const handleDeleteProject = (projectId: string): void => {
    if (window.confirm('Bạn có chắc muốn xóa dự án này?')) {
      deleteProject(Number(projectId));
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
          {projects.map((project, index) => (
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
              <td>{project.manager}</td>
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
                  onClick={() => handleViewProject(project.project_id)}
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
          ))}
        </tbody>
      </table>

      {projects.length === 0 && !loading && (
        <div className={styles.emptyState}>
          <p>Không có dự án nào. Hãy tạo dự án mới để bắt đầu.</p>
        </div>
      )}

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
    </div>
  );
};

export default ProjectList;
