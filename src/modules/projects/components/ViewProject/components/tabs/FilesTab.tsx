import React from 'react';
import { Project } from '@/modules/projects/types/project';
import styles from '../../ViewProjectPage.module.css';

interface FilesTabProps {
  project: Project;
  refreshData: () => void;
}

export const FilesTab: React.FC<FilesTabProps> = ({ project, refreshData }) => {
  // Helper function để xác định icon của file dựa trên loại file
  const getFileIcon = (fileType: string): string => {
    const fileTypeMap: Record<string, string> = {
      pdf: 'pdf',
      doc: 'doc',
      docx: 'doc',
      xls: 'xls',
      xlsx: 'xls',
      ppt: 'ppt',
      pptx: 'ppt',
      txt: 'txt',
      zip: 'zip',
      rar: 'zip',
      jpg: 'image',
      jpeg: 'image',
      png: 'image',
      gif: 'image',
    };

    return fileTypeMap[fileType.toLowerCase()] || 'file';
  };

  const handleDeleteFile = (fileId: number, fileName: string) => {
    if (window.confirm(`Bạn có chắc muốn xóa tệp ${fileName}?`)) {
      // TODO: Implement API xóa file
      console.log(`Deleting file ${fileId}`);
      // refreshData();
    }
  };

  return (
    <div className={styles.filesTab}>
      <div className={styles.filesHeader}>
        <h3>Tệp đính kèm</h3>
        <button className={styles.addButton}>Tải lên tệp</button>
      </div>

      {project.files && project.files.length > 0 ? (
        <div className={styles.filesList}>
          {project.files.map((file, index) => (
            <div key={index} className={styles.fileItem}>
              <div className={styles.fileIcon}>
                <img
                  src={`/assets/icons/${getFileIcon(file.type)}.png`}
                  alt={file.type}
                />
              </div>
              <div className={styles.fileInfo}>
                <div className={styles.fileName}>{file.name}</div>
                <div className={styles.fileDetails}>
                  {file.size} • {file.uploaded_by.name} • {file.upload_date}
                </div>
              </div>
              <div className={styles.fileActions}>
                <button
                  className={styles.downloadButton}
                  title="Tải xuống"
                  onClick={() => {
                    window.open(file.url, '_blank');
                  }}
                >
                  <img
                    src="/assets/icons/download.png"
                    alt="Tải xuống"
                    className={styles.icon}
                  />
                </button>
                <button 
                  className={styles.deleteButton} 
                  title="Xóa"
                  onClick={() => handleDeleteFile(Number(file.id), file.name)}
                >
                  <img
                    src="/assets/icons/delete.png"
                    alt="Xóa"
                    className={styles.icon}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          Chưa có tệp đính kèm nào. Hãy tải lên tệp mới.
        </div>
      )}
    </div>
  );
};