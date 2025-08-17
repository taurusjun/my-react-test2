import React from "react";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/common/ProtectedRoute";
import { routeConfig } from "./routeConfig";
import { UserProvider } from "./contexts/UserContext";
import { USER_ROLES } from "./config/menuItems";
// import theme from "./theme/theme";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    error: {
      main: "#f44336", // 主色
      light: "#e57373", // 浅色
      dark: "#d32f2f", // 深色
    },
    // 添加其他颜色配置
  },
  // 添加其他主题配置
});

function App() {
  return (
    // <ThemeProvider theme={theme}>
    <UserProvider>
      {/* 在这里添加 UserProvider */}
      <Routes>
        {routeConfig.map(
          ({ path, element: Element, protected: isProtected, allowedRoles }) => (
            <Route
              key={path}
              path={path}
              element={
                isProtected ? (
                  <ProtectedRoute allowedRoles={allowedRoles}>
                    <Element />
                  </ProtectedRoute>
                ) : (
                  <Element />
                )
              }
            />
          )
        )}
      </Routes>
    </UserProvider>
    // </ThemeProvider>
  );
}

export default App;
