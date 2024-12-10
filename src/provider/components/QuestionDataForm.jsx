import React from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Chip,
  Autocomplete,
} from "@mui/material";
import MultiLevelSelect from "./MultiLevelSelect";
import QuestionDetailEdit from "./QuestionDetailEdit";

const QuestionDataForm = ({
  questionData,
  onQuestionDataChange,
  onSubmit,
  onCancel,
  isDialog,
  errors,
  availableKnowledgeNodes,
  dictionaries,
}) => {
  const handleSelectChange = (type, value) => {
    onQuestionDataChange((prevData) => ({
      ...prevData,
      [type]: value,
    }));
    if (type === "category") {
      onQuestionDataChange((prevData) => ({
        ...prevData,
        kn: "",
      }));
    }
  };

  const handleQuestionDetailChange = (updatedQuestionDetail, index) => {
    onQuestionDataChange((prevData) => ({
      ...prevData,
      questionDetails: prevData.questionDetails.map((detail, i) =>
        i === index ? { ...detail, ...updatedQuestionDetail } : detail
      ),
    }));
  };

  // 添加新问题详情的函数
  const addQuestionDetail = () => {
    onQuestionDataChange((prevData) => ({
      ...prevData,
      questionDetails: [
        ...prevData.questionDetails,
        {
          order_in_question: prevData.questionDetails.length + 1,
          questionContent: { value: "", image: null },
          rows: [
            { value: "", isAns: false, image: null },
            { value: "", isAns: false, image: null },
            { value: "", isAns: false, image: null },
            { value: "", isAns: false, image: null },
          ],
          rate: 1,
          explanation: "",
          uiType: "multi_selection",
          answer: [],
          answerImage: null,
        },
      ],
    }));
  };

  // 移动问题详情的函数
  const moveQuestionDetail = (index, direction) => {
    onQuestionDataChange((prevData) => {
      const newQuestionDetails = [...prevData.questionDetails];
      if (direction === "up" && index > 0) {
        [newQuestionDetails[index], newQuestionDetails[index - 1]] = [
          newQuestionDetails[index - 1],
          newQuestionDetails[index],
        ];
      } else if (
        direction === "down" &&
        index < newQuestionDetails.length - 1
      ) {
        [newQuestionDetails[index], newQuestionDetails[index + 1]] = [
          newQuestionDetails[index + 1],
          newQuestionDetails[index],
        ];
      }
      return {
        ...prevData,
        questionDetails: newQuestionDetails.map((detail, i) => ({
          ...detail,
          order_in_question: i + 1,
        })),
      };
    });
  };

  // 删除问题详情的函数
  const removeQuestionDetail = (index) => {
    onQuestionDataChange((prevData) => ({
      ...prevData,
      questionDetails: prevData.questionDetails.filter((_, i) => i !== index),
    }));
  };

  return (
    <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ mb: 4, color: "primary.main" }}
      >
        {isDialog ? "新建题目" : "编辑题目"}
      </Typography>
      <Grid container spacing={3}>
        {/* 基本信息卡片 */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              基本信息
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth required error={errors.category}>
                  <InputLabel id="category-select-label">学科</InputLabel>
                  <Select
                    labelId="category-select-label"
                    id="category-select"
                    value={questionData.category}
                    label="学科"
                    onChange={(e) =>
                      handleSelectChange("category", e.target.value)
                    }
                  >
                    {/* 这里需要填充学科选项 */}
                    {Object.entries(dictionaries.CategoryDict).map(
                      ([key, value]) => (
                        <MenuItem key={key} value={key}>
                          {value}
                        </MenuItem>
                      )
                    )}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth required error={errors.kn}>
                  <InputLabel id="knowledge_node-select-label">
                    知识点
                  </InputLabel>
                  <Select
                    labelId="knowledge_node-select-label"
                    id="knowledge_node-select"
                    value={questionData.kn}
                    label="知识点"
                    onChange={(e) => handleSelectChange("kn", e.target.value)}
                  >
                    {availableKnowledgeNodes.map((kn) => (
                      <MenuItem key={kn} value={kn}>
                        {kn}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <MultiLevelSelect
                  onMultiSelectChange={(school, grade) => {
                    onQuestionDataChange((prevData) => ({
                      ...prevData,
                      gradeInfo: { school, grade },
                    }));
                  }}
                  initialSchoolLevel={questionData.gradeInfo.school}
                  initialGrade={questionData.gradeInfo.grade}
                  error={errors.school || errors.grade}
                  disabled={isDialog}
                  readOnly={isDialog}
                  inline={true}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={errors.type}>
                  <InputLabel id="type-label">题目分类</InputLabel>
                  <Select
                    labelId="type-label"
                    id="type-select"
                    value={questionData.type}
                    label="题目分类"
                    onChange={(e) => handleSelectChange("type", e.target.value)}
                  >
                    {/* 这里需要填充题目分类选项 */}
                    {Object.entries(dictionaries.TypeDict).map(
                      ([key, value]) => (
                        <MenuItem key={key} value={key}>
                          {value}
                        </MenuItem>
                      )
                    )}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    height: "100%",
                  }}
                >
                  <Typography variant="body1" sx={{ mr: 1, minWidth: "40px" }}>
                    关联:
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 0.5,
                      flex: 1,
                    }}
                  >
                    {questionData.relatedSources.length > 0 ? (
                      questionData.relatedSources.map((source) => (
                        <Chip
                          key={source.uuid}
                          label={source.name}
                          variant="outlined"
                          size="medium"
                          sx={{
                            fontSize: "inherit",
                            height: "auto",
                            "& .MuiChip-label": { padding: "3px 8px" },
                          }}
                        />
                      ))
                    ) : (
                      <Typography variant="body1" color="text.secondary">
                        无关联试卷或书籍
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* 题目内容卡片 */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              题目内容
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="digest-input"
                  label="摘要: 比如题目的主要内容"
                  value={questionData.digest}
                  onChange={(e) =>
                    onQuestionDataChange((prevData) => ({
                      ...prevData,
                      digest: e.target.value,
                    }))
                  }
                  variant="outlined"
                  required
                  error={errors.digest}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  id="source-input"
                  label="来源: 比如哪一本书，或者哪一张试卷"
                  value={questionData.source}
                  onChange={(e) =>
                    onQuestionDataChange((prevData) => ({
                      ...prevData,
                      source: e.target.value,
                    }))
                  }
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <Autocomplete
                  multiple
                  id="tags-input"
                  options={Object.entries(dictionaries.TagDict).map(
                    ([key, value]) => ({ key, value })
                  )}
                  value={questionData.tags.map((key) => ({
                    key,
                    value: dictionaries.TagDict[key],
                  }))}
                  onChange={(event, newValue) =>
                    onQuestionDataChange((prevData) => ({
                      ...prevData,
                      tags: newValue.map((option) => option.key),
                    }))
                  }
                  getOptionLabel={(option) => option.value}
                  isOptionEqualToValue={(option, value) =>
                    option.key === value.key
                  }
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        label={option.value}
                        {...getTagProps({ index })}
                        key={option.key}
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label="标签"
                      placeholder="选择或输入标签"
                      fullWidth
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="material-input"
                  label="材料:多个题目共用"
                  value={questionData.material}
                  onChange={(e) =>
                    onQuestionDataChange((prevData) => ({
                      ...prevData,
                      material: e.target.value,
                    }))
                  }
                  variant="outlined"
                  multiline
                  rows={4}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* 问题详情卡片 */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              问题详情
            </Typography>
            {questionData.questionDetails.length === 0 ? (
              <Typography color="error" sx={{ mt: 2, mb: 2 }}>
                请至少添加一个问题详情
              </Typography>
            ) : (
              questionData.questionDetails.map((detail, index) => (
                <Box key={index} sx={{ mb: 2, position: "relative" }}>
                  <QuestionDetailEdit
                    questionDetail={detail}
                    onQuestionDetailChange={(updatedDetail) =>
                      handleQuestionDetailChange(updatedDetail, index)
                    }
                    errors={errors.questionDetails[index]}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      display: "flex",
                      gap: 1,
                    }}
                  >
                    {index > 0 && (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => moveQuestionDetail(index, "up")}
                      >
                        上移
                      </Button>
                    )}
                    {index < questionData.questionDetails.length - 1 && (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => moveQuestionDetail(index, "down")}
                      >
                        下移
                      </Button>
                    )}
                    {questionData.questionDetails.length > 1 && (
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => removeQuestionDetail(index)}
                      >
                        删除
                      </Button>
                    )}
                  </Box>
                </Box>
              ))
            )}
            <Button
              variant="contained"
              color="primary"
              onClick={addQuestionDetail}
              sx={{ mt: 2 }}
            >
              添加新问题
            </Button>
          </Paper>
        </Grid>
        {/* 操作按钮 */}
        <Grid item xs={6}>
          <Button variant="contained" onClick={onSubmit} fullWidth>
            提交
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Button variant="outlined" onClick={onCancel} fullWidth>
            {isDialog ? "取消" : "返回"}
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default QuestionDataForm;
