import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home/Home';
import Summary from './pages/Summary';
import ProjectManagement from './pages/CRUD project/ProjectManagement';
import EmployeeManagement from './pages/EmployeeManagement';
import ChatRoom from './pages/ChatRoom';
import Login from './pages/Login/login';  // Import trang Login
import Register from './pages/Register/register'; 
import CreateProject from './pages/CRUD project/CreateProject'
import ProjectDetail from './pages/CRUD project/ProjectDetail';
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />  {/* Route cho trang Login */}
        <Route path="/register" element={<Register />} />  {/* Route cho trang Register */}
        <Route path="/home" element={<Home />} />  {/* Route cho trang Home */}
        <Route path="/summary" element={<Summary />} />  {/* Route cho trang Bảng tổng kết */}
        <Route path="/project-management" element={<ProjectManagement />} />  {/* Route cho trang Quản lý dự án */}
        <Route path="/employee-management" element={<EmployeeManagement />} />  {/* Route cho trang Quản lý nhân viên */}
        <Route path="/chat-room" element={<ChatRoom />} />  {/* Route cho trang Phòng trò chuyện */}
        <Route path="/createproject" element={<CreateProject />} />
        <Route path="/projects/:id" element={<ProjectDetail />} /> 
      </Routes>
    </Router>
  );
};

export default App;
