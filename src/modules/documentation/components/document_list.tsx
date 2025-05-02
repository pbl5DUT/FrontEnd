'use client';

import React, { useState, useEffect } from 'react';
import {
  List,
  Card,
  Button,
  Input,
  Dropdown,
  Menu,
  Tag,
  Empty,
  Spin,
  message,
} from 'antd';
import {
  FileOutlined,
  FolderAddOutlined,
  FileAddOutlined,
  SearchOutlined,
  MoreOutlined,
  //   PdfOutlined,
  FileMarkdownOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FileImageOutlined,
  FileTextOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { Document, DocumentType } from '../types/documentation';
import { fetchDocumentsByFolder } from '../services/documentation_service_mock';
import styles from '../styles/Documentation.module.css';

interface DocumentListProps {
  folderId: string | null;
  onDocumentSelect: (document: Document) => void;
}

const DocumentList: React.FC<DocumentListProps> = ({
  folderId,
  onDocumentSelect,
}) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    if (folderId) {
      loadDocuments();
    } else {
      setDocuments([]);
    }
  }, [folderId]);

  const loadDocuments = async () => {
    if (!folderId) return;

    try {
      setLoading(true);
      const data = await fetchDocumentsByFolder(folderId);
      setDocuments(data);
    } catch (error) {
      console.error('Error loading documents:', error);
      message.error('Không thể tải danh sách tài liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.title.toLowerCase().includes(searchText.toLowerCase()) ||
      (doc.description &&
        doc.description.toLowerCase().includes(searchText.toLowerCase())) ||
      (doc.tags &&
        doc.tags.some((tag) =>
          tag.toLowerCase().includes(searchText.toLowerCase())
        ))
  );

  const getDocumentIcon = (type: DocumentType) => {
    switch (type) {
      case DocumentType.PDF:
      // return <PdfOutlined style={{ color: '#ff4d4f' }} />;
      case DocumentType.MARKDOWN:
        return <FileMarkdownOutlined style={{ color: '#1890ff' }} />;
      case DocumentType.WORD:
        return <FileWordOutlined style={{ color: '#295396' }} />;
      case DocumentType.EXCEL:
        return <FileExcelOutlined style={{ color: '#217346' }} />;
      case DocumentType.IMAGE:
        return <FileImageOutlined style={{ color: '#722ed1' }} />;
      case DocumentType.TEXT:
        return <FileTextOutlined style={{ color: '#595959' }} />;
      default:
        return <FileOutlined style={{ color: '#8c8c8c' }} />;
    }
  };

  const renderDocumentItem = (document: Document) => {
    const formatFileSize = (bytes: number = 0) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const menu = (
      <Menu>
        <Menu.Item key="1">Tải xuống</Menu.Item>
        <Menu.Item key="2">Chỉnh sửa thông tin</Menu.Item>
        <Menu.Item key="3">Chia sẻ</Menu.Item>
        <Menu.Item key="4">Xem lịch sử phiên bản</Menu.Item>
        <Menu.Divider />
        <Menu.Item key="5" danger>
          Xóa
        </Menu.Item>
      </Menu>
    );

    return (
      <List.Item
        className={styles.documentItem}
        onClick={() => onDocumentSelect(document)}
      >
        <Card className={styles.documentCard} bordered={false}>
          <div className={styles.documentCardContent}>
            <div className={styles.documentIcon}>
              {getDocumentIcon(document.type)}
            </div>
            <div className={styles.documentInfo}>
              <div className={styles.documentTitle}>{document.title}</div>
              {document.description && (
                <div className={styles.documentDesc}>
                  {document.description}
                </div>
              )}
              <div className={styles.documentMeta}>
                <span>Kích thước: {formatFileSize(document.size)}</span>
                <span>
                  Cập nhật:{' '}
                  {new Date(document.updatedAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
              <div className={styles.documentTags}>
                {document.tags &&
                  document.tags.map((tag) => (
                    <Tag key={tag} color="blue">
                      {tag}
                    </Tag>
                  ))}
              </div>
            </div>
            <div className={styles.documentActions}>
              <Dropdown
                overlay={menu}
                trigger={['click']}
                placement="bottomRight"
              >
                <Button
                  type="text"
                  icon={<MoreOutlined />}
                  onClick={(e) => e.stopPropagation()}
                />
              </Dropdown>
            </div>
          </div>
        </Card>
      </List.Item>
    );
  };

  return (
    <div className={styles.documentListContainer}>
      <div className={styles.documentListHeader}>
        <div className={styles.headerTitle}>
          {folderId ? 'Tài liệu' : 'Vui lòng chọn thư mục'}
        </div>
        <div className={styles.headerActions}>
          {folderId && (
            <>
              <Input
                placeholder="Tìm kiếm tài liệu..."
                prefix={<SearchOutlined />}
                onChange={(e) => handleSearch(e.target.value)}
                value={searchText}
                className={styles.searchInput}
              />
              <Button
                type="primary"
                icon={<FileAddOutlined />}
                className={styles.uploadButton}
              >
                Tải lên
              </Button>
              <Button
                icon={<FolderAddOutlined />}
                className={styles.folderButton}
              >
                Thư mục mới
              </Button>
            </>
          )}
        </div>
      </div>

      <div className={styles.documentListContent}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <Spin
              indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
            />
            <span className={styles.loadingText}>Đang tải tài liệu...</span>
          </div>
        ) : !folderId ? (
          <Empty
            description="Hãy chọn một thư mục để xem tài liệu"
            className={styles.emptyContent}
          />
        ) : filteredDocuments.length === 0 ? (
          <Empty
            description={
              searchText
                ? 'Không tìm thấy tài liệu phù hợp'
                : 'Thư mục này chưa có tài liệu'
            }
            className={styles.emptyContent}
          />
        ) : (
          <List
            grid={{
              gutter: 16,
              xs: 1,
              sm: 1,
              md: 1,
              lg: 1,
              xl: 1,
              xxl: 1,
            }}
            dataSource={filteredDocuments}
            renderItem={renderDocumentItem}
          />
        )}
      </div>
    </div>
  );
};

export default DocumentList;
