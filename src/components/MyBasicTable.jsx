import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

export const MyBasicTable = (props) => {
  const { dataList } = props;
  const navigate = useNavigate();
  // const handleOnClick = (uuid) => navigate(`/exam/${uuid}`);
  // const labelId = `No.${kk}`;

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 100 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>编号</TableCell>
            <TableCell align="center">名称</TableCell>
            <TableCell align="center">描述</TableCell>
            <TableCell align="center">分类</TableCell>
            <TableCell align="center">状态</TableCell>
            <TableCell align="center">得分</TableCell>
            <TableCell align="center">多次最高得分</TableCell>
            <TableCell align="center">动作</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {dataList.map((row) => (
            <TableRow
              key={row.uuid}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {row.exam_uuid}
              </TableCell>
              <TableCell align="center">{row.exam_name}</TableCell>
              <TableCell align="center">{row.exam_description}</TableCell>
              <TableCell align="center">{row.exam_category_name}</TableCell>
              <TableCell align="center">
                {row.is_done ? "已完成" : "未完成"}
              </TableCell>
              <TableCell align="center">{row.score}</TableCell>
              <TableCell align="center">{row.max_score}</TableCell>
              <TableCell align="center">
                <Button
                  variant="contained"
                  href={`/exam/${row.exam_uuid}`}
                  endIcon={<SendIcon />}
                >
                  开始考试
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
