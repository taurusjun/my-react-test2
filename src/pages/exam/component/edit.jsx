import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Button,
  IconButton,
  Typography,
  Card,
  CardContent,
  CardActions,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Grid,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InlineEdit from "../../../components/InlineEdit";
import QuestionList from "../../../provider/components/QuestionList";
import ExamMainLayout from "./layouts/ExamMainLayout";
import QuestionEdit from "../../../provider/components/QuestionEdit";
import MultiLevelSelect from "../../../provider/components/MultiLevelSelect";
import { styled } from "@mui/material/styles";
import NarrowSelect from "../../../components/NarrowSelect";

const EditExam = () => {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState({
    sections: [],
    gradeInfo: { school: "", grade: "" },
  });
  const [initialExam, setInitialExam] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);
  const [openQuestionList, setOpenQuestionList] = useState(false);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(null);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [duplicateQuestions, setDuplicateQuestions] = useState([]);
  const [openDuplicateDialog, setOpenDuplicateDialog] = useState(false);
  const [openSubmitDialog, setOpenSubmitDialog] = useState(false);
  const [openRestoreDialog, setOpenRestoreDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [openNewQuestionDialog, setOpenNewQuestionDialog] = useState(false);
  const [newQuestionSectionIndex, setNewQuestionSectionIndex] = useState(null);

  // 使用 useMemo 来缓存已存在的问题 UUID 集合
  const existingQuestionUuids = useMemo(() => {
    return new Set(
      exam.sections.flatMap((section) => section.questions.map((q) => q.uuid))
    );
  }, [exam.sections]);

  useEffect(() => {
    const fetchExamData = async () => {
      try {
        const response = await axios.get(`/api/exams/${uuid}`);
        setExam(response.data);
        setInitialExam(JSON.parse(JSON.stringify(response.data))); // 深拷贝
        setLoading(false);
      } catch (error) {
        console.error("获取考试数据失败:", error);
        setLoading(false);
      }
    };

    fetchExamData();
  }, [uuid]);

  const updateExam = (updater) => {
    setExam((prev) => ({
      ...prev,
      ...updater(prev),
    }));
  };

  const addSection = () => {
    updateExam((prev) => {
      const sections = prev.sections || [];
      const newOrder =
        sections.length > 0
          ? Math.max(...sections.map((s) => s.order_in_exam)) + 1
          : 1;
      return {
        sections: [
          ...sections,
          {
            id: Date.now(),
            name: "新模块",
            questions: [],
            order_in_exam: newOrder,
          },
        ],
      };
    });
  };

  const deleteSection = (index) => {
    updateExam((prev) => {
      const newSections = prev.sections.filter((_, i) => i !== index);
      newSections.forEach((section, i) => {
        section.order_in_exam = i + 1;
      });
      return { sections: newSections };
    });
  };

  const moveSection = (index, direction) => {
    updateExam((prev) => {
      if (
        (direction === -1 && index > 0) ||
        (direction === 1 && index < prev.sections.length - 1)
      ) {
        const newSections = [...prev.sections];
        const temp = newSections[index];
        newSections[index] = newSections[index + direction];
        newSections[index + direction] = temp;
        newSections[index].order_in_exam = index + 1;
        newSections[index + direction].order_in_exam = index + direction + 1;
        return { sections: newSections };
      }
      return prev;
    });
  };

  const updateSectionName = (index, newName) => {
    updateExam((prev) => {
      const newSections = [...prev.sections];
      newSections[index].name = newName;
      return { sections: newSections };
    });
  };

  const moveQuestion = (sectionIndex, questionIndex, direction) => {
    updateExam((prev) => {
      const newSections = [...prev.sections];
      const questions = newSections[sectionIndex].questions;
      if (
        (direction === -1 && questionIndex > 0) ||
        (direction === 1 && questionIndex < questions.length - 1)
      ) {
        const temp = questions[questionIndex];
        questions[questionIndex] = questions[questionIndex + direction];
        questions[questionIndex + direction] = temp;
        // 更新 order_in_section
        questions[questionIndex].order_in_section = questionIndex + 1;
        questions[questionIndex + direction].order_in_section =
          questionIndex + direction + 1;
      }
      return { sections: newSections };
    });
  };

  const deleteQuestion = (sectionIndex, questionIndex) => {
    updateExam((prev) => {
      const newSections = [...prev.sections];
      newSections[sectionIndex].questions.splice(questionIndex, 1);
      // 重新排序剩余的问题
      newSections[sectionIndex].questions.forEach((q, i) => {
        q.order_in_section = i + 1;
      });
      return { sections: newSections };
    });
  };

  const handleSelectQuestions = (sectionIndex) => {
    setCurrentSectionIndex(sectionIndex);
    setOpenQuestionList(true);
  };

  const handleCloseQuestionList = () => {
    setOpenQuestionList(false);
    setSelectedQuestions([]);
  };

  const handleQuestionSelection = (questions) => {
    setSelectedQuestions(questions);
  };

  const handleAddSelectedQuestions = () => {
    const newQuestions = selectedQuestions.filter(
      (q) => !existingQuestionUuids.has(q.uuid)
    );
    const duplicates = selectedQuestions.filter((q) =>
      existingQuestionUuids.has(q.uuid)
    );

    if (duplicates.length > 0) {
      setDuplicateQuestions(duplicates);
      setOpenDuplicateDialog(true);
    }

    if (newQuestions.length > 0) {
      updateExam((prev) => {
        const newSections = [...prev.sections];
        const currentSection = newSections[currentSectionIndex];
        const currentQuestions = currentSection.questions || [];
        const addedQuestions = newQuestions.map((q, index) => ({
          ...q,
          order_in_section: currentQuestions.length + index + 1,
        }));
        currentSection.questions = [...currentQuestions, ...addedQuestions];
        return { sections: newSections };
      });
    }

    handleCloseQuestionList();
  };

  const handleCloseDuplicateDialog = () => {
    setOpenDuplicateDialog(false);
    setDuplicateQuestions([]);
  };

  const handleSubmit = async () => {
    setOpenSubmitDialog(true);
  };

  const handleConfirmSubmit = async () => {
    setOpenSubmitDialog(false);
    setLoading(true);
    try {
      await axios.put(`/api/exams/${uuid}`, exam);
      setSnackbar({
        open: true,
        message: "考试更新成功！",
        severity: "success",
      });
      // 延迟导航，以用户能看到成功消息
      setTimeout(() => navigate("/exams"), 2000);
    } catch (error) {
      console.error("更新考试失败:", error);
      setSnackbar({
        open: true,
        message: "更新考试失败，请重试。",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const handleRestore = () => {
    setOpenRestoreDialog(true);
  };

  const handleConfirmRestore = () => {
    setOpenRestoreDialog(false);
    setExam(JSON.parse(JSON.stringify(initialExam))); // 深拷贝
  };

  const handleOpenNewQuestionDialog = (sectionIndex) => {
    setNewQuestionSectionIndex(sectionIndex);
    setOpenNewQuestionDialog(true);
  };

  const handleCloseNewQuestionDialog = () => {
    setOpenNewQuestionDialog(false);
    setNewQuestionSectionIndex(null);
  };

  const handleNewQuestionSubmit = (newQuestion) => {
    updateExam((prev) => {
      const newSections = [...prev.sections];
      const currentSection = newSections[newQuestionSectionIndex];
      const currentQuestions = currentSection.questions || [];
      currentSection.questions = [
        ...currentQuestions,
        {
          ...newQuestion,
          order_in_section: currentQuestions.length + 1,
        },
      ];
      return { sections: newSections };
    });
    setSnackbar({
      open: true,
      message: "新问题已成功添加到考试中！",
      severity: "success",
    });
    handleCloseNewQuestionDialog();
  };

  const handleGradeInfoChange = (school, grade) => {
    setExam((prev) => ({
      ...prev,
      gradeInfo: { school, grade },
    }));
  };

  const updateQuestionScore = (sectionIndex, questionIndex, newScore) => {
    updateExam((prev) => {
      const newSections = [...prev.sections];
      newSections[sectionIndex].questions[questionIndex].score = newScore;
      return { sections: newSections };
    });
  };

  if (loading || !exam) {
    return <CircularProgress />;
  }

  return (
    <ExamMainLayout currentPage="编辑考试">
      <Box sx={{ maxWidth: 800, mt: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <TextField
            label="名称"
            value={exam.name}
            InputProps={{
              readOnly: true,
              style: { color: "rgba(0, 0, 0, 0.38)" },
            }}
            disabled
            variant="outlined"
            sx={{ width: "200px" }}
          />
          <FormControl disabled sx={{ width: "150px" }}>
            <InputLabel style={{ color: "rgba(0, 0, 0, 0.38)" }}>
              科目
            </InputLabel>
            <NarrowSelect
              value={exam.category}
              label="科目"
              inputProps={{
                readOnly: true,
                style: { color: "rgba(0, 0, 0, 0.38)" },
              }}
              sx={{
                "& .MuiSelect-icon": {
                  color: "rgba(0, 0, 0, 0.38)",
                },
              }}
            >
              <MenuItem value="math">数学</MenuItem>
              <MenuItem value="english">英语</MenuItem>
              <MenuItem value="physics">物理</MenuItem>
            </NarrowSelect>
          </FormControl>
          <MultiLevelSelect
            onMultiSelectChange={handleGradeInfoChange}
            initialSchoolLevel={exam.gradeInfo.school}
            initialGrade={exam.gradeInfo.grade}
            error={false}
            disabled={true}
            readOnly={true}
            inline={true}
          />
        </Box>

        <Box sx={{ mt: 3, mb: 2, display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            提交
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleRestore}
            disabled={loading}
          >
            还原
          </Button>
        </Box>

        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
          模块
        </Typography>
        {exam.sections && exam.sections.length > 0 ? (
          exam.sections
            .sort((a, b) => a.order_in_exam - b.order_in_exam)
            .map((section, index) => (
              <Card key={section.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ mr: 2, minWidth: "80px" }}
                    >
                      第 {section.order_in_exam} 部分
                    </Typography>
                    <Box sx={{ flexGrow: 1 }}>
                      <InlineEdit
                        value={section.name}
                        onSave={(newName) => updateSectionName(index, newName)}
                        sx={{ width: "100%" }}
                      />
                    </Box>
                    <IconButton
                      onClick={() => moveSection(index, -1)}
                      disabled={index === 0}
                      size="small"
                    >
                      <ArrowUpwardIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => moveSection(index, 1)}
                      disabled={index === exam.sections.length - 1}
                      size="small"
                    >
                      <ArrowDownwardIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => deleteSection(index)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
                <CardActions sx={{ justifyContent: "flex-start" }}>
                  <Button
                    onClick={() =>
                      setExpandedSection(
                        expandedSection === index ? null : index
                      )
                    }
                    aria-expanded={expandedSection === index}
                    aria-label="显示更多"
                    startIcon={<ExpandMoreIcon />}
                  >
                    {expandedSection === index
                      ? "收起问题列表"
                      : "展开问题列表"}
                  </Button>
                </CardActions>
                <Collapse
                  in={expandedSection === index}
                  timeout="auto"
                  unmountOnExit
                >
                  <CardContent>
                    <TableContainer component={Paper}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>顺序</TableCell>
                            <TableCell>摘要</TableCell>
                            <TableCell>知识点</TableCell>
                            <TableCell>分值</TableCell>
                            <TableCell align="right">操作</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {section.questions
                            .sort(
                              (a, b) => a.order_in_section - b.order_in_section
                            )
                            .map((question, qIndex) => (
                              <TableRow key={question.uuid}>
                                <TableCell>
                                  {question.order_in_section}
                                </TableCell>
                                <TableCell>{question.digest}</TableCell>
                                <TableCell>{question.kn}</TableCell>
                                <TableCell>
                                  <InlineEdit
                                    value={question.score || ""}
                                    onSave={(newScore) =>
                                      updateQuestionScore(
                                        index,
                                        qIndex,
                                        newScore
                                      )
                                    }
                                    type="number"
                                    sx={{ width: "60px" }}
                                  />
                                </TableCell>
                                <TableCell align="right">
                                  <IconButton
                                    onClick={() =>
                                      moveQuestion(index, qIndex, -1)
                                    }
                                    disabled={qIndex === 0}
                                    size="small"
                                  >
                                    <ArrowUpwardIcon />
                                  </IconButton>
                                  <IconButton
                                    onClick={() =>
                                      moveQuestion(index, qIndex, 1)
                                    }
                                    disabled={
                                      qIndex === section.questions.length - 1
                                    }
                                    size="small"
                                  >
                                    <ArrowDownwardIcon />
                                  </IconButton>
                                  <IconButton
                                    onClick={() =>
                                      deleteQuestion(index, qIndex)
                                    }
                                    size="small"
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                      <Button
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenNewQuestionDialog(index)}
                      >
                        新建问题
                      </Button>
                      <Button
                        startIcon={<AddIcon />}
                        onClick={() => handleSelectQuestions(index)}
                      >
                        选择问题
                      </Button>
                    </Box>
                  </CardContent>
                </Collapse>
              </Card>
            ))
        ) : (
          <Typography>暂无模块</Typography>
        )}
        <Button
          startIcon={<AddIcon />}
          onClick={addSection}
          variant="outlined"
          fullWidth
        >
          添加新模块
        </Button>

        <Dialog
          open={openQuestionList}
          onClose={handleCloseQuestionList}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>选择问题</DialogTitle>
          <DialogContent>
            <QuestionList
              fixedCategory={exam.category}
              onSelectionChange={handleQuestionSelection}
              multiSelect={true}
              isFromExamEdit={true}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseQuestionList}>取消</Button>
            <Button onClick={handleAddSelectedQuestions} color="primary">
              添加所选问题
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={openDuplicateDialog} onClose={handleCloseDuplicateDialog}>
          <DialogTitle>重复的问题</DialogTitle>
          <DialogContent>
            <Typography>以下问题已经存在于考试中，无法重复添加：</Typography>
            <ul>
              {duplicateQuestions.map((q) => (
                <li key={q.uuid}>{q.digest}</li>
              ))}
            </ul>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDuplicateDialog}>确定</Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={openSubmitDialog}
          onClose={() => setOpenSubmitDialog(false)}
        >
          <DialogTitle>确认提交</DialogTitle>
          <DialogContent>
            <Typography>您确定要提交这些更改吗？</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenSubmitDialog(false)}>取消</Button>
            <Button onClick={handleConfirmSubmit} color="primary">
              确认
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={openRestoreDialog}
          onClose={() => setOpenRestoreDialog(false)}
        >
          <DialogTitle>确认还原</DialogTitle>
          <DialogContent>
            <Typography>
              您确定要还原到初始状态吗？所有未保存的更改将丢失。
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenRestoreDialog(false)}>取消</Button>
            <Button onClick={handleConfirmRestore} color="secondary">
              确认
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={openNewQuestionDialog}
          onClose={handleCloseNewQuestionDialog}
          maxWidth="xl"
          fullWidth
        >
          <DialogContent>
            <QuestionEdit
              onSubmit={handleNewQuestionSubmit}
              onCancel={handleCloseNewQuestionDialog}
              isDialog={true}
              initialCategory={exam.category}
              initialSchool={exam.gradeInfo.school}
              initialGrade={exam.gradeInfo.grade}
              initialKn={exam.kn}
              isFromExamEdit={true} // 添加这一行，传入选中的知识点
            />
          </DialogContent>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{
              width: "100%",
              maxWidth: "400px",
              boxShadow: 3,
              marginTop: "200px", // 从顶部往下移动 200px
            }}
            variant="filled"
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </ExamMainLayout>
  );
};

export default EditExam;
