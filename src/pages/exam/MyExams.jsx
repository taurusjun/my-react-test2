import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableHead,
  TableRow,
  CircularProgress,
} from "@mui/material";
import CommonLayout from "../../layouts/CommonLayout";
import CommonBreadcrumbs from "../../components/CommonBreadcrumbs";
import { getBreadcrumbPaths } from "../../config/breadcrumbPaths";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ReplayIcon from "@mui/icons-material/Replay";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import {
  StyledTableCell,
  BodyTableCell,
  StyledTableRow,
  StyledPaper,
  StyledTableContainer,
} from "../../styles/TableStyles";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import TablePagination from "@mui/material/TablePagination";
import Autocomplete from "@mui/material/Autocomplete";
import Chip from "@mui/material/Chip";
import { UserContext } from "../../contexts/UserContext";

const MyExams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState({
    examUuid: "",
    status: "",
    minScore: "",
    maxScore: "",
  });
  const [examOptions, setExamOptions] = useState([]);
  const [selectedExams, setSelectedExams] = useState([]);
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const userUuid = user ? user.uuid : null;

  useEffect(() => {
    if (userUuid) {
      fetchExams();
    }
    fetchExamNames();
  }, [page, pageSize, filters, userUuid]);

  const fetchExams = async () => {
    if (!userUuid) return;
    setLoading(true);
    try {
      const response = await axios.get("/api/my-exams", {
        params: {
          page,
          pageSize,
          userUuid,
          ...filters,
        },
      });
      setExams(response.data.data.exams);
      setTotalCount(response.data.data.totalCount);
    } catch (error) {
      console.error("获取考试列表失败", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExamNames = async (inputValue = "") => {
    try {
      const response = await axios.get("/api/exam-names", {
        params: { query: inputValue },
      });
      setExamOptions(response.data.data);
    } catch (error) {
      console.error("获取考试名称失败", error);
    }
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
    setPage(1); // 重置页码
  };

  const handleStartExam = (examId) => {
    navigate(`/exam/paper/${examId}`);
  };

  const handleViewErrors = (examId) => {
    navigate(`/error-questions/${examId}`);
  };

  const handleExamChange = (event, newValue) => {
    setSelectedExams(newValue);
    setFilters((prevFilters) => ({
      ...prevFilters,
      examUuids: newValue.map((exam) => exam.examUuid),
    }));
    setPage(1); // 重置页码
  };

  const breadcrumbPaths = getBreadcrumbPaths();

  const content = (
    <Box>
      <Box display="flex" flexWrap="wrap" alignItems="center" mb={2}>
        <Autocomplete
          multiple
          options={examOptions}
          getOptionLabel={(option) => option.name}
          renderInput={(params) => (
            <TextField
              {...params}
              label="考试名称"
              variant="outlined"
              size="small"
            />
          )}
          onInputChange={(event, newInputValue) => {
            fetchExamNames(newInputValue);
          }}
          onChange={handleExamChange}
          value={selectedExams}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                label={option.name}
                {...getTagProps({ index })}
                key={option.uuid}
              />
            ))
          }
          sx={{ width: 300, mr: 1, mb: 1 }}
        />
        <TextField
          name="status"
          label="状态"
          select
          value={filters.status}
          onChange={handleFilterChange}
          size="small"
          sx={{ mr: 1, mb: 1, minWidth: 120 }}
        >
          <MenuItem value="">全部</MenuItem>
          <MenuItem value="未参加">未参加</MenuItem>
          <MenuItem value="已完成">已完成</MenuItem>
        </TextField>
        <TextField
          name="minScore"
          label="最低分数"
          type="number"
          value={filters.minScore}
          onChange={handleFilterChange}
          size="small"
          sx={{ mr: 1, mb: 1, width: 100 }}
        />
        <TextField
          name="maxScore"
          label="最高分数"
          type="number"
          value={filters.maxScore}
          onChange={handleFilterChange}
          size="small"
          sx={{ mb: 1, width: 100 }}
        />
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : exams.length === 0 ? (
        <StyledPaper elevation={3} sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="h6">暂无考试记录</Typography>
          <Typography variant="body2" color="textSecondary">
            当有新的考试安排时，将会显示在这里。
          </Typography>
        </StyledPaper>
      ) : (
        <>
          <StyledTableContainer>
            <Table>
              <TableHead>
                <StyledTableRow>
                  <StyledTableCell>考试名称</StyledTableCell>
                  <StyledTableCell align="center">状态</StyledTableCell>
                  <StyledTableCell align="center">分数</StyledTableCell>
                  <StyledTableCell align="center">考试时间</StyledTableCell>
                  <StyledTableCell>操作</StyledTableCell>
                </StyledTableRow>
              </TableHead>
              <TableBody>
                {exams.map((exam) => (
                  <StyledTableRow key={exam.uuid}>
                    <BodyTableCell>{exam.examName}</BodyTableCell>
                    <BodyTableCell align="center">
                      <Typography
                        variant="body2"
                        sx={{
                          color: exam.isDone ? "success.main" : "warning.main",
                          fontWeight: "bold",
                        }}
                      >
                        {exam.isDone ? "已完成" : "未参加"}
                      </Typography>
                    </BodyTableCell>
                    <BodyTableCell align="center">
                      {exam.isDone ? exam.maxScore : "-"}
                    </BodyTableCell>
                    <BodyTableCell align="center">
                      {exam.isDone ? exam.doneTime : "-"}
                    </BodyTableCell>
                    <BodyTableCell>
                      {!exam.isDone ? (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleStartExam(exam.examUuid)}
                          startIcon={<PlayArrowIcon />}
                        >
                          开始考试
                        </Button>
                      ) : (
                        <Box>
                          <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => handleStartExam(exam.examUuid)}
                            startIcon={<ReplayIcon />}
                            sx={{ mr: 1 }}
                          >
                            再次参加
                          </Button>
                          <Button
                            variant="outlined"
                            color="secondary"
                            onClick={() => handleViewErrors(exam.examUuid)}
                            startIcon={<ErrorOutlineIcon />}
                          >
                            查看错题
                          </Button>
                        </Box>
                      )}
                    </BodyTableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </StyledTableContainer>
          <Box mt={2} display="flex" justifyContent="flex-end">
            <TablePagination
              component="div"
              count={totalCount}
              page={page - 1}
              onPageChange={(event, newPage) => setPage(newPage + 1)}
              rowsPerPage={pageSize}
              onRowsPerPageChange={(event) => {
                setPageSize(parseInt(event.target.value, 10));
                setPage(1);
              }}
              labelRowsPerPage="每页行数"
            />
          </Box>
        </>
      )}
    </Box>
  );

  return (
    <CommonLayout
      currentPage="我的考试"
      maxWidth="lg"
      showBreadcrumbs={true}
      BreadcrumbsComponent={() => (
        <CommonBreadcrumbs paths={breadcrumbPaths.myExams} />
      )}
    >
      <StyledPaper>{content}</StyledPaper>
    </CommonLayout>
  );
};

export default MyExams;
