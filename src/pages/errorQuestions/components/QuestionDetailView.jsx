import React, { useEffect, useState } from "react";
import { Typography, RadioGroup, FormControlLabel } from "@mui/material";
import Radio from "@mui/material/Radio";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import {
  Box,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  FormGroup,
  Checkbox,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import { useRef } from "react";

const QuestionDetailView = ({ questionDetail, onAnswerChange, header }) => {
  const [answers, setAnswers] = useState({});
  const fileInputRefs = useRef({});

  useEffect(() => {
    onAnswerChange(answers);
    console.log(answers);
  }, [answers]);

  const handleAnswerChange = (detailUuid, newContent) => {
    setAnswers((prevAnswers) => {
      const currentAnswer = prevAnswers[detailUuid] || {
        content: [],
        images: [],
      };
      return {
        ...prevAnswers,
        [detailUuid]: {
          ...currentAnswer,
          content: newContent,
        },
      };
    });
  };

  const handleMultipleChoiceChange = (detailUuid, choice) => {
    setAnswers((prevAnswers) => {
      const currentAnswer = prevAnswers[detailUuid] || {
        content: [],
        images: [],
      };
      const newContent = currentAnswer.content.includes(choice)
        ? currentAnswer.content.filter((item) => item !== choice)
        : [...currentAnswer.content, choice];

      newContent.sort();

      return {
        ...prevAnswers,
        [detailUuid]: {
          ...currentAnswer,
          content: newContent,
        },
      };
    });
  };

  const handleImageUpload = (event, detailUuid) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageDataUrl = reader.result;
        setAnswers((prevAnswers) => {
          const currentAnswer = prevAnswers[detailUuid] || {
            content: "",
            images: [],
          };
          return {
            ...prevAnswers,
            [detailUuid]: {
              ...currentAnswer,
              images: [...currentAnswer.images, imageDataUrl],
            },
          };
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteImage = (detailUuid, imageIndex) => {
    setAnswers((prevAnswers) => {
      const currentAnswer = prevAnswers[detailUuid] || {
        content: "",
        images: [],
      };
      return {
        ...prevAnswers,
        [detailUuid]: {
          ...currentAnswer,
          images: currentAnswer.images.filter(
            (_, index) => index !== imageIndex
          ),
        },
      };
    });
    // 重置文件输入
    if (fileInputRefs.current[`${detailUuid}`]) {
      fileInputRefs.current[`${detailUuid}`].value = "";
    }
  };

  // 渲染问题详情答案区域
  const renderQuestionDetailAnswerArea = (detail) => {
    const isMultipleChoice = detail.uiType === "multi_selection";
    const isSingleChoice = detail.uiType === "single_selection";
    const isFillInBlank = detail.uiType === "fill_blank";
    const isCalculation = detail.uiType === "calculation";
    const isShortAnswer = detail.uiType === "short_answer";
    const currentAnswer = answers[detail.uuid] || { content: [], images: [] };

    if (isMultipleChoice) {
      return (
        <FormGroup>
          {detail.rows.map((row, rowIndex) => (
            <FormControlLabel
              key={rowIndex}
              control={
                <Checkbox
                  checked={currentAnswer.content.includes(
                    String.fromCharCode(65 + rowIndex)
                  )}
                  onChange={() =>
                    handleMultipleChoiceChange(
                      detail.uuid,
                      String.fromCharCode(65 + rowIndex)
                    )
                  }
                />
              }
              label={`${String.fromCharCode(65 + rowIndex)}. ${row.value}`}
            />
          ))}
        </FormGroup>
      );
    } else if (isSingleChoice) {
      return (
        <RadioGroup
          value={currentAnswer.content[0] || ""}
          onChange={(e) => handleAnswerChange(detail.uuid, [e.target.value])}
        >
          {detail.rows.map((row, rowIndex) => (
            <FormControlLabel
              key={rowIndex}
              value={String.fromCharCode(65 + rowIndex)}
              control={<Radio />}
              label={`${String.fromCharCode(65 + rowIndex)}. ${row.value}`}
            />
          ))}
        </RadioGroup>
      );
    } else if (isFillInBlank) {
      return (
        <TextField
          fullWidth
          variant="outlined"
          value={currentAnswer.content[0] || ""}
          onChange={(e) => handleAnswerChange(detail.uuid, [e.target.value])}
          placeholder="在此输入您的答案"
        />
      );
    } else if (isCalculation) {
      return (
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={currentAnswer.content[0] || ""}
            onChange={(e) => handleAnswerChange(detail.uuid, [e.target.value])}
            placeholder="在此输入您的计算过程和答案"
          />
          <Box sx={{ mt: 2, display: "flex", alignItems: "center" }}>
            <input
              accept="image/*"
              style={{ display: "none" }}
              id={`upload-image-${detail.uuid}`}
              type="file"
              onChange={(e) => handleImageUpload(e, detail.uuid)}
              ref={(el) => (fileInputRefs.current[`${detail.uuid}`] = el)}
            />
            <label htmlFor={`upload-image-${detail.uuid}`}>
              <Button
                variant="contained"
                component="span"
                startIcon={<CloudUploadIcon />}
              >
                上传解题图片
              </Button>
            </label>
            {currentAnswer.images.map((image, index) => (
              <Box
                key={index}
                sx={{ ml: 2, display: "flex", alignItems: "center" }}
              >
                <img
                  src={image}
                  alt={`解题图片 ${index + 1}`}
                  style={{
                    maxWidth: "100px",
                    maxHeight: "100px",
                    objectFit: "cover",
                  }}
                />
                <IconButton
                  onClick={() => handleDeleteImage(detail.uuid, index)}
                  sx={{ ml: 1 }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
          </Box>
        </Box>
      );
    } else if (isShortAnswer) {
      return (
        <TextField
          fullWidth
          variant="outlined"
          value={currentAnswer.content[0] || ""}
          onChange={(e) => handleAnswerChange(detail.uuid, [e.target.value])}
          placeholder="在此输入您的简答"
          sx={{ mt: 2 }}
        />
      );
    }
  };

  return (
    <>
      <Typography variant="h5" gutterBottom sx={{ color: "#1976d2" }}>
        {header}
      </Typography>
      {questionDetail.material ? (
        <Typography
          variant="body1"
          paragraph
          sx={{ backgroundColor: "#f5f5f5", p: 2, borderRadius: 1 }}
        >
          <ReactMarkdown rehypePlugins={[rehypeRaw]}>
            {questionDetail.material}
          </ReactMarkdown>
        </Typography>
      ) : null}
      <Typography variant="body1" paragraph sx={{ fontWeight: "bold", mb: 2 }}>
        {questionDetail.content.value}
      </Typography>
      {questionDetail.content.images &&
        questionDetail.content.images.length > 0 &&
        questionDetail.content.images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`问题图片 ${index + 1}`}
            style={{
              width: "150px",
              height: "auto",
              marginTop: "8px",
            }}
          />
        ))}
      {/* <RadioGroup value={userAnswer} onChange={onAnswerChange}>
        {questionDetail.options.map((option, index) => (
          <FormControlLabel
            key={index}
            value={option}
            control={<Radio color="primary" />}
            label={
              <Typography sx={{ fontSize: "1.1rem" }}>{option}</Typography>
            }
            sx={{ mb: 1 }}
          />
        ))}
      </RadioGroup> */}
      {renderQuestionDetailAnswerArea(questionDetail)}
    </>
  );
};

export default QuestionDetailView;
