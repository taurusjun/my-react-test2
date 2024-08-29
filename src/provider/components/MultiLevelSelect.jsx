import React, { useState, useEffect } from "react";
import { FormControl, InputLabel, Select, MenuItem, Box } from "@mui/material";
import { useDictionaries } from "../hooks/useDictionaries"; // 假设 hook 在这个位置

const MultiLevelSelect = ({
  onMultiSelectChange,
  initialSchoolLevel,
  initialGrade,
  error,
}) => {
  const { dictionaries, loading, error: dictionariesError } = useDictionaries();
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

  if (loading) {
    return <div>加载中...</div>;
  }

  if (dictionariesError) {
    return <div>加载字典时出错: {dictionariesError.message}</div>;
  }

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
          {Object.entries(dictionaries.SchoolDict).map(([key, value]) => (
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
            dictionaries.SchoolGradeMapping[schoolLevel].map((gradeKey) => (
              <MenuItem key={gradeKey} value={gradeKey}>
                {dictionaries.GradeDict[gradeKey]}
              </MenuItem>
            ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default MultiLevelSelect;
