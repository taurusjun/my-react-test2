import React, { useState, useEffect, useCallback } from "react";
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
    currentQuestionDetail,
    currentSectionIndex,
    loading,
    error,
    isNavigating,
    answerCache,
    statusCache,
    setAnswerCache,
    setStatusCache,
    nextQuestionDetail,
    previousQuestionDetail,
    handleAnswerChange,
    handleNavigation,
    getCurrentQuestionIndex, // 确保这行存在
  } = useLearningMaterial(materialUuid);

  const [selectedQuestion, setSelectedQuestion] = useState(null);

  useEffect(() => {
    if (currentQuestionDetail && material) {
      setSelectedQuestion(
        `${
          material.sections[currentSectionIndex].uuid
        }_${getCurrentQuestionIndex()}`
      );
    }
  }, [
    currentQuestionDetail,
    material,
    currentSectionIndex,
    getCurrentQuestionIndex,
  ]);

  const handleStatusChange = useCallback(
    (newStatus) => {
      const key = `${
        material.sections[currentSectionIndex].uuid
      }_${getCurrentQuestionIndex()}`;
      setStatusCache((prev) => ({ ...prev, [key]: newStatus }));
    },
    [material, currentSectionIndex, getCurrentQuestionIndex, setStatusCache]
  );

  const renderMaterialStructure = () => {
    if (!material) return null;

    return (
      <Box>
        {material.sections.map((section) => (
          <Box key={section.uuid} sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              {`第${section.order_in_exam}部分 ${section.name}`}
            </Typography>
            <Grid container spacing={1}>
              {section.questions.flatMap((question, qIndex) => {
                let detailStartIndex =
                  section.questions
                    .slice(0, qIndex)
                    .reduce((acc, q) => acc + q.questionDetailCount, 0) + 1;
                return Array.from(
                  { length: question.questionDetailCount },
                  (_, dIndex) => {
                    const detailIndex = detailStartIndex + dIndex;
                    const detailKey = `${section.uuid}_${detailIndex}`;
                    const isSelected = selectedQuestion === detailKey;
                    const isAnswered =
                      answerCache[detailKey] &&
                      answerCache[detailKey].length > 0;
                    const status = statusCache[detailKey];

                    let statusSymbol = "";
                    if (status === "completed") {
                      statusSymbol = " ✅";
                    } else if (status === "in_progress") {
                      statusSymbol = " ⏳";
                    }

                    return (
                      <Grid item key={`${question.uuid}_${dIndex}`} xs={4}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => {
                            handleNavigation(section.uuid, detailIndex);
                            setSelectedQuestion(detailKey);
                          }}
                          sx={{
                            width: "100%",
                            minWidth: "30px",
                            color: isAnswered ? "primary.main" : "inherit",
                            backgroundColor: isSelected
                              ? "primary.light"
                              : "transparent",
                            "&:hover": {
                              backgroundColor: "primary.light",
                            },
                          }}
                        >
                          {detailIndex}
                          {statusSymbol}
                        </Button>
                      </Grid>
                    );
                  }
                );
              })}
            </Grid>
          </Box>
        ))}
      </Box>
    );
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography>错误：{error.message}</Typography>;
  if (!material || !currentQuestion || !currentQuestionDetail)
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

        <Box sx={{ flexGrow: 1, p: 2, overflowY: "auto" }}>
          <LearningMaterial
            material={material}
            currentSection={currentSectionIndex}
            currentQuestion={currentQuestion}
            currentQuestionDetail={currentQuestionDetail}
            onNext={nextQuestionDetail}
            onPrevious={previousQuestionDetail}
            onAnswerChange={handleAnswerChange}
            onStatusChange={handleStatusChange}
            cachedAnswer={
              answerCache[
                `${
                  material.sections[currentSectionIndex].uuid
                }_${getCurrentQuestionIndex()}`
              ]
            }
            cachedStatus={
              statusCache[
                `${
                  material.sections[currentSectionIndex].uuid
                }_${getCurrentQuestionIndex()}`
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
