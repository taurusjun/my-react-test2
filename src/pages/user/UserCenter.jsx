import React, { useState, useContext } from "react";
import { UserContext } from "../../contexts/UserContext";
import MainLayout from "./layouts/MainLayout";
import {
  Typography,
  TextField,
  Button,
  Box,
  Snackbar,
  Alert,
  Container,
} from "@mui/material";
import { menuItems } from "../../config/menuItems";

const UserCenter = () => {
  const { user, updateUser } = useContext(UserContext);
  const [nickname, setNickname] = useState(user?.nickname || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setSnackbar({
        open: true,
        message: "新密码和确认密码不匹配",
        severity: "error",
      });
      return;
    }

    try {
      await updateUser({ nickname, newPassword });
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

  return (
    <MainLayout menuItems={menuItems}>
      <Container maxWidth="sm">
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
      </Container>
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
    </MainLayout>
  );
};

export default UserCenter;
