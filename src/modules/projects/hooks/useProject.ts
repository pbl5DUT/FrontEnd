import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Project } from '@/modules/projects/types/project';
import {
  fetchProjectById,
  deleteProject as apiDeleteProject,
  removeProjectMember as apiRemoveProjectMember,
  updateProject as apiUpdateProject,
  addProjectMembers as apiAddProjectMembers,
} from '@/modules/projects/services/project_service';

interface UseProjectReturn {
  project: Project | null;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  handleDeleteProject: () => Promise<void>;
  handleRemoveMember: (userId: string) => Promise<void>;
  handleAddMembers: (userIds: number[], role?: string) => Promise<void>;
  handleUpdateProject: (updatedData: Partial<Project>) => Promise<void>;
}

export const useProject = (projectId: string | string[] | undefined): UseProjectReturn => {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!projectId || Array.isArray(projectId)) return;

    try {
      setLoading(true);
      setError(null);
      console.log('Fetching project with ID:', projectId);
      const projectData = await fetchProjectById(projectId);
      setProject(projectData);
    } catch (err) {
      console.error('Error fetching project:', err);
      if (err instanceof Error) {
        setError(err.message || 'Không thể tải dữ liệu dự án. Vui lòng thử lại sau.');
      } else {
        setError('Không thể tải dữ liệu dự án. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId && !Array.isArray(projectId)) {
      fetchData();
    }
  }, [projectId, fetchData]);

  const handleDeleteProject = async (): Promise<void> => {
    if (!projectId || Array.isArray(projectId) || !project) return;

    try {
      if (!window.confirm('Bạn có chắc muốn xóa dự án này?')) return;
      setLoading(true);
      await apiDeleteProject(projectId);
      router.push('/projects');
    } catch (err) {
      console.error('Error deleting project:', err);
      if (err instanceof Error) {
        alert(err.message || 'Không thể xóa dự án. Vui lòng thử lại sau.');
      } else {
        alert('Không thể xóa dự án. Vui lòng thử lại sau.');
      }
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string): Promise<void> => {
    if (!projectId || Array.isArray(projectId) || !project) return;

    try {
      setLoading(true);
      await apiRemoveProjectMember(projectId, Number(userId));
      await fetchData();
    } catch (err) {
      console.error('Error removing member:', err);
      if (err instanceof Error) {
        alert(err.message || 'Không thể xóa thành viên. Vui lòng thử lại sau.');
      } else {
        alert('Không thể xóa thành viên. Vui lòng thử lại sau.');
      }
      setLoading(false);
    }
  };

  const handleAddMembers = async (userIds: number[], role: string = 'Member'): Promise<void> => {
    if (!projectId || Array.isArray(projectId) || !project) return;

    try {
      setLoading(true);
      await apiAddProjectMembers(projectId, userIds, role);
      await fetchData();
    } catch (err) {
      console.error('Error adding members:', err);
      if (err instanceof Error) {
        alert(err.message || 'Không thể thêm thành viên. Vui lòng thử lại sau.');
      } else {
        alert('Không thể thêm thành viên. Vui lòng thử lại sau.');
      }
      setLoading(false);
    }
  };

  const handleUpdateProject = async (updatedData: Partial<Project>): Promise<void> => {
    if (!projectId || Array.isArray(projectId) || !project) return;

    try {
      setLoading(true);
      const formattedData = {
        ...updatedData,
        manager: updatedData.manager ? String(updatedData.manager) : undefined,
        members: updatedData.members?.map(member => String(member.id))
      };
      await apiUpdateProject(projectId, formattedData);
      await fetchData();
    } catch (err) {
      console.error('Error updating project:', err);
      if (err instanceof Error) {
        alert(err.message || 'Không thể cập nhật dự án. Vui lòng thử lại sau.');
      } else {
        alert('Không thể cập nhật dự án. Vui lòng thử lại sau.');
      }
      setLoading(false);
    }
  };

  return {
    project,
    loading,
    error,
    refreshData: fetchData,
    handleDeleteProject,
    handleRemoveMember,
    handleAddMembers,
    handleUpdateProject,
  };
};
