import React, { useState, useEffect } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
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
  Typography,
  TablePagination,
} from "@mui/material";
import {
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import axios from "axios";
import { styled, alpha } from "@mui/material/styles";
import CommonLayout from "../../../layouts/CommonLayout";
import CommonBreadcrumbs from "../../../components/CommonBreadcrumbs";
import { getBreadcrumbPaths } from "../../../config/breadcrumbPaths";

// 添加以下样式组件
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.info.light, 0.1),
  color: theme.palette.common.black,
  fontSize: 18,
  fontWeight: "bold",
}));

const BodyTableCell = styled(TableCell)(({ theme }) => ({
  fontSize: 16,
}));

// 添加新的样式组件
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[3],
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  overflow: "hidden",
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  textTransform: "none",
  fontWeight: "bold",
}));

const ExamList = () => {
  const [exams, setExams] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchParams, setSearchParams] = useState({ name: "", category: "" });
  const navigate = useNavigate();

  useEffect(() => {
    fetchExams();
  }, [page, rowsPerPage, searchParams]);

  const fetchExams = async () => {
    try {
      const response = await axios.get("/api/exam/list", {
        params: {
          page: page + 1,
          pageSize: rowsPerPage,
          name: searchParams.name,
          category: searchParams.category,
        },
      });
      setExams(response.data.exams);
    } catch (error) {
      console.error("获取考试列表失败:", error);
      // 这里可以添加错误处理，比如显示一个错误提示
    }
  };

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const breadcrumbPaths = getBreadcrumbPaths();

  const rightNavItems = [];

  return (
    <CommonLayout
      currentPage="考试列表"
      maxWidth="xl"
      rightNavItems={rightNavItems}
      showBreadcrumbs={true}
      BreadcrumbsComponent={() => (
        <CommonBreadcrumbs paths={breadcrumbPaths.examList} />
      )}
    >
      <StyledPaper elevation={0}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            考试列表
          </Typography>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <TextField
              label="搜索名称"
              variant="outlined"
              size="small"
              onChange={(e) =>
                setSearchParams({ ...searchParams, name: e.target.value })
              }
            />
            <TextField
              label="搜索科目"
              variant="outlined"
              size="small"
              onChange={(e) =>
                setSearchParams({ ...searchParams, category: e.target.value })
              }
            />
            <StyledButton
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={fetchExams}
            >
              搜索
            </StyledButton>
            <StyledButton
              variant="contained"
              color="secondary"
              startIcon={<AddIcon />}
              onClick={() => navigate("/exam/new")}
            >
              创建考试
            </StyledButton>
          </Box>
        </Box>
        <StyledTableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <StyledTableCell>名称</StyledTableCell>
                <StyledTableCell>科目</StyledTableCell>
                <StyledTableCell>创建时间</StyledTableCell>
                <StyledTableCell align="center">操作</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {exams
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((exam) => (
                  <TableRow key={exam.uuid}>
                    <BodyTableCell>{exam.name}</BodyTableCell>
                    <BodyTableCell>{exam.category}</BodyTableCell>
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
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </StyledTableContainer>
        <TablePagination
          component="div"
          count={exams.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ mt: 2 }}
        />
      </StyledPaper>
    </CommonLayout>
  );
};

export default ExamList;
