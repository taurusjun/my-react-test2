import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown"; // 导入react-markdown
import { Box, Button, Grid, TextField } from "@mui/material";
import axios from "axios"; // 确保导入axios
import rehypeRaw from "rehype-raw"; // 导入 rehype-raw
import MarkdownAnnotator from "./MarkdownAnnotator"; // 引入MarkdownAnnotator

// 定义颜色常量
const COLORS = {
  SECTION: "#3f51b5", // 大题颜色
  QUESTION: "#f50057", // 标准题颜色
  QUESTION_DETAIL: "#00a152", // 小题颜色
};

const FileCorrectionEditor = ({ fileUuid }) => {
  const [markdownLines, setMarkdownLines] = useState([]);
  const [exam, setExam] = useState({
    sections: [],
  });
  const [isEditing, setIsEditing] = useState(false); // 添加编辑状态
  const [selectedLines, setSelectedLines] = useState([]); // 添加选中的行号状态
  const [anchorPosition, setAnchorPosition] = useState(null);

  const handleEditToggle = () => {
    setIsEditing((prev) => !prev); // 切换编辑状态
  };

  const handleLineClick = (event, index) => {
    event.preventDefault();
    setSelectedLines([index]);
    setAnchorPosition({
      top: event.clientY,
      left: event.clientX,
    });
  };

  const handleAnnotatorClose = () => {
    setAnchorPosition(null);
    setSelectedLines([]);
  };

  const updateExam = (newExam) => {
    setExam(newExam);
  };

  const handleMarkSection = (lineIndex, sectionOrder) => {
    setMarkdownLines((prevLines) =>
      prevLines.map((line, index) =>
        index === lineIndex
          ? {
              ...line,
              backgroundColor: COLORS.SECTION,
              label: `大题${sectionOrder}`,
            }
          : line
      )
    );
  };

  const handleMarkQuestion = (lineIndex, sectionIndex, questionOrder) => {
    setMarkdownLines((prevLines) =>
      prevLines.map((line, index) =>
        index === lineIndex
          ? {
              ...line,
              backgroundColor: COLORS.QUESTION,
              label: `标准题${sectionIndex}.${questionOrder}`,
            }
          : line
      )
    );
  };

  const handleMarkQuestionDetail = (
    lineIndex,
    sectionIndex,
    questionIndex,
    detailOrder
  ) => {
    setMarkdownLines((prevLines) =>
      prevLines.map((line, index) =>
        index === lineIndex
          ? {
              ...line,
              backgroundColor: COLORS.QUESTION_DETAIL,
              label: `小题${sectionIndex}.${questionIndex}.${detailOrder}`,
            }
          : line
      )
    );
  };

  const handleCancelAnnotation = (lineIndex) => {
    setMarkdownLines((prevLines) =>
      prevLines.map((line, index) =>
        index === lineIndex
          ? {
              content: line.content,
              backgroundColor: undefined,
              label: undefined,
            }
          : line
      )
    );
    // 这里可能还需要更新 exam 对象，移除相应的标注
  };

  const renderMarkdownWithLineNumbers = (lines) => {
    return lines.map((line, index) => {
      const backgroundColor = selectedLines.includes(index)
        ? "#d0e0ff"
        : line.backgroundColor || (index % 2 === 0 ? "#f9f9f9" : "#ffffff"); // 高亮选中行
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
          onClick={(event) => handleLineClick(event, index)} // 使用React的onClick事件
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
              rehypePlugins={[rehypeRaw]} // 添加 rehype-raw 插件
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
      // 如果后端返回了 exam 数据，也需要设置
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
              backgroundColor: isEditing ? "#3f51b5" : "#f50057", // 定义背景色
              color: "#fff", // 自定义文字颜色
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
              {/* 使用带行号的渲染 */}
            </div>
          )}
        </Box>
        <MarkdownAnnotator
          selectedLines={selectedLines}
          exam={exam}
          updateExam={updateExam}
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
