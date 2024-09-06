import React from "react";
import { Route, Routes } from "react-router-dom";
import MainLayout from "./user/layouts/MainLayout";
import Welcome from "./Welcome";
import UserCenter from "./user/UserCenter";
import { menuItems } from "../config/menuItems";

const Landing = () => {
  return (
    <MainLayout menuItems={menuItems}>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/user-center" element={<UserCenter />} />
        {/* 添加其他路由 */}
      </Routes>
    </MainLayout>
  );
};

export default Landing;
