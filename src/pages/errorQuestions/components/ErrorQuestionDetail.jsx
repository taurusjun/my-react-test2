import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Typography,
  Box,
  CircularProgress,
  Paper,
  Divider,
} from "@mui/material";
import { useDictionaries } from "../../../provider/hooks/useDictionaries";
import ErrorQuestionDisplay from "./ErrorQuestionDisplay";

const ErrorQuestionDetail = ({ questionDetailUuid, examName }) => {
  const { dictionaries } = useDictionaries();
  const [questionDetail, setQuestionDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuestionDetail = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `/api/question-details/${questionDetailUuid}/error-explanation`
        );
        setQuestionDetail(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error("获取错题详情失败:", err);
        setError("获取错题详情失败，请稍后重试。");
        setLoading(false);
      }
    };

    fetchQuestionDetail();
  }, [questionDetailUuid]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="300px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="300px"
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!questionDetail) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="300px"
      >
        <Typography>未找到错题详情。</Typography>
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom color="primary">
        {examName}
      </Typography>
      <Divider sx={{ my: 2 }} />
      <ErrorQuestionDisplay
        questionDetail={questionDetail}
        dictionaries={dictionaries}
      />
    </Paper>
  );
};

export default ErrorQuestionDetail;
