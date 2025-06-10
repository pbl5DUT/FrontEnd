// // modules/stacks/components/CreateReportForm.tsx
// import React, { useState, useEffect } from 'react';
// import reportService from '../services/report_service_mock';
// import stacksService from '../services/report_service_mock';
// import {
//   ReportType,
//   ReportStatus,
//   TaskStatus,
//   Project,
//   Task,
//   ReportTask,
//   WorkReport,
// } from '../types/report';
// import styles from '../styles/Reports.module.css';

// interface CreateReportFormProps {
//   userId: string;
//   userName: string;
//   onClose: () => void;
//   onReportCreated: () => void;
// }

// const CreateReportForm: React.FC<CreateReportFormProps> = ({
//   userId,
//   userName,
//   onClose,
//   onReportCreated,
// }) => {
//   // Form states
//   const [reportType, setReportType] = useState<ReportType>(ReportType.WEEKLY);
//   const [title, setTitle] = useState('');
//   const [startDate, setStartDate] = useState('');
//   const [endDate, setEndDate] = useState('');
//   const [selectedProject, setSelectedProject] = useState<string>('');
//   const [summary, setSummary] = useState('');
//   const [challenges, setChallenges] = useState('');
//   const [nextSteps, setNextSteps] = useState('');

//   // Data states
//   const [reportTypes, setReportTypes] = useState<
//     { id: ReportType; label: string }[]
//   >([]);
//   const [projects, setProjects] = useState<Project[]>([]);
//   const [userTasks, setUserTasks] = useState<Task[]>([]);
//   const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
//   const [taskDetails, setTaskDetails] = useState<{
//     [taskId: string]: ReportTask;
//   }>({});

//   // modules/stacks/components/CreateReportForm.tsx (tiếp tục)
//   // UI states
//   const [loading, setLoading] = useState(false);
//   const [isCreating, setIsCreating] = useState(false);
//   const [errors, setErrors] = useState<{ [key: string]: string }>({});

//   // Khởi tạo dates mặc định khi thay đổi loại báo cáo
//   useEffect(() => {
//     const setDefaultDates = () => {
//       const today = new Date();

//       switch (reportType) {
//         case ReportType.DAILY:
//           // Báo cáo ngày: hôm nay
//           setStartDate(today.toISOString().substring(0, 10));
//           setEndDate(today.toISOString().substring(0, 10));
//           break;

//         case ReportType.WEEKLY:
//           // Báo cáo tuần: tuần hiện tại (thứ 2 - chủ nhật)
//           const monday = new Date(today);
//           monday.setDate(today.getDate() - today.getDay() + 1);

//           const sunday = new Date(monday);
//           sunday.setDate(monday.getDate() + 6);

//           setStartDate(monday.toISOString().substring(0, 10));
//           setEndDate(sunday.toISOString().substring(0, 10));
//           break;

//         case ReportType.MONTHLY:
//           // Báo cáo tháng: tháng hiện tại
//           const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
//           const lastDay = new Date(
//             today.getFullYear(),
//             today.getMonth() + 1,
//             0
//           );

//           setStartDate(firstDay.toISOString().substring(0, 10));
//           setEndDate(lastDay.toISOString().substring(0, 10));
//           break;

//         case ReportType.PROJECT:
//           // Báo cáo dự án: mặc định 30 ngày
//           const thirtyDaysAgo = new Date(today);
//           thirtyDaysAgo.setDate(today.getDate() - 30);

//           setStartDate(thirtyDaysAgo.toISOString().substring(0, 10));
//           setEndDate(today.toISOString().substring(0, 10));
//           break;
//       }

//       // Tạo tiêu đề mặc định
//       generateDefaultTitle();
//     };

//     setDefaultDates();
//   }, [reportType]);

//   // Tạo tiêu đề mặc định khi thay đổi loại báo cáo hoặc ngày tháng
//   useEffect(() => {
//     generateDefaultTitle();
//   }, [reportType, startDate, endDate]);

//   // Load dữ liệu
//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       try {
//         // Lấy các loại báo cáo
//         const types = await reportService.getReportTypes();
//         setReportTypes(types);

//         // Lấy danh sách dự án
//         const projectsData = await stacksService.getAllProjects();
//         setProjects(projectsData);
//       } catch (error) {
//         console.error('Error fetching form data:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   // Load tasks khi thay đổi ngày
//   useEffect(() => {
//     if (!startDate || !endDate) return;

//     const fetchTasks = async () => {
//       try {
//         const tasks = await reportService.getUserTasksForReporting(
//           userId,
//           startDate,
//           endDate
//         );

