import React from "react";
import {
  TextField,
  Select,
  MenuItem,
  Button,
  Box,
  FormControl,
  InputLabel,
  Grid,
  Typography,
  Paper,
  FormHelperText,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import { useDictionaries } from "../../../provider/hooks/useDictionaries";
import MultiLevelSelect from "../../../provider/components/MultiLevelSelect";

const NewExam = ({ onExamCreated }) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      name: "",
      category: "",
      gradeInfo: { school: "", grade: "" },
    },
  });
  const { dictionaries } = useDictionaries();

  const onSubmit = async (data) => {
    console.log("提交的数据:", data); // 打印提交的数据
    try {
      const response = await axios.post("/api/exam/create", data);
      const newExamUuid = response.data.uuid;
      onExamCreated(newExamUuid);
    } catch (error) {
      console.error("创建考试失败:", error);
      // 这里可以添加错误处理，比如显示一个错误提示
    }
  };

  const gradeInfo = watch("gradeInfo");

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{
        maxWidth: 600,
        width: "100%",
        mt: 2,
        mx: "auto", // 添加这行来使表单居中
      }}
    >
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
        {/* 移除 mb: 3 */}
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          创建新考试
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Controller
              name="name"
              control={control}
              defaultValue=""
              rules={{ required: "请输入考试名称" }}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  label="考试名称"
                  fullWidth
                  required
                  error={!!error}
                  helperText={error?.message}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="category"
              control={control}
              defaultValue=""
              rules={{ required: "请选择科目" }}
              render={({ field, fieldState: { error } }) => (
                <FormControl fullWidth required error={!!error}>
                  <InputLabel id="category-select-label">科目</InputLabel>
                  <Select
                    {...field}
                    labelId="category-select-label"
                    label="科目"
                  >
                    {Object.entries(dictionaries.CategoryDict).map(
                      ([key, value]) => (
                        <MenuItem key={key} value={key}>
                          {value}
                        </MenuItem>
                      )
                    )}
                  </Select>
                  {error && <FormHelperText>{error.message}</FormHelperText>}
                </FormControl>
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="gradeInfo"
              control={control}
              defaultValue={{ school: "", grade: "" }}
              rules={{
                validate: (value) => {
                  if (!value.school || !value.grade) {
                    return "请选择完整的学习阶段和年级";
                  }
                  // 确���选择的年级在对应的学习阶段中是有效的
                  const validGrades =
                    dictionaries.SchoolGradeMapping[value.school] || [];
                  if (!validGrades.includes(value.grade)) {
                    return "请选择有效的学习阶段和年级组合";
                  }
                  return true;
                },
              }}
              render={({ field, fieldState: { error } }) => (
                <FormControl fullWidth error={!!error}>
                  <MultiLevelSelect
                    onMultiSelectChange={(school, grade) => {
                      setValue(
                        "gradeInfo",
                        { school, grade },
                        { shouldValidate: true }
                      );
                    }}
                    initialSchoolLevel={gradeInfo.school}
                    initialGrade={gradeInfo.grade}
                    error={!!error}
                    inline={true}
                    fullWidth
                  />
                  {error && <FormHelperText>{error.message}</FormHelperText>}
                </FormControl>
              )}
            />
          </Grid>
        </Grid>
      </Paper>
      <Button type="submit" variant="contained" sx={{ mt: 2, width: "100%" }}>
        创建考试
      </Button>
    </Box>
  );
};

export default NewExam;
