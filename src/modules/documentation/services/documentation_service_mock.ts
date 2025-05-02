import {
  Document,
  DocumentType,
  Folder,
  DocumentComment,
  DocumentVersion,
} from '../types/documentation';
import { v4 as uuidv4 } from 'uuid';

// Dữ liệu giả cho các thư mục
export const mockFolders: Folder[] = [
  {
    id: 'folder-1',
    name: 'Tài liệu thiết kế',
    createdBy: 'user-1',
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-01-15'),
    isExpanded: true,
  },
  {
    id: 'folder-2',
    name: 'Tài liệu kỹ thuật',
    createdBy: 'user-2',
    createdAt: new Date('2023-02-10'),
    updatedAt: new Date('2023-02-10'),
    isExpanded: false,
  },
  {
    id: 'folder-3',
    name: 'Tài liệu người dùng',
    createdBy: 'user-1',
    createdAt: new Date('2023-03-05'),
    updatedAt: new Date('2023-03-05'),
    isExpanded: false,
  },
  {
    id: 'folder-4',
    name: 'Báo cáo',
    parentId: 'folder-1',
    createdBy: 'user-3',
    createdAt: new Date('2023-03-20'),
    updatedAt: new Date('2023-03-20'),
    isExpanded: false,
  },
  {
    id: 'folder-5',
    name: 'API Documentation',
    parentId: 'folder-2',
    createdBy: 'user-2',
    createdAt: new Date('2023-04-15'),
    updatedAt: new Date('2023-04-15'),
    isExpanded: false,
  },
];

// Dữ liệu giả cho các tài liệu
export const mockDocuments: Document[] = [
  {
    id: 'document-1',
    title: 'System Architecture.pdf',
    description: 'Tài liệu mô tả kiến trúc hệ thống',
    type: DocumentType.PDF,
    url: '/documents/system-architecture.pdf',
    folderId: 'folder-1',
    projectId: 'project-1',
    createdBy: 'user-1',
    createdAt: new Date('2023-01-20'),
    updatedAt: new Date('2023-01-20'),
    size: 2500000,
    version: '1.0.0',
    tags: ['architecture', 'design', 'system'],
    isPublic: true,
  },
  {
    id: 'document-2',
    title: 'API Reference.md',
    description: 'Tài liệu tham khảo API',
    type: DocumentType.MARKDOWN,
    url: '/documents/api-reference.md',
    folderId: 'folder-5',
    projectId: 'project-2',
    createdBy: 'user-2',
    createdAt: new Date('2023-04-18'),
    updatedAt: new Date('2023-04-20'),
    size: 150000,
    version: '1.2.0',
    tags: ['api', 'reference', 'development'],
    isPublic: true,
  },
  {
    id: 'document-3',
    title: 'User Guide.docx',
    description: 'Hướng dẫn sử dụng cho người dùng',
    type: DocumentType.WORD,
    url: '/documents/user-guide.docx',
    folderId: 'folder-3',
    projectId: 'project-1',
    createdBy: 'user-3',
    createdAt: new Date('2023-03-10'),
    updatedAt: new Date('2023-03-15'),
    size: 1800000,
    version: '2.0.0',
    tags: ['user guide', 'help', 'documentation'],
    isPublic: true,
  },
  {
    id: 'document-4',
    title: 'Project Timeline.xlsx',
    description: 'Timeline và lịch trình dự án',
    type: DocumentType.EXCEL,
    url: '/documents/project-timeline.xlsx',
    folderId: 'folder-4',
    projectId: 'project-3',
    createdBy: 'user-1',
    createdAt: new Date('2023-03-22'),
    updatedAt: new Date('2023-03-25'),
    size: 750000,
    version: '1.1.0',
    tags: ['timeline', 'schedule', 'planning'],
    isPublic: false,
  },
  {
    id: 'document-5',
    title: 'Database Schema.png',
    description: 'Sơ đồ cơ sở dữ liệu',
    type: DocumentType.IMAGE,
    url: '/documents/database-schema.png',
    folderId: 'folder-2',
    projectId: 'project-2',
    createdBy: 'user-2',
    createdAt: new Date('2023-02-15'),
    updatedAt: new Date('2023-02-15'),
    size: 500000,
    version: '1.0.0',
    tags: ['database', 'schema', 'design'],
    thumbnailUrl: '/documents/thumbnails/database-schema-thumb.png',
    isPublic: true,
  },
  {
    id: 'document-6',
    title: 'Installation Guide.md',
    description: 'Hướng dẫn cài đặt hệ thống',
    type: DocumentType.MARKDOWN,
    url: '/documents/installation-guide.md',
    folderId: 'folder-2',
    projectId: 'project-1',
    createdBy: 'user-1',
    createdAt: new Date('2023-02-20'),
    updatedAt: new Date('2023-02-22'),
    size: 120000,
    version: '1.0.1',
    tags: ['installation', 'setup', 'guide'],
    isPublic: true,
  },
];

