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
  initialAnswer,
  initialAnswerImage,
  onQuestionDetailChange,
}) => {
  const UITypeDict = {
    single_selection: "单选",
    multi_selection: "多选",
    fill_blank: "填空",
  };

  const [questionContent, setQuestionContent] = useState(
    initialQuestionContent
  );
  const [rows, setRows] = useState(() => {
    if (
      initialAnswer &&
      (initialUIType === "single_selection" ||
        initialUIType === "multi_selection")
    ) {
      return initialRows.map((row, index) => ({
        ...row,
        isAns: initialAnswer.includes(String.fromCharCode(65 + index)),
      }));
    }
    return initialRows;
  });
  const [uiType, setUIType] = useState(initialUIType || "single_selection");
  const [rate, setRate] = useState(initialRate);
  const [explanation, setExplanation] = useState(initialExplanation);
  const [isExpanded, setIsExpanded] = useState(true);
  const [answer, setAnswer] = useState(() => {
    if (
      initialAnswer &&
      (initialUIType === "single_selection" ||
        initialUIType === "multi_selection")
    ) {
      return Array.isArray(initialAnswer) ? initialAnswer : [initialAnswer];
    }
    return initialAnswer || "";
  });
  const [fillBlankAnswer, setFillBlankAnswer] = useState("");
  const [answerImage, setAnswerImage] = useState(initialAnswerImage || null);

  useEffect(() => {
    onQuestionDetailChange({
      questionContent,
      rows,
      uiType,
      rate,
      explanation,
      answer,
      answerImage,
    });
  }, [questionContent, rows, uiType, rate, explanation, answer, answerImage]);

  useEffect(() => {
    if (
      initialAnswer &&
      (uiType === "single_selection" || uiType === "multi_selection")
    ) {
      const newRows = rows.map((row, index) => ({
        ...row,
        isAns: initialAnswer.includes(String.fromCharCode(65 + index)),
      }));
      setRows(newRows);
      setAnswer(Array.isArray(initialAnswer) ? initialAnswer : [initialAnswer]);
    }
  }, [initialAnswer]);

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

  const handleRateChange = (newRate) => {
    setRate(newRate);
  };

  const handleExplanationChange = (newExplanation) => {
    setExplanation(newExplanation);
  };

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
    if (uiType === "fill_blank") {
      setFillBlankAnswer(event.target.value);
      setAnswer(event.target.value);
    } else {
      const selectedAnswers = Array.isArray(event.target.value)
        ? event.target.value
        : [event.target.value];
      setAnswer(selectedAnswers);

      const newRows = rows.map((row, index) => ({
        ...row,
        isAns: selectedAnswers.includes(String.fromCharCode(65 + index)),
      }));
      setRows(newRows);
    }
  };

  const handleRowChange = (index, field, value) => {
    let newRows = [...rows];
    if (field === "isAns") {
      if (uiType === "single_selection") {
        newRows = newRows.map((row, idx) => ({
          ...row,
          isAns: idx === index ? value : false,
        }));
      } else {
        newRows[index].isAns = value;
      }
    } else {
      newRows[index][field] = value;
    }
    setRows(newRows);

    const newAnswer = newRows
      .map((row, idx) => (row.isAns ? String.fromCharCode(65 + idx) : null))
      .filter(Boolean);
    setAnswer(newAnswer);
  };

  const handleUITypeChange = (event) => {
    const newUIType = event.target.value;
    setUIType(newUIType);

    setAnswer([]);

    setRows(rows.map((row) => ({ ...row, isAns: false })));
  };

  const handleAnswerImageChange = (imageData) => {
    setAnswerImage(imageData);
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
            {isExpanded ? "收起详情" : "展开详情"}
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
              {uiType !== "fill_blank" &&
                rows.map((row, index) => (
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
                    sx={{ height: "40px" }}
                  >
                    {Object.entries(UITypeDict).map(([value, label]) => (
                      <MenuItem key={value} value={value}>
                        {label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <HardRating onRateChange={handleRateChange} />
                </FormControl>
              </Box>
              <Box sx={{ mt: 2, mb: 2 }}>
                <FormControl fullWidth required>
                  {uiType === "fill_blank" ? (
                    <>
                      <TextField
                        label="答案"
                        value={answer}
                        onChange={handleAnswerChange}
                        fullWidth
                        required
                        variant="outlined"
                      />
                      <Box sx={{ mt: 2 }}>
                        <ImageUpload
                          cid="fill-blank-answer"
                          imageData={answerImage}
                          onImageChange={handleAnswerImageChange}
                        />
                      </Box>
                    </>
                  ) : (
                    <>
                      <InputLabel id="answer-select-label">答案</InputLabel>
                      <Select
                        labelId="answer-select-label"
                        label="答案"
                        id="answer-select"
                        multiple={uiType === "multi_selection"}
                        value={answer}
                        onChange={handleAnswerChange}
                        renderValue={(selected) =>
                          Array.isArray(selected)
                            ? selected.join(", ")
                            : selected
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
                    </>
                  )}
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
