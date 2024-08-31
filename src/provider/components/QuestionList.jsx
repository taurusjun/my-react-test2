import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Stack,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

// 更新模拟数据,使用正确的字段名
const questions = [
  { uuid: "a1b2c3d4", digest: "牛顿第一定律", category: "物理", KN: "力学" },
  { uuid: "e5f6g7h8", digest: "光合作用", category: "生物", KN: "植物生理" },
  // 添加更多问题...
];

const QuestionList = () => {
  const navigate = useNavigate();

  const handleEdit = (uuid) => {
    navigate(`/question-edit/${uuid}`);
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>摘要</TableCell>
            <TableCell>科目</TableCell>
            <TableCell>知识点</TableCell>
            <TableCell align="right">操作</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {questions.map((question) => (
            <TableRow key={question.uuid}>
              <TableCell>{question.digest}</TableCell>
              <TableCell>{question.category}</TableCell>
              <TableCell>{question.KN}</TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleEdit(question.uuid)}
                  >
                    编辑
                  </Button>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default QuestionList;
