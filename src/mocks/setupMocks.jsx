import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import {
  TypeDict,
  CategoryDict,
  KNDict,
  SchoolDict,
  GradeDict,
  DifficultyDict,
  SchoolGradeMapping,
  TagDict,
  CategoryKNMapping,
} from "../provider/utils/dictionaries.js";
import { format, addDays } from "date-fns";

// 创建一个新的MockAdapter实例
const mock = new MockAdapter(axios, { onNoMatch: "passthrough" });

// 模拟字典数据的API响应
mock.onGet("/api/dictionaries").reply(200, {
  TypeDict,
  CategoryDict,
  KNDict,
  SchoolDict,
  GradeDict,
  SchoolGradeMapping,
  DifficultyDict,
  TagDict,
  CategoryKNMapping,
});

// 模拟问题数据的API响应
mock.onGet(/\/api\/questions\/.*/).reply(200, {
  uuid: "uuid-question-1",
  type: "selection",
  category: "physics",
  kn: "mechanics",
  gradeInfo: {
    school: "primary",
    grade: "grade5",
  },
  source: "2023年春季期中考试",
  tags: ["frequentlyTested", "important"],
  digest: "关于力和运动的多选题",
  material: "以下是关于力和运动的一些描述。",
  questionDetails: [
    {
      uuid: "uuid-question-detail-1",
      order_in_question: 1,
      questionContent: {
        value: "下列关于力和运动的说法，正确的是：",
        image: null,
      },
      rows: [
        { value: "物体运动一定有力", isAns: false, image: null },
        { value: "物体受力一定运动", isAns: false, image: null },
        { value: "力是物体运动状态改变的原因", isAns: true, image: null },
        { value: "力的作用是相互的", isAns: true, image: null },
      ],
      rate: 3,
      explanation:
        "力是物体运动状态改变的原因，且力的作用是相互的，这是牛顿运动律的基本内容。",
      uiType: "multi_selection",
      answer: ["C", "D"],
      answerImage: null,
    },
  ],
  relatedSources: [
    { uuid: "uuid-1234-abcd-5678", name: "2010年春季物理竞赛" },
    { uuid: "uuid-3456-cdef-7890", name: "高中物理教材" },
  ],
});

// 添加对 /api/related-sources 的模拟
mock.onGet("/api/related-sources").reply((config) => {
  const query = config.params.query.toLowerCase();
  const allOptions = [
    { uuid: "uuid-1234-abcd-5678", name: "2010年春季物理竞赛" },
    { uuid: "uuid-2345-bcde-6789", name: "2011年秋季数学竞赛" },
    { uuid: "uuid-3456-cdef-7890", name: "高中��理教材" },
    { uuid: "uuid-4567-defg-8901", name: "2022年高考真题" },
    { uuid: "uuid-5678-efgh-9012", name: "初中数学竞赛题集" },
    { uuid: "uuid-6789-fghi-0123", name: "高中化学实验指南" },
  ];

  const filteredOptions = allOptions.filter((option) =>
    option.name.toLowerCase().includes(query)
  );

  return [200, filteredOptions];
});