//         // Filter theo dự án nếu có chọn
//         const filteredTasks = selectedProject
//           ? tasks.filter((task) => task.projectId === selectedProject)
//           : tasks;

//         setUserTasks(filteredTasks);

//         // Reset selected tasks
//         setSelectedTasks([]);
//         setTaskDetails({});
//       } catch (error) {
//         console.error('Error fetching tasks:', error);
//       }
//     };

//     fetchTasks();
//   }, [userId, startDate, endDate, selectedProject]);

//   const generateDefaultTitle = () => {
//     if (!startDate || !endDate) return;

//     const start = new Date(startDate);
//     const end = new Date(endDate);

//     let newTitle = '';

//     switch (reportType) {
//       case ReportType.DAILY:
//         newTitle = `Báo cáo ngày ${start.toLocaleDateString('vi-VN')}`;
//         break;

//       case ReportType.WEEKLY:
//         newTitle = `Báo cáo tuần từ ${start.toLocaleDateString(
//           'vi-VN'
//         )} - ${end.toLocaleDateString('vi-VN')}`;
//         break;

//       case ReportType.MONTHLY:
//         newTitle = `Báo cáo tháng ${
//           start.getMonth() + 1
//         }/${start.getFullYear()}`;
//         break;

//       case ReportType.PROJECT:
//         if (selectedProject) {
//           const project = projects.find((p) => p.id === selectedProject);
//           if (project) {
//             newTitle = `Báo cáo dự án ${
//               project.name
//             } (${start.toLocaleDateString('vi-VN')} - ${end.toLocaleDateString(
//               'vi-VN'
//             )})`;
//           }
//         } else {
//           newTitle = `Báo cáo dự án từ ${start.toLocaleDateString(
//             'vi-VN'
//           )} - ${end.toLocaleDateString('vi-VN')}`;
//         }
//         break;
//     }

//     setTitle(newTitle);
//   };

//   const toggleTaskSelection = (taskId: string) => {
//     setSelectedTasks((prev) => {
//       if (prev.includes(taskId)) {
//         // Xóa task khỏi danh sách đã chọn
//         const taskDetailsCopy = { ...taskDetails };
//         delete taskDetailsCopy[taskId];
//         setTaskDetails(taskDetailsCopy);

//         return prev.filter((id) => id !== taskId);
//       } else {
//         // Thêm task và khởi tạo chi tiết
//         const task = userTasks.find((t) => t.id === taskId);
//         if (task) {
//           setTaskDetails((prev) => ({
//             ...prev,
//             [taskId]: {
//               taskId: task.id,
//               title: task.title,
//               status: task.status,
//               progress:
//                 task.status === TaskStatus.DONE
//                   ? 100
//                   : task.status === TaskStatus.IN_PROGRESS
//                   ? 50
//                   : 0,
//               timeSpent: 0,
//               notes: '',
//             },
//           }));
//         }

//         return [...prev, taskId];
//       }
//     });
//   };

//   const updateTaskDetail = (
//     taskId: string,
//     field: keyof ReportTask,
//     value: any
//   ) => {
//     setTaskDetails((prev) => ({
//       ...prev,
//       [taskId]: {
//         ...prev[taskId],
//         [field]: value,
//       },
//     }));
//   };

//   const validateForm = () => {
//     const newErrors: { [key: string]: string } = {};

//     if (!title.trim()) {
//       newErrors.title = 'Vui lòng nhập tiêu đề báo cáo';
//     }

//     if (!startDate) {
//       newErrors.startDate = 'Vui lòng chọn ngày bắt đầu';
//     }

//     if (!endDate) {
//       newErrors.endDate = 'Vui lòng chọn ngày kết thúc';
//     }

//     if (startDate && endDate) {
//       const start = new Date(startDate);
//       const end = new Date(endDate);

//       if (start > end) {
//         newErrors.date = 'Ngày bắt đầu không thể sau ngày kết thúc';
//       }
//     }

//     if (reportType === ReportType.PROJECT && !selectedProject) {
//       newErrors.project = 'Vui lòng chọn dự án cho báo cáo';
//     }

//     if (selectedTasks.length === 0) {
//       newErrors.tasks = 'Vui lòng chọn ít nhất một công việc';
//     }

