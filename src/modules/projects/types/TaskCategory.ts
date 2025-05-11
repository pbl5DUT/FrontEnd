
import { ReactNode } from "react";



  // types/TaskCategory.ts
export interface TaskCategory {
    id: string;
    name: string;
    description?: string;
    project_id: string;
    tasks_count: number;
    completed_tasks_count: number;
  }
  
  // types/Task.ts
  export interface Task {
    id: string;
    name: string;
    description?: string;
    category_id: string;
    category_name?: string;
    start_date: string;
    due_date: string;
    status: string;
    assignees: any[];
    // Thêm các field khác nếu cần
  }