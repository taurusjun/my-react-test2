import {
  Avatar,
  Box,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";

import React from "react";
import { useNavigate } from "react-router-dom";

export const SingleItem = (props) => {
  const { kk } = props;
  const navigate = useNavigate();
  const handleOnClick = () => navigate(`/about/${kk}`);
  const labelId = `No.${kk}`;

  return (
    <>
      <ListItemButton alignItems="flex-start" onClick={handleOnClick}>
        <ListItemAvatar>
          <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" />
        </ListItemAvatar>
        <ListItemText
          primary="Brunch this weekend?"
          secondary={
            <React.Fragment>
              <Typography
                sx={{ display: "inline" }}
                component="span"
                variant="body2"
                color="text.primary"
              >
                Ali Connors {labelId}
              </Typography>
              {" — I'll be in your neighborhood doing errands this…"}
            </React.Fragment>
          }
        />
      </ListItemButton>
      <Divider variant="inset" component="li" />
    </>
  );
};
