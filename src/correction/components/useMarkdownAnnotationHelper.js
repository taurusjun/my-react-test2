import { useState } from "react";
import { Snackbar, Alert } from "@mui/material";

const useMarkdownAnnotationHelper = (exam, selectedSection) => {
  const [errorMessage, setErrorMessage] = useState("");

  const renderSnackbar = () => (
    <Snackbar
      open={!!errorMessage}
      autoHideDuration={6000}
      onClose={() => setErrorMessage("")}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
      sx={{
        bottom: "150px !important",
      }}
    >
      <Alert
        onClose={() => setErrorMessage("")}
        severity="error"
        sx={{ width: "100%" }}
      >
        {errorMessage}
      </Alert>
    </Snackbar>
  );

  return { setErrorMessage, renderSnackbar };
};

export default useMarkdownAnnotationHelper;