//     if (!summary.trim()) {
//       newErrors.summary = 'Vui lòng nhập tổng quan báo cáo';
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!validateForm()) {
//       return;
//     }

//     try {
//       setIsCreating(true);

//       const reportTasks: ReportTask[] = selectedTasks.map(
//         (taskId) => taskDetails[taskId]
//       );

//       const projectInfo = selectedProject
//         ? projects.find((p) => p.id === selectedProject)
//         : null;

//       const newReport: Omit<WorkReport, 'id' | 'createdAt' | 'updatedAt'> = {
//         type: reportType,
//         title,
//         userId,
//         userName,
//         status: ReportStatus.DRAFT,
//         projectId: projectInfo?.id,
//         projectName: projectInfo?.name,
//         startDate,
//         endDate,
//         reportTasks,
//         summary,
//         challenges: challenges.trim() || undefined,
//         nextSteps: nextSteps.trim() || undefined,
//       };

//       await reportService.createReport(newReport);
//       onReportCreated();
//       onClose();
//     } catch (error) {
//       console.error('Error creating report:', error);
//     } finally {
//       setIsCreating(false);
//     }
//   };

//   return (
//     <>
//       <div className={styles.formHeader}>
//         <h2 className={styles.formTitle}>Tạo báo cáo mới</h2>
//         <button className={styles.closeButton} onClick={onClose}>
//           ×
//         </button>
//       </div>

//       <div className={styles.formContent}>
//         {loading ? (
//           <div className={styles.loading}>Đang tải dữ liệu...</div>
//         ) : (
//           <form onSubmit={handleSubmit}>
//             <div className={styles.formGroup}>
//               <label htmlFor="reportType" className={styles.formLabel}>
//                 Loại báo cáo *
//               </label>
//               <select
//                 id="reportType"
//                 value={reportType}
//                 onChange={(e) => setReportType(e.target.value as ReportType)}
//                 className={styles.formSelect}
//               >
//                 {reportTypes.map((type) => (
//                   <option key={type.id} value={type.id}>
//                     {type.label}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div className={styles.formGroup}>
//               <label htmlFor="title" className={styles.formLabel}>
//                 Tiêu đề báo cáo *
//               </label>
//               <input
//                 id="title"
//                 type="text"
//                 value={title}
//                 onChange={(e) => setTitle(e.target.value)}
//                 className={`${styles.formInput} ${
//                   errors.title ? styles.inputError : ''
//                 }`}
//               />
//               {errors.title && (
//                 <div className={styles.errorText}>{errors.title}</div>
//               )}
//             </div>

//             <div className={styles.formRow}>
//               <div className={styles.formGroup}>
//                 <label htmlFor="startDate" className={styles.formLabel}>
//                   Từ ngày *
//                 </label>
//                 <input
//                   id="startDate"
//                   type="date"
//                   value={startDate}
//                   onChange={(e) => setStartDate(e.target.value)}
//                   className={`${styles.formInput} ${
//                     errors.startDate || errors.date ? styles.inputError : ''
//                   }`}
//                 />
//                 {errors.startDate && (
//                   <div className={styles.errorText}>{errors.startDate}</div>
//                 )}
//               </div>

//               <div className={styles.formGroup}>
//                 <label htmlFor="endDate" className={styles.formLabel}>
//                   Đến ngày *
//                 </label>
//                 <input
//                   id="endDate"
//                   type="date"
//                   value={endDate}
//                   onChange={(e) => setEndDate(e.target.value)}
//                   className={`${styles.formInput} ${
//                     errors.endDate || errors.date ? styles.inputError : ''
//                   }`}
//                 />
//                 {errors.endDate && (
//                   <div className={styles.errorText}>{errors.endDate}</div>
//                 )}
//               </div>

//               {reportType === ReportType.PROJECT && (
//                 <div className={styles.formGroup}>
//                   <label htmlFor="project" className={styles.formLabel}>
//                     Dự án *
//                   </label>
//                   <select
//                     id="project"
//                     value={selectedProject}
//                     onChange={(e) => setSelectedProject(e.target.value)}
//                     className={`${styles.formSelect} ${
//                       errors.project ? styles.inputError : ''
//                     }`}
//                   >
//                     <option value="">-- Chọn dự án --</option>
//                     {projects.map((project) => (
//                       <option key={project.id} value={project.id}>
//                         {project.name}
//                       </option>
//                     ))}
//                   </select>
//                   {errors.project && (
//                     <div className={styles.errorText}>{errors.project}</div>
//                   )}
//                 </div>
//               )}
//             </div>
//             {errors.date && (
//               <div className={styles.errorText}>{errors.date}</div>
//             )}

//             <div className={styles.formGroup}>
//               <label className={styles.formLabel}>Các công việc *</label>
//               {userTasks.length === 0 ? (
//                 <div className={styles.noTasks}>
//                   Không có công việc nào trong khoảng thời gian đã chọn
//                 </div>
//               ) : (
//                 <>
//                   <div className={styles.taskSelectionList}>
//                     {userTasks.map((task) => (
//                       <div
//                         key={task.id}
//                         className={`${styles.taskSelectionItem} ${
//                           selectedTasks.includes(task.id)
//                             ? styles.selectedTask
//                             : ''
//                         }`}
//                       >
//                         <div className={styles.taskCheckbox}>
//                           <input
//                             type="checkbox"
//                             id={`task-${task.id}`}
//                             checked={selectedTasks.includes(task.id)}
//                             onChange={() => toggleTaskSelection(task.id)}
//                           />
//                           <label htmlFor={`task-${task.id}`}>
//                             {task.title}
//                           </label>
//                         </div>

//                         {selectedTasks.includes(task.id) && (
//                           <div className={styles.taskDetailInputs}>
//                             <div className={styles.taskInputRow}>
//                               <div className={styles.taskInputGroup}>
//                                 <label>Tiến độ (%)</label>
//                                 <input
//                                   type="number"
//                                   min="0"
//                                   max="100"
//                                   value={taskDetails[task.id]?.progress || 0}
//                                   onChange={(e) =>
//                                     updateTaskDetail(
//                                       task.id,
//                                       'progress',
//                                       parseInt(e.target.value)
//                                     )
//                                   }
//                                   className={styles.taskDetailInput}
//                                 />
//                               </div>

//                               <div className={styles.taskInputGroup}>
//                                 <label>Thời gian làm việc (giờ)</label>
//                                 <input
//                                   type="number"
//                                   min="0"
//                                   step="0.5"
//                                   value={taskDetails[task.id]?.timeSpent || 0}
//                                   onChange={(e) =>
//                                     updateTaskDetail(
//                                       task.id,
//                                       'timeSpent',
//                                       parseFloat(e.target.value)
//                                     )
//                                   }
//                                   className={styles.taskDetailInput}
//                                 />
//                               </div>
//                             </div>

//                             <div className={styles.taskInputGroup}>
//                               <label>Ghi chú</label>
//                               <textarea
//                                 value={taskDetails[task.id]?.notes || ''}
//                                 onChange={(e) =>
//                                   updateTaskDetail(
//                                     task.id,
//                                     'notes',
//                                     e.target.value
//                                   )
//                                 }
//                                 className={styles.taskNotesInput}
//                                 placeholder="Mô tả công việc đã làm, tiến độ, vấn đề gặp phải..."
//                                 rows={2}
//                               />
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     ))}
//                   </div>
//                   {errors.tasks && (
//                     <div className={styles.errorText}>{errors.tasks}</div>
//                   )}
//                 </>
//               )}
//             </div>

