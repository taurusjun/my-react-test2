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
    { uuid: "uuid-3456-cdef-7890", name: "高中理教材" },
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
      kn: `知识点 ${index + 1}`,
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
        return q.kn.toLowerCase().includes(searchTerm.toLowerCase());
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

// 修改获取单个考试数据的模拟
mock.onGet(/\/api\/exams\/.*/).reply((config) => {
  const uuid = config.url.split("/").pop();

  const mockExam = {
    uuid: uuid,
    name: "物理模拟考试 1",
    category: "physics",
    gradeInfo: {
      school: "senior",
      grade: "grade11",
    },
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
            digest: "这是第一道选择题，考察基本物理概念。",
            content: "以下哪个是力的单位？",
            options: ["A. 米(m)", "B. 牛顿(N)", "C. 焦耳(J)", "D. 瓦特(W)"],
            answer: "B",
            score: 5,
            order_in_section: 1,
            kn: "mechanics",
          },
          {
            uuid: "question-2",
            digest: "这是第二道选择题，考察运动学知识。",
            content: "一个物体做匀速直线运动，以下哪个物理量保持不变？",
            options: ["A. 位移", "B. 速度", "C. 加速度", "D. 时间"],
            answer: "B",
            score: 5,
            order_in_section: 2,
            kn: "mechanics",
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
            digest: "这是一道填空题，考察��转换。",
            content: "物体从高处自由落下，重力势能转化为 ______ 能。",
            answer: "动能",
            score: 10,
            order_in_section: 1,
            kn: "mechanics",
          },
        ],
      },
      {
        id: "section-3",
        name: "计算题",
        order_in_exam: 3,
        questions: [
          {
            uuid: "question-4",
            digest: "这是一道计算题，考察牛顿运动定律的应用。",
            content:
              "一个质量为2kg的物体在光滑水平面上受到5N的水平力作用。计算10秒后物体的速度。",
            answer:
              "解答步骤：\n1. 根据牛顿第二定律，F = ma\n2. a = F/m = 5N / 2kg = 2.5 m/s²\n3. 由于初速度为0，使用v = at\n4. v = 2.5 m/s² * 10s = 25 m/s\n所以，10秒后物体的速度为25 m/s。",
            score: 20,
            order_in_section: 1,
            kn: "mechanics",
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

// 模拟创建新问题的 POST 请求
mock.onPost("/api/questions").reply((config) => {
  const newQuestion = JSON.parse(config.data);
  console.log("创建的新问题:", newQuestion);

  // 生成一个新的 UUID
  const newUuid = `question-${Date.now()}`;

  // 返回创建成功的响应，包含新创建的问题数据
  return [
    201,
    {
      ...newQuestion,
      uuid: newUuid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
});

// 模拟更新现有问题的 PUT 请求
mock.onPut(/\/api\/questions\/.*/).reply((config) => {
  const uuid = config.url.split("/").pop();
  const updatedQuestion = JSON.parse(config.data);
  console.log(`更新问题 ${uuid}:`, updatedQuestion);

  // 返回更新成功的响应，包含更新后的问题数据
  return [
    200,
    {
      ...updatedQuestion,
      uuid: uuid,
      updatedAt: new Date().toISOString(),
    },
  ];
});

// 为 /api/exams/view/${uuid} 添加模拟数据
mock.onGet(/\/api\/examview\/.*/).reply((config) => {
  const uuid = config.url.split("/").pop();

  const mockExam = {
    uuid: uuid,
    name: "2024年物理综合模拟考试",
    category: "physics",
    gradeInfo: {
      school: "senior",
      grade: "grade11",
    },
    createdAt: "2024-09-05 22:47:43",
    startTime: "2024-09-12 22:47:43",
    duration: 120,
    totalScore: 100,
    status: "未开始",
    sections: [
      {
        uuid: "section-1",
        name: "选择题",
        order_in_exam: 1,
        questions: [
          // 保留原有的多选题（2个questionDetails）
          {
            uuid: "question-1",
            type: "selection",
            category: "physics",
            kn: "mechanics",
            gradeInfo: { school: "senior", grade: "grade11" },
            source: "2023年春季期中考试",
            tags: ["important"],
            digest: "关于力和运动的多选题",
            material: "以下是关于力和运动的一些描述。",
            questionDetails: [
              {
                uuid: "question_detail-1",
                order_in_question: 1,
                questionContent: {
                  value: "下列关于力和运动的说法，正确的是：",
                  image: null,
                },
                rows: [
                  { value: "物体运动一定有力", isAns: false, image: null },
                  { value: "物体受力一定运动", isAns: false, image: null },
                  {
                    value: "力是物体运动状态改变的原因",
                    isAns: true,
                    image: null,
                  },
                  { value: "力的作用是相互的", isAns: true, image: null },
                ],
                score: 2,
                rate: 4,
                explanation:
                  "力是物体运动状态改变的原因，且力的作用是相互的，这是牛顿运动律的基本内容。",
                uiType: "multi_selection",
                answer: ["C", "D"],
                answerImage: null,
              },
              {
                uuid: "question_detail-2",
                order_in_question: 2,
                questionContent: {
                  value: "关于牛顿第二定律，以下说法正确的是：",
                  image: null,
                },
                rows: [
                  {
                    value: "物体的加速度与作用力成正比",
                    isAns: true,
                    image: null,
                  },
                  {
                    value: "物体的加速度与质量成正比",
                    isAns: false,
                    image: null,
                  },
                  {
                    value: "物体的加速度方向总是与力的方向相同",
                    isAns: true,
                    image: null,
                  },
                  { value: "F=ma中的m必须是常量", isAns: false, image: null },
                ],
                score: 2,
                rate: 3,
                explanation:
                  "牛顿第二定律表明加速度与力成正比，与质量成反比，且加速度方向与合力方向相同。",
                uiType: "multi_selection",
                answer: ["A", "C"],
                answerImage: null,
              },
            ],
            relatedSources: [
              { uuid: "uuid-1234-abcd-5678", name: "2010年春季物理竞赛" },
              { uuid: "uuid-3456-cdef-7890", name: "高中物理教材" },
            ],
          },
          // 增加8个只有1个questionDetails的单选题
          {
            uuid: "question-2",
            type: "selection",
            category: "physics",
            kn: "thermodynamics",
            gradeInfo: { school: "senior", grade: "grade11" },
            source: "2023年秋季期末考试",
            tags: ["basic"],
            digest: "热力学第一定律单选题",
            material: "",
            questionDetails: [
              {
                uuid: "question_detail-3",
                order_in_question: 1,
                questionContent: {
                  value: "热力学第一定律的正确表述是：",
                  image: null,
                },
                rows: [
                  {
                    value: "系统的内能增加等于系统从外界吸收的热量",
                    isAns: false,
                    image: null,
                  },
                  {
                    value: "系统的内能增加等于外界对系统做的功",
                    isAns: false,
                    image: null,
                  },
                  {
                    value:
                      "系统的内能增加等于系统从外界吸收的热量和外界对系统做的功之和",
                    isAns: true,
                    image: null,
                  },
                  {
                    value: "系统的内能增加等于系统对外界做的功",
                    isAns: false,
                    image: null,
                  },
                ],
                score: 2,
                rate: 3,
                explanation:
                  "热力学第一定律表明，系统的内能增加等于系统从外界吸收的热量和外界对系统做的功之和。",
                uiType: "single_selection",
                answer: ["C"],
                answerImage: null,
              },
            ],
            relatedSources: [
              { uuid: "uuid-5678-efgh-1234", name: "高中物理教材 - 热学部分" },
            ],
          },
          // 添加更多单选题...（重复类似的结构，更改内容和UUID）
        ],
      },
      {
        uuid: "section-2",
        name: "填空题",
        order_in_exam: 2,
        questions: [
          {
            uuid: "question-10",
            type: "fill_in_blank",
            category: "physics",
            kn: "electromagnetism",
            gradeInfo: { school: "senior", grade: "grade11" },
            source: "2024年模拟考试",
            tags: ["important"],
            digest: "电磁感应定律填空题",
            material: "法拉第电磁感应定律是电磁学的基本定律之一。",
            questionDetails: [
              {
                uuid: "question_detail-10",
                order_in_question: 1,
                questionContent: {
                  value:
                    "法拉第电磁感应定律指出，感应电动势的大小与穿过闭合回路的______变化率的大小成正比。",
                  image: null,
                },
                rows: [],
                score: 2,
                rate: 4,
                explanation:
                  "法拉第电磁感应定律表明，感应电动势的大小与穿过闭合回路的磁通量变化率的大小成正比。",
                uiType: "fill_in_blank",
                answer: ["磁通量"],
                answerImage: null,
              },
            ],
            relatedSources: [
              { uuid: "uuid-9012-ijkl-5678", name: "高中物理教材 - 电磁学" },
            ],
          },
          {
            uuid: "question-11",
            type: "fill_in_blank",
            category: "physics",
            kn: "optics",
            gradeInfo: { school: "senior", grade: "grade11" },
            source: "2024年模拟考试",
            tags: ["basic"],
            digest: "光的折射定律填空题",
            material: "",
            questionDetails: [
              {
                uuid: "question_detail-11",
                order_in_question: 1,
                questionContent: {
                  value:
                    "光从一种介质斜射入另一种介质时，入射角的正弦与折射角的正弦之比等于两种介质的______之比。",
                  image: null,
                },
                rows: [],
                score: 2,
                rate: 3,
                explanation:
                  "折射定律（斯涅尔定律）指出，入射角的正弦与折射角的正弦之比等于两种介质的折射率之比。",
                uiType: "fill_in_blank",
                answer: ["折射率"],
                answerImage: null,
              },
            ],
            relatedSources: [
              { uuid: "uuid-3456-mnop-7890", name: "高中物理教材 - 光学" },
            ],
          },
        ],
      },
      {
        uuid: "section-3",
        name: "计算题",
        order_in_exam: 3,
        questions: [
          // 保留原有的计算题（2个questionDetails）
          {
            uuid: "question-12",
            type: "calculation",
            category: "physics",
            kn: "kinematics",
            gradeInfo: { school: "senior", grade: "grade11" },
            source: "2024年模拟考试",
            tags: ["difficult"],
            digest: "匀变速直线运动综合计算题",
            material:
              "一辆汽车在笔直的公路上行驶，初速度为10m/s，加速度为2m/s²。",
            questionDetails: [
              {
                uuid: "question_detail-12",
                order_in_question: 1,
                questionContent: {
                  value: "计算汽车行驶5秒后的速度。",
                  image: null,
                },
                rows: [],
                score: 3,
                rate: 3,
                explanation: "使用v = v0 + at计算末速度",
                uiType: "calculation",
                answer: ["末速度：v = 10 + 2 * 5 = 20 m/s"],
                answerImage: null,
              },
              {
                uuid: "question_detail-13",
                order_in_question: 2,
                questionContent: {
                  value: "计算汽车行驶5秒后的位移。",
                  image: null,
                },
                rows: [],
                score: 3,
                rate: 4,
                explanation: "使用s = v0t + (1/2)at²计算位移",
                uiType: "calculation",
                answer: ["位移：s = 10 * 5 + 0.5 * 2 * 5² = 75 m"],
                answerImage: null,
              },
            ],
            relatedSources: [
              {
                uuid: "uuid-7890-qrst-1234",
                name: "高中物理竞赛题集 - 运动学",
              },
            ],
          },
          {
            uuid: "question-13",
            type: "calculation",
            category: "physics",
            kn: "dynamics",
            gradeInfo: { school: "senior", grade: "grade11" },
            source: "2024年模拟考试",
            tags: ["difficult"],
            digest: "力学能守恒定律应用题",
            material:
              "一个质量为0.5kg的物体从10m高的斜面顶端由静止释放，滑到斜面底端。",
            questionDetails: [
              {
                uuid: "question_detail-14",
                order_in_question: 1,
                questionContent: {
                  value: "若忽略摩擦，计算物体到达斜面底端时的速度。",
                  image: null,
                },
                rows: [],
                score: 4,
                rate: 5,
                explanation: "使用力学能守恒定律，初始重力势能全部转化为动能",
                uiType: "calculation",
                answer: ["v = √(2gh) = √(2 * 9.8 * 10) ≈ 14 m/s"],
                answerImage: null,
              },
            ],
            relatedSources: [
              { uuid: "uuid-5678-uvwx-9012", name: "高中物理教材 - 能量守恒" },
            ],
          },
        ],
      },
    ],
  };

  // 添加更多只有1个questionDetails的题目
  for (let i = 3; i <= 9; i++) {
    mockExam.sections[0].questions.push({
      uuid: `question-${i}`,
      type: "selection",
      category: "physics",
      kn: `knowledge-area-${i}`,
      gradeInfo: { school: "senior", grade: "grade11" },
      source: "2024年模拟考试",
      tags: ["basic"],
      digest: `物理概念单选题 ${i}`,
      material: i % 2 === 0 ? "" : `这是第 ${i} 题的背景材料。`,
      questionDetails: [
        {
          uuid: `question_detail-${i}`,
          order_in_question: 1,
          questionContent: {
            value: `这是第 ${i} 个单选题的问题描述。`,
            image: null,
          },
          rows: [
            { value: "选项A", isAns: false, image: null },
            { value: "选项B", isAns: false, image: null },
            { value: "选项C", isAns: true, image: null },
            { value: "选项D", isAns: false, image: null },
          ],
          score: 2,
          rate: 3,
          explanation: `这是第 ${i} 个单选题的解释。`,
          uiType: "single_selection",
          answer: ["C"],
          answerImage: null,
        },
      ],
      relatedSources: [
        { uuid: `uuid-${i}000-${i}abc-${i}def`, name: `相关资源 ${i}` },
      ],
    });
  }

  return [200, mockExam];
});

// 模拟提交考试答案的请求
mock.onPost(/\/api\/exams\/.*\/submit/).reply((config) => {
  const uuid = config.url.split("/")[3]; // 从 URL 中提取考试 UUID
  const submittedAnswers = JSON.parse(config.data);

  console.log(`提交考试 ${uuid} 的答案:`, submittedAnswers);

  // 这里可以添加一些模拟的处理逻辑，比如检查答案格式等

  // 模拟服务器处理时间
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        200,
        {
          message: "考试答案提交成功",
          examUuid: uuid,
          submissionTime: new Date().toISOString(),
          // 可以添加更多的返回信息，比如得分等
          // score: 85, // 示例：模拟的得分
        },
      ]);
    }, 1000); // 模拟 1 秒的处理时间
  });
});

// 模拟保存考试答案的请求
mock.onPost(/\/api\/exams\/.*\/save/).reply((config) => {
  const uuid = config.url.split("/")[3]; // 从 URL 中提取考试 UUID
  const savedAnswers = JSON.parse(config.data);

  console.log(`保存考试 ${uuid} 的答案:`, savedAnswers);

  // 这里可以添加一些模拟的处理逻辑，比如验证答案格式等

  // 模拟服务器处理时间
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        200,
        {
          message: "考试答案已成功保存",
          examUuid: uuid,
          saveTime: new Date().toISOString(),
          // 可以添加更多的返回信息
          savedQuestionCount: Object.keys(savedAnswers.answers).length,
        },
      ]);
    }, 500); // 模拟 0.5 秒的处理时间
  });
});
