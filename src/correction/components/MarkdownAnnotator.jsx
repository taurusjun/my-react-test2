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
import useMarkdownAnnotationHelper from "./useMarkdownAnnotationHelper";
import { QUESTION_UI_TYPES } from "../../common/constants";

// 定义操作配置
const actionConfig = {
  section: ["markQuestion"],
  question: [
    "markSection",
    "markQuestion",
    "markMaterial",
    "markQuestionDetail",
  ],
  questionDetail: [
    "markSection",
    "markQuestion",
    "markQuestionDetail",
    "markQuestionContent",
    "markRow",
    "markAnswer",
    "markExplanation",
  ],
  default: ["markSection"], // 当没有最近元素时使用
};

// 定义操作按钮配置
const buttonConfig = {
  markSection: {
    label: "标注为大题",
    color: "SECTION",
    handler: "handleMarkSection",
  },
  markQuestion: {
    label: "标注为标准题",
    color: "QUESTION",
    handler: "handleMarkQuestion",
  },
  markMaterial: {
    label: "标注材料",
    color: "QUESTION_MATERIAL",
    handler: "handleMarkMaterial",
  },
  markQuestionDetail: {
    label: "标注为小题",
    color: "QUESTION_DETAIL",
    handler: "handleMarkQuestionDetail",
  },
  markQuestionContent: {
    label: "标注为内容",
    color: "QUESTION_DETAIL_CONTENT",
    handler: "handleMarkQuestionContent",
  },
  markRow: {
    label: "标注选项",
    color: "QUESTION_DETAIL_OPTION",
    handler: "handleMarkRow",
  },
  markExplanation: {
    label: "标注解释",
    color: "QUESTION_DETAIL_EXPLANATION",
    handler: "handleMarkExplanation",
  },
  markAnswer: {
    label: "标注答案",
    color: "QUESTION_DETAIL_ANSWER",
    handler: "handleMarkAnswer",
  },
};

