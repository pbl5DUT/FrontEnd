// Comment interface
export interface TaskComment {
    id: string;
    content: string;
    user_id: string;
    user_name: string;
    created_at: string;
    parent_comment_id?: string;
  }