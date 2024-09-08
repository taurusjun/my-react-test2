import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableHead,
  TableRow,
  CircularProgress,
  TextField,
  MenuItem,
  TablePagination,
} from "@mui/material";
import CommonLayout from "../../layouts/CommonLayout";
import CommonBreadcrumbs from "../../components/CommonBreadcrumbs";
import { getBreadcrumbPaths } from "../../config/breadcrumbPaths";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import {
  StyledTableCell,
  BodyTableCell,
  StyledTableRow,
  StyledPaper,
  StyledTableContainer,
} from "../../styles/TableStyles";
import { useDictionaries } from "../../provider/hooks/useDictionaries";

const LearningMaterialListPage = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchParams, setSearchParams] = useState({
    name: "",
    category: "",
    school: "",
    grade: "",
  });
  const navigate = useNavigate();
  const { dictionaries } = useDictionaries();

  useEffect(() => {
    fetchMaterials();
  }, [page, pageSize, searchParams]);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/learning-materials", {
        params: {
          page,
          pageSize,
          ...searchParams,
        },
      });
      setMaterials(response.data.materials);
      setTotalCount(response.data.totalCount);
    } catch (error) {
      console.error("获取学习资料列表时出错:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartLearning = (materialUuid) => {
    navigate(`/learning/${materialUuid}`);
  };

  const handleSearchChange = (event) => {
    const { name, value } = event.target;
    setSearchParams((prev) => {
      const newParams = { ...prev, [name]: value };
      if (name === "school") {
        newParams.grade = ""; // 重置年级
      }
      return newParams;
    });
    setPage(1); // 重置页码
  };

  const breadcrumbPaths = getBreadcrumbPaths();

  const content = (
    <Box>
      <Box display="flex" flexWrap="wrap" alignItems="center" mb={2}>
        <TextField
          label="资料名称"
          name="name"
          value={searchParams.name}
          onChange={handleSearchChange}
          size="small"
          sx={{ mr: 1, mb: 1, minWidth: 200 }}
        />
        <TextField
          select
          label="学科"
          name="category"
          value={searchParams.category}
          onChange={handleSearchChange}
          size="small"
          sx={{ mr: 1, mb: 1, minWidth: 120 }}
        >
          <MenuItem value="">全部</MenuItem>
          {Object.entries(dictionaries.CategoryDict).map(([key, value]) => (
            <MenuItem key={key} value={key}>
              {value}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="学习阶段"
          name="school"
          value={searchParams.school}
          onChange={handleSearchChange}
          size="small"
          sx={{ mr: 1, mb: 1, minWidth: 120 }}
        >
          <MenuItem value="">全部</MenuItem>
          {Object.entries(dictionaries.SchoolDict).map(([key, value]) => (
            <MenuItem key={key} value={key}>
              {value}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="年级"
          name="grade"
          value={searchParams.grade}
          onChange={handleSearchChange}
          size="small"
          sx={{ mb: 1, minWidth: 120 }}
          disabled={!searchParams.school}
        >
          <MenuItem value="">全部</MenuItem>
          {searchParams.school &&
            dictionaries.SchoolGradeMapping[searchParams.school].map(
              (grade) => (
                <MenuItem key={grade} value={grade}>
                  {dictionaries.GradeDict[grade]}
                </MenuItem>
              )
            )}
        </TextField>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : materials.length === 0 ? (
        <StyledPaper elevation={3} sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="h6">暂无学习资料</Typography>
          <Typography variant="body2" color="textSecondary">
            当有新的学习资料时，将会显示在这里。
          </Typography>
        </StyledPaper>
      ) : (
        <>
          <StyledTableContainer>
            <Table>
              <TableHead>
                <StyledTableRow>
                  <StyledTableCell>资料名称</StyledTableCell>
                  <StyledTableCell>学科</StyledTableCell>
                  <StyledTableCell>学习阶段</StyledTableCell>
                  <StyledTableCell>年级</StyledTableCell>
                  <StyledTableCell>出版时间</StyledTableCell>
                  <StyledTableCell>上次学习时间</StyledTableCell>
                  <StyledTableCell>学习状态</StyledTableCell>
                  <StyledTableCell>操作</StyledTableCell>
                </StyledTableRow>
              </TableHead>
              <TableBody>
                {materials.map((material) => (
                  <StyledTableRow key={material.uuid}>
                    <BodyTableCell>{material.name}</BodyTableCell>
                    <BodyTableCell>
                      {dictionaries.CategoryDict[material.category]}
                    </BodyTableCell>
                    <BodyTableCell>
                      {dictionaries.SchoolDict[material.gradeInfo.school]}
                    </BodyTableCell>
                    <BodyTableCell>
                      {dictionaries.GradeDict[material.gradeInfo.grade]}
                    </BodyTableCell>
                    <BodyTableCell>{material.publishDate}</BodyTableCell>
                    <BodyTableCell>
                      {material.lastStudyDate || "未开始"}
                    </BodyTableCell>
                    <BodyTableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          color:
                            material.status === "未开始"
                              ? "warning.main"
                              : "success.main",
                          fontWeight: "bold",
                        }}
                      >
                        {material.status}
                      </Typography>
                    </BodyTableCell>
                    <BodyTableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleStartLearning(material.uuid)}
                        startIcon={<PlayArrowIcon />}
                      >
                        {material.status === "未开始" ? "开始学习" : "继续学习"}
                      </Button>
                    </BodyTableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </StyledTableContainer>
          <Box mt={2} display="flex" justifyContent="flex-end">
            <TablePagination
              component="div"
              count={totalCount}
              page={page - 1}
              onPageChange={(event, newPage) => setPage(newPage + 1)}
              rowsPerPage={pageSize}
              onRowsPerPageChange={(event) => {
                setPageSize(parseInt(event.target.value, 10));
                setPage(1);
              }}
              labelRowsPerPage="每页行数"
            />
          </Box>
        </>
      )}
    </Box>
  );

  return (
    <CommonLayout
      currentPage="学习资料列表"
      maxWidth="lg"
      showBreadcrumbs={true}
      BreadcrumbsComponent={() => (
        <CommonBreadcrumbs paths={breadcrumbPaths.learningMaterialList} />
      )}
    >
      <StyledPaper>{content}</StyledPaper>
    </CommonLayout>
  );
};

export default LearningMaterialListPage;
