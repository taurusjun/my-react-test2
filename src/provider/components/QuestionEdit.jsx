import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { Box, Button, InputAdornment, styled } from "@mui/material";

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
    // asyncSubmit();
  };

  return (
    <>
      <Box
        sx={
          {
            //   display: "flex",
            //   alignItems: "center",
            //   justifyContent: "center",
          }
        }
      >
        {rows.map((row, index) => (
          <Box key={index}>
            {index === 0 ? (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <TextField
                  label="在此输入题干"
                  id="outlined-start-adornment"
                  //   sx={{ m: 1, width: "25ch" }}
                  margin="normal"
                  multiline
                  rows={4}
                  value={row.value}
                  onChange={(e) => handleChange(index, e.target.value)}
                />
              </Box>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <TextField
                  label={`${String.fromCharCode(index + 64)}选项`}
                  margin="dense"
                  value={row.value}
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
                      aria-label="remove"
                      onClick={() => handleDeleteRow(index)}
                    >
                      <RemoveIcon />
                    </IconButton>
                    <IconButton
                      aria-label="add"
                      onClick={() => handleAddRow(index)}
                    >
                      <AddIcon />
                    </IconButton>
                  </>
                )}
              </Box>
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
    </>
  );
};

export default QuestionEdit;
