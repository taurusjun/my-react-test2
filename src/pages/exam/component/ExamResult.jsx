import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { MarkdownRenderer } from "../../../components/markdown";
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
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import CommonLayout from "../../../layouts/CommonLayout";
import CommonBreadcrumbs from "../../../components/CommonBreadcrumbs";
import { getBreadcrumbPaths } from "../../../config/breadcrumbPaths";

const ExamResult = () => {
  const { uuid } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const examUuid = searchParams.get("examUuid");
  const studentUuid = searchParams.get("studentUuid");
  const studentClass = searchParams.get("class");
  const studentName = searchParams.get("studentName");
  
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState(null);
  const [points, setPoints] = useState(null);
  const [totalScore, setTotalScore] = useState(0);
  const [examTotalScore, setExamTotalScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [enlargedImage, setEnlargedImage] = useState(null);

  useEffect(() => {
    const fetchExamResultData = async () => {
      try {
        const response = await axios.get(`/api/my-exams/${uuid}/grading`);
        const responseData = response.data.data;
        console.log('API response data:', responseData);
        
        setExam(responseData.examData);
        setAnswers(responseData.answerScoreMap);
        setPoints(responseData.pointMap);
        
        // 计算总分值
        const examTotalScore = Object.values(responseData.pointMap).reduce(
          (sum, point) => sum + point,
          0
        );
        setExamTotalScore(examTotalScore);
        
        // 计算学生已获得分数
        const studentTotalScore = Object.values(responseData.answerScoreMap).reduce(
          (sum, answer) => sum + (answer.userScore || 0),
          0
        );
        setTotalScore(studentTotalScore);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching exam result data:", error);
        setLoading(false);
      }
    };

    fetchExamResultData();
  }, [uuid]);

  const renderAnswer = (answer) => {
    // 处理新的answer对象格式
    if (answer && typeof answer === 'object' && answer.content) {
      const content = answer.content;
      const images = answer.images || [];
      
      return (
        <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
          {/* 渲染文本内容 */}
          {Array.isArray(content) && content.map((item, index) => (
            <Box key={`content-${index}`} sx={{ mr: 1, mb: 1 }}>
              <MarkdownRenderer 
                content={item} 
                options={{ inline: true, fontSize: '0.875rem' }}
              />
            </Box>
          ))}
          
          {/* 渲染图片 */}
          {Array.isArray(images) && images.map((item, index) => (
            <Box key={`image-${index}`} sx={{ mr: 1, mb: 1 }}>
              {item.startsWith("data:image") ? (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <img
                    src={item}
                    alt="答案图片"
                    style={{
                      width: "50px",
                      height: "50px",
                      objectFit: "cover",
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => setEnlargedImage(item)}
                  >
                    <ZoomInIcon fontSize="small" />
                  </IconButton>
                </Box>
              ) : (
                <MarkdownRenderer 
                  content={item} 
                  options={{ inline: true, fontSize: '0.875rem' }}
                />
              )}
            </Box>
          ))}
        </Box>
      );
    }
    
    // 处理旧的数组格式（向后兼容）
    if (Array.isArray(answer)) {
      return (
        <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
          {answer.map((item, index) => (
            <Box key={index} sx={{ mr: 1, mb: 1 }}>
              {item.startsWith("data:image") ? (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <img
                    src={item}
                    alt="答案图片"
                    style={{
                      width: "50px",
                      height: "50px",
                      objectFit: "cover",
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => setEnlargedImage(item)}
                  >
                    <ZoomInIcon fontSize="small" />
                  </IconButton>
                </Box>
              ) : (
                <MarkdownRenderer 
                  content={item} 
                  options={{ inline: true, fontSize: '0.875rem' }}
                />
              )}
            </Box>
          ))}
        </Box>
      );
    }
    
    // 处理字符串值
    return <MarkdownRenderer 
      content={answer} 
      options={{ inline: true, fontSize: '0.875rem' }}
    />;
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

  if (!exam || !answers || !points) {
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
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{ mb: 3, color: "#1976d2", fontWeight: "bold" }}
        >
          {exam?.name || "考试"} - 结果
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", gap: 4 }}>
            <Paper
              elevation={1}
              sx={{ p: 2, backgroundColor: "#f0f4f8", borderRadius: 2 }}
            >
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: "bold", color: "#546e7a" }}
              >
                考生班级：
              </Typography>
              <Typography variant="h6" sx={{ mt: 1, color: "#263238" }}>
                {studentClass || "未知"}
              </Typography>
            </Paper>
            <Paper
              elevation={1}
              sx={{ p: 2, backgroundColor: "#f0f4f8", borderRadius: 2 }}
            >
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: "bold", color: "#546e7a" }}
              >
                考生姓名：
              </Typography>
              <Typography variant="h6" sx={{ mt: 1, color: "#263238" }}>
                {studentName || "未知"}
              </Typography>
            </Paper>
          </Box>
          <Box
            sx={{
              mt: 2,
              display: "flex",
              alignItems: "center",
              p: 2,
              backgroundColor: "#e3f2fd",
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              总分: {totalScore} / {examTotalScore}
            </Typography>
          </Box>
        </Box>
        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell sx={headerCellStyle}>题号</TableCell>
                <TableCell sx={headerCellStyle}>题目</TableCell>
                <TableCell sx={headerCellStyle}>标准答案</TableCell>
                <TableCell sx={headerCellStyle}>您的答案</TableCell>
                <TableCell sx={headerCellStyle}>得分</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {exam.sections.map((section) =>
                section.questions.map((question) =>
                  question.questionDetails.map((detail, index) => (
                    <TableRow
                      key={`${question.uuid}-${detail.uuid}`}
                      sx={{
                        "&:nth-of-type(odd)": { backgroundColor: "#fafafa" },
                      }}
                    >
                      <TableCell>{`${section.order_in_exam}.${
                        index + 1
                      }`}</TableCell>
                      <TableCell>
                        <MarkdownRenderer 
                          content={detail.questionContent.value} 
                          options={{ fontSize: '0.875rem' }}
                        />
                      </TableCell>
                      <TableCell>{renderAnswer(detail.answer)}</TableCell>
                      <TableCell>
                        {renderAnswer(
                          answers[detail.uuid]?.userAnswer ||
                            "未作答"
                        )}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: "bold", 
                              color: answers[detail.uuid]?.userScore === points[detail.uuid] ? "success.main" : "warning.main" 
                            }}
                          >
                            {answers[detail.uuid]?.userScore || 0} / {points[detail.uuid] || 0}
                          </Typography>
                          {answers[detail.uuid]?.userScore ? (
                            answers[detail.uuid].userScore === points[detail.uuid] ? (
                              <CheckCircleIcon color="success" fontSize="small" sx={{ ml: 1 }} />
                            ) : (
                              <CancelIcon color="warning" fontSize="small" sx={{ ml: 1 }} />
                            )
                          ) : null}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
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

const headerCellStyle = {
  fontWeight: "bold",
  whiteSpace: "nowrap",
};

export default ExamResult;
