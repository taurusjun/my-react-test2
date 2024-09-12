import React from "react";

const CutPreview = ({ sections }) => {
  return (
    <div>
      <h3>切割预览</h3>
      {sections.map((section) => (
        <div key={section.order}>
          <h4>{section.name}</h4>
          {section.questions.map((question) => (
            <div key={question.order}>
              <p>标准题 {question.order}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default CutPreview;
