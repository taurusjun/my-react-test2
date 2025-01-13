import React from "react";
import { Typography, Box, Chip, Grid } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

const ErrorQuestionDisplay = ({ questionDetail, dictionaries }) => {
  return (
    <Box
      position="relative"
      sx={{ p: 2, border: "1px solid #ccc", borderRadius: "4px" }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          backgroundColor:
            questionDetail.userResult === 1
              ? "#4caf50"
              : questionDetail.userResult === 2
              ? "#f44336"
              : "#ffeb3b",
          color: "white",
          padding: "4px 8px",
          borderRadius: "0 4px 4px 0",
          transform: "rotate(-45deg)",
          transformOrigin: "bottom left",
          whiteSpace: "nowrap",
          zIndex: 1,
        }}
      >
        {questionDetail.userResult === 1
          ? "正确"
          : questionDetail.userResult === 2
          ? "错误"
          : "未批"}
      </Box>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item>
          <Chip
            label={`难度: ${questionDetail.difficulty}`}
            color="secondary"
          />
        </Grid>
        <Grid item>
          <Chip
            label={`知识点: ${
              dictionaries.KNDict[questionDetail.knowledgePoint] ||
              questionDetail.knowledgePoint
            }`}
            color="info"
          />
        </Grid>
        <Grid item>
          <Chip
            label={`错误次数: ${questionDetail.errorCount}`}
            color="error"
          />
        </Grid>
      </Grid>
      {questionDetail.material ? (
        <>
          <Typography variant="h6" gutterBottom>
            题目材料
          </Typography>
          <Typography
            variant="body1"
            paragraph
            sx={{ backgroundColor: "#f5f5f5", p: 2, borderRadius: 1 }}
          >
            <ReactMarkdown rehypePlugins={[rehypeRaw]}>
              {questionDetail.material}
            </ReactMarkdown>
          </Typography>
        </>
      ) : null}
      <Typography variant="h6" gutterBottom>
        题目内容
      </Typography>
      <Typography
        variant="body1"
        paragraph
        sx={{ backgroundColor: "#f5f5f5", p: 2, borderRadius: 1 }}
      >
        {questionDetail.content.value}
      </Typography>
      {questionDetail.content.images &&
        questionDetail.content.images.length > 0 &&
        questionDetail.content.images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`问题图片 ${index + 1}`}
            style={{
              width: "150px",
              height: "auto",
              marginTop: "8px",
            }}
          />
        ))}
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <CheckCircleOutlineIcon color="success" sx={{ mr: 1 }} />
        <Typography variant="h6">正确答案</Typography>
      </Box>
      <Typography
        variant="body1"
        paragraph
        sx={{ backgroundColor: "#e8f5e9", p: 2, borderRadius: 1 }}
      >
        {questionDetail.correctAnswer}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <ErrorOutlineIcon color="error" sx={{ mr: 1 }} />
        <Typography variant="h6">你的答案</Typography>
      </Box>
      <Typography
        variant="body1"
        paragraph
        sx={{ backgroundColor: "#ffebee", p: 2, borderRadius: 1 }}
      >
        {questionDetail.userAnswer.value}
      </Typography>
      {questionDetail.userAnswer.images &&
        questionDetail.userAnswer.images.length > 0 &&
        questionDetail.userAnswer.images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`用户答案图片 ${index + 1}`}
            style={{
              width: "150px",
              height: "auto",
              marginTop: "8px",
            }}
          />
        ))}

      <Typography variant="h6" gutterBottom>
        解释
      </Typography>
      <Typography
        variant="body1"
        sx={{ backgroundColor: "#e3f2fd", p: 2, borderRadius: 1 }}
      >
        {questionDetail.explanation}
      </Typography>
    </Box>
  );
};

export default ErrorQuestionDisplay;
