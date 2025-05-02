'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Tabs,
  Tag,
  List,
  Avatar,
  Input,
  Form,
  Spin,
  Tooltip,
  message,
} from 'antd';
import {
  DownloadOutlined,
  ShareAltOutlined,
  EditOutlined,
  HistoryOutlined,
  CommentOutlined,
  SendOutlined,
  LoadingOutlined,
  CloseOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  PaperClipOutlined,
} from '@ant-design/icons';
import {
  Document,
  DocumentComment,
  DocumentVersion,
} from '../types/documentation';
import {
  fetchCommentsByDocument,
  fetchDocumentVersions,
  addComment,
  mockUsers,
} from '../services/documentation_service_mock';
import styles from '../styles/Documentation.module.css';

const { TabPane } = Tabs;
const { TextArea } = Input;

interface DocumentViewerProps {
  document: Document;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ document }) => {
  const [comments, setComments] = useState<DocumentComment[]>([]);
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [commentForm] = Form.useForm();

  useEffect(() => {
    if (document) {
      loadComments();
      loadVersions();
    }
  }, [document]);

  const loadComments = async () => {
    try {
      setLoadingComments(true);
      const data = await fetchCommentsByDocument(document.id);
      setComments(data);
    } catch (error) {
      console.error('Error loading comments:', error);
      message.error('Không thể tải bình luận');
    } finally {
      setLoadingComments(false);
    }
  };

  const loadVersions = async () => {
    try {
      setLoadingVersions(true);
      const data = await fetchDocumentVersions(document.id);
      setVersions(data);
    } catch (error) {
      console.error('Error loading versions:', error);
      message.error('Không thể tải lịch sử phiên bản');
    } finally {
      setLoadingVersions(false);
    }
  };

  const handleAddComment = async () => {
    try {
      const values = await commentForm.validateFields();
      const newComment = await addComment({
        documentId: document.id,
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

  const getUserName = (userId: string) => {
    const user = mockUsers.find((u) => u.id === userId);
    return user ? user.name : 'Người dùng không xác định';
  };

  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  const renderDocumentPreview = () => {
    const extension = getFileExtension(document.title);

    // Hiển thị tùy theo loại tài liệu
    switch (extension) {
      case 'pdf':
        return (
          <div className={styles.pdfPreview}>
            <iframe
              src={document.url}
              className={styles.pdfFrame}
              title={document.title}
            />
          </div>
        );
      case 'md':
        return (
          <div className={styles.markdownPreview}>
            <div className={styles.previewPlaceholder}>
              <FileTextOutlined className={styles.previewIcon} />
              <div>Xem trước Markdown</div>
              <Button type="primary">Mở tài liệu</Button>
            </div>
          </div>
        );
      case 'docx':
      case 'xlsx':
      case 'pptx':
        return (
          <div className={styles.officePreview}>
            <div className={styles.previewPlaceholder}>
              <FileTextOutlined className={styles.previewIcon} />
              <div>Không thể xem trước file Office</div>
              <Button type="primary">Tải xuống</Button>
            </div>
          </div>
        );
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
        return (
          <div className={styles.imagePreview}>
            <img
              src={document.url}
              alt={document.title}
              className={styles.previewImage}
            />
          </div>
        );
      default:
        return (
          <div className={styles.defaultPreview}>
            <div className={styles.previewPlaceholder}>
              <FileTextOutlined className={styles.previewIcon} />
              <div>Không thể xem trước định dạng này</div>
              <Button type="primary">Tải xuống</Button>
            </div>
          </div>
        );
    }
  };

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={styles.documentViewerContainer}>
      <Card
        title={
          <div className={styles.documentViewerHeader}>
            <div className={styles.documentTitle}>{document.title}</div>
            <Button
              type="text"
              icon={<CloseOutlined />}
              className={styles.closeButton}
            />
          </div>
        }
        className={styles.documentViewerCard}
        bordered={false}
        extra={
          <div className={styles.documentActions}>
            <Button icon={<DownloadOutlined />}>Tải xuống</Button>
            <Button icon={<ShareAltOutlined />}>Chia sẻ</Button>
            <Button icon={<EditOutlined />}>Sửa</Button>
          </div>
        }
      >
        <Tabs defaultActiveKey="content">
          <TabPane tab="Nội dung" key="content">
            <div className={styles.documentContent}>
              {renderDocumentPreview()}

              <div className={styles.documentMetadata}>
                <div className={styles.metadataItem}>
                  <Tooltip title="Người tạo">
                    <span className={styles.metadataLabel}>
                      <InfoCircleOutlined /> Người tạo:
                    </span>
                  </Tooltip>
                  <span className={styles.metadataValue}>
                    {getUserName(document.createdBy)}
                  </span>
                </div>

                <div className={styles.metadataItem}>
                  <Tooltip title="Thời gian tạo">
                    <span className={styles.metadataLabel}>
                      <InfoCircleOutlined /> Ngày tạo:
                    </span>
                  </Tooltip>
                  <span className={styles.metadataValue}>
                    {formatDateTime(document.createdAt)}
                  </span>
                </div>

                <div className={styles.metadataItem}>
                  <Tooltip title="Cập nhật gần nhất">
                    <span className={styles.metadataLabel}>
                      <InfoCircleOutlined /> Cập nhật:
                    </span>
                  </Tooltip>
                  <span className={styles.metadataValue}>
                    {formatDateTime(document.updatedAt)}
                  </span>
                </div>

                <div className={styles.metadataItem}>
                  <Tooltip title="Phiên bản">
                    <span className={styles.metadataLabel}>
                      <InfoCircleOutlined /> Phiên bản:
                    </span>
                  </Tooltip>
                  <span className={styles.metadataValue}>
                    {document.version}
                  </span>
                </div>

                {document.tags && document.tags.length > 0 && (
                  <div className={styles.documentTags}>
                    <PaperClipOutlined /> Thẻ:
                    {document.tags.map((tag) => (
                      <Tag key={tag} color="blue">
                        {tag}
                      </Tag>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabPane>

          <TabPane
            tab={
              <span>
                <CommentOutlined /> Bình luận
              </span>
            }
            key="comments"
          >
            <div className={styles.commentsContainer}>
              {loadingComments ? (
                <div className={styles.loadingContainer}>
                  <Spin
                    indicator={
                      <LoadingOutlined style={{ fontSize: 24 }} spin />
                    }
                  />
                  <span className={styles.loadingText}>
                    Đang tải bình luận...
                  </span>
                </div>
              ) : (
                <>
                  <List
                    itemLayout="horizontal"
                    dataSource={comments}
                    locale={{ emptyText: 'Chưa có bình luận nào' }}
                    renderItem={(comment) => (
                      <List.Item className={styles.commentItem}>
                        <List.Item.Meta
                          avatar={
                            <Avatar>{getUserName(comment.userId)[0]}</Avatar>
                          }
                          title={
                            <div className={styles.commentHeader}>
                              <span className={styles.commentAuthor}>
                                {getUserName(comment.userId)}
                              </span>
                              <span className={styles.commentTime}>
                                {formatDateTime(comment.createdAt)}
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

                  <div className={styles.addCommentForm}>
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
                          placeholder="Thêm bình luận..."
                          className={styles.commentInput}
                        />
                      </Form.Item>
                      <Form.Item>
                        <Button
                          type="primary"
                          htmlType="submit"
                          icon={<SendOutlined />}
                        >
                          Gửi
                        </Button>
                      </Form.Item>
                    </Form>
                  </div>
                </>
              )}
            </div>
          </TabPane>

          <TabPane
            tab={
              <span>
                <HistoryOutlined /> Phiên bản
              </span>
            }
            key="versions"
          >
            <div className={styles.versionsContainer}>
              {loadingVersions ? (
                <div className={styles.loadingContainer}>
                  <Spin
                    indicator={
                      <LoadingOutlined style={{ fontSize: 24 }} spin />
                    }
                  />
                  <span className={styles.loadingText}>
                    Đang tải lịch sử phiên bản...
                  </span>
                </div>
              ) : (
                <List
                  itemLayout="horizontal"
                  dataSource={versions}
                  locale={{ emptyText: 'Không có lịch sử phiên bản' }}
                  renderItem={(version) => (
                    <List.Item
                      className={styles.versionItem}
                      actions={[
                        <Button key="view" size="small">
                          Xem
                        </Button>,
                        <Button key="download" type="link" size="small">
                          Tải xuống
                        </Button>,
                      ]}
                    >
                      <List.Item.Meta
                        title={
                          <div className={styles.versionHeader}>
                            <span className={styles.versionNumber}>
                              Phiên bản {version.version}
                            </span>
                            <span className={styles.versionTime}>
                              {formatDateTime(version.createdAt)}
                            </span>
                          </div>
                        }
                        description={
                          <div className={styles.versionDetails}>
                            <div className={styles.versionAuthor}>
                              Tạo bởi: {getUserName(version.createdBy)}
                            </div>
                            {version.changes && (
                              <div className={styles.versionChanges}>
                                Thay đổi: {version.changes}
                              </div>
                            )}
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              )}
            </div>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default DocumentViewer;
