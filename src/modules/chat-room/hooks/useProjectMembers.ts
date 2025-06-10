import { useState, useEffect, useCallback } from 'react';
import axios from '@/services/axiosInstance';

export interface ProjectMember {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  projectId: string;
  projectName: string;
}

/**
 * Hook để lấy danh sách tất cả thành viên trong các project của người dùng hiện tại
 * @param userId ID của người dùng hiện tại
 * @returns Danh sách thành viên trong tất cả project của người dùng
 */
export const useProjectMembers = (userId: string) => {
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjectMembers = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
        // 1. Lấy danh sách các project của người dùng
      // Đảm bảo ID người dùng có định dạng "user-X"
      const formattedUserId = userId.startsWith('user-') ? userId : `user-${userId}`;
      const response = await axios.get(`/users/${formattedUserId}/projects/`);
      const projects = response.data.projects || [];
      
      if (!Array.isArray(projects) || projects.length === 0) {
        setMembers([]);
        return;
      }

      // 2. Lấy thông tin chi tiết của từng project để truy cập thành viên
      const allMembers: ProjectMember[] = [];
      
      await Promise.all(projects.map(async (project: any) => {
        try {
          // Gọi API lấy chi tiết project
          const projectResponse = await axios.get(`/projects/${project.project_id}/`);
          const projectDetail = projectResponse.data;
          
          // Xử lý danh sách thành viên
          if (projectDetail.members && Array.isArray(projectDetail.members)) {
            const projectMembers = projectDetail.members.map((member: any) => ({
              id: member.user.user_id,
              name: member.user.full_name || member.user.email.split('@')[0] || 'Người dùng',
              email: member.user.email,
              avatar: member.user.avatar,
              projectId: projectDetail.project_id,
              projectName: projectDetail.project_name
            }));
            
            allMembers.push(...projectMembers);
          }
          
          // Thêm manager nếu có
          if (projectDetail.manager && projectDetail.manager.user_id) {
            allMembers.push({
              id: projectDetail.manager.user_id,
              name: projectDetail.manager.full_name || projectDetail.manager.email.split('@')[0] || 'Quản lý',
              email: projectDetail.manager.email,
              avatar: projectDetail.manager.avatar,
              projectId: projectDetail.project_id,
              projectName: projectDetail.project_name
            });
          }
        } catch (err) {
          console.error(`Lỗi khi lấy chi tiết project ${project.project_id}:`, err);
        }
      }));
      
      // Loại bỏ người dùng trùng lặp
      const uniqueMembers = allMembers.reduce((acc: ProjectMember[], current) => {
        // Kiểm tra xem người dùng đã tồn tại trong kết quả chưa
        const isDuplicate = acc.some(item => item.id === current.id);
        // Kiểm tra xem có phải là người dùng hiện tại không
        const isCurrentUser = current.id === userId;
        
        if (!isDuplicate && !isCurrentUser) {
          return [...acc, current];
        }
        return acc;
      }, []);
      
      setMembers(uniqueMembers);
      setError(null);
    } catch (err) {
      console.error('Lỗi khi lấy thành viên project:', err);
      setError('Không thể tải danh sách thành viên project');
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProjectMembers();
  }, [fetchProjectMembers]);

  return {
    members,
    loading,
    error,
    refresh: fetchProjectMembers
  };
};
