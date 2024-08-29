import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    setLocalQuestionDetail(questionDetail);
  }, [questionDetail]);

  useEffect(() => {
    onQuestionDetailChange(localQuestionDetail);
  }, [localQuestionDetail]);

  const handleChange = (field, value) => {
    setLocalQuestionDetail((prev) => ({ ...prev, [field]: value }));
  };

  const handleQuestionContentChange = (changeVal) => {
    handleChange("questionContent", {
      ...localQuestionDetail.questionContent,
      ...changeVal,
    });
  };

  const handleRowChange = (index, field, value) => {
    const newRows = [...localQuestionDetail.rows];
    newRows[index] = { ...newRows[index], [field]: value };
    handleChange("rows", newRows);
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
    if (localQuestionDetail.uiType === "fill_blank") {
      handleChange("answer", [event.target.value]);
    } else {
      const selectedAnswers = Array.isArray(event.target.value)
        ? event.target.value
        : [event.target.value];
      handleChange("answer", selectedAnswers);

      const newRows = localQuestionDetail.rows.map((row, index) => ({
        ...row,
        isAns: selectedAnswers.includes(String.fromCharCode(65 + index)),
      }));
      handleChange("rows", newRows);
    }
  };

  const handleUITypeChange = (event) => {
    const newUIType = event.target.value;
    handleChange("uiType", newUIType);
    handleChange("answer", []);
    handleChange(
      "rows",
      localQuestionDetail.rows.map((row) => ({ ...row, isAns: false }))
    );
  };

  return (
    <Box component="form" noValidate autoComplete="off">
      <Box>
        <TextField
          sx={{ width: "100%" }}
          label="在此输入题干"
          margin="normal"
          multiline
          required
          rows={4}
          value={localQuestionDetail.questionContent.value}
          onChange={(e) =>
            handleQuestionContentChange({ value: e.target.value })
          }
          error={errors && errors.questionContent}
          helperText={
            errors && errors.questionContent ? "题目内容不能为空" : ""
          }
        />
        <ImageUpload
          cid={"q1"}
          imageData={localQuestionDetail.questionContent.image}
          onImageChange={(imageData) =>
            handleQuestionContentChange({ image: imageData })
          }
        />
      </Box>
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
              cid={index}
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
                  cid="fill-blank-answer"
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
