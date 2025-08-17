import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import { hasPathPermission, USER_ROLES } from '../../config/menuItems';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ 
  children, 
  requiredRole = null, 
  allowedRoles = null,
  fallbackPath = '/',
  showAccessDenied = true 
}) => {
  const { user } = useContext(UserContext);
  const location = useLocation();
  const navigate = useNavigate();

  // 如果没有用户信息，重定向到登录页
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = user.role || USER_ROLES.STUDENT;

  // 检查特定角色权限
  if (requiredRole && userRole !== requiredRole) {
    if (showAccessDenied) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '50vh',
            textAlign: 'center',
            p: 3
          }}
        >
          <Typography variant="h4" color="error" gutterBottom>
            访问被拒绝
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            您没有权限访问此页面。需要 {requiredRole} 角色。
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate(fallbackPath)}
          >
            返回首页
          </Button>
        </Box>
      );
    }
    return <Navigate to={fallbackPath} replace />;
  }

  // 检查角色列表权限
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    if (showAccessDenied) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '50vh',
            textAlign: 'center',
            p: 3
          }}
        >
          <Typography variant="h4" color="error" gutterBottom>
            访问被拒绝
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            您没有权限访问此页面。需要以下角色之一：{allowedRoles.join(', ')}
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate(fallbackPath)}
          >
            返回首页
          </Button>
        </Box>
      );
    }
    return <Navigate to={fallbackPath} replace />;
  }

  // 检查路径权限
  if (!hasPathPermission(userRole, location.pathname)) {
    if (showAccessDenied) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '50vh',
            textAlign: 'center',
            p: 3
          }}
        >
          <Typography variant="h4" color="error" gutterBottom>
            访问被拒绝
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            您没有权限访问此页面。
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate(fallbackPath)}
          >
            返回首页
          </Button>
        </Box>
      );
    }
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
