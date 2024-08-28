import React from "react";
import { Rating, Typography, Box, FormHelperText } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";

const HardRating = ({ onRateChange, required, error, initialValue = 0 }) => {
  const [value, setValue] = React.useState(initialValue);
  const [hover, setHover] = React.useState(-1);

  const handleChange = (event, newValue) => {
    if (!newValue) {
      newValue = 0;
    }
    setValue(newValue);
    onRateChange(newValue);
  };

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Typography component="legend" sx={{ mr: 2 }}>
          难度等级 {required && <span style={{ color: "red" }}>*</span>}
        </Typography>
        <Rating
          name="difficulty-rating"
          value={value}
          precision={1}
          onChange={handleChange}
          onChangeActive={(event, newHover) => {
            setHover(newHover);
          }}
          emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
        />
        {value !== null && (
          <Typography sx={{ ml: 2 }}>
            {
              ["简单", "较易", "中等", "较难", "困难"][
                hover !== -1 ? hover : value - 1
              ]
            }
          </Typography>
        )}
      </Box>
      {error && <FormHelperText error>难度等级是必选项</FormHelperText>}
    </Box>
  );
};

export default HardRating;
