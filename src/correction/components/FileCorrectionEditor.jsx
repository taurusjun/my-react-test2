import React, { useState, useEffect, useMemo } from "react";
import { Grid, Box, Button, TextField, Snackbar, Alert } from "@mui/material";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import axios from "axios";
import MarkdownAnnotator from "./MarkdownAnnotator";
import MdMap from "../utils/MdMap";
import { v4 as uuidv4 } from "uuid";

const COLORS = {
  SECTION: "#ffeb3b",
  QUESTION: "#8bc34a",
  MATERIAL: "#a5d6a7",
  QUESTION_DETAIL: "#03a9f4",
  QUESTION_CONTENT: "#c5e1a5", // 添加 QUESTION_CONTENT 颜色
  EXPLANATION: "#ffcc80", // 添加 EXPLANATION 颜色
  ANSWER: "#ffab91", // 添加 ANSWER 颜色
  ROW: "#ffab91", // 添加 ANSWER 颜色
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

const FileCorrectionEditor = ({ fileUuid }) => {
  const [markdownLines, setMarkdownLines] = useState([]);
  const [selectedLines, setSelectedLines] = useState([]);
  const [exam, setExam] = useState({ sections: [] });
  const [isEditing, setIsEditing] = useState(false);
  const [anchorPosition, setAnchorPosition] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [fixedStartIndex, setFixedStartIndex] = useState(null);
  const [mdMap, setMdMap] = useState(null);

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
                    }`,
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
        const sectionForLine = sections.find((section) =>
          section.extra.includes(index + 1)
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
          .find((question) => question.extra.includes(index + 1));

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
          .find((detail) => detail.extra.includes(index + 1));

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
          .find((material) => material.extra.includes(index + 1));

        if (materialForLine) {
          return {
            ...line,
            backgroundColor: COLORS.MATERIAL,
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
          .find((questionContent) => questionContent.extra.includes(index + 1));

        if (questionContentForLine) {
          return {
            ...line,
            backgroundColor: COLORS.QUESTION_CONTENT,
            label: questionContentForLine.name,
          };
        }

        const explanationForLine = sections
          .flatMap((section) =>
            section.questions.flatMap((question) =>
              question.questionDetails.flatMap((detail) => detail.explanation)
            )
          )
          .find((explanation) => explanation.extra.includes(index + 1));

        if (explanationForLine) {
          return {
            ...line,
            backgroundColor: COLORS.EXPLANATION,
            label: explanationForLine.name,
          };
        }

        const answerForLine = sections
          .flatMap((section) =>
            section.questions.flatMap((question) =>
              question.questionDetails.flatMap((detail) => detail.answer)
            )
          )
          .find((answer) => answer.extra.includes(index + 1));

        if (answerForLine) {
          return {
            ...line,
            backgroundColor: COLORS.ANSWER,
            label: answerForLine.name,
          };
        }

        const rowForLine = sections
          .flatMap((section) =>
            section.questions.flatMap((question) =>
              question.questionDetails.flatMap((detail) => detail.rows)
            )
          )
          .find((row) => row.extra.includes(index + 1));

        if (rowForLine) {
          return {
            ...line,
            backgroundColor: rowForLine.isAns
              ? COLORS.ANSWER
              : COLORS.QUESTION_DETAIL,
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

  const onMarkQuestion = (selectedLines, currentSection) => {
    setExam((prevExam) => {
      const newQuestion = {
        uuid: uuidv4(), // 添加 uuid
        type: "question", // 添加 type 属性
      };

      const selectedLineNumbers = selectedLines.map((index) => index + 1);
      mdMap.setMultiLinesWithLock(selectedLineNumbers, newQuestion);

      let newSections = convertMdMapToExamStructure();

      //重新排序
      newSections = sortAndRenameSections(newSections);
      return { ...prevExam, sections: newSections };
    });
  };

  const onMarkQuestionDetail = (
    selectedLines,
    currentSection,
    currentQuestion
  ) => {
    setExam((prevExam) => {
      const newQuestionDetail = {
        uuid: uuidv4(), // 添加 uuid
        type: "questionDetail", // 添加 type 属性
      };

      const selectedLineNumbers = selectedLines.map((index) => index + 1);
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
            alignItems: "center",
            lineHeight: "1.5",
            backgroundColor,
            cursor: "pointer",
          }}
          onMouseDown={(event) => handleLineClick(event, index)}
        >
          <div
            style={{ width: "50px", textAlign: "right", paddingRight: "10px" }}
          >
            {index + 1}
          </div>
          <div style={{ flex: 1 }}>
            {line.label && (
              <span style={{ fontWeight: "bold", marginRight: "10px" }}>
                {line.label}
              </span>
            )}
            <ReactMarkdown
              components={{ p: ({ node, ...props }) => <p {...props} /> }}
              rehypePlugins={[rehypeRaw]}
            >
              {typeof line === "string" ? line : line.content || ""}
            </ReactMarkdown>
          </div>
        </div>
      );
    });
  };

  useEffect(() => {
    const fetchFileContent = async () => {
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

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Box
          display="flex"
          alignItems="center"
          style={{ marginBottom: "10px" }}
        >
          <Button
            onClick={handleEditToggle}
            variant="contained"
            style={{
              backgroundColor: isEditing ? "#3f51b5" : "#f50057",
              color: "#fff",
            }}
          >
            {isEditing ? "保存" : "编辑"}
          </Button>
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
          onMarkExplanation={onMarkExplanation} // 添加 onMarkExplanation 作为 props
          onMarkAnswer={onMarkAnswer} // 添加 onMarkAnswer 作为 props
          onMarkRow={onMarkRow}
          colors={COLORS}
          setSelectedLines={setSelectedLines}
          mdMap={mdMap}
        />
      </Grid>
    </Grid>
  );
};

export default FileCorrectionEditor;
