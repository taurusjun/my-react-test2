import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Typography,
  Box,
  CircularProgress,
  Paper,
  Button,
  Grid,
  Radio,
  Checkbox,
  AppBar,
  Toolbar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  IconButton,
  TextField,
  InputAdornment,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import HomeIcon from "@mui/icons-material/Home";
import ListAltIcon from "@mui/icons-material/ListAlt";
import SaveIcon from "@mui/icons-material/Save";
import SendIcon from "@mui/icons-material/Send";
import { MarkdownRenderer } from "../../../components/markdown";

// Using shared MarkdownRenderer component from src/components/markdown

const ExamPaper = () => {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [currentDetail, setCurrentDetail] = useState(0);
  const [answers, setAnswers] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const fileInputRefs = useRef({});
  // const [isRetake, setIsRetake] = useState(false);
  const [mode, setMode] = useState(0); // 0-新考试,1-继续考试,2-重新考试

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const response = await axios.get(`/api/exams/${uuid}`);
        setExam(response.data.data);
        initializeAnswers(response.data.data);

        // 检查是否是重新参加考试
        const mode = new URLSearchParams(window.location.search).get("mode");
        setMode(mode ? parseInt(mode) : 0);
        //TODO: 根据mode取得答题数据
        // setIsRetake(mode === "1");
      } catch (error) {
        console.error("获取考试数据失败", error);
        setSnackbar({
          open: true,
          message: "获取考试数据失败",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [uuid]);

  const initializeAnswers = (examData) => {
    const initialAnswers = {};
    // examData.sections.forEach((section) => {
    //   section.questions.forEach((question) => {
    //     question.questionDetails.forEach((detail) => {
    //       initialAnswers[detail.uuid] = { content: [], images: [] };
    //     });
    //   });
    // });
    setAnswers(initialAnswers);
  };

  // const handleAnswerChange = (questionUuid, detailUuid, newAnswer) => {
  //   setAnswers((prevAnswers) => ({
  //     ...prevAnswers,
  //     answers: {
  //       ...prevAnswers.answers,
  //       [questionUuid]: {
  //         ...prevAnswers.answers[questionUuid],
  //         [detailUuid]: newAnswer,
  //       },
  //     },
  //   }));
  // };

  const handleAnswerChange = (detailUuid, newContent) => {
    setAnswers((prevAnswers) => {
      const currentAnswer = prevAnswers[detailUuid] || {
        content: [],
        images: [],
      };
      return {
        ...prevAnswers,
        [detailUuid]: {
          ...currentAnswer,
          content: newContent,
        },
      };
    });
  };

  const handleMultipleChoiceChange = (detailUuid, choice) => {
    setAnswers((prevAnswers) => {
      const currentAnswer = prevAnswers[detailUuid] || {
        content: [],
        images: [],
      };
      const newContent = currentAnswer.content.includes(choice)
        ? currentAnswer.content.filter((item) => item !== choice)
        : [...currentAnswer.content, choice];

      newContent.sort();

      return {
        ...prevAnswers,
        [detailUuid]: {
          ...currentAnswer,
          content: newContent,
        },
      };
    });
  };

  // const handleImageUpload = (event, questionUuid, detailUuid) => {
  //   const file = event.target.files[0];
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onloadend = () => {
  //       const imageDataUrl = reader.result;
  //       setAnswers((prevAnswers) => {
  //         const currentAnswer = prevAnswers.answers[questionUuid]?.[
  //           detailUuid
  //         ] || ["", ""];
  //         return {
  //           ...prevAnswers,
  //           answers: {
  //             ...prevAnswers.answers,
  //             [questionUuid]: {
  //               ...prevAnswers.answers[questionUuid],
  //               [detailUuid]: [currentAnswer[0], imageDataUrl],
  //             },
  //           },
  //         };
  //       });
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // };

  // const handleDeleteImage = (questionUuid, detailUuid) => {
  //   setAnswers((prevAnswers) => {
  //     const currentAnswer = prevAnswers.answers[questionUuid]?.[detailUuid] || [
  //       "",
  //       "",
  //     ];
  //     return {
  //       ...prevAnswers,
  //       answers: {
  //         ...prevAnswers.answers,
  //         [questionUuid]: {
  //           ...prevAnswers.answers[questionUuid],
  //           [detailUuid]: [currentAnswer[0], ""], // 保留文本答案，删除图片
  //         },
  //       },
  //     };
  //   });
  //   // 重置文件输入
  //   if (fileInputRefs.current[`${questionUuid}-${detailUuid}`]) {
  //     fileInputRefs.current[`${questionUuid}-${detailUuid}`].value = "";
  //   }
  // };

  const handleImageUpload = (event, detailUuid) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageDataUrl = reader.result;
        setAnswers((prevAnswers) => {
          const currentAnswer = prevAnswers[detailUuid] || {
            content: "",
            images: [],
          };
          return {
            ...prevAnswers,
            [detailUuid]: {
              ...currentAnswer,
              images: [...currentAnswer.images, imageDataUrl],
            },
          };
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteImage = (detailUuid, imageIndex) => {
    setAnswers((prevAnswers) => {
      const currentAnswer = prevAnswers[detailUuid] || {
        content: "",
        images: [],
      };
      return {
        ...prevAnswers,
        [detailUuid]: {
          ...currentAnswer,
          images: currentAnswer.images.filter(
            (_, index) => index !== imageIndex
          ),
        },
      };
    });
    // 重置文件输入
    if (fileInputRefs.current[`${detailUuid}`]) {
      fileInputRefs.current[`${detailUuid}`].value = "";
    }
  };

  const renderQuestionDetailAnswerArea = (detail) => {
    const isMultipleChoice = detail.uiType === "multi_selection";
    const isSingleChoice = detail.uiType === "single_selection";
    const isTrueFalse = detail.uiType === "true_false";
    const isFillInBlank = detail.uiType === "fill_blank";
    const isCalculation = detail.uiType === "calculation";
    const isShortAnswer = detail.uiType === "short_answer";
    const currentAnswer = answers[detail.uuid] || { content: [], images: [] };

    if (isMultipleChoice) {
      return (
        <Box sx={{ mt: 2 }}>
          {detail.rows.map((row, rowIndex) => (
            <Box key={rowIndex} sx={{ display: "flex", mb: 1, alignItems: "flex-start" }}>
              <Checkbox
                checked={currentAnswer.content.includes(
                  String.fromCharCode(65 + rowIndex)
                )}
                onChange={() =>
                  handleMultipleChoiceChange(
                    detail.uuid,
                    String.fromCharCode(65 + rowIndex)
                  )
                }
                sx={{ pt: 0 }}
              />
              <Box>
                <Typography component="span" sx={{ fontWeight: "bold" }}>
                  {`${String.fromCharCode(65 + rowIndex)}. `}
                </Typography>
                <MarkdownRenderer content={row.value} options={{ inline: true }} />
              </Box>
            </Box>
          ))}
        </Box>
      );
    } else if (isTrueFalse) {
      // 使用字符串值“true”和“false”代替boolean值
      const currentValue = currentAnswer.content[0];
      const stringValue = typeof currentValue === 'boolean' ? String(currentValue) : currentValue || "";
      
      return (
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: "flex", mb: 1, alignItems: "flex-start" }}>
            <Radio
              checked={stringValue === "true"}
              onChange={() => handleAnswerChange(detail.uuid, ["true"])}
              value="true"
              sx={{ pt: 0 }}
            />
            <Box>
              <Typography component="span">
                <strong>A. </strong>
                正确
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: "flex", mb: 1, alignItems: "flex-start" }}>
            <Radio
              checked={stringValue === "false"}
              onChange={() => handleAnswerChange(detail.uuid, ["false"])}
              value="false"
              sx={{ pt: 0 }}
            />
            <Box>
              <Typography component="span">
                <strong>B. </strong>
                错误
              </Typography>
            </Box>
          </Box>
        </Box>
      );
    } else if (isSingleChoice) {
      return (
        <Box sx={{ mt: 2 }}>
          {detail.rows.map((row, rowIndex) => (
            <Box key={rowIndex} sx={{ display: "flex", mb: 1, alignItems: "flex-start" }}>
              <Radio
                value={String.fromCharCode(65 + rowIndex)}
                checked={currentAnswer.content[0] === String.fromCharCode(65 + rowIndex)}
                onChange={() => handleAnswerChange(detail.uuid, [String.fromCharCode(65 + rowIndex)])}
                sx={{ pt: 0 }}
              />
              <Box>
                <Typography component="span" sx={{ fontWeight: "bold" }}>
                  {`${String.fromCharCode(65 + rowIndex)}. `}
                </Typography>
                <MarkdownRenderer content={row.value} options={{ inline: true }} />
              </Box>
            </Box>
          ))}
        </Box>
      );
    } else if (isFillInBlank) {
      return (
        <TextField
          fullWidth
          variant="outlined"
          value={currentAnswer.content[0] || ""}
          onChange={(e) => handleAnswerChange(detail.uuid, [e.target.value])}
          placeholder="在此输入您的答案"
        />
      );
    } else if (isCalculation) {
      return (
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={currentAnswer.content[0] || ""}
            onChange={(e) => handleAnswerChange(detail.uuid, [e.target.value])}
            placeholder="在此输入您的计算过程和答案"
          />
          <Box sx={{ mt: 2, display: "flex", alignItems: "center" }}>
            <input
              accept="image/*"
              style={{ display: "none" }}
              id={`upload-image-${detail.uuid}`}
              type="file"
              onChange={(e) => handleImageUpload(e, detail.uuid)}
              ref={(el) => (fileInputRefs.current[`${detail.uuid}`] = el)}
            />
            <label htmlFor={`upload-image-${detail.uuid}`}>
              <Button
                variant="contained"
                component="span"
                startIcon={<CloudUploadIcon />}
              >
                上传解题图片
              </Button>
            </label>
            {currentAnswer.images.map((image, index) => (
              <Box
                key={index}
                sx={{ ml: 2, display: "flex", alignItems: "center" }}
              >
                <img
                  src={image}
                  alt={`解题图片 ${index + 1}`}
                  style={{
                    maxWidth: "100px",
                    maxHeight: "100px",
                    objectFit: "cover",
                  }}
                />
                <IconButton
                  onClick={() => handleDeleteImage(detail.uuid, index)}
                  sx={{ ml: 1 }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
          </Box>
        </Box>
      );
    } else if (isShortAnswer) {
      return (
        <TextField
          fullWidth
          variant="outlined"
          value={currentAnswer.content[0] || ""}
          onChange={(e) => handleAnswerChange(detail.uuid, [e.target.value])}
          placeholder="在此输入您的简答"
          sx={{ mt: 2 }}
        />
      );
    }
  };

  const handleNextQuestion = () => {
    const currentSectionData = exam.sections[currentSection];
    const currentQuestionData = currentSectionData.questions[currentQuestion];

    if (currentDetail < currentQuestionData.questionDetails.length - 1) {
      setCurrentDetail(currentDetail + 1);
    } else if (currentQuestion < currentSectionData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setCurrentDetail(0);
    } else if (currentSection < exam.sections.length - 1) {
      setCurrentSection(currentSection + 1);
      setCurrentQuestion(0);
      setCurrentDetail(0);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentDetail > 0) {
      setCurrentDetail(currentDetail - 1);
    } else if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setCurrentDetail(
        exam.sections[currentSection].questions[currentQuestion - 1]
          .questionDetails.length - 1
      );
    } else if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      const prevSectionQuestions = exam.sections[currentSection - 1].questions;
      setCurrentQuestion(prevSectionQuestions.length - 1);
      setCurrentDetail(
        prevSectionQuestions[prevSectionQuestions.length - 1].questionDetails
          .length - 1
      );
    }
  };

  const calculateSectionDetailCount = (
    targetSection,
    targetQuestion,
    targetDetail
  ) => {
    let count = 0;
    const currentSectionQuestions = exam.sections[targetSection].questions;

    for (let q = 0; q < targetQuestion; q++) {
      count += currentSectionQuestions[q].questionDetails.length;
    }

    return count + targetDetail + 1;
  };

  const handleTemporarySave = async () => {
    try {
      setLoading(true);
      await axios.post(`/api/my-exams/${uuid}/save`, answers);
      setLoading(false);
      setSnackbar({
        open: true,
        message: "答案已暂时保存",
        severity: "success",
      });
    } catch (error) {
      console.error("保存答案失败", error);
      setLoading(false);
      setSnackbar({
        open: true,
        message: "保存答案失败，请重试",
        severity: "error",
      });
    }
  };

  const handleSubmit = async () => {
    setDialogType("submit");
    setOpenDialog(true);
  };

  // 已在判断题中直接使用字符串“true”和“false”值
  // 不再需要在提交时进行转换

  const confirmSubmit = async () => {
    try {
      console.log(answers);
      
      setLoading(true);
      await axios.post(`/api/my-exams/${uuid}/submit`, {
        answers: answers,
        mode: mode,
      });
      setLoading(false);
      navigate(`/exam/result/${uuid}`);
    } catch (error) {
      console.error("提交答案失败", error);
      setLoading(false);
      setSnackbar({
        open: true,
        message: "提交答案失败，请重试",
        severity: "error",
      });
    }
    setOpenDialog(false);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (!exam) {
    return <Typography>未找到考试信息</Typography>;
  }

  const currentSectionData = exam.sections[currentSection];
  const currentQuestionData = currentSectionData.questions[currentQuestion];
  const currentDetailData = currentQuestionData.questionDetails[currentDetail];

  const globalDetailCount = calculateSectionDetailCount(
    currentSection,
    currentQuestion,
    currentDetail
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* 导航栏 */}
      <AppBar position="static">
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              color="inherit"
              onClick={() => navigate("/")}
              sx={{ mr: 1 }}
            >
              <HomeIcon />
            </IconButton>
            <Typography variant="h6" component="div">
              {exam.name}
            </Typography>
          </Box>
          <Box>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleTemporarySave}
              startIcon={<SaveIcon />}
              sx={{ mr: 1, fontWeight: "bold" }}
            >
              暂时保存
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              startIcon={<SendIcon />}
              sx={{
                mr: 1,
                fontWeight: "bold",
                backgroundColor: "error.main",
                "&:hover": {
                  backgroundColor: "error.dark",
                },
              }}
            >
              交卷
            </Button>
            <Button
              color="inherit"
              onClick={() => navigate("/my-exams/list")}
              startIcon={<ListAltIcon />}
            >
              我的考试
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* 主要内容 */}
      <Box sx={{ display: "flex", flexGrow: 1, overflow: "hidden" }}>
        {/* 左侧答题卡 */}
        <Box
          sx={{
            width: "200px",
            borderRight: "1px solid #ccc",
            p: 2,
            overflowY: "auto",
          }}
        >
          <Typography variant="h6" gutterBottom>
            答题卡
          </Typography>
          {exam.sections.map((section, sectionIndex) => (
            <Box key={section.uuid} sx={{ mb: 2 }}>
              <Box sx={{ mb: 1 }}>
                <Typography variant="subtitle2" component="div">
                  {`第${section.order_in_exam}部分`}
                </Typography>
              </Box>
              <Grid container spacing={1}>
                {section.questions.flatMap((question, questionIndex) =>
                  question.questionDetails.map((detail, detailIndex) => {
                    const detailNumber = calculateSectionDetailCount(
                      sectionIndex,
                      questionIndex,
                      detailIndex
                    );
                    const isActive =
                      currentSection === sectionIndex &&
                      currentQuestion === questionIndex &&
                      currentDetail === detailIndex;
                    return (
                      <Grid item key={`${question.uuid}-${detailIndex}`} xs={6}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => {
                            setCurrentSection(sectionIndex);
                            setCurrentQuestion(questionIndex);
                            setCurrentDetail(detailIndex);
                          }}
                          sx={{
                            width: "100%",
                            minWidth: "30px",
                            backgroundColor: isActive ? "red" : "inherit",
                          }}
                        >
                          {detailNumber}
                        </Button>
                      </Grid>
                    );
                  })
                )}
              </Grid>
            </Box>
          ))}
        </Box>

        {/* 右侧目内容 */}
        <Box sx={{ flexGrow: 1, p: 2, overflowY: "auto" }}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}>
              <Typography variant="h6" component="div" sx={{ mr: 1, fontWeight: "bold", flexShrink: 0 }}>
                {`第${currentSectionData.order_in_exam}部分 `}
              </Typography>
              <Box sx={{ flex: 1 }}>
                <MarkdownRenderer 
                  content={currentSectionData.name}
                  sx={{ fontWeight: 600 }}
                  options={{
                    fontSize: "1.25rem",
                    paragraph: { margin: 0, fontWeight: 600 }
                  }}
                />
              </Box>
            </Box>
            <Box sx={{ mt: 3, mb: 2 }}>
              {currentQuestionData.material && (
                <Box sx={{ mb: 2 }}>
                  <MarkdownRenderer
                    content={currentQuestionData.material}
                    sx={{
                      p: 2,
                      backgroundColor: "#f9f9f9",
                      borderRadius: 1, 
                      border: "1px solid #e0e0e0"
                    }}
                    options={{
                      fontSize: "1.1rem",
                      paragraph: { fontStyle: "italic" }
                    }}
                  />
                </Box>
              )}
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" component="div" sx={{ display: "flex", alignItems: "flex-start" }}>
                  <Box sx={{ mr: 1, fontWeight: "bold", flexShrink: 0 }}>
                    {`${
                      currentSectionData.order_in_exam
                    }.${calculateSectionDetailCount(
                      currentSection,
                      currentQuestion,
                      currentDetail
                    )}`}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <MarkdownRenderer 
                      content={currentDetailData.questionContent.value} 
                      options={{ paragraph: { margin: "4px 0" } }}
                    />
                  </Box>
                  <Box sx={{ ml: 2, color: "gray", flexShrink: 0 }}>
                    ({currentDetailData.score} 分)
                  </Box>
                </Typography>
              </Box>
              {currentDetailData.questionContent.image && (
                <img
                  src={currentDetailData.questionContent.image}
                  alt="问题图片"
                  style={{ maxWidth: "100%", marginTop: "8px" }}
                />
              )}
              {renderQuestionDetailAnswerArea(currentDetailData)}
            </Box>
          </Paper>
          {/* 添加上一题/下一题按钮 */}
          <Box sx={{ display: "flex", mt: 2 }}>
            <Button
              variant="contained"
              onClick={handlePreviousQuestion}
              disabled={
                currentSection === 0 &&
                currentQuestion === 0 &&
                currentDetail === 0
              }
              sx={{ mr: 2 }} // 添加右边距
            >
              上一题
            </Button>
            <Button
              variant="contained"
              onClick={handleNextQuestion}
              disabled={
                currentSection === exam.sections.length - 1 &&
                currentQuestion === currentSectionData.questions.length - 1 &&
                currentDetail === currentQuestionData.questionDetails.length - 1
              }
            >
              下一题
            </Button>
          </Box>
        </Box>
      </Box>

      {/* 确认对话框 */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {dialogType === "submit" ? "确认交卷" : "确认操作"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {dialogType === "submit"
              ? "您确定要交卷吗？交卷后将无法再修改答案。"
              : "您确定要执行此操作吗？"}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>取消</Button>
          <Button onClick={confirmSubmit} autoFocus>
            确认
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar 消息提示 */}
      <Snackbar
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={handleCloseSnackbar}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
        sx={{
          top: "100px !important",
          "& .MuiSnackbarContent-root": {
            backgroundColor: snackbar.severity === "success" ? "green" : "red",
          },
        }}
      />

      {/* 加载指示器 */}
      {loading && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
};

export default ExamPaper;
