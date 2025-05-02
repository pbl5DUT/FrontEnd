/**
 * Định nghĩa các kiểu dữ liệu cho cơ sở kiến thức
 */

export interface Category {
  id: string;
  name: string;
  description?: string;
  iconUrl?: string;
  parentId?: string; // ID của danh mục cha (nếu có)
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  articleCount: number; // Số lượng bài viết trong danh mục
  children?: Category[]; // Danh sách các danh mục con
}

export interface Article {
  id: string;
  title: string;
  content: string;
  summary?: string;
  categoryId: string;
  tags?: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  viewCount: number;
  likeCount: number;
  isFeatured: boolean;
  isPublished: boolean;
  attachments?: Attachment[];
  relatedArticleIds?: string[];
}

export interface Attachment {
  id: string;
  articleId: string;
  name: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  createdBy: string;
  createdAt: Date;
}

export interface ArticleComment {
  id: string;
  articleId: string;
  content: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  parentId?: string; // ID của bình luận cha (nếu là bình luận phản hồi)
}

export interface ArticleReaction {
  id: string;
  articleId: string;
  userId: string;
  reactionType: ReactionType;
  createdAt: Date;
}

export enum ReactionType {
  LIKE = 'LIKE',
  HELPFUL = 'HELPFUL',
  CONFUSED = 'CONFUSED',
}

export interface ArticleVersion {
  id: string;
  articleId: string;
  content: string;
  versionNumber: number;
  createdBy: string;
  createdAt: Date;
  comments?: string;
}

export interface UserFavorite {
  id: string;
  userId: string;
  articleId: string;
  createdAt: Date;
}

export interface SearchResult {
  id: string;
  title: string;
  snippet: string;
  categoryId: string;
  categoryName: string;
  relevanceScore: number;
  createdAt: Date;
  updatedAt: Date;
}
