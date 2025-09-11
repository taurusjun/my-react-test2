import React from "react";
import { MarkdownRenderer } from "./markdown";
import {
  Typography,
  Box,
  Divider,
  List,
  ListItem,
  Grid,
  Chip,
  styled,
} from "@mui/material";
import { safeGet, isSafeArray, safeString, safeNumber } from "../utils/safetyUtils";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(2),
  color: theme.palette.primary.main,
}));

const QuestionBox = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
}));

const AnswerBox = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(1.5),
  backgroundColor: theme.palette.grey[50],
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.grey[200]}`,
}));

const UserAnswerBox = styled(Box)(({ isCorrect }) => ({
  marginTop: 16,
  padding: 12,
  backgroundColor: isCorrect ? "#e8f5e9" : "#ffebee",
  borderRadius: 4,
  border: `1px solid ${isCorrect ? "#a5d6a7" : "#ef9a9a"}`,
}));

const ExplanationBox = styled(Box)(({ theme }) => ({
  marginTop: 16,
  padding: 12,
  backgroundColor: "#e3f2fd",
  borderRadius: 4,
  border: `1px solid ${theme.palette.info.light}`,
}));

const ExamDetailContent = ({ exam, answerScoreMap, pointMap, showHeader = true }) => {
  // 添加顶层null检查
  if (!exam) {
    return <Typography>没有可用的试卷数据。</Typography>;
  }

  const renderQuestionOptions = (rows, uiType = 'single_selection') => {
    if (!isSafeArray(rows)) {
      return null;
    }
    
    // 判断题特殊处理
    if (uiType === 'true_false') {
      return (
        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          <Box 
            sx={{ 
              display: "flex", 
              alignItems: "center", 
              padding: "8px 16px", 
              border: "1px solid #e0e0e0", 
              borderRadius: "4px",
              backgroundColor: "#f9f9f9"
            }}
          >
            <Typography sx={{ fontWeight: "bold", mr: 1 }}>A.</Typography>
            <Typography>正确</Typography>
          </Box>
          <Box 
            sx={{ 
              display: "flex", 
              alignItems: "center", 
              padding: "8px 16px", 
              border: "1px solid #e0e0e0", 
              borderRadius: "4px",
              backgroundColor: "#f9f9f9"
            }}
          >
            <Typography sx={{ fontWeight: "bold", mr: 1 }}>B.</Typography>
            <Typography>错误</Typography>
          </Box>
        </Box>
      );
    }
    
    return (
      <List dense>
        {rows.map((row, index) => (
          <ListItem key={index}>
            <Box sx={{ width: "100%" }}>
              <Box sx={{ display: "flex", alignItems: "flex-start", mb: 1 }}>
                <Typography
                  component="span"
                  sx={{ minWidth: "24px", fontWeight: "bold", mt: 0.5 }}
                >
                  {String.fromCharCode(65 + index)}.
                </Typography>
                <Box sx={{ flex: 1, ml: 1 }}>
                  <MarkdownRenderer content={row.value || ''} />
                </Box>
              </Box>
              {row.images &&
                Array.isArray(row.images) &&
                row.images.length > 0 && (
                  <Box sx={{ ml: 3, mt: 1 }}>
                    {row.images.map((image, imgIndex) => (
                      <img
                        key={imgIndex}
                        src={image}
                        alt={`选项 ${String.fromCharCode(65 + index)} 图片 ${
                          imgIndex + 1
                        }`}
                        style={{ width: "150px", height: "auto", marginRight: "8px" }}
                      />
                    ))}
                  </Box>
                )}
            </Box>
          </ListItem>
        ))}
      </List>
    );
  };

  const renderAnswer = (answer) => {
    // 处理新的answer对象格式
    if (answer && typeof answer === 'object' && answer.content) {
      const content = answer.content;
      if (Array.isArray(content)) {
        // 处理判断题的true/false值
        if (content.length > 0) {
          if (content[0] === true || content[0] === 'true') {
            return "正确";
          } else if (content[0] === false || content[0] === 'false') {
            return "错误";
          }
        }
        return content.join(", ");
      }
      return content;
    }
    
    // 处理旧的数组格式（向后兼容）
    if (Array.isArray(answer)) {
      // 处理判断题的true/false值
      if (answer.length > 0) {
        if (answer[0] === true || answer[0] === 'true') {
          return "正确";
        } else if (answer[0] === false || answer[0] === 'false') {
          return "错误";
        }
      }
      return answer.join(", ");
    }
    
    // 处理其他情况
    if (answer === true || answer === 'true') {
      return "正确";
    } else if (answer === false || answer === 'false') {
      return "错误";
    }
    
    return answer || "未作答";
  };

  // 检查用户答案是否与标准答案匹配
  const isAnswerCorrect = (detailUuid, standardAnswer, userAnswer) => {
    // 如果有pointMap和answerScoreMap，则通过分数判断
    if (pointMap && answerScoreMap && detailUuid && 
        pointMap[detailUuid] && answerScoreMap[detailUuid]) {
      return pointMap[detailUuid] === answerScoreMap[detailUuid].userScore;
    }

    // 如果没有分数信息，则通过答案内容比较
    if (!userAnswer) return false;
    if (!standardAnswer) return false;

    // 处理数组答案
    if (Array.isArray(standardAnswer) && Array.isArray(userAnswer)) {
      if (standardAnswer.length !== userAnswer.length) return false;
      return standardAnswer.every(ans => userAnswer.includes(ans));
    }

    // 处理对象答案
    if (typeof standardAnswer === 'object' && standardAnswer.content && 
        typeof userAnswer === 'object' && userAnswer.content) {
      return JSON.stringify(standardAnswer.content) === JSON.stringify(userAnswer.content);
    }

    // 处理简单答案
    return standardAnswer === userAnswer;
  };

  return (
    <>
      {showHeader && (
        <>
          <Typography variant="h4" gutterBottom>
            考试详情
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography>
                <strong>名称:</strong> {safeString(exam.name, '未命名')}
              </Typography>
              <Typography>
                <strong>科目:</strong> {safeString(exam.category, '未分类')}
              </Typography>
              <Typography>
                <strong>年级:</strong> {safeString(safeGet(exam, 'gradeInfo.school'), '')}{" "}
                {safeString(safeGet(exam, 'gradeInfo.grade'), '')}
              </Typography>
              <Typography>
                <strong>创建时间:</strong> {safeString(exam.createdAt, '未知')}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography>
                <strong>开始时间:</strong> {safeString(exam.startTime, '未知')}
              </Typography>
              <Typography>
                <strong>持续时间:</strong> {safeNumber(exam.duration, 0)} 分钟
              </Typography>
              <Typography>
                <strong>总分:</strong> {safeNumber(exam.totalScore, 0)} 分
              </Typography>
              <Typography>
                <strong>状态:</strong>{" "}
                <Chip label={safeString(exam.status, '未知')} color="primary" size="small" />
              </Typography>
            </Grid>
          </Grid>
          <Divider sx={{ my: 3 }} />
        </>
      )}

      <SectionTitle variant="h5">试卷内容</SectionTitle>
      <Box className="print-content">
        {isSafeArray(exam.sections) ? (
          exam.sections.map((section, sectionIndex) => {
            let detailCounter = 0;
            return (
              <Box
                key={section.uuid}
                sx={{ mb: 4 }}
                className={sectionIndex > 0 ? "page-break" : ""}
              >
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" component="div" sx={{ display: "flex", alignItems: "center" }}>
                    <span style={{ marginRight: "8px", fontWeight: "bold" }}>
                      {section.order_in_exam || ''}.
                    </span>
                    <Box sx={{ flex: 1 }}>
                      <MarkdownRenderer 
                        content={section.name || '未命名部分'}
                        sx={{ 
                          "& p": { margin: 0, fontWeight: 600, fontSize: "1.25rem" },
                          "& h1, & h2, & h3, & h4, & h5, & h6": { margin: 0, fontSize: "1.25rem" }
                        }}
                      />
                    </Box>
                  </Typography>
                </Box>
                {isSafeArray(section.questions) ? (
                  section.questions.map((question) => (
                    <QuestionBox key={question.uuid}>
                      {question.material && (
                        <Box sx={{ mb: 2, p: 2, backgroundColor: "#f9f9f9", borderRadius: 1, border: "1px solid #e0e0e0" }}>
                          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold", color: "primary.main" }}>
                            材料：
                          </Typography>
                          <MarkdownRenderer content={question.material || ''} />
                        </Box>
                      )}
                      {isSafeArray(question.questionDetails) && question.questionDetails.map((detail) => {
                        detailCounter++;
                        
                        // 获取用户答案和分数信息
                        const userAnswerData = answerScoreMap && answerScoreMap[detail.uuid];
                        const userAnswer = userAnswerData ? userAnswerData.userAnswer : null;
                        const userScore = userAnswerData ? userAnswerData.userScore : 0;
                        const totalScore = pointMap && pointMap[detail.uuid] ? pointMap[detail.uuid] : detail.score || 0;
                        const isCorrect = isAnswerCorrect(detail.uuid, detail.answer, userAnswer);
                        
                        return (
                          <Box key={detail.uuid} sx={{ mt: 2 }}>
                            <Typography
                              variant="subtitle1"
                              component="div"
                              sx={{ display: "flex", alignItems: "center" }}
                            >
                              <span
                                style={{ marginRight: "8px", flexShrink: 0 }}
                              >
                                <strong>{detailCounter}:</strong>{" "}
                              </span>
                              <Box sx={{ flex: 1 }}>
                                <MarkdownRenderer 
                                  content={detail.questionContent && detail.questionContent.value ? detail.questionContent.value : ''} 
                                />
                              </Box>
                              <Chip
                                label={`${userScore || 0} / ${totalScore} 分`}
                                size="small"
                                color={isCorrect ? "success" : "error"}
                                sx={{ ml: 1, minWidth: "auto", flexShrink: 0 }}
                              />
                            </Typography>
                            
                            {detail.questionContent && detail.questionContent.images &&
                              Array.isArray(detail.questionContent.images) &&
                              detail.questionContent.images.length > 0 &&
                              detail.questionContent.images.map(
                                (image, index) => (
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
                                )
                              )}
                            {renderQuestionOptions(detail.rows, detail.uiType)}

                            {/* 标准答案 */}
                            <AnswerBox>
                              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                <CheckCircleOutlineIcon color="success" sx={{ mr: 1 }} />
                                <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                                  标准答案
                                </Typography>
                              </Box>
                              <Typography variant="body1">
                                {renderAnswer(detail.answer)}
                              </Typography>
                            </AnswerBox>

                            {/* 用户答案 */}
                            <UserAnswerBox isCorrect={isCorrect}>
                              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                <ErrorOutlineIcon 
                                  color={isCorrect ? "success" : "error"} 
                                  sx={{ mr: 1 }} 
                                />
                                <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                                  你的答案
                                </Typography>
                              </Box>
                              <Typography variant="body1">
                                {renderAnswer(userAnswer)}
                              </Typography>
                            </UserAnswerBox>

                            {/* 解释 */}
                            {detail.explanation && (
                              <ExplanationBox>
                                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                  <InfoOutlinedIcon color="info" sx={{ mr: 1 }} />
                                  <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                                    解析
                                  </Typography>
                                </Box>
                                <MarkdownRenderer content={detail.explanation || ''} />
                              </ExplanationBox>
                            )}
                          </Box>
                        );
                      })}
                    </QuestionBox>
                  ))
                ) : (
                  <Typography>本节没有问题。</Typography>
                )}
              </Box>
            );
          })
        ) : (
          <Typography>没有可用的试卷内容。</Typography>
        )}
      </Box>
    </>
  );
};

export default ExamDetailContent;