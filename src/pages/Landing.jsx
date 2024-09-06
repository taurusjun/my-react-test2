import React, { useContext } from "react";
import { Link, Route, Routes, useNavigate } from "react-router-dom";
import {
  AppBar,
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
  Button,
} from "@mui/material";
import Welcome from "./Welcome";
import UserCenter from "./UserCenter";
import { UserContext } from "../contexts/UserContext"; // 假设我们有这样一个上下文

const drawerWidth = 240;

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext); // 从上下文中获取用户信息

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Logo
          </Typography>
          <Button color="inherit" onClick={() => navigate("/user-center")}>
            {user ? user.name : "登录"} {/* 显示用户名或"登录"按钮 */}
          </Button>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        <Toolbar /> {/* 这个Toolbar用来给Drawer内容留出AppBar的空间 */}
        <Box sx={{ overflow: "auto" }}>
          <List>
            <ListItemButton component={Link} to="/">
              <ListItemText primary="欢迎" />
            </ListItemButton>
            <ListItemButton component={Link} to="/exam/list">
              <ListItemText primary="考卷列表" />
            </ListItemButton>
            <ListItemButton component={Link} to="/user-center">
              <ListItemText primary="用户中心" />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar /> {/* 这个Toolbar用来给主内容区域留出AppBar的空间 */}
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/user-center" element={<UserCenter />} />
          {/* 添加其他路由 */}
        </Routes>
      </Box>
    </Box>
  );
};

export default Landing;
