import React, { useState } from "react";
import {
  TextField,
  Typography,
  IconButton,
  InputAdornment,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EditIcon from "@mui/icons-material/Edit";

const InlineEdit = ({ value, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    onSave(editValue);
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
      />
    );
  }

  return (
    <Typography
      onClick={() => setIsEditing(true)}
      sx={{ cursor: "pointer", display: "flex", alignItems: "center" }}
    >
      {value}
      <EditIcon sx={{ ml: 1, fontSize: "small", color: "action.active" }} />
    </Typography>
  );
};

export default InlineEdit;
