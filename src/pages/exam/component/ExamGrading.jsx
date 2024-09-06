import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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
} from "@mui/material";
import ZoomInIcon from "@mui/icons-material/ZoomIn";

const ExamGrading = () => {
  const { uuid } = useParams();
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState(null);
  const [grades, setGrades] = useState({});
  const [totalScore, setTotalScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [enlargedImage, setEnlargedImage] = useState(null);

  useEffect(() => {
    const fetchExamAndAnswers = async () => {
      try {
        const [examResponse, answersResponse] = await Promise.all([
          axios.get(`/api/examview/${uuid}`),
          axios.get(`/api/exams/${uuid}/answers`),
        ]);
        setExam(examResponse.data);
        setAnswers(answersResponse.data);
        setLoading(false);
        autoGrade(examResponse.data, answersResponse.data);
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
  }, [uuid]);

  const autoGrade = (exam, answers) => {
    const newGrades = {};
    let newTotalScore = 0;

    exam.sections.forEach((section) => {
      section.questions.forEach((question) => {
        question.questionDetails.forEach((detail) => {
          const studentAnswer =
            answers.answers[question.uuid]?.[detail.uuid] || [];
          const correctAnswer = detail.answer;
          let score = 0;

          if (studentAnswer.length > 0) {
            if (
              detail.uiType === "single_selection" ||
              detail.uiType === "multi_selection"
            ) {
              score =
                JSON.stringify(studentAnswer.sort()) ===
                JSON.stringify(correctAnswer.sort())
                  ? detail.score
                  : 0;
            } else {
              // 对于其他类型的题目，暂时给一半分数，后续可以根据需求调整
              score = detail.score / 2;
            }
          }

          newGrades[question.uuid] = {
            ...newGrades[question.uuid],
            [detail.uuid]: score,
          };
          newTotalScore += score;
        });
      });
    });

    setGrades(newGrades);
    setTotalScore(newTotalScore);
  };

  const handleGradeChange = (questionUuid, detailUuid, score) => {
    setGrades((prevGrades) => ({
      ...prevGrades,
      [questionUuid]: {
        ...prevGrades[questionUuid],
        [detailUuid]: Number(score),
      },
    }));
    calculateTotalScore();
  };

  const calculateTotalScore = () => {
    const total = Object.values(grades).reduce(
      (acc, question) =>
        acc +
        Object.values(question).reduce((sum, score) => sum + Number(score), 0),
      0
    );
    setTotalScore(total);
  };

  const handleSubmitGrades = async () => {
    try {
      await axios.post(`/api/exams/${uuid}/grades`, { grades, totalScore });
      setSnackbar({ open: true, message: "成绩提交成功", severity: "success" });
    } catch (error) {
      console.error("Error submitting grades:", error);
      setSnackbar({ open: true, message: "成绩提交失败", severity: "error" });
    }
  };

  const renderAnswer = (answer) => {
    if (Array.isArray(answer)) {
      return answer.map((item, index) => (
        <Box key={index}>
          {item.startsWith("data:image") ? (
            <Box>
              <img
                src={item}
                alt="答案图片"
                style={{ maxWidth: "100px", maxHeight: "100px" }}
              />
              <IconButton onClick={() => setEnlargedImage(item)}>
                <ZoomInIcon />
              </IconButton>
            </Box>
          ) : (
            <Typography>{item}</Typography>
          )}
        </Box>
      ));
    }
    return <Typography>{answer}</Typography>;
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (!exam || !answers) {
    return <Typography>未找到试卷或答案信息</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {exam.name} - 批改
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>题号</TableCell>
              <TableCell>题目</TableCell>
              <TableCell>标准答案</TableCell>
              <TableCell>学生答案</TableCell>
              <TableCell>分数</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {exam.sections.map((section) =>
              section.questions.map((question) =>
                question.questionDetails.map((detail, index) => (
                  <TableRow key={`${question.uuid}-${detail.uuid}`}>
                    <TableCell>{`${section.order_in_exam}.${
                      index + 1
                    }`}</TableCell>
                    <TableCell>{detail.questionContent.value}</TableCell>
                    <TableCell>{renderAnswer(detail.answer)}</TableCell>
                    <TableCell>
                      {renderAnswer(
                        answers.answers[question.uuid]?.[detail.uuid] ||
                          "未作答"
                      )}
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        inputProps={{ min: 0, max: detail.score }}
                        value={grades[question.uuid]?.[detail.uuid] || 0}
                        onChange={(e) =>
                          handleGradeChange(
                            question.uuid,
                            detail.uuid,
                            e.target.value
                          )
                        }
                        onBlur={calculateTotalScore}
                      />
                      / {detail.score}
                    </TableCell>
                  </TableRow>
                ))
              )
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Box
        sx={{
          mt: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">
          总分: {totalScore} / {exam.totalScore}
        </Typography>
        <Button variant="contained" onClick={handleSubmitGrades}>
          提交成绩
        </Button>
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
      {enlargedImage && (
        <Dialog open={!!enlargedImage} onClose={() => setEnlargedImage(null)}>
          <img
            src={enlargedImage}
            alt="放大的图片"
            style={{ maxWidth: "100%", maxHeight: "90vh" }}
          />
        </Dialog>
      )}
    </Box>
  );
};

export default ExamGrading;
