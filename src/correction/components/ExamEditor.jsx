import { useState, useRef, useEffect } from "react";
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
import { normalizeAnswer } from "../../utils/answerUtils";

// Inline markdown渲染组件
const InlineMarkdownRenderer = ({ content, sx = {} }) => {
  if (!content) return null;
  
  return (
    <Box sx={{ display: "inline-block", width: "100%", ...sx }}>
      <ReactMarkdown
        components={{
          p: ({ node, ...props }) => (
            <span style={{ margin: 0, lineHeight: "1.4" }} {...props} />
          ),
          code: ({ node, inline, className, children, ...props }) => (
            <code
              style={{
                backgroundColor: inline ? "#f5f5f5" : "#f8f8f8",
                padding: inline ? "1px 3px" : "4px 6px",
                borderRadius: "3px",
                fontFamily: "Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace",
                fontSize: inline ? "0.9em" : "0.85em",
                border: "1px solid #e1e1e1",
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
                padding: "8px",
                borderRadius: "4px",
                overflow: "auto",
                border: "1px solid #e1e1e1",
                margin: "4px 0",
                lineHeight: "1.2",
              }}
              {...props}
            />
          ),
          h1: ({ node, ...props }) => <span style={{ fontSize: "1.2em", fontWeight: "bold" }} {...props} />,
          h2: ({ node, ...props }) => <span style={{ fontSize: "1.15em", fontWeight: "bold" }} {...props} />,
          h3: ({ node, ...props }) => <span style={{ fontSize: "1.1em", fontWeight: "bold" }} {...props} />,
          strong: ({ node, ...props }) => <strong {...props} />,
          em: ({ node, ...props }) => <em {...props} />,
        }}
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeRaw]}
      >
        {content}
      </ReactMarkdown>
    </Box>
  );
};

