import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { Breadcrumbs, Link, Typography } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";

const CommonBreadcrumbs = ({ paths }) => {
  return (
    <Breadcrumbs aria-label="breadcrumb">
      <Link
        component={RouterLink}
        to="/"
        color="inherit"
        sx={{ display: "flex", alignItems: "center" }}
      >
        <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
        首页
      </Link>
      {paths.map((path, index) =>
        index === paths.length - 1 ? (
          <Typography key={path.name} color="text.primary">
            {path.name}
          </Typography>
        ) : (
          <Link
            key={path.name}
            component={RouterLink}
            to={path.url}
            color="inherit"
          >
            {path.name}
          </Link>
        )
      )}
    </Breadcrumbs>
  );
};

export default CommonBreadcrumbs;
