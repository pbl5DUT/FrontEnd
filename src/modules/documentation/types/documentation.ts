/**
 * Định nghĩa các kiểu dữ liệu cho tài liệu dự án
 */

export enum DocumentType {
  PDF = 'PDF',
  MARKDOWN = 'MARKDOWN',
  WORD = 'WORD',
  EXCEL = 'EXCEL',
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  OTHER = 'OTHER',
}

export interface Document {
  id: string;
  title: string;
  description?: string;
  type: DocumentType;
  url: string;
  folderId: string;
  projectId?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  size?: number; // Kích thước tệp tin (byte)
  version?: string; // Phiên bản tài liệu
  tags?: string[]; // Tags để phân loại tài liệu
  thumbnailUrl?: string; // URL hình thumbnail (nếu có)
  isPublic: boolean; // Tài liệu công khai hay bị giới hạn
}

export interface Folder {
  id: string;
  name: string;
  parentId?: string; // ID của thư mục cha (nếu có)
  projectId?: string; // ID dự án mà thư mục thuộc về
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isExpanded?: boolean; // Trạng thái thư mục (mở rộng hay thu gọn)
  children?: Folder[]; // Danh sách các thư mục con
}

export interface DocumentComment {
  id: string;
  documentId: string;
  content: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  version: string;
  url: string;
  createdBy: string;
  createdAt: Date;
  changes?: string; // Mô tả những thay đổi trong phiên bản này
}

export enum DocumentPermission {
  VIEW = 'VIEW',
  EDIT = 'EDIT',
  DELETE = 'DELETE',
  SHARE = 'SHARE',
  MANAGE = 'MANAGE',
}

export interface DocumentAccess {
  documentId: string;
  userId: string;
  permissions: DocumentPermission[];
}
