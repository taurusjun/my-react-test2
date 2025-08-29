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
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import MultiLevelSelect from "../../provider/components/MultiLevelSelect";
import { CategoryDict } from "../../provider/utils/dictionaries";
import { useDictionaries } from "../../provider/hooks/useDictionaries";
import { normalizeAnswer, createAnswer } from "../../utils/answerUtils";

// 可重用的Markdown渲染组件
const MarkdownRenderer = ({ content, sx = {} }) => {
  if (!content) return null;
  
  return (
    <Box sx={sx}>
      <ReactMarkdown
        components={{
          p: ({ node, ...props }) => (
            <p style={{ margin: "8px 0" }} {...props} />
          ),
          code: ({ node, inline, className, children, ...props }) => (
            <code
              style={{
                backgroundColor: "#f0f0f0",
                padding: inline ? "2px 4px" : "8px 12px",
                borderRadius: "3px",
                fontFamily: "Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace",
                fontSize: "13px",
                border: "1px solid #e1e1e1",
                display: inline ? "inline" : "block",
                whiteSpace: inline ? "nowrap" : "pre",
              }}
              {...props}
            >
              {children}
            </code>
          ),
          pre: ({ node, ...props }) => (
            <pre
              style={{
                backgroundColor: "#f8f8f8",
                padding: "12px",
                borderRadius: "6px",
                overflow: "auto",
                border: "1px solid #e1e1e1",
                margin: "12px 0",
              }}
              {...props}
            />
          ),
        }}
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeRaw]}
      >
        {content}
      </ReactMarkdown>
    </Box>
  );
};

