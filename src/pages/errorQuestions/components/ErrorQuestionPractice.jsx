import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import CommonLayout from "../../../layouts/CommonLayout";
import { getBreadcrumbPaths } from "../../../config/breadcrumbPaths";
import CommonBreadcrumbs from "../../../components/CommonBreadcrumbs";
import axios from "axios";
import QuestionDetailView from "./QuestionDetailView";

const ErrorQuestionPractice = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    const params = location.state?.params || [];
    if (params.length === 0) {
      navigate("/error-questions");
      return;
    }
    fetchQuestions(params);
  }, []);

  // const fetchQuestions = async (uuids) => {
  //   try {
  //     const response = await axios.get("/api/error-questions-practice", {
  //       params: { uuids },
  //     });
  //     setQuestions(response.data);
  //   } catch (error) {
  //     console.error("获取错题练习详情失败:", error);
  //     // 这里可以添加错误处理逻辑，比如显示错误消息
  //   }
  // };

  const fetchQuestions = async (paramsValue) => {
    try {
      const params = new URLSearchParams(paramsValue);
      const response = await axios.get("/api/record/wrong-questions/details", {
        params,
      });
      setQuestions(response.data.data.items);
    } catch (error) {
      console.error("获取错题练习详情失败:", error);
      // 这里可以添加错误处理逻辑，比如显示错误消息
    }
  };

  const handleAnswerChange = (answers) => {
    setUserAnswers(answers);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // const handleSubmit = async () => {
  //   try {
  //     const response = await axios.post(
  //       "/api/error-questions-practice/submit",
  //       {
  //         answers: userAnswers,
  //       }
  //     );
  //     setResults(response.data);
  //     setShowResults(true);
  //   } catch (error) {
  //     console.error("提交答案失败:", error);
  //     // 这里可以添加错误处理逻辑，比如显示错误消息
  //   }
  // };

  const handleSubmit = async () => {
    try {
      const response = await axios.post(
        "/api/my-exams/wrong-questions/practice",
        {
          answers: userAnswers,
        }
      );
      setResults(response.data);
      setShowResults(true);
    } catch (error) {
      console.error("提交答案失败:", error);
      // 这里可以添加错误处理逻辑，比如显示错误消息
    }
  };

  const handleCloseResults = () => {
    setShowResults(false);
    navigate("/error-questions");
  };

  const breadcrumbPaths = getBreadcrumbPaths();

  return (
    <CommonLayout
      currentPage="错题强化"
      maxWidth="md"
      showBreadcrumbs={true}
      BreadcrumbsComponent={() => (
        <CommonBreadcrumbs paths={breadcrumbPaths.errorQuestionPractice} />
      )}
    >
      {questions.length > 0 && (
        <Box sx={{ backgroundColor: "#f5f5f5", padding: 3, borderRadius: 2 }}>
          <QuestionDetailView
            questionDetail={questions[currentQuestionIndex]}
            onAnswerChange={handleAnswerChange}
            header={`问题 ${currentQuestionIndex + 1} / ${questions.length}`}
          />
          <Box
            sx={{
              mt: 3,
              display: "flex",
              justifyContent: "flex-start",
              gap: 2,
            }}
          >
            <Button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              variant="outlined"
            >
              上一题
            </Button>
            {currentQuestionIndex < questions.length - 1 ? (
              <Button onClick={handleNextQuestion} variant="outlined">
                下一题
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                variant="contained"
                color="primary"
              >
                提交
              </Button>
            )}
          </Box>
        </Box>
      )}

      <Dialog
        open={showResults}
        onClose={handleCloseResults}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: "#1976d2", color: "white" }}>
          练习结果
        </DialogTitle>
        <DialogContent>
          {results && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ color: "#1976d2" }}>
                得分: {results.score}/{results.totalScore}
              </Typography>
              {results.questions.map((question, index) => (
                <Box
                  key={index}
                  mt={3}
                  p={2}
                  sx={{ backgroundColor: "#f5f5f5", borderRadius: 1 }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                    问题 {index + 1}
                  </Typography>
                  <Typography>
                    你的答案:{" "}
                    <span
                      style={{
                        color:
                          question.userAnswer === question.correctAnswer
                            ? "green"
                            : "red",
                      }}
                    >
                      {question.userAnswer}
                    </span>
                  </Typography>
                  <Typography>
                    正确答案:{" "}
                    <span style={{ color: "green" }}>
                      {question.correctAnswer}
                    </span>
                  </Typography>
                  <Typography sx={{ mt: 1, fontStyle: "italic" }}>
                    解释: {question.explanation}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseResults}
            variant="contained"
            color="primary"
          >
            关闭
          </Button>
        </DialogActions>
      </Dialog>
    </CommonLayout>
  );
};

export default ErrorQuestionPractice;