//             <div className={styles.formGroup}>
//               <label htmlFor="summary" className={styles.formLabel}>
//                 Tổng quan *
//               </label>
//               <textarea
//                 id="summary"
//                 value={summary}
//                 onChange={(e) => setSummary(e.target.value)}
//                 className={`${styles.formTextarea} ${
//                   errors.summary ? styles.inputError : ''
//                 }`}
//                 placeholder="Tóm tắt những công việc đã thực hiện, tiến độ chung..."
//                 rows={4}
//               />
//               {errors.summary && (
//                 <div className={styles.errorText}>{errors.summary}</div>
//               )}
//             </div>

//             <div className={styles.formGroup}>
//               <label htmlFor="challenges" className={styles.formLabel}>
//                 Thách thức & khó khăn
//               </label>
//               <textarea
//                 id="challenges"
//                 value={challenges}
//                 onChange={(e) => setChallenges(e.target.value)}
//                 className={styles.formTextarea}
//                 placeholder="Những khó khăn, thách thức gặp phải trong quá trình làm việc..."
//                 rows={3}
//               />
//             </div>

//             <div className={styles.formGroup}>
//               <label htmlFor="nextSteps" className={styles.formLabel}>
//                 Kế hoạch tiếp theo
//               </label>
//               <textarea
//                 id="nextSteps"
//                 value={nextSteps}
//                 onChange={(e) => setNextSteps(e.target.value)}
//                 className={styles.formTextarea}
//                 placeholder="Những việc sẽ thực hiện trong thời gian tới..."
//                 rows={3}
//               />
//             </div>

//             <div className={styles.formActions}>
//               <button
//                 type="button"
//                 className={styles.cancelButton}
//                 onClick={onClose}
//               >
//                 Hủy
//               </button>

//               <button
//                 type="submit"
//                 className={styles.submitButton}
//                 disabled={isCreating}
//               >
//                 {isCreating ? 'Đang tạo...' : 'Tạo báo cáo'}
//               </button>
//             </div>
//           </form>
//         )}
//       </div>
//     </>
//   );
// };

// export default CreateReportForm;
