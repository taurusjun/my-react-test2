import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router";

export const ExamDetail = () => {
  const params = useParams();
  const { uuid } = params;

  const [state, setState] = useState([]);
  useEffect(() => {
    const asyncCallback = async () => {
      const data = await axios.post("http://127.0.0.1:8001/v1/exam/view", {
        uuid,
      });
      setState(data);
    };

    asyncCallback();
  }, [uuid]);

  if (state.status != 200) {
    return <div>Loading</div>;
  }

  const { data } = state;
  const examDetail = data.data;
  console.log(examDetail.name);
  const { name, description, sections } = examDetail;

  return <div>ExamDetail</div>;
};
