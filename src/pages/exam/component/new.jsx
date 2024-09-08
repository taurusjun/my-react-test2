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
import axios from "axios";

const NewExam = ({ onExamCreated }) => {
  const { control, handleSubmit } = useForm();

  const onSubmit = async (data) => {
    try {
      // 发送创建考试的请求
      const response = await axios.post("/api/exam/create", data);
      const newExamUuid = response.data.uuid;

      // 调用父组件传入的回调函数，传递新创建的考试UUID
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