// Dữ liệu giả cho các bình luận về tài liệu
export const mockComments: DocumentComment[] = [
  {
    id: 'comment-1',
    documentId: 'document-1',
    content: 'Cần cập nhật phần kiến trúc microservices.',
    userId: 'user-2',
    createdAt: new Date('2023-01-25'),
    updatedAt: new Date('2023-01-25'),
  },
  {
    id: 'comment-2',
    documentId: 'document-1',
    content: 'Đã thêm phần bảo mật vào tài liệu.',
    userId: 'user-1',
    createdAt: new Date('2023-01-28'),
    updatedAt: new Date('2023-01-28'),
  },
  {
    id: 'comment-3',
    documentId: 'document-3',
    content: 'Hướng dẫn rất dễ hiểu, cảm ơn!',
    userId: 'user-3',
    createdAt: new Date('2023-03-18'),
    updatedAt: new Date('2023-03-18'),
  },
];

// Dữ liệu giả cho các phiên bản tài liệu
export const mockVersions: DocumentVersion[] = [
  {
    id: 'version-1',
    documentId: 'document-1',
    version: '1.0.0',
    url: '/documents/versions/system-architecture-1.0.0.pdf',
    createdBy: 'user-1',
    createdAt: new Date('2023-01-20'),
    changes: 'Phiên bản đầu tiên.',
  },
  {
    id: 'version-2',
    documentId: 'document-1',
    version: '1.1.0',
    url: '/documents/versions/system-architecture-1.1.0.pdf',
    createdBy: 'user-2',
    createdAt: new Date('2023-02-05'),
    changes: 'Thêm phần kiến trúc microservices.',
  },
  {
    id: 'version-3',
    documentId: 'document-2',
    version: '1.0.0',
    url: '/documents/versions/api-reference-1.0.0.md',
    createdBy: 'user-2',
    createdAt: new Date('2023-04-18'),
    changes: 'Phiên bản đầu tiên.',
  },
  {
    id: 'version-4',
    documentId: 'document-2',
    version: '1.1.0',
    url: '/documents/versions/api-reference-1.1.0.md',
    createdBy: 'user-2',
    createdAt: new Date('2023-04-19'),
    changes: 'Thêm API endpoints mới.',
  },
  {
    id: 'version-5',
    documentId: 'document-2',
    version: '1.2.0',
    url: '/documents/versions/api-reference-1.2.0.md',
    createdBy: 'user-2',
    createdAt: new Date('2023-04-20'),
    changes: 'Cập nhật ví dụ và sửa lỗi.',
  },
];

// Dữ liệu giả về người dùng
export const mockUsers = [
  { id: 'user-1', name: 'Nguyễn Văn A' },
  { id: 'user-2', name: 'Trần Thị B' },
  { id: 'user-3', name: 'Lê Minh C' },
];

// Dữ liệu giả về dự án
export const mockProjects = [
  { id: 'project-1', name: 'Website Bán hàng' },
  { id: 'project-2', name: 'App Mobile Giao hàng' },
  { id: 'project-3', name: 'Hệ thống Quản lý Nhân sự' },
];

