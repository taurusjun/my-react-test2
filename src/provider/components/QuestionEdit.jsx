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
  const [type, setType] = useState("selection");
  const [category, setCategory] = useState("physics");
  const [kn, setKN] = useState("");
  const [gradInfo, setGradInfo] = useState({ school: "", grad: "" });
  const [source, setSource] = useState("");
  const [explaination, setExplaination] = useState("");
  const [digest, setDigest] = useState("");

  // const testimage =
  //   "data:image/png;base64,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";

  const [questionDetail, setQuestionDetail] = useState({
    questionContent: { value: "qqqqqqq", image: null },
    rows: [
      { value: "v1", isAns: false, image: null },
      { value: "v2", isAns: false, image: null },
      { value: "v3", isAns: true, image: null },
      { value: "v4", isAns: false, image: null },
    ],
    rate: 1,
    explanation: "eeeee",
    uiType: "multi_selection", // 添加 uiType 字段
    answer: ["C"], // 新增
    answerImage: null, // 新增
  });

  const TypeDict = { selection: "选择题", fillInBlank: "填空题" };
  const CategoryDict = { physics: "物理", chemistry: "化学" };
  const KNDict = { kinematics: "运动学", electromagnetism: "电与磁" };

  const handleSelectChange = (type, value) => {
    switch (type) {
      case "type": {
        setType(value);
        break;
      }
      case "category": {
        setCategory(value);
        break;
      }
      case "knowledge_node": {
        setKN(value);
        break;
      }

      default:
    }
  };

  const handleMultiSelectChange = (school, grad) => {
    setGradInfo({
      school,
      grad,
    });
  };

  const handleQuestionDetailChange = (updatedQuestionDetail) => {
    setQuestionDetail((prevState) => ({
      ...prevState,
      ...updatedQuestionDetail,
    }));
    console.log(updatedQuestionDetail);
  };

  const handleSubmitQuestion = (event) => {
    event.preventDefault();
    console.log("submit!");
    console.log(type);
    console.log(gradInfo);
    console.log(category);
    console.log(kn);
    console.log(source);
    console.log(explaination);

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
    // 题目类型
    if (type == "") {
      return "题目类型未选择";
    }

    // gradInfo
    if (gradInfo.school == "") {
      return "学习阶段未选择";
    }

    if (gradInfo.grad == "") {
      return "年级未选择";
    }

    // category
    if (category == "") {
      return "学科未选择";
    }

    // kn
    if (kn == "") {
      return "知识点未选择";
    }

    // digest
    if (digest == "") {
      return "摘要未填写";
    }

    // 检查 questionDetail
    if (questionDetail.questionContent.value.trim() === "") {
      return "题目不能为空";
    }

    for (let i = 0; i < questionDetail.rows.length; i++) {
      if (questionDetail.rows[i].value.trim() === "") {
        return `第 ${i + 1} 个选项为空`;
      }
    }

    // 检查答案
    if (type === "fillInBlank") {
      if (!questionDetail.answer || questionDetail.answer.length === 0) {
        return "填空题答案未填写";
      }
    } else {
      if (!questionDetail.rows.some((row) => row.isAns)) {
        return "选择题答案未选择";
      }
    }

    if (questionDetail.rate === 0) {
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

  return (
    <Box
      flex={8}
      sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <Stack width="100%">
        <Box component="form" noValidate autoComplete="off">
          <Box sx={{ display: "flex", gap: 1, ml: 2, mr: 2, mt: 2, mb: 2 }}>
            <FormControl sx={{ flex: 1 }} required>
              <InputLabel id="category-select-label">学科</InputLabel>
              <Select
                labelId="category-select-label"
                id="category-select"
                value={category}
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
            <FormControl sx={{ flex: 1 }} required>
              <InputLabel id="demo-simple-select-label">知识点</InputLabel>
              <Select
                labelId="knowledge_node-select-label"
                id="knowledge_node-select"
                value={kn}
                label="knowledge_node"
                onChange={(e) =>
                  handleSelectChange("knowledge_node", e.target.value)
                }
              >
                {Object.entries(KNDict).map(([key, value]) => (
                  <MenuItem key={key} value={key}>
                    {value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <MultiLevelSelect onMultiSelectChange={handleMultiSelectChange} />
          </Box>

          <Box sx={{ display: "flex", gap: 1, ml: 2, mr: 2, mt: 2, mb: 2 }}>
            <FormControl sx={{ flex: 1 }} required>
              <InputLabel id="type-label">题目分类</InputLabel>
              <Select
                labelId="type-label"
                id="type-select"
                value={type}
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
                value={digest}
                onChange={(e) => setDigest(e.target.value)}
                variant="outlined"
                required
              />
            </FormControl>
            <FormControl sx={{ flex: 1 }}>
              <TextField
                id="source-input"
                label="来源: 比如哪一本书，或者哪一张试卷"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                variant="outlined"
              />
            </FormControl>
          </Box>

          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <QuestionDetailEdit
              initialQuestionContent={questionDetail.questionContent}
              initialRows={questionDetail.rows}
              initialRate={questionDetail.rate}
              initialExplanation={questionDetail.explanation}
              initialUIType={questionDetail.uiType} // 使用 questionDetail 中的 uiType
              initialAnswer={questionDetail.answer} // 新增
              initialAnswerImage={questionDetail.answerImage} // 新增
              onQuestionDetailChange={handleQuestionDetailChange}
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
