// // modules/stacks/components/ProjectSelector.tsx
// import React, { useState, useEffect } from 'react';

// import { Project } from '../types/task';
// import styles from '../styles/Stacks.module.css';

// interface ProjectSelectorProps {
//   onSelectProject: (projectId: string | null) => void;
//   selectedProjectId: string | null;
// }

// const ProjectSelector: React.FC<ProjectSelectorProps> = ({
//   onSelectProject,
//   selectedProjectId,
// }) => {
//   const [projects, setProjects] = useState<Project[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);

//   useEffect(() => {
//     const fetchProjects = async () => {
//       try {
//         setLoading(true);
//         const data = await stacksService.getAllProjects();
//         setProjects(data);
//       } catch (error) {
//         console.error('Error fetching projects:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProjects();
//   }, []);

//   return (
//     <div className={styles.projectSelector}>
//       {loading ? (
//         <div className={styles.loading}>Đang tải...</div>
//       ) : (
//         <select
//           value={selectedProjectId || ''}
//           onChange={(e) => onSelectProject(e.target.value || null)}
//           className={styles.projectSelect}
//         >
//           <option value="">Tất cả dự án</option>
//           {projects.map((project) => (
//             <option key={project.id} value={project.id}>
//               {project.name}
//             </option>
//           ))}
//         </select>
//       )}
//     </div>
//   );
// };

// export default ProjectSelector;
