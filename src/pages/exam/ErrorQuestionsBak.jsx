import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CommonLayout from "../../layouts/CommonLayout";
import CommonBreadcrumbs from "../../components/CommonBreadcrumbs";
import { getBreadcrumbPaths } from "../../config/breadcrumbPaths";

const ErrorQuestionsBak = () => {
  const { examId } = useParams();
  const [errorQuestions, setErrorQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(examId || "all");
  const [errorCount, setErrorCount] = useState("all");
  const [exams, setExams] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const examsResponse = await axios.get("/api/my-exams");
        setExams(examsResponse.data);

        const errorQuestionsResponse = await axios.get(
          `/api/error-questions/${filter}`
        );
        setErrorQuestions(errorQuestionsResponse.data);
      } catch (error) {
        console.error("获取数据失败", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filter]);

  const filteredQuestions = errorQuestions.filter((question) => {
    if (errorCount === "all") return true;
    return question.errorCount === parseInt(errorCount);
  });

  const breadcrumbPaths = getBreadcrumbPaths();

  const content = (
    <Box>
      <Box sx={{ display: "flex", mb: 2 }}>
        <FormControl sx={{ minWidth: 120, mr: 2 }}>
          <InputLabel>考试筛选</InputLabel>
          <Select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <MenuItem value="all">全部考试</MenuItem>
            {exams.map((exam) => (
              <MenuItem key={exam.id} value={exam.id}>
                {exam.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>错误次数</InputLabel>
          <Select
            value={errorCount}
            onChange={(e) => setErrorCount(e.target.value)}
          >
            <MenuItem value="all">全部</MenuItem>
            <MenuItem value="1">错误1次</MenuItem>
            <MenuItem value="2">错误2次</MenuItem>
            <MenuItem value="3">错误3次及以上</MenuItem>
          </Select>
        </FormControl>
      </Box>
      {loading ? (
        <CircularProgress />
      ) : (
        filteredQuestions.map((question) => (
          <Accordion key={question.id}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>{question.content}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>正确答案: {question.correctAnswer}</Typography>
              <Typography>你的答案: {question.userAnswer}</Typography>
              <Typography>解释: {question.explanation}</Typography>
            </AccordionDetails>
          </Accordion>
        ))
      )}
    </Box>
  );

  return (
    <CommonLayout
      currentPage="错题查看"
      maxWidth="lg"
      showBreadcrumbs={true}
      BreadcrumbsComponent={() => (
        <CommonBreadcrumbs paths={breadcrumbPaths.errorQuestions} />
      )}
    >
      {content}
    </CommonLayout>
  );
};

export default ErrorQuestionsBak;
