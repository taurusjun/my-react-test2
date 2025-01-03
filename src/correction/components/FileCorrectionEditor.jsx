import React, { useState, useEffect, useMemo } from "react";
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

const COLORS = {
  SECTION: "#3f51b5", // 深蓝色
  QUESTION: "#4caf50", // 绿色
  QUESTION_MATERIAL: "#81c784", // 浅绿色
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
      const questionDetails = question.questionDetails.map((detail) => {
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
          result.answer = [getContent(detail.answer.extra)];
        }

        if (detail.explanation) {
          result.explanation = getContent(detail.explanation.extra);
        }

        return result;
      });

      return {
        uuid: question.uuid,
        type:
          question.questionDetails[0]?.uiType === "fill_blank"
            ? "fill_in_blank"
            : "selection", //TODO: 需要有type的取值规则
        category: exam.category,
        order_in_section: question.order, // 添加 order_in_section 字段
        kn: exam.kn,
        gradeInfo: exam.gradeInfo,
        source: exam.source,
        tags: [],
        digest: question.name,
        material: getContent(question.material.extra),
        questionDetails: questionDetails,
        relatedSources: [],
      };
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
  const [isLoading, setIsLoading] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [availableKnowledgeNodes, setAvailableKnowledgeNodes] = useState([]);

  const { dictionaries } = useDictionaries();

  const convertMdMapToExamStructure = (mdMap) => {
    const sections = [];
    const questions = [];
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
          const lastQuestionDetail =
            questionDetails[questionDetails.length - 1];
          if (lastQuestionDetail) {
            lastQuestionDetail.questionContent.push(i);
          }
        } else if (value.type === "questionDetail_explanation") {
          const lastQuestionDetail =
            questionDetails[questionDetails.length - 1];
          if (lastQuestionDetail) {
            lastQuestionDetail.explanation.push(i);
          }
        } else if (value.type === "questionDetail_answer") {
          const lastQuestionDetail =
            questionDetails[questionDetails.length - 1];
          if (lastQuestionDetail) {
            lastQuestionDetail.answer.push(i); // 将行号添加到 answer 字段中
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
          const lastQuestionDetail =
            questionDetails[questionDetails.length - 1];
          if (lastQuestionDetail) {
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
        const response = await axios.post(
          `/api/file-corrections/${fileUuid}/save-content`,
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

  const handleKeyUp = (event) => {
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
  };

  // 添加处理学习阶段变化的函数
  const handleSchoolLevelChange = (event) => {
    const newSchoolLevel = event.target.value;
    setExam((prev) => ({
      ...prev,
      gradeInfo: { ...prev.gradeInfo, school: newSchoolLevel, grade: "" },
    }));
    setEditorState((prevState) => ({
      ...prevState,
      exam: {
        ...prevState.exam,
        gradeInfo: exam.gradeInfo,
      },
    }));
  };

  // 修改处理 gradeInfo 变化的函数
  const handleGradeInfoChange = (school, grade) => {
    setExam((prev) => ({
      ...prev,
      gradeInfo: { school, grade },
    }));
  };

  // 重新排序
  const sortAndRenameSections = (sections) => {
    sections.sort((a, b) => Math.min(...a.extra) - Math.min(...b.extra));
    return sections.map((section, index) => {
      const sortedQuestions = section.questions
        .sort((q1, q2) => Math.min(...q1.extra) - Math.min(...q2.extra))
        .map((question, questionIndex) => {
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
            name: `标准题${index + 1}.${questionIndex + 1}_材料`,
          };

          return {
            ...question,
            order: questionIndex + 1,
            name: `标准题${index + 1}.${questionIndex + 1}`,
            questionDetails: sortedQuestionDetails,
            material: sortedMaterial,
          };
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
          section.extra.includes(lineNumber)
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
          .find((question) => question.extra.includes(lineNumber));

        if (questionForLine) {
          return {
            ...line,
            backgroundColor: COLORS.QUESTION,
            label: questionForLine.name,
          };
        }

        const questionDetailForLine = sections
          .flatMap((section) =>
            section.questions.flatMap((question) => question.questionDetails)
          )
          .find((detail) => detail.extra.includes(lineNumber));

        if (questionDetailForLine) {
          return {
            ...line,
            backgroundColor: COLORS.QUESTION_DETAIL,
            label: questionDetailForLine.name,
          };
        }

        const materialForLine = sections
          .flatMap((section) =>
            section.questions.flatMap((question) => question.material)
          )
          .find((material) => material.extra.includes(lineNumber));

        if (materialForLine) {
          return {
            ...line,
            backgroundColor: COLORS.QUESTION_MATERIAL,
            label: materialForLine.name,
          };
        }

        const questionContentForLine = sections
          .flatMap((section) =>
            section.questions.flatMap((question) =>
              question.questionDetails.flatMap(
                (detail) => detail.questionContent
              )
            )
          )
          .find((questionContent) =>
            questionContent.extra.includes(lineNumber)
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
            section.questions.flatMap((question) =>
              question.questionDetails.flatMap((detail) => detail.explanation)
            )
          )
          .find((explanation) => explanation.extra.includes(lineNumber));

        if (explanationForLine) {
          return {
            ...line,
            backgroundColor: COLORS.QUESTION_DETAIL_EXPLANATION,
            label: explanationForLine.name,
          };
        }

        const answerForLine = sections
          .flatMap((section) =>
            section.questions.flatMap((question) =>
              question.questionDetails.flatMap((detail) => detail.answer)
            )
          )
          .find((answer) => answer.extra.includes(lineNumber));

        if (answerForLine) {
          return {
            ...line,
            backgroundColor: COLORS.QUESTION_DETAIL_ANSWER,
            label: answerForLine.name,
          };
        }

        const rowForLine = sections
          .flatMap((section) =>
            section.questions.flatMap((question) =>
              question.questionDetails.flatMap((detail) => detail.rows)
            )
          )
          .find((row) => row.extra.includes(lineNumber));

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

  const onMarkMaterial = (selectedLineNumbers) => {
    saveScrollPosition();
    setExam((prevExam) => {
      const newQuestionMaterial = {
        uuid: uuidv4(), // 添加 uuid
        type: "question_material", // 添加 type 属性
      };

      const selectedLineNumbers = selectedLines.map((index) => index + 1);
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

      const selectedLineNumbers = selectedLines.map((index) => index + 1);
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

      const selectedLineNumbers = selectedLines.map((index) => index + 1);
      mdMap.setMultiLinesWithLock(selectedLineNumbers, newExplanation);

      let newSections = convertMdMapToExamStructure(mdMap);

      //重新排序
      newSections = sortAndRenameSections(newSections);
      return { ...prevExam, sections: newSections };
    });
  };

  const renderMarkdownWithLineNumbers = (extra) => {
    return extra.map((line, index) => {
      const isSelected = selectedLines.includes(index);
      const backgroundColor = isSelected
        ? "#d0e0ff"
        : line.backgroundColor || (index % 2 === 0 ? "#f9f9f9" : "#ffffff");

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
          }}
          onMouseDown={(event) => handleLineClick(event, index)}
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
              backgroundColor: "#f0f0f0",
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
            <ReactMarkdown
              components={{
                p: ({ node, ...props }) => (
                  <p style={{ margin: 0 }} {...props} />
                ),
              }}
              rehypePlugins={[rehypeRaw]}
            >
              {typeof line === "string" ? line : line.content || ""}
            </ReactMarkdown>
          </div>
        </div>
      );
    });
  };

  const handleNameChange = (event) => {
    setExam((prev) => ({ ...prev, name: event.target.value }));
  };

  const handleCategoryChange = (event) => {
    setExam((prev) => ({ ...prev, category: event.target.value }));
  };

  useEffect(() => {
    const fetchFileContent = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/file-corrections/${fileUuid}`);
        const extra = response.data.content
          .split("\n")
          .map((content) => ({ content }));
        setMarkdownLines(extra);
        const newMdMap = new MdMap(extra.length);
        let newSections = [];
        if (response.data.mdMap) {
          newMdMap.fromJSON(response.data.mdMap);
          setMdMap(newMdMap);
          newSections = convertMdMapToExamStructure(newMdMap);
          newSections = sortAndRenameSections(newSections);
        } else {
          setMdMap(newMdMap);
        }
        setExam({ ...exam, uuid: uuidv4(), sections: newSections });
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
  }, [selectedLines, mousePosition]);

  useEffect(() => {
    if (mdMap && exam) {
      const createdExam = createSubmitExam(exam, markdownLines);
      setEditorState({ mdMap, exam: createdExam });
    }
  }, [mdMap, exam, setEditorState]);

  useEffect(() => {
    window.scrollTo(0, scrollPosition);
  }, [exam, scrollPosition]);

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
              onChange={(e) => setExam({ ...exam, name: e.target.value })}
              variant="outlined"
              sx={{ mb: 2 }}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <FormControl required fullWidth variant="outlined" sx={{ mb: 2 }}>
              <InputLabel>科目</InputLabel>
              <Select
                value={exam.category}
                onChange={(e) => setExam({ ...exam, category: e.target.value })}
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
              onChange={(e) => setExam({ ...exam, source: e.target.value })}
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
                onChange={(e) => setExam({ ...exam, kn: e.target.value })}
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
