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
import HardRating from "./HardRating";
import ImageUpload from "./ImageUpload";

const QuestionDetailEdit = () => {
  const [questionContent, setQuestionContent] = useState({
    value: "",
    image: null,
  });

  const [rows, setRows] = useState([
    { value: "", isAns: false, image: null },
    { value: "", isAns: false, image: null },
    { value: "", isAns: false, image: null },
    { value: "", isAns: false, image: null },
  ]);

  const [uiType, setUIType] = useState("multi_selection");
  // const [uiType, setUIType] = useState("single_selection");
  const [rate, setRate] = useState(0);
  const [explaination, setExplaination] = useState("");

  const UITypeDict = { single_selection: "单选", multi_selection: "多选" };

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
    if (rows.length > 1) {
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

  const handleQuestionChange = (changeVal) => {
    setQuestionContent({ ...questionContent, ...changeVal });
  };

  const handleChange = (index, value) => {
    const updatedRows = [...rows];
    updatedRows[index].value = value;
    setRows(updatedRows);
  };

  const handleAnsChange = (index, checked) => {
    switch (uiType) {
      case "single_selection": {
        if (checked) {
          const updatedRows = rows.map((item) => {
            return { ...item, isAns: false };
          });
          updatedRows[index].isAns = checked;
          setRows(updatedRows);
        }
        break;
      }
      case "multi_selection": {
        const updatedRows = [...rows];
        updatedRows[index].isAns = checked;
        setRows(updatedRows);
        break;
      }
      default:
    }
  };

  const handleSelectChange = (type, value) => {
    switch (type) {
      // case "type": {
      //   setType(value);
      //   break;
      // }
      case "ui-type": {
        const updatedRows = rows.map((item) => {
          return { ...item, isAns: false };
        });
        setRows(updatedRows);
        setUIType(value);
        break;
      }
      // case "category": {
      //   setCategory(value);
      //   break;
      // }
      // case "knowledge_node": {
      //   setKN(value);
      //   break;
      // }

      default:
    }
  };

  const handleImageChange = (index, imageData) => {
    const updatedRows = [...rows];
    updatedRows[index].image = imageData;
    setRows(updatedRows);
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
            <Box>
              <div>
                <TextField
                  sx={{ width: 1000 }}
                  label="在此输入题干"
                  id="outlined-start-adornment"
                  margin="normal"
                  multiline
                  rows={4}
                  value={questionContent.value}
                  onChange={(e) =>
                    handleQuestionChange({ value: e.target.value })
                  }
                />
                <ImageUpload
                  cid={"q1"}
                  imageData={questionContent.image}
                  onImageChange={(imageData) =>
                    handleQuestionChange({ image: imageData })
                  }
                />
              </div>
            </Box>
            {rows.map((row, index) => (
              <Box key={index}>
                <div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <FormControlLabel
                      control={
                        uiType == "single_selection" ? (
                          <Radio
                            checked={row.isAns}
                            onChange={(e) =>
                              handleAnsChange(index, e.target.checked)
                            }
                          />
                        ) : (
                          <Checkbox
                            checked={row.isAns}
                            onChange={(e) =>
                              handleAnsChange(index, e.target.checked)
                            }
                          />
                        )
                      }
                      label="答案"
                      labelPlacement="top"
                    />

                    <TextField
                      sx={{ width: 800 }}
                      label={`${String.fromCharCode(index + 65)}选项`}
                      margin="dense"
                      value={row.value}
                      error={row.value === ""}
                      onChange={(e) => handleChange(index, e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            {String.fromCharCode(index + 65)}:
                          </InputAdornment>
                        ),
                      }}
                    />
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
                  </div>
                  <ImageUpload
                    cid={index}
                    imageData={row.image}
                    onImageChange={(imageData) =>
                      handleImageChange(index, imageData)
                    }
                  />
                </div>
              </Box>
            ))}
            <Box sx={{ display: "flex", gap: 1, ml: 2, mr: 2, mt: 2, mb: 2 }}>
              <FormControl sx={{ flex: 1 }}>
                <InputLabel id="ui-type-select-label">显示类型</InputLabel>
                <Select
                  labelId="ui-type-select-label"
                  id="ui-type-select"
                  value={uiType}
                  label="ui-type"
                  onChange={(e) =>
                    handleSelectChange("ui-type", e.target.value)
                  }
                >
                  {Object.entries(UITypeDict).map(([key, value]) => (
                    <MenuItem key={key} value={key}>
                      {value}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <HardRating onRateChange={(rate) => setRate(rate)} />
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
                  value={explaination}
                  onChange={(e) => setExplaination(e.target.value)}
                />
              </div>
            </Box>
          </Box>
        </Stack>
      </Box>
    </>
  );
};

export default QuestionDetailEdit;
