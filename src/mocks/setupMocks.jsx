import axios from "axios";
import setupLearningMocks from "./setupLearningMocks.js";
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
import setupFileCorrectionMocks from "./setupFileCorrectionMocks.js";

// 创建一个新的MockAdapter实例
const mock = new MockAdapter(axios, { onNoMatch: "passthrough" });

// 设置学习资料相关的模拟数据
setupLearningMocks(mock);

// 设置文件校正相关的模拟数据
setupFileCorrectionMocks(mock);

// mock场景下，该拦截器会造成后续的mock请求无法正常进行，故删除
// 添加一个请求拦截器来打印请求头中的token
// mock.onAny().reply(function (config) {
//   const token = config.headers["Authorization"];
//   if (token) {
//     console.log("请求头中的token:", token);
//   } else {
//     console.log("请求头中没有token");
//   }

//   // 继续处理请求
//   return this.axiosAdapter(config);
// });

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

// 更新模拟登录的请求处理
mock.onPost("/api/login").reply((config) => {
  const { username, password } = JSON.parse(config.data);

  // 模拟用户验证
  if (username === "testuser" && password === "password123") {
    return [
      200,
      {
        token: "mock-jwt-token-12345",
        user: {
          id: 1,
          username: "testuser",
          name: "测试用户",
          role: "student",
        },
      },
    ];
  } else {
    return [401, { message: "登录失败，请检查用户名和密码" }];
  }
});

// 模拟获取用户信息
mock.onGet("/api/user").reply(200, {
  id: 1,
  username: "testuser",
  nickname: "测试用户",
  role: "student",
});

// 模拟更新用户信息
mock.onPut("/api/user").reply((config) => {
  const { nickname, newPassword } = JSON.parse(config.data);
  console.log("更新用户信息:", { nickname, newPassword });

  // 这里可以添加一些验证逻辑
  if (nickname.length < 2) {
    return [400, { message: "昵称长度不能少于2个字符" }];
  }

  if (newPassword && newPassword.length < 6) {
    return [400, { message: "密码长度不能少于6个字符" }];
  }

  return [200, { message: "用户信息更新成功" }];
});

