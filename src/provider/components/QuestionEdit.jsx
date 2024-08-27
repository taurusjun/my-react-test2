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
  const [uiType, setUIType] = useState("multi_selection");
  const [type, setType] = useState("selection");
  const [category, setCategory] = useState("physics");
  const [kn, setKN] = useState("");
  const [gradInfo, setGradInfo] = useState({ school: "", grad: "" });
  const [source, setSource] = useState("");
  const [explaination, setExplaination] = useState("");
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
  });

  const UITypeDict = { single_selection: "单选", multi_selection: "多选" };
  const TypeDict = { selection: "选择题", fillInBlank: "填空题" };
  const CategoryDict = { physics: "物理", chemistry: "化学" };
  const KNDict = { kinematics: "运动学", electromagnetism: "电与磁" };

  const handleSelectChange = (type, value) => {
    switch (type) {
      case "type": {
        setType(value);
        break;
      }
      case "ui-type": {
        setUIType(value);
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
    setQuestionDetail(updatedQuestionDetail);
    console.log(updatedQuestionDetail);
  };

  const handleSubmitQuestion = (event) => {
    event.preventDefault();
    console.log("submit!");
    console.log(type);
    console.log(uiType);
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

    // 选项类型
    if (uiType == "") {
      return "选项未选择";
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
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <QuestionDetailEdit
              initialQuestionContent={questionDetail.questionContent}
              initialRows={questionDetail.rows}
              initialRate={questionDetail.rate}
              initialExplanation={questionDetail.explanation}
              initialUIType={uiType}
              onQuestionDetailChange={handleQuestionDetailChange}
            />
          </Paper>

          <Box sx={{ display: "flex", gap: 1, ml: 2, mr: 2, mt: 2, mb: 2 }}>
            <FormControl sx={{ flex: 1 }}>
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
            <FormControl sx={{ flex: 1 }}>
              <InputLabel id="ui-type-select-label">题目类型</InputLabel>
              <Select
                labelId="ui-type-select-label"
                id="ui-type-select"
                value={uiType}
                label="ui-type"
                onChange={(e) => handleSelectChange("ui-type", e.target.value)}
              >
                {Object.entries(UITypeDict).map(([key, value]) => (
                  <MenuItem key={key} value={key}>
                    {value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <MultiLevelSelect onMultiSelectChange={handleMultiSelectChange} />
          </Box>
          <Box sx={{ display: "flex", gap: 1, ml: 2, mr: 2, mt: 2, mb: 2 }}>
            <FormControl sx={{ flex: 1 }}>
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
            <FormControl sx={{ flex: 1 }}>
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
          <Box sx={{ ml: 2, mr: 2, mt: 2, mb: 2 }}>
            <TextField
              fullWidth
              label="题目解析"
              id="explanation-input"
              multiline
              rows={3}
              value={explaination}
              onChange={(e) => setExplaination(e.target.value)}
              variant="outlined"
            />
          </Box>
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
