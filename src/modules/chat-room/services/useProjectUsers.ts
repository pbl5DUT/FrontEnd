import { useState, useEffect, useCallback } from 'react';
import axios from '@/services/axiosInstance';

export interface ProjectUser {
  id: number;
  name: string;
  avatar?: string;
  isOnline: boolean;
  email?: string;
  projectId?: number;
  projectName?: string;
}

/**
 * Hook để lấy danh sách người dùng trong các dự án
 * @param userId User ID của người dùng hiện tại
 */
const useProjectUsers = (userId: number) => {
  const [projectUsers, setProjectUsers] = useState<ProjectUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Lấy danh sách người dùng trong các dự án mà người dùng hiện tại tham gia
  const fetchProjectUsers = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      // Gọi API lấy danh sách dự án mà người dùng tham gia
      const { data: projects } = await axios.get('/projects/user-projects/');
      
      const allUsers: ProjectUser[] = [];
      // Lấy danh sách thành viên cho từng dự án
      await Promise.all(projects.map(async (project: any) => {
        try {
          const { data: users } = await axios.get(`/projects/${project.id}/members/`);
          
          // Lọc ra những người dùng không trùng với người dùng hiện tại
          const projectMembers = users
            .filter((user: any) => user.id !== userId)
            .map((user: any) => ({
              id: user.id,
              name: user.name || user.username || 'Người dùng',
              avatar: user.avatar,
              isOnline: !!user.isOnline,
              email: user.email,
              projectId: project.id,
              projectName: project.name
            }));
            
          allUsers.push(...projectMembers);
        } catch (err) {
          console.error(`Error fetching members for project ${project.id}:`, err);
        }
      }));

      // Loại bỏ các người dùng trùng lặp (có thể có trong nhiều dự án)
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
