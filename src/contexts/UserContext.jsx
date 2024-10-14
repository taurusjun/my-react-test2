import React, { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user"); // 从本地存储获取用户信息
    if (storedUser) {
      setUser(JSON.parse(storedUser)); // 如果存在，则解析并设置用户信息
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    // 可以在这里添加将用户信息保存到本地存储的逻辑
  };

  const logout = () => {
    setUser(null); // 清除用户状态
    localStorage.removeItem("user"); // 从本地存储中移除用户信息
    localStorage.removeItem("username"); // 从本地存储中移除用户名
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};
