import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';
import { USER_ROLES } from '../config/menuItems';

// 示例：如何在路由中使用角色保护
const RoleBasedRouting = () => {
  return (
    <Routes>
      {/* 学生可以访问的页面 */}
      <Route 
        path="/my-exams/*" 
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.STUDENT, USER_ROLES.TEACHER, USER_ROLES.ADMIN]}>
            <MyExams />
          </ProtectedRoute>
        } 
      />
      
      {/* 只有教师和管理员可以访问的页面 */}
      <Route 
        path="/exams/*" 
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.TEACHER, USER_ROLES.ADMIN]}>
            <ExamManagement />
          </ProtectedRoute>
        } 
      />
      
      {/* 只有管理员可以访问的页面 */}
      <Route 
        path="/user-management" 
        element={
          <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
            <UserManagement />
          </ProtectedRoute>
        } 
      />
      
      {/* 使用功能权限检查 */}
      <Route 
        path="/grading-center" 
        element={
          <ProtectedRoute 
            allowedRoles={[USER_ROLES.TEACHER, USER_ROLES.ADMIN]}
            fallbackPath="/my-exams/list"
          >
            <GradingCenter />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};

// 示例组件（实际使用时需要导入真实的组件）
const MyExams = () => <div>我的考试页面</div>;
const ExamManagement = () => <div>考试管理页面</div>;
const UserManagement = () => <div>用户管理页面</div>;
const GradingCenter = () => <div>阅卷中心页面</div>;

export default RoleBasedRouting;
