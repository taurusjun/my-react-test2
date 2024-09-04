import React from "react";
import { Box, Container } from "@mui/material";
import ExamBreadcrumbs from "./ExamBreadcrumbs";

const ExamMainLayout = ({ children, currentPage, maxWidth = "lg" }) => {
  return (
    <Box sx={{ width: "100%" }}>
      <ExamBreadcrumbs currentPage={currentPage} />
      <Container
        maxWidth={maxWidth}
        sx={{
          marginTop: "64px", // 调整这个值以匹配面包屑导航的高度
          padding: "20px",
        }}
      >
        {children}
      </Container>
    </Box>
  );
};

export default ExamMainLayout;
