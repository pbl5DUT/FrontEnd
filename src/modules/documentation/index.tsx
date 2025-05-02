'use client';

import React, { useState } from 'react';
import { Row, Col } from 'antd';
import DocumentList from './components/document_list';
import DocumentViewer from './components/document_viewer';
import FolderTree from './components/floder_free';
import styles from './styles/Documentation.module.css';
import { Document } from './types/documentation';

const DocumentationPage: React.FC = () => {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );

  const handleFolderSelect = (folderId: string) => {
    setSelectedFolder(folderId);
    setSelectedDocument(null);
  };

  const handleDocumentSelect = (document: Document) => {
    setSelectedDocument(document);
  };

  return (
    <div className={styles.documentationContainer}>
      <Row gutter={20}>
        <Col xs={24} md={6}>
          <div className={styles.sideNav}>
            <FolderTree onSelect={handleFolderSelect} />
          </div>
        </Col>
        <Col xs={24} md={selectedDocument ? 6 : 18}>
          <DocumentList
            folderId={selectedFolder}
            onDocumentSelect={handleDocumentSelect}
          />
        </Col>
        {selectedDocument && (
          <Col xs={24} md={12}>
            <DocumentViewer document={selectedDocument} />
          </Col>
        )}
      </Row>
    </div>
  );
};

export default DocumentationPage;
