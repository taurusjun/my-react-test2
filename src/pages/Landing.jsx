import React, { useContext } from "react";
import { Route, Routes } from "react-router-dom";
import MainLayout from "./user/layouts/MainLayout";
import Welcome from "./Welcome";
import UserCenter from "./user/UserCenter";
import { menuItems, getMenuItemsByRole, USER_ROLES } from "../config/menuItems";
import { UserContext } from "../contexts/UserContext";

const Landing = () => {
  const { user } = useContext(UserContext);

  // 根据用户角色获取正确的菜单
  const userRole = user?.role || USER_ROLES.STUDENT;
  const userMenuItems = getMenuItemsByRole(userRole);

  return (
    <MainLayout menuItems={userMenuItems}>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/user-center" element={<UserCenter />} />
        {/* 添加其他路由 */}
      </Routes>
    </MainLayout>
  );
};

export default Landing;
