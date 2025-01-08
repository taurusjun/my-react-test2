import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import {
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Snackbar,
  IconButton,
  Dialog,
  Alert,
} from "@mui/material";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import CommonLayout from "../../../layouts/CommonLayout";
import CommonBreadcrumbs from "../../../components/CommonBreadcrumbs";
import { getBreadcrumbPaths } from "../../../config/breadcrumbPaths";

const ExamGrading = () => {
  const { uuid } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const examUuid = searchParams.get("examUuid");
  const studentUuid = searchParams.get("studentUuid");
  const studentName = searchParams.get("studentName");
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState(null);
  const [points, setPoints] = useState(null);
  const [grades, setGrades] = useState({});
  const [totalScore, setTotalScore] = useState(0);
  const [examTotalScore, setExamTotalScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [enlargedImage, setEnlargedImage] = useState(null);

  const breadcrumbPaths = getBreadcrumbPaths().examGrading;

  useEffect(() => {
    const fetchExamAndAnswers = async () => {
      try {
        // const [examResponse, answersResponse] = await Promise.all([
        //   axios.get(`/api/exams/${examUuid}`),
        //   axios.get(`/api/my-exams/${examUuid}/answers`),
        // ]);
        // setExam(examResponse.data.data);
        // setAnswers(answersResponse.data);
        const response = await axios.get(`/api/my-exams/grading/${uuid}`);
        const responseData = response.data.data;
        setExam(responseData.examData);
        setAnswers(responseData.answerScoreMap);
        setPoints(responseData.pointMap);
        // pointMap例子是{"03f7d20b-2f1c-4b7b-9a96-8ebb3675e2c8": 2}, 计算总分值
        const examTotalScore = Object.values(responseData.pointMap).reduce(
          (sum, point) => sum + point,
          0
        );
        setExamTotalScore(examTotalScore);

        setLoading(false);
        autoGrade(responseData.examData, responseData.answerScoreMap);
      } catch (error) {
        console.error("Error fetching exam and answers:", error);
        setSnackbar({
          open: true,
          message: "获取试卷和答案失败",
          severity: "error",
        });
        setLoading(false);
      }
    };

    fetchExamAndAnswers();
  }, [examUuid, studentUuid]);

  const autoGrade = (exam, answers) => {
    const newGrades = {};
    let newTotalScore = 0;

    exam.sections.forEach((section) => {
      section.questions.forEach((question) => {
        question.questionDetails.forEach((detail) => {
          const studentAnswer = answers[detail.uuid]?.userAnswer || [];
          const correctAnswer = detail.answer;
          let score = -1; // 默认分数设为 -1

          if (
            detail.uiType === "single_selection" ||
            detail.uiType === "multi_selection"
          ) {
            if (Array.isArray(studentAnswer) && Array.isArray(correctAnswer)) {
              const studentSet = new Set(studentAnswer);
              const correctSet = new Set(correctAnswer);
              if (
                studentSet.size === correctSet.size &&
                [...studentSet].every((value) => correctSet.has(value))
              ) {
                score = points[detail.uuid]?.score || 0;
              } else {
                score = 0; // 选择题答错设为 0 分
              }
            }
          }

          newGrades[detail.uuid] = score;
          if (score >= 0) newTotalScore += score; // 只计算已评分的题目
        });
      });
    });

    setGrades(newGrades);
    setTotalScore(newTotalScore);
  };

  const handleGradeChange = (detailUuid, score) => {
    setGrades((prevGrades) => ({
      ...prevGrades,
      [detailUuid]: Number(score),
    }));
    calculateTotalScore();
  };

  const calculateTotalScore = () => {
    const total = Object.values(grades).reduce(
      (sum, score) => sum + (score >= 0 ? Number(score) : 0),
      0
    );
    setTotalScore(total);
  };

  const handleSubmitGrades = async () => {
    console.log("grades", grades);
    // 检查是否存在未评分的题目
    const hasUngradedQuestions = Object.values(grades).some(
      (score) => score === -1
    );

    if (hasUngradedQuestions) {
      setSnackbar({
        open: true,
        message: "存在未评分的题目，请完成所有评分后再提交",
        severity: "warning",
      });
      return;
    }

    try {
      await axios.post(`/api/my-exams/${examUuid}/grades`, {
        studentUuid,
      });
      setSnackbar({
        open: true,
        message: "成绩提交成功",
        severity: "success",
      });
    } catch (error) {
      console.error("Error submitting grades:", error);
      setSnackbar({
        open: true,
        message: "成绩提交失败",
        severity: "error",
      });
    }
  };

  const renderAnswer = (answer) => {
    if (Array.isArray(answer)) {
      return (
        <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
          {answer.map((item, index) => (
            <Box key={index} sx={{ mr: 1, mb: 1 }}>
              {item.startsWith("data:image") ? (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <img
                    src={item}
                    alt="答案图片"
                    style={{
                      width: "50px",
                      height: "50px",
                      objectFit: "cover",
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => setEnlargedImage(item)}
                  >
                    <ZoomInIcon fontSize="small" />
                  </IconButton>
                </Box>
              ) : (
                <Typography variant="body2">{item}</Typography>
              )}
            </Box>
          ))}
        </Box>
      );
    }
    return <Typography variant="body2">{answer}</Typography>;
  };

  if (loading) {
    return (
      <CommonLayout
        currentPage="试卷批改"
        showBreadcrumbs={true}
        BreadcrumbsComponent={() => (
          <CommonBreadcrumbs paths={breadcrumbPaths} />
        )}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "50vh",
          }}
        >
          <CircularProgress />
        </Box>
      </CommonLayout>
    );
  }

  if (!exam || !answers) {
    return (
      <CommonLayout
        currentPage="试卷批改"
        showBreadcrumbs={true}
        BreadcrumbsComponent={() => (
          <CommonBreadcrumbs paths={breadcrumbPaths} />
        )}
      >
        <Typography>未找到试卷或答案信息</Typography>
      </CommonLayout>
    );
  }

  return (
    <CommonLayout
      currentPage={`${exam?.name || "试卷"} - 批改`}
      showBreadcrumbs={true}
      BreadcrumbsComponent={() => <CommonBreadcrumbs paths={breadcrumbPaths} />}
    >
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{ mb: 3, color: "#1976d2", fontWeight: "bold" }}
        >
          {exam?.name || "试卷"} - 批改
        </Typography>
        <Box sx={{ mb: 2 }}>
          {/* <Typography variant="subtitle1">
            考生班级：{studentClass || "未知"}
          </Typography> */}
          <Typography variant="subtitle1">
            考生姓名：{studentName || "未知"}
          </Typography>
        </Box>
        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell sx={headerCellStyle}>题号</TableCell>
                <TableCell sx={headerCellStyle}>题目</TableCell>
                <TableCell sx={headerCellStyle}>标准答案</TableCell>
                <TableCell sx={headerCellStyle}>学生答案</TableCell>
                <TableCell sx={headerCellStyle}>已有分数</TableCell>
                <TableCell sx={headerCellStyle}>分数</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {exam.sections.map((section) =>
                section.questions.map((question) =>
                  question.questionDetails.map((detail, index) => (
                    <TableRow
                      key={detail.uuid}
                      sx={{
                        "&:nth-of-type(odd)": { backgroundColor: "#fafafa" },
                      }}
                    >
                      <TableCell>{`${section.order_in_exam}.${
                        index + 1
                      }`}</TableCell>
                      <TableCell>{detail.questionContent.value}</TableCell>
                      <TableCell>{renderAnswer(detail.answer)}</TableCell>
                      <TableCell>
                        {renderAnswer(
                          answers[detail.uuid]?.userAnswer || "未作答"
                        )}
                      </TableCell>
                      <TableCell>{answers[detail.uuid]?.score || 0}</TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            flexWrap: "nowrap",
                          }}
                        >
                          <TextField
                            type="number"
                            inputProps={{ min: 0, max: detail.score }}
                            value={
                              grades[detail.uuid] === -1
                                ? ""
                                : grades[detail.uuid]
                            }
                            onChange={(e) =>
                              handleGradeChange(detail.uuid, e.target.value)
                            }
                            onBlur={calculateTotalScore}
                            error={grades[detail.uuid] === -1}
                            size="small"
                            sx={{
                              width: "60px",
                              mr: 1,
                              "& .MuiFormHelperText-root": {
                                position: "absolute",
                                top: "100%",
                                left: 0,
                                whiteSpace: "nowrap",
                              },
                            }}
                            helperText={
                              grades[detail.uuid] === -1 ? "请评分" : " "
                            }
                          />
                          <Typography
                            variant="body2"
                            sx={{ whiteSpace: "nowrap" }}
                          >
                            / {points[detail.uuid] || 0}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <Box
        sx={{
          mt: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
          backgroundColor: "#e3f2fd",
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          总分: {totalScore} / {examTotalScore}
        </Typography>
        <Button
          variant="contained"
          onClick={handleSubmitGrades}
          sx={{
            backgroundColor: "#2196f3",
            "&:hover": { backgroundColor: "#1565c0" },
          }}
        >
          提交成绩
        </Button>
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{ top: "150px !important" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      {enlargedImage && (
        <Dialog open={!!enlargedImage} onClose={() => setEnlargedImage(null)}>
          <img
            src={enlargedImage}
            alt="放大的图片"
            style={{ maxWidth: "100%", maxHeight: "90vh" }}
          />
        </Dialog>
      )}
    </CommonLayout>
  );
};

const headerCellStyle = {
  fontWeight: "bold",
  whiteSpace: "nowrap",
};

export default ExamGrading;
