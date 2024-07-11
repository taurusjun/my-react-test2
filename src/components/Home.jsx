import { Box, List, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { SingleItem } from "./SingleListItem";
import axios from "axios";
import { MyBasicTable } from "./MyBasicTable";

export const Home = () => {
  const [state, setState] = useState([]);
  useEffect(() => {
    const asyncCallback = async () => {
      const data = await axios.post("http://127.0.0.1:8001/v1/exam/list", {
        pageNo: 1,
        pageSize: 10,
      });
      setState(data);
    };

    asyncCallback();
  }, []);

  const navigate = useNavigate();
  const handleOnClick = () => navigate("/about");

  if (state.length == 0) {
    return <div>Loading</div>;
  }

  const { data } = state;
  const examList = data.data;
  console.log(examList[0].uuid);

  return (
    <div>
      {/* Home
      <nav>
        <Link to="/about">About</Link>
      </nav> */}
      {/* <Box>
        <List
          sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
        >
          {examList.map((value) => {
            return <SingleItem kk={value.uuid} />;
          })}
        </List>
      </Box> */}
      <Box>
        <Typography variant="h6" p={2}>
          历年考卷
        </Typography>
        <MyBasicTable dataList={examList} />
      </Box>
    </div>
  );
};