// 修改 /api/my-exams 的模拟数据
mock.onGet("/api/my-exams").reply((config) => {
  const {
    page = 1,
    pageSize = 10,
    examUuids, // 使用 examUuids 替代 examUuid
    status,
    minScore,
    maxScore,
  } = config.params;

  // 生成更多的模拟数据
  const mockMyExams = Array(100)
    .fill()
    .map((_, index) => ({
      id: `exam-${index + 1}`,
      uuid: `uuid-exam-${index + 1}`, // 添加 uuid 字段
      name: `${2024 - Math.floor(index / 4)}年${
        ["物理", "化学", "生物", "数学"][index % 4]
      }${["期中", "期末"][index % 2]}考试`,
      status: index % 3 === 0 ? "未参加" : "已完成",
      score: index % 3 === 0 ? null : Math.floor(Math.random() * 41) + 60, // 60-100的随机分数
      examTime:
        index % 3 === 0
          ? null
          : new Date(Date.now() - Math.random() * 10000000000)
              .toISOString()
              .split("T")[0],
    }));

  // 应用过滤器
  let filteredExams = mockMyExams;
  if (examUuids && examUuids.length > 0) {
    filteredExams = filteredExams.filter((exam) =>
      examUuids.includes(exam.uuid)
    );
  }
  if (status) {
    filteredExams = filteredExams.filter((exam) => exam.status === status);
  }
  if (minScore !== undefined && minScore !== "") {
    filteredExams = filteredExams.filter(
      (exam) => exam.score && exam.score >= parseInt(minScore)
    );
  }
  if (maxScore !== undefined && maxScore !== "") {
    filteredExams = filteredExams.filter(
      (exam) => exam.score && exam.score <= parseInt(maxScore)
    );
  }

  // 应用分页
  const totalCount = filteredExams.length;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + parseInt(pageSize);
  const paginatedExams = filteredExams.slice(startIndex, endIndex);

  return [200, { exams: paginatedExams, totalCount }];
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

// 修改为新的 URL 路径
mock.onGet(/\/api\/error-questions-detail\/[a-zA-Z0-9-]+$/).reply((config) => {
  const uuid = config.url.split("/").pop();

  // 模拟错题详情数据
  const mockQuestionDetails = {
    uuid: uuid,
    examName: "2024年物理期中考试",
    content:
      "一个质量为2kg的物体在光滑水平面上受到5N的水平力作用。计算10秒后物体的速度。",
    correctAnswer:
      "解答步骤：\n1. 根据牛顿第二定律，F = ma\n2. a = F/m = 5N / 2kg = 2.5 m/s²\n3. 由于初速度为0，使用v = at\n4. v = 2.5 m/s² * 10s = 25 m/s\n所以，10秒后物体的速度为25 m/s。",
    userAnswer: "20 m/s",
    explanation:
      "这道题目考察了牛顿第二定律的应用。关键是要正确计算加速度，然后使用匀加速直线运动的公式计算最终速度。你的答案没有考虑到加速度的计算，直接使用了错误的速度值。",
    errorCount: 2,
    category: "physics",
    knowledgePoint: "牛顿运动定律",
    difficulty: "中等",
  };

  return [200, mockQuestionDetails];
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
          ? [
              { uuid: "uuid-1234-abcd-5678", name: "2010年春季物理竞赛" },
              { uuid: "uuid-4567-defg-8901", name: "2022年高考真题" },
            ]
          : [{ uuid: "uuid-3456-cdef-7890", name: "高中物理教材" }],
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

// 添加创建考试的模拟数据
mock.onPost("/api/exam/create").reply((config) => {
  const newExam = JSON.parse(config.data);

  // 生成一个新的UUID
  const newUuid = `exam-${Date.now()}`;

  // 创建模拟的新考试数据
  const createdExam = {
    ...newExam,
    uuid: newUuid,
    createdAt: new Date().toISOString(),
    sections: [],
    status: "未开始",
    totalScore: 0,
  };

  console.log("创建的新考试:", createdExam);

  // 返回创建成功的响应，包含新创建的考试UUID
  return [
    201,
    {
      uuid: newUuid,
      message: "考试创建成功",
    },
  ];
});

// 更新模拟考试数据
mock.onGet("/api/exams/list").reply((config) => {
  const { page = 1, pageSize = 10, examUuids = [], category } = config.params;

  const mockExams = Array(100)
    .fill()
    .map((_, index) => ({
      uuid: `uuid-exam-${index + 1}`,
      name: `${2024 - Math.floor(index / 20)}年${
        ["物理", "化学", "生物", "数学", "英语"][index % 5]
      }${["期中", "期末"][index % 2]}考试`,
      category: ["physics", "chemistry", "biology", "math", "english"][
        index % 5
      ],
      createdAt: new Date(Date.now() - Math.random() * 10000000000)
        .toISOString()
        .split("T")[0],
    }));

  let filteredExams = [...mockExams];

  if (examUuids.length > 0) {
    filteredExams = filteredExams.filter((exam) =>
      examUuids.includes(exam.uuid)
    );
  }

  if (category) {
    filteredExams = filteredExams.filter((exam) => exam.category === category);
  }

  const totalCount = filteredExams.length;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + parseInt(pageSize);
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
mock.onGet(/\/api\/exams\/[^/]+$/).reply((config) => {
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
        uuid: "section-1",
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
        uuid: "section-2",
        name: "填空题",
        order_in_exam: 2,
        questions: [
          {
            uuid: "question-3",
            digest: "这是一道填空题，考察能量转换。",
            content: "物体从高处自由落下，重力势能转化为 ______ 能。",
            answer: "动能",
            score: 10,
            order_in_section: 1,
            kn: "mechanics",
          },
        ],
      },
      {
        uuid: "section-3",
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

// 在文件的适当位置添加以下代码

mock.onGet("/api/error-questions").reply((config) => {
  const {
    examUuids = [],
    errorCountFilter,
    page = 1,
    pageSize = 10,
  } = config.params;

  const mockErrorQuestions = Array(100)
    .fill()
    .map((_, index) => ({
      uuid: `error-question-${index + 1}`,
      examUuid: `uuid-exam-${Math.floor(index / 20) + 1}`,
      examName: `${2024 - Math.floor(index / 20)}年${
        ["物理", "化学", "生物", "数学", "英语"][index % 5]
      }${["期中", "期末"][index % 2]}考试`,
      digest: `错题摘要 ${index + 1}`,
      errorCount: Math.floor(Math.random() * 3) + 1,
    }));

  let filteredQuestions = [...mockErrorQuestions];

  if (examUuids.length > 0) {
    filteredQuestions = filteredQuestions.filter((q) =>
      examUuids.includes(q.examUuid)
    );
  }

  if (errorCountFilter) {
    const count = parseInt(errorCountFilter);
    if (count === 3) {
      filteredQuestions = filteredQuestions.filter((q) => q.errorCount >= 3);
    } else {
      filteredQuestions = filteredQuestions.filter(
        (q) => q.errorCount === count
      );
    }
  }

  const totalCount = filteredQuestions.length;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + parseInt(pageSize);
  const paginatedQuestions = filteredQuestions.slice(startIndex, endIndex);

  return [
    200,
    {
      items: paginatedQuestions,
      totalCount: totalCount,
    },
  ];
});

// 添加以下代码来模拟获取单个错题详情的 API
mock.onGet(/\/api\/error-questions\/[a-zA-Z0-9-]+$/).reply((config) => {
  const uuid = config.url.split("/").pop();

  // 模拟错题详情数据
  const mockQuestionDetails = {
    uuid: uuid,
    examName: "2024年物理期中考试",
    content:
      "一个质量为2kg的物体在光滑水平面上受到5N的水平力作用。计算10秒后物体的速度。",
    correctAnswer:
      "解答步骤：\n1. 根据牛顿第二定律，F = ma\n2. a = F/m = 5N / 2kg = 2.5 m/s²\n3. 由于初速度为0，使用v = at\n4. v = 2.5 m/s² * 10s = 25 m/s\n所以，10秒后物体的速度为25 m/s。",
    userAnswer: "20 m/s",
    explanation:
      "这道题目考察了牛顿第二定律的应用。关键是要正确计算加速度，然后使用匀加速直线运动的公式计算最终速度。你的答案没有考虑到加速度的计算，直接使用了错误的速度值。",
    errorCount: 2,
    category: "physics",
    knowledgePoint: "牛顿运动定律",
    difficulty: "中等",
  };

  return [200, mockQuestionDetails];
});

// 添加新的错题练习 mock
mock.onGet("/api/error-questions-practice").reply((config) => {
  const { uuids } = config.params;
  const mockErrorQuestions = [
    {
      uuid: "error-question-1",
      content:
        "一个质量为2kg的物体在光滑水平面上受到5N的水平力作用。计算10秒后物体的速度。",
      options: ["15 m/s", "20 m/s", "25 m/s", "30 m/s"],
      correctAnswer: "25 m/s",
      explanation:
        "使用牛顿第二定律和匀加速运动公式可以解决这个问题。F = ma，a = F/m = 5N / 2kg = 2.5 m/s²。v = at，v = 2.5 m/s² * 10s = 25 m/s。",
      category: "physics",
      knowledgePoint: "牛顿运动定律",
      difficulty: "中等",
    },
    {
      uuid: "error-question-2",
      content: "下列哪种物质能导电？",
      options: ["蔗糖溶液", "酒精", "氯化钠溶液", "纯水"],
      correctAnswer: "氯化钠溶液",
      explanation: "氯化钠溶液中含有自由移动的离子，因此能够导电。",
      category: "chemistry",
      knowledgePoint: "电解质",
      difficulty: "简单",
    },
    // 可以继续添加更多模拟错题...
  ];

  const requestedQuestions = mockErrorQuestions.filter((q) =>
    uuids.includes(q.uuid)
  );
  return [200, requestedQuestions];
});

// 添加新的 mock 数据
mock.onPost("/api/error-questions-practice/submit").reply((config) => {
  const { answers } = JSON.parse(config.data);

  // 模拟的结果数据
  const mockResults = {
    score: 3,
    totalScore: 5,
    questions: [
      {
        uuid: "error-question-1",
        userAnswer: answers["error-question-1"],
        correctAnswer: "25 m/s",
        explanation:
          "使用牛顿第二定律和匀加速运动公式可以解决这个问题。F = ma，a = F/m = 5N / 2kg = 2.5 m/s²。v = at，v = 2.5 m/s² * 10s = 25 m/s。",
      },
      {
        uuid: "error-question-2",
        userAnswer: answers["error-question-2"],
        correctAnswer: "氯化钠溶液",
        explanation: "氯化钠溶液中含有自由移动的离子，因此能够导电。",
      },
      // ... 可以根据需要添加更多问题的结果
    ],
  };

  return [200, mockResults];
});

// 添加模拟考试名称搜索的 API
mock.onGet("/api/exam-names").reply((config) => {
  const { query = "" } = config.params;

  const allExamNames = [
    { uuid: "uuid-1234-abcd-5678", name: "2010年春季物理竞赛" },
    { uuid: "uuid-2345-bcde-6789", name: "2011年秋季数学竞赛" },
    { uuid: "uuid-3456-cdef-7890", name: "高中理教材" },
    { uuid: "uuid-4567-defg-8901", name: "2022年高考真题" },
    { uuid: "uuid-5678-efgh-9012", name: "初中数学竞赛题集" },
    { uuid: "uuid-6789-fghi-0123", name: "高中化学实验指南" },
    { uuid: "uuid-exam-1", name: "2024年物理期中考试" },
    { uuid: "uuid-exam-2", name: "2023年物理期末考试" },
    { uuid: "uuid-exam-3", name: "2024年数学模拟考试" },
    { uuid: "uuid-exam-4", name: "2023年化学期中考试" },
    { uuid: "uuid-exam-5", name: "2024年综合科学测试" },
    { uuid: "uuid-exam-6", name: "2023年生物学期末考试" },
    { uuid: "uuid-exam-7", name: "2024年英语听力考试" },
    { uuid: "uuid-exam-8", name: "2023年地理知识竞赛" },
    { uuid: "uuid-exam-9", name: "2024年信息技术能力测试" },
    { uuid: "uuid-exam-10", name: "2023年历史学科能力评估" },
  ];

  let filteredExamNames = allExamNames;
  if (query) {
    filteredExamNames = allExamNames.filter((exam) =>
      exam.name.toLowerCase().includes(query.toLowerCase())
    );
  } else {
    // 如果没有查询参数，返回前20个考试名称作为默认选项
    filteredExamNames = allExamNames.slice(0, 20);
  }

  return [200, filteredExamNames];
});

// 模拟考试提交列表
mock.onGet("/api/exam-submissions").reply((config) => {
  const {
    examUuid,
    page = 1,
    pageSize = 10,
    studentName,
    class: classFilter,
    status, // 添加状态过滤
  } = config.params;

  const mockSubmissions = [
    {
      uuid: "submission-1",
      examUuid: "exam-1",
      examName: "2024年物理期中考试",
      studentName: "张三",
      studentClass: "高二(1)班",
      score: 85,
      submissionTime: "2024-03-15 14:30:00",
      isGraded: true,
    },
    {
      uuid: "submission-2",
      examUuid: "exam-2",
      examName: "2024年化学模拟考试",
      studentName: "李四",
      studentClass: "高二(2)班",
      score: null,
      submissionTime: "2024-03-16 10:15:00",
      isGraded: false,
    },
    {
      uuid: "submission-3",
      examUuid: "exam-1",
      examName: "2024年物理期中考试",
      studentName: "王五",
      studentClass: "高二(3)班",
      score: 92,
      submissionTime: "2024-03-15 15:00:00",
      isGraded: true,
    },
    {
      uuid: "submission-4",
      examUuid: "exam-3",
      examName: "2024年数学期末考试",
      studentName: "赵六",
      studentClass: "高二(1)班",
      score: 78,
      submissionTime: "2024-03-17 09:45:00",
      isGraded: true,
    },
    {
      uuid: "submission-5",
      examUuid: "exam-2",
      examName: "2024年化学模拟考试",
      studentName: "钱七",
      studentClass: "高二(2)班",
      score: null,
      submissionTime: "2024-03-16 11:30:00",
      isGraded: false,
    },
    {
      uuid: "submission-6",
      examUuid: "exam-3",
      examName: "2024年数学期末考试",
      studentName: "孙八",
      studentClass: "高二(3)班",
      score: 88,
      submissionTime: "2024-03-17 10:20:00",
      isGraded: true,
    },
    {
      uuid: "submission-7",
      examUuid: "exam-1",
      examName: "2024年物理期中考试",
      studentName: "周九",
      studentClass: "高二(1)班",
      score: 76,
      submissionTime: "2024-03-15 16:15:00",
      isGraded: true,
    },
    {
      uuid: "submission-8",
      examUuid: "exam-4",
      examName: "2024年英语口语测试",
      studentName: "吴十",
      studentClass: "高二(2)班",
      score: null,
      submissionTime: "2024-03-18 14:00:00",
      isGraded: false,
    },
  ];

  let filteredSubmissions = mockSubmissions;
  if (examUuid) {
    filteredSubmissions = filteredSubmissions.filter(
      (s) => s.examUuid === examUuid
    );
  }
  if (studentName) {
    filteredSubmissions = filteredSubmissions.filter((s) =>
      s.studentName.toLowerCase().includes(studentName.toLowerCase())
    );
  }
  if (classFilter) {
    filteredSubmissions = filteredSubmissions.filter((s) =>
      s.studentClass.toLowerCase().includes(classFilter.toLowerCase())
    );
  }
  if (status) {
    filteredSubmissions = filteredSubmissions.filter((s) =>
      status === "graded" ? s.isGraded : !s.isGraded
    );
  }

  const totalCount = filteredSubmissions.length;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedSubmissions = filteredSubmissions.slice(startIndex, endIndex);

  return [
    200,
    {
      submissions: paginatedSubmissions,
      totalCount: totalCount,
    },
  ];
});

// 模拟获取单个考试答案的请求
mock.onGet(/\/api\/exams\/[^/]+\/answers$/).reply((config) => {
  const uuid = config.url.split("/")[3];

  const mockAnswers = {
    examUuid: uuid,
    answers: {
      "question-1": {
        "question_detail-1": ["C", "D"],
        "question_detail-2": ["A", "B"],
      },
      "question-2": {
        "question_detail-3": ["B"],
      },
      "question-3": {
        "question_detail-4": ["动能"],
      },
      "question-4": {
        "question_detail-5": ["25 m/s"],
      },
      "question-5": {
        "question_detail-6": ["C"],
      },
      "question-6": {
        "question_detail-7": ["A"],
      },
      "question-7": {
        "question_detail-8": ["D"],
      },
      "question-8": {
        "question_detail-9": ["B"],
      },
      "question-9": {
        "question_detail-10": ["C"],
      },
      "question-10": {
        "question_detail-11": ["折射率"],
      },
      "question-11": {
        "question_detail-12": ["20 m/s"],
      },
      "question-12": {
        "question_detail-13": ["75 m"],
      },
      "question-13": {
        "question_detail-14": [
          "14 m/s",
          "这里可以是计算过程或额外解释",
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==", // 这是一个1x1像素的透明PNG图片的base64编码，您应该替换为实际的图片数据
        ],
      },
    },
    submissionTime: "2024-03-15T10:30:00Z",
  };

  return [200, mockAnswers];
});

// 模拟获取单个考试成绩的请求
mock.onGet(/\/api\/my-exams\/[^/]+\/grades$/).reply((config) => {
  const uuid = config.url.split("/")[3];

  const mockGrades = {
    examUuid: uuid,
    totalScore: 85,
    maxScore: 100,
    grades: {
      "question-1": {
        "question_detail-1": 5,
        "question_detail-2": 5,
      },
      "question-2": {
        "question_detail-3": 1,
      },
      "question-3": {
        "question_detail-4": 8,
      },
      "question-4": {
        "question_detail-5": 7,
      },
      "question-5": {
        "question_detail-6": 10,
      },
      "question-6": {
        "question_detail-7": 9,
      },
      "question-7": {
        "question_detail-8": 6,
      },
      "question-8": {
        "question_detail-9": 5,
      },
      "question-9": {
        "question_detail-10": 8,
      },
      "question-10": {
        "question_detail-11": 4,
      },
      "question-11": {
        "question_detail-12": 3,
      },
      "question-12": {
        "question_detail-13": 5,
      },
    },
    submissionTime: "2024-03-15T10:30:00Z",
    gradingTime: "2024-03-16T14:45:00Z",
    grader: "Teacher Smith",
    comments: "良好的表现，但在某些概念上还需要加强理解。",
  };

  return [200, mockGrades];
});

// 模拟提交考试成绩的请求
mock.onPost(/\/api\/my-exams\/[^/]+\/grades$/).reply((config) => {
  const uuid = config.url.split("/")[3];
  const submittedGrades = JSON.parse(config.data);

  console.log(`提交考试 ${uuid} 的成绩:`, submittedGrades);

  return [200, { message: "成绩提交成功" }];
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
                  "法拉第电��感应定律表明，感应电动势的大小与穿过闭合回路的磁通量变化率的大小成正比。",
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
          // ���留原有的计算题（2个questionDetails）
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
                  value: "若忽略摩擦，计算物体到达斜面底端的速度。",
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
mock.onPost(/\/api\/my-exams\/.*\/submit/).reply((config) => {
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
mock.onPost(/\/api\/my-exams\/.*\/save/).reply((config) => {
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

// 添加新的模拟数据用于答题纸打印
mock.onGet(/\/api\/exam-print\/.*/).reply((config) => {
  const uuid = config.url.split("/").pop();

  const mockExamPrint = {
    uuid: uuid,
    name: "2024年物理期中考试",
    subject: "物理",
    sections: [
      {
        uuid: "section-1",
        name: "选择题",
        type: "choice",
        pointsPerQuestion: 5,
        totalPoints: 40,
        questionCount: 8,
      },
      {
        uuid: "section-2",
        name: "填空题",
        type: "fillBlank",
        pointsPerQuestion: 3,
        totalPoints: 24,
        questionCount: 8,
      },
      {
        uuid: "section-3",
        name: "计算题",
        type: "shortAnswer",
        pointsPerQuestion: 12,
        totalPoints: 36,
        questionCount: 3,
      },
    ],
  };

  return [200, mockExamPrint];
});
