import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableHead,
  TableRow,
  Button,
  Box,
  TablePagination,
  Autocomplete,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Dialog,
  DialogContent,
} from "@mui/material";
import {
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  RestartAlt as RestartAltIcon,
} from "@mui/icons-material";
import {
  StyledTableCell,
  BodyTableCell,
  StyledTableRow,
  StyledPaper,
  StyledTableContainer,
} from "../../../styles/TableStyles";
import axios from "axios";
import CommonLayout from "../../../layouts/CommonLayout";
import CommonBreadcrumbs from "../../../components/CommonBreadcrumbs";
import { getBreadcrumbPaths } from "../../../config/breadcrumbPaths";
import { CategoryDict } from "../../../provider/utils/dictionaries";
import { styled } from "@mui/material/styles";
import NewExam from "./new"; // 确保导入NewExam组件

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  textTransform: "none",
  fontWeight: "bold",
}));

const ExamList = () => {
  const [exams, setExams] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [examOptions, setExamOptions] = useState([]);
  const [selectedExams, setSelectedExams] = useState([]);
  const [category, setCategory] = useState("");
  const navigate = useNavigate();
  const [openNewExamDialog, setOpenNewExamDialog] = useState(false);

  const fetchExamOptions = useCallback(async (inputValue = "") => {
    try {
      const response = await axios.get("/api/exam-names", {
        params: { query: inputValue },
      });
      setExamOptions(response.data);
    } catch (error) {
      console.error("获取考试名称失败:", error);
    }
  }, []);

  const fetchExams = useCallback(async () => {
    try {
      const response = await axios.get("/api/exam/list", {
        params: {
          page: page + 1,
          pageSize: rowsPerPage,
          examUuids: selectedExams.map((exam) => exam.uuid),
          category,
        },
      });
      setExams(response.data.exams);
      setTotalCount(response.data.totalCount);
    } catch (error) {
      console.error("获取考试列表失败:", error);
    }
  }, [page, rowsPerPage, selectedExams, category]);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  useEffect(() => {
    fetchExamOptions();
  }, [fetchExamOptions]);

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleExamChange = (event, newValue) => {
    setSelectedExams(newValue);
    setPage(0);
  };

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
    setPage(0);
  };

  const handleResetSearch = () => {
    setSelectedExams([]);
    setCategory("");
    setPage(0);
    fetchExamOptions();
    fetchExams();
  };

  const handleCreateExam = () => {
    setOpenNewExamDialog(true);
  };

  const handleCloseNewExamDialog = () => {
    setOpenNewExamDialog(false);
  };

  const handleExamCreated = (newExamUuid) => {
    setOpenNewExamDialog(false);
    if (newExamUuid) {
      navigate(`/exam/edit/${newExamUuid}`);
    }
    // 可能需要刷新考试列表
    fetchExams();
  };

  const breadcrumbPaths = getBreadcrumbPaths();

  return (
    <CommonLayout
      currentPage="考试列表"
      maxWidth="xl"
      showBreadcrumbs={true}
      BreadcrumbsComponent={() => (
        <CommonBreadcrumbs paths={breadcrumbPaths.examList} />
      )}
    >
      <StyledPaper elevation={0}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexWrap: "wrap",
              alignItems: "flex-start",
            }}
          >
            <StyledButton
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleCreateExam}
            >
              创建考试
            </StyledButton>
            <StyledButton
              variant="contained"
              color="secondary"
              startIcon={<RestartAltIcon />}
              onClick={handleResetSearch}
            >
              重置搜索
            </StyledButton>
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
              sx={{ width: 300 }}
              loading={examOptions.length === 0}
              loadingText="加载中..."
              noOptionsText="没有匹配的考试"
            />
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>科目</InputLabel>
              <Select
                value={category}
                onChange={handleCategoryChange}
                label="科目"
              >
                <MenuItem value="">全部</MenuItem>
                {Object.entries(CategoryDict).map(([key, value]) => (
                  <MenuItem key={key} value={key}>
                    {value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
        <StyledTableContainer>
          <Table>
            <TableHead>
              <StyledTableRow>
                <StyledTableCell>名称</StyledTableCell>
                <StyledTableCell>科目</StyledTableCell>
                <StyledTableCell>创建时间</StyledTableCell>
                <StyledTableCell align="center">操作</StyledTableCell>
              </StyledTableRow>
            </TableHead>
            <TableBody>
              {exams.map((exam) => (
                <StyledTableRow key={exam.uuid}>
                  <BodyTableCell>{exam.name}</BodyTableCell>
                  <BodyTableCell>{CategoryDict[exam.category]}</BodyTableCell>
                  <BodyTableCell>{exam.createdAt}</BodyTableCell>
                  <BodyTableCell align="center">
                    <Button
                      startIcon={<EditIcon />}
                      onClick={() => navigate(`/exam/edit/${exam.uuid}`)}
                    >
                      编辑
                    </Button>
                    <Button
                      startIcon={<VisibilityIcon />}
                      onClick={() => navigate(`/exam/view/${exam.uuid}`)}
                    >
                      查看
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
          sx={{ mt: 2 }}
        />
      </StyledPaper>

      <Dialog
        open={openNewExamDialog}
        onClose={handleCloseNewExamDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          <NewExam onExamCreated={handleExamCreated} />
        </DialogContent>
      </Dialog>
    </CommonLayout>
  );
};

export default ExamList;
