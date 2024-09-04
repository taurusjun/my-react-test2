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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InlineEdit from "../../../components/InlineEdit";
import QuestionList from "../../../provider/components/QuestionList";

const EditExam = () => {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState({ sections: [] });
  const [initialExam, setInitialExam] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);
  const [openQuestionList, setOpenQuestionList] = useState(false);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(null);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [duplicateQuestions, setDuplicateQuestions] = useState([]);
  const [openDuplicateDialog, setOpenDuplicateDialog] = useState(false);

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
            name: "新部分",
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
    try {
      setLoading(true);
      await axios.put(`/api/exams/${uuid}`, exam);
      alert("考试更新成功！");
      navigate("/exams"); // 假设更新成功后跳转到考试列表页
    } catch (error) {
      console.error("更新考试失败:", error);
      alert("更新考试失败，请重试。");
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = () => {
    if (window.confirm("确定要还原到初始状态吗？所有未保存的更改将丢失。")) {
      setExam(JSON.parse(JSON.stringify(initialExam))); // 深拷贝
    }
  };

  if (loading || !exam) {
    return <CircularProgress />;
  }

  return (
    <Box sx={{ maxWidth: 800, mt: 2 }}>
      <TextField
        label="名称"
        value={exam.name}
        fullWidth
        margin="normal"
        InputProps={{
          readOnly: true,
          style: { color: "rgba(0, 0, 0, 0.38)" },
          disableUnderline: true,
        }}
        disabled
      />
      <FormControl fullWidth margin="normal" disabled>
        <InputLabel style={{ color: "rgba(0, 0, 0, 0.38)" }}>科目</InputLabel>
        <Select
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
        </Select>
      </FormControl>
      <FormControl fullWidth margin="normal" disabled>
        <InputLabel style={{ color: "rgba(0, 0, 0, 0.38)" }}>阶段</InputLabel>
        <Select
          value={exam.stage}
          label="阶段"
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
          <MenuItem value="primary">小学</MenuItem>
          <MenuItem value="middle">中学</MenuItem>
          <MenuItem value="high">高中</MenuItem>
        </Select>
      </FormControl>

      {/* 添加提交和还原按钮 */}
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
        考试部分
      </Typography>
      {exam.sections && exam.sections.length > 0 ? (
        exam.sections
          .sort((a, b) => a.order_in_exam - b.order_in_exam)
          .map((section, index) => (
            <Card key={section.id} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  顺序: {section.order_in_exam}
                </Typography>
                <InlineEdit
                  value={section.name}
                  onSave={(newName) => updateSectionName(index, newName)}
                />
              </CardContent>
              <CardActions>
                <IconButton
                  onClick={() => moveSection(index, -1)}
                  disabled={index === 0}
                >
                  <ArrowUpwardIcon />
                </IconButton>
                <IconButton
                  onClick={() => moveSection(index, 1)}
                  disabled={index === exam.sections.length - 1}
                >
                  <ArrowDownwardIcon />
                </IconButton>
                <IconButton onClick={() => deleteSection(index)}>
                  <DeleteIcon />
                </IconButton>
                <Button
                  onClick={() =>
                    setExpandedSection(expandedSection === index ? null : index)
                  }
                  aria-expanded={expandedSection === index}
                  aria-label="显示更多"
                  endIcon={<ExpandMoreIcon />}
                  sx={{ marginLeft: "auto" }}
                >
                  {expandedSection === index ? "收起问题列表" : "展开问题列表"}
                </Button>
              </CardActions>
              <Collapse
                in={expandedSection === index}
                timeout="auto"
                unmountOnExit
              >
                <CardContent>
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    题目列表
                  </Typography>
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>顺序</TableCell>
                          <TableCell>摘要</TableCell>
                          <TableCell>难度</TableCell>
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
                              <TableCell>{question.order_in_section}</TableCell>
                              <TableCell>{question.digest}</TableCell>
                              <TableCell>{question.difficulty}</TableCell>
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
                                  onClick={() => moveQuestion(index, qIndex, 1)}
                                  disabled={
                                    qIndex === section.questions.length - 1
                                  }
                                  size="small"
                                >
                                  <ArrowDownwardIcon />
                                </IconButton>
                                <IconButton
                                  onClick={() => deleteQuestion(index, qIndex)}
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
                  <Button
                    startIcon={<AddIcon />}
                    onClick={() => handleSelectQuestions(index)}
                    sx={{ mt: 2 }}
                  >
                    选择问题
                  </Button>
                </CardContent>
              </Collapse>
            </Card>
          ))
      ) : (
        <Typography>暂无考试部分</Typography>
      )}
      <Button
        startIcon={<AddIcon />}
        onClick={addSection}
        variant="outlined"
        fullWidth
      >
        添加新部分
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
    </Box>
  );
};

export default EditExam;
