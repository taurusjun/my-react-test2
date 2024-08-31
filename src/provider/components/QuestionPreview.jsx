import React from "react";
import { Box, Typography, Button, CardMedia } from "@mui/material";

const QuestionPreview = ({ questionData, onClose }) => {
  return (
    <Box>
      <Typography variant="h5">问题预览</Typography>
      <Typography>类型: {questionData.type}</Typography>
      <Typography>学科: {questionData.category}</Typography>
      <Typography>知识点: {questionData.kn}</Typography>
      <Typography>
        年级: {questionData.gradInfo.school} - {questionData.gradInfo.grad}
      </Typography>
      <Typography>来源: {questionData.source}</Typography>
      <Typography>标签: {questionData.tags.join(", ")}</Typography>
      <Typography>摘要: {questionData.digest}</Typography>
      <Typography>材料: {questionData.material}</Typography>

      {questionData.questionDetails.map((detail, index) => (
        <Box key={index} mt={2}>
          <Typography variant="h6">问题 {detail.order_in_question}</Typography>
          <Typography>{detail.questionContent.value}</Typography>

          {detail.questionContent.image && (
            <CardMedia
              component="img"
              image={detail.questionContent.image}
              alt={`问题 ${detail.order_in_question} 图片`}
              sx={{ maxWidth: "100%", height: "auto", mt: 2, mb: 2 }}
            />
          )}

          {detail.rows.map((row, rowIndex) => (
            <Box key={rowIndex}>
              <Typography>{`${String.fromCharCode(65 + rowIndex)}. ${
                row.value
              }`}</Typography>
              {row.image && (
                <CardMedia
                  component="img"
                  image={row.image}
                  alt={`选项 ${String.fromCharCode(65 + rowIndex)} 图片`}
                  sx={{ maxWidth: "100%", height: "auto", mt: 1, mb: 1 }}
                />
              )}
            </Box>
          ))}

          <Typography>难度: {detail.rate}</Typography>
          <Typography>解释: {detail.explanation}</Typography>
          <Typography>答案: {detail.answer.join(", ")}</Typography>

          {detail.answerImage && (
            <CardMedia
              component="img"
              image={detail.answerImage}
              alt="答案图片"
              sx={{ maxWidth: "100%", height: "auto", mt: 2, mb: 2 }}
            />
          )}
        </Box>
      ))}

      <Button variant="contained" onClick={onClose} sx={{ mt: 2 }}>
        关闭预览
      </Button>
    </Box>
  );
};

export default QuestionPreview;
