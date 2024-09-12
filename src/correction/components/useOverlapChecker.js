import { useState } from "react";
import { Snackbar, Alert } from "@mui/material";

const useOverlapChecker = (exam, selectedSection) => {
  const [errorMessage, setErrorMessage] = useState("");

  const hasOverlap = (newLines) => {
    const newStart = Math.min(...newLines);
    const newEnd = Math.max(...newLines);

    for (const section of exam.sections) {
      if (section.extra.length === 0) continue;

      const sectionStart = Math.min(...section.extra);
      const sectionEnd = Math.max(...section.extra);

      if (selectedSection === section.order.toString()) {
        continue;
      }

      if (newStart <= sectionEnd && newEnd >= sectionStart) {
        return true;
      }

      for (const question of section.questions) {
        const questionStart = Math.min(...question.extra);
        const questionEnd = Math.max(...question.extra);

        if (newStart <= questionEnd && newEnd >= questionStart) {
          return true;
        }
      }
    }
    return false;
  };

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

  return { hasOverlap, setErrorMessage, renderSnackbar };
};

export default useOverlapChecker;
