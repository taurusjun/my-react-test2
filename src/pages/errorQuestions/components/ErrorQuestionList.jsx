import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Box,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import CommonLayout from "../../../layouts/CommonLayout";
import { getBreadcrumbPaths } from "../../../config/breadcrumbPaths";
import CommonBreadcrumbs from "../../../components/CommonBreadcrumbs";
import axios from "axios";

const ErrorQuestionList = () => {
  const [errorQuestions, setErrorQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [examFilter, setExamFilter] = useState("");
  const [errorCountFilter, setErrorCountFilter] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // 从API获取错题列表
    fetchErrorQuestions();
  }, [examFilter, errorCountFilter]);

  const fetchErrorQuestions = async () => {
    try {
      const response = await axios.get("/api/error-questions", {
        params: {
          examFilter,
          errorCountFilter,
        },
      });
      setErrorQuestions(response.data);
    } catch (error) {
      console.error("获取错题列表失败:", error);
      // 这里可以添加错误处理，比如显示一个错误提示
    }
  };

  const handleCheckboxChange = (questionUuid) => {
    setSelectedQuestions((prev) =>
      prev.includes(questionUuid)
        ? prev.filter((uuid) => uuid !== questionUuid)
        : [...prev, questionUuid]
    );
  };

  const handleViewErrorQuestion = (questionUuid) => {
    navigate(`/error-questions/view/${questionUuid}`);
  };

  const handleStartPractice = () => {
    if (selectedQuestions.length > 0) {
      navigate("/error-questions/practice", {
        state: { uuids: selectedQuestions },
      });
    }
  };

  const breadcrumbPaths = getBreadcrumbPaths();

  return (
    <CommonLayout
      currentPage="错题列表"
      maxWidth="lg"
      showBreadcrumbs={true}
      BreadcrumbsComponent={() => (
        <CommonBreadcrumbs paths={breadcrumbPaths.errorQuestionList} />
      )}
    >
      <Box sx={{ mb: 2 }}>
        <FormControl sx={{ minWidth: 120, mr: 2 }}>
          <InputLabel>考试筛选</InputLabel>
          <Select
            value={examFilter}
            onChange={(e) => setExamFilter(e.target.value)}
          >
            <MenuItem value="">全部</MenuItem>
            {/* 添加考试选项 */}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 120, mr: 2 }}>
          <InputLabel>错误次数</InputLabel>
          <Select
            value={errorCountFilter}
            onChange={(e) => setErrorCountFilter(e.target.value)}
          >
            <MenuItem value="">全部</MenuItem>
            <MenuItem value="1">1次</MenuItem>
            <MenuItem value="2">2次</MenuItem>
            <MenuItem value="3">3次及以上</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          onClick={handleStartPractice}
          disabled={selectedQuestions.length === 0}
        >
          开始强化练习
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  onChange={(e) =>
                    setSelectedQuestions(
                      e.target.checked ? errorQuestions.map((q) => q.uuid) : []
                    )
                  }
                  checked={selectedQuestions.length === errorQuestions.length}
                />
              </TableCell>
              <TableCell>考试名称</TableCell>
              <TableCell>题目摘要</TableCell>
              <TableCell>错误次数</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {errorQuestions.map((question) => (
              <TableRow key={question.uuid}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedQuestions.includes(question.uuid)}
                    onChange={() => handleCheckboxChange(question.uuid)}
                  />
                </TableCell>
                <TableCell>{question.examName}</TableCell>
                <TableCell>{question.digest}</TableCell>
                <TableCell>{question.errorCount}</TableCell>
                <TableCell>
                  <Button
                    onClick={() => handleViewErrorQuestion(question.uuid)}
                  >
                    查看错题
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </CommonLayout>
  );
};

export default ErrorQuestionList;
