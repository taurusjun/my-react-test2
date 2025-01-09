import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Typography,
  Box,
  CircularProgress,
  Paper,
  Divider,
  Chip,
  Grid,
} from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

const ErrorQuestionDetail = ({ questionDetailUuid }) => {
  const [questionDetail, setQuestionDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuestionDetail = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `/api/error-questions-detail/${questionDetailUuid}`
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
  }, [questionDetailUuid]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="300px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="300px"
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!questionDetail) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="300px"
      >
        <Typography>未找到错题详情。</Typography>
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom color="primary">
        {questionDetail.examName}
      </Typography>
      <Divider sx={{ my: 2 }} />
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item>
          <Chip
            label={`难度: ${questionDetail.difficulty}`}
            color="secondary"
          />
        </Grid>
        <Grid item>
          <Chip
            label={`知识点: ${questionDetail.knowledgePoint}`}
            color="info"
          />
        </Grid>
        <Grid item>
          <Chip
            label={`错误次数: ${questionDetail.errorCount}`}
            color="error"
          />
        </Grid>
      </Grid>
      <Typography variant="h6" gutterBottom>
        题目内容
      </Typography>
      <Typography
        variant="body1"
        paragraph
        sx={{ backgroundColor: "#f5f5f5", p: 2, borderRadius: 1 }}
      >
        {questionDetail.content}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <CheckCircleOutlineIcon color="success" sx={{ mr: 1 }} />
        <Typography variant="h6">正确答案</Typography>
      </Box>
      <Typography
        variant="body1"
        paragraph
        sx={{ backgroundColor: "#e8f5e9", p: 2, borderRadius: 1 }}
      >
        {questionDetail.correctAnswer}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <ErrorOutlineIcon color="error" sx={{ mr: 1 }} />
        <Typography variant="h6">你的答案</Typography>
      </Box>
      <Typography
        variant="body1"
        paragraph
        sx={{ backgroundColor: "#ffebee", p: 2, borderRadius: 1 }}
      >
        {questionDetail.userAnswer}
      </Typography>
      <Typography variant="h6" gutterBottom>
        解释
      </Typography>
      <Typography
        variant="body1"
        sx={{ backgroundColor: "#e3f2fd", p: 2, borderRadius: 1 }}
      >
        {questionDetail.explanation}
      </Typography>
    </Paper>
  );
};

export default ErrorQuestionDetail;
