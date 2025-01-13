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
import { useParams } from "react-router-dom";
import CommonLayout from "../../../layouts/CommonLayout";
import { getBreadcrumbPaths } from "../../../config/breadcrumbPaths";
import CommonBreadcrumbs from "../../../components/CommonBreadcrumbs";

const ErrorQuestionPracticeDetails = () => {
  const { uuid } = useParams();
  const { dictionaries } = useDictionaries();
  const [questionDetails, setQuestionDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuestionDetail = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `/api/record/${uuid}/error-explanation-list`
        );
        setQuestionDetails(response.data.data.items);
        setLoading(false);
      } catch (err) {
        console.error("获取错题详情失败:", err);
        setError("获取错题详情失败，请稍后重试。");
        setLoading(false);
      }
    };

    fetchQuestionDetail();
  }, [uuid]);

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

  if (!questionDetails || questionDetails.length === 0) {
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

  const breadcrumbPaths = getBreadcrumbPaths();

  return (
    <CommonLayout
      currentPage="错题强化"
      maxWidth="xl"
      showBreadcrumbs={true}
      BreadcrumbsComponent={() => (
        <CommonBreadcrumbs
          paths={breadcrumbPaths.errorQuestionPracticeDetails}
        />
      )}
    >
      <Paper
        elevation={3}
        sx={{ p: 3, bgcolor: "#f5f5f5", borderRadius: "8px" }}
      >
        <Typography variant="h5" gutterBottom color="primary" align="center">
          错题详情
        </Typography>
        {questionDetails.map((questionDetail) => (
          <>
            <Divider sx={{ my: 2 }} />
            <Box key={questionDetail.uuid} sx={{ mb: 2 }}>
              <ErrorQuestionDisplay
                questionDetail={questionDetail}
                dictionaries={dictionaries}
              />
            </Box>
          </>
        ))}
      </Paper>
    </CommonLayout>
  );
};

export default ErrorQuestionPracticeDetails;
