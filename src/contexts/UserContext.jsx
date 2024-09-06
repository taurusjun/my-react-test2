import React, { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 这里可以添加从本地存储或API获取用户信息的逻辑
    // 例如:
    // const storedUser = localStorage.getItem('user');
    // if (storedUser) {
    //   setUser(JSON.parse(storedUser));
    // }
  }, []);

  const login = (userData) => {
    setUser(userData);
    // 可以在这里添加将用户信息保存到本地存储的逻辑
  };

  const logout = () => {
    setUser(null);
    // 可以在这里添加清除本地存储中用户信息的逻辑
  };

  return (
    <UserContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};
