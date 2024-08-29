import React from "react";
import { Box, Typography, Button } from "@mui/material";
import {
  TypeDict,
  CategoryDict,
  KNDict,
  SchoolDict,
  GradeDict,
  DifficultyDict,
} from "../utils/dictionaries";

const QuestionPreview = ({ questionData, onClose }) => {
  return (
    <Box>
      <Typography variant="h5">问题预览</Typography>
      <Typography>
        类型: {TypeDict[questionData.type] || questionData.type}
      </Typography>
      <Typography>
        学科: {CategoryDict[questionData.category] || questionData.category}
      </Typography>
      <Typography>
        知识点: {KNDict[questionData.kn] || questionData.kn}
      </Typography>
      <Typography>
        年级: {SchoolDict[questionData.gradInfo.school]} -{" "}
        {GradeDict[questionData.gradInfo.grad]}
      </Typography>
      <Typography>摘要: {questionData.digest}</Typography>
      <Typography>来源: {questionData.source}</Typography>
      <Typography>标签: {questionData.tags.join(", ")}</Typography>
      <Typography>材料: {questionData.material}</Typography>

      {questionData.questionDetails.map((detail, index) => (
        <Box key={index} mt={2}>
          <Typography variant="h6">问题 {detail.order_in_question}</Typography>
          <Typography>问题内容: {detail.questionContent.value}</Typography>
          <Typography>选项:</Typography>
          <ul>
            {detail.rows.map((row, rowIndex) => (
              <li key={rowIndex}>
                {row.value} {row.isAns ? "(正确答案)" : ""}
              </li>
            ))}
          </ul>
          <Typography>
            难度: {DifficultyDict[detail.rate] || detail.rate}
          </Typography>
          <Typography>解释: {detail.explanation}</Typography>
        </Box>
      ))}

      <Button
        onClick={onClose}
        variant="contained"
        color="primary"
        sx={{ mt: 2 }}
      >
        关闭预览
      </Button>
    </Box>
  );
};

export default QuestionPreview;
