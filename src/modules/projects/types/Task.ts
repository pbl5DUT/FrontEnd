
import { ReactNode } from "react";

// Định nghĩa các kiểu dữ liệu
export interface TaskAssignee {
    user_id: string;
    user: {
      id: string;
      full_name: string;
      avatar: string | null;
    };
    role: string;
    assigned_date: string;
  }
  
  export interface TaskComment {
    id: string;
    user: {
      id: string;
      full_name: string;
      avatar: string | null;
    };
    content: string;
    created_at: string;
  }
  
  export  interface TaskAttachment {
    id: string;
    name: string;
    file_type: string;
    file_size: string;
    uploaded_by: string;
    upload_date: string;
    url: string;
  }
  
  export interface Task {
    id: string;
    name: string;
    description: string;
    category_id: string;
    category_name: string;
    status: 'Todo' | 'In Progress' | 'Review' | 'Done';
    priority: 'Low' | 'Medium' | 'High' | 'Urgent';
    start_date: string;
    due_date: string;
    created_at: string;
    updated_at: string;
    assignees: TaskAssignee[];
    comments: TaskComment[];
    attachments: TaskAttachment[];
  }