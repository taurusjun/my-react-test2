import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import LoadingButton from "@mui/lab/LoadingButton";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { Box, Button, InputAdornment, Stack } from "@mui/material";
import BasicModal from "./BasicModal";
import { wait } from "@testing-library/user-event/dist/utils";

const QuestionEdit = () => {
  const [rows, setRows] = useState([
    { value: "" },
    { value: "" },
    { value: "" },
    { value: "" },
    { value: "" },
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
            sx={{
              "& .MuiTextField-root": {
                xs: { m: 0 },
                sm: { m: 1, width: 800 },
              },
            }}
            noValidate
            autoComplete="off"
          >
            {rows.map((row, index) => (
              <Box key={index}>
                {index === 0 ? (
                  <div>
                    <TextField
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
                  <div>
                    <TextField
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
      <BasicModal
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