const MarkdownAnnotator = ({
  selectedLines,
  exam,
  anchorPosition,
  onClose,
  onMarkSection,
  onMarkQuestion,
  onMarkQuestionDetail,
  onCancelAnnotation,
  onMarkMaterial,
  onMarkQuestionContent, // 添加 onMarkQuestionContent 作为 props
  onMarkExplanation,
  onMarkAnswer,
  onMarkRow,
  colors,
  setSelectedLines, // 添加 setSelectedLines 作为 props
  mdMap, // 添加 mdMap 作为 prop
}) => {
  const [selectedSection, setSelectedSection] = useState("new");
  const [nearestElement, setNearestElement] = useState(null);
  const [selectedQuestionType, setSelectedQuestionType] = useState("");

  const { setErrorMessage, renderSnackbar } = useMarkdownAnnotationHelper(
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

  useEffect(() => {
    if (selectedLines.length > 0) {
      const firstLine = selectedLines[0] + 1;
      const nearest = mdMap.findNearestContainerObject(firstLine);
      setNearestElement(nearest);
    }
  }, [selectedLines, mdMap]);

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

    onMarkQuestion(selectedLineNumbers);

    // 清空选中的行
    setSelectedLines([]); // 取消选中行

    onClose();
  };

  const handleMarkQuestionDetail = () => {
    const selectedLineNumbers = selectedLines.map((index) => index + 1);

    // 检查是否选择了题型
    if (!selectedQuestionType) {
      setErrorMessage("请选择题型");
      return;
    }

    // 检查重叠
    if (mdMap.hasOverlap(selectedLineNumbers)) {
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
    onMarkQuestionDetail(selectedLineNumbers, selectedQuestionType);

    // 清空选中的行
    setSelectedLines([]); // 取消选中行
    setSelectedQuestionType("");

    onClose();
  };

  const handleCancelAnnotation = () => {
    // 获取选中行的最大和最小值
    const selectedLineNumbers = selectedLines.map((index) => index + 1);
    const minLine = Math.min(...selectedLineNumbers);
    const maxLine = Math.max(...selectedLineNumbers);

    const nearestContainerEl = mdMap.findNearestContainerObject(minLine - 1);
    const nextElementResult = mdMap.findNextObject(maxLine);

    if (
      !nearestContainerEl &&
      nextElementResult &&
      nextElementResult.value.type !== "section"
    ) {
      setErrorMessage("不能删除，无大题会破坏结构");
      return;
    }

    const nameMap = {
      section: "大题",
      question: "标准题",
      question_material: "标准题材料",
      questionDetail: "小题",
      questionDetail_content: "小题内容",
      questionDetail_row: "小题选项",
      questionDetail_answer: "小题答案",
      questionDetail_explanation: "小题解释",
    };

    if (nearestContainerEl && nextElementResult) {
      const nextElement = nextElementResult.value;
      const containerType = nearestContainerEl.type;
      const elementType = nextElement.type;
      if (
        (containerType === "section" && elementType !== "question") ||
        (containerType === "question" && elementType !== "questionDetail") ||
        (containerType === "questionDetail" &&
          elementType === "questionDetail_content" &&
          elementType === "questionDetail_row" &&
          elementType === "questionDetail_answer" &&
          elementType === "questionDetail_explanation")
      ) {
        setErrorMessage(
          "不能删除，下面的元素:" +
            nameMap[elementType] +
            " 无法匹配上面的类型:" +
            nameMap[containerType]
        );
        return;
      }
    }

    onCancelAnnotation(selectedLines);
    onClose();
  };

  const handleMarkMaterial = () => {
    const selectedLineNumbers = selectedLines.map((index) => index + 1);
    const currentQuestion = mdMap.findNearestQuestion(selectedLineNumbers[0]);

    if (!currentQuestion) {
      setErrorMessage("未找到所属的题目");
      return;
    }

    if (mdMap.hasOverlap(selectedLineNumbers)) {
      setErrorMessage("选中的行范围与其他大题或标准题重叠，请重新选择");
      return;
    }

    onMarkMaterial(selectedLineNumbers);

    // 清空选中的行
    setSelectedLines([]); // 取消选中行

    onClose();
  };

  const handleMarkQuestionContent = () => {
    const selectedLineNumbers = selectedLines.map((index) => index + 1);
    const currentQuestionDetail = mdMap.findNearestContainerObject(
      selectedLineNumbers[0],
      "questionDetail"
    );

    if (!currentQuestionDetail) {
      setErrorMessage("未找到所属的小题");
      return;
    }

    if (mdMap.hasOverlap(selectedLineNumbers)) {
      setErrorMessage("选中的行范围与其他大题或标准题重叠，请重新选择");
      return;
    }

    onMarkQuestionContent(selectedLineNumbers);

    // 清空选中的行
    setSelectedLines([]); // 取消选中行

    onClose();
  };

  const handleMarkExplanation = () => {
    const selectedLineNumbers = selectedLines.map((index) => index + 1);
    const currentQuestionDetail = mdMap.findNearestContainerObject(
      selectedLineNumbers[0],
      "questionDetail"
    );

    if (!currentQuestionDetail) {
      setErrorMessage("未找到所属的小题");
      return;
    }

    if (mdMap.hasOverlap(selectedLineNumbers)) {
      setErrorMessage("选中的行范围与其他大题或标准题重叠，请重新选择");
      return;
    }

    onMarkExplanation(selectedLineNumbers);

    // 清空选中的行
    setSelectedLines([]); // 取消选中行

    onClose();
  };

  const handleMarkAnswer = () => {
    const selectedLineNumbers = selectedLines.map((index) => index + 1);
    const currentQuestionDetail = mdMap.findNearestContainerObject(
      selectedLineNumbers[0],
      "questionDetail"
    );

    if (!currentQuestionDetail) {
      setErrorMessage("未找到所属的小题");
      return;
    }

    if (mdMap.hasOverlap(selectedLineNumbers)) {
      setErrorMessage("选中的行范围与其他大题或标准题重叠，请重新选择");
      return;
    }

    onMarkAnswer(selectedLineNumbers);

    setSelectedLines([]);

    onClose();
  };

  const handleMarkRow = () => {
    const selectedLineNumbers = selectedLines.map((index) => index + 1);
    const currentQuestionDetail = mdMap.findNearestContainerObject(
      selectedLineNumbers[0],
      "questionDetail"
    );

    if (!currentQuestionDetail) {
      setErrorMessage("未找到所属的小题");
      return;
    }

    if (mdMap.hasOverlap(selectedLineNumbers)) {
      setErrorMessage("选中的行范围与其他大题或标准题重叠，请重新选择");
      return;
    }

    onMarkRow(selectedLineNumbers);

    setSelectedLines([]);

    onClose();
  };

  const handlers = {
    handleMarkSection,
    handleMarkQuestion,
    handleMarkMaterial,
    handleMarkQuestionDetail,
    handleMarkQuestionContent,
    handleMarkAnswer,
    handleMarkRow,
    handleMarkExplanation,
  };

  const renderActionButtons = () => {
    const renderSectionButton = (fullWidth = false) => (
      <Grid container spacing={2} alignItems="center" marginBottom={2}>
        {validSections.length > 0 && (
          <Grid item xs={fullWidth ? 7 : 12}>
            <FormControl fullWidth size="small">
              <InputLabel id="section-select-label">选择大题</InputLabel>
              <Select
                labelId="section-select-label"
                value={selectedSection}
                onChange={handleSectionChange}
                label="选择大题"
              >
                <MenuItem value="new">
                  <AddIcon fontSize="small" style={{ marginRight: "8px" }} />
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
        )}
        <Grid item xs={fullWidth ? 5 : 12}>
          <Button
            variant="contained"
            fullWidth
            style={{
              backgroundColor: colors.SECTION,
              color: "#fff",
            }}
            onClick={() => handlers.handleMarkSection()}
          >
            大题标注
          </Button>
        </Grid>
      </Grid>
    );

    if (!nearestElement) {
      return validSections.length === 0
        ? renderSectionButton()
        : renderSectionButton(true);
    }

    const elementType = nearestElement.type;
    const availableActions = actionConfig[elementType] || [];

    return (
      <>
        {(elementType === "section" || elementType === "default") &&
          renderSectionButton(validSections.length > 0)}
        {availableActions.map((action) => {
          const config = buttonConfig[action];
          if (action === "markQuestionDetail") {
            return (
              <React.Fragment key={action}>
                <Grid
                  container
                  spacing={2}
                  alignItems="center"
                  marginBottom={2}
                >
                  <Grid item xs={7}>
                    <FormControl fullWidth size="small">
                      <InputLabel id="question-type-select-label">
                        选择题型
                      </InputLabel>
                      <Select
                        labelId="question-type-select-label"
                        value={selectedQuestionType}
                        onChange={(e) =>
                          setSelectedQuestionType(e.target.value)
                        }
                        label="选择题型"
                      >
                        {Object.entries(QUESTION_UI_TYPES).map(
                          ([value, label]) => (
                            <MenuItem key={value} value={value}>
                              {label}
                            </MenuItem>
                          )
                        )}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={5}>
                    <Button
                      variant="contained"
                      fullWidth
                      style={{
                        backgroundColor: colors[config.color],
                        color: "#fff",
                      }}
                      onClick={handleMarkQuestionDetail}
                      disabled={!selectedQuestionType}
                    >
                      {config.label}
                    </Button>
                  </Grid>
                </Grid>
              </React.Fragment>
            );
          }
          return (
            <Button
              key={action}
              variant="contained"
              fullWidth
              style={{
                backgroundColor: colors[config.color],
                color: "#fff",
                marginBottom: "8px",
              }}
              onClick={() => handlers[config.handler]()}
            >
              {config.label}
            </Button>
          );
        })}
      </>
    );
  };

  const handleClose = () => {
    setSelectedLines([]); // 取消选中行
    onClose();
  };

  return (
    <>
      <Popover
        open={Boolean(anchorPosition)}
        anchorReference="anchorPosition"
        anchorPosition={anchorPosition}
        onClose={handleClose}
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
            renderActionButtons()
          )}
        </Box>
      </Popover>
      {renderSnackbar()}
    </>
  );
};

export default MarkdownAnnotator;
