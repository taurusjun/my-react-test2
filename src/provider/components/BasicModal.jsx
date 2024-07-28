import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import React, { useEffect, useState } from "react";
import { Button } from "@mui/material";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 200,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

export default function BasicModal({
  status,
  readyToClose,
  titleText,
  contentText,
  handleModalStatus,
}) {
  const [open, setOpen] = useState(status);
  const [showBtn, setShowBtn] = useState(readyToClose);
  const [title, setTitle] = useState(titleText);
  const [content, setContent] = useState(contentText);
  const handleBtnClick = (event) => {
    event.preventDefault();
    handleModalStatus();
  };

  useEffect(() => {
    setOpen(status);
    setShowBtn(readyToClose);
    setTitle(titleText);
    setContent(contentText);
  }, [status, readyToClose, titleText, contentText]);

  return (
    <div>
      <Modal
        open={open}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {title}
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2, mb: 4 }}>
            {content}
          </Typography>
          {showBtn ? (
            <Button
              variant="contained"
              onClick={handleBtnClick}
              sx={{ width: "100%" }}
            >
              确定
            </Button>
          ) : (
            ""
          )}
        </Box>
      </Modal>
    </div>
  );
}
