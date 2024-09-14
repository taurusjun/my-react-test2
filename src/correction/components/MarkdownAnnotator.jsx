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
import useOverlapChecker from "./useOverlapChecker";

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
  setSelectedLines, // 添加 setSelectedLines 作为 props
  mdMap, // 添加 mdMap 作为 prop
}) => {
  const [selectedSection, setSelectedSection] = useState("new");

  const { hasOverlap, setErrorMessage, renderSnackbar } = useOverlapChecker(
    exam,
    selectedSection
  );

  const validSections = useMemo(() => {
    return exam.sections
      .filter((section) => section.extra.length > 0)
      .sort((a, b) => b.order - a.order); // 按 order 倒序排列
  }, [exam.sections]);

  const quickLookupMap = useMemo(() => {
    const map = new Map();

    exam.sections.forEach((section) => {
      map.set(section.uuid, section);
      section.questions.forEach((question) => {
        map.set(question.uuid, question);
        question.questionDetails.forEach((detail) => {
          map.set(detail.uuid, detail);
        });
      });
    });

    return map;
  }, [exam.sections]);

  useEffect(() => {
    setSelectedSection("new");
  }, [anchorPosition, validSections]);

  const isLineAnnotated = selectedLines.some(
    (line) => mdMap.get(line + 1) !== null
  );

  const handleMarkSection = () => {
    const selectedLineRange = selectedLines.map((line) => line + 1);

    // 检查重叠
    const selectedSectionObject = quickLookupMap.get(selectedSection);

    if (mdMap.hasOverlap(selectedLineRange, selectedSectionObject)) {
      setErrorMessage("选中的行范围与其他大题或标准题重叠，请重新选择");
      return;
    }

    onMarkSection(selectedLineRange, selectedSectionObject);

    // 清空选中的行
    setSelectedLines([]); // 取消选中行

    onClose();
  };

  const handleSectionChange = (event) => {
    setSelectedSection(event.target.value);
  };

  const handleMarkQuestion = () => {
    const selectedLineNumbers = selectedLines.map((index) => index + 1);
    const currentSection = mdMap.findNearestSection(selectedLineNumbers[0]);

    if (!currentSection) {
      setErrorMessage("未找到所属的大题");
      return;
    }

    // 检查重叠
    const selectedSectionObject = quickLookupMap.get(selectedSection);

    if (mdMap.hasOverlap(selectedLineNumbers, selectedSectionObject)) {
      setErrorMessage("选中的行范围与其他大题或标准题重叠，请重新选择");
      return;
    }

    onMarkQuestion(selectedLines, currentSection);

    // 清空选中的行
    setSelectedLines([]); // 取消选中行

    onClose();
  };

  const handleMarkQuestionDetail = () => {
    const selectedLineNumbers = selectedLines.map((index) => index + 1);

    // 检查重叠
    if (hasOverlap(selectedLineNumbers)) {
      setErrorMessage("选中的行范围与其他大题或标准题重叠，请重新选择");
      return;
    }

    // get current section
    const currentSectionInMap = mdMap.findNearestSection(
      selectedLineNumbers[0]
    );

    if (!currentSectionInMap) {
      setErrorMessage("未找到所属的大题");
      return;
    }
    const currentSection = quickLookupMap.get(currentSectionInMap.uuid);

    // get current question
    const currentQuestionInMap = mdMap.findNearestQuestion(
      selectedLineNumbers[0]
    );
    if (!currentQuestionInMap) {
      setErrorMessage("未找到所属的标准题");
      return;
    }
    const currentQuestion = quickLookupMap.get(currentQuestionInMap.uuid);

    // 更新数据结构
    onMarkQuestionDetail(selectedLines, currentSection, currentQuestion);

    // 清空选中的行
    setSelectedLines([]); // 取消选中行

    onClose();
  };

  const handleCancelAnnotation = () => {
    onCancelAnnotation(selectedLines);
    onClose();
  };

  return (
    <>
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
                <Grid
                  container
                  spacing={2}
                  alignItems="center"
                  marginBottom={2}
                >
                  <Grid item xs={7}>
                    <FormControl fullWidth size="small">
                      <InputLabel id="section-select-label">
                        选择大题
                      </InputLabel>
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
                          <MenuItem key={section.uuid} value={section.uuid}>
                            {section.name}
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
                style={{
                  backgroundColor: colors.QUESTION_DETAIL,
                  color: "#fff",
                }}
                onClick={handleMarkQuestionDetail}
              >
                标注为小题
              </Button>
            </>
          )}
        </Box>
      </Popover>
      {renderSnackbar()}
    </>
  );
};

export default MarkdownAnnotator;
