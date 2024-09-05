import React, { useState } from "react";
import {
  TextField,
  Typography,
  IconButton,
  InputAdornment,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EditIcon from "@mui/icons-material/Edit";

const InlineEdit = ({ value, onSave, isNumber = false, width = "auto" }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    const newValue = isNumber ? parseFloat(editValue) || 0 : editValue;
    onSave(newValue);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSave();
    }
  };

  if (isEditing) {
    return (
      <TextField
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        fullWidth
        variant="standard"
        type={isNumber ? "number" : "text"}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={handleSave} edge="end">
                <CheckCircleIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
        autoFocus
        onBlur={handleSave}
        sx={{ width }}
      />
    );
  }

  return (
    <Typography
      onClick={() => setIsEditing(true)}
      sx={{ cursor: "pointer", display: "flex", alignItems: "center", width }}
    >
      {value}
      <EditIcon sx={{ ml: 1, fontSize: "small", color: "action.active" }} />
    </Typography>
  );
};

export default InlineEdit;
