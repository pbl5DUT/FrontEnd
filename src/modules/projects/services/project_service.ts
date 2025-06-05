import { Project, ProjectFormData } from '../types/project';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
const PROJECT_ENDPOINT = `${API_URL}/projects/`;

// Xử lý lỗi HTTP chung
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    try {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
    } catch (error) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  }

  return response.json();
};

// Lấy tất cả dự án
export const fetchProjects = async (): Promise<Project[]> => {
  try {
    const response = await fetch(PROJECT_ENDPOINT, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return handleResponse(response);
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
};

export const fetchUser_Projects = async (userId: string): Promise<Project[]> => {
  try {
    const response = await fetch(`${API_URL}/users/${userId}/projects/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const rawData = await response.json();
    const projects = rawData.projects ?? []; // 👈 lấy ra mảng dự án
    return Array.isArray(projects) ? projects : [];

  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
};


// Lấy thông tin chi tiết của một dự án
export const fetchProjectById = async (projectId: string): Promise<Project> => {
  try {
    const response = await fetch(`${PROJECT_ENDPOINT}${projectId}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return handleResponse(response);
  } catch (error) {
    console.error(`Error fetching project with ID ${projectId}:`, error);
    throw error;
  }
};

// Tạo dự án mới
export const createProject = async (projectData: ProjectFormData): Promise<Project> => {
  try {
    const response = await fetch(PROJECT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectData),
    });

    return handleResponse(response);
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
};

// Cập nhật dự án
export const updateProject = async (projectId: string, projectData: Partial<ProjectFormData>): Promise<Project> => {
  try {
    const response = await fetch(`${PROJECT_ENDPOINT}${projectId}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectData),
    });

    return handleResponse(response);
  } catch (error) {
    console.error(`Error updating project with ID ${projectId}:`, error);
    throw error;
  }
};

// Xóa dự án
export const deleteProject = async (projectId: string): Promise<void> => {
  try {
    const response = await fetch(`${PROJECT_ENDPOINT}${projectId}/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 204) return;

    return handleResponse(response);
  } catch (error) {
    console.error(`Error deleting project with ID ${projectId}:`, error);
    throw error;
  }
};

// Thêm 1 thành viên vào dự án (API chỉ nhận 1 user tại 1 thời điểm)
export const addProjectMember = async (projectId: string, userId: string, roleInProject: string ): Promise<Project> => {
  try {
    const response = await fetch(`${PROJECT_ENDPOINT}${projectId}/members/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        user_id: userId, 
        role_in_project: roleInProject 
      }),
    });

    return handleResponse(response);
  } catch (error) {
    console.error(`Error adding member to project with ID ${projectId}:`, error);
    throw error;
  }
};

// Thêm nhiều thành viên vào dự án (gọi API nhiều lần)
export const addProjectMembers = async (projectId: string, members: { user_id: string; role_in_project: string }[]): Promise<Project[]> => {
  try {
    const results: Project[] = [];
    
    for (const member of members) {
      const result = await addProjectMember(projectId, member.user_id, member.role_in_project);
      results.push(result);
    }
    
    return results;
  } catch (error) {
    console.error(`Error adding members to project with ID ${projectId}:`, error);
    throw error;
  }
};

// Backward compatibility - kept for existing code that uses userIds array
export const addProjectMembersLegacy = async (projectId: string, userIds: string[], role: string = 'Member'): Promise<Project[]> => {
  const members = userIds.map(userId => ({
    user_id: userId,
    role_in_project: role
  }));
  
  return addProjectMembers(projectId, members);
};

// Xóa thành viên khỏi dự án
export const removeProjectMember = async (projectId: string, userId: String): Promise<void> => {
  try {
    const response = await fetch(`${PROJECT_ENDPOINT}${projectId}/members/?user_id=${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 204) return;

    return handleResponse(response);
  } catch (error) {
    console.error(`Error removing member from project with ID ${projectId}:`, error);
    throw error;
  }
};

// Cập nhật vai trò của thành viên trong dự án
export const updateMemberRole = async (projectId: string, userId: number, role: string): Promise<Project> => {
  try {
    const response = await fetch(`${PROJECT_ENDPOINT}${projectId}/members/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role }),
    });

    return handleResponse(response);
  } catch (error) {
    console.error(`Error updating member role in project with ID ${projectId}:`, error);
    throw error;
  }
};

// Cập nhật trạng thái dự án
export const updateProjectStatus = async (projectId: string, status: string): Promise<Project> => {
  try {
    const response = await fetch(`${PROJECT_ENDPOINT}${projectId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    return handleResponse(response);
  } catch (error) {
    console.error(`Error updating status for project with ID ${projectId}:`, error);
    throw error;
  }
};
