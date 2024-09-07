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
import { useDictionaries } from "../../../provider/hooks/useDictionaries";
import CommonLayout from "../../../layouts/CommonLayout";
import CommonBreadcrumbs from "../../../components/CommonBreadcrumbs";
import { getBreadcrumbPaths } from "../../../config/breadcrumbPaths";

const EditExam = () => {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState({
    name: "",
    sections: [],
    gradeInfo: { school: "", grade: "" },
    duration: 0,
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
  const {
    dictionaries,
    loading: dictionariesLoading,
    error: dictionariesError,
  } = useDictionaries();

  // 使用 useMemo 来缓存已存在的问题 UUID 集合
  const existingQuestionUuids = useMemo(() => {
    return new Set(
      exam.sections.flatMap((section) => section.questions.map((q) => q.uuid))
    );
  }, [exam.sections]);

  // 使用 useMemo 计算 section 数量和总分值
  const examStats = useMemo(() => {
    const sectionCount = exam.sections.length;
    const totalScore = exam.sections.reduce((total, section) => {
      return (
        total +
        section.questions.reduce((sectionTotal, question) => {
          return sectionTotal + (Number(question.score) || 0);
        }, 0)
      );
    }, 0);
    return { sectionCount, totalScore };
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
          score: 0, // 设置默认分数为 0
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
          score: 0, // 设置默认分数为 0
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

  const handleExamNameChange = (event) => {
    const newName = event.target.value;
    setExam((prevExam) => ({
      ...prevExam,
      name: newName,
    }));
  };

  const handleDurationChange = (newDuration) => {
    setExam((prevExam) => ({
      ...prevExam,
      duration: Number(newDuration),
    }));
  };

  const breadcrumbPaths = getBreadcrumbPaths();

  if (loading || !exam) {
    return <CircularProgress />;
  }

  if (dictionariesLoading) {
    return <CircularProgress />;
  }

  if (dictionariesError) {
    return (
      <Typography color="error">
        加载字典数据失败: {dictionariesError.message}
      </Typography>
    );
  }

  return (
    <CommonLayout
      currentPage="考卷编辑"
      maxWidth="xl"
      showBreadcrumbs={true}
      BreadcrumbsComponent={() => (
        <CommonBreadcrumbs paths={breadcrumbPaths.examEdit} />
      )}
    >
      <Box sx={{ maxWidth: 800, mt: 2 }}>
        <Grid container spacing={2}>
          {/* 名称占满第一行 */}
          <Grid item xs={12}>
            <TextField
              label="名称"
              value={exam.name}
              onChange={handleExamNameChange}
              variant="outlined"
              fullWidth
            />
          </Grid>

          {/* 科目、学习阶段、年级、时长在第二行 */}
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth disabled>
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
                {Object.entries(dictionaries.CategoryDict).map(
                  ([key, value]) => (
                    <MenuItem key={key} value={key}>
                      {value}
                    </MenuItem>
                  )
                )}
              </NarrowSelect>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <MultiLevelSelect
              onMultiSelectChange={handleGradeInfoChange}
              initialSchoolLevel={exam.gradeInfo.school}
              initialGrade={exam.gradeInfo.grade}
              error={false}
              disabled={true}
              readOnly={true}
              inline={true}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                height: "100%",
                whiteSpace: "nowrap",
              }}
            >
              <Typography variant="body1" sx={{ mr: 1, flexShrink: 0 }}>
                时长:
              </Typography>
              <InlineEdit
                value={exam.duration ? exam.duration.toString() : ""}
                onSave={handleDurationChange}
                isNumber={true}
                width="100px"
              />
              <Typography variant="body1" sx={{ ml: 1, flexShrink: 0 }}>
                分钟
              </Typography>
            </Box>
          </Grid>

          {/* 统计信息在第三行 */}
          <Grid item xs={12}>
            <Typography
              variant="body1"
              sx={{ fontWeight: "bold", color: "text.secondary" }}
            >
              共 {examStats.sectionCount} 个模块 | 总分值:{" "}
              {examStats.totalScore} 分
            </Typography>
          </Grid>
        </Grid>

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
                                <TableCell>
                                  {dictionaries.KNDict[question.kn]}
                                </TableCell>
                                <TableCell>
                                  <InlineEdit
                                    value={
                                      question.score !== undefined
                                        ? question.score.toString()
                                        : ""
                                    }
                                    onSave={(newScore) =>
                                      updateQuestionScore(
                                        index,
                                        qIndex,
                                        newScore
                                      )
                                    }
                                    isNumber={true}
                                    width="60px"
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
            <Typography>以下问已经存在于考试中，无法重复添加：</Typography>
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
    </CommonLayout>
  );
};

export default EditExam;
