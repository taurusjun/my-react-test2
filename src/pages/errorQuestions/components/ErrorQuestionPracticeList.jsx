import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TablePagination,
} from "@mui/material";
import {
  StyledTableCell,
  StyledTableRow,
  BodyTableCell,
  StyledTableContainer,
} from "../../../styles/TableStyles";
import CommonBreadcrumbs from "../../../components/CommonBreadcrumbs";
import { getBreadcrumbPaths } from "../../../config/breadcrumbPaths";
import axios from "axios";
import CommonLayout from "../../../layouts/CommonLayout";

import { useNavigate } from "react-router-dom";

const ErrorQuestionPracticeList = () => {
  const [practices, setPractices] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const navigate = useNavigate();

  const fetchPracticeList = async () => {
    try {
      const response = await axios.get("/api/record/practice-list", {
        params: { page: page + 1, pageSize: rowsPerPage },
      });
      setPractices(response.data.data.items);
      setTotalCount(response.data.data.totalCount);
    } catch (error) {
      console.error("获取练习列表失败:", error);
    }
  };

  useEffect(() => {
    fetchPracticeList();
  }, [page, rowsPerPage]);

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
      currentPage="练习列表"
      maxWidth="xl"
      showBreadcrumbs={true}
      BreadcrumbsComponent={() => (
        <CommonBreadcrumbs paths={breadcrumbPaths.errorQuestionPracticeList} />
      )}
    >
      <StyledTableContainer>
        <Table>
          <TableHead>
            <StyledTableRow>
              <StyledTableCell>序号</StyledTableCell>
              <StyledTableCell>练习时间</StyledTableCell>
              <StyledTableCell>练习题数</StyledTableCell>
              <StyledTableCell>详情</StyledTableCell>
            </StyledTableRow>
          </TableHead>
          <TableBody>
            {practices.map((practice, index) => (
              <StyledTableRow key={practice.userExamUuid}>
                <BodyTableCell>{page * rowsPerPage + index + 1}</BodyTableCell>
                <BodyTableCell>
                  {new Date(practice.practiceTime).toLocaleString()}
                </BodyTableCell>
                <BodyTableCell>{practice.count}</BodyTableCell>
                <BodyTableCell>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      navigate(
                        `/error-questions/practice/${practice.userExamUuid}`
                      );
                    }}
                  >
                    查看详情
                  </Button>
                </BodyTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </StyledTableContainer>
    </CommonLayout>
  );
};

export default ErrorQuestionPracticeList;
