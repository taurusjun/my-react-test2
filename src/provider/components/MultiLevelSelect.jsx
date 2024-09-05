import React, { useState, useEffect } from "react";
import { FormControl, InputLabel, Select, MenuItem, Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useDictionaries } from "../hooks/useDictionaries";

// 创建一个自定义的 Select 组件
const NarrowSelect = styled(Select)(({ theme }) => ({
  minWidth: "100px", // 你可以根据需要调整这个值
  "& .MuiSelect-select": {
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
    <Box display="flex" alignItems="center" gap={2}>
      <FormControl margin="normal" error={error} disabled={disabled}>
        <InputLabel style={{ color: "rgba(0, 0, 0, 0.38)" }}>
          学习阶段
        </InputLabel>
        <NarrowSelect
          value={schoolLevel}
          onChange={handleSchoolLevelChange}
          label="学习阶段"
          inputProps={{
            readOnly: readOnly,
            style: { color: "rgba(0, 0, 0, 0.38)" },
          }}
          sx={{
            "& .MuiSelect-icon": {
              color: "rgba(0, 0, 0, 0.38)",
            },
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
        <FormControl margin="normal" error={error} disabled={disabled}>
          <InputLabel style={{ color: "rgba(0, 0, 0, 0.38)" }}>年级</InputLabel>
          <NarrowSelect
            value={grade}
            onChange={handleGradeChange}
            label="年级"
            inputProps={{
              readOnly: readOnly,
              style: { color: "rgba(0, 0, 0, 0.38)" },
            }}
            sx={{
              "& .MuiSelect-icon": {
                color: "rgba(0, 0, 0, 0.38)",
              },
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
