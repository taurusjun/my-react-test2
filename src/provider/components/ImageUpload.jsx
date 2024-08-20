import React, { useState } from "react";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete"; // 导入删除图标
import IconButton from "@mui/material/IconButton";

const Input = styled("input")({
  display: "none",
});

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

// CSS 用于改变鼠标形状
const zoomCursor = {
  cursor: "zoom-in", // 鼠标变成放大镜形状
};

function ImageUpload() {
  const [image, setImage] = useState(null);
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();

      reader.onloadend = () => {
        setImage(reader.result);
      };

      reader.readAsDataURL(file);
      setFile(file);
    } else {
      alert("请选择一张图片文件");
    }
  };

  const asyncUploadFile = () => {
    const formData = new FormData();
    formData.append("image", file); // 确保 'image' 与后端接收的字段匹配

    // 使用 fetch 或者 axios 等发送 formData 到服务器
    fetch("http://localhost:3000/upload", {
      // 替换成你的服务器地址
      method: "POST",
      body: formData,
    })
      .then((response) => response.text())
      .then((data) => {
        console.log(data);
        // 此处你也可以更新 UI，例如显示上传成功消息
      })
      .catch((error) => {
        console.error(error);
        // 处理错误情况，例如显示错误消息
      });
  };

  const handleDelete = () => setImage(null);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div>
      <label htmlFor="contained-button-file">
        <Input
          accept="image/*"
          id="contained-button-file"
          multiple={false}
          type="file"
          onChange={handleFileChange}
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
            style={{
              ...zoomCursor,
              marginTop: "20px",
              maxWidth: "100%",
              maxHeight: "400px",
            }}
            onClick={handleOpen}
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

          {/* 删除按钮 */}
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
