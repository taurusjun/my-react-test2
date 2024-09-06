import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./mocks/setupMocks";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";
import { getToken } from "./utils/auth";

// 设置 axios 拦截器
axios.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  // <React.StrictMode>
  //   <App />
  // </React.StrictMode>
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
