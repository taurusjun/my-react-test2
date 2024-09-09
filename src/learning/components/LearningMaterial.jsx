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
  currentQuestionDetail,
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
  }, [currentQuestionDetail, cachedAnswer, onAnswerChange]);

  const handleAnswerChange = (option) => {
    const newAnswers = cachedAnswer ? [...cachedAnswer] : [];
    if (newAnswers.includes(option)) {
      onAnswerChange(newAnswers.filter((a) => a !== option));
    } else {
      onAnswerChange([...newAnswers, option]);
    }
  };

  const getCurrentQuestionIndex = () => {
    let index = 0;
    for (const question of material.sections[currentSection].questions) {
      if (question.uuid === currentQuestion.uuid) {
        return index + currentQuestionDetail.order_in_question;
      }
      index += question.questionDetailCount;
    }
    return index;
  };

  const isFirstQuestionDetail =
    currentSection === 0 && getCurrentQuestionIndex() === 1;
  const isLastQuestionDetail = () => {
    const lastSection = material.sections[material.sections.length - 1];
    const lastQuestion =
      lastSection.questions[lastSection.questions.length - 1];
    const lastDetailIndex = lastSection.questions.reduce(
      (acc, q) => acc + q.questionDetailCount,
      0
    );
    return (
      currentSection === material.sections.length - 1 &&
      getCurrentQuestionIndex() === lastDetailIndex
    );
  };

  if (isNavigating) {
    return <CircularProgress />;
  }

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          {`第${material.sections[currentSection].order_in_exam}部分 ${material.sections[currentSection].name}`}
        </Typography>
        {currentQuestion.material && (
          <Typography variant="body2" sx={{ mb: 2, fontStyle: "italic" }}>
            {currentQuestion.material}
          </Typography>
        )}
        <Typography variant="body1" sx={{ mb: 2 }}>
          <strong>
            {`${
              material.sections[currentSection].order_in_exam
            }.${getCurrentQuestionIndex()}`}{" "}
          </strong>
          {currentQuestionDetail.questionContent.value}
        </Typography>
        <FormGroup>
          {currentQuestionDetail.rows.map((row, index) => (
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
          disabled={isFirstQuestionDetail}
        >
          上一题
        </Button>
        <Button
          variant="contained"
          onClick={onNext}
          disabled={isLastQuestionDetail()}
        >
          下一题
        </Button>
      </Box>
    </Box>
  );
};

export default LearningMaterial;
