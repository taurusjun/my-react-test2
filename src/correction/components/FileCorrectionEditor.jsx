import React, { useState, useEffect } from "react";
import { Grid, Box, Button, TextField, Snackbar, Alert } from "@mui/material";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import axios from "axios";
import MarkdownAnnotator from "./MarkdownAnnotator";

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

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleLineClick = (event, index) => {
    if (event.shiftKey) {
      const lastIndex = selectedLines[selectedLines.length - 1];
      const range = [lastIndex, index].sort((a, b) => a - b);
      const newSelectedLines = [];
      for (let i = range[0]; i <= range[1]; i++) {
        newSelectedLines.push(i);
      }
      setSelectedLines(newSelectedLines);
    } else if (event.metaKey || event.ctrlKey) {
      setSelectedLines((prev) =>
        prev.includes(index)
          ? prev.filter((line) => line !== index)
          : [...prev, index]
      );
    } else {
      setSelectedLines([index]);
    }
    setAnchorPosition({
      top: event.clientY,
      left: event.clientX,
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
        return line;
      })
    );
  };

  const handleMarkSection = (selectedLines, sectionOrder) => {
    setExam((prev) => {
      let newSections = [...prev.sections];
      const sectionIndex = newSections.findIndex(
        (s) => s.order === sectionOrder
      );

      let updatedSection;
      if (sectionIndex !== -1) {
        // 更新现有大题
        updatedSection = {
          ...newSections[sectionIndex],
          extra: [
            ...new Set([
              ...newSections[sectionIndex].extra,
              ...selectedLines.map((i) => i + 1),
            ]),
          ].sort((a, b) => a - b),
        };
      } else {
        // 创建新大题
        updatedSection = {
          extra: selectedLines.map((i) => i + 1),
          order: sectionOrder,
          questions: [],
        };
      }

      // 检查是否与其他大题重叠
      const hasOverlap = newSections.some((section, index) => {
        if (index === sectionIndex) return false;
        const sectionStart = Math.min(...section.extra);
        const sectionEnd = Math.max(...section.extra);
        const updatedStart = Math.min(...updatedSection.extra);
        const updatedEnd = Math.max(...updatedSection.extra);
        return updatedStart <= sectionEnd && updatedEnd >= sectionStart;
      });

      if (hasOverlap) {
        // 如果有重叠，不进行更新
        console.error("选中的行范围与其他大题重叠，无法更新");
        return prev;
      }

      // 如果没有重叠，进行更新
      if (sectionIndex !== -1) {
        newSections[sectionIndex] = updatedSection;
      } else {
        newSections.push(updatedSection);
      }

      // 根据每个大题的最小行号重新排序和重命名
      newSections.sort((a, b) => Math.min(...a.extra) - Math.min(...b.extra));
      newSections = newSections.map((section, index) => ({
        ...section,
        order: index + 1,
        name: `大题${index + 1}`,
      }));

      // 更新 markdownLines
      updateMarkdownLines(newSections);

      return {
        ...prev,
        sections: newSections,
      };
    });
  };

  const findClosestSectionForSelectedLines = (selectedLineNumbers) => {
    const selectedLineStart = Math.min(...selectedLineNumbers);
    const sectionsWithMaxLines = exam.sections.map((section) => ({
      section,
      maxLine: Math.max(...section.extra),
    }));
    const closestSection = sectionsWithMaxLines
      .filter(({ maxLine }) => maxLine < selectedLineStart)
      .sort((a, b) => b.maxLine - a.maxLine)[0];
    return closestSection ? closestSection.section : null;
  };

  const handleMarkQuestion = (selectedLines) => {
    const selectedLineNumbers = selectedLines.map((index) => index + 1);
    const currentSection =
      findClosestSectionForSelectedLines(selectedLineNumbers);

    if (!currentSection) {
      console.error("未找到所属的大题");
      return;
    }

    setExam((prevExam) => {
      const newSections = [...prevExam.sections];
      const sectionIndex = newSections.indexOf(currentSection);

      if (sectionIndex !== -1) {
        // 获取当前大题下已有标准题的数量
        const currentQuestionCount = currentSection.questions.length;

        // 计算新的标准题序号
        const newQuestionNumber = currentQuestionCount + 1;

        // 创建新的标准题对象
        const newQuestion = {
          lineNumbers: selectedLineNumbers,
          number: newQuestionNumber,
        };

        // 将新的标准题添加到当前大题
        currentSection.questions.push(newQuestion);

        // 更新 markdownLines，设置所选行的背景颜色和标签
        setMarkdownLines((prevLines) =>
          prevLines.map((line, index) =>
            selectedLines.includes(index)
              ? {
                  ...line,
                  backgroundColor: COLORS.QUESTION,
                  label: `标准题${sectionIndex + 1}.${newQuestionNumber}`,
                }
              : line
          )
        );

        // 更新 exam 对象
        newSections[sectionIndex] = currentSection;
        return { ...prevExam, sections: newSections };
      }

      return prevExam;
    });
  };

  const handleMarkQuestionDetail = (
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
          order: detailOrder,
          extra: selectedLines.map((index) => index + 1),
        };
        newSections[sectionIndex - 1].questions[
          questionIndex - 1
        ].questionDetails.push(newQuestionDetail);
      }
      return { ...prevExam, sections: newSections };
    });
  };

  const handleCancelAnnotation = (lineIndex) => {
    setExam((prevExam) => {
      const newSections = prevExam.sections
        .map((section) => ({
          ...section,
          extra: section.extra.filter((line) => line !== lineIndex + 1),
          questions: section.questions.map((question) => ({
            ...question,
            extra: question.extra.filter((line) => line !== lineIndex + 1),
            questionDetails: question.questionDetails
              ? question.questionDetails.map((detail) => ({
                  ...detail,
                  extra: detail.extra.filter((line) => line !== lineIndex + 1),
                }))
              : [],
          })),
        }))
        .filter((section) => section.extra.length > 0);

      // 重新排序和重命名大题
      const updatedSections = newSections
        .sort((a, b) => Math.min(...a.extra) - Math.min(...b.extra))
        .map((section, index) => ({
          ...section,
          order: index + 1,
          name: `大题${index + 1}`,
        }));

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

      return {
        ...prevExam,
        sections: updatedSections,
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
    };
    fetchFileContent();
  }, [fileUuid]);

  useEffect(() => {
    updateMarkdownLines(exam.sections);
  }, [exam]);

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
          onMarkSection={handleMarkSection}
          onMarkQuestion={handleMarkQuestion}
          onMarkQuestionDetail={handleMarkQuestionDetail}
          onCancelAnnotation={handleCancelAnnotation}
          colors={COLORS}
          markdownLines={markdownLines}
        />
      </Grid>
    </Grid>
  );
};

export default FileCorrectionEditor;
