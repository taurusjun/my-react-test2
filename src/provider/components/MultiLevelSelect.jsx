import React, { useState, useEffect } from "react";
import { FormControl, InputLabel, Select, MenuItem, Box } from "@mui/material";

export const schoolLevels = {
  primary: "小学",
  junior: "初中",
  senior: "高中",
};

export const grades = {
  primary: ["grade1", "grade2", "grade3", "grade4", "grade5", "grade6"],
  junior: ["grade7", "grade8", "grade9"],
  senior: ["grade10", "grade11", "grade12"],
};

export const gradeNames = {
  grade1: "一年级",
  grade2: "二年级",
  grade3: "三年级",
  grade4: "四年级",
  grade5: "五年级",
  grade6: "六年级",
  grade7: "初一",
  grade8: "初二",
  grade9: "初三",
  grade10: "高一",
  grade11: "高二",
  grade12: "高三",
};

const MultiLevelSelect = ({
  onMultiSelectChange,
  initialSchoolLevel,
  initialGrade,
  error,
}) => {
  const [schoolLevel, setSchoolLevel] = useState(initialSchoolLevel || "");
  const [grade, setGrade] = useState(initialGrade || "");

  useEffect(() => {
    if (initialSchoolLevel && initialGrade) {
      setSchoolLevel(initialSchoolLevel);
      setGrade(initialGrade);
    }
  }, [initialSchoolLevel, initialGrade]);

  const handleSchoolLevelChange = (event) => {
    const newSchoolLevel = event.target.value;
    setSchoolLevel(newSchoolLevel);
    setGrade("");
    onMultiSelectChange(newSchoolLevel, "");
  };

  const handleGradeChange = (event) => {
    const newGrade = event.target.value;
    setGrade(newGrade);
    onMultiSelectChange(schoolLevel, newGrade);
  };

  return (
    <Box sx={{ display: "flex", gap: 1, flex: 2 }}>
      <FormControl sx={{ flex: 1 }} required error={error}>
        <InputLabel id="school-level-label">学习阶段</InputLabel>
        <Select
          labelId="school-level-label"
          id="school-level-select"
          value={schoolLevel}
          label="学习阶段"
          onChange={handleSchoolLevelChange}
        >
          {Object.entries(schoolLevels).map(([key, value]) => (
            <MenuItem key={key} value={key}>
              {value}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl sx={{ flex: 1 }} required error={error}>
        <InputLabel id="grade-label">年级</InputLabel>
        <Select
          labelId="grade-label"
          id="grade-select"
          value={grade}
          label="年级"
          onChange={handleGradeChange}
          disabled={!schoolLevel}
        >
          {schoolLevel &&
            grades[schoolLevel].map((gradeKey) => (
              <MenuItem key={gradeKey} value={gradeKey}>
                {gradeNames[gradeKey]}
              </MenuItem>
            ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default MultiLevelSelect;
