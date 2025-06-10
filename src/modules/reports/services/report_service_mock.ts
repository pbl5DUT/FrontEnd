// // modules/stacks/services/reportServiceMock.ts
// import {
//   WorkReport,
//   ReportType,
//   ReportStatus,
//   TaskStatus,
//   Task,
// } from '../types/report';
// import stacksService from '../../stacks/services/tasks_services_mock'; // Giả định đã tồn tại từ module trước

// // Danh sách báo cáo mẫu
// const mockReports: WorkReport[] = [
//   {
//     id: 'report1',
//     type: ReportType.WEEKLY,
//     title: 'Báo cáo tuần từ 22/04 - 28/04/2025',
//     userId: 'user1',
//     userName: 'Nguyễn Văn A',
//     status: ReportStatus.SUBMITTED,
//     projectId: 'project1',
//     projectName: 'Website Ecommerce',
//     startDate: '2025-04-22',
//     endDate: '2025-04-28',
//     submittedDate: '2025-04-28T15:30:00Z',
//     reportTasks: [
//       {
//         taskId: 'task1',
//         title: 'Thiết kế giao diện trang chủ',
//         status: TaskStatus.IN_PROGRESS,
//         progress: 70,
//         timeSpent: 12.5,
//         notes:
//           'Hoàn thành phần wireframe, đang trong giai đoạn thiết kế UI chi tiết.',
//       },
//       {
//         taskId: 'task2',
//         title: 'Xây dựng API authentication',
//         status: TaskStatus.IN_PROGRESS,
//         progress: 40,
//         timeSpent: 8,
//         notes: 'Đã hoàn thành các API đăng ký và đăng nhập cơ bản.',
//       },
//     ],
//     summary:
//       'Tuần này tập trung vào việc thiết kế UI và bắt đầu phát triển các API xác thực.',
//     challenges:
//       'Gặp khó khăn trong việc tích hợp OAuth với các dịch vụ bên thứ ba.',
//     nextSteps: 'Tiếp tục hoàn thiện thiết kế UI và phát triển API.',
//     createdAt: '2025-04-22T09:00:00Z',
//     updatedAt: '2025-04-28T15:30:00Z',
//   },
//   {
//     id: 'report2',
//     type: ReportType.DAILY,
//     title: 'Báo cáo ngày 01/05/2025',
//     userId: 'user1',
//     userName: 'Nguyễn Văn A',
//     status: ReportStatus.REVIEWED,
//     projectId: 'project2',
//     projectName: 'Mobile App',
//     startDate: '2025-05-01',
//     endDate: '2025-05-01',
//     submittedDate: '2025-05-01T17:00:00Z',
//     reviewedDate: '2025-05-02T10:15:00Z',
//     reviewedBy: 'manager1',
//     reportTasks: [
//       {
//         taskId: 'task3',
//         title: 'Tạo tài liệu hướng dẫn sử dụng',
//         status: TaskStatus.DONE,
//         progress: 100,
//         timeSpent: 6,
//         notes: 'Hoàn thành toàn bộ tài liệu hướng dẫn sử dụng, đã được review.',
//       },
//     ],
//     summary: 'Hoàn thành tài liệu hướng dẫn sử dụng cho ứng dụng mobile.',
//     nextSteps: 'Bắt đầu làm việc trên tính năng thông báo.',
//     createdAt: '2025-05-01T09:00:00Z',
//     updatedAt: '2025-05-02T10:15:00Z',
//   },
//   {
//     id: 'report3',
//     type: ReportType.MONTHLY,
//     title: 'Báo cáo tháng 04/2025',
//     userId: 'user1',
//     userName: 'Nguyễn Văn A',
//     status: ReportStatus.DRAFT,
//     startDate: '2025-04-01',
//     endDate: '2025-04-30',
//     reportTasks: [
//       {
//         taskId: 'task1',
//         title: 'Thiết kế giao diện trang chủ',
//         status: TaskStatus.IN_PROGRESS,
//         progress: 70,
//         timeSpent: 40,
//         notes: 'Đã hoàn thành phần lớn thiết kế UI cho trang chủ.',
//       },
//       {
//         taskId: 'task2',
//         title: 'Xây dựng API authentication',
//         status: TaskStatus.IN_PROGRESS,
//         progress: 40,
//         timeSpent: 30,
//         notes: 'Đang tiếp tục phát triển các API xác thực.',
//       },
//       {
//         taskId: 'task3',
//         title: 'Tạo tài liệu hướng dẫn sử dụng',
//         status: TaskStatus.DONE,
//         progress: 100,
//         timeSpent: 20,
//         notes: 'Hoàn thành toàn bộ tài liệu hướng dẫn sử dụng.',
//       },
//     ],
//     summary:
//       'Tháng 4 đã đạt được nhiều tiến bộ trong thiết kế UI và phát triển backend.',
//     challenges:
//       'Gặp một số trở ngại trong việc tích hợp các dịch vụ bên thứ ba.',
//     nextSteps:
//       'Tháng 5 sẽ tập trung vào việc hoàn thiện UI và phát triển các tính năng còn lại.',
//     createdAt: '2025-04-28T09:00:00Z',
//     updatedAt: '2025-04-28T09:00:00Z',
//   },
// ];

