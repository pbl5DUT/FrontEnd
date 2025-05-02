'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Tag,
  Divider,
  List,
  Avatar,
  Input,
  Form,
  Spin,
  message,
  Tooltip,
} from 'antd';
import {
  CloseOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  LikeOutlined,
  LikeFilled,
  StarOutlined,
  StarFilled,
  SendOutlined,
  SmileOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { Article, ArticleComment, ReactionType } from '../types/knowledge';
import {
  fetchCommentsByArticle,
  addComment,
  toggleFavorite,
  toggleReaction,
  incrementArticleViews,
  checkIsFavorite,
  mockUsers,
} from '../services/knowledge_services_mock';
import ReactMarkdown from 'react-markdown';
import styles from '../styles/knowledge_base.module.css';

const { TextArea } = Input;

interface ArticleViewProps {
  article: Article;
  onClose: () => void;
}

const ArticleView: React.FC<ArticleViewProps> = ({ article, onClose }) => {
  const [comments, setComments] = useState<ArticleComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [likeCount, setLikeCount] = useState(article.likeCount);
  const [hasLiked, setHasLiked] = useState(false);
  const [commentForm] = Form.useForm();

  useEffect(() => {
    loadArticleData();
  }, [article.id]);

  const loadArticleData = async () => {
    try {
      setLoading(true);

      // Tăng số lượt xem
      await incrementArticleViews(article.id);

      // Lấy bình luận
      const commentsData = await fetchCommentsByArticle(article.id);
      setComments(commentsData);

      // Kiểm tra trạng thái yêu thích
      const favoriteStatus = await checkIsFavorite('user-1', article.id);
      setIsFavorite(favoriteStatus);

      // Set trạng thái like (giả định)
      setHasLiked(false);
      setLikeCount(article.likeCount);
    } catch (error) {
      console.error('Error loading article data:', error);
      message.error('Không thể tải dữ liệu bài viết');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    try {
      const values = await commentForm.validateFields();

      const newComment = await addComment({
        articleId: article.id,
        content: values.comment,
        userId: 'user-1', // Giả định người dùng hiện tại
      });

      setComments([...comments, newComment]);
      commentForm.resetFields();
      message.success('Đã thêm bình luận');
    } catch (error) {
      console.error('Error adding comment:', error);
      message.error('Không thể thêm bình luận');
    }
  };

  const handleToggleFavorite = async () => {
    try {
      const result = await toggleFavorite('user-1', article.id);
      setIsFavorite(result.isFavorite);

      message.success(
        result.isFavorite
          ? 'Đã thêm vào danh sách yêu thích'
          : 'Đã xóa khỏi danh sách yêu thích'
      );
    } catch (error) {
      console.error('Error toggling favorite:', error);
      message.error('Không thể cập nhật trạng thái yêu thích');
    }
  };

  const handleToggleLike = async () => {
    try {
      const result = await toggleReaction(
        'user-1',
        article.id,
        ReactionType.LIKE
      );
      setLikeCount(result.count);
      setHasLiked(!hasLiked);
    } catch (error) {
      console.error('Error toggling like:', error);
      message.error('Không thể cập nhật trạng thái thích');
    }
  };

  const getUserName = (userId: string) => {
    const user = mockUsers.find((u) => u.id === userId);
    return user ? user.name : 'Người dùng không xác định';
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={styles.articleViewContainer}>
      <Card
        className={styles.articleCard}
        title={
          <div className={styles.articleViewHeader}>
            <h2 className={styles.articleTitle}>{article.title}</h2>
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={onClose}
              className={styles.closeButton}
            />
          </div>
        }
        extra={
          <div className={styles.articleActions}>
            <Tooltip
              title={isFavorite ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
            >
              <Button
                type="text"
                icon={
                  isFavorite ? (
                    <StarFilled style={{ color: '#faad14' }} />
                  ) : (
                    <StarOutlined />
                  )
                }
                onClick={handleToggleFavorite}
              />
            </Tooltip>

            <Tooltip title={hasLiked ? 'Bỏ thích' : 'Thích bài viết'}>
              <Button
                type="text"
                icon={
                  hasLiked ? (
                    <LikeFilled style={{ color: '#1890ff' }} />
                  ) : (
                    <LikeOutlined />
                  )
                }
                onClick={handleToggleLike}
              >
                {likeCount > 0 && likeCount}
              </Button>
            </Tooltip>
          </div>
        }
      >
        {loading ? (
          <div className={styles.loadingContainer}>
            <Spin
              indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
            />
          </div>
        ) : (
          <>
            <div className={styles.articleMeta}>
              <div className={styles.articleAuthor}>
                <Avatar size="small">
                  {getUserName(article.createdBy).charAt(0)}
                </Avatar>
                <span>{getUserName(article.createdBy)}</span>
              </div>

              <div className={styles.articleStats}>
                <span className={styles.articleDate}>
                  <ClockCircleOutlined /> {formatDate(article.updatedAt)}
                </span>

                <span className={styles.articleViews}>
                  <EyeOutlined /> {article.viewCount} lượt xem
                </span>
              </div>
            </div>

            <div className={styles.articleTags}>
              {article.tags &&
                article.tags.map((tag) => (
                  <Tag key={tag} color="blue">
                    {tag}
                  </Tag>
                ))}
            </div>

            <Divider />

            <div className={styles.articleContent}>
              <ReactMarkdown>{article.content}</ReactMarkdown>
            </div>

            <Divider orientation="left">Bình luận ({comments.length})</Divider>

            <div className={styles.commentsSection}>
              <Form form={commentForm} onFinish={handleAddComment}>
                <Form.Item
                  name="comment"
                  rules={[
                    {
                      required: true,
                      message: 'Vui lòng nhập nội dung bình luận',
                    },
                  ]}
                >
                  <TextArea
                    rows={3}
                    placeholder="Thêm bình luận của bạn..."
                    className={styles.commentInput}
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    htmlType="submit"
                  >
                    Gửi
                  </Button>
                </Form.Item>
              </Form>

              {comments.length > 0 ? (
                <List
                  className={styles.commentList}
                  itemLayout="horizontal"
                  dataSource={comments}
                  renderItem={(comment) => (
                    <List.Item className={styles.commentItem}>
                      <List.Item.Meta
                        avatar={
                          <Avatar>
                            {getUserName(comment.userId).charAt(0)}
                          </Avatar>
                        }
                        title={
                          <div className={styles.commentHeader}>
                            <span className={styles.commentAuthor}>
                              {getUserName(comment.userId)}
                            </span>
                            <span className={styles.commentDate}>
                              {formatDate(comment.createdAt)}
                            </span>
                          </div>
                        }
                        description={
                          <div className={styles.commentContent}>
                            {comment.content}
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <div className={styles.noComments}>
                  Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
                </div>
              )}
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default ArticleView;
