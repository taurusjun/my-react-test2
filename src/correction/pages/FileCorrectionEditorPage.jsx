import React from "react";
import { useParams, useNavigate } from "react-router-dom"; // 添加 useNavigate
import FileCorrectionEditor from "../components/FileCorrectionEditor";
import {
  Box,
  Toolbar,
  Button,
  Typography,
  IconButton,
  AppBar,
} from "@mui/material"; // 添加必要的组件
import HomeIcon from "@mui/icons-material/Home"; // 添加图标

const FileCorrectionEditorPage = () => {
  const { fileUuid } = useParams();
  const navigate = useNavigate(); // 初始化 navigate

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* 导航栏 */}
      <AppBar position="static">
        {" "}
        {/* 添加 AppBar */}
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              color="inherit"
              onClick={() => navigate("/")} // 添加返回主页的功能
              sx={{ mr: 1 }}
            >
              <HomeIcon />
            </IconButton>
            <Typography variant="h6" component="div">
              文件修正编辑
            </Typography>
          </Box>
          <Box>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => {
                /* 暂时保存逻辑 */
              }}
              sx={{ mr: 1, fontWeight: "bold" }}
            >
              暂时保存
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                /* 提交逻辑 */
              }}
              sx={{
                mr: 1,
                fontWeight: "bold",
                backgroundColor: "error.main",
                "&:hover": {
                  backgroundColor: "error.dark",
                },
              }}
            >
              提交
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      <FileCorrectionEditor fileUuid={fileUuid} editable={true} />
      {/* 使 md 文件可编辑 */}
    </Box>
  );
};

export default FileCorrectionEditorPage;
