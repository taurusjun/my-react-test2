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
    localStorage.setItem("user", JSON.stringify(userData)); // 登录时保存用户信息到本地存储
  };

  const logout = () => {
    setUser(null); // 清除用户状态
    localStorage.removeItem("user"); // 从本地存储中移除用户信息
    localStorage.removeItem("username"); // 从本地存储中移除用户名
  };

  const updateUser = (updatedData) => {
    setUser((prevUser) => {
      const newUser = { ...prevUser, ...updatedData }; // 合并旧用户数据和新数据
      localStorage.setItem("user", JSON.stringify(newUser)); // 更新本地存储中的用户信息
      return newUser; // 返回更新后的用户数据
    });
  };

  return (
    <UserContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};
