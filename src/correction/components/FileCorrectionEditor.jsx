import React, { useState, useEffect, useMemo } from "react";
import {
  Grid,
  Box,
  Button,
  TextField,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import axios from "axios";
import MarkdownAnnotator from "./MarkdownAnnotator";
import MdMap from "../utils/MdMap";
import { v4 as uuidv4 } from "uuid";
import { QUESTION_UI_TYPES } from "../../common/constants";
import { CategoryDict } from "../../provider/utils/dictionaries";

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
  const convertSection = (section) => {
    let markdown = "";
    if (section.extra && section.extra.length > 0) {
      section.extra.forEach((lineNumber) => {
        markdown += markdownLines[lineNumber - 1].content + "\n";
      });
    }

    const questions = section.questions
      .filter((question) => question && Object.keys(question).length > 0)
      .map((question) => {
        let questionMarkdown = "";

        if (
          question.material &&
          question.material.extra &&
          question.material.extra.length > 0
        ) {
          question.material.extra.forEach((lineNumber) => {
            questionMarkdown += markdownLines[lineNumber - 1].content + "\n";
          });
        }

        if (question.extra && question.extra.length > 0) {
          question.extra.forEach((lineNumber) => {
            questionMarkdown += markdownLines[lineNumber - 1].content + "\n";
          });
        }

        const questionDetails = question.questionDetails
          .filter((detail) => detail && Object.keys(detail).length > 0)
          .map((detail) => {
            let detailMarkdown = "";

            if (detail.extra && detail.extra.length > 0) {
              detail.extra.forEach((lineNumber) => {
                detailMarkdown += markdownLines[lineNumber - 1].content + "\n";
              });
            }

            if (
              detail.questionContent &&
              detail.questionContent.extra &&
              detail.questionContent.extra.length > 0
            ) {
              detail.questionContent.extra.forEach((lineNumber) => {
                detailMarkdown += markdownLines[lineNumber - 1].content + "\n";
              });
            }

            const options = detail.rows
              .filter((row) => row && row.extra && row.extra.length > 0)
              .map((row) => {
                let optionMarkdown = "";
                row.extra.forEach((lineNumber) => {
                  optionMarkdown +=
                    markdownLines[lineNumber - 1].content + "\n";
                });
                return optionMarkdown.trim();
              });

            let answerMarkdown = "";
            if (
              detail.answer &&
              detail.answer.extra &&
              detail.answer.extra.length > 0
            ) {
              detail.answer.extra.forEach((lineNumber) => {
                answerMarkdown += markdownLines[lineNumber - 1].content + "\n";
              });
            }

            let explanationMarkdown = "";
            if (
              detail.explanation &&
              detail.explanation.extra &&
              detail.explanation.extra.length > 0
            ) {
              detail.explanation.extra.forEach((lineNumber) => {
                explanationMarkdown +=
                  markdownLines[lineNumber - 1].content + "\n";
              });
            }

            const result = {
              content: detailMarkdown.trim(),
              uiType: detail.uiType,
            };

            if (options.length > 0) result.options = options;
            if (answerMarkdown) result.answer = answerMarkdown.trim();
            if (explanationMarkdown)
              result.explanation = explanationMarkdown.trim();

            return result;
          });

        return {
          content: questionMarkdown.trim(),
          questionDetails:
            questionDetails.length > 0 ? questionDetails : undefined,
        };
      });

    return {
      content: markdown.trim(),
      questions: questions.length > 0 ? questions : undefined,
    };
  };

  const result = {};
  if (exam.name) result.name = exam.name;
  if (exam.category) result.category = exam.category;

  const sections = exam.sections
    .filter((section) => section && Object.keys(section).length > 0)
    .map(convertSection)
    .filter(
      (section) =>
        section.content || (section.questions && section.questions.length > 0)
    );

  if (sections.length > 0) result.sections = sections;

  return result;
};

