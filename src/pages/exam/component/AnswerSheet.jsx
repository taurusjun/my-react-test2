import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Typography,
  Box,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
} from "@mui/material";

const AnswerSheet = ({ uuid }) => {
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const response = await axios.get(`/api/exam-print/${uuid}`);
        setExam(response.data);
        setLoading(false);
      } catch (error) {
        console.error("获取考试数据失败:", error);
        setLoading(false);
      }
    };

    fetchExam();
  }, [uuid]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!exam) {
    return <Typography>未找到考试数据</Typography>;
  }

  return (
    <Paper
      elevation={0}
      className="answer-sheet print-content"
      id="printable-content"
    >
      <Box p={3}>
        <Grid container>
          <Grid item xs={3}>
            <Box border={1} borderColor="grey.300" p={1}>
              <Typography>学校：________________</Typography>
              <Typography>班级：________________</Typography>
              <Typography>姓名：________________</Typography>
              <Typography>考号：________________</Typography>
            </Box>
          </Grid>
          <Grid item xs={9}>
            <Typography variant="h5" align="center" gutterBottom>
              {exam.name}
            </Typography>
            <Typography variant="h4" align="center" gutterBottom>
              {exam.subject} 答题纸
            </Typography>
          </Grid>
        </Grid>

        <TableContainer component={Paper} elevation={0} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>题号</TableCell>
                {["一", "二", "三", "四", "五"].map((item, index) => (
                  <TableCell key={index} align="center">
                    {item}
                  </TableCell>
                ))}
                <TableCell align="center">总分</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>得分</TableCell>
                {[...Array(6)].map((_, index) => (
                  <TableCell key={index}></TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Box mt={2} p={1} border={1} borderColor="grey.300">
          <Typography variant="body2" align="center">
            请在各题规定的黑色矩形区域内答题,超出该区域的答案无效!
          </Typography>
        </Box>

        {exam.sections.map((section, sectionIndex) => (
          <Box key={section.uuid} mt={4}>
            <Typography variant="h6" gutterBottom>
              {["一", "二", "三"][sectionIndex]}、{section.name}（每小题{" "}
              {section.pointsPerQuestion} 分，共 {section.totalPoints} 分）
            </Typography>
            {section.type === "choice" && (
              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>题号</TableCell>
                      {[...Array(8)].map((_, index) => (
                        <TableCell key={index} align="center">
                          {index + 1}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>答案</TableCell>
                      {[...Array(8)].map((_, index) => (
                        <TableCell key={index}></TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            {section.type === "fillBlank" && (
              <Grid container spacing={2}>
                {[...Array(8)].map((_, index) => (
                  <Grid item xs={6} key={index}>
                    <Typography>
                      {index + 9}、________________________
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            )}
            {section.type === "shortAnswer" && (
              <Box>
                {[...Array(3)].map((_, index) => (
                  <Box key={index} mt={2}>
                    <Typography>{index + 17}、</Typography>
                    <Box
                      height={100}
                      border={1}
                      borderColor="grey.300"
                      mt={1}
                    />
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        ))}

        <Box mt={2} p={1} border={1} borderColor="grey.300">
          <Typography variant="body2" align="center">
            请在各题规定的黑色矩形区域内答题,超出该区域的答案无效!
          </Typography>
        </Box>

        <Typography variant="body2" align="right" mt={1}>
          第 1 页（{exam.subject}答题纸共 4 页）
        </Typography>
      </Box>
    </Paper>
  );
};

export default AnswerSheet;