// class ReportServiceMock {
//   [x: string]: any;
//   // Lấy tất cả báo cáo của người dùng
//   async getUserReports(userId: string): Promise<WorkReport[]> {
//     await new Promise((resolve) => setTimeout(resolve, 500));
//     return mockReports.filter((report) => report.userId === userId);
//   }

//   // Lấy báo cáo chi tiết theo ID
//   async getReportById(reportId: string): Promise<WorkReport | null> {
//     await new Promise((resolve) => setTimeout(resolve, 300));
//     const report = mockReports.find((report) => report.id === reportId);
//     return report || null;
//   }

//   // Tạo báo cáo mới
//   async createReport(
//     reportData: Omit<WorkReport, 'id' | 'createdAt' | 'updatedAt'>
//   ): Promise<WorkReport> {
//     await new Promise((resolve) => setTimeout(resolve, 500));

//     const newReport: WorkReport = {
//       ...reportData,
//       id: `report${mockReports.length + 1}`,
//       createdAt: new Date().toISOString(),
//       updatedAt: new Date().toISOString(),
//     };

//     mockReports.push(newReport);
//     return newReport;
//   }

//   // Cập nhật báo cáo
//   async updateReport(
//     reportId: string,
//     reportData: Partial<WorkReport>
//   ): Promise<WorkReport> {
//     await new Promise((resolve) => setTimeout(resolve, 300));
//     const reportIndex = mockReports.findIndex(
//       (report) => report.id === reportId
//     );

//     if (reportIndex === -1) {
//       throw new Error('Report not found');
//     }

//     const updatedReport = {
//       ...mockReports[reportIndex],
//       ...reportData,
//       updatedAt: new Date().toISOString(),
//     };

//     mockReports[reportIndex] = updatedReport;
//     return updatedReport;
//   }

//   // Gửi báo cáo để review
//   async submitReport(reportId: string): Promise<WorkReport> {
//     await new Promise((resolve) => setTimeout(resolve, 300));
//     const reportIndex = mockReports.findIndex(
//       (report) => report.id === reportId
//     );

//     if (reportIndex === -1) {
//       throw new Error('Report not found');
//     }

//     const updatedReport = {
//       ...mockReports[reportIndex],
//       status: ReportStatus.SUBMITTED,
//       submittedDate: new Date().toISOString(),
//       updatedAt: new Date().toISOString(),
//     };

//     mockReports[reportIndex] = updatedReport;
//     return updatedReport;
//   }

//   // Đánh dấu báo cáo đã xem
//   async reviewReport(
//     reportId: string,
//     reviewerId: string
//   ): Promise<WorkReport> {
//     await new Promise((resolve) => setTimeout(resolve, 300));
//     const reportIndex = mockReports.findIndex(
//       (report) => report.id === reportId
//     );

//     if (reportIndex === -1) {
//       throw new Error('Report not found');
//     }

//     const updatedReport = {
//       ...mockReports[reportIndex],
//       status: ReportStatus.REVIEWED,
//       reviewedDate: new Date().toISOString(),
//       reviewedBy: reviewerId,
//       updatedAt: new Date().toISOString(),
//     };

//     mockReports[reportIndex] = updatedReport;
//     return updatedReport;
//   }

//   // Lấy công việc của người dùng cho báo cáo
//   async getUserTasksForReporting(
//     userId: string,
//     startDate: string,
//     endDate: string
//   ): Promise<Task[]> {
//     // Sử dụng service tasks sẵn có
//     await new Promise((resolve) => setTimeout(resolve, 300));
//     const userTasks = await stacksService.getUserTasks(userId);

//     // Filter các task trong khoảng thời gian
//     return userTasks.filter((task) => {
//       const taskDate = new Date(task.updatedAt);
//       const start = new Date(startDate);
//       const end = new Date(endDate);

//       // Set time to 00:00:00 for start and 23:59:59 for end
//       start.setHours(0, 0, 0, 0);
//       end.setHours(23, 59, 59, 999);

//       return taskDate >= start && taskDate <= end;
//     });
//   }

//   // Xóa báo cáo
//   async deleteReport(reportId: string): Promise<void> {
//     await new Promise((resolve) => setTimeout(resolve, 300));
//     const reportIndex = mockReports.findIndex(
//       (report) => report.id === reportId
//     );

//     if (reportIndex === -1) {
//       throw new Error('Report not found');
//     }

//     mockReports.splice(reportIndex, 1);
//   }

//   // Lấy các loại báo cáo có sẵn
//   async getReportTypes(): Promise<{ id: ReportType; label: string }[]> {
//     await new Promise((resolve) => setTimeout(resolve, 200));

//     return [
//       { id: ReportType.DAILY, label: 'Báo cáo ngày' },
//       { id: ReportType.WEEKLY, label: 'Báo cáo tuần' },
//       { id: ReportType.MONTHLY, label: 'Báo cáo tháng' },
//       { id: ReportType.PROJECT, label: 'Báo cáo dự án' },
//     ];
//   }
// }

// export default new ReportServiceMock();
