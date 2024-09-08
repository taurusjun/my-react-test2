import React from "react";
import { useParams } from "react-router-dom";
import LearningMaterial from "../components/LearningMaterial";
import { useLearningMaterial } from "../hooks/useLearningMaterial";
import CommonLayout from "../../layouts/CommonLayout";

const LearningPage = () => {
  const { materialId } = useParams();
  const {
    material,
    currentQuestion,
    loading,
    error,
    nextQuestion,
    previousQuestion,
    submitAnswer,
  } = useLearningMaterial(materialId);

  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误：{error.message}</div>;

  return (
    <CommonLayout>
      <LearningMaterial
        material={material}
        currentQuestion={currentQuestion}
        onNext={nextQuestion}
        onPrevious={previousQuestion}
        onSubmitAnswer={submitAnswer}
      />
    </CommonLayout>
  );
};

export default LearningPage;
