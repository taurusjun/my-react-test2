import React from "react";
import { Link } from "react-router-dom";
import { Breadcrumbs, Typography, Box } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";

const ExamBreadcrumbs = ({ currentPage }) => {
  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        backgroundColor: "white",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        padding: "10px 20px",
      }}
    >
      <Breadcrumbs aria-label="breadcrumb">
        <Link
          to="/dashboard"
          style={{
            textDecoration: "none",
            color: "#1976d2",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
          }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          首页
        </Link>
        <Link
          to="/exams/list"
          style={{
            textDecoration: "none",
            color: "#1976d2",
            fontWeight: "bold",
          }}
        >
          考试列表
        </Link>
        <Typography color="#1976d2" fontWeight="bold">
          {currentPage}
        </Typography>
      </Breadcrumbs>
    </Box>
  );
};

export default ExamBreadcrumbs;
