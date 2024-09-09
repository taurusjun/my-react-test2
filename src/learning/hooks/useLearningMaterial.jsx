import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";

export const useLearningMaterial = (materialUuid) => {
  const [material, setMaterial] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [answerCache, setAnswerCache] = useState({});
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
    async (sectionUuid, questionIndex, newAnswer = null) => {
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel("新请求开始");
      }
      cancelTokenRef.current = axios.CancelToken.source();

      setIsNavigating(true);
      setLoading(true);
      try {
        const url = `/api/learning-material/${materialUuid}/section/${sectionUuid}/question/${questionIndex}`;
        const config = {
          cancelToken: cancelTokenRef.current.token,
          params: newAnswer ? { answer: newAnswer } : {},
        };
        const response = await axios.get(url, config);
        setCurrentQuestion(response.data);

        // 只有当 material 不为 null 时才更新 currentSectionIndex
        if (material) {
          setCurrentSectionIndex(
            material.sections.findIndex((s) => s.uuid === sectionUuid)
          );
        }
        setCurrentQuestionIndex(questionIndex);
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
    [materialUuid, material]
  );

  const handleAnswerChange = useCallback(
    (newAnswer) => {
      setAnswerCache((prev) => ({
        ...prev,
        [`${currentQuestion.sectionUuid}_${currentQuestion.order_in_section}`]:
          newAnswer,
      }));
    },
    [currentQuestion]
  );

  const handleNavigation = useCallback(
    (sectionUuid, questionIndex) => {
      const currentAnswer =
        answerCache[
          `${currentQuestion.sectionUuid}_${currentQuestion.order_in_section}`
        ];
      const cachedAnswer = answerCache[`${sectionUuid}_${questionIndex}`];

      if (currentAnswer !== cachedAnswer) {
        fetchQuestion(sectionUuid, questionIndex, currentAnswer);
      } else {
        fetchQuestion(sectionUuid, questionIndex);
      }
    },
    [currentQuestion, answerCache, fetchQuestion]
  );

  const nextQuestion = useCallback(() => {
    const currentSectionData = material.sections[currentSectionIndex];
    if (currentQuestionIndex < currentSectionData.questionCount - 1) {
      handleNavigation(currentSectionData.uuid, currentQuestionIndex + 1);
    } else if (currentSectionIndex < material.sections.length - 1) {
      handleNavigation(material.sections[currentSectionIndex + 1].uuid, 0);
    }
  }, [material, currentSectionIndex, currentQuestionIndex, handleNavigation]);

  const previousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      handleNavigation(
        material.sections[currentSectionIndex].uuid,
        currentQuestionIndex - 1
      );
    } else if (currentSectionIndex > 0) {
      const prevSectionData = material.sections[currentSectionIndex - 1];
      handleNavigation(prevSectionData.uuid, prevSectionData.questionCount - 1);
    }
  }, [currentSectionIndex, currentQuestionIndex, material, handleNavigation]);

  return {
    material,
    currentQuestion,
    currentSectionIndex,
    currentQuestionIndex,
    loading,
    error,
    isNavigating,
    answerCache,
    nextQuestion,
    previousQuestion,
    handleAnswerChange,
    handleNavigation,
  };
};
