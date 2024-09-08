import React, { useState, useRef } from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  Paper,
  Radio,
  Checkbox,
  FormControlLabel,
  RadioGroup,
  FormGroup,
  InputAdornment,
  IconButton,
  Grid,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";

const LearningMaterial = ({
  material,
  currentSection,
  currentQuestion,
  onNext,
  onPrevious,
  onSubmitAnswer,
}) => {
  const [answer, setAnswer] = useState("");
  const [multiAnswer, setMultiAnswer] = useState([]);
  const [imageAnswer, setImageAnswer] = useState("");
  const fileInputRef = useRef(null);

  const handleAnswerChange = (newAnswer) => {
    if (currentQuestion.uiType === "multi_selection") {
      setMultiAnswer(newAnswer);
    } else {
      setAnswer(newAnswer);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageAnswer(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteImage = () => {
    setImageAnswer("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = () => {
    const submittedAnswer =
      currentQuestion.uiType === "multi_selection" ? multiAnswer : answer;
    onSubmitAnswer(submittedAnswer, imageAnswer);
    setAnswer("");
    setMultiAnswer([]);
    setImageAnswer("");
  };

  const renderQuestionOptions = () => {
    const { uiType, rows } = currentQuestion;

    switch (uiType) {
      case "fill_in_blank":
      case "calculation":
        return (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              variant="standard"
              value={answer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="在此输入您的答案"
              InputProps={{
                disableUnderline: true,
                startAdornment: (
                  <InputAdornment position="start">答：</InputAdornment>
                ),
              }}
              sx={{
                "& .MuiInputBase-root": {
                  borderBottom: "1px solid #000",
                  paddingBottom: "4px",
                },
                "& .MuiInputBase-input": {
                  padding: "0 0 4px",
                },
              }}
            />
            {uiType === "calculation" && (
              <Box sx={{ mt: 2, display: "flex", alignItems: "center" }}>
                <input
                  accept="image/*"
                  style={{ display: "none" }}
                  id="upload-image"
                  type="file"
                  onChange={handleImageUpload}
                  ref={fileInputRef}
                />
                <label htmlFor="upload-image">
                  <Button
                    variant="contained"
                    component="span"
                    startIcon={<CloudUploadIcon />}
                  >
                    上传解题图片
                  </Button>
                </label>
                {imageAnswer && (
                  <Box sx={{ ml: 2, display: "flex", alignItems: "center" }}>
                    <img
                      src={imageAnswer}
                      alt="解题图片"
                      style={{
                        maxWidth: "100px",
                        maxHeight: "100px",
                        objectFit: "cover",
                      }}
                    />
                    <IconButton onClick={handleDeleteImage} sx={{ ml: 1 }}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        );
      case "single_selection":
        return (
          <RadioGroup
            value={answer}
            onChange={(e) => handleAnswerChange(e.target.value)}
          >
            {rows.map((row, index) => (
              <FormControlLabel
                key={index}
                value={String.fromCharCode(65 + index)}
                control={<Radio />}
                label={`${String.fromCharCode(65 + index)}. ${row.value}`}
              />
            ))}
          </RadioGroup>
        );
      case "multi_selection":
        return (
          <FormGroup>
            {rows.map((row, index) => (
              <FormControlLabel
                key={index}
                control={
                  <Checkbox
                    checked={multiAnswer.includes(
                      String.fromCharCode(65 + index)
                    )}
                    onChange={(e) => {
                      const value = String.fromCharCode(65 + index);
                      const newAnswer = e.target.checked
                        ? [...multiAnswer, value]
                        : multiAnswer.filter((item) => item !== value);
                      handleAnswerChange(newAnswer);
                    }}
                  />
                }
                label={`${String.fromCharCode(65 + index)}. ${row.value}`}
              />
            ))}
          </FormGroup>
        );
      default:
        return null;
    }
  };

  if (!material || !currentQuestion) return null;

  return (
    <Box>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          {`第${material.sections[currentSection].order_in_material}部分 ${material.sections[currentSection].name}`}
        </Typography>
        <Box sx={{ mt: 3, mb: 2 }}>
          {currentQuestion.material && (
            <Typography
              variant="body1"
              sx={{
                fontStyle: "italic",
                mb: 1,
                fontSize: "1.1rem",
              }}
            >
              {currentQuestion.material}
            </Typography>
          )}
          <Typography variant="body1">
            <strong>
              {`${material.sections[currentSection].order_in_material}.${currentQuestion.order_in_section}`}
            </strong>
            {currentQuestion.questionContent.value}
            <span style={{ marginLeft: "8px", color: "gray" }}>
              ({currentQuestion.score} 分)
            </span>
          </Typography>
          {currentQuestion.questionContent.image && (
            <img
              src={currentQuestion.questionContent.image}
              alt="问题图片"
              style={{ maxWidth: "100%", marginTop: "8px" }}
            />
          )}
          {renderQuestionOptions()}
        </Box>
      </Paper>
      <Box sx={{ display: "flex", mt: 2 }}>
        <Button variant="contained" onClick={onPrevious} sx={{ mr: 2 }}>
          上一题
        </Button>
        <Button variant="contained" onClick={handleSubmit} sx={{ mr: 2 }}>
          提交答案
        </Button>
        <Button variant="contained" onClick={onNext}>
          下一题
        </Button>
      </Box>
    </Box>
  );
};

export default LearningMaterial;
