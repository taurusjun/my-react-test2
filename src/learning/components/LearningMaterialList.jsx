import React, { useState } from "react";
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
} from "@mui/material";
import { useDictionaries } from "../../provider/hooks/useDictionaries";

const LearningMaterialList = ({ materials, onStartLearning }) => {
  const [searchParams, setSearchParams] = useState({
    name: "",
    subject: "",
    stage: "",
  });
  const { dictionaries } = useDictionaries();

  // 实现搜索逻辑

  return (
    <Box>
      {/* 搜索组件 */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>资料名称</TableCell>
              <TableCell>学科</TableCell>
              <TableCell>阶段</TableCell>
              <TableCell>出版时间</TableCell>
              <TableCell>上次学习时间</TableCell>
              <TableCell>学习状态</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>{/* 渲染学习资料列表 */}</TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default LearningMaterialList;
