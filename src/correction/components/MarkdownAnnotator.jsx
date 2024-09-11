import React, { useState } from "react";
import {
  Button,
  Box,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

const MarkdownAnnotator = ({
  markdownLines,
  selectedLines,
  setMarkdownLines,
}) => {
  const [sections, setSections] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentAction, setCurrentAction] = useState("");
  const [selectedSectionIndex, setSelectedSectionIndex] = useState(null);
  const [material, setMaterial] = useState("");
  const [uiType, setUiType] = useState("multi_selection");
  const [rows, setRows] = useState([{ lines: [], isAns: false }]);

  const handleMarkSection = () => {
    const newSection = {
      lines: selectedLines.map((line) => line + 1), // 行号从1开始
      order: sections.length + 1,
      questions: [],
    };
    setSections((prev) => [...prev, newSection]);
    setOpenDialog(false);
  };

  const handleMarkQuestion = () => {
    const newQuestion = {
      lines: selectedLines.map((line) => line + 1),
      order: sections[selectedSectionIndex].questions.length + 1,
      material,
      questionDetails: [],
    };
    const updatedSections = [...sections];
    updatedSections[selectedSectionIndex].questions.push(newQuestion);
    setSections(updatedSections);
    setOpenDialog(false);
  };

  const handleMarkQuestionDetail = () => {
    const newDetail = {
      lines: selectedLines.map((line) => line + 1),
      order: 1,
      rows,
      explanation: "",
      uiType,
      answer: [],
    };
    const updatedSections = [...sections];
    updatedSections[selectedSectionIndex].questions[0].questionDetails.push(
      newDetail
    );
    setSections(updatedSections);
    setOpenDialog(false);
  };

  const openMaterialDialog = (action) => {
    setCurrentAction(action);
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setMaterial("");
    setRows([{ lines: [], isAns: false }]);
  };

  return (
    <Box display="flex" flexDirection="column" marginTop={2}>
      <Button
        variant="contained"
        color="primary"
        onClick={() => openMaterialDialog("section")}
      >
        标注为大题
      </Button>
      <Button
        variant="contained"
        color="secondary"
        onClick={() => openMaterialDialog("question")}
      >
        标注为标准题
      </Button>
      <Button
        variant="contained"
        color="default"
        onClick={() => openMaterialDialog("questionDetail")}
      >
        标注为小题
      </Button>

      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>{`标注为${currentAction}`}</DialogTitle>
        <DialogContent>
          {currentAction === "section" && (
            <div>
              <p>确认将选中的行标注为大题</p>
            </div>
          )}
          {currentAction === "question" && (
            <TextField
              autoFocus
              margin="dense"
              label="材料"
              type="text"
              fullWidth
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
            />
          )}
          {currentAction === "questionDetail" && (
            <div>
              <TextField
                autoFocus
                margin="dense"
                label="UI类型"
                type="text"
                fullWidth
                value={uiType}
                onChange={(e) => setUiType(e.target.value)}
              />
              {/* 这里可以添加更多的输入字段以处理 rows、explanation 和 answer */}
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            取消
          </Button>
          <Button
            onClick={() => {
              if (currentAction === "section") handleMarkSection();
              else if (currentAction === "question") handleMarkQuestion();
              else if (currentAction === "questionDetail")
                handleMarkQuestionDetail();
            }}
            color="primary"
          >
            确认
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MarkdownAnnotator;
