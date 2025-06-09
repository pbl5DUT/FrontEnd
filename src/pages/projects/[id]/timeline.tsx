// // pages/projects/[projectId]/timeline.tsx
// import ProjectTimelinePageLayout from '@/modules/projects/components/ProjectTimeline/ProjectTimeline';
// import { useRouter } from 'next/router';
// import { useEffect, useState } from 'react';


// const TimelinePage = () => {
//   const router = useRouter();
//   const { projectId } = router.query;
//   const [projectData, setProjectData] = useState(null);

//   useEffect(() => {
//     if (projectId) {
//       fetchProjectData(Array.isArray(projectId) ? projectId[0] : projectId);
//     }
//   }, [projectId]);

//   const fetchProjectData = async (id: string) => {
//     // Your API call to get project, categories, tasks
//     // setProjectData(data);
//   };

//   if (!projectData) return <div>Loading...</div>;

//   return (
//     <div style={{ padding: '20px' }}>
//       <ProjectTimelinePageLayout 
//         projectId={projectId as string}
//         projectStartDate={projectData.start_date}
//         projectEndDate={projectData.end_date}
//         categories={projectData.categories}
//         tasks={projectData.tasks}
//         onClose={() => router.push(`/projects/${projectId}`)} // Back to project
//       />
//     </div>
//   );
// };

// export default TimelinePage;