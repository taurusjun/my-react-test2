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
  } = useForm();
  const { dictionaries } = useDictionaries();

  const onSubmit = async (data) => {
    try {
      const response = await axios.post("/api/exam/create", data);
      const newExamUuid = response.data.uuid;
      onExamCreated(newExamUuid);
    } catch (error) {
      console.error("创建考试失败:", error);
      // 这里可以添加错误处理，比如显示一个错误提示
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ maxWidth: 600, mt: 2 }}
    >
      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
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
                </FormControl>
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="gradeInfo"
              control={control}
              defaultValue={{ school: "", grade: "" }}
              rules={{ required: "请选择学习阶段" }}
              render={({ field, fieldState: { error } }) => (
                <MultiLevelSelect
                  onMultiSelectChange={(schoolLevel, grade) => {
                    field.onChange({ school: schoolLevel, grade });
                  }}
                  initialSchoolLevel={field.value.school}
                  initialGrade={field.value.grade}
                  error={!!error}
                  inline={true}
                  fullWidth
                />
              )}
            />
          </Grid>
        </Grid>
      </Paper>
      <Button type="submit" variant="contained" sx={{ mt: 2 }}>
        创建考试
      </Button>
    </Box>
  );
};

export default NewExam;
