import React from "react";
import { Box, Button, Typography } from "@mui/material";

const LearningMaterial = ({
  material,
  currentQuestion,
  onNext,
  onPrevious,
  onSubmitAnswer,
}) => {
  // 实现学习资料的显示逻辑，包括题目展示、答案提交等

  return (
    <Box>
      <Typography variant="h5">{material.name}</Typography>
      {/* 显示当前题目 */}
      <Box>
        <Button onClick={onPrevious}>上一题</Button>
        <Button onClick={onNext}>下一题</Button>
      </Box>
    </Box>
  );
};

export default LearningMaterial;
