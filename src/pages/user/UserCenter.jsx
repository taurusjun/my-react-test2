import React, { useState, useContext, useEffect } from "react";
import { UserContext } from "../../contexts/UserContext";
import CommonLayout from "../../layouts/CommonLayout";
import CommonBreadcrumbs from "../../components/CommonBreadcrumbs";
import { getBreadcrumbPaths } from "../../config/breadcrumbPaths";
import {
  Typography,
  TextField,
  Button,
  Box,
  Snackbar,
  Alert,
} from "@mui/material";
import { menuItems } from "../../config/menuItems";
import axios from "axios";

const UserCenter = () => {
  const { user, updateUser } = useContext(UserContext);
  const [nickname, setNickname] = useState(user?.username || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    if (user) {
      setNickname(user.nickname);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 检查新密码和确认密码是否为空
    if (!newPassword) {
      setSnackbar({
        open: true,
        message: "新密码不能为空",
        severity: "error",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setSnackbar({
        open: true,
        message: "新密码和确认密码不匹配",
        severity: "error",
      });
      return;
    }

    try {
      // 调用后端接口更新用户信息并获取返回的用户数据
      const response = await axios.put("/api/user", {
        nickname,
        newPassword,
      });
      const userData = response.data; // 获取返回的用户数据

      // 调用 UserContext 中的 updateUser 更新用户信息
      updateUser(userData); // 使用返回的 userData 更新用户信息

      setSnackbar({
        open: true,
        message: "用户信息更新成功",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "更新失败: " + error.message,
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const breadcrumbPaths = getBreadcrumbPaths();

  return (
    <CommonLayout
      menuItems={menuItems}
      currentPage="用户中心"
      maxWidth="sm"
      showBreadcrumbs={true}
      BreadcrumbsComponent={() => (
        <CommonBreadcrumbs paths={breadcrumbPaths.userCenter} />
      )}
    >
      <Typography variant="h4" gutterBottom align="center">
        用户中心
      </Typography>
      <Box
        component="form"
        onSubmit={handleSubmit}
        noValidate
        sx={{
          mt: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <TextField
          margin="normal"
          required
          id="nickname"
          label="昵称"
          name="nickname"
          autoComplete="nickname"
          autoFocus
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          sx={{ width: "100%", maxWidth: "400px" }}
        />
        <TextField
          margin="normal"
          required
          name="newPassword"
          label="新密码"
          type="password"
          id="newPassword"
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          sx={{ width: "100%", maxWidth: "400px" }}
        />
        <TextField
          margin="normal"
          required
          name="confirmPassword"
          label="确认新密码"
          type="password"
          id="confirmPassword"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          sx={{ width: "100%", maxWidth: "400px" }}
        />
        <Button
          type="submit"
          variant="contained"
          sx={{ mt: 3, mb: 2, width: "100%", maxWidth: "400px" }}
        >
          更新信息
        </Button>
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </CommonLayout>
  );
};

export default UserCenter;
