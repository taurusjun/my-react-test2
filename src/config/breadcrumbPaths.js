export const getBreadcrumbPaths = () => ({
  examList: [{ name: "考卷中心", url: "/exams/list" }],
  examEdit: [
    { name: "考卷中心", url: "/exams/list" },
    { name: "考卷编辑", url: "" },
  ],
  examView: [
    { name: "考卷中心", url: "/exams/list" },
    { name: "考卷查看", url: "" },
  ],
  myExams: [{ name: "我的考试", url: "/my-exams" }],
  errorQuestions: [
    { name: "我的考试", url: "/my-exams" },
    { name: "错题查看", url: "" },
  ],
  questionList: [{ name: "题目列表", url: "/questions" }],
  questionEdit: [
    { name: "题目列表", url: "/questions" },
    { name: "编辑题目", url: "" },
  ],
  questionNew: [
    { name: "题目列表", url: "/questions" },
    { name: "新建题目", url: "" },
  ],
  userCenter: [{ name: "用户中心", url: "/user-center" }],

  // 添加错题集路径
  errorQuestionList: [{ name: "错题集", url: "/error-questions" }],
  errorQuestionView: [
    { name: "错题集", url: "/error-questions" },
    { name: "错题查看", url: "" },
  ],
  errorQuestionPractice: [
    { name: "错题集", url: "/error-questions" },
    { name: "错题练习", url: "" },
  ],

  // 添加阅卷中心路径
  gradingCenter: [{ name: "阅卷中心", url: "/grading-center" }],
  examGrading: [
    { name: "阅卷中心", url: "/grading-center" },
    { name: "试卷批改", url: "" },
  ],
  examResult: [
    { name: "阅卷中心", url: "/grading-center" },
    { name: "批改结果", url: "" },
  ],

  // 可以添加其他页面的路径

  // 添加学习资料相关的面包屑路径
  learningMaterialList: [{ name: "我的学习", url: "/learning" }],
  learningMaterial: [
    { name: "我的学习", url: "/learning" },
    { name: "学习资料", url: "" },
  ],

  // 添加文件校正相关路径
  fileCorrectionList: [{ name: "文件校正", url: "/file-correction" }],
  fileCorrectionEdit: [
    { name: "文件校正", url: "/file-correction" },
    { name: "文件校正编辑", url: "" },
  ],

  // ... 其他路径保持不变 ...
});
