import React from "react";
import { Typography, Paper, Container, Box } from "@mui/material";

const Welcome = () => {
  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ padding: 4, marginTop: 4 }}>
        <Box textAlign="center">
          <Typography variant="h3" component="h1" gutterBottom>
            欢迎来到在线考试系统
          </Typography>
          <Typography variant="h5" component="h2" gutterBottom>
            祝您学习愉快，考试顺利！
          </Typography>
          <Typography variant="body1" paragraph>
            在这里，您可以参加各种考试，查看您的考试历史，以及管理您的个人信息。
          </Typography>
          <Typography variant="body1">
            请使用左侧菜单导航到不同的功能页面。如果您有任何问题，随时与我们联系。
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Welcome;
