import React from "react";
import QuestionEdit from "./components/QuestionEdit";
import { SideBar } from "./components/SideBar";
import { Box, Stack } from "@mui/material";

export const Provider = () => {
  return (
    <Box>
      <Stack direction="row" spacing={2} justifyContent="space-between">
        <SideBar />
        <QuestionEdit />
      </Stack>
    </Box>
  );
};
