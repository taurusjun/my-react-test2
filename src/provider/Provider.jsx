import React from "react";
import QuestionList from "./components/QuestionList";
import { SideBar } from "./components/SideBar";
import { Box, Stack } from "@mui/material";

export const Provider = () => {
  return (
    <Box>
      <Stack
        direction="row"
        spacing={2}
        sx={{
          pr: "5%",
          width: "95%",
        }}
      >
        <SideBar />
        <QuestionList />
      </Stack>
    </Box>
  );
};
