import React, { useState } from 'react';
import styles from './project_overview.module.css';
import Link from 'next/link';

// Giả lập dữ liệu cho UI
const mockProjects = [
  {
    id: 1,
    name: 'Hệ thống CRM',
    description: 'Phát triển hệ thống quản lý khách hàng mới',
    status: 'Đang tiến hành',
    progress: 65,
    deadline: '15/06/2025',
    members: 8,
    tasks: { total: 45, completed: 27 },
  },
  {
    id: 2,
    name: 'Ứng dụng di động',
    description: 'Xây dựng app mobile cho hệ thống quản lý',
    status: 'Đang tiến hành',
    progress: 42,
    deadline: '20/07/2025',
    members: 5,
    tasks: { total: 38, completed: 16 },
  },
  {
    id: 3,
    name: 'Tái cấu trúc database',
    description: 'Tối ưu hóa cơ sở dữ liệu hiện tại',
    status: 'Chưa bắt đầu',
    progress: 0,
    deadline: '10/08/2025',
    members: 3,
    tasks: { total: 12, completed: 0 },
  },
  {
    id: 4,
    name: 'Nâng cấp hệ thống bảo mật',
    description: 'Triển khai các giải pháp bảo mật mới',
    status: 'Tạm dừng',
    progress: 33,
    deadline: '05/07/2025',
    members: 4,
    tasks: { total: 20, completed: 7 },
  },
];

// Dữ liệu biểu đồ tổng quan
const statsData = {
  totalProjects: 12,
  activeProjects: 8,
  completedProjects: 3,
  delayedProjects: 1,
  totalTasks: 235,
  completedTasks: 164,
  totalMembers: 22,
};

