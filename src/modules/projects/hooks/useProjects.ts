'use client';

import { useState, useEffect } from 'react';
import { Project, ProjectStatus, ProjectFormData } from '../types/project';

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
  deleteProject: (projectId: string) => void;
  addProject: (project: ProjectFormData) => void;
  updateProject: (project: Project) => void;
  getProjectStatusOptions: () => StatusOption[];
}

// This would typically be fetched from an API - mock data structure matching your API
const mockProjects: Project[] = [
  {
    project_id: 'PRJ-24070810-4798',
    project_name: 'Dự án TeleMedical',
    description: 'Phát triển dự án Telemedicine.',
    start_date: '31/07/2024',
    end_date: '28/02/2025',
    status: 'Phát triển',
    progress: 46,
    manager: 'Hoàng Nguyễn Vũ',
    members: [
      {
        user: {
          id: '1',
          username: 'vu.hoang',
          full_name: 'Hoàng Nguyễn Vũ',
          email: 'vu.hoang@example.com',
          avatar: null,
        },
        role_in_project: 'Người tạo',
      },
      {
        user: {
          id: '2',
          username: 'huong.hoang',
          full_name: 'Hoàng Ngọc Thiên Hương',
          email: 'huong.hoang@example.com',
          avatar: null,
        },
        role_in_project: 'Giám sát',
      },
      {
        user: {
          id: '3',
          username: 'nhi.dang',
          full_name: 'Đặng Minh Nhi',
          email: 'nhi.dang@example.com',
          avatar: null,
        },
        role_in_project: 'Giám sát',
      },
      {
        user: {
          id: '4',
          username: 'lian',
          full_name: 'Trần Lian',
          email: 'lian@example.com',
          avatar: null,
        },
        role_in_project: 'Người tạo',
      },
    ],
    tasks: [
      {
        task_id: 'TASK-001',
        task_name: 'Kiểm tra lưỡng dữ liệu của các đơn xuất nhập kho',
        description:
          'Kiểm tra và xác minh tính chính xác của dữ liệu trong các đơn xuất nhập kho',
        status: 'Phát triển',
        priority: 'Cao',
        assignee: 'Trần Lian',
        start_date: '01/04/2025',
        due_date: '06/04/2025',
        progress: 65,
      },
      {
        task_id: 'TASK-002',
        task_name: 'Thiết kế giao diện người dùng cho ứng dụng di động',
        description: 'Thiết kế UI/UX cho ứng dụng di động của bệnh nhân',
        status: 'Đóng',
        priority: 'Cao',
        assignee: 'Đặng Minh Nhi',
        start_date: '01/03/2025',
        due_date: '15/03/2025',
        actual_end_date: '14/03/2025',
        progress: 100,
      },
    ],
    files: [
      {
        id: 'file-1',
        name: 'API - HIS.zip',
        type: 'zip',
        size: '582 KB',
        uploaded_by: 'Hoàng Nguyễn Vũ',
        upload_date: '15/08/2024',
        url: '#',
      },
      {
        id: 'file-2',
        name: 'Text và link gh...docx',
        type: 'docx',
        size: '17 KB',
        uploaded_by: 'Hoàng Ngọc Thiên Hương',
        upload_date: '20/08/2024',
        url: '#',
      },
    ],
    comments: [
      {
        id: 'comment-1',
        user: {
          id: '1',
          username: 'hoang.tran',
          full_name: 'Hoàng Trần',
          email: 'hoang.tran@example.com',
          avatar: null,
        },
        content: 'Làm việc ở Đại học PCT',
        date: '22/09/2024 16:15:43',
      },
      {
        id: 'comment-2',
        user: {
          id: '1',
          username: 'hoang.tran',
          full_name: 'Hoàng Trần',
          email: 'hoang.tran@example.com',
          avatar: null,
        },
        content: 'Họp ngày 12/09',
        date: '13/09/2024 08:31:13',
      },
      {
        id: 'comment-3',
        user: {
          id: '1',
          username: 'hoang.tran',
          full_name: 'Hoàng Trần',
          email: 'hoang.tran@example.com',
          avatar: null,
        },
        content: 'Link drive ghi âm cuộc họp với bên bệnh viện',
        date: '09/09/2024 00:19:05',
      },
    ],
    stats: {
      total_tasks: 69,
      completed_tasks: 46,
      in_progress: 10,
      pending_tasks: 8,
      delayed_tasks: 5,
    },
    created_at: '31/07/2024',
    updated_at: '01/05/2025',
  },
];

export const useProjects = (): UseProjectsReturn => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  useEffect(() => {
    // Simulating API fetch that will be replaced by real API call
    const fetchProjects = async (): Promise<void> => {
      try {
        // In a real app, this would be replaced with:
        // const data = await projectService.fetchProjects();
        await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay
        setProjects(mockProjects);
        setTotalPages(Math.ceil(mockProjects.length / 10));
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

    fetchProjects();
  }, []);

  // Filtered projects based on search term and status filter
  const filteredProjects = projects.filter((project: Project) => {
    const matchesSearch =
      searchTerm === '' ||
      project.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === '' || project.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Add new project function
  const addProject = (newProject: ProjectFormData): void => {
    // In a real app, this would be replaced with an API call
    // const response = await projectService.createProject(newProject);

    // Generate a unique ID for the new project
    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(
      today.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}/${today.getFullYear()}`;

    const projectId = `PRJ-${Math.floor(Math.random() * 10000000)
      .toString()
      .padStart(8, '0')}`;

    const project: Project = {
      ...newProject,
      project_id: projectId,
      created_at: formattedDate,
      updated_at: formattedDate,
      members: [],
      tasks: [],
      files: [],
      comments: [],
      stats: {
        total_tasks: 0,
        completed_tasks: 0,
        in_progress: 0,
        pending_tasks: 0,
        delayed_tasks: 0,
      },
    };

    setProjects((prevProjects) => [project, ...prevProjects]);
  };

  // Update project function
  const updateProject = (updatedProject: Project): void => {
    // In a real app, this would be replaced with an API call
    // await projectService.updateProject(updatedProject.project_id, updatedProject);

    setProjects((prevProjects) =>
      prevProjects.map((project) =>
        project.project_id === updatedProject.project_id
          ? {
              ...updatedProject,
              updated_at: new Date().toLocaleDateString('en-GB'),
            }
          : project
      )
    );
  };

  // Delete project function
  const deleteProject = (projectId: string): void => {
    // In a real app, this would be replaced with an API call
    // await projectService.deleteProject(projectId);

    setProjects((prevProjects) =>
      prevProjects.filter((project) => project.project_id !== projectId)
    );
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
  };
};
