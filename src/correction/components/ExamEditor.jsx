import React, { useState, useRef, useEffect } from "react";
import {
  TextField,
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Select,
  MenuItem,
  IconButton,
  Grid,
  FormControl,
  InputLabel,
  Paper,
  Divider,
  StyledPaper,
  SectionTitle,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import UploadIcon from "@mui/icons-material/Upload";
import DeleteIcon from "@mui/icons-material/Delete";
import MultiLevelSelect from "../../provider/components/MultiLevelSelect";
import { CategoryDict } from "../../provider/utils/dictionaries";
import { useDictionaries } from "../../provider/hooks/useDictionaries";
import { normalizeAnswer, createAnswer } from "../../utils/answerUtils";

const ExamEditor = ({ exam, onExamChange }) => {
  const { dictionaries } = useDictionaries();
  const [availableKnowledgeNodes, setAvailableKnowledgeNodes] = useState([]);
  const [editedExam, setEditedExam] = useState(exam);
  const [editingMaterialIndex, setEditingMaterialIndex] = useState(null);
  const fileInputRefs = useRef([]);

  useEffect(() => {
    if (exam.category && dictionaries.CategoryKNMapping) {
      const knList = dictionaries.CategoryKNMapping[exam.category] || [];
      setAvailableKnowledgeNodes(knList);
      if (knList.length > 0 && !knList.includes(exam.kn)) {
        onExamChange({ ...exam, kn: "" });
      }
    } else {
      setAvailableKnowledgeNodes([]);
    }
  }, [exam.category, dictionaries.CategoryKNMapping, exam.kn, onExamChange]);

  const handleDetailChange = (
    sectionIndex,
    questionIndex,
    detailIndex,
    field,
    value
  ) => {
    const updatedSections = [...editedExam.sections];
    const detail = updatedSections[sectionIndex].questions[questionIndex].questionDetails[detailIndex];
    
    // 特殊处理answer字段，确保结构正确
    if (field === "answer") {
      detail.answer = normalizeAnswer(value);
    } else {
      detail[field] = value;
    }
    
    setEditedExam({ ...editedExam, sections: updatedSections });
    onExamChange({ ...editedExam, sections: updatedSections });
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
    onExamChange({ ...editedExam, sections: updatedSections });
  };

  const handleMaterialChange = (sectionIndex, questionIndex, value) => {
    const updatedSections = [...editedExam.sections];
    updatedSections[sectionIndex].questions[questionIndex].material = value;
    setEditedExam({ ...editedExam, sections: updatedSections });
    onExamChange({ ...editedExam, sections: updatedSections });
  };

  const handleDigestChange = (sectionIndex, questionIndex, value) => {
    const updatedSections = [...editedExam.sections];
    updatedSections[sectionIndex].questions[questionIndex].digest = value;
    setEditedExam({ ...editedExam, sections: updatedSections });
    onExamChange({ ...editedExam, sections: updatedSections });
  };

  const convertFilesToBase64 = (files) => {
    const images = Array.from(files)
      .filter((file) => file.type.startsWith("image/"))
      .map((file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result); // 读取结果是 Base64 编码的字符串
          };
          reader.onerror = (error) => {
            reject(error);
          };
          reader.readAsDataURL(file); // 读取文件为 Data URL
        });
      });

    return Promise.all(images); // 返回一个 Promise，解析为所有 Base64 图像
  };

  const handleQuestionImageUpload = (
    sectionIndex,
    questionIndex,
    detailIndex,
    files
  ) => {
    const updatedSections = [...editedExam.sections];

    convertFilesToBase64(files).then((base64Images) => {
      if (base64Images.length > 0) {
        updatedSections[sectionIndex].questions[questionIndex].questionDetails[
          detailIndex
        ].questionContent.images.push(...base64Images);
        setEditedExam({ ...editedExam, sections: updatedSections });
        onExamChange({ ...editedExam, sections: updatedSections });
      }

      // 清空文件输入的值
      if (fileInputRefs.current[detailIndex]) {
        fileInputRefs.current[detailIndex].value = ""; // 仅在存在时设置值
      }
    });
  };

  const handleRowImageUpload = (
    sectionIndex,
    questionIndex,
    detailIndex,
    rowIndex,
    files
  ) => {
    const updatedSections = [...editedExam.sections];

    convertFilesToBase64(files).then((base64Images) => {
      if (base64Images.length > 0) {
        if (
          !updatedSections[sectionIndex].questions[questionIndex]
            .questionDetails[detailIndex].rows[rowIndex].images
        ) {
          updatedSections[sectionIndex].questions[
            questionIndex
          ].questionDetails[detailIndex].rows[rowIndex].images = [];
        }

        updatedSections[sectionIndex].questions[questionIndex].questionDetails[
          detailIndex
        ].rows[rowIndex].images.push(...base64Images);

        setEditedExam({ ...editedExam, sections: updatedSections });
        onExamChange({ ...editedExam, sections: updatedSections });
      }

      // 清空文件输入的值
      if (fileInputRefs.current[detailIndex]) {
        fileInputRefs.current[detailIndex].value = ""; // 仅在存在时设置值
      }
    });
  };

  const handleRowImageDelete = (
    sectionIndex,
    questionIndex,
    detailIndex,
    rowIndex,
    imageIndex
  ) => {
    const updatedSections = [...editedExam.sections];
    const images =
      updatedSections[sectionIndex].questions[questionIndex].questionDetails[
        detailIndex
      ].rows[rowIndex].images;

    images.splice(imageIndex, 1);

    setEditedExam({ ...editedExam, sections: updatedSections });
    onExamChange({ ...editedExam, sections: updatedSections });
  };

  const handleSave = () => {
    onExamChange(editedExam);
  };

  const handleQuestionImageDelete = (
    sectionIndex,
    questionIndex,
    detailIndex,
    imageIndex
  ) => {
    const updatedSections = [...editedExam.sections];
    const images =
      updatedSections[sectionIndex].questions[questionIndex].questionDetails[
        detailIndex
      ].questionContent.images;

    images.splice(imageIndex, 1);

    setEditedExam({ ...editedExam, sections: updatedSections });
    onExamChange({ ...editedExam, sections: updatedSections });
  };

  const handleGradeInfoChange = (schoolLevel, grade) => {
    onExamChange({ ...exam, gradeInfo: { school: schoolLevel, grade } });
  };

  return (
    <Box>
      <Typography variant="h5">编辑试卷</Typography>

      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          试卷信息
        </Typography>
        <Divider sx={{ my: 2 }} />

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              label="名称"
              value={exam.name}
              onChange={(e) => onExamChange({ ...exam, name: e.target.value })}
              variant="outlined"
              sx={{ mb: 2 }}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <FormControl required fullWidth variant="outlined" sx={{ mb: 2 }}>
              <InputLabel>科目</InputLabel>
              <Select
                value={exam.category}
                onChange={(e) =>
                  onExamChange({ ...exam, category: e.target.value })
                }
                label="科目"
              >
                {Object.entries(CategoryDict).map(([key, value]) => (
                  <MenuItem key={key} value={key}>
                    {value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="来源"
              value={exam.source || ""}
              onChange={(e) =>
                onExamChange({ ...exam, source: e.target.value })
              }
              variant="outlined"
              sx={{ mb: 2 }}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <MultiLevelSelect
              onMultiSelectChange={handleGradeInfoChange}
              initialSchoolLevel={exam.gradeInfo.school}
              initialGrade={exam.gradeInfo.grade}
              error={false}
              disabled={false}
              readOnly={false}
              inline={true}
              required={true}
              sx={{ mb: 2 }}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <FormControl required fullWidth variant="outlined" sx={{ mb: 2 }}>
              <InputLabel>知识点</InputLabel>
              <Select
                value={exam.kn}
                onChange={(e) => onExamChange({ ...exam, kn: e.target.value })}
                label="知识点"
              >
                {availableKnowledgeNodes.map((kn) => (
                  <MenuItem key={kn} value={kn}>
                    {dictionaries.KNDict[kn] || kn}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {editedExam.sections.map((section, sectionIndex) => (
        <Box
          key={section.uuid}
          sx={{
            mb: 4,
            border: "1px solid #e0e0e0",
            borderRadius: "8px",
            padding: 2,
            boxShadow: 3,
            backgroundColor: "#f9f9f9",
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", mb: 2, color: "#333" }}
          >
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
                  <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      style={{ display: "none" }}
                      id={`upload-button-question-${sectionIndex}-${questionIndex}-${detailIndex}`}
                      onChange={(e) =>
                        handleQuestionImageUpload(
                          sectionIndex,
                          questionIndex,
                          detailIndex,
                          e.target.files
                        )
                      }
                    />
                    <label
                      htmlFor={`upload-button-question-${sectionIndex}-${questionIndex}-${detailIndex}`}
                    >
                      <Button
                        variant="contained"
                        component="span"
                        startIcon={<UploadIcon />}
                        sx={{ mb: 1, mr: 2 }} // 增加右边距
                      >
                        上传图片
                      </Button>
                    </label>

                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        flexWrap: "wrap",
                      }}
                    >
                      {detail.questionContent.images &&
                        detail.questionContent.images.map((image, index) => (
                          <div
                            key={index}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              marginBottom: "5px",
                              marginRight: "5px",
                            }}
                          >
                            <img
                              src={image}
                              alt={`Uploaded ${index}`}
                              style={{
                                width: "100px",
                                marginRight: "5px",
                              }}
                            />
                            <IconButton
                              onClick={() =>
                                handleQuestionImageDelete(
                                  sectionIndex,
                                  questionIndex,
                                  detailIndex,
                                  index // 确保传递正确的 index
                                )
                              }
                            >
                              <DeleteIcon />
                            </IconButton>
                          </div>
                        ))}
                    </Box>
                  </Box>
                  {detail.uiType === "single_selection" && (
                    <>
                      <Typography variant="subtitle1">选项:</Typography>
                      <List>
                        {detail.rows.map((row, rowIndex) => (
                          <ListItem key={rowIndex} sx={{ mb: 2 }}>
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                width: "100%",
                              }}
                            >
                              <Box
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                <ListItemText
                                  primary={`${String.fromCharCode(
                                    65 + rowIndex
                                  )}. `}
                                  sx={{ mb: 1 }}
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
                                  sx={{ mb: 1, ml: 2 }}
                                  InputProps={{ style: { textAlign: "left" } }}
                                  multiline
                                  rows={4}
                                />
                              </Box>

                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  mt: 1,
                                }}
                              >
                                <input
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  style={{ display: "none" }}
                                  id={`upload-button-row-${sectionIndex}-${questionIndex}-${detailIndex}-${rowIndex}`}
                                  onChange={(e) =>
                                    handleRowImageUpload(
                                      sectionIndex,
                                      questionIndex,
                                      detailIndex,
                                      rowIndex,
                                      e.target.files
                                    )
                                  }
                                />
                                <label
                                  htmlFor={`upload-button-row-${sectionIndex}-${questionIndex}-${detailIndex}-${rowIndex}`}
                                >
                                  <Button
                                    variant="contained"
                                    component="span"
                                    startIcon={<UploadIcon />}
                                    sx={{ mb: 1, mr: 2 }}
                                  >
                                    上传图片
                                  </Button>
                                </label>

                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: "row",
                                    flexWrap: "wrap",
                                  }}
                                >
                                  {row.images &&
                                    row.images.map((image, index) => (
                                      <div
                                        key={index}
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          marginBottom: "5px",
                                          marginRight: "5px",
                                        }}
                                      >
                                        <img
                                          src={image}
                                          alt={`Uploaded ${index}`}
                                          style={{
                                            width: "100px",
                                            marginRight: "5px",
                                          }}
                                        />
                                        <IconButton
                                          onClick={() =>
                                            handleRowImageDelete(
                                              sectionIndex,
                                              questionIndex,
                                              detailIndex,
                                              rowIndex,
                                              index
                                            )
                                          }
                                        >
                                          <DeleteIcon />
                                        </IconButton>
                                      </div>
                                    ))}
                                </Box>
                              </Box>
                            </Box>
                          </ListItem>
                        ))}
                      </List>
                    </>
                  )}
                  {detail.uiType === "single_selection" ? (
                    <>
                      <Typography variant="subtitle1">答案:</Typography>
                      <Select
                        value={detail.answer?.content?.[0] || ""} // 默认选择第一个答案
                        onChange={(e) =>
                          handleDetailChange(
                            sectionIndex,
                            questionIndex,
                            detailIndex,
                            "answer",
                            {
                              content: [e.target.value],
                              images: detail.answer?.images || []
                            }
                          )
                        }
                        fullWidth
                        variant="outlined"
                        sx={{ mb: 1 }}
                      >
                        {/* 根据 rows 的长度生成选项 */}
                        {detail.rows.map((row, index) => (
                          <MenuItem
                            key={index}
                            value={String.fromCharCode(65 + index)}
                          >
                            {/* 65 是 'A' 的 ASCII 码 */}
                            {String.fromCharCode(65 + index)}
                            {/* 生成 A, B, C, D 等 */}
                          </MenuItem>
                        ))}
                      </Select>
                    </>
                  ) : (
                    <TextField
                      label="答案"
                      value={detail.answer?.content?.join(", ") || ""}
                      onChange={(e) =>
                        handleDetailChange(
                          sectionIndex,
                          questionIndex,
                          detailIndex,
                          "answer",
                          {
                            content: [e.target.value],
                            images: detail.answer?.images || []
                          }
                        )
                      }
                      fullWidth
                      variant="outlined"
                      sx={{ mb: 1 }}
                      InputProps={{ style: { textAlign: "left" } }} // 左对齐
                      multiline // 设置为多行文本框
                      rows={4} // 设置行数
                    />
                  )}
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
                </Box>
              ))}
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );
};

export default ExamEditor;
