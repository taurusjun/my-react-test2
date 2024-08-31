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
  PredefinedTags,
  CategoryKNMapping,
} from "../provider/utils/dictionaries.js";

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
  PredefinedTags,
  CategoryKNMapping,
});

// 模拟问题数据的API响应
mock.onGet(/\/api\/questions\/.*/).reply(200, {
  type: "selection",
  category: "physics",
  kn: "mechanics",
  gradInfo: {
    school: "primary",
    grad: "grade5",
  },
  source: "2023年春季期中考试",
  tags: ["力学", "牛顿定律"],
  digest: "关于力和运动的多选题",
  material: "以下是关于力和运动的一些描述。",
  questionDetails: [
    {
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
        "力是物体运动状态改变的原因，且力的作用是相互的，这是牛顿运动��律的基本内容。",
      uiType: "multi_selection",
      answer: ["C", "D"],
      answerImage: null,
    },
  ],
});

mock.onGet("/api/questionlist").reply((config) => {
  const { category, searchType, searchTerm } = config.params;

  // 模拟的问题列表
  const mockQuestions = [
    { uuid: "a1b2c3d4", digest: "牛顿第一定律", category: "物理", KN: "力学" },
    { uuid: "e5f6g7h8", digest: "光合作用", category: "生物", KN: "植物生理" },
    {
      uuid: "i9j0k1l2",
      digest: "细胞结构",
      category: "生物",
      KN: "细胞生物学",
    },
    // 可以添加更多模拟数据...
  ];

  // 根据搜索条件过滤问题
  let filteredQuestions = mockQuestions;

  if (category) {
    filteredQuestions = filteredQuestions.filter(
      (q) => q.category === category
    );
  }

  if (searchTerm) {
    filteredQuestions = filteredQuestions.filter((q) => {
      if (searchType === "digest") {
        return q.digest.includes(searchTerm);
      } else if (searchType === "knowledge") {
        return q.KN.includes(searchTerm);
      }
      return true;
    });
  }

  return [200, filteredQuestions];
});
