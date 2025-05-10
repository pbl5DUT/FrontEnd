import React, { useState } from 'react';
import { Project } from '@/modules/projects/types/project';
import styles from './CommentsTab.module.css'; // Import CSS module riêng

interface CommentsTabProps {
  project: Project;
  refreshData: () => void;
}

export const CommentsTab: React.FC<CommentsTabProps> = ({ project, refreshData }) => {
  const [commentText, setCommentText] = useState<string>('');

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    
    // TODO: Implement API thêm bình luận
    console.log('Adding comment:', commentText);
    // Sau khi thêm bình luận thành công
    setCommentText('');
    // refreshData();
  };

  return (
    <div className={styles.commentsTab}>
      <h3>Bình luận</h3>

      <div className={styles.commentsList}>
        {project.comments && project.comments.length > 0 ? (
          project.comments.map((comment, index) => (
            <div key={index} className={styles.commentItem}>
              <div className={styles.commentHeader}>
                <div className={styles.commentUser}>
                  {comment.user.avatar ? (
                    <img
                      src={comment.user.avatar}
                      alt={comment.user.full_name}
                      className={styles.commentAvatar}
                    />
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      {comment.user.full_name.charAt(0)}
                    </div>
                  )}
                  <span className={styles.commentUserName}>
                    {comment.user.full_name}
                  </span>
                </div>
                <div className={styles.commentDate}>{comment.date}</div>
              </div>
              <div className={styles.commentContent}>
                {comment.content}
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            Chưa có bình luận nào. Hãy thêm bình luận mới.
          </div>
        )}
      </div>

      <div className={styles.addComment}>
        <textarea
          className={styles.commentInput}
          placeholder="Thêm bình luận..."
          rows={3}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
        ></textarea>
        <button 
          className={styles.commentButton}
          onClick={handleAddComment}
        >
          Gửi
        </button>
      </div>
    </div>
  );
};