import React, { useState } from "react";
import { Select, MenuItem, FormControl, InputLabel } from "@mui/material";

const MultiLevelSelect = () => {
  const [schoolLevel, setSchoolLevel] = useState("");
  const [grade, setGrade] = useState("");

  const handleSchoolLevelChange = (event) => {
    setSchoolLevel(event.target.value);
    setGrade(""); // 重置年级选项
  };

  const handleGradeChange = (event) => {
    setGrade(event.target.value);
  };

  return (
    <>
      <FormControl sx={{ flex: 1 }}>
        <InputLabel id="grad-select-label">阶段</InputLabel>
        <Select
          labelId="grad-select-label"
          id="grad-select"
          value={schoolLevel}
          onChange={handleSchoolLevelChange}
          defaultValue="primary"
        >
          <MenuItem value="primary">小学</MenuItem>
          <MenuItem value="middle">初中</MenuItem>
        </Select>
      </FormControl>

      {schoolLevel === "primary" && (
        <FormControl sx={{ flex: 1 }}>
          <InputLabel id="primary-select-label">年级</InputLabel>
          <Select
            labelId="primary-select-label"
            id="primary-select"
            value={grade}
            onChange={handleGradeChange}
            defaultValue="grade1"
          >
            <MenuItem value="grade1">一年级</MenuItem>
            <MenuItem value="grade2">二年级</MenuItem>
            <MenuItem value="grade3">三年级</MenuItem>
            <MenuItem value="grade4">四年级</MenuItem>
            <MenuItem value="grade5">五年级</MenuItem>
            <MenuItem value="grade6">六年级</MenuItem>
          </Select>
        </FormControl>
      )}

      {schoolLevel === "middle" && (
        <FormControl sx={{ flex: 1 }}>
          <InputLabel id="middle-select-label">年级</InputLabel>
          <Select
            value={grade}
            onChange={handleGradeChange}
            defaultValue="seven"
          >
            <MenuItem value="seven">初一</MenuItem>
            <MenuItem value="eight">初二</MenuItem>
            <MenuItem value="nine">初三</MenuItem>
          </Select>
        </FormControl>
      )}
    </>
  );
};

export default MultiLevelSelect;
