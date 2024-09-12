import React, { useState } from "react";
import { Button, TextField, Snackbar, Alert } from "@mui/material";

const ExamCuttingTool = ({
  exam,
  updateExam,
  isCuttingMode,
  markdownContent,
}) => {
  const [sectionName, setSectionName] = useState("");
  const [selectedLines, setSelectedLines] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const handleCut = () => {
    if (!sectionName || selectedLines.length === 0) {
      setErrorMessage("请填写大题名称并选择切割的行");
      return;
    }

    // 构建新的 sections 和 questions
    const newSection = {
      order: exam.sections.length + 1,
      name: sectionName,
      questions: selectedLines.map((line) => ({
        order: line + 1,
        extra: [line + 1],
        questionDetails: [],
      })),
    };

    updateExam((prevExam) => ({
      ...prevExam,
      sections: [...prevExam.sections, newSection],
    }));

    setSectionName("");
    setSelectedLines([]);
  };

  const handleLineClick = (lineIndex) => {
    if (isCuttingMode) {
      setSelectedLines((prev) =>
        prev.includes(lineIndex)
          ? prev.filter((line) => line !== lineIndex)
          : [...prev, lineIndex]
      );
    }
  };

  return (
    <div>
      <TextField
        label="大题名称"
        value={sectionName}
        onChange={(e) => setSectionName(e.target.value)}
      />
      <Button onClick={handleCut}>切割</Button>
      <Snackbar
        open={!!errorMessage}
        autoHideDuration={6000}
        onClose={() => setErrorMessage("")}
      >
        <Alert onClose={() => setErrorMessage("")} severity="error">
          {errorMessage}
        </Alert>
      </Snackbar>
      {/* 显示Markdown内容并允许选择行 */}
      <div>
        {markdownContent.split("\n").map((line, index) => (
          <div
            key={index}
            onClick={() => handleLineClick(index)}
            style={{
              backgroundColor: selectedLines.includes(index)
                ? "#d0e0ff"
                : "transparent",
              cursor: isCuttingMode ? "pointer" : "default",
              padding: "5px",
            }}
          >
            {line}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExamCuttingTool;
