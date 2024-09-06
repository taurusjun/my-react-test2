import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated } from "../../utils/auth";

const ProtectedRoute = ({ children }) => {
  const location = useLocation();

  if (!isAuthenticated()) {
    // 重定向到登录页面，同时保存当前路径
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
