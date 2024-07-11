import React from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";

export const About = () => {
  const params = useParams();
  const { id } = params;
  const show = `aa${id}`;
  return (
    <div>
      About {show}
      <nav>
        <Link to="/">Home</Link>
      </nav>
    </div>
  );
};
