import React from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import { schoolLevels, gradeNames } from "./MultiLevelSelect";

const QuestionPreview = ({ questionData, onClose }) => {
  const getSchoolLevel = (school) => {
    return (
      Object.entries(schoolLevels).find(
        ([key, value]) => value === school
      )?.[0] || school
    );
  };

  const getGradeName = (grad) => {
    return (
      Object.entries(gradeNames).find(([key, value]) => value === grad)?.[0] ||
      grad
    );
  };

  const schoolLevel = getSchoolLevel(questionData.gradInfo.school);
  const gradeName = getGradeName(questionData.gradInfo.grad);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        问题预览
      </Typography>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          类型: {questionData.type === "selection" ? "选择题" : "填空题"}
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          学科: {questionData.category === "physics" ? "物理" : "化学"}
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          知识点: {questionData.kn}
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          年级: {schoolLevels[schoolLevel] || questionData.gradInfo.school} -{" "}
          {gradeNames[gradeName] || questionData.gradInfo.grad}
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          摘要: {questionData.digest}
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          来源: {questionData.source}
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          标签: {questionData.tags.join(", ")}
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          材料: {questionData.material}
        </Typography>
        <Typography variant="h6" gutterBottom>
          问题内容:
        </Typography>
        <Typography variant="body1" gutterBottom>
          {questionData.questionDetail.questionContent.value}
        </Typography>
        {questionData.type === "selection" && (
          <Box sx={{ mt: 2 }}>
            {questionData.questionDetail.rows.map((row, index) => (
              <Typography key={index} variant="body1">
                {String.fromCharCode(65 + index)}. {row.value}{" "}
                {row.isAns && "(正确答案)"}
              </Typography>
            ))}
          </Box>
        )}
        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
          难度: {questionData.questionDetail.rate}
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          解释: {questionData.questionDetail.explanation}
        </Typography>
      </Paper>
      <Button variant="contained" onClick={onClose}>
        返回编辑
      </Button>
    </Box>
  );
};

export default QuestionPreview;
