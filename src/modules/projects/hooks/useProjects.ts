'use client';

import { useState, useEffect } from 'react';
import { Project, ProjectStatus, ProjectFormData } from '../types/project';
import {
  fetchProjects,
  createProject,
  updateProject as apiUpdateProject,
  deleteProject as apiDeleteProject,
  addProjectMembers,
  removeProjectMember,
  updateMemberRole,
  updateProjectStatus
} from '../services/project_service'; // Đường dẫn tới file service của bạn

// Type definition for the status option
interface StatusOption {
  value: string;
  label: string;
}

// Type definition for the hook return value
interface UseProjectsReturn {
  projects: Project[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  getPageNumbers: () => (number | string)[];
  deleteProject: (projectId: number) => Promise<void>;
  addProject: (project: ProjectFormData) => Promise<void>;
  updateProject: (project: Project) => Promise<void>;
  getProjectStatusOptions: () => StatusOption[];
  refreshProjects: () => Promise<void>; // Thêm hàm refresh
}

export const useProjects = (): UseProjectsReturn => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Hàm để lấy dữ liệu từ API
  const getProjects = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProjects();
      setProjects(data);
      setTotalPages(Math.ceil(data.length / 10)); // Giả sử 10 items mỗi trang
      setLoading(false);
    } catch (err) {
      if (err instanceof Error) {
        setError(
          err.message || 'Không thể tải dữ liệu. Vui lòng thử lại sau.'
        );
      } else {
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      }
      setLoading(false);
    }
  };

  // Gọi hàm lấy dữ liệu khi component được mount
  useEffect(() => {
    getProjects();
  }, []);

  // Hàm để refresh dữ liệu
  const refreshProjects = async (): Promise<void> => {
    await getProjects();
  };

  // Filtered projects based on search term and status filter
  const filteredProjects = projects.filter((project: Project) => {
    const matchesSearch =
      searchTerm === '' ||
      project.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === '' || project.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Add new project function
  const addProject = async (projectData: ProjectFormData): Promise<void> => {
    try {
      setLoading(true);
      const newProject = await createProject(projectData);
      
      // Refresh lại danh sách dự án sau khi thêm
      await refreshProjects();
      
      // Hoặc thêm trực tiếp vào state để tránh gọi API lại
      // setProjects((prevProjects) => [newProject, ...prevProjects]);
      
      setLoading(false);
    } catch (err) {
      if (err instanceof Error) {
        setError(
          err.message || 'Không thể tạo dự án. Vui lòng thử lại sau.'
        );
      } else {
        setError('Không thể tạo dự án. Vui lòng thử lại sau.');
      }
      setLoading(false);
      throw err; // Re-throw để component có thể xử lý lỗi
    }
  };

  // Update project function
  const updateProject = async (project: Project): Promise<void> => {
    try {
      setLoading(true);
      
      // Chuyển đổi project sang ProjectFormData
      const projectData: Partial<ProjectFormData> = {
        project_name: project.project_name,
        description: project.description,
        status: project.status,
        start_date: project.start_date,
        end_date: project.end_date,
        manager: project.manager,
        progress: project.progress
      };
      
      await apiUpdateProject(Number(project.project_id), projectData);
      
      // Refresh lại danh sách dự án sau khi cập nhật
      await refreshProjects();
      
      // Hoặc cập nhật trực tiếp state để tránh gọi API lại
      // setProjects((prevProjects) =>
      //   prevProjects.map((p) =>
      //     p.project_id === project.project_id ? project : p
      //   )
      // );
      
      setLoading(false);
    } catch (err) {
      if (err instanceof Error) {
        setError(
          err.message || 'Không thể cập nhật dự án. Vui lòng thử lại sau.'
        );
      } else {
        setError('Không thể cập nhật dự án. Vui lòng thử lại sau.');
      }
      setLoading(false);
      throw err;
    }
  };

  // Delete project function
  const deleteProject = async (projectId: number): Promise<void> => {
    try {
      setLoading(true);
      await apiDeleteProject(projectId);
      
      // Cập nhật state trực tiếp để không phải gọi API lại
      setProjects((prevProjects) =>
        prevProjects.filter((project) => Number(project.project_id) !== projectId)
      );
      
      setLoading(false);
    } catch (err) {
      if (err instanceof Error) {
        setError(
          err.message || 'Không thể xóa dự án. Vui lòng thử lại sau.'
        );
      } else {
        setError('Không thể xóa dự án. Vui lòng thử lại sau.');
      }
      setLoading(false);
      throw err;
    }
  };

  // Get page numbers for pagination
  const getPageNumbers = (): (number | string)[] => {
    const pageNumbers: (number | string)[] = [];

    if (totalPages <= 7) {
      // If there are 7 or fewer pages, show all
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);

      // If current page is among the first 3 pages
      if (currentPage <= 3) {
        pageNumbers.push(2, 3, 4, '...', totalPages);
      }
      // If current page is among the last 3 pages
      else if (currentPage >= totalPages - 2) {
        pageNumbers.push(
          '...',
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      }
      // If current page is in the middle
      else {
        pageNumbers.push(
          '...',
          currentPage - 1,
          currentPage,
          currentPage + 1,
          '...',
          totalPages
        );
      }
    }

    return pageNumbers;
  };

  // Get project status options for filter
  const getProjectStatusOptions = (): StatusOption[] => {
    return Object.values(ProjectStatus).map((status) => ({
      value: status,
      label: status,
    }));
  };

  return {
    projects: filteredProjects,
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
    addProject,
    updateProject,
    getProjectStatusOptions,
    refreshProjects, // Export hàm refresh
  };
};