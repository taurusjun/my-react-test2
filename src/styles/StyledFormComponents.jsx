import React from "react";
import { Select, TextField } from "@mui/material";
import { styled } from "@mui/material/styles";

export const StyledSelect = styled(Select)(({ theme }) => ({
  "& .MuiSelect-select": {
    paddingTop: "8px",
    paddingBottom: "8px",
  },
}));

export const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiInputBase-input": {
    paddingTop: "8px",
    paddingBottom: "8px",
  },
}));

// 如果需要，可以在这里添加更多自定义组件
