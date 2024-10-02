import React from "react";
import {
  Box,
  Container,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import ListAltIcon from "@mui/icons-material/ListAlt";
import PersonIcon from "@mui/icons-material/Person";
import { useMediaQuery, useTheme } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

const ExamMainLayout = ({ children, currentPage, maxWidth = "lg" }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            color="inherit"
            component={RouterLink}
            to="/"
            edge="start"
            sx={{ mr: 2 }}
          >
            <HomeIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            考试系统
          </Typography>
          {isMobile ? (
            <IconButton color="inherit">
              <MenuIcon />
            </IconButton>
          ) : (
            <>
              <Button
                color="inherit"
                component={RouterLink}
                to="/exams/list"
                startIcon={<ListAltIcon />}
              >
                考卷列表
              </Button>
              <Button
                color="inherit"
                component={RouterLink}
                to="/user-center"
                startIcon={<PersonIcon />}
              >
                用户中心
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Toolbar />{" "}
      {/* 这个额外的 Toolbar 用于占位，防止内容被固定的 AppBar 遮挡 */}
      <Container
        maxWidth={maxWidth}
        sx={{
          marginTop: "20px",
          padding: "20px",
          flexGrow: 1,
        }}
      >
        <Typography variant="h4" gutterBottom>
          {currentPage}
        </Typography>
        {children}
      </Container>
    </Box>
  );
};

export default ExamMainLayout;
