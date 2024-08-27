import React from "react";
import QuestionEdit from "./components/QuestionEdit";
import { SideBar } from "./components/SideBar";
import { Box, Stack } from "@mui/material";

export const Provider = () => {
  return (
    <Box>
      <Stack
        direction="row"
        spacing={2}
        sx={{
          pr: "5%", // 添加右侧 5% 的空白
          width: "95%", // 设置 Stack 宽度为 95%
        }}
      >
        <SideBar />
        <QuestionEdit />
      </Stack>
    </Box>
  );
};
