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
  TablePagination,
  Grid, // 确保已导入 Grid
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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const navigate = useNavigate();
  const [studentNameFilter, setStudentNameFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await axios.get("/api/exams");
        setExams(response.data);
      } catch (error) {
        console.error("获取考试列表失败:", error);
      }
    };

    fetchExams();
  }, []);

  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true);
      try {
        const response = await axios.get("/api/exam-submissions", {
          params: {
            examUuid: examFilter,
            studentName: studentNameFilter,
            class: classFilter, // 添加班级过滤参数
            page: page + 1,
            pageSize: rowsPerPage,
          },
        });
        setSubmissions(response.data.submissions);
        setTotalCount(response.data.totalCount);
        setLoading(false);
      } catch (error) {
        console.error("获取提交数据失败:", error);
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [examFilter, studentNameFilter, classFilter, page, rowsPerPage]);

  const handleStartGrading = (uuid) => {
    navigate(`/exam/grading/${uuid}`);
  };

  const handleViewResult = (uuid) => {
    navigate(`/exam/result/${uuid}`);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

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
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <TextField
              select
              fullWidth
              size="small"
              label="选择考试"
              value={examFilter}
              onChange={(e) => setExamFilter(e.target.value)}
            >
              <MenuItem value="">所有考试</MenuItem>
              {exams.map((exam) => (
                <MenuItem key={exam.uuid} value={exam.uuid}>
                  {exam.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <TextField
              fullWidth
              label="搜索考生姓名"
              value={studentNameFilter}
              onChange={(e) => setStudentNameFilter(e.target.value)}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <TextField
              fullWidth
              label="搜索班级"
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              size="small"
            />
          </Grid>
        </Grid>
      </Box>
      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell sx={{ fontWeight: "bold" }}>考试名称</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>考生班级</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>考生姓名</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>分数</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>提交时间</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>状态</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {submissions.map((submission) => (
              <TableRow key={submission.uuid} hover>
                <TableCell>{submission.examName}</TableCell>
                <TableCell>{submission.studentClass}</TableCell>
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
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </CommonLayout>
  );
};

export default GradingCenter;
