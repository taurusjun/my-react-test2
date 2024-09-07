import React, { useState, useEffect } from "react";
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
        <StyledPaper elevation={3} sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="h6">暂无考试记录</Typography>
          <Typography variant="body2" color="textSecondary">
            当有新的考试安排时，将会显示在这里。
          </Typography>
        </StyledPaper>
      ) : (
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
                <StyledTableRow key={exam.id}>
                  <BodyTableCell>{exam.name}</BodyTableCell>
                  <BodyTableCell align="center">
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
                  </BodyTableCell>
                  <BodyTableCell align="center">
                    {exam.score || "-"}
                  </BodyTableCell>
                  <BodyTableCell align="center">
                    {exam.examTime || "-"}
                  </BodyTableCell>
                  <BodyTableCell>
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
                  </BodyTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </StyledTableContainer>
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
