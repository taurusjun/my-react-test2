import React from "react";
import { Link } from "react-router-dom";
import { Breadcrumbs, Typography } from "@mui/material";

const QuestionBreadcrumbs = ({ currentPage }) => {
  return (
    <Breadcrumbs aria-label="breadcrumb" sx={{ m: 2 }}>
      <Link
        to="/dashboard"
        style={{ textDecoration: "none", color: "inherit" }}
      >
        首页
      </Link>
      <Link
        to="/questions"
        style={{ textDecoration: "none", color: "inherit" }}
      >
        题目列表
      </Link>
      <Typography color="text.primary">{currentPage}</Typography>
    </Breadcrumbs>
  );
};

export default QuestionBreadcrumbs;
