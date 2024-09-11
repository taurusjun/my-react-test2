import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown"; // 导入react-markdown
import { Box, Button, Grid, TextField } from "@mui/material";
import axios from "axios"; // 确保导入axios
import rehypeRaw from "rehype-raw"; // 导入 rehype-raw
import MarkdownAnnotator from "./MarkdownAnnotator"; // 引入MarkdownAnnotator

const FileCorrectionEditor = ({ fileUuid }) => {
  const [markdownLines, setMarkdownLines] = useState([]);
  const [sections, setSections] = useState([]); // 添加sections状态
  const [isEditing, setIsEditing] = useState(false); // 添加编辑状态
  const [selectedLines, setSelectedLines] = useState([]); // 添加选中的行号状态

  const handleEditToggle = () => {
    setIsEditing((prev) => !prev); // 切换编辑状态
  };

  const handleLineClick = (index) => {
    setSelectedLines((prev) => {
      if (prev.includes(index)) {
        return prev.filter((line) => line !== index); // 取消选择
      }
      return [...prev, index]; // 添加选择
    });
  };

  // 生成带行号的HTML
  const renderMarkdownWithLineNumbers = (lines) => {
    return lines.map((line, index) => {
      const backgroundColor = selectedLines.includes(index)
        ? "#d0e0ff"
        : index % 2 === 0
        ? "#f9f9f9"
        : "#ffffff"; // 高亮选中行
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
          onClick={() => handleLineClick(index)} // 使用React的onClick事件
        >
          <div
            style={{ width: "50px", textAlign: "right", paddingRight: "10px" }}
          >
            {index + 1}
          </div>
          <div style={{ flex: 1 }}>
            <ReactMarkdown
              components={{ p: ({ node, ...props }) => <p {...props} /> }}
              rehypePlugins={[rehypeRaw]} // 添加 rehype-raw 插件
            >
              {line}
            </ReactMarkdown>{" "}
            {/* 使用react-markdown渲染 */}
          </div>
        </div>
      );
    });
  };

  useEffect(() => {
    const fetchFileContent = async () => {
      const response = await axios.get(`/api/file-corrections/${fileUuid}`);
      const lines = response.data.content.split("\n");
      setMarkdownLines(lines);
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
              backgroundColor: isEditing ? "#3f51b5" : "#f50057", // 自定义背景色
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
              value={markdownLines.join("\n")}
              onChange={(e) => setMarkdownLines(e.target.value.split("\n"))}
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
          markdownLines={markdownLines}
          selectedLines={selectedLines}
          setMarkdownLines={setMarkdownLines}
          sections={sections} // 传递sections状态
          setSections={setSections} // 传递setSections函数
        />
      </Grid>
    </Grid>
  );
};

export default FileCorrectionEditor;