/**
 * Lấy danh sách tất cả các thư mục
 */
export const fetchFolders = async (): Promise<Folder[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...mockFolders]);
    }, 500);
  });
};

/**
 * Lấy danh sách tài liệu trong một thư mục
 */
export const fetchDocumentsByFolder = async (
  folderId: string
): Promise<Document[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const filteredDocuments = folderId
        ? mockDocuments.filter((doc) => doc.folderId === folderId)
        : mockDocuments;
      resolve([...filteredDocuments]);
    }, 500);
  });
};

/**
 * Lấy thông tin chi tiết về một tài liệu
 */
export const fetchDocumentById = async (
  documentId: string
): Promise<Document | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const document =
        mockDocuments.find((doc) => doc.id === documentId) || null;
      resolve(document);
    }, 300);
  });
};

/**
 * Lấy danh sách bình luận về một tài liệu
 */
export const fetchCommentsByDocument = async (
  documentId: string
): Promise<DocumentComment[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const filteredComments = mockComments.filter(
        (comment) => comment.documentId === documentId
      );
      resolve([...filteredComments]);
    }, 400);
  });
};

/**
 * Lấy lịch sử phiên bản của một tài liệu
 */
export const fetchDocumentVersions = async (
  documentId: string
): Promise<DocumentVersion[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const filteredVersions = mockVersions
        .filter((version) => version.documentId === documentId)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      resolve([...filteredVersions]);
    }, 400);
  });
};

/**
 * Tìm kiếm tài liệu
 */
export const searchDocuments = async (query: string): Promise<Document[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const normalizedQuery = query.toLowerCase();
      const results = mockDocuments.filter((doc) => {
        return (
          doc.title.toLowerCase().includes(normalizedQuery) ||
          (doc.description &&
            doc.description.toLowerCase().includes(normalizedQuery)) ||
          (doc.tags &&
            doc.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery)))
        );
      });
      resolve([...results]);
    }, 600);
  });
};

/**
 * Tạo thư mục mới
 */
export const createFolder = async (
  folderData: Partial<Folder>
): Promise<Folder> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newFolder: Folder = {
        id: uuidv4(),
        name: folderData.name || 'Thư mục mới',
        parentId: folderData.parentId,
        projectId: folderData.projectId,
        createdBy: folderData.createdBy || 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        isExpanded: false,
      };

      mockFolders.push(newFolder);
      resolve(newFolder);
    }, 500);
  });
};

/**
 * Upload tài liệu mới
 */
export const uploadDocument = async (
  documentData: Partial<Document>
): Promise<Document> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newDocument: Document = {
        id: uuidv4(),
        title: documentData.title || 'Tài liệu mới',
        description: documentData.description,
        type: documentData.type || DocumentType.PDF,
        url: documentData.url || `/documents/${uuidv4()}`,
        folderId: documentData.folderId || 'folder-1',
        projectId: documentData.projectId,
        createdBy: documentData.createdBy || 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        size: documentData.size || 0,
        version: documentData.version || '1.0.0',
        tags: documentData.tags || [],
        thumbnailUrl: documentData.thumbnailUrl,
        isPublic: documentData.isPublic ?? true,
      };

      mockDocuments.push(newDocument);
      resolve(newDocument);
    }, 700);
  });
};

/**
 * Thêm bình luận mới cho tài liệu
 */
export const addComment = async (
  commentData: Partial<DocumentComment>
): Promise<DocumentComment> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newComment: DocumentComment = {
        id: uuidv4(),
        documentId: commentData.documentId || '',
        content: commentData.content || '',
        userId: commentData.userId || 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockComments.push(newComment);
      resolve(newComment);
    }, 300);
  });
};

export default {
  fetchFolders,
  fetchDocumentsByFolder,
  fetchDocumentById,
  fetchCommentsByDocument,
  fetchDocumentVersions,
  searchDocuments,
  createFolder,
  uploadDocument,
  addComment,
  mockUsers,
  mockProjects,
  mockFolders,
  mockDocuments,
};
