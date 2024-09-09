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
  const [statusCache, setStatusCache] = useState({});
  const cancelTokenRef = useRef(null);

  const fetchMaterialStructure = useCallback(async () => {
    console.log("开始获取学习资料结构");
    try {
      const response = await axios.get(
        `/api/learning-material/${materialUuid}/structure`
      );
      const materialData = response.data;
      console.log("获取到学习资料结构:", materialData);
      setMaterial(materialData);

      if (materialData.sections && materialData.sections.length > 0) {
        const firstSection = materialData.sections[0];
        if (firstSection.questions && firstSection.questions.length > 0) {
          console.log("开始获取第一个问题详情");
          await fetchQuestionDetail(materialData, firstSection.uuid, 1);
        }
      }
    } catch (error) {
      if (!axios.isCancel(error)) {
        console.error("获取学习资料结构失败", error);
        setError(error);
      }
    } finally {
      console.log("学习资料结构加载完成，设置 loading 为 false");
      setLoading(false);
    }
  }, [materialUuid]);

  const fetchQuestionDetail = useCallback(
    async (
      materialData,
      sectionUuid,
      questionIndex,
      newAnswer = null,
      newStatus = null
    ) => {
      console.log("开始获取问题详情", {
        sectionUuid,
        questionIndex,
        newAnswer,
        newStatus,
      });
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
          params: {
            ...(newAnswer !== null ? { answer: newAnswer } : {}),
            ...(newStatus !== null ? { status: newStatus } : {}),
          },
        };
        console.log("发送请求获取问题详情", url, config);
        const response = await axios.get(url, config);
        console.log("获取到问题详情:", response.data);
        setCurrentQuestion(response.data);
        setCurrentQuestionDetail(response.data.currentDetail);

        // 更新 answerCache 和 statusCache
        const cacheKey = `${sectionUuid}_${questionIndex}`;
        if (newAnswer !== null) {
          setAnswerCache((prev) => ({ ...prev, [cacheKey]: newAnswer }));
        }
        if (newStatus !== null) {
          setStatusCache((prev) => ({ ...prev, [cacheKey]: newStatus }));
        }

        setCurrentSectionIndex(
          materialData.sections.findIndex((s) => s.uuid === sectionUuid)
        );
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.error("获取问题详情失败", error);
          setError(error);
        }
      } finally {
        console.log("问题详情加载完成，设置 loading 和 isNavigating 为 false");
        setLoading(false);
        setIsNavigating(false);
      }
    },
    [materialUuid]
  );

  useEffect(() => {
    console.log("useEffect 触发，开始获取学习资料结构");
    fetchMaterialStructure();

    return () => {
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel("组件卸载");
      }
    };
  }, [fetchMaterialStructure]);

  const handleAnswerChange = useCallback(
    (newAnswer) => {
      if (!currentQuestion || !currentQuestionDetail) return;

      const currentSection = material.sections[currentSectionIndex];
      let questionIndex = 0;
      for (const question of currentSection.questions) {
        if (question.uuid === currentQuestion.uuid) {
          questionIndex += currentQuestionDetail.order_in_question;
          break;
        }
        questionIndex += question.questionDetailCount;
      }

      setAnswerCache((prev) => ({
        ...prev,
        [`${currentSection.uuid}_${questionIndex}`]: newAnswer,
      }));
    },
    [material, currentSectionIndex, currentQuestion, currentQuestionDetail]
  );

  const handleNavigation = useCallback(
    (sectionUuid, questionIndex, direction) => {
      if (!material) return;

      // 保存当前问题的答案和状态
      const currentSection = material.sections[currentSectionIndex];
      let currentQuestionIndex = 0;
      for (const question of currentSection.questions) {
        if (question.uuid === currentQuestion?.uuid) {
          currentQuestionIndex += currentQuestionDetail?.order_in_question || 0;
          break;
        }
        currentQuestionIndex += question.questionDetailCount;
      }

      const currentKey = `${currentSection.uuid}_${currentQuestionIndex}`;
      const currentAnswer = answerCache[currentKey];
      const currentStatus = statusCache[currentKey];

      // 发送当前答案和状态到后端
      axios
        .post(
          `/api/learning-material/${materialUuid}/section/${currentSection.uuid}/question/${currentQuestion.uuid}/answer`,
          {
            answer: currentAnswer,
            status: currentStatus,
          }
        )
        .then(() => {
          // 获取新问题的详情
          fetchQuestionDetail(material, sectionUuid, questionIndex);
        })
        .catch((error) => {
          console.error("保存答案失败", error);
        });
    },
    [
      material,
      currentSectionIndex,
      currentQuestion,
      currentQuestionDetail,
      answerCache,
      statusCache,
      fetchQuestionDetail,
      materialUuid,
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
      handleNavigation(currentSection.uuid, currentQuestionIndex + 1, "next");
    } else if (currentSectionIndex < material.sections.length - 1) {
      const nextSection = material.sections[currentSectionIndex + 1];
      handleNavigation(nextSection.uuid, 1, "next");
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
      handleNavigation(
        currentSection.uuid,
        currentQuestionIndex - 1,
        "previous"
      );
    } else if (currentSectionIndex > 0) {
      const prevSection = material.sections[currentSectionIndex - 1];
      let prevSectionTotalDetails = 0;
      for (const question of prevSection.questions) {
        prevSectionTotalDetails += question.questionDetailCount;
      }
      handleNavigation(prevSection.uuid, prevSectionTotalDetails, "previous");
    }
  }, [
    material,
    currentSectionIndex,
    currentQuestion,
    currentQuestionDetail,
    handleNavigation,
  ]);

  const handleStatusChange = useCallback(
    (newStatus) => {
      if (!currentQuestion || !currentQuestionDetail) return;

      const currentSection = material.sections[currentSectionIndex];
      let questionIndex = 0;
      for (const question of currentSection.questions) {
        if (question.uuid === currentQuestion.uuid) {
          questionIndex += currentQuestionDetail.order_in_question;
          break;
        }
        questionIndex += question.questionDetailCount;
      }

      const key = `${currentSection.uuid}_${questionIndex}`;
      setStatusCache((prev) => ({
        ...prev,
        [key]: newStatus,
      }));

      // 不再调用 fetchQuestionDetail
      console.log("状态已更新", { key, newStatus });
    },
    [material, currentSectionIndex, currentQuestion, currentQuestionDetail]
  );

  return {
    material,
    currentQuestion,
    currentQuestionDetail,
    currentSectionIndex,
    loading,
    error,
    isNavigating,
    answerCache,
    statusCache,
    nextQuestionDetail,
    previousQuestionDetail,
    handleAnswerChange,
    handleNavigation,
    handleStatusChange,
    fetchQuestionDetail: useCallback(
      (sectionUuid, questionIndex, newAnswer = null, newStatus = null) => {
        if (material) {
          fetchQuestionDetail(
            material,
            sectionUuid,
            questionIndex,
            newAnswer,
            newStatus
          );
        }
      },
      [material, fetchQuestionDetail]
    ),
  };
};
