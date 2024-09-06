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
  FormControlLabel,
  RadioGroup,
  FormGroup,
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

const ExamPaper = () => {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [currentDetail, setCurrentDetail] = useState(0);
  const [answers, setAnswers] = useState({ examUuid: uuid, answers: {} });
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const fileInputRefs = useRef({});

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const response = await axios.get(`/api/examview/${uuid}`);
        setExam(response.data);
        initializeAnswers(response.data);
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
    examData.sections.forEach((section) => {
      section.questions.forEach((question) => {
        initialAnswers[question.uuid] = {};
        question.questionDetails.forEach((detail) => {
          initialAnswers[question.uuid][detail.uuid] = [];
        });
      });
    });
    setAnswers({ examUuid: uuid, answers: initialAnswers });
  };

  const handleAnswerChange = (questionUuid, detailUuid, newAnswer) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      answers: {
        ...prevAnswers.answers,
        [questionUuid]: {
          ...prevAnswers.answers[questionUuid],
          [detailUuid]: newAnswer,
        },
      },
    }));
  };

  const handleImageUpload = (event, questionUuid, detailUuid) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageDataUrl = reader.result;
        setAnswers((prevAnswers) => {
          const currentAnswer = prevAnswers.answers[questionUuid]?.[
            detailUuid
          ] || ["", ""];
          return {
            ...prevAnswers,
            answers: {
              ...prevAnswers.answers,
              [questionUuid]: {
                ...prevAnswers.answers[questionUuid],
                [detailUuid]: [currentAnswer[0], imageDataUrl],
              },
            },
          };
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteImage = (questionUuid, detailUuid) => {
    setAnswers((prevAnswers) => {
      const currentAnswer = prevAnswers.answers[questionUuid]?.[detailUuid] || [
        "",
        "",
      ];
      return {
        ...prevAnswers,
        answers: {
          ...prevAnswers.answers,
          [questionUuid]: {
            ...prevAnswers.answers[questionUuid],
            [detailUuid]: [currentAnswer[0], ""], // 保留文本答案，删除图片
          },
        },
      };
    });
    // 重置文件输入
    if (fileInputRefs.current[`${questionUuid}-${detailUuid}`]) {
      fileInputRefs.current[`${questionUuid}-${detailUuid}`].value = "";
    }
  };

  const renderQuestionOptions = (detail, questionUuid) => {
    const isMultipleChoice = detail.uiType === "multi_selection";
    const isSingleChoice = detail.uiType === "single_selection";
    const isFillInBlank = detail.uiType === "fill_in_blank";
    const isCalculation = detail.uiType === "calculation";
    const currentAnswer = answers.answers[questionUuid]?.[detail.uuid] || [];

    if (isMultipleChoice) {
      return (
        <FormGroup>
          {detail.rows.map((row, rowIndex) => (
            <FormControlLabel
              key={rowIndex}
              control={
                <Checkbox
                  checked={currentAnswer.includes(
                    String.fromCharCode(65 + rowIndex)
                  )}
                  onChange={(e) => {
                    const newAnswer = e.target.checked
                      ? [...currentAnswer, String.fromCharCode(65 + rowIndex)]
                      : currentAnswer.filter(
                          (item) => item !== String.fromCharCode(65 + rowIndex)
                        );
                    handleAnswerChange(questionUuid, detail.uuid, newAnswer);
                  }}
                />
              }
              label={`${String.fromCharCode(65 + rowIndex)}. ${row.value}`}
            />
          ))}
        </FormGroup>
      );
    } else if (isSingleChoice) {
      return (
        <RadioGroup
          value={currentAnswer[0] || ""}
          onChange={(e) =>
            handleAnswerChange(questionUuid, detail.uuid, [e.target.value])
          }
        >
          {detail.rows.map((row, rowIndex) => (
            <FormControlLabel
              key={rowIndex}
              value={String.fromCharCode(65 + rowIndex)}
              control={<Radio />}
              label={`${String.fromCharCode(65 + rowIndex)}. ${row.value}`}
            />
          ))}
        </RadioGroup>
      );
    } else if (isFillInBlank) {
      return (
        <TextField
          fullWidth
          variant="standard"
          value={currentAnswer[0] || ""}
          onChange={(e) =>
            handleAnswerChange(questionUuid, detail.uuid, [e.target.value])
          }
          placeholder="在此输入您的答案"
          InputProps={{
            disableUnderline: true,
            startAdornment: (
              <InputAdornment position="start">答：</InputAdornment>
            ),
          }}
          sx={{
            mt: 2,
            "& .MuiInputBase-root": {
              borderBottom: "1px solid #000",
              paddingBottom: "4px",
            },
            "& .MuiInputBase-input": {
              padding: "0 0 4px",
            },
          }}
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
            value={currentAnswer[0] || ""}
            onChange={(e) =>
              handleAnswerChange(questionUuid, detail.uuid, [
                e.target.value,
                currentAnswer[1] || "",
              ])
            }
            placeholder="在此输入您的计算过程和答案"
          />
          <Box sx={{ mt: 2, display: "flex", alignItems: "center" }}>
            <input
              accept="image/*"
              style={{ display: "none" }}
              id={`upload-image-${detail.uuid}`}
              type="file"
              onChange={(e) => handleImageUpload(e, questionUuid, detail.uuid)}
              ref={(el) =>
                (fileInputRefs.current[`${questionUuid}-${detail.uuid}`] = el)
              }
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
            {currentAnswer[1] && (
              <Box sx={{ ml: 2, display: "flex", alignItems: "center" }}>
                <img
                  src={currentAnswer[1]}
                  alt="解题图片"
                  style={{
                    maxWidth: "100px",
                    maxHeight: "100px",
                    objectFit: "cover",
                  }}
                />
                <IconButton
                  onClick={() => handleDeleteImage(questionUuid, detail.uuid)}
                  sx={{ ml: 1 }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            )}
          </Box>
        </Box>
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
      await axios.post(`/api/exams/${uuid}/save`, answers);
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

  const confirmSubmit = async () => {
    try {
      console.log(answers);
      setLoading(true);
      await axios.post(`/api/exams/${uuid}/submit`, answers);
      setLoading(false);
      navigate(`/exam-result/${uuid}`);
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
          <Typography variant="h6" component="div">
            {exam.name}
          </Typography>
          <Box>
            <Button
              color="inherit"
              onClick={handleTemporarySave}
              sx={{ mr: 1 }}
            >
              暂时保存
            </Button>
            <Button color="inherit" onClick={handleSubmit}>
              交卷
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
              <Typography variant="subtitle2" gutterBottom>
                {`第${section.order_in_exam}部分 ${section.name}`}
              </Typography>
              <Grid container spacing={1}>
                {section.questions.flatMap((question, questionIndex) =>
                  question.questionDetails.map((detail, detailIndex) => {
                    const detailNumber = calculateSectionDetailCount(
                      sectionIndex,
                      questionIndex,
                      detailIndex
                    );
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
                          sx={{ width: "100%", minWidth: "30px" }}
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

        {/* 右侧题目内容 */}
        <Box sx={{ flexGrow: 1, p: 2, overflowY: "auto" }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {`第${currentSectionData.order_in_exam}部分 ${currentSectionData.name}`}
            </Typography>
            <Box sx={{ mt: 3, mb: 2 }}>
              {currentQuestionData.material && (
                <Typography
                  variant="body1"
                  sx={{
                    fontStyle: "italic",
                    mb: 1,
                    fontSize: "1.1rem",
                  }}
                >
                  {currentQuestionData.material}
                </Typography>
              )}
              <Typography variant="body1">
                <strong>
                  {`${
                    currentSectionData.order_in_exam
                  }.${calculateSectionDetailCount(
                    currentSection,
                    currentQuestion,
                    currentDetail
                  )}`}{" "}
                </strong>
                {currentDetailData.questionContent.value}
                <span style={{ marginLeft: "8px", color: "gray" }}>
                  ({currentDetailData.score} 分)
                </span>
              </Typography>
              {currentDetailData.questionContent.image && (
                <img
                  src={currentDetailData.questionContent.image}
                  alt="问题图片"
                  style={{ maxWidth: "100%", marginTop: "8px" }}
                />
              )}
              {renderQuestionOptions(
                currentDetailData,
                currentQuestionData.uuid
              )}
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