const ProjectOverview: React.FC = () => {
  const [filter, setFilter] = useState('all');

  return (
    <div className={styles.projectOverview}>
      <div className={styles.header}>
        <h1>Tổng quan dự án</h1>
        <div className={styles.actions}>
          <select
            className={styles.filterSelect}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">Tất cả dự án</option>
            <option value="active">Đang tiến hành</option>
            <option value="completed">Hoàn thành</option>
            <option value="delayed">Bị trễ</option>
          </select>
          <Link href="/projects/new" className={styles.createButton}>
            + Tạo dự án mới
          </Link>
        </div>
      </div>

      {/* Thống kê tổng quan */}
      <div className={styles.statsContainer}>
        <div className={styles.statsCard}>
          <div className={styles.statsIcon}>📊</div>
          <div className={styles.statsContent}>
            <div className={styles.statsValue}>{statsData.totalProjects}</div>
            <div className={styles.statsLabel}>Tổng số dự án</div>
          </div>
        </div>
        <div className={styles.statsCard}>
          <div className={styles.statsIcon}>🔄</div>
          <div className={styles.statsContent}>
            <div className={styles.statsValue}>{statsData.activeProjects}</div>
            <div className={styles.statsLabel}>Dự án đang thực hiện</div>
          </div>
        </div>
        <div className={styles.statsCard}>
          <div className={styles.statsIcon}>✅</div>
          <div className={styles.statsContent}>
            <div className={styles.statsValue}>
              {statsData.completedProjects}
            </div>
            <div className={styles.statsLabel}>Dự án hoàn thành</div>
          </div>
        </div>
        <div className={styles.statsCard}>
          <div className={styles.statsIcon}>⚠️</div>
          <div className={styles.statsContent}>
            <div className={styles.statsValue}>{statsData.delayedProjects}</div>
            <div className={styles.statsLabel}>Dự án bị trễ</div>
          </div>
        </div>
      </div>

      {/* Dự án hiện tại */}
      <div className={styles.sectionTitle}>
        <h2>Dự án gần đây</h2>
        <Link href="/projects" className={styles.viewAllLink}>
          Xem tất cả
        </Link>
      </div>

      <div className={styles.projectsGrid}>
        {mockProjects.map((project) => (
          <div key={project.id} className={styles.projectCard}>
            <div className={styles.projectHeader}>
              <h3 className={styles.projectName}>{project.name}</h3>
              <span
                className={`${styles.statusBadge} ${
                  styles[project.status.replace(/\s+/g, '').toLowerCase()]
                }`}
              >
                {project.status}
              </span>
            </div>
            <p className={styles.projectDescription}>{project.description}</p>

            <div className={styles.projectMeta}>
              <div className={styles.metaItem}>
                <span className={styles.metaIcon}>⏱️</span>
                <span className={styles.metaText}>
                  Hạn chót: {project.deadline}
                </span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaIcon}>👥</span>
                <span className={styles.metaText}>
                  {project.members} thành viên
                </span>
              </div>
            </div>

            <div className={styles.progressSection}>
              <div className={styles.progressText}>
                <span>Tiến độ</span>
                <span>{project.progress}%</span>
              </div>
              <div className={styles.progressBarContainer}>
                <div
                  className={styles.progressBar}
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
            </div>

            <div className={styles.taskStats}>
              <div className={styles.taskStat}>
                <span className={styles.taskStatLabel}>Công việc:</span>
                <span className={styles.taskStatValue}>
                  {project.tasks.completed}/{project.tasks.total} hoàn thành
                </span>
              </div>
            </div>

            <div className={styles.projectActions}>
              <Link
                href={`/projects/${project.id}`}
                className={styles.detailsButton}
              >
                Chi tiết
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Thêm phần biểu đồ thống kê */}
      <div className={styles.chartsSection}>
        <div className={styles.sectionTitle}>
          <h2>Phân tích dự án</h2>
        </div>
        <div className={styles.chartsContainer}>
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Phân bố trạng thái dự án</h3>
            <div className={styles.chartPlaceholder}>
              <div className={styles.pieChartPlaceholder}>
                <div
                  className={styles.pieSegment}
                  style={{
                    transform: 'rotate(0deg)',
                    backgroundColor: '#1890ff',
                    clipPath:
                      'polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 50% 100%)',
                  }}
                ></div>
                <div
                  className={styles.pieSegment}
                  style={{
                    transform: 'rotate(180deg)',
                    backgroundColor: '#52c41a',
                    clipPath:
                      'polygon(50% 50%, 50% 0%, 25% 0%, 0% 25%, 0% 50%)',
                  }}
                ></div>
                <div
                  className={styles.pieSegment}
                  style={{
                    transform: 'rotate(225deg)',
                    backgroundColor: '#ff4d4f',
                    clipPath: 'polygon(50% 50%, 50% 0%, 0% 0%, 0% 25%)',
                  }}
                ></div>
                <div className={styles.pieCenterCircle}></div>
              </div>
              <div className={styles.chartLegend}>
                <div className={styles.legendItem}>
                  <span
                    className={styles.legendColor}
                    style={{ backgroundColor: '#1890ff' }}
                  ></span>
                  <span>Đang tiến hành ({statsData.activeProjects})</span>
                </div>
                <div className={styles.legendItem}>
                  <span
                    className={styles.legendColor}
                    style={{ backgroundColor: '#52c41a' }}
                  ></span>
                  <span>Hoàn thành ({statsData.completedProjects})</span>
                </div>
                <div className={styles.legendItem}>
                  <span
                    className={styles.legendColor}
                    style={{ backgroundColor: '#ff4d4f' }}
                  ></span>
                  <span>Bị trễ ({statsData.delayedProjects})</span>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Số lượng công việc</h3>
            <div className={styles.chartPlaceholder}>
              <div className={styles.barChartPlaceholder}>
                <div className={styles.barGroup}>
                  <div className={styles.barContainer}>
                    <div className={styles.barValue}>
                      {statsData.totalTasks}
                    </div>
                    <div
                      className={styles.bar}
                      style={{ height: '180px', backgroundColor: '#1890ff' }}
                    ></div>
                  </div>
                  <div className={styles.barLabel}>Tổng số</div>
                </div>
                <div className={styles.barGroup}>
                  <div className={styles.barContainer}>
                    <div className={styles.barValue}>
                      {statsData.completedTasks}
                    </div>
                    <div
                      className={styles.bar}
                      style={{ height: '120px', backgroundColor: '#52c41a' }}
                    ></div>
                  </div>
                  <div className={styles.barLabel}>Hoàn thành</div>
                </div>
                <div className={styles.barGroup}>
                  <div className={styles.barContainer}>
                    <div className={styles.barValue}>
                      {statsData.totalTasks - statsData.completedTasks}
                    </div>
                    <div
                      className={styles.bar}
                      style={{ height: '60px', backgroundColor: '#faad14' }}
                    ></div>
                  </div>
                  <div className={styles.barLabel}>Đang làm</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectOverview;
