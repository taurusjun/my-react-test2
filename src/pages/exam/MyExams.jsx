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
import AssignmentIcon from "@mui/icons-material/Assignment";
import { menuItems } from "../../config/menuItems";

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

  const content = (
    <Box>
      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>考试名称</TableCell>
                <TableCell>状态</TableCell>
                <TableCell>分数</TableCell>
                <TableCell>考试时间</TableCell>
                <TableCell>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {exams.map((exam) => (
                <TableRow key={exam.id}>
                  <TableCell>{exam.name}</TableCell>
                  <TableCell>{exam.status}</TableCell>
                  <TableCell>{exam.score || "-"}</TableCell>
                  <TableCell>{exam.examTime || "-"}</TableCell>
                  <TableCell>
                    {exam.status === "未参加" ? (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleStartExam(exam.id)}
                      >
                        开始考试
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleStartExam(exam.id)}
                          sx={{ mr: 1 }}
                        >
                          再次参加
                        </Button>
                        <Button
                          variant="outlined"
                          color="secondary"
                          onClick={() => handleViewErrors(exam.id)}
                        >
                          查看错题
                        </Button>
                      </>
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
    <CommonLayout currentPage="我的考试" menuItems={menuItems} maxWidth="lg">
      {content}
    </CommonLayout>
  );
};

export default MyExams;
