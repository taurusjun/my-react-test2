import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Typography,
  Box,
  CircularProgress,
  Paper,
  styled,
} from "@mui/material";
import CommonLayout from "../../../layouts/CommonLayout";
import { getBreadcrumbPaths } from "../../../config/breadcrumbPaths";
import CommonBreadcrumbs from "../../../components/CommonBreadcrumbs";
import ExamDetailContent from "../../../components/ExamDetailContent";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2, 0),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[3],
}));

const ExamDetail = () => {
  const { uuid } = useParams();
  const [examData, setExamData] = useState(null);
  const [answerScoreMap, setAnswerScoreMap] = useState({});
  const [pointMap, setPointMap] = useState({});
  const [studentInfo, setStudentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExamDetail = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `/api/user-exams/exam/${uuid}`
        );
        
        const data = response.data.data;
        setExamData(data.examData);
        setAnswerScoreMap(data.answerScoreMap || {});
        setPointMap(data.pointMap || {});
        setStudentInfo(data.studentInfo);
        setLoading(false);
      } catch (err) {
        console.error("获取考试详情失败:", err);
        setError("获取考试详情失败，请稍后重试。");
        setLoading(false);
      }
    };

    fetchExamDetail();
  }, [uuid]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="300px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="300px"
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!examData) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="300px"
      >
        <Typography>未找到考试详情。</Typography>
      </Box>
    );
  }

  return (
    <CommonLayout
      currentPage="考试详情"
      maxWidth="xl"
      showBreadcrumbs={true}
      BreadcrumbsComponent={() => (
        <CommonBreadcrumbs
          paths={getBreadcrumbPaths().examDetail || [
            { name: "首页", path: "/" },
            { name: "我的考试", path: "/my-exams/list" },
            { name: "考试详情" }
          ]}
        />
      )}
    >
      <StyledPaper>
        {studentInfo && (
          <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
            <Typography variant="subtitle1" sx={{ mr: 3 }}>
              <strong>考生姓名:</strong> {studentInfo.studentName || "未知"}
            </Typography>
            <Typography variant="subtitle1">
              <strong>完成时间:</strong> {studentInfo.doneTime || "未知"}
            </Typography>
          </Box>
        )}
        
        <div id="printable-content">
          <ExamDetailContent 
            exam={examData} 
            answerScoreMap={answerScoreMap} 
            pointMap={pointMap}
            showHeader={true} 
          />
        </div>
      </StyledPaper>
    </CommonLayout>
  );
};

export default ExamDetail;