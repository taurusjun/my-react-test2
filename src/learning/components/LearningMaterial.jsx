import React, { useEffect } from "react";
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
  onAnswerChange,
  cachedAnswer,
  isNavigating,
}) => {
  useEffect(() => {
    if (cachedAnswer) {
      onAnswerChange(cachedAnswer);
    } else {
      onAnswerChange([]);
    }
  }, [currentQuestion, cachedAnswer, onAnswerChange]);

  const handleAnswerChange = (option) => {
    const newAnswers = cachedAnswer ? [...cachedAnswer] : [];
    if (newAnswers.includes(option)) {
      onAnswerChange(newAnswers.filter((a) => a !== option));
    } else {
      onAnswerChange([...newAnswers, option]);
    }
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
                  checked={cachedAnswer?.includes(
                    String.fromCharCode(65 + index)
                  )}
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
      <Box sx={{ display: "flex", justifyContent: "flex-start", gap: 2 }}>
        <Button
          variant="contained"
          onClick={onPrevious}
          disabled={isFirstQuestion}
        >
          上一题
        </Button>
        <Button variant="contained" onClick={onNext} disabled={isLastQuestion}>
          下一题
        </Button>
      </Box>
    </Box>
  );
};

export default LearningMaterial;
