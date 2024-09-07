import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Typography, Box, Paper } from "@mui/material";
import CommonLayout from "../../../layouts/CommonLayout";
import { getBreadcrumbPaths } from "../../../config/breadcrumbPaths";
import CommonBreadcrumbs from "../../../components/CommonBreadcrumbs";
import axios from "axios";

const ErrorQuestionView = () => {
  const { uuid } = useParams();
  const [question, setQuestion] = useState(null);

  useEffect(() => {
    fetchQuestionDetails();
  }, [uuid]);

  const fetchQuestionDetails = async () => {
    try {
      const response = await axios.get(`/api/error-questions/${uuid}`);
      setQuestion(response.data);
    } catch (error) {
      console.error("获取错题详情失败:", error);
      // 这里可以添加错误处理逻辑，比如显示错误消息
    }
  };

  const breadcrumbPaths = getBreadcrumbPaths();

  return (
    <CommonLayout
      currentPage="错题查看"
      maxWidth="md"
      showBreadcrumbs={true}
      BreadcrumbsComponent={() => (
        <CommonBreadcrumbs paths={breadcrumbPaths.errorQuestionView} />
      )}
    >
      {question && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            {question.examName}
          </Typography>
          <Typography variant="body1" paragraph>
            {question.content}
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1">正确答案</Typography>
            <Typography variant="body1">{question.correctAnswer}</Typography>
          </Box>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1">你的答案：</Typography>
            <Typography variant="body1">{question.userAnswer}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1">解析：</Typography>
            <Typography variant="body1">{question.explanation}</Typography>
          </Box>
        </Paper>
      )}
    </CommonLayout>
  );
};

export default ErrorQuestionView;
