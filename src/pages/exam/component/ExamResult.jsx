import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Dialog,
  IconButton,
} from "@mui/material";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import CommonLayout from "../../../layouts/CommonLayout";
import CommonBreadcrumbs from "../../../components/CommonBreadcrumbs";
import { getBreadcrumbPaths } from "../../../config/breadcrumbPaths";

const ExamResult = () => {
  const { uuid } = useParams();
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState(null);
  const [grades, setGrades] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enlargedImage, setEnlargedImage] = useState(null);

  useEffect(() => {
    const fetchExamResultData = async () => {
      try {
        const [examResponse, answersResponse, gradesResponse] =
          await Promise.all([
            axios.get(`/api/examview/${uuid}`),
            axios.get(`/api/exams/${uuid}/answers`),
            axios.get(`/api/exams/${uuid}/grades`),
          ]);
        setExam(examResponse.data);
        setAnswers(answersResponse.data);
        setGrades(gradesResponse.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching exam result data:", error);
        setLoading(false);
      }
    };

    fetchExamResultData();
  }, [uuid]);

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

  const breadcrumbPaths = getBreadcrumbPaths().examResult;

  if (loading) {
    return (
      <CommonLayout
        currentPage="考试结果"
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

  if (!exam || !answers || !grades) {
    return (
      <CommonLayout
        currentPage="考试结果"
        showBreadcrumbs={true}
        BreadcrumbsComponent={() => (
          <CommonBreadcrumbs paths={breadcrumbPaths} />
        )}
      >
        <Typography>未找到考试结果信息</Typography>
      </CommonLayout>
    );
  }

  return (
    <CommonLayout
      currentPage={`${exam?.name || "考试"} - 结果`}
      showBreadcrumbs={true}
      BreadcrumbsComponent={() => <CommonBreadcrumbs paths={breadcrumbPaths} />}
    >
      <Typography variant="h4" gutterBottom sx={{ mb: 3, color: "#1976d2" }}>
        {exam?.name || "考试"} - 结果
      </Typography>
      <Typography variant="h6" gutterBottom>
        总分: {grades.totalScore} / {exam.totalScore}
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>题号</TableCell>
              <TableCell>题目</TableCell>
              <TableCell>标准答案</TableCell>
              <TableCell>您的答案</TableCell>
              <TableCell>得分</TableCell>
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
                      {grades.grades[question.uuid]?.[detail.uuid]} /{" "}
                      {detail.score}
                    </TableCell>
                  </TableRow>
                ))
              )
            )}
          </TableBody>
        </Table>
      </TableContainer>
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

export default ExamResult;
