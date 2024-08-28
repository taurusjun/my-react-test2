import React, { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import LoadingButton from "@mui/lab/LoadingButton";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputAdornment,
  InputLabel,
  MenuItem,
  Radio,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import HardRating from "./HardRating";
import ImageUpload from "./ImageUpload";

const QuestionDetailEdit = ({
  initialQuestionContent,
  initialRows,
  initialRate,
  initialExplanation,
  initialUIType,
  onQuestionDetailChange,
}) => {
  const [questionContent, setQuestionContent] = useState(
    initialQuestionContent
  );
  const [rows, setRows] = useState(initialRows);
  const [uiType, setUIType] = useState(initialUIType);
  const [rate, setRate] = useState(initialRate);
  const [explanation, setExplanation] = useState(initialExplanation);
  const [isExpanded, setIsExpanded] = useState(true);
  const [answer, setAnswer] = useState([]);

  useEffect(() => {
    onQuestionDetailChange({
      questionContent,
      rows,
      uiType,
      rate,
      explanation,
      answer,
    });
  }, [
    questionContent,
    rows,
    uiType,
    rate,
    explanation,
    answer,
    onQuestionDetailChange,
  ]);

  const handleQuestionChange = (changeVal) => {
    setQuestionContent((prev) => {
      const newQuestionContent = { ...prev, ...changeVal };
      return newQuestionContent;
    });
  };

  const handleChange = (index, value) => {
    setRows((prev) => {
      const updatedRows = [...prev];
      updatedRows[index].value = value;
      return updatedRows;
    });
  };

  const handleAnsChange = (index, checked) => {
    setRows((prev) => {
      let updatedRows;
      if (uiType === "single_selection") {
        updatedRows = prev.map((item, i) => ({
          ...item,
          isAns: i === index ? checked : false,
        }));
      } else {
        updatedRows = [...prev];
        updatedRows[index].isAns = checked;
      }
      return updatedRows;
    });
  };

  const handleSelectChange = (type, value) => {
    if (type === "ui-type") {
      setUIType(value);
      setRows((prev) => {
        const updatedRows = prev.map((item) => ({ ...item, isAns: false }));
        return updatedRows;
      });
    }
  };

  const handleImageChange = (index, imageData) => {
    setRows((prev) => {
      const updatedRows = [...prev];
      updatedRows[index].image = imageData;
      return updatedRows;
    });
  };

  // 新增函数处理难度评级变化
  const handleRateChange = (newRate) => {
    setRate(newRate);
  };

  // 新增函数处理解释文本变化
  const handleExplanationChange = (newExplanation) => {
    setExplanation(newExplanation);
  };

  const UITypeDict = { single_selection: "单选", multi_selection: "多选" };

  const handleAddRow = (index) => {
    const newRow = {
      value: "",
    };
    const updatedRows = [
      ...rows.slice(0, index + 1),
      newRow,
      ...rows.slice(index + 1),
    ];
    setRows(updatedRows);
  };

  const handleDeleteRow = (index) => {
    if (rows.length > 1) {
      let updatedRows = [...rows.filter((_, i) => i !== index)];
      if (index === 1) {
        updatedRows = updatedRows.map((row, i) => ({
          value: row.value,
          isAns: row.isAns,
        }));
      }
      setRows(updatedRows);
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleAnswerChange = (event) => {
    const selectedAnswers = Array.isArray(event.target.value)
      ? event.target.value
      : [event.target.value];
    setAnswer(selectedAnswers);

    // 更新rows的isAns属性
    const newRows = rows.map((row, index) => ({
      ...row,
      isAns: selectedAnswers.includes(String.fromCharCode(65 + index)),
    }));
    setRows(newRows);
  };

  const handleRowChange = (index, field, value) => {
    let newRows = [...rows];
    if (field === "isAns") {
      if (uiType === "single_selection") {
        // 单选：只允许一个选项被选中
        newRows = newRows.map((row, idx) => ({
          ...row,
          isAns: idx === index ? value : false,
        }));
      } else {
        // 多选：直接更新当前行
        newRows[index].isAns = value;
      }
    } else {
      // 处理其他字段的变化
      newRows[index][field] = value;
    }
    setRows(newRows);

    // 更新答案
    const newAnswer = newRows
      .map((row, idx) => (row.isAns ? String.fromCharCode(65 + idx) : null))
      .filter(Boolean);
    setAnswer(newAnswer);
  };

  const handleUITypeChange = (event) => {
    const newUIType = event.target.value;
    setUIType(newUIType);

    // 清除答案
    setAnswer([]);

    // 重置所有行的isAns属性
    setRows(rows.map((row) => ({ ...row, isAns: false })));
  };

  return (
    <>
      <Box
        flex={8}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack>
          <Button onClick={toggleExpand}>
            {isExpanded ? "收起详情" : "展���详情"}
          </Button>
          {isExpanded && (
            <Box component="form" noValidate autoComplete="off">
              <Box>
                <div>
                  <TextField
                    sx={{ width: 1000 }}
                    label="在此输入题干"
                    id="outlined-start-adornment"
                    margin="normal"
                    multiline
                    rows={4}
                    value={questionContent.value}
                    onChange={(e) =>
                      handleQuestionChange({ value: e.target.value })
                    }
                  />
                  <ImageUpload
                    cid={"q1"}
                    imageData={questionContent.image}
                    onImageChange={(imageData) =>
                      handleQuestionChange({ image: imageData })
                    }
                  />
                </div>
              </Box>
              {rows.map((row, index) => (
                <Box key={index}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <FormControlLabel
                        control={
                          uiType == "single_selection" ? (
                            <Radio
                              checked={row.isAns}
                              onChange={(e) =>
                                handleRowChange(
                                  index,
                                  "isAns",
                                  e.target.checked
                                )
                              }
                            />
                          ) : (
                            <Checkbox
                              checked={row.isAns}
                              onChange={(e) =>
                                handleRowChange(
                                  index,
                                  "isAns",
                                  e.target.checked
                                )
                              }
                            />
                          )
                        }
                      />

                      <TextField
                        sx={{ width: 800 }}
                        label={`${String.fromCharCode(index + 65)}选项`}
                        margin="dense"
                        value={row.value}
                        error={row.value === ""}
                        onChange={(e) => handleChange(index, e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              {String.fromCharCode(index + 65)}:
                            </InputAdornment>
                          ),
                        }}
                      />
                      <>
                        <IconButton
                          aria-label="delete"
                          onClick={() => handleDeleteRow(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                        <IconButton
                          aria-label="add"
                          onClick={() => handleAddRow(index)}
                        >
                          <AddCircleIcon />
                        </IconButton>
                      </>
                    </div>
                    <ImageUpload
                      cid={index}
                      imageData={row.image}
                      onImageChange={(imageData) =>
                        handleImageChange(index, imageData)
                      }
                    />
                  </div>
                </Box>
              ))}
              <Box sx={{ display: "flex", gap: 1, ml: 2, mr: 2, mt: 2, mb: 2 }}>
                <FormControl sx={{ flex: 1 }}>
                  <InputLabel id="ui-type-select-label">显示类型</InputLabel>
                  <Select
                    labelId="ui-type-select-label"
                    id="ui-type-select"
                    value={uiType}
                    label="显示类型"
                    onChange={handleUITypeChange}
                    sx={{ height: "40px" }} // 添加这一行来调整高度
                  >
                    <MenuItem value="single_selection">单选</MenuItem>
                    <MenuItem value="multi_selection">多选</MenuItem>
                  </Select>
                </FormControl>
                <FormControl>
                  <HardRating onRateChange={handleRateChange} />
                </FormControl>
              </Box>
              <Box sx={{ mt: 2, mb: 2 }}>
                <FormControl fullWidth>
                  <InputLabel id="answer-select-label">答案</InputLabel>
                  <Select
                    labelId="answer-select-label"
                    id="answer-select"
                    multiple={uiType === "multi_selection"}
                    value={answer}
                    onChange={handleAnswerChange}
                    renderValue={(selected) =>
                      Array.isArray(selected) ? selected.join(", ") : selected
                    }
                  >
                    {rows.map((row, index) => (
                      <MenuItem
                        key={index}
                        value={String.fromCharCode(65 + index)}
                      >
                        {String.fromCharCode(65 + index)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box>
                <div>
                  <TextField
                    sx={{ width: 1000 }}
                    label="题目解析"
                    id="outlined-start-adornment"
                    margin="normal"
                    multiline
                    rows={3}
                    value={explanation}
                    onChange={(e) => handleExplanationChange(e.target.value)}
                  />
                </div>
              </Box>
            </Box>
          )}
        </Stack>
      </Box>
    </>
  );
};

export default QuestionDetailEdit;
