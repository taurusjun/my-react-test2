import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Typography,
  Box,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import CommonLayout from "../../../layouts/CommonLayout";
import { getBreadcrumbPaths } from "../../../config/breadcrumbPaths";
import CommonBreadcrumbs from "../../../components/CommonBreadcrumbs";
import axios from "axios";

const ErrorQuestionPractice = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    const uuids = location.state?.uuids || [];
    if (uuids.length === 0) {
      navigate("/error-questions");
      return;
    }
    fetchQuestions(uuids);
  }, []);

  const fetchQuestions = async (uuids) => {
    try {
      const response = await axios.get("/api/error-questions-practice", {
        params: { uuids },
      });
      setQuestions(response.data);
    } catch (error) {
      console.error("获取错题练习详情失败:", error);
      // 这里可以添加错误处理逻辑，比如显示错误消息
    }
  };

  const handleAnswerChange = (event) => {
    setUserAnswers({
      ...userAnswers,
      [questions[currentQuestionIndex].id]: event.target.value,
    });
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

  const handleSubmit = async () => {
    try {
      const response = await axios.post(
        "/api/error-questions-practice/submit",
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
        <Box>
          <Typography variant="h5" gutterBottom>
            问题 {currentQuestionIndex + 1} / {questions.length}
          </Typography>
          <Typography variant="body1" paragraph>
            {questions[currentQuestionIndex].content}
          </Typography>
          <RadioGroup
            value={userAnswers[questions[currentQuestionIndex].id] || ""}
            onChange={handleAnswerChange}
          >
            {questions[currentQuestionIndex].options.map((option, index) => (
              <FormControlLabel
                key={index}
                value={option}
                control={<Radio />}
                label={option}
              />
            ))}
          </RadioGroup>
          <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
            <Button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              上一题
            </Button>
            {currentQuestionIndex < questions.length - 1 ? (
              <Button onClick={handleNextQuestion}>下一题</Button>
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

      <Dialog open={showResults} onClose={handleCloseResults}>
        <DialogTitle>练习结果</DialogTitle>
        <DialogContent>
          {results && (
            <Box>
              <Typography variant="h6" gutterBottom>
                得分: {results.score}/{results.totalScore}
              </Typography>
              {results.questions.map((question, index) => (
                <Box key={index} mt={2}>
                  <Typography variant="subtitle1">问题 {index + 1}</Typography>
                  <Typography>你的答案: {question.userAnswer}</Typography>
                  <Typography>正确答案: {question.correctAnswer}</Typography>
                  <Typography>解释: {question.explanation}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseResults}>关闭</Button>
        </DialogActions>
      </Dialog>
    </CommonLayout>
  );
};

export default ErrorQuestionPractice;
