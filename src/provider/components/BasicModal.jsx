import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import React, { useEffect, useState } from "react";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

export default function BasicModal({
  status,
  titleText,
  contentText,
  handleModalStatus,
}) {
  const [open, setOpen] = useState(status);
  const [title, setTitle] = useState(titleText);
  const [content, setContent] = useState(contentText);
  const handleOpen = () => {
    setOpen(true);
    handleModalStatus(true);
  };
  const handleClose = () => {
    setOpen(false);
    handleModalStatus(false);
  };

  useEffect(() => {
    setOpen(status);
    setTitle(titleText);
    setContent(contentText);
  }, [status, titleText, contentText]);

  return (
    <div>
      <Modal
        open={open}
        // onOpen={handleOpen}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {title}
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            {content}
          </Typography>
        </Box>
      </Modal>
    </div>
  );
}
