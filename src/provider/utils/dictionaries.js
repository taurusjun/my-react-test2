// 题目类型字典
export const TypeDict = {
  selection: "选择题",
  multiSelection: "多选题",
  fillInBlank: "填空题",
  shortAnswer: "简答题",
  calculation: "计算题",
  // 可以根据需要添加更多类型
};

// 学科类别字典
export const CategoryDict = {
  physics: "物理",
  chemistry: "化学",
  biology: "生物",
  math: "数学",
  chinese: "语文",
  english: "英语",
  history: "历史",
  geography: "地理",
  // 可以根据需要添加更多学科
};

// 知识点字典
export const KNDict = {
  // 物理知识点
  mechanics: "力学",
  thermodynamics: "热学",
  optics: "光学",
  electromagnetism: "电磁学",

  // 化学知识点
  organicChemistry: "有机化学",
  inorganicChemistry: "无机化学",
  physicalChemistry: "物理化学",

  // 生物知识点
  cellBiology: "细胞生物学",
  genetics: "遗传学",
  ecology: "生态学",

  // 数学知识点
  algebra: "代数",
  geometry: "几何",
  calculus: "微积分",

  // 可以根据需要添加更多知识点
};

export const CategoryKNMapping = {
  physics: ["mechanics", "thermodynamics", "optics", "electromagnetism"],
  chemistry: ["organicChemistry", "inorganicChemistry", "physicalChemistry"],
  biology: ["cellBiology", "genetics", "ecology"],
  math: ["algebra", "geometry", "calculus"],
};

// 学校类型字典
export const SchoolDict = {
  primary: "小学",
  juniorHigh: "初中",
  seniorHigh: "高中",
};

// 年级字典
export const GradeDict = {
  grade1: "一年级",
  grade2: "二年级",
  grade3: "三年级",
  grade4: "四年级",
  grade5: "五年级",
  grade6: "六年级",
  grade7: "七年级",
  grade8: "八年级",
  grade9: "九年级",
  grade10: "高一",
  grade11: "高二",
  grade12: "高三",
};

export const SchoolGradeMapping = {
  primary: ["grade1", "grade2", "grade3", "grade4", "grade5", "grade6"],
  junior: ["grade7", "grade8", "grade9"],
  senior: ["grade10", "grade11", "grade12"],
};

// 难度等级字典
export const DifficultyDict = {
  1: "简单",
  2: "较易",
  3: "中等",
  4: "较难",
  5: "困难",
};

// 预定义标签
export const PredefinedTags = ["重要", "难题", "常考", "创新", "综合"];

// 标签字典
export const TagDict = {
  important: "重要",
  difficult: "难题",
  frequentlyTested: "常考",
  innovative: "创新",
  comprehensive: "综合",
};
