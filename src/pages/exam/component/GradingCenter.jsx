import React, { useState, useEffect, useCallback } from "react";
import { debounce } from "lodash";
import { format, parseISO } from "date-fns";
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
  
  // Helper function to format dates consistently
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      // Check if the date is in ISO format
      if (dateString.includes('T')) {
        return format(parseISO(dateString), 'yyyy-MM-dd HH:mm:ss');
      }
      // If it's already in the expected format, return as is
      return dateString;
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString; // Return the original string if parsing fails
    }
  };
  const [studentNameFilter, setStudentNameFilter] = useState("");
  const [studentNameInput, setStudentNameInput] = useState("");
  
  // Debounced function for student name search
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSetStudentNameFilter = useCallback(
    debounce((value) => {
      setStudentNameFilter(value);
    }, 500),
    []
  );
  
  // Effect to update the filter when input changes
  useEffect(() => {
    debouncedSetStudentNameFilter(studentNameInput);
    return () => {
      debouncedSetStudentNameFilter.cancel();
    };
  }, [studentNameInput, debouncedSetStudentNameFilter]);
  const [classFilter, setClassFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await axios.get("/api/exam-names", {
          params: { query: "" },
        });
        setExams(response.data.data);
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
        setSubmissions(response.data.data.submissions);
        setTotalCount(response.data.data.totalCount);
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

  const handleStartGrading = (uuid, examUuid, studentUuid, studentName) => {
    navigate(
      `/exam/grading/${uuid}?examUuid=${encodeURIComponent(
        examUuid
      )}&studentUuid=${encodeURIComponent(
        studentUuid
      )}&studentName=${encodeURIComponent(studentName)}`
    );
  };

  const handleViewResult = (uuid, studentUuid, studentName) => {
    navigate(
      `/exam/result/${uuid}?studentUuid=${encodeURIComponent(
        studentUuid
      )}&studentName=${encodeURIComponent(studentName)}`
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
                value={studentNameInput}
                onChange={(e) => setStudentNameInput(e.target.value)}
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
                <MenuItem value="completed">已批改</MenuItem>
                <MenuItem value="pending">未批改</MenuItem>
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
                <StyledTableCell>批改教师</StyledTableCell>
                <StyledTableCell>批改时间</StyledTableCell>
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
                    {submission.gradingStatus === "completed" ? submission.totalScore : "未批改"}
                  </BodyTableCell>
                  <BodyTableCell>{formatDate(submission.doneTime)}</BodyTableCell>
                  <BodyTableCell>{submission.teacherName || "-"}</BodyTableCell>
                  <BodyTableCell>{formatDate(submission.gradingTime)}</BodyTableCell>
                  <BodyTableCell>
                    <Typography
                      color={
                        submission.gradingStatus === "completed" ? "success.main" : "warning.main"
                      }
                    >
                      {submission.gradingStatus === "completed" ? "已批改" : "未批改"}
                    </Typography>
                  </BodyTableCell>
                  <BodyTableCell>
                    {submission.gradingStatus === "completed" ? (
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() =>
                          handleViewResult(
                            submission.uuid,
                            submission.studentUuid,
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
                            submission.examUuid,
                            submission.studentUuid,
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
