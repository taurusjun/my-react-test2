import React from "react";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/common/ProtectedRoute";
import { routeConfig } from "./routeConfig";
import { UserProvider } from "./contexts/UserContext"; // 添加这行导入

function App() {
  return (
    <UserProvider>
      {/* 在这里添加 UserProvider */}
      <Routes>
        {routeConfig.map(
          ({ path, element: Element, protected: isProtected }) => (
            <Route
              key={path}
              path={path}
              element={
                isProtected ? (
                  <ProtectedRoute>
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
  );
}

export default App;
