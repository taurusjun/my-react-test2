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
  TablePagination,
} from "@mui/material";
import {
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  Add as AddIcon,
} from "@mui/icons-material";

const ExamList = () => {
  const [exams, setExams] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchParams, setSearchParams] = useState({ name: "", subject: "" });
  const navigate = useNavigate();

  // ... 获取考试列表的逻辑

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box>
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
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
            setSearchParams({ ...searchParams, subject: e.target.value })
          }
        />
        <Button
          variant="contained"
          startIcon={<SearchIcon />}
          onClick={() => {
            /* 执行搜索 */
          }}
        >
          搜索
        </Button>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/exam/new")}
        >
          创建新考试
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>名称</TableCell>
              <TableCell>科目</TableCell>
              <TableCell>创建时间</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {exams
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((exam) => (
                <TableRow key={exam.uuid}>
                  <TableCell>{exam.name}</TableCell>
                  <TableCell>{exam.subject}</TableCell>
                  <TableCell>{exam.createdAt}</TableCell>
                  <TableCell>
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
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={exams.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
};

export default ExamList;
