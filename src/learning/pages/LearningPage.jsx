import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Typography,
  Box,
  CircularProgress,
  AppBar,
  Toolbar,
  IconButton,
  Button,
  Grid,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import ListAltIcon from "@mui/icons-material/ListAlt";
import LearningMaterial from "../components/LearningMaterial";

const LearningPage = () => {
  const { materialUuid } = useParams();
  const navigate = useNavigate();
  const [material, setMaterial] = useState(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const cancelTokenRef = useRef(null);

  useEffect(() => {
    fetchMaterialStructure();
    return () => {
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel("组件卸载");
      }
    };
  }, [materialUuid]);

  const fetchMaterialStructure = async () => {
    try {
      const response = await axios.get(
        `/api/learning-material/${materialUuid}/structure`
      );
      setMaterial(response.data);
      fetchQuestion(response.data.sections[0].uuid, 0);
    } catch (error) {
      if (!axios.isCancel(error)) {
        console.error("获取学习资料结构失败", error);
        setError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestion = useCallback(
    async (sectionUuid, questionIndex) => {
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel("新请求开始");
      }
      cancelTokenRef.current = axios.CancelToken.source();

      setIsNavigating(true);
      setLoading(true);
      try {
        const response = await axios.get(
          `/api/learning-material/${materialUuid}/section/${sectionUuid}/question/${questionIndex}`,
          { cancelToken: cancelTokenRef.current.token }
        );
        setCurrentQuestion(response.data);
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.error("获取问题失败", error);
          setError(error);
        }
      } finally {
        setLoading(false);
        setIsNavigating(false);
      }
    },
    [materialUuid]
  );

  const handleQuestionClick = useCallback(
    (sectionIndex, questionIndex) => {
      setCurrentSection(sectionIndex);
      fetchQuestion(material.sections[sectionIndex].uuid, questionIndex);
    },
    [material, fetchQuestion]
  );

  const handleNextQuestion = useCallback(() => {
    const currentSectionData = material.sections[currentSection];
    if (
      currentQuestion.order_in_section <
      currentSectionData.questionCount - 1
    ) {
      fetchQuestion(
        currentSectionData.uuid,
        currentQuestion.order_in_section + 1
      );
    } else if (currentSection < material.sections.length - 1) {
      setCurrentSection(currentSection + 1);
      fetchQuestion(material.sections[currentSection + 1].uuid, 0);
    }
  }, [material, currentSection, currentQuestion, fetchQuestion]);

  const handlePreviousQuestion = useCallback(() => {
    if (currentQuestion.order_in_section > 0) {
      fetchQuestion(
        material.sections[currentSection].uuid,
        currentQuestion.order_in_section - 1
      );
    } else if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      const prevSectionData = material.sections[currentSection - 1];
      fetchQuestion(prevSectionData.uuid, prevSectionData.questionCount - 1);
    }
  }, [currentSection, currentQuestion, material, fetchQuestion]);

  const handleSubmitAnswer = useCallback(
    async (answer) => {
      setIsNavigating(true);
      try {
        await axios.post(
          `/api/learning-material/${materialUuid}/section/${currentQuestion.sectionUuid}/question/${currentQuestion.uuid}/answer`,
          { answer }
        );
        // 可以在这里添加提交成功后的逻辑，比如显示正确答案或解释
      } catch (error) {
        console.error("提交答案失败", error);
        setError(error);
      } finally {
        setIsNavigating(false);
      }
    },
    [materialUuid, currentQuestion]
  );

  const renderMaterialStructure = () => {
    if (!material) return null;

    return (
      <Box>
        {material.sections.map((section, sectionIndex) => (
          <Box key={section.uuid} sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              {`第${section.order_in_material}部分 ${section.name}`}
            </Typography>
            <Grid container spacing={1}>
              {Array.from(
                { length: section.questionCount },
                (_, questionIndex) => (
                  <Grid item key={questionIndex} xs={6}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() =>
                        handleQuestionClick(sectionIndex, questionIndex)
                      }
                      sx={{ width: "100%", minWidth: "30px" }}
                    >
                      {questionIndex + 1}
                    </Button>
                  </Grid>
                )
              )}
            </Grid>
          </Box>
        ))}
      </Box>
    );
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography>错误：{error.message}</Typography>;
  if (!material || !currentQuestion)
    return <Typography>未找到学习资料</Typography>;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <AppBar position="static">
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              color="inherit"
              onClick={() => navigate("/")}
              sx={{ mr: 1 }}
            >
              <HomeIcon />
            </IconButton>
            <Typography variant="h6" component="div">
              {material.name}
            </Typography>
          </Box>
          <Button
            color="inherit"
            onClick={() => navigate("/my-learning/list")}
            startIcon={<ListAltIcon />}
          >
            我的学习
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: "flex", flexGrow: 1, overflow: "hidden" }}>
        {/* 左侧学习资料结构 */}
        <Box
          sx={{
            width: "250px",
            borderRight: "1px solid #ccc",
            p: 2,
            overflowY: "auto",
          }}
        >
          <Typography variant="h6" gutterBottom>
            学习内容
          </Typography>
          {renderMaterialStructure()}
        </Box>

        {/* 右侧学习内容 */}
        <Box sx={{ flexGrow: 1, p: 2, overflowY: "auto" }}>
          <LearningMaterial
            material={material}
            currentSection={currentSection}
            currentQuestion={currentQuestion}
            onNext={handleNextQuestion}
            onPrevious={handlePreviousQuestion}
            onSubmitAnswer={handleSubmitAnswer}
            isNavigating={isNavigating}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default LearningPage;
