import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Grid,
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Typography,
  Divider,
  Snackbar,
  Alert,
} from "@mui/material";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import axios from "axios";
import MarkdownAnnotator from "./MarkdownAnnotator";
import MdMap from "../utils/MdMap";
import { v4 as uuidv4 } from "uuid";
import { QUESTION_UI_TYPES } from "../../common/constants";
import MultiLevelSelect from "../../provider/components/MultiLevelSelect";
import { useDictionaries } from "../../provider/hooks/useDictionaries";
import { styled } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import { QUESTION_TYPES } from "../../common/constants";

const COLORS = {
  SECTION: "#3f51b5", // 深蓝色
  QUESTION: "#4caf50", // 绿色
  SIMPLE_QUESTION: "#8bc34a", // 浅绿色，与复杂题区分
  QUESTION_MATERIAL: "#81c784", // 涅绿色
  QUESTION_DETAIL: "#2196f3", // 蓝色
  QUESTION_DETAIL_CONTENT: "#90caf9", // 浅蓝色
  QUESTION_DETAIL_OPTION: "#64b5f6", // 中等蓝色，与内容接近
  QUESTION_DETAIL_ANSWER: "#ff9800", // 橙色
  QUESTION_DETAIL_EXPLANATION: "#ffa726", // 浅橙色
};

// 通用函数
const upsertByUuid = (array, newItem) => {
  const index = array.findIndex((item) => item.uuid === newItem.uuid);
  if (index !== -1) {
    array[index] = newItem;
  } else {
    array.push(newItem);
  }
};

const createSubmitExam = (exam, markdownLines) => {
  const getContent = (extra) => {
    return extra && extra.length > 0
      ? extra
          .map((lineNumber) => markdownLines[lineNumber - 1].content)
          .join("\n")
      : "";
};

  const convertSection = (section) => {
    const questions = section.questions.map((question) => {
      if (question.type === "simpleQuestion") {
        // 简单题处理：直接转换为一个 questionDetail
        const result = {
          uuid: uuidv4(),
          order_in_question: 1,
          questionContent: {
            value: getContent([
              ...question.extra,
              ...(question.questionContent?.extra || []),
            ]),
            images: [],
          },
          uiType: question.rows && question.rows.length > 0 ? "single_selection" : "fill_blank",
          score: 0,
          rate: 0,
        };

        if (question.rows && question.rows.length > 0) {
          result.rows = question.rows.map((row) => ({
            value: getContent(row.extra),
            isAns: row.isAns || false,
            images: [],
          }));
        } else {
          result.rows = [];
        }

        if (question.answer) {
          result.answer = {
            content: [getContent(question.answer.extra)],
            images: [],
          };
        }

        if (question.explanation) {
          result.explanation = getContent(question.explanation.extra);
        }

        return {
          uuid: question.uuid,
          type: result.uiType === "fill_blank" ? "fillInBlank" : "selection",
          category: exam.category,
          order_in_section: question.order,
          kn: exam.kn,
          gradeInfo: exam.gradeInfo,
          source: exam.source,
          tags: [],
          digest: question.name,
          material: getContent(question.material?.extra || []),
          questionDetails: [result], // 简单题只有一个 questionDetail
          relatedSources: [],
        };
      } else {
        // 复杂题处理
        const questionDetails = question.questionDetails ? question.questionDetails.map((detail) => {
          const result = {
            uuid: detail.uuid,
            order_in_question: detail.order,
            questionContent: {
              value: getContent([
                ...detail.extra,
                ...detail.questionContent.extra,
              ]),
              images: [],
            },
            uiType: detail.uiType,
            score: 0,
            rate: 0,
          };

          if (detail.rows && detail.rows.length > 0) {
            result.rows = detail.rows.map((row) => ({
              value: getContent(row.extra),
              isAns: row.isAns || false,
              images: [],
            }));
          } else {
            result.rows = [];
          }

          if (detail.answer) {
            result.answer = {
              content: [getContent(detail.answer.extra)],
              images: [],
            };
          }

          if (detail.explanation) {
            result.explanation = getContent(detail.explanation.extra);
          }

          return result;
        }) : [];

        return {
          uuid: question.uuid,
          type:
            question.questionDetails && question.questionDetails[0]?.uiType === "fill_blank"
              ? "fillInBlank"
              : "selection",
          category: exam.category,
          order_in_section: question.order,
          kn: exam.kn,
          gradeInfo: exam.gradeInfo,
          source: exam.source,
          tags: [],
          digest: question.name,
          material: getContent(question.material?.extra || []),
          questionDetails: questionDetails,
          relatedSources: [],
        };
      }
    });

    return {
      uuid: section.uuid,
      name: getContent(section.extra),
      order_in_exam: section.order,
      questions: questions,
    };
  };

  return {
    uuid: exam.uuid,
    name: exam.name,
    category: exam.category,
    source: exam.source,
    kn: exam.kn,
    gradeInfo: exam.gradeInfo,
    createdAt: new Date().toISOString(),
    startTime: new Date(Date.now() + 86400000).toISOString(),
    duration: 60,
    totalScore: 100,
    status: "未开始",
    sections: exam.sections.map(convertSection),
  };
};

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(2),
  color: theme.palette.primary.main,
}));

const StyledButton = styled(Button)(({ theme }) => ({
  marginLeft: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
}));

