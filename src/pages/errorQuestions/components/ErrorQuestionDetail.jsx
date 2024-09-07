import React, { useState, useEffect } from "react";
import axios from "axios";
import { Typography, Box, CircularProgress } from "@mui/material";

const ErrorQuestionDetail = ({ questionUuid }) => {
  const [questionDetail, setQuestionDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuestionDetail = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `/api/error-questions-detail/${questionUuid}`
        );
        setQuestionDetail(response.data);
        setLoading(false);
      } catch (err) {
        console.error("获取错题详情失败:", err);
        setError("获取错题详情失败，请稍后重试。");
        setLoading(false);
      }
    };

    fetchQuestionDetail();
  }, [questionUuid]);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (!questionDetail) {
    return <Typography>未找到错题详情。</Typography>;
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {questionDetail.examName}
      </Typography>
      <Typography variant="body1" gutterBottom>
        题目内容：{questionDetail.content}
      </Typography>
      <Typography variant="body1" gutterBottom>
        正确答案：{questionDetail.correctAnswer}
      </Typography>
      <Typography variant="body1" gutterBottom>
        你的答案：{questionDetail.userAnswer}
      </Typography>
      <Typography variant="body1" gutterBottom>
        解释：{questionDetail.explanation}
      </Typography>
      <Typography variant="body2">
        错误次数：{questionDetail.errorCount}
      </Typography>
    </Box>
  );
};

export default ErrorQuestionDetail;
