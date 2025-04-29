// Định nghĩa kiểu dữ liệu User
export interface User {
    user_id: number;
    full_name: string;
    email: string;
    role: string;
    department: string;
    gender: string;
    birth_date: string;
    phone: string;
    province: string;
    district: string;
    address: string;
    position: string;
    avatar: string | null;
    created_at: string;
    enterprise: {
      EnterpriseID: number;
      Name: string;
      Address: string;
      PhoneNumber: string;
      Email: string;
      Industry: string;
    };
  }
  
  // Định nghĩa kiểu dữ liệu ProjectMember
  export interface ProjectMember {
    user: User;
    role_in_project: string;
  }
  
  // Định nghĩa kiểu dữ liệu Project
  export interface Project {
    project_id: number;
    project_name: string;
    description: string;
    status: string;
    start_date: string;
    end_date: string;
    manager: string;
    members: ProjectMember[];
    progress?: number; // Thêm trường này nếu API của bạn có trả về
  }
  
  // Kiểu dữ liệu để sử dụng khi tạo/cập nhật Project
  export type ProjectFormData = Omit<Project, 'project_id' | 'members'> & {
    member_ids?: number[]; // Danh sách ID thành viên để thêm vào dự án
  };
  
  // Enum định nghĩa các trạng thái dự án
  export enum ProjectStatus {
    ONGOING = 'Ongoing',
    ON_HOLD = 'On Hold',
    COMPLETED = 'Completed',
    CANCELLED = 'Cancelled',
    PLANNING = 'Planning'
  }
  
  // Enum định nghĩa vai trò trong dự án
  export enum ProjectRole {
    MANAGER = 'Manager',
    MEMBER = 'Member',
    SUPPORT = 'Support'
  }