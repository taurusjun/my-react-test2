import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Button,
  CircularProgress,
  TextField,
  MenuItem,
} from "@mui/material";
import CommonLayout from "../../../layouts/CommonLayout"; // 更新导入
import { menuItems } from "../../../config/menuItems"; // 导入菜单项
import CommonBreadcrumbs from "../../../components/CommonBreadcrumbs";
import { getBreadcrumbPaths } from "../../../config/breadcrumbPaths";

const GradingCenter = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [examFilter, setExamFilter] = useState("");
  const [exams, setExams] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [submissionsResponse, examsResponse] = await Promise.all([
          axios.get("/api/exam-submissions"),
          axios.get("/api/exams"),
        ]);
        setSubmissions(submissionsResponse.data);
        setExams(examsResponse.data);
        setLoading(false);
      } catch (error) {
        console.error("获取数据失败:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleStartGrading = (uuid) => {
    navigate(`/exam/grading/${uuid}`);
  };

  const handleViewResult = (uuid) => {
    navigate(`/exam/result/${uuid}`);
  };

  const filteredSubmissions = examFilter
    ? submissions.filter((submission) => submission.examUuid === examFilter)
    : submissions;

  if (loading) {
    return (
      <CommonLayout currentPage="阅卷中心" menuItems={menuItems}>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      </CommonLayout>
    );
  }

  const breadcrumbPaths = getBreadcrumbPaths();

  return (
    <CommonLayout
      currentPage="阅卷中心"
      maxWidth="xl"
      showBreadcrumbs={true}
      BreadcrumbsComponent={() => (
        <CommonBreadcrumbs paths={breadcrumbPaths.examGrading} />
      )}
    >
      <Typography variant="h4" gutterBottom sx={{ mb: 3, color: "#1976d2" }}>
        阅卷中心
      </Typography>
      <Box sx={{ mb: 3 }}>
        <TextField
          select
          label="选择考试"
          value={examFilter}
          onChange={(e) => setExamFilter(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">所有考试</MenuItem>
          {exams.map((exam) => (
            <MenuItem key={exam.uuid} value={exam.uuid}>
              {exam.name}
            </MenuItem>
          ))}
        </TextField>
      </Box>
      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell sx={{ fontWeight: "bold" }}>考试名称</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>考生姓名</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>分数</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>提交时间</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>状态</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSubmissions.map((submission) => (
              <TableRow key={submission.uuid} hover>
                <TableCell>{submission.examName}</TableCell>
                <TableCell>{submission.studentName}</TableCell>
                <TableCell>
                  {submission.isGraded ? submission.score : "未批改"}
                </TableCell>
                <TableCell>{submission.submissionTime}</TableCell>
                <TableCell>
                  {submission.isGraded ? (
                    <Typography color="success.main">已批改</Typography>
                  ) : (
                    <Typography color="warning.main">未批改</Typography>
                  )}
                </TableCell>
                <TableCell>
                  {submission.isGraded ? (
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleViewResult(submission.uuid)}
                    >
                      查看考卷
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleStartGrading(submission.uuid)}
                    >
                      开始阅卷
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </CommonLayout>
  );
};

export default GradingCenter;
