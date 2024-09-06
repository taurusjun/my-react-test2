import React from "react";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/common/ProtectedRoute";
import { routeConfig } from "./routeConfig";

function App() {
  return (
    <Routes>
      {routeConfig.map(({ path, element: Element, protected: isProtected }) => (
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
      ))}
    </Routes>
  );
}

export default App;
