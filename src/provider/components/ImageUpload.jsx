import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Input from "@mui/material/Input";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "auto",
  maxWidth: "80%",
  maxHeight: "80%",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  overflow: "scroll",
};

const zoomCursor = {
  cursor: "zoom-in",
};

function ImageUpload({ cid, onImageChange, imageData }) {
  const [image, setImage] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setImage(imageData);
  }, [imageData]);

  const uniqueId = `contained-button-file-${cid}`; // 创建唯一的ID

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();

      reader.onloadend = () => {
        // setImage(reader.result);
        // Assuming onImageChange is a function passed by the parent component
        onImageChange(reader.result);
      };

      reader.readAsDataURL(file);
    } else {
      alert("请选择一张图片文件");
    }
  };

  // Assuming asyncSubmitQuestion is called when submitting the form in the parent component
  const handleDelete = () => {
    // setImage(null);
    onImageChange(null); // Update parent's component state to reflect the deletion
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div>
      <label htmlFor={uniqueId}>
        <Input
          accept="image/*"
          id={uniqueId}
          multiple={false}
          type="file"
          onChange={handleFileChange}
          style={{ display: "none" }} // Ensure the input is hidden
        />
        <Button variant="contained" component="span">
          上传图片
        </Button>
      </label>

      {image && (
        <>
          <img
            src={image}
            alt="Uploaded"
            onClick={handleOpen}
            style={{
              ...zoomCursor,
              marginTop: "20px",
              maxWidth: "100%",
              maxHeight: "400px",
            }}
          />
          <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={style}>
              <IconButton
                aria-label="close"
                onClick={handleClose}
                sx={{
                  position: "absolute",
                  right: 8,
                  top: 8,
                  color: (theme) => theme.palette.grey[500],
                }}
              >
                <CloseIcon />
              </IconButton>
              <img
                src={image}
                alt="Zoomed"
                style={{ maxWidth: "100%", maxHeight: "100%" }}
              />
            </Box>
          </Modal>

          <Button
            startIcon={<DeleteIcon />}
            variant="outlined"
            color="error"
            onClick={handleDelete}
            sx={{ mt: 2 }}
          >
            删除图片
          </Button>
        </>
      )}
    </div>
  );
}

export default ImageUpload;
