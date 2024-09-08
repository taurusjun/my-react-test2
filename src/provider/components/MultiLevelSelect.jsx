import React, { useState, useEffect } from "react";
import { FormControl, InputLabel, Select, MenuItem, Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useDictionaries } from "../hooks/useDictionaries";
import NarrowSelect from "../../components/NarrowSelect";

const MultiLevelSelect = ({
  onMultiSelectChange,
  initialSchoolLevel,
  initialGrade,
  error,
  disabled,
  readOnly,
  inline = false,
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
    setGrade(""); // 重置年级
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

  // 获取当前学习阶段可选的年级列表
  const availableGrades = dictionaries.SchoolGradeMapping[schoolLevel] || [];

  return (
    <Box display="flex" alignItems="flex-start" gap={2}>
      <FormControl sx={{ width: "150px" }} error={error} disabled={disabled}>
        <InputLabel>学习阶段</InputLabel>
        <NarrowSelect
          value={schoolLevel}
          onChange={handleSchoolLevelChange}
          label="学习阶段"
          inputProps={{
            readOnly: readOnly,
          }}
        >
          {Object.entries(dictionaries.SchoolDict).map(([key, value]) => (
            <MenuItem key={key} value={key}>
              {value}
            </MenuItem>
          ))}
        </NarrowSelect>
      </FormControl>
      {schoolLevel && (
        <FormControl sx={{ width: "150px" }} error={error} disabled={disabled}>
          <InputLabel>年级</InputLabel>
          <NarrowSelect
            value={grade}
            onChange={handleGradeChange}
            label="年级"
            inputProps={{
              readOnly: readOnly,
            }}
          >
            {availableGrades.map((gradeKey) => (
              <MenuItem key={gradeKey} value={gradeKey}>
                {dictionaries.GradeDict[gradeKey]}
              </MenuItem>
            ))}
          </NarrowSelect>
        </FormControl>
      )}
    </Box>
  );
};

export default MultiLevelSelect;
