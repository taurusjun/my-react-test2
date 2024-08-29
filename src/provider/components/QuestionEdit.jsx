import React, { useState } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  Paper,
  Chip,
  Autocomplete,
  Button,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import SubmitModal from "./SubmitModal";
import MultiLevelSelect from "./MultiLevelSelect";
import QuestionDetailEdit from "./QuestionDetailEdit";
import QuestionPreview from "./QuestionPreview"; // 导入新的 QuestionPreview 组件
import { useDictionaries } from "../hooks/useDictionaries";

const QuestionEdit = () => {
  const { dictionaries, loading, error } = useDictionaries();
  const [submiting, setSubmiting] = useState(false);
  const [readyToClose, setReadyToClose] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const [questionData, setQuestionData] = useState({
    type: "selection",
    category: "physics",
    kn: "",
    gradInfo: {
      school: "primary",
      grad: "grade5",
    },
    source: "",
    tags: [], // 存储标签的数组
    digest: "",
    material: "",
    questionDetails: [
      {
        order_in_question: 1,
        questionContent: { value: "qqqqqqq", image: null },
        rows: [
          { value: "v1", isAns: false, image: null },
          { value: "v2", isAns: false, image: null },
          { value: "v3", isAns: true, image: null },
          { value: "v4", isAns: false, image: null },
        ],
        rate: 1,
        explanation: "eeeee",
        uiType: "multi_selection",
        answer: ["C"],
        answerImage: null,
      },
    ],
  });

  const [errors, setErrors] = useState({
    type: false,
    category: false,
    kn: false,
    school: false,
    grad: false,
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

  const handleSelectChange = (type, value) => {
    setQuestionData((prevData) => ({
      ...prevData,
      [type]: value,
    }));
  };

  const handleMultiSelectChange = (school, grad) => {
    setQuestionData((prevData) => ({
      ...prevData,
      gradInfo: { school, grad },
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

  const handleSubmitQuestion = (event) => {
    event.preventDefault();
    console.log("submit!");
    console.log(questionData.type);
    console.log(questionData.gradInfo);
    console.log(questionData.category);
    console.log(questionData.kn);
    console.log(questionData.source);

    var errorTxt = checkBeforeSubmit();

    setSubmiting(true);

    if (errorTxt !== "") {
      setModalTitle("存在错误");
      setModalContent(errorTxt);
      setReadyToClose(true);
      return;
    } else {
      setModalTitle("");
      setModalContent("正在提交...");
      asyncSubmit();
    }
  };

  const checkBeforeSubmit = () => {
    let newErrors = {
      type: questionData.type === "",
      category: questionData.category === "",
      kn: questionData.kn === "",
      school: questionData.gradInfo.school === "",
      grad: questionData.gradInfo.grad === "",
      digest: questionData.digest.trim() === "",
      questionDetails: questionData.questionDetails.map((detail) => ({
        questionContent: detail.questionContent.value.trim() === "",
        rows: detail.rows.map((row) => row.value.trim() === ""),
        answer: !detail.answer || detail.answer.length === 0,
        rate: detail.rate === 0,
      })),
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some((error) => error)) {
      return "请填写所有必填字段";
    }

    // 题目类型
    if (questionData.type == "") {
      return "题目类型未选择";
    }

    // gradInfo
    if (questionData.gradInfo.school == "") {
      return "学习阶段未选择";
    }

    if (questionData.gradInfo.grad == "") {
      return "年级未选择";
    }

    // category
    if (questionData.category == "") {
      return "学科未选择";
    }

    // kn
    if (questionData.kn == "") {
      return "知识点未选";
    }

    // digest
    if (questionData.digest == "") {
      return "摘要未填写";
    }

    // 检查 questionDetails
    for (let i = 0; i < questionData.questionDetails.length; i++) {
      const detail = questionData.questionDetails[i];
      if (detail.questionContent.value.trim() === "") {
        return `第 ${i + 1} 个题目内容不能为空`;
      }

      for (let j = 0; j < detail.rows.length; j++) {
        if (detail.rows[j].value.trim() === "") {
          return `第 ${i + 1} 个题目的第 ${j + 1} 个选项为空`;
        }
      }

      // 检查答案
      if (questionData.type === "fillInBlank") {
        if (!detail.answer || detail.answer.length === 0) {
          return `第 ${i + 1} 个填空题答案未填写`;
        }
      } else {
        if (!detail.rows.some((row) => row.isAns)) {
          return `第 ${i + 1} 个选择题答案未选择`;
        }
      }

      if (detail.rate === 0) {
        return `第 ${i + 1} 个题目难度未选择`;
      }
    }

    return "";
  };

  const asyncSubmit = async () => {
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    console.log("开始等待");
    await sleep(2000);
    console.log("等待结束");
    setModalContent("提交完成!");
    setReadyToClose(true);
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

  if (loading) return <div>加载中...</div>;
  if (error) return <div>加载失败</div>;

  return (
    <Box
      flex={8}
      sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <Stack width="100%">
        {!showPreview ? (
          <>
            <Box component="form" noValidate autoComplete="off">
              <Box sx={{ display: "flex", gap: 1, ml: 2, mr: 2, mt: 2, mb: 2 }}>
                <FormControl sx={{ flex: 1 }} required error={errors.category}>
                  <InputLabel id="category-select-label">学科</InputLabel>
                  <Select
                    labelId="category-select-label"
                    id="category-select"
                    value={questionData.category}
                    label="category"
                    onChange={(e) =>
                      handleSelectChange("category", e.target.value)
                    }
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
                <FormControl sx={{ flex: 1 }} required error={errors.kn}>
                  <InputLabel id="demo-simple-select-label">知识点</InputLabel>
                  <Select
                    labelId="knowledge_node-select-label"
                    id="knowledge_node-select"
                    value={questionData.kn}
                    label="knowledge_node"
                    onChange={(e) => handleSelectChange("kn", e.target.value)}
                  >
                    {Object.entries(dictionaries.KNDict).map(([key, value]) => (
                      <MenuItem key={key} value={key}>
                        {value}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <MultiLevelSelect
                  onMultiSelectChange={handleMultiSelectChange}
                  initialSchoolLevel={questionData.gradInfo.school}
                  initialGrade={questionData.gradInfo.grad}
                  error={errors.school || errors.grad}
                />
              </Box>

              <Box sx={{ display: "flex", gap: 1, ml: 2, mr: 2, mt: 2, mb: 2 }}>
                <FormControl sx={{ flex: 1 }} required error={errors.type}>
                  <InputLabel id="type-label">题目分类</InputLabel>
                  <Select
                    labelId="type-label"
                    id="type-select"
                    value={questionData.type}
                    label="type"
                    onChange={(e) => handleSelectChange("type", e.target.value)}
                  >
                    {Object.entries(dictionaries.TypeDict).map(
                      ([key, value]) => (
                        <MenuItem key={key} value={key}>
                          {value}
                        </MenuItem>
                      )
                    )}
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ display: "flex", gap: 1, ml: 2, mr: 2, mt: 2, mb: 2 }}>
                <FormControl sx={{ flex: 2 }}>
                  <TextField
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
                </FormControl>
                <FormControl sx={{ flex: 1 }}>
                  <TextField
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
                </FormControl>
                <FormControl sx={{ flex: 1 }}>
                  <Autocomplete
                    multiple
                    id="tags-input"
                    options={dictionaries.PredefinedTags}
                    value={questionData.tags}
                    onChange={handleTagChange}
                    freeSolo
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => {
                        const tagProps = getTagProps({ index });
                        // 从 tagProps 中移除 key
                        const { key, ...tagPropsWithoutKey } = tagProps;
                        return (
                          <Chip
                            key={key} // 单独设置 key
                            label={option}
                            {...tagPropsWithoutKey} // 传递其他 props
                          />
                        );
                      })
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="standard"
                        label="标签"
                        placeholder="选择或输入标签"
                      />
                    )}
                  />
                </FormControl>
              </Box>

              <Box sx={{ display: "flex", gap: 1, ml: 2, mr: 2, mt: 2, mb: 2 }}>
                <FormControl sx={{ flex: 1 }}>
                  <TextField
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
                </FormControl>
              </Box>

              <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                {questionData.questionDetails.map((detail, index) => (
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
                ))}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={addQuestionDetail}
                  sx={{ mt: 2 }}
                >
                  添加新问题
                </Button>
              </Paper>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mt: 2,
                mr: 2,
                ml: 2,
                gap: 2, // 添加间隔
              }}
            >
              <LoadingButton
                variant="contained"
                onClick={handleSubmitQuestion}
                loading={submiting}
                fullWidth // 添加fullWidth���性
              >
                提交
              </LoadingButton>
              <Button
                variant="outlined"
                onClick={handlePreviewToggle}
                fullWidth // 添加fullWidth属性
              >
                预览
              </Button>
            </Box>
          </>
        ) : (
          <QuestionPreview
            questionData={questionData}
            onClose={handlePreviewToggle}
          />
        )}
      </Stack>
      <SubmitModal
        status={submiting}
        readyToClose={readyToClose}
        titleText={modalTitle}
        contentText={modalContent}
        handleModalStatus={handleModalStatus}
      />
    </Box>
  );
};

export default QuestionEdit;
