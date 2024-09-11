import React, { useState, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { Box, Button, Grid, TextField } from "@mui/material";
import axios from "axios";
import rehypeRaw from "rehype-raw";
import MarkdownAnnotator from "./MarkdownAnnotator";

const COLORS = {
  SECTION: "#3f51b5",
  QUESTION: "#f50057",
  QUESTION_DETAIL: "#00a152",
};

const FileCorrectionEditor = ({ fileUuid }) => {
  const [markdownLines, setMarkdownLines] = useState([]);
  const [exam, setExam] = useState({ sections: [] });
  const [isEditing, setIsEditing] = useState(false);
  const [selectedLines, setSelectedLines] = useState([]);
  const [anchorPosition, setAnchorPosition] = useState(null);
  const [isMultiSelecting, setIsMultiSelecting] = useState(false);
  const [initialSelectedLine, setInitialSelectedLine] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMultiSelectEnd = useCallback(() => {
    if (selectedLines.length > 1) {
      setAnchorPosition({
        top: mousePosition.y,
        left: mousePosition.x,
      });
    }
  }, [selectedLines, mousePosition]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.shiftKey || e.metaKey || e.ctrlKey) {
        setIsMultiSelecting(true);
      }
    };

    const handleKeyUp = (e) => {
      if (!e.shiftKey && !e.metaKey && !e.ctrlKey) {
        setIsMultiSelecting(false);
        handleMultiSelectEnd();
      }
    };

    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [handleMultiSelectEnd]);

  const handleEditToggle = () => {
    setIsEditing((prev) => !prev);
  };

  const handleLineClick = (event, index) => {
    event.preventDefault();

    setSelectedLines((prev) => {
      let newSelection;
      if (event.shiftKey && initialSelectedLine !== null) {
        // Shift 键按下：选择范围
        const start = Math.min(initialSelectedLine, index);
        const end = Math.max(initialSelectedLine, index);
        newSelection = Array.from(
          { length: end - start + 1 },
          (_, i) => start + i
        );
      } else if (event.metaKey || event.ctrlKey) {
        // Command/Ctrl 键按下：切换选中状态
        if (prev.includes(index)) {
          newSelection = prev.filter((i) => i !== index);
        } else {
          newSelection = [...prev, index];
        }
        setInitialSelectedLine(index);
      } else {
        // 没有按下修饰键：只选择当前行
        newSelection = [index];
        setInitialSelectedLine(index);
      }
      return newSelection;
    });

    // 单击时显示 Popover（非多选模式）
    if (!isMultiSelecting) {
      setAnchorPosition({
        top: event.clientY,
        left: event.clientX,
      });
    }
  };

  const handleAnnotatorClose = () => {
    setAnchorPosition(null);
    setSelectedLines([]);
    setInitialSelectedLine(null);
  };

  const updateExam = (newExam) => {
    setExam(newExam);
  };

  const updateMarkdownLines = (newSections) => {
    setMarkdownLines((prevLines) =>
      prevLines.map((line, index) => {
        const sectionForLine = newSections.find((section) =>
          section.lines.includes(index + 1)
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
    setExam((prevExam) => {
      // 将选中的行添加到指定的大题中，或创建新的大题
      let newSections = [...prevExam.sections];
      const sectionIndex = newSections.findIndex(
        (s) => s.order === sectionOrder
      );

      if (sectionIndex !== -1) {
        // 更新现有大题
        newSections[sectionIndex] = {
          ...newSections[sectionIndex],
          lines: [
            ...new Set([
              ...newSections[sectionIndex].lines,
              ...selectedLines.map((i) => i + 1),
            ]),
          ].sort((a, b) => a - b),
        };
      } else {
        // 创建新大题
        newSections.push({
          lines: selectedLines.map((i) => i + 1),
          order: sectionOrder,
          questions: [],
        });
      }

      // 根据每个大题的最小行号重新排序和重命名
      newSections.sort((a, b) => Math.min(...a.lines) - Math.min(...b.lines));
      newSections = newSections.map((section, index) => ({
        ...section,
        order: index + 1,
        name: `大题${index + 1}`,
      }));

      // 更新 markdownLines
      updateMarkdownLines(newSections);

      return {
        ...prevExam,
        sections: newSections,
      };
    });
  };

  const handleMarkQuestion = (selectedLines, sectionIndex, questionOrder) => {
    setMarkdownLines((prevLines) =>
      prevLines.map((line, index) =>
        selectedLines.includes(index)
          ? {
              ...line,
              backgroundColor: COLORS.QUESTION,
              label: `标准题${sectionIndex}.${questionOrder}`,
            }
          : line
      )
    );

    setExam((prevExam) => {
      const newSections = [...prevExam.sections];
      if (newSections[sectionIndex - 1]) {
        const newQuestion = {
          order: questionOrder,
          lines: selectedLines.map((index) => index + 1),
          questionDetails: [],
        };
        newSections[sectionIndex - 1].questions.push(newQuestion);
      }
      return { ...prevExam, sections: newSections };
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
          lines: selectedLines.map((index) => index + 1),
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
          lines: section.lines.filter((line) => line !== lineIndex + 1),
          questions: section.questions.map((question) => ({
            ...question,
            lines: question.lines.filter((line) => line !== lineIndex + 1),
            questionDetails: question.questionDetails.map((detail) => ({
              ...detail,
              lines: detail.lines.filter((line) => line !== lineIndex + 1),
            })),
          })),
        }))
        .filter((section) => section.lines.length > 0);

      // 重新排序和重命名大题
      const updatedSections = newSections
        .sort((a, b) => Math.min(...a.lines) - Math.min(...b.lines))
        .map((section, index) => ({
          ...section,
          order: index + 1,
          name: `大题${index + 1}`,
        }));

      // 更新 markdownLines
      updateMarkdownLines(updatedSections);

      return {
        ...prevExam,
        sections: updatedSections,
      };
    });
  };

  const renderMarkdownWithLineNumbers = (lines) => {
    return lines.map((line, index) => {
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
      const lines = response.data.content
        .split("\n")
        .map((content) => ({ content }));
      setMarkdownLines(lines);
      if (response.data.exam) {
        setExam(response.data.exam);
      }
    };
    fetchFileContent();
  }, [fileUuid]);

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
          onClose={handleAnnotatorClose}
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
