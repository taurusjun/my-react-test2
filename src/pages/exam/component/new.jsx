import React from "react";
import {
  TextField,
  Select,
  MenuItem,
  Button,
  Box,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";

const NewExam = () => {
  const { control, handleSubmit } = useForm();

  const onSubmit = (data) => {
    // 处理表单提交
    console.log("提交的值:", data);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ maxWidth: 400, mt: 2 }}
    >
      <Controller
        name="name"
        control={control}
        defaultValue=""
        rules={{ required: "请输入考试名称" }}
        render={({ field, fieldState: { error } }) => (
          <TextField
            {...field}
            label="名称"
            fullWidth
            margin="normal"
            error={!!error}
            helperText={error?.message}
          />
        )}
      />
      <Controller
        name="category"
        control={control}
        defaultValue=""
        rules={{ required: "请选择科目" }}
        render={({ field, fieldState: { error } }) => (
          <FormControl fullWidth margin="normal" error={!!error}>
            <InputLabel>科目</InputLabel>
            <Select {...field} label="科目">
              <MenuItem value="math">数学</MenuItem>
              <MenuItem value="english">英语</MenuItem>
              {/* 添加更多科目选项 */}
            </Select>
          </FormControl>
        )}
      />
      <Controller
        name="stage"
        control={control}
        defaultValue=""
        rules={{ required: "请选择阶段" }}
        render={({ field, fieldState: { error } }) => (
          <FormControl fullWidth margin="normal" error={!!error}>
            <InputLabel>阶段</InputLabel>
            <Select {...field} label="阶段">
              <MenuItem value="primary">小学</MenuItem>
              <MenuItem value="middle">初中</MenuItem>
              <MenuItem value="high">高中</MenuItem>
            </Select>
          </FormControl>
        )}
      />
      <Button type="submit" variant="contained" sx={{ mt: 2 }}>
        创建考试
      </Button>
    </Box>
  );
};

export default NewExam;
