import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid"; // 添加这行来引入 uuid
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
  FormControlLabel,
  Radio,
  Checkbox,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import HardRating from "./HardRating";
import ImageUpload from "./ImageUpload";

const QuestionDetailEdit = ({
  questionDetail,
  onQuestionDetailChange,
  errors,
}) => {
  const UITypeDict = {
    single_selection: "单选",
    multi_selection: "多选",
    fill_blank: "填空",
  };

  const [localQuestionDetail, setLocalQuestionDetail] =
    useState(questionDetail);
  const [isLocalUpdate, setIsLocalUpdate] = useState(false);

  useEffect(() => {
    if (!isLocalUpdate) {
      setLocalQuestionDetail(questionDetail);
    }
    setIsLocalUpdate(false);
  }, [questionDetail]);

  useEffect(() => {
    if (isLocalUpdate) {
      onQuestionDetailChange(localQuestionDetail);
    }
  }, [localQuestionDetail, onQuestionDetailChange]);

  const handleChange = (field, value) => {
    setIsLocalUpdate(true);
    setLocalQuestionDetail((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleQuestionContentChange = (changeVal) => {
    setIsLocalUpdate(true);
    setLocalQuestionDetail((prev) => ({
      ...prev,
      questionContent: {
        ...prev.questionContent,
        ...changeVal,
      },
    }));
  };

  const handleRowChange = (index, field, value) => {
    let newRows = [...localQuestionDetail.rows];
    let newAnswer = [...localQuestionDetail.answer];

    if (field === "isAns") {
      const optionLetter = String.fromCharCode(65 + index);

      if (localQuestionDetail.uiType === "single_selection") {
        // 单选情况：取消其他所有选项，只选中当前选项
        newRows = newRows.map((row, i) => ({
          ...row,
          isAns: i === index ? value : false,
        }));
        newAnswer = value ? [optionLetter] : [];
      } else {
        // 多选情况：保持原有逻辑
        newRows[index] = { ...newRows[index], isAns: value };
        if (value) {
          if (!newAnswer.includes(optionLetter)) {
            newAnswer.push(optionLetter);
          }
        } else {
          newAnswer = newAnswer.filter((ans) => ans !== optionLetter);
        }
      }
    } else {
      newRows[index] = { ...newRows[index], [field]: value };
    }

    const updatedQuestionDetail = {
      ...localQuestionDetail,
      rows: newRows,
      answer: newAnswer,
    };

    setLocalQuestionDetail(updatedQuestionDetail);
    onQuestionDetailChange(updatedQuestionDetail);
  };

  const handleAddRow = () => {
    handleChange("rows", [
      ...localQuestionDetail.rows,
      { value: "", isAns: false, image: null },
    ]);
  };

  const handleDeleteRow = (index) => {
    handleChange(
      "rows",
      localQuestionDetail.rows.filter((_, i) => i !== index)
    );
  };

  const handleAnswerChange = (event) => {
    let newAnswer;
    let newRows;

    if (localQuestionDetail.uiType === "fill_blank") {
      newAnswer = [event.target.value];
      newRows = localQuestionDetail.rows;
    } else {
      newAnswer = Array.isArray(event.target.value)
        ? event.target.value
        : [event.target.value];
      newRows = localQuestionDetail.rows.map((row, index) => ({
        ...row,
        isAns: newAnswer.includes(String.fromCharCode(65 + index)),
      }));
    }

    const updatedQuestionDetail = {
      ...localQuestionDetail,
      answer: newAnswer,
      rows: newRows,
    };

    setLocalQuestionDetail(updatedQuestionDetail);
    onQuestionDetailChange(updatedQuestionDetail);
  };

  const handleUITypeChange = (event) => {
    const newUIType = event.target.value;
    const updatedQuestionDetail = {
      ...localQuestionDetail,
      uiType: newUIType,
      answer: [],
      rows: localQuestionDetail.rows.map((row) => ({ ...row, isAns: false })),
    };

    if (newUIType === "fill_blank") {
      updatedQuestionDetail.rows = [];
    }

    setLocalQuestionDetail(updatedQuestionDetail);
    onQuestionDetailChange(updatedQuestionDetail);
  };

  // 在组件顶部添加这行，为每个问题生成一个唯一的 UUID
  const questionUuid = React.useMemo(() => uuidv4(), []);

  return (
    <Box>
      <Typography variant="h6">
        问题 {questionDetail.order_in_question}
      </Typography>
      <TextField
        fullWidth
        label="问题内容"
        value={questionDetail.questionContent.value}
        onChange={(e) =>
          handleChange("questionContent", {
            ...questionDetail.questionContent,
            value: e.target.value,
          })
        }
        error={errors?.questionContent}
        helperText={errors?.questionContent ? "问题内容不能为空" : ""}
        margin="normal"
      />
      <ImageUpload
        cid={`${questionUuid}_${questionDetail.order_in_question}_q1`}
        imageData={localQuestionDetail.questionContent.image}
        onImageChange={(imageData) =>
          handleQuestionContentChange({ image: imageData })
        }
      />
      {localQuestionDetail.uiType !== "fill_blank" &&
        localQuestionDetail.rows.map((row, index) => (
          <Box key={index}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <FormControlLabel
                control={
                  localQuestionDetail.uiType === "single_selection" ? (
                    <Radio
                      checked={row.isAns}
                      onChange={(e) =>
                        handleRowChange(index, "isAns", e.target.checked)
                      }
                    />
                  ) : (
                    <Checkbox
                      checked={row.isAns}
                      onChange={(e) =>
                        handleRowChange(index, "isAns", e.target.checked)
                      }
                    />
                  )
                }
              />
              <TextField
                sx={{ flex: 1 }}
                label={`${String.fromCharCode(index + 65)}选项`}
                margin="dense"
                required
                value={row.value}
                error={errors && errors.rows && errors.rows[index]}
                helperText={
                  errors && errors.rows && errors.rows[index]
                    ? "选项不能为空"
                    : ""
                }
                onChange={(e) =>
                  handleRowChange(index, "value", e.target.value)
                }
              />
              <IconButton onClick={() => handleDeleteRow(index)}>
                <DeleteIcon />
              </IconButton>
            </div>
            <ImageUpload
              cid={`${questionUuid}_${questionDetail.order_in_question}_${index}`}
              imageData={row.image}
              onImageChange={(imageData) =>
                handleRowChange(index, "image", imageData)
              }
            />
          </Box>
        ))}
      <Button startIcon={<AddCircleIcon />} onClick={handleAddRow}>
        添加选项
      </Button>
      <Box sx={{ display: "flex", gap: 2, mt: 2, mb: 2 }}>
        <FormControl sx={{ flex: 1 }}>
          <InputLabel id="ui-type-select-label">显示类型</InputLabel>
          <Select
            labelId="ui-type-select-label"
            value={localQuestionDetail.uiType}
            label="显示类型"
            onChange={handleUITypeChange}
            required
          >
            {Object.entries(UITypeDict).map(([value, label]) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ flex: 1 }}>
          <HardRating
            onRateChange={(newRate) => handleChange("rate", newRate)}
            required
            error={errors && errors.rate}
            initialValue={localQuestionDetail.rate}
          />
        </FormControl>
      </Box>
      <Box sx={{ mt: 2, mb: 2 }}>
        <FormControl fullWidth required>
          {localQuestionDetail.uiType === "fill_blank" ? (
            <>
              <TextField
                label="答案"
                value={localQuestionDetail.answer[0] || ""}
                onChange={handleAnswerChange}
                fullWidth
                required
                variant="outlined"
                error={errors && errors.answer}
                helperText={errors && errors.answer ? "填空题答案不能为空" : ""}
              />
              <Box sx={{ mt: 2 }}>
                <ImageUpload
                  cid={`${questionUuid}_${questionDetail.order_in_question}_fill-blank-answer`}
                  imageData={localQuestionDetail.answerImage}
                  onImageChange={(imageData) =>
                    handleChange("answerImage", imageData)
                  }
                />
              </Box>
            </>
          ) : (
            <>
              <InputLabel id="answer-select-label">答案</InputLabel>
              <Select
                labelId="answer-select-label"
                label="答案"
                multiple={localQuestionDetail.uiType === "multi_selection"}
                value={localQuestionDetail.answer}
                required
                error={errors && errors.answer}
                onChange={handleAnswerChange}
                renderValue={(selected) => selected.join(", ")}
              >
                {localQuestionDetail.rows.map((_, index) => (
                  <MenuItem key={index} value={String.fromCharCode(65 + index)}>
                    {String.fromCharCode(65 + index)}
                  </MenuItem>
                ))}
              </Select>
            </>
          )}
        </FormControl>
      </Box>
      <Box>
        <TextField
          sx={{ width: "100%" }}
          label="题目解析"
          margin="normal"
          multiline
          rows={3}
          value={localQuestionDetail.explanation}
          onChange={(e) => handleChange("explanation", e.target.value)}
        />
      </Box>
    </Box>
  );
};

export default QuestionDetailEdit;