mock.onGet("/api/questionlist").reply((config) => {
  const {
    category,
    searchType,
    searchTerm,
    page = 1,
    pageSize = 10,
    relatedSources = [],
  } = config.params;

  // 模拟的问题列表
  const mockQuestions = Array(100)
    .fill()
    .map((_, index) => ({
      uuid: `question-${index + 1}`,
      digest: `问题摘要 ${index + 1}`,
      category: index % 2 === 0 ? "physics" : "biology",
      KN: `知识点 ${index + 1}`,
      updatedAt: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
      relatedSources:
        index % 2 === 0
          ? [{ uuid: "uuid-1234-abcd-5678", name: "2010年春季物理竞赛" }]
          : [{ uuid: "uuid-3456-cdef-7890", name: "高中物理教材" }], // 使用模拟的关联资源
    }));

  // 根据搜索条件过滤问题
  let filteredQuestions = [...mockQuestions];

  if (category) {
    filteredQuestions = filteredQuestions.filter(
      (q) => q.category === category
    );
  }

  if (searchTerm) {
    filteredQuestions = filteredQuestions.filter((q) => {
      if (searchType === "digest") {
        return q.digest.toLowerCase().includes(searchTerm.toLowerCase());
      } else if (searchType === "knowledge") {
        return q.KN.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return true;
    });
  }

  if (relatedSources.length > 0) {
    filteredQuestions = filteredQuestions.filter((q) =>
      relatedSources.some((source) =>
        q.relatedSources.some((relSource) => relSource.uuid === source)
      )
    );
  }

  const totalCount = filteredQuestions.length;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedQuestions = filteredQuestions.slice(startIndex, endIndex);

  return [
    200,
    {
      items: paginatedQuestions,
      totalCount: totalCount,
    },
  ];
});

// 更新模拟考试数据
mock.onGet("/api/exams").reply((config) => {
  const { page = 1, pageSize = 10, name, category } = config.params;

  // 模拟的考试列表
  const mockExams = Array(50)
    .fill()
    .map((_, index) => ({
      uuid: `exam-${index + 1}`,
      name: `模拟考试 ${index + 1}`,
      category: index % 2 === 0 ? "math" : "physics",
      createdAt: format(addDays(new Date(), -index), "yyyy-MM-dd HH:mm:ss"),
      startTime: format(addDays(new Date(), index), "yyyy-MM-dd HH:mm:ss"),
      duration: 120, // 单位：分钟
      totalScore: 100,
      status:
        index % 3 === 0 ? "未开始" : index % 3 === 1 ? "进行中" : "已结束",
    }));

  // 根据搜索条件过滤考试
  let filteredExams = [...mockExams];

  if (name) {
    filteredExams = filteredExams.filter((exam) =>
      exam.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  if (category) {
    filteredExams = filteredExams.filter((exam) => exam.category === category);
  }

  const totalCount = filteredExams.length;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedExams = filteredExams.slice(startIndex, endIndex);

  return [
    200,
    {
      exams: paginatedExams,
      totalCount: totalCount,
    },
  ];
});

// 添加获取单个考试数据的模拟
mock.onGet(/\/api\/exams\/.*/).reply((config) => {
  const uuid = config.url.split("/").pop();

  const mockExam = {
    uuid: uuid,
    name: "模拟考试 1",
    category: "math",
    stage: "middle",
    createdAt: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
    startTime: format(addDays(new Date(), 7), "yyyy-MM-dd HH:mm:ss"),
    duration: 120,
    totalScore: 100,
    status: "未开始",
    sections: [
      {
        id: "section-1",
        name: "选择题",
        order_in_exam: 1,
        questions: [
          {
            uuid: "question-1",
            digest: "这是第一道选择题，考察基础数学概念。",
            difficulty: "easy",
            content: "1 + 1 = ?",
            options: ["A. 1", "B. 2", "C. 3", "D. 4"],
            answer: "B",
            score: 5,
            order_in_section: 1,
          },
          {
            uuid: "question-2",
            digest: "这是第二道选择题，考察代数运算。",
            difficulty: "medium",
            content: "解方程：2x + 5 = 13",
            options: ["A. x = 3", "B. x = 4", "C. x = 5", "D. x = 6"],
            answer: "B",
            score: 5,
            order_in_section: 2,
          },
        ],
      },
      {
        id: "section-2",
        name: "填空题",
        order_in_exam: 2,
        questions: [
          {
            uuid: "question-3",
            digest: "这是一道填空题，考察几何知识。",
            difficulty: "medium",
            content: "圆的面积公式是 ______。",
            answer: "πr²",
            score: 10,
            order_in_section: 1,
          },
        ],
      },
      {
        id: "section-3",
        name: "解答题",
        order_in_exam: 3,
        questions: [
          {
            uuid: "question-4",
            digest: "这是一道解答题，考察函数应用。",
            difficulty: "hard",
            content: "已知函数f(x) = 2x² + 3x - 1，求f(x)的最小值。",
            answer:
              "解答步骤：\n1. 求导数f'(x) = 4x + 3\n2. 令f'(x) = 0，解得x = -3/4\n3. 计算f(-3/4) = -25/8\n所以，最小值为 -25/8",
            score: 20,
            order_in_section: 1,
          },
        ],
      },
    ],
  };

  return [200, mockExam];
});

// 添加更新考试数据的模拟
mock.onPut(/\/api\/exams\/.*/).reply((config) => {
  const updatedExam = JSON.parse(config.data);
  console.log("更新的考试数据:", updatedExam);
  return [200, { message: "考试更新成功" }];
});