const FileCorrectionEditor = ({ fileUuid, editable, setEditorState }) => {
  const [markdownLines, setMarkdownLines] = useState([]);
  const [selectedLines, setSelectedLines] = useState([]);
  const [exam, setExam] = useState({ sections: [], name: "", category: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [anchorPosition, setAnchorPosition] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [fixedStartIndex, setFixedStartIndex] = useState(null);
  const [mdMap, setMdMap] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const convertMdMapToExamStructure = () => {
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
        } else if (value.type === "question_content") {
          const lastQuestionDetail =
            questionDetails[questionDetails.length - 1];
          if (lastQuestionDetail) {
            lastQuestionDetail.questionContent.push(i);
          }
        } else if (value.type === "question_explanation") {
          const lastQuestionDetail =
            questionDetails[questionDetails.length - 1];
          if (lastQuestionDetail) {
            lastQuestionDetail.explanation.push(i);
          }
        } else if (value.type === "question_answer") {
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

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
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

  const onMarkSection = (selectedLineRange, selectedSectionObject) => {
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

      let newSections = convertMdMapToExamStructure();
      //重新排序
      newSections = sortAndRenameSections(newSections);

      return {
        ...prev,
        sections: newSections,
      };
    });
  };

  const onMarkQuestion = (selectedLineNumbers) => {
    setExam((prevExam) => {
      const newQuestion = {
        uuid: uuidv4(), // 添加 uuid
        type: "question", // 添加 type 属性
      };

      mdMap.setMultiLinesWithLock(selectedLineNumbers, newQuestion);

      let newSections = convertMdMapToExamStructure();

      //重新排序
      newSections = sortAndRenameSections(newSections);
      return { ...prevExam, sections: newSections };
    });
  };

  const onMarkQuestionDetail = (selectedLineNumbers, selectedQuestionType) => {
    setExam((prevExam) => {
      const newQuestionDetail = {
        uuid: uuidv4(), // 添加 uuid
        type: "questionDetail", // 添加 type 属性
        uiType: selectedQuestionType,
      };

      mdMap.setMultiLinesWithLock(selectedLineNumbers, newQuestionDetail);

      let newSections = convertMdMapToExamStructure();

      //重新排序
      newSections = sortAndRenameSections(newSections);
      return { ...prevExam, sections: newSections };
    });
  };

  const onMarkAnswer = (selectedLineNumbers) => {
    setExam((prevExam) => {
      const newAnswer = {
        uuid: uuidv4(),
        type: "question_answer",
      };

      mdMap.setMultiLinesWithLock(selectedLineNumbers, newAnswer);

      let newSections = convertMdMapToExamStructure();

      newSections = sortAndRenameSections(newSections);
      return { ...prevExam, sections: newSections };
    });
  };

  const onMarkRow = (selectedLineNumbers) => {
    setExam((prevExam) => {
      const newRow = {
        uuid: uuidv4(),
        type: "questionDetail_row",
      };

      mdMap.setMultiLinesWithLock(selectedLineNumbers, newRow);

      let newSections = convertMdMapToExamStructure();

      newSections = sortAndRenameSections(newSections);
      return { ...prevExam, sections: newSections };
    });
  };

  const onCancelAnnotation = (selectedLines) => {
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

      let newSections = convertMdMapToExamStructure();

      //重新排序
      newSections = sortAndRenameSections(newSections);

      return {
        ...prevExam,
        sections: newSections,
      };
    });
  };

  const onMarkMaterial = (selectedLineNumbers) => {
    setExam((prevExam) => {
      const newQuestionMaterial = {
        uuid: uuidv4(), // 添加 uuid
        type: "question_material", // 添加 type 属性
      };

      const selectedLineNumbers = selectedLines.map((index) => index + 1);
      mdMap.setMultiLinesWithLock(selectedLineNumbers, newQuestionMaterial);

      let newSections = convertMdMapToExamStructure();

      //重新排序
      newSections = sortAndRenameSections(newSections);
      return { ...prevExam, sections: newSections };
    });
  };

  const onMarkQuestionContent = (selectedLineNumbers) => {
    setExam((prevExam) => {
      const newQuestionContent = {
        uuid: uuidv4(), // 添加 uuid
        type: "question_content", // 添加 type 属性
      };

      const selectedLineNumbers = selectedLines.map((index) => index + 1);
      mdMap.setMultiLinesWithLock(selectedLineNumbers, newQuestionContent);

      let newSections = convertMdMapToExamStructure();

      //重新排序
      newSections = sortAndRenameSections(newSections);
      return { ...prevExam, sections: newSections };
    });
  };

  const onMarkExplanation = (selectedLineNumbers) => {
    setExam((prevExam) => {
      const newExplanation = {
        uuid: uuidv4(), // 添加 uuid
        type: "question_explanation", // 添加 type 属性
      };

      const selectedLineNumbers = selectedLines.map((index) => index + 1);
      mdMap.setMultiLinesWithLock(selectedLineNumbers, newExplanation);

      let newSections = convertMdMapToExamStructure();

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
        if (response.data.exam) {
          setExam(response.data.exam);
        }
        const newMdMap = new MdMap(extra.length);
        setMdMap(newMdMap);
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
    updateMarkdownLines(exam.sections);
  }, [exam]);

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

  if (isLoading) {
    return <div>加载中...</div>; // 或者使用一个加载指示器组件
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="flex-start"
          style={{ marginBottom: "10px" }}
        >
          <Button
            onClick={handleEditToggle}
            variant="contained"
            style={{
              backgroundColor: isEditing ? "#3f51b5" : "#f50057",
              color: "#fff",
              marginRight: "10px",
            }}
          >
            {isEditing ? "保存" : "编辑"}
          </Button>
          <FormControl required size="small" sx={{ mr: 1, minWidth: 120 }}>
            <InputLabel>科目</InputLabel>
            <Select
              required
              value={exam.category}
              onChange={handleCategoryChange}
              label="科目"
            >
              <MenuItem value="">全部</MenuItem>
              {Object.entries(CategoryDict).map(([key, value]) => (
                <MenuItem key={key} value={key}>
                  {value}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            required
            label="名称"
            value={exam.name}
            onChange={handleNameChange}
            size="small"
            sx={{ mt: 1, mr: 1, mb: 1, width: 1000 }}
          />
        </Box>
        <Box display="flex" flexDirection="column" width="100%">
          {isEditing ? (
            <TextField
              label="编辑Markdown"
              value={markdownLines.map((line) => line.content || "").join("\n")}
              onChange={(e) =>
                setMarkdownLines(
                  e.target.value.split("\n").map((content) => ({ content }))
                )
              }
              fullWidth
              multiline
              rows={10}
              margin="normal"
            />
          ) : (
            <div style={{ width: "100%" }}>
              {renderMarkdownWithLineNumbers(markdownLines)}
            </div>
          )}
        </Box>
        {mdMap && (
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
      </Grid>
    </Grid>
  );
};

export default FileCorrectionEditor;
