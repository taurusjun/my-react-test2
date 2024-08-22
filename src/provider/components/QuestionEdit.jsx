import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import LoadingButton from "@mui/lab/LoadingButton";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputAdornment,
  InputLabel,
  MenuItem,
  Radio,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import SubmitModal from "./SubmitModal";
import MultiLevelSelect from "./MultiLevelSelect";
import HardRating from "./HardRating";
import ImageUpload from "./ImageUpload";
import QuestionDetailEdit from "./QuestionDetailEdit";

const QuestionEdit = () => {
  const [rows, setRows] = useState([
    { value: "", isAns: false, image: null },
    { value: "", isAns: false, image: null },
    { value: "", isAns: false, image: null },
    { value: "", isAns: false, image: null },
    { value: "", isAns: false, image: null },
  ]);

  const [submiting, setSubmiting] = useState(false);
  const [readyToClose, setReadyToClose] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState("");
  const [uiType, setUIType] = useState("multi_selection");
  // const [uiType, setUIType] = useState("single_selection");
  const [type, setType] = useState("selection");
  const [category, setCategory] = useState("physics");
  const [kn, setKN] = useState("");
  const [gradInfo, setGradInfo] = useState({ school: "", grad: "" });
  const [rate, setRate] = useState(0);
  const [source, setSource] = useState("");
  const [explaination, setExplaination] = useState("");

  const UITypeDict = { single_selection: "单选", multi_selection: "多选" };
  const TypeDict = { selection: "选择题", fillInBlank: "填空题" };
  const CategoryDict = { physics: "物理", chemistry: "化学" };
  const KNDict = { kinematics: "运动学", electromagnetism: "电与磁" };

  const handleAddRow = (index) => {
    const newRow = {
      value: "",
    };
    const updatedRows = [
      ...rows.slice(0, index + 1),
      newRow,
      ...rows.slice(index + 1),
    ];
    setRows(updatedRows);
  };

  const handleDeleteRow = (index) => {
    if (index >= 1) {
      let updatedRows = [...rows.filter((_, i) => i !== index)];
      if (index === 1) {
        updatedRows = updatedRows.map((row, i) => ({
          value: row.value,
          isAns: row.isAns,
        }));
      }
      setRows(updatedRows);
    }
  };

  const handleChange = (index, value) => {
    const updatedRows = [...rows];
    updatedRows[index].value = value;
    setRows(updatedRows);
  };

  const handleAnsChange = (index, checked) => {
    switch (uiType) {
      case "single_selection": {
        if (checked) {
          const updatedRows = rows.map((item) => {
            return { ...item, isAns: false };
          });
          updatedRows[index].isAns = checked;
          setRows(updatedRows);
        }
        break;
      }
      case "multi_selection": {
        const updatedRows = [...rows];
        updatedRows[index].isAns = checked;
        setRows(updatedRows);
        break;
      }
      default:
    }
  };

  const handleSelectChange = (type, value) => {
    switch (type) {
      case "type": {
        setType(value);
        break;
      }
      case "ui-type": {
        const updatedRows = rows.map((item) => {
          return { ...item, isAns: false };
        });
        setRows(updatedRows);
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

  const handleSubmitQuestion = (event) => {
    event.preventDefault();
    console.log("submit!");
    console.log(rows);
    console.log(type);
    console.log(uiType);
    console.log(gradInfo);
    console.log(category);
    console.log(kn);
    console.log(rate);
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
      //setTimeout(setSubmiting(false), 2000);
      asyncSubmit();
    }
  };

  const checkBeforeSubmit = () => {
    // 题目
    var emptyIndex = rows.findIndex((element) => element.value === "");
    var errorTxt = "";
    if (emptyIndex === 0) {
      errorTxt = "题干内容为空";
      return errorTxt;
    } else {
      if (emptyIndex > 0) {
        errorTxt = `第${emptyIndex}个选项为空`;
        return errorTxt;
      }
    }

    //答案检查
    // 除去index 0的元素后，检查所有元素的isAns是否都为false
    const allIsAnsFalse = rows.slice(1).every((row) => row.isAns === false);
    if (allIsAnsFalse) {
      errorTxt = "答案未选择";
      return errorTxt;
    }

    //题目类型
    if (type == "") {
      errorTxt = "题目类型未选择";
      return errorTxt;
    }

    //选项类型
    if (uiType == "") {
      errorTxt = "选项未选择";
      return errorTxt;
    }

    //gradInfo
    if (gradInfo.school == "") {
      errorTxt = "学习阶段未选择";
      return errorTxt;
    }

    if (gradInfo.grad == "") {
      errorTxt = "年级未选择";
      return errorTxt;
    }

    //category
    if (category == "") {
      errorTxt = "学科未选择";
      return errorTxt;
    }

    //kn
    if (kn == "") {
      errorTxt = "知识点未选择";
      return errorTxt;
    }

    //rate
    if (rate == 0) {
      errorTxt = "难度未选择";
      return errorTxt;
    }
    //explaination
    // if (explaination == "") {
    //   errorTxt = "题目解析未填写";
    //   return errorTxt;
    // }

    return "";
  };

  const asyncSubmit = async () => {
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    // const fqResponse = await axios.post("/api/v1/userExam/submitExam", {
    //   exam_uuid: exam.uuid,
    //   answers: JSON.stringify(Object.fromEntries(answersMap)),
    // });
    // 执行需要等待的操作
    console.log("开始等待");
    await sleep(2000); // 等待2秒
    console.log("等待结束");
    setModalContent("提交完成!");
    setReadyToClose(true);
  };

  const handleModalStatus = () => {
    setSubmiting(false);
    setReadyToClose(false);
  };

  const handleImageChange = (index, imageData) => {
    const updatedRows = [...rows];
    updatedRows[index].image = imageData;
    setRows(updatedRows);
  };

  return (
    <>
      <Box
        flex={8}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack>
          <Box
            component="form"
            // sx={{
            //   "& .MuiTextField-root": {
            //     xs: { m: 0 },
            //     sm: { m: 1, width: 800 },
            //   },
            // }}
            noValidate
            autoComplete="off"
          >
            <QuestionDetailEdit />
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
                  onChange={(e) =>
                    handleSelectChange("ui-type", e.target.value)
                  }
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
                  onChange={(e) =>
                    handleSelectChange("category", e.target.value)
                  }
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
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                ml: 2,
                mr: 2,
              }}
            >
              {/* <FormControl>
                <HardRating onRateChange={(rate) => setRate(rate)} />
              </FormControl> */}
              <FormControl>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Typography component="legend">来源：</Typography>
                  <TextField
                    sx={{ width: 500 }}
                    label="填写来源，比如哪一本书，或者哪一张试卷"
                    id="outlined-start-adornment"
                    margin="normal"
                    rows={1}
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                  />
                </Box>
              </FormControl>
            </Box>
            <Box>
              <div>
                <TextField
                  sx={{ width: 1000 }}
                  label="题目解析"
                  id="outlined-start-adornment"
                  margin="normal"
                  multiline
                  rows={3}
                  value={explaination}
                  onChange={(e) => setExplaination(e.target.value)}
                />
              </div>
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
      </Box>
      <SubmitModal
        status={submiting}
        readyToClose={readyToClose}
        titleText={modalTitle}
        contentText={modalContent}
        handleModalStatus={handleModalStatus}
      />
    </>
  );
};

export default QuestionEdit;
