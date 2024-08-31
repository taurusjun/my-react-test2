import React, { useState, useEffect } from "react";
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
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // 确保已安装 axios

// 更新模拟数据,使用正确的字段名
const questions = [
  { uuid: "a1b2c3d4", digest: "牛顿第一定律", category: "物理", KN: "力学" },
  { uuid: "e5f6g7h8", digest: "光合作用", category: "生物", KN: "植物生理" },
  // 添加更多问题...
];

const QuestionList = () => {
  const navigate = useNavigate();
  const [searchType, setSearchType] = useState("digest");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [questions, setQuestions] = useState([]);

  const handleEdit = (uuid) => {
    navigate(`/question-edit/${uuid}`);
  };

  const handleNewQuestion = () => {
    navigate("/question-edit");
  };

  const handleSearch = async () => {
    try {
      const response = await axios.get("/api/questionlist", {
        params: {
          category: selectedCategory,
          searchType: searchType,
          searchTerm: searchTerm,
        },
      });
      setQuestions(response.data);
    } catch (error) {
      console.error("Error fetching questions:", error);
      // 这里可以添加错误处理，比如显示一个错误提示
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleNewQuestion}
          sx={{ width: "200px", height: "56px" }} // 调整按钮的宽度和高度
        >
          新建问题
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleSearch}
          sx={{ width: "200px", height: "56px" }} // 调整按钮的宽度和高度
        >
          搜索问题
        </Button>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>科目</InputLabel>
          <Select
            value={selectedCategory}
            label="科目"
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <MenuItem value="">全部</MenuItem>
            <MenuItem value="物理">物理</MenuItem>
            <MenuItem value="生物">生物</MenuItem>
            {/* 添加更多科目选项 */}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>搜索类型</InputLabel>
          <Select
            value={searchType}
            label="搜索类型"
            onChange={(e) => setSearchType(e.target.value)}
          >
            <MenuItem value="digest">摘要</MenuItem>
            <MenuItem value="knowledge">知识点</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label={searchType === "digest" ? "搜索摘要" : "搜索知识点"}
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
        />
      </Stack>
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
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleEdit(question.uuid)}
                  >
                    编辑
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default QuestionList;
