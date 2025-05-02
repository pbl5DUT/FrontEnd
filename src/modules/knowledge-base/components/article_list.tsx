'use client';

import React, { useState, useEffect } from 'react';
import { List, Card, Tag, Button, Empty, Spin, Avatar } from 'antd';
import {
  ClockCircleOutlined,
  EyeOutlined,
  LikeOutlined,
  StarOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { Article } from '../types/knowledge';
import {
  fetchArticlesByCategory,
  fetchPopularArticles,
  fetchRecentArticles,
  fetchFavoriteArticles,
  mockUsers,
} from '../services/knowledge_services_mock';
import styles from '../styles/knowledge_base.module.css';

interface ArticleListProps {
  categoryId: string | null;
  searchQuery: string;
  onArticleSelect: (article: Article) => void;
  filter: 'all' | 'popular' | 'recent' | 'favorites';
}

const ArticleList: React.FC<ArticleListProps> = ({
  categoryId,
  searchQuery,
  onArticleSelect,
  filter,
}) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    loadArticles();
  }, [categoryId, filter]);

  useEffect(() => {
    if (searchQuery) {
      filterArticlesBySearch();
    }
  }, [searchQuery]);

  const loadArticles = async () => {
    try {
      setLoading(true);
      let data: Article[] = [];

      switch (filter) {
        case 'popular':
          data = await fetchPopularArticles(20);
          break;
        case 'recent':
          data = await fetchRecentArticles(20);
          break;
        case 'favorites':
          data = await fetchFavoriteArticles('user-1'); // Giả định user hiện tại
          break;
        case 'all':
        default:
          data = await fetchArticlesByCategory(categoryId || undefined);
          break;
      }

      setArticles(data);
      setPage(1);
    } catch (error) {
      console.error('Error loading articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterArticlesBySearch = () => {
    if (!searchQuery.trim()) {
      loadArticles();
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = articles.filter(
      (article) =>
        article.title.toLowerCase().includes(query) ||
        (article.summary && article.summary.toLowerCase().includes(query)) ||
        (article.tags &&
          article.tags.some((tag) => tag.toLowerCase().includes(query)))
    );

    setArticles(filtered);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getUserName = (userId: string) => {
    const user = mockUsers.find((u) => u.id === userId);
    return user ? user.name : 'Người dùng không xác định';
  };

  const paginatedArticles = articles.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
        <span className={styles.loadingText}>Đang tải bài viết...</span>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <Empty
        description={
          searchQuery
            ? 'Không tìm thấy bài viết phù hợp'
            : categoryId
            ? 'Không có bài viết nào trong danh mục này'
            : 'Không có bài viết nào'
        }
      />
    );
  }

  return (
    <div className={styles.articleListContainer}>
      <List
        grid={{ gutter: 16, column: 1 }}
        dataSource={paginatedArticles}
        pagination={{
          onChange: setPage,
          current: page,
          pageSize: pageSize,
          total: articles.length,
          showSizeChanger: false,
        }}
        renderItem={(article) => (
          <List.Item>
            <Card
              className={styles.articleCard}
              hoverable
              onClick={() => onArticleSelect(article)}
            >
              <div className={styles.articleCardMeta}>
                <div className={styles.articleHeader}>
                  <h3 className={styles.articleTitle}>{article.title}</h3>
                  {article.isFeatured && (
                    <Tag color="gold" className={styles.featuredTag}>
                      Nổi bật
                    </Tag>
                  )}
                </div>

                <div className={styles.articleSummary}>
                  {article.summary || article.content.substring(0, 150) + '...'}
                </div>

                <div className={styles.articleTags}>
                  {article.tags &&
                    article.tags.map((tag) => (
                      <Tag key={tag} color="blue" className={styles.articleTag}>
                        {tag}
                      </Tag>
                    ))}
                </div>

                <div className={styles.articleFooter}>
                  <div className={styles.articleAuthor}>
                    <Avatar size="small">
                      {getUserName(article.createdBy).charAt(0)}
                    </Avatar>
                    <span>{getUserName(article.createdBy)}</span>
                  </div>

                  <div className={styles.articleMeta}>
                    <span className={styles.articleDate}>
                      <ClockCircleOutlined /> {formatDate(article.createdAt)}
                    </span>

                    <span className={styles.articleViews}>
                      <EyeOutlined /> {article.viewCount}
                    </span>

                    <span className={styles.articleLikes}>
                      <LikeOutlined /> {article.likeCount}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default ArticleList;
