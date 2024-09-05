import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Typography,
  Box,
  CircularProgress,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

const ViewExam = () => {
  const { uuid } = useParams();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const response = await axios.get(`/api/examview/${uuid}`);
        setExam(response.data);
      } catch (error) {
        console.error("获取考试数据失败", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [uuid]);

  const renderQuestionOptions = (rows) => {
    return (
      <List dense>
        {rows.map((row, index) => (
          <ListItem key={index}>
            <ListItemText
              primary={`${String.fromCharCode(65 + index)}. ${row.value}`}
              secondary={
                row.image && (
                  <img
                    src={row.image}
                    alt={`选项 ${String.fromCharCode(65 + index)}`}
                    style={{ maxWidth: "100%" }}
                  />
                )
              }
            />
          </ListItem>
        ))}
      </List>
    );
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (!exam) {
    return <Typography>未找到考试信息</Typography>;
  }

  return (
    <Paper sx={{ p: 2, maxWidth: 1000, mx: "auto", mt: 2 }}>
      <Typography variant="h5" gutterBottom>
        考试详情
      </Typography>
      <Box sx={{ mt: 2 }}>
        <Typography>
          <strong>名称:</strong> {exam.name}
        </Typography>
        <Typography>
          <strong>科目:</strong> {exam.category}
        </Typography>
        <Typography>
          <strong>年级:</strong> {exam.gradeInfo.school} {exam.gradeInfo.grade}
        </Typography>
        <Typography>
          <strong>创建时间:</strong> {exam.createdAt}
        </Typography>
        <Typography>
          <strong>开始时间:</strong> {exam.startTime}
        </Typography>
        <Typography>
          <strong>持续时间:</strong> {exam.duration} 分钟
        </Typography>
        <Typography>
          <strong>总分:</strong> {exam.totalScore} 分
        </Typography>
        <Typography>
          <strong>状态:</strong> {exam.status}
        </Typography>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6" gutterBottom>
        试卷内容
      </Typography>
      {exam.sections && exam.sections.length > 0 ? (
        exam.sections.map((section) => (
          <Box key={section.uuid} sx={{ mb: 3 }}>
            <Typography variant="subtitle1">
              <strong>
                {section.order_in_exam}. {section.name}
              </strong>
            </Typography>
            {section.questions && section.questions.length > 0 ? (
              section.questions.map((question) => (
                <Box key={question.uuid} sx={{ mb: 2, pl: 2 }}>
                  {question.material && (
                    <Typography>{question.material}</Typography>
                  )}
                  {question.questionDetails.map((detail) => (
                    <Box key={detail.uuid} sx={{ mt: 1, pl: 2 }}>
                      <Typography>
                        <strong> {detail.order_in_question}:</strong>
                        {detail.questionContent.value}({detail.score} 分)
                      </Typography>
                      {detail.questionContent.image && (
                        <img
                          src={detail.questionContent.image}
                          alt="问题图片"
                          style={{ maxWidth: "100%", marginTop: "8px" }}
                        />
                      )}
                      {renderQuestionOptions(detail.rows)}
                    </Box>
                  ))}
                </Box>
              ))
            ) : (
              <Typography>本节没有问题。</Typography>
            )}
          </Box>
        ))
      ) : (
        <Typography>没有可用的试卷内容。</Typography>
      )}
    </Paper>
  );
};

export default ViewExam;
