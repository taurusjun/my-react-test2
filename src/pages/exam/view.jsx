import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Typography, Box, CircularProgress, Paper } from "@mui/material";

const ViewExam = () => {
  const { uuid } = useParams();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 从后端获取考试数据
    // setExam(fetchedData);
    // setLoading(false);
  }, [uuid]);

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Paper sx={{ p: 2, maxWidth: 600, mx: "auto", mt: 2 }}>
      <Typography variant="h5" gutterBottom>
        考试详情
      </Typography>
      <Box sx={{ mt: 2 }}>
        <Typography>
          <strong>名称:</strong> {exam?.name}
        </Typography>
        <Typography>
          <strong>科目:</strong> {exam?.category}
        </Typography>
        <Typography>
          <strong>阶段:</strong> {exam?.stage}
        </Typography>
        <Typography>
          <strong>创建时间:</strong> {exam?.createdAt}
        </Typography>
        {/* 添加更多考试详情字段 */}
      </Box>
    </Paper>
  );
};

export default ViewExam;
