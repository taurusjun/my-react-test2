import { useState, useEffect } from "react";
import axios from "axios";

export const useLearningMaterial = (materialUuid) => {
  const [material, setMaterial] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMaterial = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `/api/learning-materials/${materialUuid}`
        );
        setMaterial(response.data);
        if (
          response.data.sections.length > 0 &&
          response.data.sections[0].questions.length > 0
        ) {
          await fetchQuestion(response.data.sections[0].questions[0].uuid);
        }
      } catch (err) {
        setError("获取学习资料失败");
      } finally {
        setLoading(false);
      }
    };

    fetchMaterial();
  }, [materialUuid]);

  const fetchQuestion = async (questionUuid) => {
    try {
      const response = await axios.get(`/api/questions/${questionUuid}`);
      setCurrentQuestion(response.data);
    } catch (err) {
      setError("获取题目失败");
    }
  };

  const nextQuestion = async () => {
    if (!material) return;

    const currentSection = material.sections[currentSectionIndex];
    if (currentQuestionIndex < currentSection.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      await fetchQuestion(
        currentSection.questions[currentQuestionIndex + 1].uuid
      );
    } else if (currentSectionIndex < material.sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      setCurrentQuestionIndex(0);
      await fetchQuestion(
        material.sections[currentSectionIndex + 1].questions[0].uuid
      );
    }
  };

  const previousQuestion = async () => {
    if (!material) return;

    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      await fetchQuestion(
        material.sections[currentSectionIndex].questions[
          currentQuestionIndex - 1
        ].uuid
      );
    } else if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
      const prevSection = material.sections[currentSectionIndex - 1];
      setCurrentQuestionIndex(prevSection.questions.length - 1);
      await fetchQuestion(
        prevSection.questions[prevSection.questions.length - 1].uuid
      );
    }
  };

  const submitAnswer = async (answer) => {
    if (!currentQuestion) return;

    try {
      const response = await axios.post(
        `/api/questions/${currentQuestion.uuid}/answer`,
        { answer }
      );
      return response.data;
    } catch (err) {
      setError("提交答案失败");
    }
  };

  return {
    material,
    currentQuestion,
    loading,
    error,
    nextQuestion,
    previousQuestion,
    submitAnswer,
  };
};