// 块级markdown渲染组件
const BlockMarkdownRenderer = ({ content, sx = {} }) => {
  if (!content) return null;
  
  return (
    <Box sx={sx}>
      <ReactMarkdown
        components={{
          p: ({ node, ...props }) => (
            <p style={{ margin: "8px 0", lineHeight: "1.5" }} {...props} />
          ),
          code: ({ node, inline, className, children, ...props }) => (
            <code
              style={{
                backgroundColor: inline ? "#f5f5f5" : "#f8f8f8",
                padding: inline ? "2px 4px" : "8px 12px",
                borderRadius: "4px",
                fontFamily: "Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace",
                fontSize: inline ? "0.9em" : "0.85em",
                border: "1px solid #e1e1e1",
                display: inline ? "inline" : "block",
                whiteSpace: inline ? "nowrap" : "pre-wrap",
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
                lineHeight: "1.4",
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
  const [editingStates, setEditingStates] = useState({});

  const toggleEditing = (key) => {
    setEditingStates(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getEditingKey = (type, sectionIndex, questionIndex, detailIndex, rowIndex) => {
    if (type === 'section') return `section_${sectionIndex}`;
    if (type === 'material') return `material_${sectionIndex}_${questionIndex}`;
    if (type === 'digest') return `digest_${sectionIndex}_${questionIndex}`;
    if (type === 'question') return `question_${sectionIndex}_${questionIndex}_${detailIndex}`;
    if (type === 'row') return `row_${sectionIndex}_${questionIndex}_${detailIndex}_${rowIndex}`;
    if (type === 'answer') return `answer_${sectionIndex}_${questionIndex}_${detailIndex}`;
    if (type === 'explanation') return `explanation_${sectionIndex}_${questionIndex}_${detailIndex}`;
    return type;
  };
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
      <Typography variant="h5" sx={{ mb: 3 }}>编辑试卷</Typography>
      
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
          <Box sx={{ mb: 2, display: "flex", alignItems: "flex-start" }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", color: "#333", minWidth: "40px", mt: 0.5 }}
            >
              {sectionIndex + 1}.
            </Typography>
            <Box sx={{ flex: 1, ml: 1 }}>
              {editingStates[getEditingKey('section', sectionIndex)] ? (
                <Box>
                  <IconButton
                    color="primary"
                    onClick={() => toggleEditing(getEditingKey('section', sectionIndex))}
                    size="small"
                    sx={{ mb: 1 }}
                  >
                    <CheckIcon fontSize="small" />
                  </IconButton>
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
                    sx={{ fontSize: "1.25rem" }}
                  />
                </Box>
              ) : (
                <Box sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
                  onClick={() => toggleEditing(getEditingKey('section', sectionIndex))}
                >
                  <InlineMarkdownRenderer
                    content={section.name}
                    sx={{
                      fontSize: "1.25rem",
                      fontWeight: "bold",
                      color: "#333",
                      "&:hover": {
                        backgroundColor: "#f5f5f5",
                        borderRadius: "4px",
                        padding: "4px 8px",
                        margin: "-4px -8px",
                      }
                    }}
                  />
                  <EditIcon
                    fontSize="small"
                    sx={{ ml: 1, opacity: 0.5, "&:hover": { opacity: 1 } }}
                  />
                </Box>
              )}
            </Box>
          </Box>
          {section.questions.map((question, questionIndex) => (
            <Box key={question.uuid} sx={{ mb: 2 }}>
              <Box sx={{ mb: 2 }}>
                {question.material && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold", color: "primary.main" }}>
                      材料：
                    </Typography>
                    {editingStates[getEditingKey('material', sectionIndex, questionIndex)] ? (
                      <Box>
                        <IconButton
                          color="primary"
                          onClick={() => toggleEditing(getEditingKey('material', sectionIndex, questionIndex))}
                          size="small"
                          sx={{ mb: 1 }}
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
                          placeholder="输入材料内容（支持Markdown语法）"
                        />
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          cursor: "pointer",
                          "&:hover": {
                            backgroundColor: "#f5f5f5",
                            borderRadius: "4px",
                          }
                        }}
                        onClick={() => toggleEditing(getEditingKey('material', sectionIndex, questionIndex))}
                      >
                        <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                          <BlockMarkdownRenderer
                            content={question.material}
                            sx={{
                              border: "1px solid #e0e0e0",
                              padding: "12px",
                              borderRadius: "4px",
                              backgroundColor: "#f9f9f9",
                              flexGrow: 1,
                            }}
                          />
                          <EditIcon
                            fontSize="small"
                            sx={{ ml: 1, mt: 1, opacity: 0.5, "&:hover": { opacity: 1 } }}
                          />
                        </Box>
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
                  摘要：
                </Typography>
                {editingStates[getEditingKey('digest', sectionIndex, questionIndex)] ? (
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <TextField
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
                      placeholder="输入摘要（支持Markdown语法）"
                      size="small"
                    />
                    <IconButton
                      color="primary"
                      onClick={() => toggleEditing(getEditingKey('digest', sectionIndex, questionIndex))}
                      size="small"
                      sx={{ ml: 1 }}
                    >
                      <CheckIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      "&:hover": {
                        backgroundColor: "#f5f5f5",
                        borderRadius: "4px",
                        padding: "4px 8px",
                        margin: "-4px -8px",
                      }
                    }}
                    onClick={() => toggleEditing(getEditingKey('digest', sectionIndex, questionIndex))}
                  >
                    <InlineMarkdownRenderer
                      content={question.digest || "点击添加摘要"}
                      sx={{
                        color: question.digest ? "inherit" : "text.secondary",
                        fontStyle: question.digest ? "normal" : "italic",
                      }}
                    />
                    <EditIcon
                      fontSize="small"
                      sx={{ ml: 1, opacity: 0.5, "&:hover": { opacity: 1 } }}
                    />
                  </Box>
                )}
              </Box>
              {question.questionDetails.map((detail, detailIndex) => (
                <Box key={detail.uuid} sx={{ mb: 2 }}>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    第 {questionIndex + 1}.{detailIndex + 1} 题{" "}
                    {/* 显示小题序号 */}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
                      题目：
                    </Typography>
                    {editingStates[getEditingKey('question', sectionIndex, questionIndex, detailIndex)] ? (
                      <Box>
                        <IconButton
                          color="primary"
                          onClick={() => toggleEditing(getEditingKey('question', sectionIndex, questionIndex, detailIndex))}
                          size="small"
                          sx={{ mb: 1 }}
                        >
                          <CheckIcon fontSize="small" />
                        </IconButton>
                        <TextField
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
                          multiline
                          rows={4}
                          placeholder="输入题目内容（支持Markdown语法）"
                        />
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          cursor: "pointer",
                          "&:hover": {
                            backgroundColor: "#f5f5f5",
                            borderRadius: "4px",
                            padding: "4px 8px",
                            margin: "-4px -8px",
                          }
                        }}
                        onClick={() => toggleEditing(getEditingKey('question', sectionIndex, questionIndex, detailIndex))}
                      >
                        <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                          <BlockMarkdownRenderer
                            content={detail.questionContent.value || "点击添加题目"}
                            sx={{
                              border: "1px solid #e0e0e0",
                              padding: "12px",
                              borderRadius: "4px",
                              backgroundColor: "#fafafa",
                              flexGrow: 1,
                              color: detail.questionContent.value ? "inherit" : "text.secondary",
                              fontStyle: detail.questionContent.value ? "normal" : "italic",
                            }}
                          />
                          <EditIcon
                            fontSize="small"
                            sx={{ ml: 1, mt: 1, opacity: 0.5, "&:hover": { opacity: 1 } }}
                          />
                        </Box>
                      </Box>
                    )}
                  </Box>
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
                                {editingStates[getEditingKey('row', sectionIndex, questionIndex, detailIndex, rowIndex)] ? (
                                  <Box sx={{ ml: 2, flex: 1 }}>
                                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                      <IconButton
                                        color="primary"
                                        onClick={() => toggleEditing(getEditingKey('row', sectionIndex, questionIndex, detailIndex, rowIndex))}
                                        size="small"
                                      >
                                        <CheckIcon fontSize="small" />
                                      </IconButton>
                                    </Box>
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
                                      multiline
                                      rows={3}
                                      placeholder="输入选项内容（支持Markdown语法）"
                                    />
                                  </Box>
                                ) : (
                                  <Box
                                    sx={{
                                      ml: 2,
                                      flex: 1,
                                      cursor: "pointer",
                                      "&:hover": {
                                        backgroundColor: "#f5f5f5",
                                        borderRadius: "4px",
                                        padding: "4px 8px",
                                        margin: "0 8px 0 8px",
                                      }
                                    }}
                                    onClick={() => toggleEditing(getEditingKey('row', sectionIndex, questionIndex, detailIndex, rowIndex))}
                                  >
                                    <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                                      <InlineMarkdownRenderer
                                        content={row.value || `点击添加选项${String.fromCharCode(65 + rowIndex)}内容`}
                                        sx={{
                                          color: row.value ? "inherit" : "text.secondary",
                                          fontStyle: row.value ? "normal" : "italic",
                                          flexGrow: 1,
                                        }}
                                      />
                                      <EditIcon
                                        fontSize="small"
                                        sx={{ ml: 1, opacity: 0.5, "&:hover": { opacity: 1 } }}
                                      />
                                    </Box>
                                  </Box>
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
                  ) : (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
                        答案：
                      </Typography>
                      {editingStates[getEditingKey('answer', sectionIndex, questionIndex, detailIndex)] ? (
                        <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                          <Box sx={{ flex: 1 }}>
                            <TextField
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
                              multiline
                              rows={2}
                              placeholder="输入答案（支持Markdown语法）"
                            />
                          </Box>
                          <IconButton
                            color="primary"
                            onClick={() => toggleEditing(getEditingKey('answer', sectionIndex, questionIndex, detailIndex))}
                            size="small"
                            sx={{ ml: 1 }}
                          >
                            <CheckIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            cursor: "pointer",
                            "&:hover": {
                              backgroundColor: "#fff3e0",
                              borderRadius: "4px",
                              padding: "4px 8px",
                              margin: "-4px -8px",
                            }
                          }}
                          onClick={() => toggleEditing(getEditingKey('answer', sectionIndex, questionIndex, detailIndex))}
                        >
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <InlineMarkdownRenderer
                              content={detail.answer?.content?.join(", ") || "点击添加答案"}
                              sx={{
                                color: detail.answer?.content?.length ? "inherit" : "text.secondary",
                                fontStyle: detail.answer?.content?.length ? "normal" : "italic",
                                backgroundColor: "#fff3e0",
                                padding: "8px 12px",
                                borderRadius: "4px",
                                border: "1px solid #ffcc02",
                              }}
                            />
                            <EditIcon
                              fontSize="small"
                              sx={{ ml: 1, opacity: 0.5, "&:hover": { opacity: 1 } }}
                            />
                          </Box>
                        </Box>
                      )}
                    </Box>
                  )}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
                      解释：
                    </Typography>
                    {editingStates[getEditingKey('explanation', sectionIndex, questionIndex, detailIndex)] ? (
                      <Box>
                        <IconButton
                          color="primary"
                          onClick={() => toggleEditing(getEditingKey('explanation', sectionIndex, questionIndex, detailIndex))}
                          size="small"
                          sx={{ mb: 1 }}
                        >
                          <CheckIcon fontSize="small" />
                        </IconButton>
                        <TextField
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
                          multiline
                          rows={4}
                          placeholder="输入解释（支持Markdown语法）"
                        />
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          cursor: "pointer",
                          "&:hover": {
                            backgroundColor: "#f3e5f5",
                            borderRadius: "4px",
                            padding: "4px 8px",
                            margin: "-4px -8px",
                          }
                        }}
                        onClick={() => toggleEditing(getEditingKey('explanation', sectionIndex, questionIndex, detailIndex))}
                      >
                        <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                          <BlockMarkdownRenderer
                            content={detail.explanation || "点击添加解释"}
                            sx={{
                              color: detail.explanation ? "inherit" : "text.secondary",
                              fontStyle: detail.explanation ? "normal" : "italic",
                              backgroundColor: "#f3e5f5",
                              padding: "12px",
                              borderRadius: "4px",
                              border: "1px solid #e1bee7",
                              flexGrow: 1,
                            }}
                          />
                          <EditIcon
                            fontSize="small"
                            sx={{ ml: 1, mt: 1, opacity: 0.5, "&:hover": { opacity: 1 } }}
                          />
                        </Box>
                      </Box>
                    )}
                  </Box>
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
