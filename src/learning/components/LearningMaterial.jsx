import React, { useState, useEffect, useCallback } from "react";
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
  onStatusChange,
  cachedAnswer,
  cachedStatus,
  isNavigating,
}) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const [localAnswer, setLocalAnswer] = useState(cachedAnswer || []);

  useEffect(() => {
    setLocalAnswer(cachedAnswer || []);
    setShowAnswer(cachedStatus === "completed");
  }, [currentQuestionDetail, cachedAnswer, cachedStatus]);

  const handleAnswerChange = useCallback(
    (option) => {
      const newAnswers = localAnswer.includes(option)
        ? localAnswer.filter((a) => a !== option)
        : [...localAnswer, option];
      setLocalAnswer(newAnswers);
      onAnswerChange(newAnswers);
      // 当用户回答题目时，将状态更新为 "in_progress"
      onStatusChange("in_progress");
    },
    [localAnswer, onAnswerChange, onStatusChange]
  );

  const handleShowAnswer = useCallback(() => {
    const newShowAnswer = !showAnswer;
    setShowAnswer(newShowAnswer);
    onStatusChange(newShowAnswer ? "completed" : "in_progress");
  }, [showAnswer, onStatusChange]);

  const handleAddToMistakes = () => {
    console.log("添加到错题集:", currentQuestionDetail);
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

  console.log("Rendering LearningMaterial", {
    showAnswer,
    currentQuestionDetail,
  });

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
                  checked={localAnswer.includes(
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
        <Button
          variant="contained"
          onClick={handleShowAnswer}
          disabled={localAnswer.length === 0}
          sx={{ mt: 2, mr: 2 }}
        >
          {showAnswer ? "隐藏答案" : "查看答案"}
        </Button>
        {showAnswer && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6">正确答案：</Typography>
            <Typography>{currentQuestionDetail.answer.join(", ")}</Typography>
            <Typography variant="h6" sx={{ mt: 2 }}>
              解释：
            </Typography>
            <Typography>{currentQuestionDetail.explanation}</Typography>
            <Button
              variant="outlined"
              onClick={handleAddToMistakes}
              sx={{ mt: 2 }}
            >
              加入错题集
            </Button>
          </Box>
        )}
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

export default React.memo(LearningMaterial);
