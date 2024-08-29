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
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import SubmitModal from "./SubmitModal";
import MultiLevelSelect from "./MultiLevelSelect";
import QuestionDetailEdit from "./QuestionDetailEdit";

const QuestionEdit = () => {
  const [submiting, setSubmiting] = useState(false);
  const [readyToClose, setReadyToClose] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState("");

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
    questionDetail: {
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
  });

  const [errors, setErrors] = useState({
    type: false,
    category: false,
    kn: false,
    school: false,
    grad: false,
    digest: false,
    questionDetail: {
      questionContent: false,
      rows: [],
      answer: false,
      rate: false,
    },
  });

  const TypeDict = { selection: "选择题", fillInBlank: "填空题" };
  const CategoryDict = { physics: "物理", chemistry: "化学" };
  const KNDict = { kinematics: "运动学", electromagnetism: "电与磁" };

  // 预定义的标签
  const predefinedTags = ["重要", "难题", "常考", "创新", "综合"];

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

  const handleQuestionDetailChange = (updatedQuestionDetail) => {
    setQuestionData((prevData) => ({
      ...prevData,
      questionDetail: {
        ...prevData.questionDetail,
        ...updatedQuestionDetail,
      },
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
      questionDetail: {
        questionContent:
          questionData.questionDetail.questionContent.value.trim() === "",
        rows: questionData.questionDetail.rows.map(
          (row) => row.value.trim() === ""
        ),
        answer:
          !questionData.questionDetail.answer ||
          questionData.questionDetail.answer.length === 0,
        rate: questionData.questionDetail.rate === 0,
      },
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

    // 检查 questionDetail
    if (questionData.questionDetail.questionContent.value.trim() === "") {
      return "题目不能为空";
    }

    for (let i = 0; i < questionData.questionDetail.rows.length; i++) {
      if (questionData.questionDetail.rows[i].value.trim() === "") {
        return `第 ${i + 1} 个选项为空`;
      }
    }

    // 检查答案
    if (questionData.type === "fillInBlank") {
      if (
        !questionData.questionDetail.answer ||
        questionData.questionDetail.answer.length === 0
      ) {
        return "填空题答案填写";
      }
    } else {
      if (!questionData.questionDetail.rows.some((row) => row.isAns)) {
        return "选择题答案未选择";
      }
    }

    if (questionData.questionDetail.rate === 0) {
      return "难度未选择";
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

  return (
    <Box
      flex={8}
      sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <Stack width="100%">
        <Box component="form" noValidate autoComplete="off">
          <Box sx={{ display: "flex", gap: 1, ml: 2, mr: 2, mt: 2, mb: 2 }}>
            <FormControl sx={{ flex: 1 }} required error={errors.category}>
              <InputLabel id="category-select-label">学科</InputLabel>
              <Select
                labelId="category-select-label"
                id="category-select"
                value={questionData.category}
                label="category"
                onChange={(e) => handleSelectChange("category", e.target.value)}
              >
                {Object.entries(CategoryDict).map(([key, value]) => (
                  <MenuItem key={key} value={key}>
                    {value}
                  </MenuItem>
                ))}
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
                {Object.entries(KNDict).map(([key, value]) => (
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
                {Object.entries(TypeDict).map(([key, value]) => (
                  <MenuItem key={key} value={key}>
                    {value}
                  </MenuItem>
                ))}
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
                options={predefinedTags}
                value={questionData.tags}
                onChange={handleTagChange}
                freeSolo
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip label={option} {...getTagProps({ index })} />
                  ))
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
            <QuestionDetailEdit
              initialQuestionContent={
                questionData.questionDetail.questionContent
              }
              initialRows={questionData.questionDetail.rows}
              initialRate={questionData.questionDetail.rate}
              initialExplanation={questionData.questionDetail.explanation}
              initialUIType={questionData.questionDetail.uiType}
              initialAnswer={questionData.questionDetail.answer}
              initialAnswerImage={questionData.questionDetail.answerImage}
              onQuestionDetailChange={handleQuestionDetailChange}
              errors={errors.questionDetail}
            />
          </Paper>
        </Box>
        <LoadingButton
          sx={{ mt: 1, mr: 1 }}
          variant="contained"
          onClick={handleSubmitQuestion}
          loading={submiting}
        >
          提交
        </LoadingButton>
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
