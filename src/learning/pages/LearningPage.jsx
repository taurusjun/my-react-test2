import React from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { useLearningMaterial } from "../hooks/useLearningMaterial";

const LearningPage = () => {
  const { materialUuid } = useParams();
  const navigate = useNavigate();
  const {
    material,
    currentQuestion,
    currentSectionIndex,
    loading,
    error,
    isNavigating,
    answerCache,
    nextQuestion,
    previousQuestion,
    handleAnswerChange,
    handleNavigation,
  } = useLearningMaterial(materialUuid);

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
                        handleNavigation(section.uuid, questionIndex)
                      }
                      sx={{
                        width: "100%",
                        minWidth: "30px",
                        backgroundColor: answerCache[
                          `${section.uuid}_${questionIndex}`
                        ]
                          ? "#e0f7fa"
                          : "inherit",
                      }}
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
            onClick={() => navigate("/learning/")}
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
            currentSection={currentSectionIndex}
            currentQuestion={currentQuestion}
            onNext={nextQuestion}
            onPrevious={previousQuestion}
            onAnswerChange={handleAnswerChange}
            cachedAnswer={
              answerCache[
                `${currentQuestion.sectionUuid}_${currentQuestion.order_in_section}`
              ]
            }
            isNavigating={isNavigating}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default LearningPage;
