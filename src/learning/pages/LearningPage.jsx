import React, { useState, useEffect } from "react";
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
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMaterialStructure();
  }, [materialUuid]);

  const fetchMaterialStructure = async () => {
    try {
      const response = await axios.get(
        `/api/learning-material/${materialUuid}/structure`
      );
      setMaterial(response.data);
      fetchQuestion(response.data.sections[0].uuid, 0);
    } catch (error) {
      console.error("获取学习资料结构失败", error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestion = async (sectionUuid, questionIndex) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/learning-material/${materialUuid}/section/${sectionUuid}/question/${questionIndex}`
      );
      setCurrentQuestion(response.data);
    } catch (error) {
      console.error("获取问题失败", error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionClick = (sectionIndex, questionIndex) => {
    setCurrentSection(sectionIndex);
    fetchQuestion(material.sections[sectionIndex].uuid, questionIndex);
  };

  const handleNextQuestion = async () => {
    const currentSectionData = material.sections[currentSection];
    if (
      currentQuestion.order_in_section <
      currentSectionData.questionCount - 1
    ) {
      await fetchQuestion(
        currentSectionData.uuid,
        currentQuestion.order_in_section + 1
      );
    } else if (currentSection < material.sections.length - 1) {
      setCurrentSection(currentSection + 1);
      await fetchQuestion(material.sections[currentSection + 1].uuid, 0);
    }
  };

  const handlePreviousQuestion = async () => {
    if (currentQuestion.order_in_section > 0) {
      await fetchQuestion(
        material.sections[currentSection].uuid,
        currentQuestion.order_in_section - 1
      );
    } else if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      const prevSectionData = material.sections[currentSection - 1];
      await fetchQuestion(
        prevSectionData.uuid,
        prevSectionData.questionCount - 1
      );
    }
  };

  const handleSubmitAnswer = async (answer, imageAnswer) => {
    try {
      setLoading(true);
      await axios.post(
        `/api/learning-material/${materialUuid}/section/${currentQuestion.sectionUuid}/question/${currentQuestion.uuid}/answer`,
        { answer, imageAnswer }
      );
      // 可以在这里添加提交成功后的逻辑，比如显示正确答案或解释
    } catch (error) {
      console.error("提交答案失败", error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

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
          />
        </Box>
      </Box>
    </Box>
  );
};

export default LearningPage;
