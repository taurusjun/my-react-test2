import React, { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Snackbar,
} from "@mui/material";
import { setToken } from "../../utils/auth";
import { UserContext } from "../../contexts/UserContext"; // 导入 UserContext

const Login = () => {
  const [username, setUsername] = useState("testuser");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(UserContext); // 从 UserContext 中获取 login 函数

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/login", { username, password });
      const { token, user } = response.data; // 假设后端返回了 token 和 user 信息
      setToken(token);
      login(user); // 使用 login 函数将用户信息添加到 UserContext 中
      // 重定向到之前尝试访问的页面，如果没有则默认到 "/exams/list"
      const from = location.state?.from?.pathname || "/exams/list";
      navigate(from, { replace: true });
    } catch (err) {
      setError("登录失败，请检查用户名和密码");
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
          登录
        </Typography>
        <Box component="form" onSubmit={handleLogin} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="用户名"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="密码"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            登录
          </Button>
        </Box>
      </Box>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError("")}
        message={error}
      />
    </Container>
  );
};

export default Login;
