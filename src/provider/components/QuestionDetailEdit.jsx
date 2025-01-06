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
import { QUESTION_UI_TYPES } from "../../common/constants";
import OptionList from "./OptionList"; // 引入新组件
import AnswerInput from "./AnswerInput"; // 引入新组件

const QuestionDetailEdit = ({
  questionDetail,
  onQuestionDetailChange,
  errors,
}) => {
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
        ? event.target.value.sort() // 对多选答案进行排序
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
      <OptionList
        rows={localQuestionDetail.rows}
        uiType={localQuestionDetail.uiType}
        handleRowChange={handleRowChange}
        handleDeleteRow={handleDeleteRow}
        errors={errors}
        questionUuid={questionUuid}
        questionOrder={questionDetail.order_in_question}
      />
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
            {Object.entries(QUESTION_UI_TYPES).map(([value, label]) => (
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
          <AnswerInput
            uiType={localQuestionDetail.uiType}
            answer={localQuestionDetail.answer}
            onChange={handleAnswerChange}
            errors={errors}
            questionUuid={questionUuid}
            questionOrder={questionDetail.order_in_question}
            rows={localQuestionDetail.rows}
          />
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
