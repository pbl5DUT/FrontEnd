'use client';

import { useState, useEffect } from 'react';
import { Project, ProjectStatus, ProjectFormData } from '../types/project';
import {
  fetchProjects,
  updateProject as apiUpdateProject,
  deleteProject as apiDeleteProject,
  addProjectMembers,
  removeProjectMember,
  updateMemberRole,
  updateProjectStatus,
  fetchUser_Projects
} from '../services/project_service';
import { createProjectWithChatRoom } from '../services/project_chat_service';

import { getCurrentUser, isAuthenticated, UserRole } from '@/modules/auth/services/authService';

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
  deleteProject: (projectId: string) => Promise<void>;
  addProject: (project: ProjectFormData) => Promise<void>;
  updateProject: (project: Project) => Promise<void>;
  getProjectStatusOptions: () => StatusOption[];
  refreshProjects: () => Promise<void>;
  hasAccess: boolean;
}

export const useProjects = (): UseProjectsReturn => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [hasAccess, setHasAccess] = useState<boolean>(false);

  // Hàm để lấy dữ liệu từ API
  const getProjects = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    setProjects([]); // Reset projects về mảng rỗng
    setHasAccess(false);
    
    try {
      const isLoggedIn = isAuthenticated();
      console.log('📣 [AuthContext] Is authenticated:', isLoggedIn);

      // Nếu chưa đăng nhập
      if (!isLoggedIn) {
        setError('Vui lòng đăng nhập để xem dự án.');
        setLoading(false);
        return;
      }

      const currentUser = getCurrentUser();
      
      // Nếu không có thông tin user
      if (!currentUser) {
        setError('Không thể xác định thông tin người dùng.');
        setLoading(false);
        return;
      }

      let data: Project[] = [];
        console.log('📣 [AuthContext] Current user--------:', currentUser);
      // Xử lý theo role
      switch (currentUser.role) {
        case 'Admin':
          data = await fetchProjects();
          console.log('📊 Admin projects data:', data, 'Type:', typeof data, 'IsArray:', Array.isArray(data));
          setHasAccess(true);
          console.log('📣 [AuthContext] Current user--------:1');
          break;
          
        case 'Manage':
        case 'User':
          console.log('📣 [AuthContext] Current user--------:o');
          data = await fetchUser_Projects(String(currentUser.user_id));
          console.log('📊 User projects data:', data, 'Type:', typeof data, 'IsArray:', Array.isArray(data));
          setHasAccess(true);
          break;
          
        default:
          setError('Bạn không có quyền truy cập.');
          setLoading(false);
          return;
      }
console.log(' Current user--------:3', data);
      // Cập nhật state với dữ liệu nhận được
      const projectsArray = Array.isArray(data) ? data : [];
      console.log(' Current user--------:4', projectsArray);
      setProjects(projectsArray); // Đảm bảo luôn là mảng
      setTotalPages(Math.ceil(projectsArray.length / 10)); // Giả sử 10 items mỗi trang
      setLoading(false);

    } catch (err) {
      console.error('Error fetching projects:', err);
      setProjects([]); // Đảm bảo projects là mảng rỗng khi có lỗi
      setHasAccess(false);
      
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
  const filteredProjects = (Array.isArray(projects) ? projects : []).filter((project: Project) => {
    // Debug log to check projects state
    if (!Array.isArray(projects)) {
      console.error('🚨 Projects is not an array:', projects, 'Type:', typeof projects);
    }
    
    const matchesSearch =
      searchTerm === '' ||
      project.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === '' || project.status === statusFilter;

    return matchesSearch && matchesStatus;
  });
  // Add new project function - tạo cả project và chatroom
  const addProject = async (projectData: ProjectFormData): Promise<void> => {
    try {
      setLoading(true);
      
      // Sử dụng createProjectWithChatRoom thay vì createProject
      // Hàm này sẽ tạo cả project và chatroom tương ứng
      const newProject = await createProjectWithChatRoom(projectData);
      
      // Refresh lại danh sách dự án sau khi thêm
      await refreshProjects();
      
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
      throw err;
    }
  };

  // Update project function - cập nhật để phù hợp với body mới
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
        manager_id: project.manager.user_id, // Đổi từ manager thành manager_id
        progress: project.progress
        // Không gửi members trong phần cập nhật - xử lý riêng nếu cần
      };
      
      await apiUpdateProject(project.project_id, projectData);
      
      // Refresh lại danh sách dự án sau khi cập nhật
      await refreshProjects();
      
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
  const deleteProject = async (projectId: string): Promise<void> => {
    try {
      setLoading(true);
      await apiDeleteProject(projectId);
      
      // Cập nhật state trực tiếp để không phải gọi API lại
      setProjects((prevProjects) =>
        Array.isArray(prevProjects) 
          ? prevProjects.filter((project) => project.project_id !== projectId)
          : []
      );
      
      // Cập nhật lại totalPages sau khi xóa
      setTotalPages(prev => {
        const currentProjectsLength = Array.isArray(projects) ? projects.length : 0;
        const newProjectsLength = Math.max(0, currentProjectsLength - 1);
        return Math.ceil(newProjectsLength / 10);
      });
      
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
    refreshProjects,
    hasAccess,
  };
};