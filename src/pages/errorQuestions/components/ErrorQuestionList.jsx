import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Modal,
  Fade,
  Grid,
  Chip,
  Checkbox,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import ErrorQuestionDetail from "./ErrorQuestionDetail";
import CommonLayout from "../../../layouts/CommonLayout";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CommonBreadcrumbs from "../../../components/CommonBreadcrumbs";
import { getBreadcrumbPaths } from "../../../config/breadcrumbPaths";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  "&.MuiTableCell-head": {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

const ErrorQuestionList = () => {
  const [errorQuestions, setErrorQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [examFilter, setExamFilter] = useState("");
  const [errorCountFilter, setErrorCountFilter] = useState("");
  const [examList, setExamList] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedQuestionUuid, setSelectedQuestionUuid] = useState(null);
  const [selectAll, setSelectAll] = useState(false);
  const navigate = useNavigate();

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

  const handleSelectAll = (event) => {
    const checked = event.target.checked;
    setSelectAll(checked);
    setSelectedQuestions(checked ? errorQuestions.map((q) => q.uuid) : []);
  };

  const handleSelectQuestion = (questionUuid) => {
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
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Grid item xs={12} sm="auto">
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>考试</InputLabel>
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
          </Grid>
          <Grid item xs={12} sm="auto">
            <FormControl size="small" sx={{ minWidth: 120 }}>
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
          </Grid>
          <Grid item xs={12} sm="auto">
            <Button
              variant="contained"
              color="primary"
              onClick={handleStartPractice}
              disabled={selectedQuestions.length === 0}
              sx={{
                height: "40px",
                minWidth: 120,
                boxShadow: "0 3px 5px 2px rgba(33, 150, 243, .3)",
                transition: "all 0.3s",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 10px 4px rgba(33, 150, 243, .3)",
                },
              }}
            >
              开始练习 ({selectedQuestions.length})
            </Button>
          </Grid>
        </Grid>
      </Box>
      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>
                <Checkbox
                  checked={selectAll}
                  onChange={handleSelectAll}
                  indeterminate={
                    selectedQuestions.length > 0 &&
                    selectedQuestions.length < errorQuestions.length
                  }
                />
              </StyledTableCell>
              <StyledTableCell>考试名称</StyledTableCell>
              <StyledTableCell>题目摘要</StyledTableCell>
              <StyledTableCell>错误次数</StyledTableCell>
              <StyledTableCell>操作</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {errorQuestions.map((question) => (
              <StyledTableRow key={question.uuid}>
                <TableCell>
                  <Checkbox
                    checked={selectedQuestions.includes(question.uuid)}
                    onChange={() => handleSelectQuestion(question.uuid)}
                  />
                </TableCell>
                <TableCell>{question.examName}</TableCell>
                <TableCell>{question.digest}</TableCell>
                <TableCell>
                  <Chip
                    label={question.errorCount}
                    color={question.errorCount > 2 ? "error" : "warning"}
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    onClick={() => handleViewErrorQuestion(question.uuid)}
                  >
                    查看错题
                  </Button>
                </TableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        closeAfterTransition
        aria-labelledby="错题详情"
        aria-describedby="显示选中错题的详细信息"
      >
        <Fade in={openModal}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "90%",
              maxWidth: "900px",
              maxHeight: "90vh",
              overflowY: "auto",
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
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
        </Fade>
      </Modal>
    </CommonLayout>
  );
};

export default ErrorQuestionList;
