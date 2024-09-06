import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Typography,
  Box,
  CircularProgress,
  Paper,
  Button,
  Grid,
  Radio,
  Checkbox,
  FormControlLabel,
  RadioGroup,
  FormGroup,
  AppBar,
  Toolbar,
} from "@mui/material";

const ExamPaper = () => {
  const { uuid } = useParams();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [currentDetail, setCurrentDetail] = useState(0);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const response = await axios.get(`/api/examview/${uuid}`);
        setExam(response.data);
        initializeAnswers(response.data);
      } catch (error) {
        console.error("获取考试数据失败", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [uuid]);

  const initializeAnswers = (examData) => {
    const initialAnswers = {};
    examData.sections.forEach((section) => {
      section.questions.forEach((question) => {
        initialAnswers[question.uuid] = question.questionDetails.map(() => []);
      });
    });
    setAnswers(initialAnswers);
  };

  const handleAnswerChange = (questionUuid, detailIndex, value) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionUuid]: prevAnswers[questionUuid].map((answer, index) =>
        index === detailIndex ? value : answer
      ),
    }));
  };

  const renderQuestionOptions = (detail, questionUuid, detailIndex) => {
    const isMultipleChoice = detail.uiType === "multi_selection";
    const currentAnswer = answers[questionUuid]
      ? answers[questionUuid][detailIndex] || []
      : [];

    if (isMultipleChoice) {
      return (
        <FormGroup>
          {detail.rows.map((row, rowIndex) => (
            <FormControlLabel
              key={rowIndex}
              control={
                <Checkbox
                  checked={currentAnswer.includes(
                    String.fromCharCode(65 + rowIndex)
                  )}
                  onChange={(e) => {
                    const newAnswer = e.target.checked
                      ? [...currentAnswer, String.fromCharCode(65 + rowIndex)]
                      : currentAnswer.filter(
                          (item) => item !== String.fromCharCode(65 + rowIndex)
                        );
                    handleAnswerChange(questionUuid, detailIndex, newAnswer);
                  }}
                />
              }
              label={`${String.fromCharCode(65 + rowIndex)}. ${row.value}`}
            />
          ))}
        </FormGroup>
      );
    } else {
      return (
        <RadioGroup
          value={currentAnswer[0] || ""}
          onChange={(e) =>
            handleAnswerChange(questionUuid, detailIndex, [e.target.value])
          }
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
    }
  };

  const handleNextQuestion = () => {
    const currentSectionData = exam.sections[currentSection];
    const currentQuestionData = currentSectionData.questions[currentQuestion];

    if (currentDetail < currentQuestionData.questionDetails.length - 1) {
      setCurrentDetail(currentDetail + 1);
    } else if (currentQuestion < currentSectionData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setCurrentDetail(0);
    } else if (currentSection < exam.sections.length - 1) {
      setCurrentSection(currentSection + 1);
      setCurrentQuestion(0);
      setCurrentDetail(0);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentDetail > 0) {
      setCurrentDetail(currentDetail - 1);
    } else if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setCurrentDetail(
        exam.sections[currentSection].questions[currentQuestion - 1]
          .questionDetails.length - 1
      );
    } else if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      const prevSectionQuestions = exam.sections[currentSection - 1].questions;
      setCurrentQuestion(prevSectionQuestions.length - 1);
      setCurrentDetail(
        prevSectionQuestions[prevSectionQuestions.length - 1].questionDetails
          .length - 1
      );
    }
  };

  // 计算全局 questionDetail 编号的函数
  const calculateGlobalDetailCount = (
    targetSection,
    targetQuestion,
    targetDetail
  ) => {
    let count = 0;
    for (let s = 0; s < targetSection; s++) {
      for (let q = 0; q < exam.sections[s].questions.length; q++) {
        count += exam.sections[s].questions[q].questionDetails.length;
      }
    }
    for (let q = 0; q < targetQuestion; q++) {
      count += exam.sections[targetSection].questions[q].questionDetails.length;
    }
    return count + targetDetail + 1;
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (!exam) {
    return <Typography>未找到考试信息</Typography>;
  }

  const currentSectionData = exam.sections[currentSection];
  const currentQuestionData = currentSectionData.questions[currentQuestion];
  const currentDetailData = currentQuestionData.questionDetails[currentDetail];

  const globalDetailCount = calculateGlobalDetailCount(
    currentSection,
    currentQuestion,
    currentDetail
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* 导航栏 */}
      <AppBar position="static">
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography variant="h6" component="div">
            {exam.name}
          </Typography>
          <Box>
            <Button
              color="inherit"
              onClick={handlePreviousQuestion}
              sx={{ mr: 1 }}
            >
              上一题
            </Button>
            <Button color="inherit" onClick={handleNextQuestion} sx={{ mr: 1 }}>
              下一题
            </Button>
            <Button color="inherit" sx={{ mr: 1 }}>
              暂时保存
            </Button>
            <Button color="inherit">提交</Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* 主要内容 */}
      <Box sx={{ display: "flex", flexGrow: 1, overflow: "hidden" }}>
        {/* 左侧答题卡 */}
        <Box
          sx={{
            width: "200px",
            borderRight: "1px solid #ccc",
            p: 2,
            overflowY: "auto",
          }}
        >
          <Typography variant="h6" gutterBottom>
            答题卡
          </Typography>
          {exam.sections.map((section, sectionIndex) => (
            <Box key={section.uuid} sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                {`第${section.order_in_exam}部分 ${section.name}`}
              </Typography>
              <Grid container spacing={1}>
                {section.questions.flatMap((question, questionIndex) =>
                  question.questionDetails.map((detail, detailIndex) => {
                    const detailNumber = calculateGlobalDetailCount(
                      sectionIndex,
                      questionIndex,
                      detailIndex
                    );
                    return (
                      <Grid item key={`${question.uuid}-${detailIndex}`} xs={6}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => {
                            setCurrentSection(sectionIndex);
                            setCurrentQuestion(questionIndex);
                            setCurrentDetail(detailIndex);
                          }}
                          sx={{ width: "100%", minWidth: "30px" }}
                        >
                          {detailNumber}
                        </Button>
                      </Grid>
                    );
                  })
                )}
              </Grid>
            </Box>
          ))}
        </Box>

        {/* 右侧题目内容 */}
        <Box sx={{ flexGrow: 1, p: 2, overflowY: "auto" }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {`第${currentSectionData.order_in_exam}部分 ${currentSectionData.name}`}
            </Typography>
            <Box sx={{ mt: 3, mb: 2 }}>
              {currentQuestionData.material && (
                <Typography
                  variant="body1"
                  sx={{
                    fontStyle: "italic",
                    mb: 1,
                    fontSize: "1.1rem",
                  }}
                >
                  {currentQuestionData.material}
                </Typography>
              )}
              <Typography variant="body1">
                <strong>{globalDetailCount}. </strong>
                {currentDetailData.questionContent.value}
                <span style={{ marginLeft: "8px", color: "gray" }}>
                  ({currentDetailData.score} 分)
                </span>
              </Typography>
              {currentDetailData.questionContent.image && (
                <img
                  src={currentDetailData.questionContent.image}
                  alt="问题图片"
                  style={{ maxWidth: "100%", marginTop: "8px" }}
                />
              )}
              {renderQuestionOptions(
                currentDetailData,
                currentQuestionData.uuid,
                currentDetail
              )}
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default ExamPaper;
