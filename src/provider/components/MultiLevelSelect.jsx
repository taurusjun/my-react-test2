import React, { useState, useEffect } from "react";
import { FormControl, InputLabel, Select, MenuItem, Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useDictionaries } from "../hooks/useDictionaries";

// 创建一个自定义的 Select 组件
const NarrowSelect = styled(Select)(({ theme }) => ({
  height: "56px", // 设置固定高度
  "& .MuiSelect-select": {
    paddingTop: "15px", // 调整内边距以垂直居中文本
    paddingBottom: "15px",
    paddingRight: "24px !important",
  },
}));

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
            {Object.entries(dictionaries.GradeDict).map(([key, value]) => (
              <MenuItem key={key} value={key}>
                {value}
              </MenuItem>
            ))}
          </NarrowSelect>
        </FormControl>
      )}
    </Box>
  );
};

export default MultiLevelSelect;
