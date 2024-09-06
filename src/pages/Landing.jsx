import React from "react";
import { Link } from "react-router-dom";

function Landing() {
  return (
    <div className="landing-page">
      <h1>欢迎回来！</h1>
      <p>请选择您要去的页面：</p>
      <div className="navigation-options">
        <Link to="/exam/list" className="nav-button">
          考卷列表
        </Link>
        <Link to="/user-center" className="nav-button">
          用户中心
        </Link>
      </div>
    </div>
  );
}

export default Landing;
