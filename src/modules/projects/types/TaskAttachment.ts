// Attachment interface
export interface TaskAttachment {
  id: string;
  name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
  uploaded_by_id: string;
}