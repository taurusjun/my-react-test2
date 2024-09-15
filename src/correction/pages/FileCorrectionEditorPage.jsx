import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // 添加 useNavigate
import FileCorrectionEditor from "../components/FileCorrectionEditor";
import {
  Box,
  Toolbar,
  Button,
  Typography,
  IconButton,
  AppBar,
  Snackbar,
  Alert,
  Container,
} from "@mui/material"; // 添加必要的组件
import HomeIcon from "@mui/icons-material/Home"; // 添加图标
import SaveIcon from "@mui/icons-material/Save";
import SendIcon from "@mui/icons-material/Send";
import axios from "axios";

const FileCorrectionEditorPage = () => {
  const { fileUuid } = useParams();
  const navigate = useNavigate(); // 初始化 navigate
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [editorState, setEditorState] = useState(null);

  const handleTemporarySave = async () => {
    if (editorState && editorState.mdMap) {
      try {
        const markMap = editorState.mdMap.toJSONString();

        await axios.post(`/api/file-corrections/${fileUuid}/temporary-save`, {
          markMap,
        });

        setSnackbar({
          open: true,
          message: "暂时保存成功",
          severity: "success",
        });
      } catch (error) {
        console.error("暂时保存失败:", error);
        setSnackbar({ open: true, message: "暂时保存失败", severity: "error" });
      }
    } else {
      setSnackbar({
        open: true,
        message: "没有可保存的数据",
        severity: "warning",
      });
    }
  };

  const handleSubmit = async () => {
    if (editorState && editorState.mdMap && editorState.exam) {
      try {
        const markMap = editorState.mdMap.toJSONString();
        const examData = editorState.exam;

        await axios.post(`/api/file-corrections/${fileUuid}/submit`, {
          markMap,
          examData,
        });

        setSnackbar({
          open: true,
          message: "提交成功",
          severity: "success",
        });

        // 可以在这里添加导航逻辑，例如返回到文件列表页面
        // navigate('/file-corrections');
      } catch (error) {
        console.error("提交失败:", error);
        setSnackbar({ open: true, message: "提交失败", severity: "error" });
      }
    } else {
      setSnackbar({
        open: true,
        message: "没有可提交的数据",
        severity: "warning",
      });
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        bgcolor: "#f5f5f5",
      }}
    >
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              color="inherit"
              onClick={() => navigate("/")}
              sx={{ mr: 2 }}
            >
              <HomeIcon />
            </IconButton>
            <Typography
              variant="h6"
              component="div"
              sx={{ fontWeight: "bold" }}
            >
              文件修正编辑
            </Typography>
          </Box>
          <Box>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleTemporarySave}
              startIcon={<SaveIcon />}
              sx={{ mr: 2, fontWeight: "bold" }}
            >
              暂时保存
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              startIcon={<SendIcon />}
              sx={{
                fontWeight: "bold",
                bgcolor: "error.main",
                "&:hover": {
                  bgcolor: "error.dark",
                },
              }}
            >
              提交
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Toolbar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        <Box sx={{ bgcolor: "white", borderRadius: 2, boxShadow: 3, p: 3 }}>
          <FileCorrectionEditor
            fileUuid={fileUuid}
            editable={true}
            setEditorState={setEditorState}
          />
        </Box>
      </Container>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{
          top: "200px !important",
          left: "50% !important",
          right: "auto !important",
          transform: "translateX(-50%)",
        }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
          elevation={6}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      {/* 使 md 文件可编辑 */}
    </Box>
  );
};

export default FileCorrectionEditorPage;
