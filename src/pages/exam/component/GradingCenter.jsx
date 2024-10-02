import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Typography,
  Box,
  Table,
  TableBody,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  TextField,
  MenuItem,
  TablePagination,
  Grid,
} from "@mui/material";
import CommonLayout from "../../../layouts/CommonLayout";
import { menuItems } from "../../../config/menuItems";
import CommonBreadcrumbs from "../../../components/CommonBreadcrumbs";
import { getBreadcrumbPaths } from "../../../config/breadcrumbPaths";
import {
  StyledTableCell,
  BodyTableCell,
  StyledTableRow,
  StyledPaper,
  StyledTableContainer,
} from "../../../styles/TableStyles";

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
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await axios.get("/api/exam-names", {
          params: { query: "" },
        });
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
            class: classFilter,
            status: statusFilter,
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
  }, [
    examFilter,
    studentNameFilter,
    classFilter,
    statusFilter,
    page,
    rowsPerPage,
  ]);

  const handleStartGrading = (uuid, studentClass, studentName) => {
    navigate(
      `/exam/grading/${uuid}?class=${encodeURIComponent(
        studentClass
      )}&name=${encodeURIComponent(studentName)}`
    );
  };

  const handleViewResult = (uuid, studentClass, studentName) => {
    navigate(
      `/exam/result/${uuid}?class=${encodeURIComponent(
        studentClass
      )}&name=${encodeURIComponent(studentName)}`
    );
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
      <StyledPaper>
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
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <TextField
                select
                fullWidth
                size="small"
                label="状态"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">所有状态</MenuItem>
                <MenuItem value="graded">已批改</MenuItem>
                <MenuItem value="ungraded">未批改</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </Box>
        <StyledTableContainer>
          <Table>
            <TableHead>
              <StyledTableRow>
                <StyledTableCell>考试名称</StyledTableCell>
                <StyledTableCell>考生班级</StyledTableCell>
                <StyledTableCell>考生姓名</StyledTableCell>
                <StyledTableCell>分数</StyledTableCell>
                <StyledTableCell>提交时间</StyledTableCell>
                <StyledTableCell>状态</StyledTableCell>
                <StyledTableCell>操作</StyledTableCell>
              </StyledTableRow>
            </TableHead>
            <TableBody>
              {submissions.map((submission) => (
                <StyledTableRow key={submission.uuid}>
                  <BodyTableCell>{submission.examName}</BodyTableCell>
                  <BodyTableCell>{submission.studentClass}</BodyTableCell>
                  <BodyTableCell>{submission.studentName}</BodyTableCell>
                  <BodyTableCell>
                    {submission.isGraded ? submission.score : "未批改"}
                  </BodyTableCell>
                  <BodyTableCell>{submission.submissionTime}</BodyTableCell>
                  <BodyTableCell>
                    <Typography
                      color={
                        submission.isGraded ? "success.main" : "warning.main"
                      }
                    >
                      {submission.isGraded ? "已批改" : "未批改"}
                    </Typography>
                  </BodyTableCell>
                  <BodyTableCell>
                    {submission.isGraded ? (
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() =>
                          handleViewResult(
                            submission.uuid,
                            submission.studentClass,
                            submission.studentName
                          )
                        }
                      >
                        查看考卷
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() =>
                          handleStartGrading(
                            submission.uuid,
                            submission.studentClass,
                            submission.studentName
                          )
                        }
                      >
                        开始阅卷
                      </Button>
                    )}
                  </BodyTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </StyledTableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </StyledPaper>
    </CommonLayout>
  );
};

export default GradingCenter;
