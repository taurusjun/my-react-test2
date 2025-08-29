import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import FileCorrectionEditor from "../components/FileCorrectionEditor";
import ExamPreview from "../components/ExamPreview";
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
  Modal,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import SaveIcon from "@mui/icons-material/Save";
import SendIcon from "@mui/icons-material/Send";
import PreviewIcon from "@mui/icons-material/Preview";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import ExamEditor from "../components/ExamEditor";

const FileCorrectionEditorPage = () => {
  const { fileUuid } = useParams();
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [editorState, setEditorState] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [questionData, setQuestionData] = useState(null);

  const validateExam = (exam) => {
    if (!exam) return false;
    
    // 检查名称
    if (!exam.name || !exam.name.trim()) {
      return false;
    }
    
    // 检查科目
    if (!exam.category || !exam.category.trim()) {
      return false;
    }
    
    // 检查年级信息
    if (!exam.gradeInfo) {
      return false;
    }
    
    if (!exam.gradeInfo.school || !exam.gradeInfo.school.trim()) {
      return false;
    }
    
    if (!exam.gradeInfo.grade || !exam.gradeInfo.grade.trim()) {
      return false;
    }
    
    return true;
  };

  const [errors, setErrors] = useState({
    type: false,
    category: false,
    kn: false,
    school: false,
    grade: false,
    digest: false,
    questionDetails: [
      {
        questionContent: false,
        rows: [],
        answer: false,
        rate: false,
      },
    ],
  });

  const handleTemporarySave = async () => {
    if (editorState && editorState.mdMap) {
      try {
        const markMap = editorState.mdMap.toJSON();
        const examData = {
          uuid: editorState.exam.uuid,
          name: editorState.exam.name,
          category: editorState.exam.category,
          kn: editorState.exam.kn,
          gradeInfo: editorState.exam.gradeInfo,
          source: editorState.exam.source,
        };

        await axios.post(`/api/file-corrections/${fileUuid}/save`, {
          name: editorState.name,
          content: editorState.content,
          mdMap: JSON.stringify(markMap),
          examData: JSON.stringify(examData),
        });

        setSnackbar({
          open: true,
          message: "暂时保存成功",
          severity: "success",
        });
        return Promise.resolve();
      } catch (error) {
        console.error("暂时保存失败:", error);
        setSnackbar({ open: true, message: "暂时保存失败", severity: "error" });
        return Promise.reject();
      }
    } else {
      setSnackbar({
        open: true,
        message: "没有可保存的数据",
        severity: "warning",
      });
      return Promise.reject();
    }
  };

  const handleSubmit = async () => {
    if (editorState && editorState.mdMap && editorState.exam) {
      
      if (!validateExam(editorState.exam)) {
        setSnackbar({
          open: true,
          message: "请填写所有必填字段（名称、科目、学习阶段、年级）",
          severity: "error",
        });
        return;
      }

      try {
        const examData = editorState.exam;

        await axios.post(`/api/file-corrections/${fileUuid}/submit`, examData);

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

  const handlePreviewClick = () => {
    setIsPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      handleTemporarySave().then(() => {
        setCurrentStep(currentStep + 1);
      });
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBackStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const updateExam = (updatedExam) => {
    setEditorState((prevState) => ({
      ...prevState,
      exam: updatedExam,
    }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <FileCorrectionEditor
            fileUuid={fileUuid}
            editable={true}
            setEditorState={setEditorState}
          />
        );
      case 2:
        return editorState && editorState.exam ? (
          <ExamEditor exam={editorState.exam} onExamChange={updateExam} />
        ) : (
          <div>加载中...</div>
        );
      case 3:
        return <ExamPreview exam={editorState.exam} />;
      default:
        return null;
    }
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
              onClick={handleBackStep}
              sx={{ mr: 2, fontWeight: "bold" }}
              disabled={currentStep === 1}
            >
              上一步
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleNextStep}
              sx={{ mr: 2, fontWeight: "bold" }}
              disabled={currentStep === 3}
            >
              下一步
            </Button>
            <Button
              variant="contained"
              onClick={handleTemporarySave}
              startIcon={<SaveIcon />}
              sx={{ mr: 2, fontWeight: "bold" }}
            >
              暂时保存
            </Button>
            <Button
              variant="contained"
              onClick={handlePreviewClick}
              startIcon={<PreviewIcon />}
              sx={{ mr: 2, fontWeight: "bold" }}
            >
              预览
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              startIcon={<SendIcon />}
              sx={{
                fontWeight: "bold",
                bgcolor: "error.main",
                "&:hover": { bgcolor: "error.dark" },
              }}
              // disabled={editorState && editorState.status === "done"}
            >
              提交
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Toolbar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        {renderStep()}
      </Container>
      <Modal
        open={isPreviewOpen}
        onClose={handleClosePreview}
        aria-labelledby="exam-preview-modal"
        aria-describedby="exam-preview-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            maxWidth: 1000,
            maxHeight: "90vh",
            overflow: "auto",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <IconButton
            aria-label="关闭"
            onClick={handleClosePreview}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
          {editorState && editorState.exam && (
            <ExamPreview exam={editorState.exam} />
          )}
        </Box>
      </Modal>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
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
    </Box>
  );
};

export default FileCorrectionEditorPage;
