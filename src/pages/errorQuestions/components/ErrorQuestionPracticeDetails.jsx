import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Typography,
  Box,
  CircularProgress,
  Paper,
  Divider,
  Grid,
  Chip,
} from "@mui/material";
// Removed useDictionaries import as we're using direct rendering
// Removed ErrorQuestionDisplay import as we're using inline rendering
import { useParams } from "react-router-dom";
import CommonLayout from "../../../layouts/CommonLayout";
import { getBreadcrumbPaths } from "../../../config/breadcrumbPaths";
import CommonBreadcrumbs from "../../../components/CommonBreadcrumbs";
import { MarkdownRenderer } from "../../../components/markdown";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

const ErrorQuestionPracticeDetails = () => {
  const { uuid } = useParams();
  // Using direct rendering instead of dictionaries and location
  const [questionDetails, setQuestionDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuestionDetail = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `/api/user-exams/practice/${uuid}`
        );
        setQuestionDetails(response.data.data || []);
        setLoading(false);
      } catch (err) {
        console.error("获取错题练习详情失败:", err);
        setError("获取错题练习详情失败，请稍后重试。");
        setLoading(false);
      }
    };

    fetchQuestionDetail();
  }, [uuid]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="300px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="300px"
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!questionDetails || questionDetails.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="300px"
      >
        <Typography>未找到错题练习详情。</Typography>
      </Box>
    );
  }


  // 自定义错题练习详情展示组件
  const renderQuestionDetailView = (questionDetail, index) => {
    return (
      <Box
        key={questionDetail.uuid}
        position="relative"
        sx={{ p: 2, border: "1px solid #ccc", borderRadius: "4px", mb: 4 }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            backgroundColor:
              questionDetail.userResult === 1
                ? "#4caf50"
                : questionDetail.userResult === 2
                ? "#f44336"
                : "#ffeb3b",
            color: "white",
            padding: "4px 8px",
            borderRadius: "0 0 0 8px",
          }}
        >
          {questionDetail.userResult === 1
            ? "正确"
            : questionDetail.userResult === 2
            ? "错误"
            : "未批"}
        </Box>

        <Typography variant="h6" gutterBottom sx={{ color: "#1976d2", mt: 1 }}>
          问题 {index + 1}
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item>
            <Chip
              label={`难度: ${questionDetail.difficulty || "未知"}`}
              color="secondary"
              size="small"
            />
          </Grid>
          <Grid item>
            <Chip
              label={`知识点: ${questionDetail.knowledgePoint || "未知"}`}
              color="info"
              size="small"
            />
          </Grid>
          <Grid item>
            <Chip
              label={`分数: ${questionDetail.userScore || 0}/${questionDetail.totalScore || questionDetail.score || 5}`}
              color={questionDetail.userResult === 1 ? "success" : "error"}
              size="small"
            />
          </Grid>
        </Grid>

        {questionDetail.material && (
          <>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: "bold" }}>
              题目材料
            </Typography>
            <Box sx={{ backgroundColor: "#f5f5f5", p: 2, borderRadius: 1, mb: 2 }}>
              <MarkdownRenderer content={questionDetail.material} />
            </Box>
          </>
        )}

        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: "bold" }}>
          题目内容
        </Typography>
        <Box sx={{ backgroundColor: "#f5f5f5", p: 2, borderRadius: 1, mb: 2 }}>
          <MarkdownRenderer content={questionDetail.content?.value || ""} />
        </Box>
        
        {questionDetail.content?.images &&
          questionDetail.content.images.length > 0 &&
          questionDetail.content.images.map((image, imgIndex) => (
            <img
              key={imgIndex}
              src={image}
              alt={`问题图片 ${imgIndex + 1}`}
              style={{
                width: "150px",
                height: "auto",
                marginTop: "8px",
                marginBottom: "16px",
              }}
            />
          ))}

        {questionDetail.options && questionDetail.options.length > 0 && (
          <>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: "bold" }}>
              选项
            </Typography>
            <Box sx={{ pl: 2, mb: 2 }}>
              {questionDetail.options.map((option, optIndex) => (
                <Typography key={optIndex} sx={{ mb: 1 }}>
                  <MarkdownRenderer content={option} options={{ inline: true }} />
                </Typography>
              ))}
            </Box>
          </>
        )}

        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <CheckCircleOutlineIcon color="success" sx={{ mr: 1 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>正确答案</Typography>
        </Box>
        <Box sx={{ backgroundColor: "#e8f5e9", p: 2, borderRadius: 1, mb: 2 }}>
          {Array.isArray(questionDetail.correctAnswer) ? (
            questionDetail.correctAnswer.join(", ")
          ) : (
            <Typography>
              {questionDetail.correctAnswer || "无数据"}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <ErrorOutlineIcon color={questionDetail.userResult === 1 ? "success" : "error"} sx={{ mr: 1 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>你的答案</Typography>
        </Box>
        <Box sx={{ 
          backgroundColor: questionDetail.userResult === 1 ? "#e8f5e9" : "#ffebee", 
          p: 2, 
          borderRadius: 1, 
          mb: 2 
        }}>
          {Array.isArray(questionDetail.userAnswer) ? (
            questionDetail.userAnswer.join(", ")
          ) : (
            <Typography>
              {questionDetail.userAnswer || "未作答"}
            </Typography>
          )}
        </Box>

        {questionDetail.userAnswerImage && questionDetail.userAnswerImage.length > 0 ? (
          <>
            <Typography variant="subtitle2" gutterBottom sx={{ mt: 1, color: "text.secondary" }}>
              用户答案图片
            </Typography>
            <img
              src={questionDetail.userAnswerImage}
              alt="用户答案图片"
              style={{
                width: "150px",
                height: "auto",
                marginBottom: "16px",
              }}
            />
          </>
        ) : null}

        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: "bold" }}>
          解析
        </Typography>
        <Box sx={{ backgroundColor: "#e3f2fd", p: 2, borderRadius: 1 }}>
          {questionDetail.explanation ? (
            <MarkdownRenderer content={questionDetail.explanation} />
          ) : (
            <Typography>无解析</Typography>
          )}
        </Box>
      </Box>
    );
  };

  return (
    <CommonLayout
      currentPage="错题练习详情"
      maxWidth="lg"
      showBreadcrumbs={true}
      BreadcrumbsComponent={() => (
        <CommonBreadcrumbs
          paths={getBreadcrumbPaths().errorQuestionPracticeDetails}
        />
      )}
    >
      <Paper
        elevation={3}
        sx={{ p: 3, bgcolor: "#f5f5f5", borderRadius: "8px" }}
      >
        <Typography variant="h5" gutterBottom color="primary" align="center">
          错题练习详情
        </Typography>
        {questionDetails.map((questionDetail, index) => (
          <React.Fragment key={questionDetail.uuid || index}>
            {index > 0 && <Divider sx={{ my: 3 }} />}
            {renderQuestionDetailView(questionDetail, index)}
          </React.Fragment>
        ))}
      </Paper>
    </CommonLayout>
  );
};

export default ErrorQuestionPracticeDetails;
