import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  components: {
    MuiSelect: {
      styleOverrides: {
        select: {
          paddingTop: "8px",
          paddingBottom: "8px",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiInputBase-input": {
            paddingTop: "8px",
            paddingBottom: "8px",
          },
        },
      },
    },
    // 可以在这里添加更多全局组件样式覆盖
  },
});

export default theme;
