import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Button, Grid, TextField } from "@mui/material";
import MarkdownViewer from "./MarkdownViewer";
import LineExtractor from "./LineExtractor";

const FileCorrectionEditor = ({ fileUuid }) => {
  const [markdownLines, setMarkdownLines] = useState([]);
  const [selectedContent, setSelectedContent] = useState("");
  const [questions, setQuestions] = useState([
    {
      material: "",
      questionDetails: [
        {
          questionContent: "",
          options: [],
          answer: "",
          explanation: "",
        },
      ],
    },
  ]);

  const [lineNumbers, setLineNumbers] = useState([]); // 添加行号状态
  const [selectedLineNumbers, setSelectedLineNumbers] = useState([]); // 添加选中的行号状态

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // 添加当前问题索引状态

  useEffect(() => {
    const fetchFileContent = async () => {
      const response = await axios.get(`/api/file-corrections/${fileUuid}`);
      const lines = response.data.content.split("\n");
      setMarkdownLines(lines);
      setLineNumbers(lines.map((_, index) => index + 1)); // 设置行号
    };
    fetchFileContent();
  }, [fileUuid]);

  const handleExtract = (content) => {
    setSelectedContent(content);
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    setQuestions(updatedQuestions);
  };

  const handleQuestionDetailChange = (qIndex, dIndex, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].questionDetails[dIndex][field] = value;
    setQuestions(updatedQuestions);
  };

  const addQuestionDetail = (qIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].questionDetails.push({
      questionContent: "",
      options: [],
      answer: "",
      explanation: "",
    });
    setQuestions(updatedQuestions);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        material: "",
        questionDetails: [
          {
            questionContent: "",
            options: [],
            answer: "",
            explanation: "",
          },
        ],
      },
    ]);
  };

  const handleSave = async () => {
    await axios.post("/api/questions", { questions });
    alert("保存成功");
  };

  const handleLineNumberClick = (lineNumber) => {
    setSelectedLineNumbers((prev) => {
      if (prev.includes(lineNumber)) {
        return prev.filter((num) => num !== lineNumber); // 取消选择
      }
      return [...prev, lineNumber]; // 添加选择
    });
  };

  const addToMaterial = () => {
    const selectedContent = selectedLineNumbers
      .map((num) => markdownLines[num - 1])
      .join("\n");
    handleQuestionChange(currentQuestionIndex, "material", selectedContent); // 使用当前选中的问题索引
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <Box
          display="flex"
          alignItems="center"
          style={{ marginBottom: "10px" }}
        >
          <Button onClick={addToMaterial} variant="contained" color="primary">
            加入到材料
          </Button>
        </Box>
        <Box display="flex">
          <Box width="50px" bgcolor="#f0f0f0" borderRight="1px solid #ccc">
            {lineNumbers.map((lineNumber) => (
              <div
                key={lineNumber}
                style={{
                  padding: "5px",
                  cursor: "pointer",
                  backgroundColor: selectedLineNumbers.includes(lineNumber)
                    ? "#d0e0ff"
                    : "transparent",
                }}
                onClick={() => handleLineNumberClick(lineNumber)}
              >
                {lineNumber}
              </div>
            ))}
          </Box>
          <TextField
            label="编辑Markdown"
            value={markdownLines.join("\n")}
            onChange={(e) => setMarkdownLines(e.target.value.split("\n"))}
            fullWidth
            multiline
            rows={10}
            margin="normal"
          />
        </Box>
      </Grid>
      <Grid item xs={6}>
        <Box>
          {questions.map((question, qIndex) => (
            <Box
              key={qIndex}
              mb={4}
              onClick={() => setCurrentQuestionIndex(qIndex)}
            >
              {" "}
              {/* 点击问题框选择当前问题 */}
              <TextField
                label="材料"
                value={question.material}
                onChange={(e) =>
                  handleQuestionChange(qIndex, "material", e.target.value)
                }
                fullWidth
                multiline
                rows={4}
                margin="normal"
                InputProps={{
                  readOnly: true, // 设置为只读
                }}
              />
              {question.questionDetails.map((detail, dIndex) => (
                <Box key={dIndex} mb={2}>
                  <TextField
                    label="题目内容"
                    value={detail.questionContent}
                    onChange={(e) =>
                      handleQuestionDetailChange(
                        qIndex,
                        dIndex,
                        "questionContent",
                        e.target.value
                      )
                    }
                    fullWidth
                    multiline
                    rows={2}
                    margin="normal"
                  />
                  <TextField
                    label="选项"
                    value={detail.options.join("\n")}
                    onChange={(e) =>
                      handleQuestionDetailChange(
                        qIndex,
                        dIndex,
                        "options",
                        e.target.value.split("\n")
                      )
                    }
                    fullWidth
                    multiline
                    rows={4}
                    margin="normal"
                  />
                  <TextField
                    label="答案"
                    value={detail.answer}
                    onChange={(e) =>
                      handleQuestionDetailChange(
                        qIndex,
                        dIndex,
                        "answer",
                        e.target.value
                      )
                    }
                    fullWidth
                    margin="normal"
                  />
                  <TextField
                    label="解析"
                    value={detail.explanation}
                    onChange={(e) =>
                      handleQuestionDetailChange(
                        qIndex,
                        dIndex,
                        "explanation",
                        e.target.value
                      )
                    }
                    fullWidth
                    multiline
                    rows={4}
                    margin="normal"
                  />
                  <Button onClick={() => addQuestionDetail(qIndex)}>
                    添加问题详情
                  </Button>
                </Box>
              ))}
            </Box>
          ))}
          <Button onClick={addQuestion}>添加新问题</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            保存
          </Button>
        </Box>
      </Grid>
    </Grid>
  );
};

export default FileCorrectionEditor;
