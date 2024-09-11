import React from "react";
import { Button, Box, Popover } from "@mui/material";

const MarkdownAnnotator = ({
  selectedLines,
  exam,
  updateExam,
  anchorPosition,
  onClose,
  onMarkSection,
  onMarkQuestion,
  onMarkQuestionDetail,
  onCancelAnnotation,
  colors,
  markdownLines,
}) => {
  const selectedLine = selectedLines[0];
  const isLineAnnotated =
    selectedLine !== undefined && markdownLines[selectedLine]?.label;

  const handleMarkSection = () => {
    const sectionOrder = exam.sections.length + 1;
    onMarkSection(selectedLine, sectionOrder);
    onClose();
  };

  const handleMarkQuestion = () => {
    const sectionIndex = exam.sections.length;
    const questionOrder =
      exam.sections[sectionIndex - 1]?.questions.length + 1 || 1;
    onMarkQuestion(selectedLine, sectionIndex, questionOrder);
    onClose();
  };

  const handleMarkQuestionDetail = () => {
    const sectionIndex = exam.sections.length;
    const questionIndex =
      exam.sections[sectionIndex - 1]?.questions.length || 0;
    const detailOrder =
      exam.sections[sectionIndex - 1]?.questions[questionIndex - 1]
        ?.questionDetails.length + 1 || 1;
    onMarkQuestionDetail(
      selectedLine,
      sectionIndex,
      questionIndex,
      detailOrder
    );
    onClose();
  };

  const handleCancelAnnotation = () => {
    onCancelAnnotation(selectedLine);
    onClose();
  };

  return (
    <Popover
      open={Boolean(anchorPosition)}
      anchorReference="anchorPosition"
      anchorPosition={anchorPosition}
      onClose={onClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
    >
      <Box display="flex" flexDirection="column" padding={2}>
        {isLineAnnotated ? (
          <Button
            variant="contained"
            style={{
              backgroundColor: "#f44336",
              color: "#fff",
              marginBottom: "8px",
            }}
            onClick={handleCancelAnnotation}
          >
            取消标注
          </Button>
        ) : (
          <>
            <Button
              variant="contained"
              style={{
                backgroundColor: colors.SECTION,
                color: "#fff",
                marginBottom: "8px",
              }}
              onClick={handleMarkSection}
            >
              标注为大题
            </Button>
            <Button
              variant="contained"
              style={{
                backgroundColor: colors.QUESTION,
                color: "#fff",
                marginBottom: "8px",
              }}
              onClick={handleMarkQuestion}
            >
              标注为标准题
            </Button>
            <Button
              variant="contained"
              style={{ backgroundColor: colors.QUESTION_DETAIL, color: "#fff" }}
              onClick={handleMarkQuestionDetail}
            >
              标注为小题
            </Button>
          </>
        )}
      </Box>
    </Popover>
  );
};

export default MarkdownAnnotator;
