import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const FileCorrectionList = () => {
  const [files, setFiles] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFiles = async () => {
      const response = await axios.get("/api/file-corrections", {
        params: { page: page + 1, pageSize: rowsPerPage },
      });
      setFiles(response.data.files);
      setTotalCount(response.data.totalCount);
    };
    fetchFiles();
  }, [page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>文件名</TableCell>
              <TableCell>创建时间</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {files.map((file) => (
              <TableRow key={file.uuid}>
                <TableCell>{file.name}</TableCell>
                <TableCell>
                  {new Date(file.createdAt).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    onClick={() => navigate(`/file-correction/${file.uuid}`)}
                  >
                    校正
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={totalCount}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
};

export default FileCorrectionList;
