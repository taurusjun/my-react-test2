import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { Box, Button, InputAdornment, Stack, styled } from "@mui/material";

const QuestionEdit = () => {
  const [rows, setRows] = useState([
    { value: "" },
    { value: "" },
    { value: "" },
    { value: "" },
    { value: "" },
  ]);

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
    if (emptyIndex === 0) {
      console.log("题干内容为空");
    } else {
      if (emptyIndex > 0) {
        console.log(`第${emptyIndex}选项为空`);
      }
    }

    if (emptyIndex !== -1) {
      return;
    } else {
      // asyncSubmit();
    }
  };

  return (
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
            "& .MuiTextField-root": { xs: { m: 0 }, sm: { m: 1, width: 800 } },
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
        <Box>
          <Button
            sx={{ mt: 1, mr: 1 }}
            variant="contained"
            onClick={handleSubmitQuestion}
          >
            提交
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};

export default QuestionEdit;
