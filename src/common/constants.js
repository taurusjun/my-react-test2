export const QUESTION_UI_TYPES = {
  single_selection: "单项选择题",
  multi_selection: "多项选择题",
  true_false: "判断题",
  fill_blank: "填空题",
  short_answer: "简答题",
  calculation: "计算题",
  essay: "论述题",
};

export const QUESTION_TYPES = {
  selection: "单项选择题",
  multiSelection: "多项选择题",
  trueFalse: "判断题",
  fillInBlank: "填空题",
  shortAnswer: "简答题",
  calculation: "计算题",
  essay: "论述题",
};

// UI题型到后端题型的映射关系
export const UI_TYPE_TO_BACKEND_TYPE_MAPPING = {
  single_selection: "selection",
  multi_selection: "multiSelection",
  true_false: "trueFalse",
  fill_blank: "fillInBlank",
  short_answer: "shortAnswer",
  calculation: "calculation",
  essay: "essay",
};

// 映射函数：将UI题型转换为后端题型
export const mapUITypeToBackendType = (uiType) => {
  return UI_TYPE_TO_BACKEND_TYPE_MAPPING[uiType] || "fillInBlank"; // 默认为填空题
};

// 反向映射：将后端题型转换为UI题型
export const mapBackendTypeToUIType = (backendType) => {
  const mapping = Object.entries(UI_TYPE_TO_BACKEND_TYPE_MAPPING)
    .find(([, value]) => value === backendType);
  return mapping ? mapping[0] : "fill_blank"; // 默认为填空题
};

// 支持CommonJS导出（用于测试）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    QUESTION_UI_TYPES,
    QUESTION_TYPES,
    UI_TYPE_TO_BACKEND_TYPE_MAPPING,
    mapUITypeToBackendType,
    mapBackendTypeToUIType,
  };
}

// 如果有其他常量，也可以在这里定义和导出
// 如果有其他常量，也可以在这里定义和导出
