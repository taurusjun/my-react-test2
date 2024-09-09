import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";

export const useLearningMaterial = (materialUuid) => {
  const [material, setMaterial] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentQuestionDetail, setCurrentQuestionDetail] = useState(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [answerCache, setAnswerCache] = useState({});
  const cancelTokenRef = useRef(null);

  const fetchMaterialStructure = useCallback(async () => {
    try {
      const response = await axios.get(
        `/api/learning-material/${materialUuid}/structure`
      );
      const materialData = response.data;
      setMaterial(materialData);

      // 确保 material 数据已加载后再获取第一个问题详情
      if (materialData.sections && materialData.sections.length > 0) {
        const firstSection = materialData.sections[0];
        if (firstSection.questions && firstSection.questions.length > 0) {
          fetchQuestionDetail(materialData, firstSection.uuid, 1);
        }
      }
    } catch (error) {
      if (!axios.isCancel(error)) {
        console.error("获取学习资料结构失败", error);
        setError(error);
      }
    } finally {
      setLoading(false);
    }
  }, [materialUuid]);

  const fetchQuestionDetail = useCallback(
    async (materialData, sectionUuid, questionIndex, newAnswer = null) => {
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel("新请求开始");
      }
      cancelTokenRef.current = axios.CancelToken.source();

      setIsNavigating(true);
      setLoading(true);
      try {
        if (!materialData) {
          throw new Error("学习资料尚未加载");
        }

        const section = materialData.sections.find(
          (s) => s.uuid === sectionUuid
        );
        if (!section) {
          throw new Error("未找到指定的章节");
        }

        let questionUuid, detailIndex;
        let remainingIndex = questionIndex;

        for (const question of section.questions) {
          if (remainingIndex <= question.questionDetailCount) {
            questionUuid = question.uuid;
            detailIndex = remainingIndex;
            break;
          }
          remainingIndex -= question.questionDetailCount;
        }

        if (!questionUuid || !detailIndex) {
          throw new Error("未找到指定的问题详情");
        }

        const url = `/api/learning-material/${materialUuid}/section/${sectionUuid}/question/${questionUuid}/detail/${detailIndex}`;
        const config = {
          cancelToken: cancelTokenRef.current.token,
          params: newAnswer ? { answer: newAnswer } : {},
        };
        const response = await axios.get(url, config);
        setCurrentQuestion(response.data);
        setCurrentQuestionDetail(response.data.currentDetail);

        setCurrentSectionIndex(
          materialData.sections.findIndex((s) => s.uuid === sectionUuid)
        );
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.error("获取问题详情失败", error);
          setError(error);
        }
      } finally {
        setLoading(false);
        setIsNavigating(false);
      }
    },
    [materialUuid]
  );

  useEffect(() => {
    fetchMaterialStructure();
    return () => {
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel("组件卸载");
      }
    };
  }, [fetchMaterialStructure]);

  const handleAnswerChange = useCallback(
    (newAnswer) => {
      setAnswerCache((prev) => ({
        ...prev,
        [`${currentQuestion.uuid}_${currentQuestionDetail.order_in_question}`]:
          newAnswer,
      }));
    },
    [currentQuestion, currentQuestionDetail]
  );

  const handleNavigation = useCallback(
    (sectionUuid, questionIndex) => {
      if (!material) return;

      const currentAnswer =
        answerCache[
          `${currentQuestion?.uuid}_${currentQuestionDetail?.order_in_question}`
        ];
      const cachedAnswer = answerCache[`${sectionUuid}_${questionIndex}`];

      if (currentAnswer !== cachedAnswer) {
        fetchQuestionDetail(
          material,
          sectionUuid,
          questionIndex,
          currentAnswer
        );
      } else {
        fetchQuestionDetail(material, sectionUuid, questionIndex);
      }
    },
    [
      material,
      currentQuestion,
      currentQuestionDetail,
      answerCache,
      fetchQuestionDetail,
    ]
  );

  const nextQuestionDetail = useCallback(() => {
    const currentSection = material.sections[currentSectionIndex];
    let totalDetails = 0;
    let currentQuestionIndex = 0;

    for (const question of currentSection.questions) {
      if (question.uuid === currentQuestion.uuid) {
        currentQuestionIndex =
          totalDetails + currentQuestionDetail.order_in_question;
        break;
      }
      totalDetails += question.questionDetailCount;
    }

    if (currentQuestionIndex < totalDetails) {
      handleNavigation(currentSection.uuid, currentQuestionIndex + 1);
    } else if (currentSectionIndex < material.sections.length - 1) {
      const nextSection = material.sections[currentSectionIndex + 1];
      handleNavigation(nextSection.uuid, 1);
    }
  }, [
    material,
    currentSectionIndex,
    currentQuestion,
    currentQuestionDetail,
    handleNavigation,
  ]);

  const previousQuestionDetail = useCallback(() => {
    const currentSection = material.sections[currentSectionIndex];
    let totalDetails = 0;
    let currentQuestionIndex = 0;

    for (const question of currentSection.questions) {
      if (question.uuid === currentQuestion.uuid) {
        currentQuestionIndex =
          totalDetails + currentQuestionDetail.order_in_question;
        break;
      }
      totalDetails += question.questionDetailCount;
    }

    if (currentQuestionIndex > 1) {
      handleNavigation(currentSection.uuid, currentQuestionIndex - 1);
    } else if (currentSectionIndex > 0) {
      const prevSection = material.sections[currentSectionIndex - 1];
      let prevSectionTotalDetails = 0;
      for (const question of prevSection.questions) {
        prevSectionTotalDetails += question.questionDetailCount;
      }
      handleNavigation(prevSection.uuid, prevSectionTotalDetails);
    }
  }, [
    material,
    currentSectionIndex,
    currentQuestion,
    currentQuestionDetail,
    handleNavigation,
  ]);

  return {
    material,
    currentQuestion,
    currentQuestionDetail,
    currentSectionIndex,
    loading,
    error,
    isNavigating,
    answerCache,
    nextQuestionDetail,
    previousQuestionDetail,
    handleAnswerChange,
    handleNavigation,
    fetchQuestionDetail: useCallback(
      (sectionUuid, questionIndex, newAnswer = null) => {
        if (material) {
          fetchQuestionDetail(material, sectionUuid, questionIndex, newAnswer);
        }
      },
      [material, fetchQuestionDetail]
    ),
  };
};
