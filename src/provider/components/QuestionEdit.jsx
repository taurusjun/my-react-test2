import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import LoadingButton from "@mui/lab/LoadingButton";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputAdornment,
  InputLabel,
  MenuItem,
  Radio,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import SubmitModal from "./SubmitModal";
import MultiLevelSelect from "./MultiLevelSelect";
import HardRating from "./HardRating";

const QuestionEdit = () => {
  const [rows, setRows] = useState([
    { value: "", isAns: false },
    { value: "", isAns: false },
    { value: "", isAns: false },
    { value: "", isAns: false },
    { value: "", isAns: false },
  ]);

  const [submiting, setSubmiting] = useState(false);
  const [readyToClose, setReadyToClose] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState("");

  const handleAddRow = (index) => {
    const newRow = {
      value: "",
    };
    const updatedRows = [
      ...rows.slice(0, index + 1),
      newRow,
      ...rows.slice(index + 1),
    ];
    setRows(updatedRows);
  };

  const handleDeleteRow = (index) => {
    if (index >= 1) {
      let updatedRows = [...rows.filter((_, i) => i !== index)];
      if (index === 1) {
        updatedRows = updatedRows.map((row, i) => ({
          value: row.value,
          isAns: row.isAns,
        }));
      }
      setRows(updatedRows);
    }
  };

  const handleChange = (index, value) => {
    const updatedRows = [...rows];
    updatedRows[index].value = value;
    setRows(updatedRows);
  };

  const handleAnsChange = (index, checked) => {
    // const updatedRows = [...rows];
    if (checked) {
      const updatedRows = rows.map((item) => {
        return { ...item, isAns: false };
      });
      updatedRows[index].isAns = checked;
      setRows(updatedRows);
    }
  };

  const handleSubmitQuestion = (event) => {
    event.preventDefault();
    console.log("submit!");
    console.log(rows);

    var emptyIndex = rows.findIndex((element) => element.value === "");
    var errorTxt = "";
    if (emptyIndex === 0) {
      console.log("题干内容为空");
      errorTxt = "题干内容为空";
    } else {
      if (emptyIndex > 0) {
        console.log(`第${emptyIndex}个选项为空`);
        errorTxt = `第${emptyIndex}个选项为空`;
      }
    }

    setSubmiting(true);

    if (emptyIndex !== -1) {
      setModalTitle("存在错误");
      setModalContent(errorTxt);
      setReadyToClose(true);
      return;
    } else {
      setModalTitle("");
      setModalContent("正在提交...");
      //setTimeout(setSubmiting(false), 2000);
      asyncSubmit();
    }
  };

  const asyncSubmit = async () => {
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    // const fqResponse = await axios.post("/api/v1/userExam/submitExam", {
    //   exam_uuid: exam.uuid,
    //   answers: JSON.stringify(Object.fromEntries(answersMap)),
    // });
    // 执行需要等待的操作
    console.log("开始等待");
    await sleep(2000); // 等待2秒
    console.log("等待结束");
    setModalContent("提交完成!");
    setReadyToClose(true);
  };

  const handleModalStatus = () => {
    setSubmiting(false);
    setReadyToClose(false);
  };

  return (
    <>
      <Box
        flex={8}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack>
          <Box
            component="form"
            // sx={{
            //   "& .MuiTextField-root": {
            //     xs: { m: 0 },
            //     sm: { m: 1, width: 800 },
            //   },
            // }}
            noValidate
            autoComplete="off"
          >
            {rows.map((row, index) => (
              <Box key={index}>
                {index === 0 ? (
                  <div>
                    <TextField
                      sx={{ width: 1000 }}
                      label="在此输入题干"
                      id="outlined-start-adornment"
                      margin="normal"
                      multiline
                      rows={4}
                      value={row.value}
                      onChange={(e) => handleChange(index, e.target.value)}
                    />
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <FormControlLabel
                      control={
                        <Radio
                          checked={row.isAns}
                          onChange={(e) =>
                            handleAnsChange(index, e.target.checked)
                          }
                        />
                      }
                      label="答案"
                      labelPlacement="top"
                    />

                    <TextField
                      sx={{ width: 800 }}
                      label={`${String.fromCharCode(index + 64)}选项`}
                      margin="dense"
                      value={row.value}
                      error={row.value === ""}
                      onChange={(e) => handleChange(index, e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            {String.fromCharCode(index + 64)}:
                          </InputAdornment>
                        ),
                      }}
                    />
                    {index > 0 && (
                      <>
                        <IconButton
                          aria-label="delete"
                          onClick={() => handleDeleteRow(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                        <IconButton
                          aria-label="add"
                          onClick={() => handleAddRow(index)}
                        >
                          <AddCircleIcon />
                        </IconButton>
                      </>
                    )}
                  </div>
                )}
              </Box>
            ))}
            <Box sx={{ display: "flex", gap: 1, ml: 2, mr: 2, mt: 2, mb: 2 }}>
              <FormControl sx={{ flex: 1 }}>
                <InputLabel id="demo-simple-select-label">题目分类</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={10}
                  label="type"
                  onChange={handleChange}
                >
                  <MenuItem value={10}>选择题</MenuItem>
                  <MenuItem value={20}>填空题</MenuItem>
                </Select>
              </FormControl>
              <FormControl sx={{ flex: 1 }}>
                <InputLabel id="demo-simple-select-label">选项类型</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  //   value={age}
                  value={10}
                  label="ui-type"
                  onChange={handleChange}
                >
                  <MenuItem value={10}>单选</MenuItem>
                  <MenuItem value={20}>多选</MenuItem>
                </Select>
              </FormControl>
              {/* <FormControl sx={{ flex: 1 }}>
                <InputLabel id="demo-simple-select-label">年级</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  //   value={age}
                  value={10}
                  label="grade"
                  onChange={handleChange}
                >
                  <MenuItem value={10}>小学</MenuItem>
                  <MenuItem value={20}>多选</MenuItem>
                </Select>
              </FormControl> */}
              <MultiLevelSelect />
            </Box>
            <Box sx={{ display: "flex", gap: 1, ml: 2, mr: 2, mt: 2, mb: 2 }}>
              <FormControl sx={{ flex: 1 }}>
                <InputLabel id="demo-simple-select-label">学科</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={10}
                  label="type"
                  onChange={handleChange}
                >
                  <MenuItem value={10}>物理</MenuItem>
                  <MenuItem value={20}>化学</MenuItem>
                </Select>
              </FormControl>
              <FormControl sx={{ flex: 1 }}>
                <InputLabel id="demo-simple-select-label">知识点</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  //   value={age}
                  value={10}
                  label="ui-type"
                  onChange={handleChange}
                >
                  <MenuItem value={10}>运动学</MenuItem>
                  <MenuItem value={20}>电与磁</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                ml: 2,
                mr: 2,
              }}
            >
              <FormControl>
                <HardRating
                  onRateChange={(rate) => console.log("rate: " + rate)}
                />
              </FormControl>
              <FormControl>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Typography component="legend">来源：</Typography>
                  <TextField
                    sx={{ width: 500 }}
                    label="填写来源，比如哪一本书，或者哪一张试卷"
                    id="outlined-start-adornment"
                    margin="normal"
                    rows={1}
                    //   value={row.value}
                    //   onChange={(e) => handleChange(index, e.target.value)}
                  />
                </Box>
              </FormControl>
            </Box>
            <Box>
              <div>
                <TextField
                  sx={{ width: 1000 }}
                  label="题目解析"
                  id="outlined-start-adornment"
                  margin="normal"
                  multiline
                  rows={3}
                  //   value={row.value}
                  //   onChange={(e) => handleChange(index, e.target.value)}
                />
              </div>
            </Box>
          </Box>
          <LoadingButton
            sx={{ mt: 1, mr: 1 }}
            variant="contained"
            onClick={handleSubmitQuestion}
            loading={submiting}
          >
            提交
          </LoadingButton>
        </Stack>
      </Box>
      <SubmitModal
        status={submiting}
        readyToClose={readyToClose}
        titleText={modalTitle}
        contentText={modalContent}
        handleModalStatus={handleModalStatus}
      />
    </>
  );
};

export default QuestionEdit;
