import { Project, ProjectFormData } from '../types/project';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
const PROJECT_ENDPOINT = `${API_URL}/projects/`;

// Xử lý lỗi HTTP chung
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    // Cố gắng để lấy thông báo lỗi từ API nếu có
    try {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
    } catch (error) {
      // Nếu không parse được JSON, ném lỗi với status code
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  }
  
  return response.json();
};


//
// Lấy tất cả dự án
export const fetchProjects = async (): Promise<Project[]> => {
  try {
    console.log('Fetching projects from 00:', PROJECT_ENDPOINT);
    const response = await fetch( PROJECT_ENDPOINT, {
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

// Lấy thông tin chi tiết của một dự án
export const fetchProjectById = async (projectId: number): Promise<Project> => {
  try {
    const response = await fetch(`${PROJECT_ENDPOINT}/${projectId}`, {
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
export const updateProject = async (projectId: number, projectData: Partial<ProjectFormData>): Promise<Project> => {
  try {
    const response = await fetch(`${PROJECT_ENDPOINT}/${projectId}`, {
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
export const deleteProject = async (projectId: number): Promise<void> => {
  try {
    const response = await fetch(`${PROJECT_ENDPOINT}/${projectId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Nếu API trả về 204 No Content, không cần parse JSON
    if (response.status === 204) {
      return;
    }
    
    return handleResponse(response);
  } catch (error) {
    console.error(`Error deleting project with ID ${projectId}:`, error);
    throw error;
  }
};

// Thêm thành viên vào dự án
export const addProjectMembers = async (projectId: number, userIds: number[], role: string = 'Member'): Promise<Project> => {
  try {
    const response = await fetch(`${PROJECT_ENDPOINT}/${projectId}/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_ids: userIds,
        role: role
      }),
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error(`Error adding members to project with ID ${projectId}:`, error);
    throw error;
  }
};

// Xóa thành viên khỏi dự án
export const removeProjectMember = async (projectId: number, userId: number): Promise<void> => {
  try {
    const response = await fetch(`${PROJECT_ENDPOINT}/${projectId}/members/${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.status === 204) {
      return;
    }
    
    return handleResponse(response);
  } catch (error) {
    console.error(`Error removing member from project with ID ${projectId}:`, error);
    throw error;
  }
};

// Cập nhật vai trò của thành viên trong dự án
export const updateMemberRole = async (projectId: number, userId: number, role: string): Promise<Project> => {
  try {
    const response = await fetch(`${PROJECT_ENDPOINT}/${projectId}/members/${userId}`, {
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
export const updateProjectStatus = async (projectId: number, status: string): Promise<Project> => {
  try {
    const response = await fetch(`${PROJECT_ENDPOINT}/${projectId}/status`, {
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