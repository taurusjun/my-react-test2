import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Modal,
  Typography,
} from "@mui/material";
import CommonLayout from "../../../layouts/CommonLayout";
import { getBreadcrumbPaths } from "../../../config/breadcrumbPaths";
import CommonBreadcrumbs from "../../../components/CommonBreadcrumbs";
import axios from "axios";
import ErrorQuestionDetail from "./ErrorQuestionDetail"; // 新建这个组件

const ErrorQuestionList = () => {
  const [errorQuestions, setErrorQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [examFilter, setExamFilter] = useState("");
  const [errorCountFilter, setErrorCountFilter] = useState("");
  const [examList, setExamList] = useState([]);
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);
  const [selectedQuestionUuid, setSelectedQuestionUuid] = useState(null);

  const fetchExamList = useCallback(async () => {
    try {
      const response = await axios.get("/api/exams");
      setExamList(response.data);
    } catch (error) {
      console.error("获取考试列表失败:", error);
    }
  }, []);

  const fetchErrorQuestions = useCallback(async () => {
    try {
      const response = await axios.get("/api/error-questions", {
        params: {
          examUuid: examFilter,
          errorCountFilter,
        },
      });
      setErrorQuestions(response.data);
    } catch (error) {
      console.error("获取错题列表失败:", error);
    }
  }, [examFilter, errorCountFilter]);

  useEffect(() => {
    fetchExamList();
    fetchErrorQuestions();
  }, [fetchExamList, fetchErrorQuestions]);

  const handleCheckboxChange = (questionUuid) => {
    setSelectedQuestions((prev) =>
      prev.includes(questionUuid)
        ? prev.filter((uuid) => uuid !== questionUuid)
        : [...prev, questionUuid]
    );
  };

  const handleViewErrorQuestion = (questionUuid) => {
    setSelectedQuestionUuid(questionUuid);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedQuestionUuid(null);
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
            {examList.map((exam) => (
              <MenuItem key={exam.uuid} value={exam.uuid}>
                {exam.name}
              </MenuItem>
            ))}
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

      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="错题详情"
        aria-describedby="显示选中错题的详细信息"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "80%",
            maxWidth: "800px", // 添加最大宽度
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            maxHeight: "90vh",
            overflowY: "auto",
            borderRadius: 2, // 添加圆角
          }}
        >
          {selectedQuestionUuid && (
            <ErrorQuestionDetail questionUuid={selectedQuestionUuid} />
          )}
          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={handleCloseModal} variant="contained">
              关闭
            </Button>
          </Box>
        </Box>
      </Modal>
    </CommonLayout>
  );
};

export default ErrorQuestionList;
