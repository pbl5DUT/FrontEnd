// import { useState, useEffect, useCallback } from 'react';
// import { Project, ProjectStatus } from '../types/project';
// import { 
//   fetchProjects, 
//   deleteProject as apiDeleteProject, 
//   updateProjectStatus 
// } from '../services/project_service';

// export const useProjects = () => {
//   const [projects, setProjects] = useState<Project[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [statusFilter, setStatusFilter] = useState<string>('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const projectsPerPage = 10;

//   // Fetch dự án từ API
//   useEffect(() => {
//     const getProjects = async () => {
//       try {
//         setLoading(true);
//         const data = await fetchProjects();
        
//         // Thêm giá trị progress mặc định nếu API không trả về
//         const projectsWithProgress = data.map(project => ({
//           ...project,
//           progress: project.progress || calculateProgress(project)
//         }));
        
//         setProjects(projectsWithProgress);
//         setError(null);
//       } catch (err) {
//         setError('Không thể tải dữ liệu dự án. Vui lòng thử lại sau.');
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     getProjects();
//   }, []);

//   // Hàm tính toán progress dựa vào status nếu API không trả về trường progress
//   const calculateProgress = (project: Project): number => {
//     switch (project.status) {
//       case ProjectStatus.COMPLETED:
//         return 100;
//       case ProjectStatus.ONGOING:
//         return 50; // Mặc định cho dự án đang tiến hành
//       case ProjectStatus.PLANNING:
//         return 10;
//       case ProjectStatus.ON_HOLD:
//         return 30;
//       case ProjectStatus.CANCELLED:
//         return 0;
//       default:
//         return 0;
//     }
//   };

//   // Lọc dự án theo từ khóa tìm kiếm và trạng thái
//   const filteredProjects = projects.filter(project => {
//     const matchesSearchTerm = 
//       project.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       project.manager.toLowerCase().includes(searchTerm.toLowerCase());
    
//     const matchesStatus = statusFilter === '' || project.status === statusFilter;
    
//     return matchesSearchTerm && matchesStatus;
//   });

//   // Tính tổng số trang
//   const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);

//   // Lấy dự án cho trang hiện tại
//   const currentProjects = filteredProjects.slice(
//     (currentPage - 1) * projectsPerPage,
//     currentPage * projectsPerPage
//   );

//   // Hàm tạo mảng số trang để hiển thị phân trang
//   const getPageNumbers = useCallback(() => {
//     const pageNumbers = [];
    
//     if (totalPages <= 5) {
//       for (let i = 1; i <= totalPages; i++) {
//         pageNumbers.push(i);
//       }
//     } else {
//       if (currentPage <= 3) {
//         pageNumbers.push(1, 2, 3, 4, '...', totalPages);
//       } else if (currentPage >= totalPages - 2) {
//         pageNumbers.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
//       } else {
//         pageNumbers.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
//       }
//     }
    
//     return pageNumbers;
//   }, [currentPage, totalPages]);

//   // Xóa dự án
//   const deleteProject = useCallback(async (projectId: number) => {
//     try {
//       await apiDeleteProject(projectId);
//       setProjects(prevProjects => prevProjects.filter(project => project.project_id !== projectId));
//     } catch (err) {
//       setError('Không thể xóa dự án. Vui lòng thử lại sau.');
//       console.error(err);
//     }
//   }, []);

//   // Thêm dự án mới vào state
//   const addProject = useCallback((newProject: Project) => {
//     setProjects(prevProjects => [...prevProjects, newProject]);
//   }, []);

//   // Cập nhật dự án trong state
//   const updateProject = useCallback((updatedProject: Project) => {
//     setProjects(prevProjects => 
//       prevProjects.map(project => 
//         project.project_id === updatedProject.project_id ? updatedProject : project
//       )
//     );
//   }, []);

//   // Cập nhật trạng thái dự án
//   const changeProjectStatus = useCallback(async (projectId: number, status: string) => {
//     try {
//       const updatedProject = await updateProjectStatus(projectId, status);
//       updateProject(updatedProject);
//     } catch (err) {
//       setError('Không thể cập nhật trạng thái dự án. Vui lòng thử lại sau.');
//       console.error(err);
//     }
//   }, [updateProject]);

//   // Lấy danh sách trạng thái dự án cho dropdown
//   const getProjectStatusOptions = useCallback(() => {
//     return Object.values(ProjectStatus).map(status => ({
//       label: status,
//       value: status
//     }));
//   }, []);

//   return {
//     projects: currentProjects,
//     allProjects: projects, // Để sử dụng trong trường hợp cần toàn bộ danh sách
//     loading,
//     error,
//     searchTerm,
//     setSearchTerm,
//     statusFilter,
//     setStatusFilter,
//     currentPage,
//     setCurrentPage,
//     totalPages,
//     getPageNumbers,
//     deleteProject,
//     addProject,
//     updateProject,
//     changeProjectStatus,
//     getProjectStatusOptions
//   };
// };