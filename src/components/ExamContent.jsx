import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import {
  Typography,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  Grid,
  Chip,
  styled,
} from "@mui/material";
import { safeGet, isSafeArray, safeString, safeNumber } from "../utils/safetyUtils";

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
  padding: theme.spacing(1),
  backgroundColor: theme.palette.grey[100],
  borderRadius: theme.shape.borderRadius,
}));

const ExamContent = ({ exam, showHeader = true }) => {
  // 添加顶层null检查
  if (!exam) {
    return <Typography>没有可用的试卷数据。</Typography>;
  }
  const renderQuestionOptions = (rows) => {
    if (!isSafeArray(rows)) {
      return null;
    }
    
    return (
      <List dense>
        {rows.map((row, index) => (
          <ListItem key={index}>
            <ListItemText
              primary={`${String.fromCharCode(65 + index)}. ${row.value || ''}`}
              secondary={
                row.images &&
                Array.isArray(row.images) &&
                row.images.length > 0 &&
                row.images.map((image, imgIndex) => (
                  <img
                    key={imgIndex}
                    src={image}
                    alt={`选项 ${String.fromCharCode(65 + index)} 图片 ${
                      imgIndex + 1
                    }`}
                    style={{ width: "150px", height: "auto", marginTop: "8px" }}
                  />
                ))
              }
            />
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
        return content.join(", ");
      }
      return content;
    }
    
    // 处理旧的数组格式（向后兼容）
    if (Array.isArray(answer)) {
      return answer.join(", ");
    }
    
    return answer;
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
                <Typography variant="h6" gutterBottom>
                  {section.order_in_exam || ''}. {section.name || '未命名部分'}
                </Typography>
                {isSafeArray(section.questions) ? (
                  section.questions.map((question) => (
                    <QuestionBox key={question.uuid}>
                      {question.material && (
                        <Typography sx={{ mb: 1 }}>
                          <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                            {question.material || ''}
                          </ReactMarkdown>
                        </Typography>
                      )}
                      {isSafeArray(question.questionDetails) && question.questionDetails.map((detail) => {
                        detailCounter++;
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
                              <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                                {detail.questionContent && detail.questionContent.value ? detail.questionContent.value : ''}
                              </ReactMarkdown>
                              <Chip
                                label={`${detail.score || 0} 分`}
                                size="small"
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
                            {renderQuestionOptions(detail.rows)}

                            <AnswerBox>
                              <Typography variant="body2">
                                <strong>答案：</strong>
                                {renderAnswer(detail.answer)}
                              </Typography>

                              {detail.explanation && (
                                <Box sx={{ mt: 1 }}>
                                  <Typography variant="body2">
                                    <strong>解释：</strong>
                                  </Typography>
                                  <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                                    {detail.explanation || ''}
                                  </ReactMarkdown>
                                </Box>
                              )}
                            </AnswerBox>
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

export default ExamContent;
