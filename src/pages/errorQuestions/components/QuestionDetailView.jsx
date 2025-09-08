import { useEffect, useState, useRef } from "react";
import { Typography, RadioGroup, FormControlLabel } from "@mui/material";
import Radio from "@mui/material/Radio";
import { MarkdownRenderer } from "../../../components/markdown";
import {
  Box,
  TextField,
  Button,
  IconButton,
  FormGroup,
  Checkbox,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";

const QuestionDetailView = ({ questionDetail, onAnswerChange, header }) => {
  const [answers, setAnswers] = useState({});
  const fileInputRefs = useRef({});

  useEffect(() => {
    onAnswerChange(answers);
    // console.log(answers);
  }, [answers, onAnswerChange]);

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
    const isJudgment = detail.uiType === "judgment";
    const currentAnswer = answers[detail.uuid] || { content: [], images: [] };

    if (isMultipleChoice) {
      // 确保options存在且是数组
      const options = detail.options || [];
      return (
        <FormGroup>
          {options.map((option, rowIndex) => {
            // 处理新的选项格式，如"A. `data.value = 3.14`"
            // 从选项字符串中提取标识符（"A"、"B"等）和值
            const match = typeof option === 'string' && option.match(/^([A-Z])\.\s*(.+)$/);
            const identifier = match ? match[1] : String.fromCharCode(65 + rowIndex);
            const value = match ? match[2] : (option.value || option);
            
            return (
              <FormControlLabel
                key={rowIndex}
                control={
                  <Checkbox
                    checked={currentAnswer.content.includes(identifier)}
                    onChange={() => handleMultipleChoiceChange(detail.uuid, identifier)}
                  />
                }
                label={
                  <MarkdownRenderer 
                    content={`${identifier}. ${value}`}
                    options={{ inline: true, fontSize: '0.875rem' }}
                  />
                }
              />
            );
          })}
        </FormGroup>
      );
    } else if (isSingleChoice) {
      // 确保options存在且是数组
      const options = detail.options || [];
      return (
        <RadioGroup
          value={currentAnswer.content[0] || ""}
          onChange={(e) => handleAnswerChange(detail.uuid, [e.target.value])}
        >
          {options.map((option, rowIndex) => {
            // 处理新的选项格式，如"A. `data.value = 3.14`"
            const match = typeof option === 'string' && option.match(/^([A-Z])\.\s*(.+)$/);
            const identifier = match ? match[1] : String.fromCharCode(65 + rowIndex);
            const value = match ? match[2] : (option.value || option);
            
            return (
              <FormControlLabel
                key={rowIndex}
                value={identifier}
                control={<Radio />}
                label={
                  <MarkdownRenderer 
                    content={`${identifier}. ${value}`}
                    options={{ inline: true, fontSize: '0.875rem' }}
                  />
                }
              />
            );
          })}
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
    } else if (isJudgment) {
      return (
        <RadioGroup
          value={currentAnswer.content[0] || ""}
          onChange={(e) => handleAnswerChange(detail.uuid, [e.target.value])}
        >
          <FormControlLabel
            value="true"
            control={<Radio />}
            label="正确"
          />
          <FormControlLabel
            value="false"
            control={<Radio />}
            label="错误"
          />
        </RadioGroup>
      );
    }
  };

  return (
    <>
      <Typography variant="h5" gutterBottom sx={{ color: "#1976d2" }}>
        {header}
      </Typography>
      {questionDetail.material ? (
        <Box sx={{ backgroundColor: "#f5f5f5", p: 2, borderRadius: 1, mb: 2 }}>
          <MarkdownRenderer content={questionDetail.material} />
        </Box>
      ) : null}
      <Box sx={{ fontWeight: "bold", mb: 2 }}>
        <MarkdownRenderer content={questionDetail.content.value} />
      </Box>
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
      {renderQuestionDetailAnswerArea(questionDetail)}
    </>
  );
};

export default QuestionDetailView;
