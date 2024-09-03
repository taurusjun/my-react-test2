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
import { format } from "date-fns";

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
  gradInfo: {
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
    { uuid: "uuid-3456-cdef-7890", name: "高中物理教材" },
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
