import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
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

// 可重用的Markdown渲染组件
const MarkdownRenderer = ({ content, sx = {} }) => {
  if (!content) return null;
  
  return (
    <Box sx={sx}>
      <ReactMarkdown
        components={{
          p: ({ node, ...props }) => (
            <p style={{ margin: "8px 0", lineHeight: "1.6" }} {...props} />
          ),
          code: ({ node, inline, className, children, ...props }) => (
            <code
              style={{
                backgroundColor: inline ? "#f5f5f5" : "#f8f8f8",
                padding: inline ? "2px 4px" : "12px 16px",
                borderRadius: "4px",
                fontFamily: "Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace",
                fontSize: inline ? "0.9em" : "0.85em",
                border: "1px solid #e1e1e1",
                display: inline ? "inline" : "block",
                whiteSpace: inline ? "nowrap" : "pre-wrap",
                overflow: inline ? "visible" : "auto",
              }}
              {...props}
            >
              {children}
            </code>
          ),
          pre: ({ node, ...props }) => (
            <pre
              style={{
                backgroundColor: "#f8f8f8",
                padding: "16px",
                borderRadius: "6px",
                overflow: "auto",
                border: "1px solid #e1e1e1",
                margin: "16px 0",
                lineHeight: "1.4",
              }}
              {...props}
            />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote
              style={{
                borderLeft: "4px solid #ddd",
                paddingLeft: "16px",
                margin: "16px 0",
                color: "#666",
                fontStyle: "italic",
              }}
              {...props}
            />
          ),
          table: ({ node, ...props }) => (
            <table
              style={{
                borderCollapse: "collapse",
                width: "100%",
                margin: "16px 0",
              }}
              {...props}
            />
          ),
          th: ({ node, ...props }) => (
            <th
              style={{
                border: "1px solid #ddd",
                padding: "8px 12px",
                backgroundColor: "#f5f5f5",
                textAlign: "left",
              }}
              {...props}
            />
          ),
          td: ({ node, ...props }) => (
            <td
              style={{
                border: "1px solid #ddd",
                padding: "8px 12px",
              }}
              {...props}
            />
          ),
        }}
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeRaw]}
      >
        {content}
      </ReactMarkdown>
    </Box>
  );
};

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
                            {renderQuestionOptions(detail.rows, detail.uiType)}

                            <AnswerBox>
                              <Typography variant="body2">
                                <strong>答案：</strong>
                                {renderAnswer(detail.answer)}
                              </Typography>

                              {detail.explanation && (
                                <Box sx={{ mt: 2 }}>
                                  <Typography variant="body2" sx={{ mb: 1, fontWeight: "bold" }}>
                                    解释：
                                  </Typography>
                                  <MarkdownRenderer content={detail.explanation || ''} />
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
