import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
} from "@mui/material";
import CommonLayout from "../../layouts/CommonLayout";
import CommonBreadcrumbs from "../../components/CommonBreadcrumbs";
import { getBreadcrumbPaths } from "../../config/breadcrumbPaths";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ReplayIcon from "@mui/icons-material/Replay";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

const MyExams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await axios.get("/api/my-exams");
        setExams(response.data);
      } catch (error) {
        console.error("获取考试列表失败", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  const handleStartExam = (examId) => {
    navigate(`/exam/paper/${examId}`);
  };

  const handleViewErrors = (examId) => {
    navigate(`/error-questions/${examId}`);
  };

  const breadcrumbPaths = getBreadcrumbPaths();

  const content = (
    <Box>
      <Typography variant="body1" paragraph>
        在这里您可以查看所有的考试记录，开始新的考试或复习错题。
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : exams.length === 0 ? (
        <Paper elevation={3} sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="h6">暂无考试记录</Typography>
          <Typography variant="body2" color="textSecondary">
            当有新的考试安排时，将会显示在这里。
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>考试名称</TableCell>
                <TableCell align="center">状态</TableCell>
                <TableCell align="center">分数</TableCell>
                <TableCell align="center">考试时间</TableCell>
                <TableCell>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {exams.map((exam) => (
                <TableRow key={exam.id} hover>
                  <TableCell>{exam.name}</TableCell>
                  <TableCell align="center">
                    <Typography
                      variant="body2"
                      sx={{
                        color:
                          exam.status === "未参加"
                            ? "warning.main"
                            : "success.main",
                        fontWeight: "bold",
                      }}
                    >
                      {exam.status}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">{exam.score || "-"}</TableCell>
                  <TableCell align="center">{exam.examTime || "-"}</TableCell>
                  <TableCell>
                    {exam.status === "未参加" ? (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleStartExam(exam.id)}
                        startIcon={<PlayArrowIcon />}
                      >
                        开始考试
                      </Button>
                    ) : (
                      <Box>
                        <Button
                          variant="outlined"
                          color="primary"
                          onClick={() => handleStartExam(exam.id)}
                          startIcon={<ReplayIcon />}
                          sx={{ mr: 1 }}
                        >
                          再次参加
                        </Button>
                        <Button
                          variant="outlined"
                          color="secondary"
                          onClick={() => handleViewErrors(exam.id)}
                          startIcon={<ErrorOutlineIcon />}
                        >
                          查看错题
                        </Button>
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
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
      {content}
    </CommonLayout>
  );
};

export default MyExams;
