import { useState, useEffect, useCallback } from 'react';
import axios from '@/services/axiosInstance';
import { fetchUser_Projects } from '@/modules/projects/services/project_service';

export interface ProjectUser {
  id: number | string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  email?: string;
  projectId?: string | number;
  projectName?: string;
}

/**
 * Hook để lấy danh sách người dùng trong các dự án
 * @param userId User ID của người dùng hiện tại
 */
const useProjectUsers = (userId: string) => {
  const [projectUsers, setProjectUsers] = useState<ProjectUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Lấy danh sách người dùng trong các dự án mà người dùng hiện tại tham gia
  const fetchProjectUsers = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      
      // 1. Lấy danh sách các dự án mà người dùng tham gia
      const projects = await fetchUser_Projects(userId);
      
      // 2. Lấy thông tin chi tiết của từng dự án để truy cập danh sách thành viên
      const allUsers: ProjectUser[] = [];
      
      await Promise.all(projects.map(async (project: any) => {
        try {
          // Gọi API lấy chi tiết dự án
          const response = await axios.get(`/projects/${project.project_id}`);
          const projectDetail = response.data;
          
          // Lấy danh sách thành viên từ chi tiết dự án
          if (projectDetail.members && Array.isArray(projectDetail.members)) {
            const projectMembers = projectDetail.members
              // Lọc ra những người dùng không trùng với người dùng hiện tại
              .filter((member: any) => member.user.user_id !== userId)
              .map((member: any) => ({
                id: member.user.user_id,
                name: member.user.full_name || member.user.email.split('@')[0] || 'Người dùng',
                avatar: member.user.avatar,
                isOnline: false, // Mặc định là offline, cần cập nhật từ websocket nếu có
                email: member.user.email,
                projectId: project.project_id,
                projectName: project.project_name || projectDetail.project_name
              }));
              
            allUsers.push(...projectMembers);
          }
        } catch (err) {
          console.error(`Error fetching details for project ${project.project_id}:`, err);
        }
      }));
      
      // Loại bỏ các người dùng trùng lặp
      const uniqueUsers = allUsers.reduce((acc: ProjectUser[], current) => {
        const x = acc.find(item => item.id === current.id);
        if (!x) {
          return acc.concat([current]);
        } else {
          return acc;
        }
      }, []);

      setProjectUsers(uniqueUsers);
      setError(null);
    } catch (err) {
      console.error('Error fetching project users:', err);
      setError('Không thể tải danh sách người dùng dự án');
      setProjectUsers([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProjectUsers();
  }, [fetchProjectUsers]);
  
  return {
    projectUsers,
    loading,
    error,
    refreshProjectUsers: fetchProjectUsers
  };
};

export default useProjectUsers;