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
  TableHead,
  TableRow,
  Modal,
  Fade,
  Grid,
  Chip,
  Checkbox,
  TablePagination,
  Autocomplete,
  TextField,
  Tooltip,
} from "@mui/material";
import {
  StyledTableCell,
  BodyTableCell,
  StyledTableRow,
  StyledPaper,
  StyledTableContainer,
} from "../../../styles/TableStyles";
import ErrorQuestionDetail from "./ErrorQuestionDetail";
import CommonLayout from "../../../layouts/CommonLayout";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CommonBreadcrumbs from "../../../components/CommonBreadcrumbs";
import { getBreadcrumbPaths } from "../../../config/breadcrumbPaths";

const ErrorQuestionList = () => {
  const [errorQuestions, setErrorQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [examOptions, setExamOptions] = useState([]);
  const [selectedExams, setSelectedExams] = useState([]);
  const [errorCountFilter, setErrorCountFilter] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [selectedQuestionDetailUuid, setSelectedQuestionDetailUuid] =
    useState(null);
  const [selectAll, setSelectAll] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const navigate = useNavigate();

  const fetchExamOptions = useCallback(async (inputValue = "") => {
    try {
      const response = await axios.get("/api/exam-names", {
        params: { query: inputValue },
      });
      setExamOptions(response.data.data);
    } catch (error) {
      console.error("获取考试名称失败:", error);
    }
  }, []);

  const fetchErrorQuestions = useCallback(async () => {
    try {
      const params = new URLSearchParams();

      selectedExams.forEach((exam) => {
        params.append("examUuids", exam.uuid);
      });

      params.append("errorThreshold", errorCountFilter);
      params.append("page", page + 1);
      params.append("pageSize", rowsPerPage);

      const response = await axios.get("/api/record/wrong-questions/summary", {
        params: params,
      });

      setErrorQuestions(response.data.data.items);
      setTotalCount(response.data.data.totalCount);
    } catch (error) {
      console.error("获取错题列表失败:", error);
    }
  }, [selectedExams, errorCountFilter, page, rowsPerPage]);

  useEffect(() => {
    fetchExamOptions();
    fetchErrorQuestions();
  }, [fetchExamOptions, fetchErrorQuestions]);

  const handleExamChange = (event, newValue) => {
    setSelectedExams(newValue);
    setPage(0);
  };

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

  const handleViewErrorQuestion = (questionDetailUuid) => {
    setSelectedQuestionDetailUuid(questionDetailUuid);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedQuestionDetailUuid(null);
  };

  // const handleStartPractice = () => {
  //   if (selectedQuestions.length > 0) {
  //     navigate("/error-questions/practice", {
  //       state: { uuids: selectedQuestions },
  //     });
  //   }
  // };

  const handleStartPractice = () => {
    const params = new URLSearchParams();

    selectedExams.forEach((exam) => {
      params.append("examUuids", exam.uuid);
    });

    params.append("errorThreshold", errorCountFilter);
    params.append("page", page + 1);
    params.append("pageSize", rowsPerPage);
    navigate("/error-questions/practice", {
      state: { params: params.toString() },
    });
  };

  const handlePracticeRecord = () => {
    navigate("/error-questions/practice/list");
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const breadcrumbPaths = getBreadcrumbPaths();

  return (
    <CommonLayout
      currentPage="错题列表"
      maxWidth="xl"
      showBreadcrumbs={true}
      BreadcrumbsComponent={() => (
        <CommonBreadcrumbs paths={breadcrumbPaths.errorQuestionList} />
      )}
    >
      <StyledPaper>
        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Grid item xs={12} sm="auto">
            <Autocomplete
              multiple
              options={examOptions}
              getOptionLabel={(option) => option.name}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="考试名称"
                  variant="outlined"
                  size="small"
                />
              )}
              onInputChange={(event, newInputValue) => {
                fetchExamOptions(newInputValue);
              }}
              onChange={handleExamChange}
              value={selectedExams}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option.name}
                    {...getTagProps({ index })}
                    key={option.uuid}
                  />
                ))
              }
              sx={{ minWidth: 200 }}
            />
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
              开始练习
            </Button>
          </Grid>
          <Grid item xs={12} sm="auto">
            <Button
              variant="contained"
              color="primary"
              onClick={handlePracticeRecord}
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
              练习记录
            </Button>
          </Grid>
        </Grid>
        <StyledTableContainer>
          <Table>
            <TableHead>
              <StyledTableRow>
                <StyledTableCell>关联考试</StyledTableCell>
                <StyledTableCell>题目摘要</StyledTableCell>
                <StyledTableCell>题目内容</StyledTableCell>
                <StyledTableCell>错误次数</StyledTableCell>
                <StyledTableCell>操作</StyledTableCell>
              </StyledTableRow>
            </TableHead>
            <TableBody>
              {errorQuestions.map((question) => (
                <StyledTableRow key={question.uuid}>
                  <BodyTableCell>
                    <Tooltip
                      title={question.examInfos
                        .map((info) => info.examName)
                        .join(", ")}
                      arrow
                    >
                      <div
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "200px",
                        }}
                      >
                        {question.examInfos
                          .map((info) => info.examName)
                          .join(", ")}
                      </div>
                    </Tooltip>
                  </BodyTableCell>
                  <BodyTableCell>{question.digest}</BodyTableCell>
                  <BodyTableCell>
                    <Tooltip title={question.question} arrow>
                      <div
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "200px",
                        }}
                      >
                        {question.question}
                      </div>
                    </Tooltip>
                  </BodyTableCell>
                  <BodyTableCell>
                    <Chip
                      label={question.errorCount}
                      color={question.errorCount > 2 ? "error" : "warning"}
                    />
                  </BodyTableCell>
                  <BodyTableCell>
                    <Button
                      variant="outlined"
                      onClick={() =>
                        handleViewErrorQuestion(question.qDetailUuid)
                      }
                    >
                      查看错题
                    </Button>
                  </BodyTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </StyledTableContainer>
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </StyledPaper>
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
            {selectedQuestionDetailUuid && (
              <ErrorQuestionDetail
                questionDetailUuid={selectedQuestionDetailUuid}
                examName={errorQuestions
                  .find((erq) => erq.qDetailUuid === selectedQuestionDetailUuid)
                  .examInfos.map((info) => info.examName)
                  .join(", ")}
              />
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
