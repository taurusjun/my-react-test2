import React from "react";
import {
  Box,
  TextField,
  FormControlLabel,
  Radio,
  Checkbox,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ImageUpload from "./ImageUpload";

const OptionList = ({
  rows,
  uiType,
  handleRowChange,
  handleDeleteRow,
  errors,
  questionUuid,
  questionOrder,
}) => {
  if (uiType !== "single_selection" && uiType !== "multi_selection") {
    return null;
  }

  return (
    <>
      {rows.map((row, index) => (
        <Box key={index}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <FormControlLabel
              control={
                uiType === "single_selection" ? (
                  <Radio
                    checked={row.isAns}
                    onChange={(e) =>
                      handleRowChange(index, "isAns", e.target.checked)
                    }
                  />
                ) : (
                  <Checkbox
                    checked={row.isAns}
                    onChange={(e) =>
                      handleRowChange(index, "isAns", e.target.checked)
                    }
                  />
                )
              }
            />
            <TextField
              sx={{ flex: 1 }}
              label={`${String.fromCharCode(index + 65)}选项`}
              margin="dense"
              required
              value={row.value}
              error={errors && errors.rows && errors.rows[index]}
              helperText={
                errors && errors.rows && errors.rows[index]
                  ? "选项不能为空"
                  : ""
              }
              onChange={(e) => handleRowChange(index, "value", e.target.value)}
            />
            <IconButton onClick={() => handleDeleteRow(index)}>
              <DeleteIcon />
            </IconButton>
          </div>
          <ImageUpload
            cid={`${questionUuid}_${questionOrder}_${index}`}
            imageData={row.image}
            onImageChange={(imageData) =>
              handleRowChange(index, "image", imageData)
            }
          />
        </Box>
      ))}
    </>
  );
};

export default OptionList;
