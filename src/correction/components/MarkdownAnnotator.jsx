import React, { useState, useEffect, useMemo } from "react";
import {
  Button,
  Box,
  Popover,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

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
  const validSections = useMemo(() => {
    return exam.sections
      .filter((section) => section.lines.length > 0)
      .sort((a, b) => b.order - a.order); // 倒排序
  }, [exam.sections]);

  const [selectedSection, setSelectedSection] = useState(
    validSections.length > 0 ? validSections[0].order.toString() : "new"
  );

  const isLineAnnotated = selectedLines.some(
    (line) => markdownLines[line]?.label
  );

  useEffect(() => {
    setSelectedSection(
      validSections.length > 0 ? validSections[0].order.toString() : "new"
    );
  }, [anchorPosition, validSections]);

  const handleMarkSection = () => {
    if (selectedSection === "new") {
      // 找到一个未使用的大题编号
      const usedOrders = new Set(exam.sections.map((s) => s.order));
      let newOrder = 1;
      while (usedOrders.has(newOrder)) {
        newOrder++;
      }
      onMarkSection(selectedLines, newOrder);
    } else if (selectedSection) {
      onMarkSection(selectedLines, parseInt(selectedSection));
    }
    onClose();
  };

  const handleSectionChange = (event) => {
    setSelectedSection(event.target.value);
  };

  const handleMarkQuestion = () => {
    const sectionIndex = exam.sections.length;
    const questionOrder =
      exam.sections[sectionIndex - 1]?.questions.length + 1 || 1;
    onMarkQuestion(selectedLines, sectionIndex, questionOrder);
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
      selectedLines,
      sectionIndex,
      questionIndex,
      detailOrder
    );
    onClose();
  };

  const handleCancelAnnotation = () => {
    selectedLines.forEach((line) => onCancelAnnotation(line));
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
      <Box display="flex" flexDirection="column" padding={2} minWidth={300}>
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
            {validSections.length > 0 && (
              <Grid container spacing={2} alignItems="center" marginBottom={2}>
                <Grid item xs={7}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="section-select-label">选择大题</InputLabel>
                    <Select
                      labelId="section-select-label"
                      value={selectedSection}
                      onChange={handleSectionChange}
                      label="选择大题"
                    >
                      <MenuItem value="new">
                        <AddIcon
                          fontSize="small"
                          style={{ marginRight: "8px" }}
                        />
                        新大题
                      </MenuItem>
                      {validSections.map((section) => (
                        <MenuItem
                          key={section.order}
                          value={section.order.toString()}
                        >
                          大题{section.order}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={5}>
                  <Button
                    variant="contained"
                    fullWidth
                    style={{
                      backgroundColor: colors.SECTION,
                      color: "#fff",
                    }}
                    onClick={handleMarkSection}
                  >
                    大题标注
                  </Button>
                </Grid>
              </Grid>
            )}
            {validSections.length === 0 && (
              <Button
                variant="contained"
                fullWidth
                style={{
                  backgroundColor: colors.SECTION,
                  color: "#fff",
                  marginBottom: "8px",
                }}
                onClick={handleMarkSection}
              >
                标注为大题
              </Button>
            )}
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