const FileCorrectionEditor = ({ fileUuid, editable, setEditorState }) => {
  const [markdownLines, setMarkdownLines] = useState([]);
  const [selectedLines, setSelectedLines] = useState([]);
  const [exam, setExam] = useState({
    sections: [],
    name: "",
    category: "",
    gradeInfo: { school: "", grade: "" },
    source: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [anchorPosition, setAnchorPosition] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [fixedStartIndex, setFixedStartIndex] = useState(null);
  const [mdMap, setMdMap] = useState(null);
  const [content, setContent] = useState(null);
  const [status, setStatus] = useState("done");
  const [isLoading, setIsLoading] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [availableKnowledgeNodes, setAvailableKnowledgeNodes] = useState([]);

  const { dictionaries } = useDictionaries();

  const convertMdMapToExamStructure = (mdMap) => {
    const sections = [];
    const questions = [];
    const simpleQuestions = [];
    const questionDetails = [];
    const rows = [];

    for (let i = 1; i <= mdMap.getLineCount(); i++) {
      const value = mdMap.get(i);
      if (value) {
        if (value.type === "section") {
          let section = sections.find((s) => s.uuid === value.uuid);
          if (!section) {
            section = {
              uuid: value.uuid,
              type: "section",
              extra: [],
              questions: [],
            };
            sections.push(section);
          }
          section.extra.push(i);
        } else if (value.type === "question") {
          let question = questions.find((d) => d.uuid === value.uuid);
          if (!question) {
            question = {
              uuid: value.uuid,
              type: "question",
              questionType: "complex",
              extra: [],
              questionDetails: [],
              material: [],
            };
            questions.push(question);
          }
          question.extra.push(i);
          const lastSection = sections[sections.length - 1];
          if (lastSection) {
            upsertByUuid(lastSection.questions, question);
          }
        } else if (value.type === "simpleQuestion") {
          let simpleQuestion = simpleQuestions.find((d) => d.uuid === value.uuid);
          if (!simpleQuestion) {
            simpleQuestion = {
              uuid: value.uuid,
              type: "simpleQuestion",
              questionType: "simple",
              uiType: value.uiType, // 保存题型
              extra: [],
              questionContent: [],
              material: [],
              explanation: [],
              answer: [],
              rows: [],
            };
            simpleQuestions.push(simpleQuestion);
          }
          simpleQuestion.extra.push(i);
          const lastSection = sections[sections.length - 1];
          if (lastSection) {
            upsertByUuid(lastSection.questions, simpleQuestion);
          }
        } else if (value.type === "questionDetail") {
          let questionDetail = questionDetails.find(
            (d) => d.uuid === value.uuid
          );
          if (!questionDetail) {
            questionDetail = {
              uuid: value.uuid,
              type: "questionDetail",
              uiType: value.uiType,
              extra: [],
              questionContent: [],
              explanation: [],
              answer: [], // 初始化 answer 字段
              rows: [], // 初始化 rows 字段
            };
            questionDetails.push(questionDetail);
          }
          questionDetail.extra.push(i);
          const lastQuestion = questions[questions.length - 1];
          if (lastQuestion) {
            upsertByUuid(lastQuestion.questionDetails, questionDetail);
          }
        } else if (value.type === "question_material") {
          const lastQuestion = questions[questions.length - 1];
          if (lastQuestion) {
            lastQuestion.material.push(i);
          }
        } else if (value.type === "questionDetail_content") {
          const lastQuestionDetail = questionDetails[questionDetails.length - 1];
          const lastSimpleQuestion = simpleQuestions[simpleQuestions.length - 1];
          
          let shouldAssignToSimple = false;
          if (lastSimpleQuestion && lastQuestionDetail) {
            const simpleQuestionLastLine = Math.max(...lastSimpleQuestion.extra);
            const questionDetailLastLine = Math.max(...lastQuestionDetail.extra);
            shouldAssignToSimple = simpleQuestionLastLine > questionDetailLastLine;
          } else if (lastSimpleQuestion && !lastQuestionDetail) {
            shouldAssignToSimple = true;
          }
          
          if (shouldAssignToSimple && lastSimpleQuestion) {
            lastSimpleQuestion.questionContent.push(i);
          } else if (lastQuestionDetail) {
            lastQuestionDetail.questionContent.push(i);
          }
        } else if (value.type === "questionDetail_explanation") {
          const lastQuestionDetail = questionDetails[questionDetails.length - 1];
          const lastSimpleQuestion = simpleQuestions[simpleQuestions.length - 1];
          
          let shouldAssignToSimple = false;
          if (lastSimpleQuestion && lastQuestionDetail) {
            const simpleQuestionLastLine = Math.max(...lastSimpleQuestion.extra);
            const questionDetailLastLine = Math.max(...lastQuestionDetail.extra);
            shouldAssignToSimple = simpleQuestionLastLine > questionDetailLastLine;
          } else if (lastSimpleQuestion && !lastQuestionDetail) {
            shouldAssignToSimple = true;
          }
          
          if (shouldAssignToSimple && lastSimpleQuestion) {
            lastSimpleQuestion.explanation.push(i);
          } else if (lastQuestionDetail) {
            lastQuestionDetail.explanation.push(i);
          }
        } else if (value.type === "questionDetail_answer") {
          const lastQuestionDetail = questionDetails[questionDetails.length - 1];
          const lastSimpleQuestion = simpleQuestions[simpleQuestions.length - 1];
          
          let shouldAssignToSimple = false;
          if (lastSimpleQuestion && lastQuestionDetail) {
            const simpleQuestionLastLine = Math.max(...lastSimpleQuestion.extra);
            const questionDetailLastLine = Math.max(...lastQuestionDetail.extra);
            shouldAssignToSimple = simpleQuestionLastLine > questionDetailLastLine;
          } else if (lastSimpleQuestion && !lastQuestionDetail) {
            shouldAssignToSimple = true;
          }
          
          if (shouldAssignToSimple && lastSimpleQuestion) {
            lastSimpleQuestion.answer.push(i);
          } else if (lastQuestionDetail) {
            lastQuestionDetail.answer.push(i);
          }
        } else if (value.type === "questionDetail_row") {
          let row = rows.find((d) => d.uuid === value.uuid);
          if (!row) {
            row = {
              uuid: value.uuid,
              type: "questionDetail_row",
              extra: [],
              isAns: false,
            };
            rows.push(row);
          }
          row.extra.push(i);
          
          // 需要确定这个选项属于哪个容器：复杂题的小题还是简单题
          const lastQuestionDetail = questionDetails[questionDetails.length - 1];
          const lastSimpleQuestion = simpleQuestions[simpleQuestions.length - 1];
          
          let shouldAssignToSimple = false;
          
          if (lastSimpleQuestion && lastQuestionDetail) {
            // 如果两者都存在，比较它们的最后一行位置
            const simpleQuestionLastLine = Math.max(...lastSimpleQuestion.extra);
            const questionDetailLastLine = Math.max(...lastQuestionDetail.extra);
            shouldAssignToSimple = simpleQuestionLastLine > questionDetailLastLine;
          } else if (lastSimpleQuestion && !lastQuestionDetail) {
            // 只有 simpleQuestion
            shouldAssignToSimple = true;
          } else if (!lastSimpleQuestion && lastQuestionDetail) {
            // 只有 questionDetail
            shouldAssignToSimple = false;
          }
          
          if (shouldAssignToSimple && lastSimpleQuestion) {
            upsertByUuid(lastSimpleQuestion.rows, row);
          } else if (lastQuestionDetail) {
            upsertByUuid(lastQuestionDetail.rows, row);
          }
        }
      }
    }

    return sections;
  };

  const handleEditToggle = async () => {
    if (isEditing) {
      // 发送请求到后端进行保存
      try {
        const contentToSave = markdownLines
          .map((line) => line.content)
          .join("\n");
        setContent(contentToSave);
        const response = await axios.post(
          `/api/file-corrections/${fileUuid}/save`,
          { content: contentToSave }
        );

        // 显示成功的 Snackbar 消息
        setSnackbarMessage(response.data.message);
        setSnackbarOpen(true);
      } catch (error) {
        console.error("保存失败:", error);
        // 显示错误的 Snackbar 消息
        setSnackbarMessage("保存失败，请重试。");
        setSnackbarOpen(true);
      }
    }
    setIsEditing(!isEditing); // 切换编辑状态
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleLineClick = (event, index) => {
    event.preventDefault();
    event.stopPropagation();

    setMousePosition({ x: event.clientX, y: event.clientY });

    if (event.shiftKey) {
      const startIndex = fixedStartIndex !== null ? fixedStartIndex : index;
      const range = [startIndex, index].sort((a, b) => a - b);
      const newSelectedLines = [];
      for (let i = range[0]; i <= range[1]; i++) {
        newSelectedLines.push(i);
      }
      setSelectedLines(newSelectedLines);
      if (fixedStartIndex === null) {
        setFixedStartIndex(index); // 设置固定的起始位置
      }
    } else if (event.metaKey || event.ctrlKey) {
      setSelectedLines((prev) =>
        prev.includes(index)
          ? prev.filter((line) => line !== index)
          : [...prev, index]
      );
    } else {
      setSelectedLines([index]);
      setAnchorPosition({
        top: event.clientY,
        left: event.clientX,
      });
    }

    if (!event.shiftKey && !event.metaKey && !event.ctrlKey) {
      setAnchorPosition({
        top: event.clientY,
        left: event.clientX,
      });
    }
  };

  const handleKeyUp = useCallback((event) => {
    if (
      event.key === "Shift" ||
      event.key === "Meta" ||
      event.key === "Control"
    ) {
      if (selectedLines.length > 1) {
        setAnchorPosition({
          top: mousePosition.y,
          left: mousePosition.x,
        });
      }
    }
  }, [selectedLines.length, mousePosition.x, mousePosition.y]);


  // 修改处理 gradeInfo 变化的函数
  const handleGradeInfoChange = useCallback((school, grade) => {
    setExam((prev) => ({
      ...prev,
      gradeInfo: { school, grade },
    }));
  }, []);

  // 重新排序
  const sortAndRenameSections = (sections) => {
    sections.sort((a, b) => Math.min(...a.extra) - Math.min(...b.extra));
    return sections.map((section, index) => {
      const sortedQuestions = section.questions
        .sort((q1, q2) => Math.min(...q1.extra) - Math.min(...q2.extra))
        .map((question, questionIndex) => {
          if (question.type === "simpleQuestion") {
            // 简单题处理
            const sortedQuestionContent = {
              extra: question.questionContent,
              name: `简单题${index + 1}.${questionIndex + 1}_内容`,
            };

            const sortedExplanation = {
              extra: question.explanation,
              name: `简单题${index + 1}.${questionIndex + 1}_解析`,
            };

            const sortedAnswer = {
              extra: question.answer,
              name: `简单题${index + 1}.${questionIndex + 1}_答案`,
            };

            const sortedRows = question.rows ? question.rows.map((row, rowIndex) => ({
              ...row,
              name: `简单题${index + 1}.${questionIndex + 1}_选项${String.fromCharCode(65 + rowIndex)}`,
            })) : [];

            const sortedMaterial = {
              extra: question.material,
              name: `简单题${index + 1}.${questionIndex + 1}_材料`,
            };

            return {
              ...question,
              order: questionIndex + 1,
              name: `简单题${index + 1}.${questionIndex + 1} (${QUESTION_UI_TYPES[question.uiType] || question.uiType || '未知题型'})`,
              questionContent: sortedQuestionContent,
              explanation: sortedExplanation,
              answer: sortedAnswer,
              rows: sortedRows,
              material: sortedMaterial,
            };
          } else {
            // 复杂题处理
            const sortedQuestionDetails = question.questionDetails
              ? question.questionDetails
                  .sort((d1, d2) => Math.min(...d1.extra) - Math.min(...d2.extra))
                  .map((detail, detailIndex) => {
                    const sortedQuestionContent = {
                      extra: detail.questionContent,
                      name: `小题${index + 1}.${questionIndex + 1}.${
                        detailIndex + 1
                      }_内容`,
                    };

                    const sortedExplanation = {
                      extra: detail.explanation,
                      name: `小题${index + 1}.${questionIndex + 1}.${
                        detailIndex + 1
                      }_解析`,
                    };

                    const sortedAnswer = {
                      extra: detail.answer,
                      name: `小题${index + 1}.${questionIndex + 1}.${
                        detailIndex + 1
                      }_答案`,
                    };

                    const sortedRows = detail.rows.map((row, rowIndex) => ({
                      ...row,
                      name: `小题${index + 1}.${questionIndex + 1}.${
                        detailIndex + 1
                      }_选项${rowIndex + 1}`,
                    }));

                    return {
                      ...detail,
                      order: detailIndex + 1,
                      name: `小题${index + 1}.${questionIndex + 1}.${
                        detailIndex + 1
                      } (${QUESTION_UI_TYPES[detail.uiType]})`,
                      questionContent: sortedQuestionContent,
                      explanation: sortedExplanation,
                      answer: sortedAnswer, // 更新 answer
                      rows: sortedRows, // 更新 rows
                    };
                  })
              : [];

            const sortedMaterial = {
              extra: question.material,
              name: `复杂题${index + 1}.${questionIndex + 1}_材料`,
            };

            return {
              ...question,
              order: questionIndex + 1,
              name: `复杂题${index + 1}.${questionIndex + 1}`,
              questionDetails: sortedQuestionDetails,
              material: sortedMaterial,
            };
          }
        });

      return {
        ...section,
        order: index + 1,
        questions: sortedQuestions,
        name: `大题${index + 1}`,
      };
    });
  };

  const updateMarkdownLines = (sections) => {
    setMarkdownLines((prevLines) =>
      prevLines.map((line, index) => {
        const lineNumber = index + 1;
        const sectionForLine = sections.find((section) =>
          section.extra && section.extra.includes(lineNumber)
        );

        if (sectionForLine) {
          return {
            ...line,
            backgroundColor: COLORS.SECTION,
            label: sectionForLine.name,
          };
        }

        const questionForLine = sections
          .flatMap((section) => section.questions)
          .find((question) => question.extra && question.extra.includes(lineNumber));

        if (questionForLine) {
          const backgroundColor = questionForLine.type === "simpleQuestion" 
            ? COLORS.SIMPLE_QUESTION 
            : COLORS.QUESTION;
          return {
            ...line,
            backgroundColor: backgroundColor,
            label: questionForLine.name,
          };
        }

        const questionDetailForLine = sections
          .flatMap((section) =>
            section.questions
              .filter((question) => question.questionDetails && Array.isArray(question.questionDetails))
              .flatMap((question) => question.questionDetails)
          )
          .find((detail) => detail && detail.extra && detail.extra.includes(lineNumber));

        if (questionDetailForLine) {
          return {
            ...line,
            backgroundColor: COLORS.QUESTION_DETAIL,
            label: questionDetailForLine.name,
          };
        }

        const materialForLine = sections
          .flatMap((section) =>
            section.questions
              .filter((question) => question.material)
              .map((question) => question.material)
          )
          .find((material) => material && material.extra && material.extra.includes(lineNumber));

        if (materialForLine) {
          return {
            ...line,
            backgroundColor: COLORS.QUESTION_MATERIAL,
            label: materialForLine.name,
          };
        }

        const questionContentForLine = sections
          .flatMap((section) =>
            section.questions
              .filter((question) => question.questionDetails && Array.isArray(question.questionDetails))
              .flatMap((question) =>
                question.questionDetails
                  .filter((detail) => detail && detail.questionContent)
                  .map((detail) => detail.questionContent)
              )
          )
          .find((questionContent) =>
            questionContent && questionContent.extra && questionContent.extra.includes(lineNumber)
          );

        if (questionContentForLine) {
          return {
            ...line,
            backgroundColor: COLORS.QUESTION_DETAIL_CONTENT,
            label: questionContentForLine.name,
          };
        }

        const explanationForLine = sections
          .flatMap((section) =>
            section.questions
              .filter((question) => question.questionDetails && Array.isArray(question.questionDetails))
              .flatMap((question) =>
                question.questionDetails
                  .filter((detail) => detail && detail.explanation)
                  .map((detail) => detail.explanation)
              )
          )
          .find((explanation) => explanation && explanation.extra && explanation.extra.includes(lineNumber));

        if (explanationForLine) {
          return {
            ...line,
            backgroundColor: COLORS.QUESTION_DETAIL_EXPLANATION,
            label: explanationForLine.name,
          };
        }

        const answerForLine = sections
          .flatMap((section) =>
            section.questions.flatMap((question) => {
              if (question.type === "simpleQuestion") {
                return question.answer ? [question.answer] : [];
              } else {
                return question.questionDetails ? question.questionDetails.flatMap((detail) => detail.answer) : [];
              }
            })
          )
          .find((answer) => answer.extra && answer.extra.includes(lineNumber));

        if (answerForLine) {
          return {
            ...line,
            backgroundColor: COLORS.QUESTION_DETAIL_ANSWER,
            label: answerForLine.name,
          };
        }

        const rowForLine = sections
          .flatMap((section) =>
            section.questions.flatMap((question) => {
              if (question.type === "simpleQuestion") {
                return question.rows || [];
              } else {
                return question.questionDetails ? question.questionDetails.flatMap((detail) => detail.rows) : [];
              }
            })
          )
          .find((row) => row.extra && row.extra.includes(lineNumber));

        if (rowForLine) {
          return {
            ...line,
            backgroundColor: COLORS.QUESTION_DETAIL_OPTION,
            label: rowForLine.name,
          };
        }


        return line;
      })
    );
  };

  const saveScrollPosition = () => {
    setScrollPosition(window.pageYOffset);
  };

  const onMarkSection = (selectedLineRange, selectedSectionObject) => {
    saveScrollPosition();
    setExam((prev) => {
      let updatedSection = {
        uuid: uuidv4(), // 添加 uuid
        type: "section", // 添加 type 属性
      };
      if (selectedSectionObject) {
        updatedSection = {
          uuid: selectedSectionObject.uuid,
          type: "section",
        };
      }

      mdMap.setMultiLinesWithLock(selectedLineRange, updatedSection);

      let newSections = convertMdMapToExamStructure(mdMap);
      //重新排序
      newSections = sortAndRenameSections(newSections);

      return {
        ...prev,
        sections: newSections,
      };
    });
  };

  const onMarkQuestion = (selectedLineNumbers) => {
    saveScrollPosition();
    setExam((prevExam) => {
      const newQuestion = {
        uuid: uuidv4(), // 添加 uuid
        type: "question", // 添加 type 属性
      };

      mdMap.setMultiLinesWithLock(selectedLineNumbers, newQuestion);

      let newSections = convertMdMapToExamStructure(mdMap);

      //重新排序
      newSections = sortAndRenameSections(newSections);
      return { ...prevExam, sections: newSections };
    });
  };

  const onMarkQuestionDetail = (selectedLineNumbers, selectedQuestionType) => {
    saveScrollPosition();
    setExam((prevExam) => {
      const newQuestionDetail = {
        uuid: uuidv4(), // 添加 uuid
        type: "questionDetail", // 添加 type 属性
        uiType: selectedQuestionType,
      };

      mdMap.setMultiLinesWithLock(selectedLineNumbers, newQuestionDetail);

      let newSections = convertMdMapToExamStructure(mdMap);

      //重新排序
      newSections = sortAndRenameSections(newSections);
      return { ...prevExam, sections: newSections };
    });
  };

  const onMarkAnswer = (selectedLineNumbers) => {
    saveScrollPosition();
    setExam((prevExam) => {
      const newAnswer = {
        uuid: uuidv4(),
        type: "questionDetail_answer",
      };

      mdMap.setMultiLinesWithLock(selectedLineNumbers, newAnswer);

      let newSections = convertMdMapToExamStructure(mdMap);

      newSections = sortAndRenameSections(newSections);
      return { ...prevExam, sections: newSections };
    });
  };

  const onMarkRow = (selectedLineNumbers) => {
    saveScrollPosition();
    setExam((prevExam) => {
      const newRow = {
        uuid: uuidv4(),
        type: "questionDetail_row",
      };

      mdMap.setMultiLinesWithLock(selectedLineNumbers, newRow);

      let newSections = convertMdMapToExamStructure(mdMap);

      newSections = sortAndRenameSections(newSections);
      return { ...prevExam, sections: newSections };
    });
  };

  const onCancelAnnotation = (selectedLines) => {
    saveScrollPosition();
    setExam((prevExam) => {
      // 更新 markdownLines
      setMarkdownLines((prevLines) =>
        prevLines.map((line, index) => {
          if (selectedLines.includes(index)) {
            return {
              content: line.content,
              backgroundColor: undefined,
              label: undefined,
            };
          }
          return line;
        })
      );

      const selectedLineNumbers = selectedLines.map((index) => index + 1);
      mdMap.setMultiLinesWithLock(selectedLineNumbers, null);

      let newSections = convertMdMapToExamStructure(mdMap);

      //重新排序
      newSections = sortAndRenameSections(newSections);

      return {
        ...prevExam,
        sections: newSections,
      };
    });
  };

  const onMarkSimpleQuestion = (selectedLineNumbers, selectedQuestionType) => {
    saveScrollPosition();
    setExam((prevExam) => {
      const newSimpleQuestion = {
        uuid: uuidv4(), // 添加 uuid
        type: "simpleQuestion", // 添加 type 属性
        uiType: selectedQuestionType, // 添加题型
      };

      mdMap.setMultiLinesWithLock(selectedLineNumbers, newSimpleQuestion);

      let newSections = convertMdMapToExamStructure(mdMap);

      //重新排序
      newSections = sortAndRenameSections(newSections);
      return { ...prevExam, sections: newSections };
    });
  };

  const onMarkMaterial = (selectedLineNumbers) => {
    saveScrollPosition();
    setExam((prevExam) => {
      const newQuestionMaterial = {
        uuid: uuidv4(), // 添加 uuid
        type: "question_material", // 添加 type 属性
      };

      mdMap.setMultiLinesWithLock(selectedLineNumbers, newQuestionMaterial);

      let newSections = convertMdMapToExamStructure(mdMap);

      //重新排序
      newSections = sortAndRenameSections(newSections);
      return { ...prevExam, sections: newSections };
    });
  };

  const onMarkQuestionContent = (selectedLineNumbers) => {
    saveScrollPosition();
    setExam((prevExam) => {
      const newQuestionContent = {
        uuid: uuidv4(), // 添加 uuid
        type: "questionDetail_content", // 添加 type 属性
      };

      mdMap.setMultiLinesWithLock(selectedLineNumbers, newQuestionContent);

      let newSections = convertMdMapToExamStructure(mdMap);

      //重新排序
      newSections = sortAndRenameSections(newSections);
      return { ...prevExam, sections: newSections };
    });
  };

  const onMarkExplanation = (selectedLineNumbers) => {
    saveScrollPosition();
    setExam((prevExam) => {
      const newExplanation = {
        uuid: uuidv4(), // 添加 uuid
        type: "questionDetail_explanation", // 添加 type 属性
      };

      mdMap.setMultiLinesWithLock(selectedLineNumbers, newExplanation);

      let newSections = convertMdMapToExamStructure(mdMap);

      //重新排序
      newSections = sortAndRenameSections(newSections);
      return { ...prevExam, sections: newSections };
    });
  };

  // 检测代码块的辅助函数
  const detectCodeBlocks = (lines) => {
    const codeBlocks = [];
    let inCodeBlock = false;
    let codeBlockStart = -1;
    let codeBlockLanguage = "";

    lines.forEach((line, index) => {
      const content = typeof line === "string" ? line : line.content || "";
      
      // 检测代码块开始
      if (content.trim().startsWith("```")) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeBlockStart = index;
          codeBlockLanguage = content.trim().substring(3).trim();
        } else {
          // 代码块结束
          inCodeBlock = false;
          codeBlocks.push({
            start: codeBlockStart,
            end: index,
            language: codeBlockLanguage,
          });
        }
      }
    });

    return codeBlocks;
  };

  // 检查某行是否在代码块内
  const isLineInCodeBlock = (lineIndex, codeBlocks) => {
    return codeBlocks.find(block => 
      lineIndex >= block.start && lineIndex <= block.end
    );
  };

  // 选择完整代码块
  const selectCodeBlock = (clickedIndex, codeBlocks) => {
    const codeBlock = isLineInCodeBlock(clickedIndex, codeBlocks);
    if (codeBlock) {
      const blockLines = [];
      for (let i = codeBlock.start; i <= codeBlock.end; i++) {
        blockLines.push(i);
      }
      return blockLines;
    }
    return [clickedIndex];
  };

  const renderMarkdownWithLineNumbers = (extra) => {
    const codeBlocks = detectCodeBlocks(extra);

    return extra.map((line, index) => {
      const isSelected = selectedLines.includes(index);
      const codeBlock = isLineInCodeBlock(index, codeBlocks);
      const isInCodeBlock = !!codeBlock;
      const isCodeBlockStart = codeBlock && index === codeBlock.start;
      const isCodeBlockEnd = codeBlock && index === codeBlock.end;
      
      const backgroundColor = isSelected
        ? "#d0e0ff"
        : line.backgroundColor || (index % 2 === 0 ? "#f9f9f9" : "#ffffff");

      const content = typeof line === "string" ? line : line.content || "";
      
      // 代码块内容的特殊处理
      let displayContent = content;
      if (isCodeBlockStart && content.trim().startsWith("```")) {
        displayContent = content; // 保留开始标记
      } else if (isCodeBlockEnd && content.trim() === "```") {
        displayContent = content; // 保留结束标记
      }

      return (
        <div
          key={index}
          style={{
            display: "flex",
            alignItems: "stretch",
            padding: "4px 0",
            backgroundColor,
            cursor: "pointer",
            borderBottom: "1px solid #e0e0e0",
            // 代码块的视觉提示
            borderLeft: isInCodeBlock ? "4px solid #007acc" : "none",
            paddingLeft: isInCodeBlock ? "8px" : "0",
          }}
          onMouseDown={(event) => {
            // 如果点击的是代码块内的行，提供智能选择选项
            if (isInCodeBlock && (event.altKey || event.detail === 2)) { // Alt+点击 或 双击
              event.preventDefault();
              event.stopPropagation();
              const blockLines = selectCodeBlock(index, codeBlocks);
              setSelectedLines(blockLines);
              setAnchorPosition({
                top: event.clientY,
                left: event.clientX,
              });
            } else {
              handleLineClick(event, index);
            }
          }}
          title={isInCodeBlock ? `代码块 (${codeBlock.language || 'text'}) - Alt+点击或双击选择整个代码块` : ""}
        >
          <div
            style={{
              width: "50px",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              paddingRight: "10px",
              color: "#888",
              fontFamily: "monospace",
              userSelect: "none",
              backgroundColor: isInCodeBlock ? "#e8f4fd" : "#f0f0f0",
              borderRight: "1px solid #e0e0e0",
            }}
          >
            {index + 1}
          </div>
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              paddingLeft: "10px",
            }}
          >
            {line.label && (
              <span
                style={{
                  fontWeight: "500",
                  marginBottom: "4px",
                  color: "#fff",
                  fontSize: "0.85em",
                  backgroundColor: line.backgroundColor,
                  padding: "2px 6px",
                  borderRadius: "4px",
                  alignSelf: "flex-start",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                {line.label}
              </span>
            )}
            <div
              style={{
                fontFamily: isInCodeBlock && !isCodeBlockStart && !isCodeBlockEnd 
                  ? "Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace"
                  : "inherit",
                fontSize: isInCodeBlock && !isCodeBlockStart && !isCodeBlockEnd ? "14px" : "inherit",
                backgroundColor: isInCodeBlock && !isCodeBlockStart && !isCodeBlockEnd 
                  ? "#f8f8f8" 
                  : "transparent",
                padding: isInCodeBlock && !isCodeBlockStart && !isCodeBlockEnd ? "4px 8px" : "0",
                borderRadius: isInCodeBlock && !isCodeBlockStart && !isCodeBlockEnd ? "4px" : "0",
                whiteSpace: isInCodeBlock ? "pre" : "normal",
                lineHeight: isInCodeBlock && !isCodeBlockStart && !isCodeBlockEnd ? "1.4" : "inherit",
                border: isInCodeBlock && !isCodeBlockStart && !isCodeBlockEnd 
                  ? "1px solid #e1e1e1" 
                  : "none",
                boxShadow: isInCodeBlock && !isCodeBlockStart && !isCodeBlockEnd 
                  ? "0 1px 2px rgba(0,0,0,0.05)" 
                  : "none",
              }}
            >
              {isInCodeBlock && !isCodeBlockStart && !isCodeBlockEnd ? (
                // 代码块内容直接显示，不经过markdown解析，保持缩进
                <span style={{ 
                  color: "#2d3748",
                  wordBreak: "break-all",
                  whiteSpace: "pre-wrap"
                }}>
                  {displayContent}
                </span>
              ) : isCodeBlockStart ? (
                // 代码块开始标记的特殊样式
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "#007acc",
                  color: "white",
                  padding: "4px 8px",
                  borderRadius: "4px 4px 0 0",
                  fontSize: "12px",
                  fontWeight: "500",
                  margin: "-4px 0 4px -10px",
                  fontFamily: "monospace"
                }}>
                  <span>📝 代码块开始</span>
                  {codeBlock.language && (
                    <span style={{ 
                      marginLeft: "8px", 
                      backgroundColor: "rgba(255,255,255,0.2)",
                      padding: "2px 6px",
                      borderRadius: "3px",
                      fontSize: "11px"
                    }}>
                      {codeBlock.language}
                    </span>
                  )}
                </div>
              ) : isCodeBlockEnd ? (
                // 代码块结束标记的特殊样式
                <div style={{
                  backgroundColor: "#007acc",
                  color: "white",
                  padding: "4px 8px",
                  borderRadius: "0 0 4px 4px",
                  fontSize: "12px",
                  fontWeight: "500",
                  margin: "4px 0 -4px -10px",
                  textAlign: "center"
                }}>
                  📝 代码块结束
                </div>
              ) : (
                <ReactMarkdown
                  components={{
                    p: ({ node, ...props }) => (
                      <p style={{ margin: 0 }} {...props} />
                    ),
                    code: ({ node, inline, className, children, ...props }) => (
                      <code
                        style={{
                          backgroundColor: "#f0f0f0",
                          padding: "2px 4px",
                          borderRadius: "3px",
                          fontFamily: "monospace",
                          fontSize: "13px",
                          border: "1px solid #e1e1e1",
                        }}
                        {...props}
                      >
                        {children}
                      </code>
                    ),
                  }}
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex, rehypeRaw]}
                >
                  {displayContent}
                </ReactMarkdown>
              )}
            </div>
          </div>
        </div>
      );
    });
  };


  useEffect(() => {
    const fetchFileContent = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/file-corrections/${fileUuid}`);
        const responseData = response.data.data;
        const content = responseData.content.replace(/\\n/g, "\n");
        const extra = content.split("\n").map((content) => ({ content }));
        setMarkdownLines(extra);
        setContent(content);
        setStatus(responseData.status);
        const newMdMap = new MdMap(extra.length);
        let newSections = [];
        if (responseData.mdMap) {
          newMdMap.fromJSON(responseData.mdMap);
          setMdMap(newMdMap);
          newSections = convertMdMapToExamStructure(newMdMap);
          newSections = sortAndRenameSections(newSections);
        } else {
          setMdMap(newMdMap);
        }

        const examData = JSON.parse(responseData.examData);
        if (examData && examData.uuid) {
          const initialExam = { 
            sections: newSections,
            name: examData.name || "",
            category: examData.category || "",
            gradeInfo: examData.gradeInfo || { school: "", grade: "" },
            source: examData.source || "",
            kn: examData.kn || "",
            uuid: examData.uuid
          };
          setExam(initialExam);
        } else {
          const initialExam = { 
            sections: newSections,
            name: "",
            category: "",
            gradeInfo: { school: "", grade: "" },
            source: "",
            kn: "",
            uuid: uuidv4()
          };
          setExam(initialExam);
        }
      } catch (error) {
        console.error("获取文件内容时出错:", error);
        // 这里可以添加错误处理，比如显示一个错误消息
      } finally {
        setIsLoading(false);
      }
    };
    fetchFileContent();
  }, [fileUuid]);

  useEffect(() => {
    if (!isEditing) {
      updateMarkdownLines(exam.sections);
    }
  }, [exam, isEditing]);

  useEffect(() => {
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyUp]);

  useEffect(() => {
    if (mdMap && exam) {
      const createdExam = createSubmitExam(exam, markdownLines);
      setEditorState({
        name: exam.name,
        status,
        content,
        mdMap,
        exam: createdExam,
      });
    }
  }, [mdMap, exam, setEditorState, content, markdownLines, status]);

  useEffect(() => {
    // 只有在非编辑状态且scrollPosition发生变化时才滚动
    if (!isEditing && scrollPosition > 0) {
      window.scrollTo(0, scrollPosition);
      setScrollPosition(0); // 重置滚动位置，避免重复滚动
    }
  }, [scrollPosition, isEditing]);

  useEffect(() => {
    if (exam.category && dictionaries.CategoryKNMapping) {
      const knList = dictionaries.CategoryKNMapping[exam.category] || [];
      setAvailableKnowledgeNodes(knList);
      // 如果当前选中的知识点不在新的列表中,重置知识点
      if (knList.length > 0 && !knList.includes(exam.kn)) {
        setExam((prevData) => ({ ...prevData, kn: "" }));
      }
    } else {
      setAvailableKnowledgeNodes([]);
    }
  }, [exam.category, dictionaries.CategoryKNMapping, exam.kn]);

  if (isLoading) {
    return <div>加载中...</div>; // 或者使用一个加载指示器组件
  }

  return (
    <Box sx={{ maxWidth: 1200, margin: "0 auto", mt: 4, mb: 8 }}>
      <StyledPaper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <SectionTitle variant="h5" sx={{ mb: 3 }}>
          文件信息
        </SectionTitle>
        <Divider sx={{ my: 2 }} />

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              label="名称"
              value={exam.name}
              onChange={(e) => {
                const updatedExam = { ...exam, name: e.target.value };
                setExam(updatedExam);
              }}
              variant="outlined"
              sx={{ mb: 2 }}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <FormControl required fullWidth variant="outlined" sx={{ mb: 2 }}>
              <InputLabel>科目</InputLabel>
              <Select
                value={exam.category}
                onChange={(e) => {
                  const updatedExam = { ...exam, category: e.target.value };
                  setExam(updatedExam);
                }}
                label="科目"
              >
                {Object.entries(dictionaries.CategoryDict).map(
                  ([key, value]) => (
                    <MenuItem key={key} value={key}>
                      {value}
                    </MenuItem>
                  )
                )}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="来源"
              value={exam.source || ""}
              onChange={(e) => {
                const updatedExam = { ...exam, source: e.target.value };
                setExam(updatedExam);
              }}
              variant="outlined"
              sx={{ mb: 2 }}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <MultiLevelSelect
              onMultiSelectChange={handleGradeInfoChange}
              initialSchoolLevel={exam.gradeInfo.school}
              initialGrade={exam.gradeInfo.grade}
              error={false}
              disabled={false}
              readOnly={false}
              inline={true}
              required={true}
              sx={{ mb: 2 }}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <FormControl required fullWidth variant="outlined" sx={{ mb: 2 }}>
              <InputLabel>知识点</InputLabel>
              <Select
                value={exam.kn}
                onChange={(e) => {
                  const updatedExam = { ...exam, kn: e.target.value };
                  setExam(updatedExam);
                }}
                label="知识点"
              >
                {availableKnowledgeNodes.map((kn) => (
                  <MenuItem key={kn} value={kn}>
                    {dictionaries.KNDict[kn] || kn}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </StyledPaper>

      <StyledPaper elevation={3}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs>
            <SectionTitle variant="h5">文件内容</SectionTitle>
          </Grid>
          <Grid item>
            <StyledButton
              variant="contained"
              color="primary"
              startIcon={isEditing ? <SaveIcon /> : <EditIcon />}
              onClick={handleEditToggle}
            >
              {isEditing ? "保存" : "编辑"}
            </StyledButton>
          </Grid>
        </Grid>
        <Divider sx={{ my: 2 }} />
        
        {!isEditing && (
          <Box sx={{ mb: 2, p: 2, bgcolor: "#e3f2fd", borderRadius: 1 }}>
            <Typography variant="body2" color="primary">
              💡 操作提示：
              <br />
              • <strong>代码块</strong>：用蓝色左边框标识，Alt + 点击或双击选择整个代码块
              • <strong>LaTeX公式</strong>：行内公式用 <code>$公式$</code>，块级公式用 <code>$$公式$$</code>
              • <strong>支持的数学符号</strong>：分数 <code>\frac{"{a}"}{"{b}"}</code>，开方 <code>\sqrt{"{a}"}</code>，上下标 <code>x^2</code> <code>x_i</code> 等
            </Typography>
          </Box>
        )}

        <Box sx={{ mt: 2, mb: 2, bgcolor: "#f5f5f5", p: 2, borderRadius: 1 }}>
          {isEditing ? (
            <TextField
              multiline
              fullWidth
              variant="outlined"
              value={markdownLines.map((line) => line.content || "").join("\n")}
              onChange={(e) =>
                setMarkdownLines(
                  e.target.value.split("\n").map((content) => ({ content }))
                )
              }
              sx={{ fontFamily: "monospace" }}
            />
          ) : (
            <Box sx={{ fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
              {renderMarkdownWithLineNumbers(markdownLines)}
            </Box>
          )}
        </Box>
        {!isEditing && mdMap && (
          <MarkdownAnnotator
            selectedLines={selectedLines}
            exam={exam}
            anchorPosition={anchorPosition}
            onClose={() => setAnchorPosition(null)}
            onMarkSection={onMarkSection}
            onMarkQuestion={onMarkQuestion}
            onMarkSimpleQuestion={onMarkSimpleQuestion}
            onMarkQuestionDetail={onMarkQuestionDetail}
            onCancelAnnotation={onCancelAnnotation}
            onMarkMaterial={onMarkMaterial}
            onMarkQuestionContent={onMarkQuestionContent}
            onMarkExplanation={onMarkExplanation}
            onMarkAnswer={onMarkAnswer}
            onMarkRow={onMarkRow}
            colors={COLORS}
            setSelectedLines={setSelectedLines}
            mdMap={mdMap}
            // 传递代码块相关的props
            markdownLines={markdownLines}
            onSelectCodeBlock={(index) => {
              const codeBlocks = detectCodeBlocks(markdownLines);
              const blockLines = selectCodeBlock(index, codeBlocks);
              setSelectedLines(blockLines);
            }}
          />
        )}
      </StyledPaper>

      {/* Snackbar 用于显示消息 */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="success"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FileCorrectionEditor;