const ExamEditor = ({ exam, onExamChange }) => {
  const { dictionaries } = useDictionaries();
  const [availableKnowledgeNodes, setAvailableKnowledgeNodes] = useState([]);
  const [editedExam, setEditedExam] = useState(exam);
  const [editingMaterialIndex, setEditingMaterialIndex] = useState(null);
  const [editingSectionIndex, setEditingSectionIndex] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
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

  const handleSectionNameChange = (sectionIndex, value) => {
    const updatedSections = [...editedExam.sections];
    updatedSections[sectionIndex].name = value;
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
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5">编辑试卷</Typography>
        <Button
          variant="outlined"
          onClick={() => setPreviewMode(!previewMode)}
          sx={{ minWidth: 120 }}
        >
          {previewMode ? "编辑模式" : "预览模式"}
        </Button>
      </Box>
      
      {!previewMode && (
        <Box sx={{ mb: 2, p: 2, bgcolor: "#e3f2fd", borderRadius: 1 }}>
          <Typography variant="body2" color="primary">
            💡 Markdown支持提示：
            <br />
            • <strong>LaTeX公式</strong>：行内公式用 <code>$公式$</code>，块级公式用 <code>$$公式$$</code>
            <br />
            • <strong>代码块</strong>：用 <code>```语言\n代码\n```</code>
            <br />
            • <strong>其他语法</strong>：**粗体**、*斜体*、`行内代码`等
          </Typography>
        </Box>
      )}

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
          {editingSectionIndex === sectionIndex ? (
            <Box sx={{ mb: 2, display: "flex", alignItems: "flex-start" }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", color: "#333", minWidth: "40px", mt: 1 }}
              >
                {sectionIndex + 1}.
              </Typography>
              <Box sx={{ flex: 1, ml: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <IconButton
                    color="primary"
                    onClick={() => setEditingSectionIndex(null)}
                    sx={{ mr: 1 }}
                  >
                    <CheckIcon fontSize="small" />
                  </IconButton>
                  {previewMode && (
                    <Typography variant="body2" color="text.secondary">
                      预览模式：
                    </Typography>
                  )}
                </Box>
                {previewMode ? (
                  <MarkdownRenderer
                    content={section.name}
                    sx={{
                      border: "1px solid #e0e0e0",
                      padding: "12px",
                      borderRadius: "4px",
                      backgroundColor: "#f9f9f9",
                      "& h1, & h2, & h3, & h4, & h5, & h6": {
                        fontSize: "1.25rem",
                        fontWeight: "bold",
                        margin: "4px 0",
                      },
                      "& p": {
                        fontSize: "1.25rem",
                        fontWeight: "bold",
                        margin: "4px 0",
                      },
                    }}
                  />
                ) : (
                  <TextField
                    value={section.name}
                    onChange={(e) =>
                      handleSectionNameChange(sectionIndex, e.target.value)
                    }
                    fullWidth
                    variant="outlined"
                    multiline
                    rows={2}
                    placeholder="输入章节名称（支持Markdown语法）"
                  />
                )}
              </Box>
            </Box>
          ) : (
            <Box sx={{ mb: 2, display: "flex", alignItems: "center" }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", color: "#333", minWidth: "40px" }}
              >
                {sectionIndex + 1}.
              </Typography>
              <IconButton
                color="primary"
                onClick={() => setEditingSectionIndex(sectionIndex)}
                sx={{ mr: 1 }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <Box sx={{ flex: 1 }}>
                {previewMode ? (
                  <MarkdownRenderer
                    content={section.name}
                    sx={{
                      "& h1, & h2, & h3, & h4, & h5, & h6": {
                        fontSize: "1.25rem",
                        fontWeight: "bold",
                        margin: 0,
                        color: "#333",
                      },
                      "& p": {
                        fontSize: "1.25rem",
                        fontWeight: "bold",
                        margin: 0,
                        color: "#333",
                      },
                    }}
                  />
                ) : (
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: "bold", color: "#333" }}
                  >
                    {section.name}
                  </Typography>
                )}
              </Box>
            </Box>
          )}
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
                      <MarkdownRenderer
                        content={question.material}
                        sx={{
                          border: "1px solid #ccc",
                          padding: "10px",
                          borderRadius: "4px",
                          flexGrow: 1,
                        }}
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
                  {previewMode ? (
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
                        题目：
                      </Typography>
                      <MarkdownRenderer
                        content={detail.questionContent.value}
                        sx={{
                          border: "1px solid #e0e0e0",
                          padding: "12px",
                          borderRadius: "4px",
                          backgroundColor: "#fafafa",
                        }}
                      />
                    </Box>
                  ) : (
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
                      InputProps={{ style: { textAlign: "left" } }}
                      multiline
                      rows={4}
                    />
                  )}
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
                                {previewMode ? (
                                  <MarkdownRenderer
                                    content={row.value}
                                    sx={{
                                      border: "1px solid #e0e0e0",
                                      padding: "8px",
                                      borderRadius: "4px",
                                      backgroundColor: "#fafafa",
                                      ml: 2,
                                      flexGrow: 1,
                                    }}
                                  />
                                ) : (
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
                                )}
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
                  ) : previewMode ? (
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
                        答案：
                      </Typography>
                      <MarkdownRenderer
                        content={detail.answer?.content?.join(", ") || ""}
                        sx={{
                          border: "1px solid #e0e0e0",
                          padding: "12px",
                          borderRadius: "4px",
                          backgroundColor: "#fff3e0",
                        }}
                      />
                    </Box>
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
                      InputProps={{ style: { textAlign: "left" } }}
                      multiline
                      rows={4}
                    />
                  )}
                  {previewMode ? (
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
                        解释：
                      </Typography>
                      <MarkdownRenderer
                        content={detail.explanation || ""}
                        sx={{
                          border: "1px solid #e0e0e0",
                          padding: "12px",
                          borderRadius: "4px",
                          backgroundColor: "#f3e5f5",
                        }}
                      />
                    </Box>
                  ) : (
                    <TextField
                      label="解释"
                      value={detail.explanation || ""}
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
                      InputProps={{ style: { textAlign: "left" } }}
                      multiline
                      rows={4}
                    />
                  )}
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
