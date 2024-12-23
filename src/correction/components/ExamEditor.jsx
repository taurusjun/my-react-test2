import React, { useState } from "react";
import {
  TextField,
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";

const ExamEditor = ({ exam, onSave }) => {
  const [editedExam, setEditedExam] = useState(exam);
  const [editingMaterialIndex, setEditingMaterialIndex] = useState(null);

  const handleDetailChange = (
    sectionIndex,
    questionIndex,
    detailIndex,
    field,
    value
  ) => {
    const updatedSections = [...editedExam.sections];
    updatedSections[sectionIndex].questions[questionIndex].questionDetails[
      detailIndex
    ][field] = value;
    setEditedExam({ ...editedExam, sections: updatedSections });
  };

  const handleRowChange = (
    sectionIndex,
    questionIndex,
    detailIndex,
    rowIndex,
    value
  ) => {
    const updatedSections = [...editedExam.sections];
    updatedSections[sectionIndex].questions[questionIndex].questionDetails[
      detailIndex
    ].rows[rowIndex].value = value;
    setEditedExam({ ...editedExam, sections: updatedSections });
  };

  const handleMaterialChange = (sectionIndex, questionIndex, value) => {
    const updatedSections = [...editedExam.sections];
    updatedSections[sectionIndex].questions[questionIndex].material = value;
    setEditedExam({ ...editedExam, sections: updatedSections });
  };

  const handleDigestChange = (sectionIndex, questionIndex, value) => {
    const updatedSections = [...editedExam.sections];
    updatedSections[sectionIndex].questions[questionIndex].digest = value;
    setEditedExam({ ...editedExam, sections: updatedSections });
  };

  const handleSave = () => {
    onSave(editedExam);
  };

  return (
    <Box>
      <Typography variant="h5">编辑试卷</Typography>
      {editedExam.sections.map((section, sectionIndex) => (
        <Box key={section.uuid} sx={{ mb: 4 }}>
          <Typography variant="h6">
            {sectionIndex + 1}. {section.name} {/* 显示 section 序号 */}
          </Typography>
          {section.questions.map((question, questionIndex) => (
            <Box key={question.uuid} sx={{ mb: 2 }}>
              <Box sx={{ position: "relative", mb: 1 }}>
                {editingMaterialIndex === `${sectionIndex}-${questionIndex}` ? (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                    }}
                  >
                    <IconButton
                      color="primary"
                      onClick={() => setEditingMaterialIndex(null)} // 完成编辑
                      sx={{ mb: 1 }} // 添加下边距
                    >
                      <CheckIcon fontSize="small" />
                    </IconButton>
                    <TextField
                      value={question.material}
                      onChange={(e) =>
                        handleMaterialChange(
                          sectionIndex,
                          questionIndex,
                          e.target.value
                        )
                      }
                      fullWidth
                      variant="outlined"
                      multiline
                      rows={4}
                    />
                  </Box>
                ) : (
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <IconButton
                      color="primary"
                      onClick={() =>
                        setEditingMaterialIndex(
                          `${sectionIndex}-${questionIndex}`
                        )
                      } // 进入编辑模式
                      sx={{ mr: 1 }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    {question.material ? (
                      <Box
                        sx={{
                          border: "1px solid #ccc",
                          padding: "10px",
                          borderRadius: "4px",
                          flexGrow: 1,
                        }}
                        dangerouslySetInnerHTML={{ __html: question.material }}
                      />
                    ) : null}
                  </Box>
                )}
              </Box>
              <TextField
                label="摘要"
                value={question.digest}
                onChange={(e) =>
                  handleDigestChange(
                    sectionIndex,
                    questionIndex,
                    e.target.value
                  )
                }
                fullWidth
                variant="outlined"
                sx={{ mb: 1 }}
              />
              {question.questionDetails.map((detail, detailIndex) => (
                <Box key={detail.uuid} sx={{ mb: 2 }}>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    第 {questionIndex + 1}.{detailIndex + 1} 题{" "}
                    {/* 显示小题序号 */}
                  </Typography>
                  <TextField
                    label="题目"
                    value={detail.questionContent.value}
                    onChange={(e) =>
                      handleDetailChange(
                        sectionIndex,
                        questionIndex,
                        detailIndex,
                        "questionContent",
                        { ...detail.questionContent, value: e.target.value }
                      )
                    }
                    fullWidth
                    variant="outlined"
                    sx={{ mb: 1 }}
                    InputProps={{ style: { textAlign: "left" } }} // 左对齐
                    multiline // 设置为多行文本框
                    rows={4} // 设置行数
                  />
                  <TextField
                    label="答案"
                    value={detail.answer.join(", ")}
                    onChange={(e) =>
                      handleDetailChange(
                        sectionIndex,
                        questionIndex,
                        detailIndex,
                        "answer",
                        e.target.value.split(", ")
                      )
                    }
                    fullWidth
                    variant="outlined"
                    sx={{ mb: 1 }}
                    InputProps={{ style: { textAlign: "left" } }} // 左对齐
                    multiline // 设置为多行文本框
                    rows={4} // 设置行数
                  />
                  <TextField
                    label="解释"
                    value={detail.explanation || ""} // 如果没有解释，默认空行
                    onChange={(e) =>
                      handleDetailChange(
                        sectionIndex,
                        questionIndex,
                        detailIndex,
                        "explanation",
                        e.target.value
                      )
                    }
                    fullWidth
                    variant="outlined"
                    sx={{ mb: 1 }}
                    InputProps={{ style: { textAlign: "left" } }} // 左对齐
                    multiline // 设置为多行文本框
                    rows={4} // 设置行数
                  />
                  {detail.uiType === "single_selection" && (
                    <>
                      <Typography variant="subtitle1">选项:</Typography>
                      <List>
                        {detail.rows.map((row, rowIndex) => (
                          <ListItem key={rowIndex}>
                            <ListItemText
                              primary={`${String.fromCharCode(
                                65 + rowIndex
                              )}. `}
                            />
                            <TextField
                              value={row.value}
                              onChange={(e) =>
                                handleRowChange(
                                  sectionIndex,
                                  questionIndex,
                                  detailIndex,
                                  rowIndex,
                                  e.target.value
                                )
                              }
                              fullWidth
                              variant="outlined"
                              sx={{ mb: 1 }}
                              InputProps={{ style: { textAlign: "left" } }} // 左对齐
                              multiline // 设置为多行文本框
                              rows={4} // 设置行数
                            />
                          </ListItem>
                        ))}
                      </List>
                    </>
                  )}
                </Box>
              ))}
            </Box>
          ))}
        </Box>
      ))}
      <Button variant="contained" color="primary" onClick={handleSave}>
        保存
      </Button>
    </Box>
  );
};

export default ExamEditor;
