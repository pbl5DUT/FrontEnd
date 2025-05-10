
import { ReactNode } from "react";

export interface TaskCategory {
    id: string;
    name: string;
    description?: string;
    project_id: string;
    tasks_count: number;
    completed_tasks_count: number;
  }