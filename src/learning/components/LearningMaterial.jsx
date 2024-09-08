import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  FormGroup,
  FormControlLabel,
  Checkbox,
  CircularProgress,
} from "@mui/material";

const LearningMaterial = ({
  material,
  currentSection,
  currentQuestion,
  onNext,
  onPrevious,
  onSubmitAnswer,
  isNavigating,
}) => {
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    setAnswers([]); // 清空答案当问题改变时
  }, [currentQuestion]);

  const handleAnswerChange = (option) => {
    setAnswers((prev) => {
      if (prev.includes(option)) {
        return prev.filter((a) => a !== option);
      } else {
        return [...prev, option];
      }
    });
  };

  const handleSubmit = () => {
    onSubmitAnswer(answers);
  };

  const isFirstQuestion =
    currentSection === 0 && currentQuestion.order_in_section === 0;
  const isLastQuestion =
    currentSection === material.sections.length - 1 &&
    currentQuestion.order_in_section ===
      material.sections[currentSection].questionCount - 1;

  if (isNavigating) {
    return <CircularProgress />;
  }

  const questionDetail = currentQuestion.questionDetails[0]; // 假设只有一个questionDetail

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          {`第${material.sections[currentSection].order_in_material}部分 ${material.sections[currentSection].name}`}
        </Typography>
        {currentQuestion.material && (
          <Typography variant="body2" sx={{ mb: 2, fontStyle: "italic" }}>
            {currentQuestion.material}
          </Typography>
        )}
        <Typography variant="body1" sx={{ mb: 2 }}>
          <strong>
            {`${material.sections[currentSection].order_in_material}.${
              currentQuestion.order_in_section + 1
            }`}{" "}
          </strong>
          {questionDetail.questionContent.value}
        </Typography>
        <FormGroup>
          {questionDetail.rows.map((row, index) => (
            <FormControlLabel
              key={index}
              control={
                <Checkbox
                  checked={answers.includes(String.fromCharCode(65 + index))}
                  onChange={() =>
                    handleAnswerChange(String.fromCharCode(65 + index))
                  }
                />
              }
              label={`${String.fromCharCode(65 + index)}. ${row.value}`}
            />
          ))}
        </FormGroup>
      </Paper>
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Button
          variant="contained"
          onClick={onPrevious}
          disabled={isFirstQuestion}
        >
          上一题
        </Button>
        <Button variant="contained" onClick={handleSubmit}>
          提交答案
        </Button>
        <Button variant="contained" onClick={onNext} disabled={isLastQuestion}>
          下一题
        </Button>
      </Box>
    </Box>
  );
};

export default LearningMaterial;
