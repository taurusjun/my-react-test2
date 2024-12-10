import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
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
import CommonLayout from "../../layouts/CommonLayout";
import CommonBreadcrumbs from "../../components/CommonBreadcrumbs";
import { getBreadcrumbPaths } from "../../config/breadcrumbPaths";
import QuestionDataForm from "./QuestionDataForm";

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
  }, [questionData.category, dictionaries.CategoryKNMapping, questionData.kn]);

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

  const breadcrumbPaths = getBreadcrumbPaths();

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
        <QuestionDataForm
          questionData={questionData}
          onQuestionDataChange={setQuestionData}
          onSubmit={handleSubmitQuestion}
          onCancel={handleCancel}
          isDialog={isDialog}
          errors={errors}
          availableKnowledgeNodes={availableKnowledgeNodes}
          dictionaries={dictionaries} // 传递 dictionaries
        />
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
    <CommonLayout
      currentPage={uuid ? "编辑题目" : "新建题目"}
      maxWidth="lg"
      showBreadcrumbs={true}
      BreadcrumbsComponent={() => (
        <CommonBreadcrumbs
          paths={
            uuid ? breadcrumbPaths.questionEdit : breadcrumbPaths.questionNew
          }
        />
      )}
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
    </CommonLayout>
  );
};

export default QuestionEdit;
