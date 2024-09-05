import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Stack,
  TextField,
  Typography,
  Select,
  Paper,
  Grid,
  Chip,
  Autocomplete,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import SubmitModal from "./SubmitModal";
import MultiLevelSelect from "./MultiLevelSelect";
import QuestionDetailEdit from "./QuestionDetailEdit";
import QuestionPreview from "./QuestionPreview";
import { useDictionaries } from "../hooks/useDictionaries";
import axios from "axios";
import QuestionMainLayout from "../layouts/QuestionMainLayout";
import NarrowSelect from "../../components/NarrowSelect";

const QuestionEdit = ({
  onSubmit,
  onCancel,
  isDialog = false,
  initialCategory,
  initialSchool,
  initialGrade,
  initialKn,
  isFromExamEdit = false,
}) => {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const { dictionaries, loading, error } = useDictionaries();
  const [submiting, setSubmiting] = useState(false);
  const [readyToClose, setReadyToClose] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [questionData, setQuestionData] = useState({
    type: "",
    category: initialCategory || "",
    kn: initialKn || "",
    gradeInfo: {
      school: initialSchool || "",
      grade: initialGrade || "",
    },
    source: "",
    tags: [],
    digest: "",
    material: "",
    questionDetails: [],
    relatedSources: [],
  });

  const [errors, setErrors] = useState({
    type: false,
    category: false,
    kn: false,
    school: false,
    grade: false,
    digest: false,
    questionDetails: [
      {
        questionContent: false,
        rows: [],
        answer: false,
        rate: false,
      },
    ],
  });

  const [availableKnowledgeNodes, setAvailableKnowledgeNodes] = useState([]);

  useEffect(() => {
    if (!isDialog) {
      fetchQuestionData(uuid);
    }
  }, [uuid, isDialog]);

  const fetchQuestionData = async (uuid) => {
    if (!uuid) {
      setQuestionData({
        type: "",
        category: "",
        kn: "",
        gradeInfo: {
          school: "",
          grade: "",
        },
        source: "",
        tags: [],
        digest: "",
        material: "",
        questionDetails: [],
        relatedSources: [],
      });
      return;
    }

    try {
      const response = await axios.get(`/api/questions/${uuid}`);
      setQuestionData(response.data);
    } catch (error) {
      console.error("获取题目数据时出错:", error);
      // 这里可以添加错误处理逻辑，比如显示错误消息
    }
  };

  useEffect(() => {
    if (questionData.category && dictionaries.CategoryKNMapping) {
      const knList =
        dictionaries.CategoryKNMapping[questionData.category] || [];
      setAvailableKnowledgeNodes(knList);

      // 如果当前选中的知识点不在新的列表中,重置知识点
      if (knList.length > 0 && !knList.includes(questionData.kn)) {
        setQuestionData((prevData) => ({ ...prevData, kn: "" }));
      }
    } else {
      setAvailableKnowledgeNodes([]);
    }
  }, [questionData.category, dictionaries.CategoryKNMapping]);

  if (loading) return <div>载中...</div>;
  if (error) return <div>加载失败</div>;

  const handleSelectChange = (type, value) => {
    if (isFromExamEdit && (type === "category" || type === "gradeInfo")) {
      // 如果是从 exam edit 进入，且是这些字段，则不允许更改
      return;
    }
    setQuestionData((prevData) => ({
      ...prevData,
      [type]: value,
    }));

    if (type === "category") {
      // 当学科改变时,重置知识点选择
      setQuestionData((prevData) => ({
        ...prevData,
        kn: "",
      }));
    }
  };

  const handleMultiSelectChange = (school, grade) => {
    if (isFromExamEdit) {
      // 如果是从 exam edit 进入，不允许更改
      return;
    }
    setQuestionData((prevData) => ({
      ...prevData,
      gradeInfo: { school, grade },
    }));
  };

  const handleQuestionDetailChange = (updatedQuestionDetail, index) => {
    setQuestionData((prevData) => ({
      ...prevData,
      questionDetails: prevData.questionDetails.map((detail, i) =>
        i === index ? { ...detail, ...updatedQuestionDetail } : detail
      ),
    }));
    console.log(updatedQuestionDetail);
  };

  const handleSubmitQuestion = async (event) => {
    event.preventDefault();
    console.log("submit!");
    console.log(questionData);

    var errorTxt = checkBeforeSubmit();

    setSubmiting(true);

    if (errorTxt !== "") {
      setModalTitle("存在错误");
      setModalContent(errorTxt);
      setReadyToClose(true);
      setSubmiting(false);
      return;
    }

    try {
      let response;
      if (isDialog) {
        // 创建新问题
        response = await axios.post("/api/questions", questionData);
        onSubmit(response.data);
      } else {
        // 更新现有问题
        response = await axios.put(`/api/questions/${uuid}`, questionData);
        setModalTitle("提交成功");
        setModalContent("问题已成功更新");
        setReadyToClose(true);
      }

      // 添加成功提示
      setSnackbar({
        open: true,
        message: isDialog ? "问题创建成功！" : "问题更新成功！",
        severity: "success",
      });

      if (!isDialog) {
        // 如果不是对话框模式，延迟导航
        setTimeout(() => navigate(-1), 2000);
      }
    } catch (error) {
      console.error("提交问题失败:", error);
      setModalTitle("提交失败");
      setModalContent("提交问题时发生错误，请重试。");
      setReadyToClose(true);

      // 添加错误提示
      setSnackbar({
        open: true,
        message: "提交问题失败，请重试。",
        severity: "error",
      });
    } finally {
      setSubmiting(false);
    }
  };

  const checkBeforeSubmit = () => {
    let newErrors = {
      type: questionData.type === "",
      category: questionData.category === "",
      kn: questionData.kn === "",
      school: questionData.gradeInfo.school === "",
      grade: questionData.gradeInfo.grade === "",
      digest: questionData.digest.trim() === "",
      questionDetails:
        questionData.questionDetails.length === 0
          ? [{ isEmpty: true }]
          : questionData.questionDetails.map((detail) => ({
              questionContent: detail.questionContent.value.trim() === "",
              rows: detail.rows.map((row) => row.value.trim() === ""),
              answer: !detail.answer || detail.answer.length === 0,
              rate: detail.rate === 0,
            })),
    };

    console.log("检查错误:", newErrors);

    setErrors(newErrors);

    // 检查顶层字段
    for (let key in newErrors) {
      if (key !== "questionDetails" && newErrors[key]) {
        console.log(`错误字段: ${key}`);
        return `请填写 ${key} 字段`;
      }
    }

    // 检查 questionDetails
    if (newErrors.questionDetails[0]?.isEmpty) {
      console.log("问题详情为空");
      return "请至少添加一个问题详情";
    }

    for (let i = 0; i < newErrors.questionDetails.length; i++) {
      const detail = newErrors.questionDetails[i];
      if (detail.questionContent) {
        console.log(`问题内容 ${i + 1} 为空`);
        return `请填写第 ${i + 1} 个问题的内容`;
      }
      if (detail.rows.some((row) => row)) {
        console.log(`问题 ${i + 1} 的某个选项为空`);
        return `请填写第 ${i + 1} 个问题的所有选项`;
      }
      if (detail.answer) {
        console.log(`问题 ${i + 1} 没有答案`);
        return `请为第 ${i + 1} 个问题选择答案`;
      }
      if (detail.rate) {
        console.log(`问题 ${i + 1} 没有难度`);
        return `请为第 ${i + 1} 个问题选择难度`;
      }
    }

    console.log("检查通过");
    return "";
  };

  const handleModalStatus = () => {
    setSubmiting(false);
    setReadyToClose(false);
  };

  const handleTagChange = (event, newValue) => {
    setQuestionData((prevData) => ({
      ...prevData,
      tags: newValue,
    }));
  };

  const handlePreviewToggle = () => {
    setShowPreview(!showPreview);
  };

  // 添加新的问题详情
  const addQuestionDetail = () => {
    setQuestionData((prevData) => ({
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

  // 删除问题详情
  const removeQuestionDetail = (index) => {
    setQuestionData((prevData) => ({
      ...prevData,
      questionDetails: prevData.questionDetails
        .filter((_, i) => i !== index)
        .map((detail, i) => ({ ...detail, order_in_question: i + 1 })),
    }));
  };

  // 添加移动问题详情的函数
  const moveQuestionDetail = (index, direction) => {
    setQuestionData((prevData) => {
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

  const handleCancel = () => {
    if (isDialog) {
      onCancel();
    } else {
      navigate(-1); // 返回上一页
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const content = (
    <Box
      sx={{
        width: "100%",
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "20px",
      }}
    >
      {!showPreview ? (
        <Grid container spacing={2}>
          {/* 第一行 */}
          <Grid item xs={12} sm={4}>
            <FormControl
              fullWidth
              required
              error={errors.category}
              disabled={isFromExamEdit}
            >
              <InputLabel id="category-select-label">学科</InputLabel>
              <Select
                labelId="category-select-label"
                id="category-select"
                value={questionData.category}
                label="学科"
                onChange={(e) => handleSelectChange("category", e.target.value)}
              >
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
              <InputLabel id="knowledge_node-select-label">知识点</InputLabel>
              <Select
                labelId="knowledge_node-select-label"
                id="knowledge_node-select"
                value={questionData.kn}
                label="知识点"
                onChange={(e) => handleSelectChange("kn", e.target.value)}
              >
                {availableKnowledgeNodes.map((kn) => (
                  <MenuItem key={kn} value={kn}>
                    {dictionaries.KNDict[kn] || kn}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <MultiLevelSelect
              onMultiSelectChange={handleMultiSelectChange}
              initialSchoolLevel={questionData.gradeInfo.school}
              initialGrade={questionData.gradeInfo.grade}
              error={errors.school || errors.grade}
              disabled={isFromExamEdit}
              readOnly={isFromExamEdit}
              inline={true}
              fullWidth
            />
          </Grid>

          {/* 第二行 */}
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
                {Object.entries(dictionaries.TypeDict).map(([key, value]) => (
                  <MenuItem key={key} value={key}>
                    {value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
              <Typography variant="body1" sx={{ mr: 1, minWidth: "40px" }}>
                关联:
              </Typography>
              <Box
                sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, flex: 1 }}
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
                        "& .MuiChip-label": {
                          padding: "3px 8px",
                        },
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

          {/* 第三行 */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="digest-input"
              label="摘要: 比如题目的主要内容"
              value={questionData.digest}
              onChange={(e) =>
                setQuestionData((prevData) => ({
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
                setQuestionData((prevData) => ({
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
                handleTagChange(
                  event,
                  newValue.map((option) => option.key)
                )
              }
              getOptionLabel={(option) => option.value}
              isOptionEqualToValue={(option, value) => option.key === value.key}
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

          {/* 第四行 */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="material-input"
              label="材料:多个题目共用"
              value={questionData.material}
              onChange={(e) =>
                setQuestionData((prevData) => ({
                  ...prevData,
                  material: e.target.value,
                }))
              }
              variant="outlined"
              multiline
              rows={4}
            />
          </Grid>

          {/* 问题详情部分 */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
              {questionData.questionDetails.length === 0 ? (
                <Typography color="error" sx={{ mt: 2, mb: 2 }}>
                  请至少添加一个问题详情
                </Typography>
              ) : (
                questionData.questionDetails.map((detail, index) => (
                  <Box key={index} sx={{ mb: 3, position: "relative" }}>
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

          {/* 提交和返回按钮 */}
          <Grid item xs={6}>
            <LoadingButton
              variant="contained"
              onClick={handleSubmitQuestion}
              loading={submiting}
              fullWidth
            >
              提交
            </LoadingButton>
          </Grid>
          <Grid item xs={6}>
            <Button variant="outlined" onClick={handleCancel} fullWidth>
              {isDialog ? "取消" : "返回"}
            </Button>
          </Grid>
        </Grid>
      ) : (
        <QuestionPreview
          questionData={questionData}
          onClose={handlePreviewToggle}
        />
      )}
    </Box>
  );

  if (isDialog) {
    return content;
  }

  return (
    <QuestionMainLayout
      currentPage={uuid ? "编辑题目" : "新建题目"}
      maxWidth="lg"
    >
      {content}
      <SubmitModal
        status={submiting}
        readyToClose={readyToClose}
        titleText={modalTitle}
        contentText={modalContent}
        handleModalStatus={handleModalStatus}
      />
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
            marginTop: "200px",
          }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </QuestionMainLayout>
  );
};

export default QuestionEdit;
