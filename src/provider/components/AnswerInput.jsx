import React from "react";
import { TextField, InputLabel, Select, MenuItem, Box } from "@mui/material";
import ImageUpload from "./ImageUpload";

const AnswerInput = ({
  uiType,
  answer,
  onChange,
  errors,
  questionUuid,
  questionOrder,
  rows,
}) => {
  switch (uiType) {
    case "fill_blank":
      return (
        <>
          <TextField
            label="答案"
            value={answer[0] || ""}
            onChange={onChange}
            fullWidth
            required
            variant="outlined"
            error={errors && errors.answer}
            helperText={errors && errors.answer ? "填空题答案不能为空" : ""}
          />
          <Box sx={{ mt: 2 }}>
            <ImageUpload
              cid={`${questionUuid}_${questionOrder}_fill-blank-answer`}
              onImageChange={(imageData) => onChange("answerImage", imageData)}
            />
          </Box>
        </>
      );
    case "short_answer":
      return (
        <TextField
          label="简答题答案"
          value={answer[0] || ""}
          onChange={onChange}
          fullWidth
          required
          variant="outlined"
          error={errors && errors.answer}
          helperText={errors && errors.answer ? "简答题答案不能为空" : ""}
        />
      );
    case "calculation":
      return (
        <TextField
          label="计算题答案"
          value={answer[0] || ""}
          onChange={onChange}
          fullWidth
          required
          variant="outlined"
          error={errors && errors.answer}
          helperText={errors && errors.answer ? "计算题答案不能为空" : ""}
        />
      );
    case "essay":
      return (
        <TextField
          label="作文题答案"
          value={answer[0] || ""}
          onChange={onChange}
          fullWidth
          required
          variant="outlined"
          error={errors && errors.answer}
          helperText={errors && errors.answer ? "作文题答案不能为空" : ""}
          multiline
          rows={4}
        />
      );
    default:
      return (
        <>
          <InputLabel id="answer-select-label">答案</InputLabel>
          <Select
            labelId="answer-select-label"
            label="答案"
            multiple={uiType === "multi_selection"}
            value={answer}
            required
            error={errors && errors.answer}
            onChange={onChange}
            renderValue={(selected) => selected.sort().join(", ")}
          >
            {rows.map((_, index) => (
              <MenuItem key={index} value={String.fromCharCode(65 + index)}>
                {String.fromCharCode(65 + index)}
              </MenuItem>
            ))}
          </Select>
        </>
      );
  }
};

export default AnswerInput;
