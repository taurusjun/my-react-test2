import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
  Grid,
  Paper,
} from "@mui/material";
import CommonLayout from "../../../layouts/CommonLayout";
import { getBreadcrumbPaths } from "../../../config/breadcrumbPaths";
import CommonBreadcrumbs from "../../../components/CommonBreadcrumbs";
import axios from "axios";
import QuestionDetailView from "./QuestionDetailView";

const ErrorQuestionPractice = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [questionsByPage, setQuestionsByPage] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [totalCount, setTotalCount] = useState(0);

  const paramsRef = React.useRef(location.state?.params || []);
  
  // 定义 fetchQuestions 函数
  const fetchQuestions = useCallback(async (paramsValue) => {
    try {
      // 将字符串格式的参数转换为URLSearchParams对象
      const params = new URLSearchParams(paramsValue);
      
      // 准备API请求参数
      const apiParams = {};
      
      // 将所有examUuids值单独添加，而不是作为数组
      const examUuids = params.getAll('examUuids');
      if (examUuids.length > 0) {
        // 不要将examUuids设置为数组，而是让axios自动处理多个同名参数
        apiParams.examUuids = examUuids;
      }
      
      // 添加分页参数
      apiParams.page = currentPage;
      apiParams.pageSize = itemsPerPage;
      
      // 添加其他参数
      for (const [key, value] of params.entries()) {
        if (key !== 'examUuids' && key !== 'page' && key !== 'pageSize') {
          apiParams[key] = value;
        }
      }
      
      // 确保errorThreshold参数存在
      if (!apiParams.errorThreshold && params.has('errorThreshold')) {
        apiParams.errorThreshold = params.get('errorThreshold');
      }

      // 打印请求参数，便于调试
      // console.log('API request params:', apiParams);
      
      // 当examUuids是数组时，axios默认会将其格式化为 examUuids=xxx&examUuids=yyy
      const response = await axios.get("/api/record/wrong-questions/details", {
        params: apiParams,
        paramsSerializer: function(params) {
          // 使用URLSearchParams来确保多个同名参数正确格式化
          const searchParams = new URLSearchParams();
          
          // 特殊处理examUuids数组，确保它们被格式化为 examUuids=xxx&examUuids=yyy
          if (params.examUuids && Array.isArray(params.examUuids)) {
            params.examUuids.forEach(uuid => {
              searchParams.append('examUuids', uuid);
            });
            
            // 移除已处理的examUuids，防止重复添加
            const { examUuids, ...otherParams } = params;
            params = otherParams;
          }
          
          // 添加其他所有参数
          for (const key in params) {
            if (params.hasOwnProperty(key)) {
              searchParams.append(key, params[key]);
            }
          }
          
          return searchParams.toString();
        }
      });
      
      const newQuestions = response.data.data.items || [];
      setQuestions(newQuestions);
      setTotalCount(response.data.data.totalCount || 0);
      
      // 将新页面的问题保存到分页缓存中
      setQuestionsByPage(prev => ({
        ...prev,
        [currentPage]: newQuestions
      }));
      
      // console.log('API Response:', response.data);
    } catch (error) {
      console.error("获取错题练习详情失败:", error);
      // 这里可以添加错误处理逻辑，比如显示错误消息
    }
  }, [currentPage, itemsPerPage]);
  
  // 使用 useEffect 来加载页面数据
  useEffect(() => {
    const params = paramsRef.current;
    // 检查params是否为空（可能是空字符串、空数组或未定义）
    if (!params || (Array.isArray(params) && params.length === 0) || params === '') {
      navigate("/error-questions");
      return;
    }
    
    // 检查是否已缓存当前页的问题
    if (questionsByPage[currentPage] && questionsByPage[currentPage].length > 0) {
      setQuestions(questionsByPage[currentPage]);
    } else {
      fetchQuestions(params);
    }
  }, [currentPage, navigate, fetchQuestions, questionsByPage]);

  // Old commented-out version of fetchQuestions
  // const fetchQuestions = async (uuids) => {
  //   try {
  //     const response = await axios.get("/api/error-questions-practice", {
  //       params: { uuids },
  //     });
  //     setQuestions(response.data);
  //   } catch (error) {
  //     console.error("获取错题练习详情失败:", error);
  //     // 这里可以添加错误处理逻辑，比如显示错误消息
  //   }
  // };

  const handleAnswerChange = useCallback((answers, questionUuid) => {
    setUserAnswers(prevAnswers => ({
      ...prevAnswers,
      [questionUuid]: answers[questionUuid]
    }));
  }, []);

  const handlePageChange = useCallback((_event, value) => {
    setCurrentPage(value);
  }, []);

  // const handleSubmit = async () => {
  //   try {
  //     const response = await axios.post(
  //       "/api/error-questions-practice/submit",
  //       {
  //         answers: userAnswers,
  //       }
  //     );
  //     setResults(response.data);
  //     setShowResults(true);
  //   } catch (error) {
  //     console.error("提交答案失败:", error);
  //     // 这里可以添加错误处理逻辑，比如显示错误消息
  //   }
  // };

  const handleSubmit = async () => {
    try {
      if (Object.keys(userAnswers).length === 0) {
        console.error("请至少回答一道题目");
        return;
      }
      
      const response = await axios.post(
        "/api/my-exams/wrong-questions/practice",
        {
          answers: userAnswers,
        }
      );
      
      setResults(response.data);
      setShowResults(true);
    } catch (error) {
      console.error("提交答案失败:", error);
      // 这里可以添加错误处理逻辑，比如显示错误消息
    }
  };

  const handleCloseResults = () => {
    setShowResults(false);
    navigate("/error-questions");
  };

  const breadcrumbPaths = getBreadcrumbPaths();

  return (
    <CommonLayout
      currentPage="错题强化"
      maxWidth="md"
      showBreadcrumbs={true}
      BreadcrumbsComponent={() => (
        <CommonBreadcrumbs paths={breadcrumbPaths.errorQuestionPractice} />
      )}
    >
      {questions.length > 0 ? (
        <Box>
          <Grid container spacing={3}>
            {questions.map((question, index) => (
              <Grid item xs={12} key={question.uuid}>
                <Paper elevation={2} sx={{ backgroundColor: "#f5f5f5", padding: 3, borderRadius: 2, mb: 2 }}>
                  <QuestionDetailView
                    questionDetail={question}
                    onAnswerChange={(answers) => handleAnswerChange(answers, question.uuid)}
                    header={`问题 ${index + 1 + (currentPage - 1) * itemsPerPage}`}
                    initialAnswer={userAnswers[question.uuid]}
                  />
                </Paper>
              </Grid>
            ))}
          </Grid>
          
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4, mb: 2 }}>
            <Pagination 
              count={Math.ceil(totalCount / itemsPerPage)}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              showFirstButton
              showLastButton
            />
          </Box>
          
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <Button
              onClick={handleSubmit}
              variant="contained"
              color="primary"
              disabled={Object.keys(userAnswers).length === 0}
            >
              提交答案
            </Button>
          </Box>
        </Box>
      ) : (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="h6">没有可用的错题</Typography>
        </Box>
      )}

      <Dialog
        open={showResults}
        onClose={handleCloseResults}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: "#1976d2", color: "white" }}>
          练习结果
        </DialogTitle>
        <DialogContent>
          {results && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ color: "#1976d2" }}>
                得分: {results.score}/{results.totalScore}
              </Typography>
              {results.questions.map((question, index) => (
                <Box
                  key={index}
                  mt={3}
                  p={2}
                  sx={{ backgroundColor: "#f5f5f5", borderRadius: 1 }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                    问题 {index + 1}
                  </Typography>
                  <Typography>
                    你的答案:{" "}
                    <span
                      style={{
                        color:
                          question.userAnswer === question.correctAnswer
                            ? "green"
                            : "red",
                      }}
                    >
                      {question.userAnswer}
                    </span>
                  </Typography>
                  <Typography>
                    正确答案:{" "}
                    <span style={{ color: "green" }}>
                      {question.correctAnswer}
                    </span>
                  </Typography>
                  <Typography sx={{ mt: 1, fontStyle: "italic" }}>
                    解释: {question.explanation}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseResults}
            variant="contained"
            color="primary"
          >
            关闭
          </Button>
        </DialogActions>
      </Dialog>
    </CommonLayout>
  );
};

export default ErrorQuestionPractice;
