import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Snackbar,
} from "@mui/material";
import axios from "axios";

const UserCenter = () => {
  const [nickname, setNickname] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    // 获取用户信息
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await axios.get("/api/user");
      setNickname(response.data.nickname);
    } catch (error) {
      setMessage("获取用户信息失败");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage("两次输入的密码不一致");
      return;
    }

    try {
      await axios.put("/api/user", { nickname, newPassword });
      setMessage("更新成功");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setMessage("更新失败");
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h5">
          用户中心
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="nickname"
            label="昵称"
            name="nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
          <TextField
            margin="normal"
            fullWidth
            name="newPassword"
            label="新密码"
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <TextField
            margin="normal"
            fullWidth
            name="confirmPassword"
            label="确认新密码"
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            更新信息
          </Button>
        </Box>
      </Box>
      <Snackbar
        open={!!message}
        autoHideDuration={6000}
        onClose={() => setMessage("")}
        message={message}
      />
    </Container>
  );
};

export default UserCenter;
