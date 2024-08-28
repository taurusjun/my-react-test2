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
  const [questionDetail, setQuestionDetail] = useState({
    questionContent: { value: "", image: null },
    rows: [
      { value: "", isAns: false, image: null },
      { value: "", isAns: false, image: null },
      { value: "", isAns: false, image: null },
      { value: "", isAns: false, image: null },
    ],
    rate: 0,
    explanation: "",
    uiType: "multi_selection", // 添加 uiType 字段
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
