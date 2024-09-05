import React from "react";
import { Select, styled } from "@mui/material";

const StyledSelect = styled(Select)(({ theme }) => ({
  height: "56px",
  "& .MuiSelect-select": {
    paddingTop: "15px",
    paddingBottom: "15px",
    paddingRight: "24px !important",
  },
}));

const NarrowSelect = React.forwardRef((props, ref) => {
  return <StyledSelect {...props} ref={ref} />;
});

export default NarrowSelect;
