import React, { useState, useEffect } from "react";
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
  QUESTION_DETAIL: "#03a9f4",
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
    // 根据每个大题的最小行号重新排序和重命名
    sections.sort((a, b) => Math.min(...a.extra) - Math.min(...b.extra));
    return sections.map((section, index) => {
      // 对每个 section 进行排序和重命名
      const sortedQuestions = section.questions
        .sort((q1, q2) => Math.min(...q1.extra) - Math.min(...q2.extra))
        .map((question, questionIndex) => ({
          ...question,
          order: questionIndex + 1, // 设置 question 的 order
          name: `标准题${index + 1}.${questionIndex + 1}`, // 更新 name
        }));

      return {
        ...section,
        order: index + 1, // 设置 section 的 order
        questions: sortedQuestions, // 更新 questions
        name: `大题${index + 1}`, // 更新 name
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
            label: `大题${sectionForLine.order}`,
          };
        }

        // 检查是否属于某个 question
        const questionForLine = sections
          .flatMap((section) => section.questions)
          .find((question) => question.extra.includes(index + 1));

        if (questionForLine) {
          const sectionIndex = sections.findIndex((section) =>
            section.questions.includes(questionForLine)
          );
          const questionIndex =
            sectionIndex !== -1
              ? sections[sectionIndex].questions.findIndex(
                  (q) => q === questionForLine
                ) + 1
              : 0;

          return {
            ...line,
            backgroundColor: COLORS.QUESTION,
            label: `标准题${sectionIndex + 1}.${questionIndex}`, // 更新标签格式
          };
        }

        return line;
      })
    );
  };

  const onMarkSection = (selectedLineRange, selectedSectionObject) => {
    setExam((prev) => {
      let newSections = [...prev.sections];
      let updatedSection;
      if (selectedSectionObject) {
        // 更新现有大题
        updatedSection = {
          ...selectedSectionObject,
          extra: [
            ...new Set([...selectedSectionObject.extra, ...selectedLineRange]),
          ].sort((a, b) => a - b),
        };
      } else {
        // 创建新大题
        updatedSection = {
          uuid: uuidv4(), // 添加 uuid
          type: "section", // 添加 type 属性
          extra: selectedLineRange,
          questions: [],
        };
      }

      const changedSections = mdMap.insertSection(
        selectedLineRange,
        updatedSection
      );

      if (newSections.length === 0) {
        newSections = changedSections;
      } else {
        changedSections.forEach((section) => {
          const index = newSections.findIndex((s) => s.uuid === section.uuid);
          if (index !== -1) {
            newSections[index] = section;
          } else {
            newSections.push(section);
          }
        });
      }

      //重新排序
      newSections = sortAndRenameSections(newSections);
      // 更新 markdownLines
      updateMarkdownLines(newSections);

      return {
        ...prev,
        sections: newSections,
      };
    });
  };

  // selectedLines 选中的行， currentSection 行所归属的section
  const onMarkQuestion = (selectedLines, currentSection) => {
    setExam((prevExam) => {
      let newSections = [...prevExam.sections];
      const sectionIndex = newSections.findIndex(
        (section) => section.order === currentSection.order
      );

      // 获取当前大题下已有标准题的数量
      const currentQuestionCount = newSections[sectionIndex].questions.length;

      // 计算新的标准题序号
      const newQuestionOrder = currentQuestionCount + 1;

      // 创建新的标准题对象
      const selectedLineNumbers = selectedLines.map((index) => index + 1);
      const newQuestion = {
        uuid: uuidv4(), // 添加 uuid
        type: "question", // 添加 type 属性
        extra: selectedLineNumbers, // 将行号加入 question 的 extra 属性
        order: newQuestionOrder,
        materials: [],
      };

      // 将新的标准题添加到当前大题
      newSections[sectionIndex].questions.push(newQuestion);

      //重新排序
      newSections = sortAndRenameSections(newSections);

      // 更新 markdownLines，设置所选行的背景颜色和标签
      updateMarkdownLines(newSections);

      mdMap.setMultiLinesWithLock(selectedLineNumbers, newQuestion);

      return { ...prevExam, sections: newSections };
    });
  };

  const onMarkQuestionDetail = (
    selectedLines,
    sectionIndex,
    questionIndex,
    detailOrder
  ) => {
    setMarkdownLines((prevLines) =>
      prevLines.map((line, index) =>
        selectedLines.includes(index)
          ? {
              ...line,
              backgroundColor: COLORS.QUESTION_DETAIL,
              label: `小题${sectionIndex}.${questionIndex}.${detailOrder}`,
            }
          : line
      )
    );

    setExam((prevExam) => {
      const newSections = [...prevExam.sections];
      if (newSections[sectionIndex - 1]?.questions[questionIndex - 1]) {
        const newQuestionDetail = {
          uuid: uuidv4(), // 添加 uuid
          type: "questionDetail", // 添加 type 属性
          order: detailOrder,
          extra: selectedLines.map((index) => index + 1),
        };
        newSections[sectionIndex - 1].questions[
          questionIndex - 1
        ].questionDetails.push(newQuestionDetail);

        mdMap.setMultiLinesWithLock(newQuestionDetail.extra, newQuestionDetail);
      }
      return { ...prevExam, sections: newSections };
    });
  };

  const onCancelAnnotation = (lineIndex) => {
    setExam((prevExam) => {
      let newSections = prevExam.sections
        .map((section) => ({
          ...section,
          extra: section.extra.filter((line) => line !== lineIndex + 1),
          questions: section.questions
            .map((question) => ({
              ...question,
              extra: question.extra.filter((line) => line !== lineIndex + 1),
              questionDetails: question.questionDetails
                ? question.questionDetails.map((detail) => ({
                    ...detail,
                    extra: detail.extra.filter(
                      (line) => line !== lineIndex + 1
                    ),
                  }))
                : [],
            }))
            .filter((question) => question.extra.length > 0),
        }))
        .filter((section) => section.extra.length > 0);

      // 重新排序和重命名大题
      //   const updatedSections = newSections
      //     .sort((a, b) => Math.min(...a.extra) - Math.min(...b.extra))
      //     .map((section, index) => ({
      //       ...section,
      //       order: index + 1,
      //       name: `大题${index + 1}`,
      //     }));

      // 更新 markdownLines
      setMarkdownLines((prevLines) =>
        prevLines.map((line, index) => {
          if (index === lineIndex) {
            return {
              content: line.content,
              backgroundColor: undefined,
              label: undefined,
            };
          }
          return line;
        })
      );

      mdMap.set(lineIndex + 1, null);

      //重新排序
      newSections = sortAndRenameSections(newSections);

      // 更新 markdownLines，设置所选行的背景颜色和标签
      updateMarkdownLines(newSections);

      return {
        ...prevExam,
        sections: newSections,
      };
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
          updateExam={setExam}
          anchorPosition={anchorPosition}
          onClose={() => setAnchorPosition(null)}
          onMarkSection={onMarkSection}
          onMarkQuestion={onMarkQuestion}
          onMarkQuestionDetail={onMarkQuestionDetail}
          onCancelAnnotation={onCancelAnnotation}
          colors={COLORS}
          markdownLines={markdownLines}
          setSelectedLines={setSelectedLines}
          mdMap={mdMap}
        />
      </Grid>
    </Grid>
  );
};

export default FileCorrectionEditor;
