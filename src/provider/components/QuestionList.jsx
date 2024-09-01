import React, { useState, useEffect } from "react";
import QuestionMainLayout from "../layouts/QuestionMainLayout"; // 确保路径正确
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
  TablePagination,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // 确保已安装 axios
import { styled, alpha } from "@mui/material/styles";
import { format } from "date-fns"; // 导入 date-fns 库来格式化日期
import { useDictionaries } from "../hooks/useDictionaries"; // 确保正确导入
import Autocomplete from "@mui/material/Autocomplete";
import Chip from "@mui/material/Chip";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.info.light, 0.1),
  color: theme.palette.common.black,
  fontSize: 18, // 增加表头文字大小
  fontWeight: "bold",
}));

const BodyTableCell = styled(TableCell)(({ theme }) => ({
  fontSize: 16,
}));

const QuestionList = () => {
  const navigate = useNavigate();
  const [searchType, setSearchType] = useState("digest");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [questions, setQuestions] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const { dictionaries, loading, error } = useDictionaries();
  const [inputValue, setInputValue] = useState(""); // 添加 inputValue 状态
  const [relatedSourceOptions, setRelatedSourceOptions] = useState([]); // 添加 relatedSourceOptions 状态

  const [searchParams, setSearchParams] = useState({
    category: "",
    kn: "",
    type: "",
    relatedSources: [], // 添加 relatedSources 字段
  });

  const handleRelatedSourcesChange = (event, newValue) => {
    setSearchParams((prevParams) => ({
      ...prevParams,
      relatedSources: newValue,
    }));
  };

  const handleInputChange = (event, newInputValue) => {
    setInputValue(newInputValue);
    fetchRelatedSourceOptions(newInputValue);
  };

  const fetchRelatedSourceOptions = async (input) => {
    try {
      const response = await axios.get("/api/related-sources", {
        params: { query: input },
      });
      setRelatedSourceOptions(response.data);
    } catch (error) {
      console.error("获取关联资源选项时出错:", error);
    }
  };

  useEffect(() => {
    fetchQuestions();
    fetchRelatedSourceOptions(""); // 初始化时获取关联资源选项
  }, [
    page,
    rowsPerPage,
    selectedCategory,
    searchType,
    searchTerm,
    searchParams.relatedSources,
  ]);

  const fetchQuestions = async () => {
    try {
      const response = await axios.get("/api/questionlist", {
        params: {
          category: selectedCategory,
          searchType: searchType,
          searchTerm: searchTerm,
          page: page + 1, // 后端通常从1开始计数
          pageSize: rowsPerPage,
          relatedSources: searchParams.relatedSources.map(
            (source) => source.uuid
          ), // 添加关联资源参数
        },
      });
      setQuestions(response.data.items);
      setTotalCount(response.data.totalCount);
    } catch (error) {
      console.error("获取问题列表时出错:", error);
      // 这里可以添加错误处理，比如显示一个错误提示
    }
  };

  if (loading) return <div>加载中...</div>;
  if (error) return <div>加载失败</div>;

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleNewQuestion = () => {
    navigate("/question-edit"); // 假设新建问题的路由是 "/new-question"
  };

  const handleResetSearch = () => {
    setSearchType("digest");
    setSearchTerm("");
    setSelectedCategory("");
    setPage(0);
  };

  const handleEdit = (uuid) => {
    navigate(`/question-edit/${uuid}`); // 假设编辑问题的路由是 "/edit-question/:uuid"
  };

  return (
    <QuestionMainLayout currentPage="题目列表" maxWidth="xl">
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
          onClick={handleResetSearch}
          sx={{ width: "200px", height: "56px" }} // 调整按钮的宽度和高度
        >
          重置搜索
        </Button>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>科目</InputLabel>
          <Select
            value={selectedCategory}
            label="科目"
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <MenuItem value="">全部</MenuItem>
            {Object.entries(dictionaries.CategoryDict).map(([key, value]) => (
              <MenuItem key={key} value={key}>
                {value}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ flex: 1 }}>
          <Autocomplete
            multiple
            id="related-sources"
            options={relatedSourceOptions}
            value={searchParams.relatedSources}
            onChange={handleRelatedSourcesChange}
            onInputChange={handleInputChange}
            inputValue={inputValue}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option.uuid === value.uuid}
            renderInput={(params) => (
              <TextField
                {...params}
                label="关联资源"
                placeholder="选择相关试卷或书籍"
                variant="standard"
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  label={option.name}
                  {...getTagProps({ index })}
                  key={option.uuid}
                />
              ))
            }
          />
        </FormControl>
        <FormControl sx={{ minWidth: 140 }}>
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
          sx={{ flex: 2 }} // 设置搜索摘要的宽度为关联资源的两倍
        />
      </Stack>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>摘要</StyledTableCell>
              <StyledTableCell>科目</StyledTableCell>
              <StyledTableCell>知识点</StyledTableCell>
              <StyledTableCell>更新时间</StyledTableCell>
              <StyledTableCell>关联资源</StyledTableCell>
              <StyledTableCell align="center">操作</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {questions.map((question) => (
              <TableRow key={question.uuid}>
                <BodyTableCell>{question.digest}</BodyTableCell>
                <BodyTableCell>
                  {dictionaries.CategoryDict[question.category]}
                </BodyTableCell>
                <BodyTableCell>{question.KN}</BodyTableCell>
                <BodyTableCell>
                  {format(new Date(question.updatedAt), "yyyy-MM-dd HH:mm:ss")}
                </BodyTableCell>
                <BodyTableCell>
                  {question.relatedSources
                    .map((source) => source.name)
                    .join(", ")}
                </BodyTableCell>
                <BodyTableCell align="center">
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleEdit(question.uuid)}
                  >
                    编辑
                  </Button>
                </BodyTableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="每页行数:"
          labelDisplayedRows={({ from, to, count, page }) =>
            `第 ${page + 1} 页，${from}-${to} 共 ${count}`
          }
        />
      </TableContainer>
    </QuestionMainLayout>
  );
};

export default QuestionList;
