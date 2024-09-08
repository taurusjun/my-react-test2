import MockAdapter from "axios-mock-adapter";
import { v4 as uuidv4 } from "uuid";

const generateUUID = (prefix) => {
  const randomNum = Math.floor(Math.random() * 10000) % 100;
  return `uuid-${prefix}-${randomNum.toString().padStart(4, "0")}`;
};

const generateMockMaterials = (count) => {
  const materials = [];
  const categories = ["math", "english", "physics", "chemistry", "biology"];
  const schools = ["primary", "junior", "senior"];
  const grades = {
    primary: ["grade1", "grade2", "grade3", "grade4", "grade5", "grade6"],
    junior: ["grade7", "grade8", "grade9"],
    senior: ["grade10", "grade11", "grade12"],
  };
  const statuses = ["未开始", "学习中", "已完成"];

  for (let i = 1; i <= count; i++) {
    const school = schools[Math.floor(Math.random() * schools.length)];
    const grade =
      grades[school][Math.floor(Math.random() * grades[school].length)];
    materials.push({
      uuid: generateUUID("material"),
      name: `学习资料 ${i}`,
      category: categories[Math.floor(Math.random() * categories.length)],
      gradeInfo: {
        school: school,
        grade: grade,
      },
      publishDate: new Date(
        2023,
        Math.floor(Math.random() * 12),
        Math.floor(Math.random() * 28) + 1
      )
        .toISOString()
        .split("T")[0],
      lastStudyDate:
        Math.random() > 0.3
          ? new Date(
              2023,
              Math.floor(Math.random() * 12),
              Math.floor(Math.random() * 28) + 1
            )
              .toISOString()
              .split("T")[0]
          : null,
      status: statuses[Math.floor(Math.random() * statuses.length)],
    });
  }
  return materials;
};

export const setupLearningMocks = (mock) => {
  const allMaterials = generateMockMaterials(100);

  // 获取学习资料结构
  mock.onGet(/\/api\/learning-material\/[\w-]+\/structure/).reply((config) => {
    const uuid = config.url.split("/")[3];
    let material = allMaterials.find((m) => m.uuid === uuid);

    // 如果找不到匹配的材料，创建一个新的
    if (!material) {
      material = {
        uuid: uuid,
        name: `学习资料 ${uuid.substr(0, 8)}`,
        category: "math",
        gradeInfo: {
          school: "primary",
          grade: "grade1",
        },
        publishDate: new Date().toISOString().split("T")[0],
        lastStudyDate: null,
        status: "未开始",
      };
    }

    return [
      200,
      {
        ...material,
        sections: [
          {
            uuid: generateUUID("section"),
            name: "第一章：基础概念",
            order_in_material: 1, // 添加这个字段
            order_in_exam: 1,
            questionCount: 3,
          },
          {
            uuid: generateUUID("section"),
            name: "第二章：进阶内容",
            order_in_material: 2, // 添加这个字段
            order_in_exam: 2,
            questionCount: 3,
          },
        ],
      },
    ];
  });

  // 获取单个问题
  mock
    .onGet(/\/api\/learning-material\/[\w-]+\/section\/[\w-]+\/question\/\d+/)
    .reply((config) => {
      const [, , materialUuid, , sectionUuid, , questionIndex] =
        config.url.split("/");

      // 随机决定是否返回多个子问题
      const hasMultipleSubQuestions = Math.random() > 0.7;

      if (hasMultipleSubQuestions) {
        return [
          200,
          {
            uuid: generateUUID("question"),
            sectionUuid: sectionUuid,
            order_in_section: parseInt(questionIndex),
            material: "这是包含多个子问题的问题背景材料。",
            subQuestions: [
              {
                uuid: generateUUID("subQuestion"),
                order_in_question: 0,
                questionContent: {
                  value: "这是第一个子问题的内容。",
                  image: null,
                },
                score: 3,
                uiType: "single_selection",
                rows: [
                  { value: "选项1" },
                  { value: "选项2" },
                  { value: "选项3" },
                ],
              },
              {
                uuid: generateUUID("subQuestion"),
                order_in_question: 1,
                questionContent: {
                  value: "这是第二个子问题的内容。",
                  image: null,
                },
                score: 2,
                uiType: "fill_in_blank",
              },
            ],
          },
        ];
      } else {
        return [
          200,
          {
            uuid: generateUUID("question"),
            sectionUuid: sectionUuid,
            order_in_section: parseInt(questionIndex), // 这里已经有了，保持不变
            material: "这是问题的背景材料（如果有的话）。",
            questionContent: {
              value: "这是问题的内容。请选择正确的答案。",
              image: null,
            },
            score: 5,
            uiType: "single_selection",
            rows: [
              { value: "选项1" },
              { value: "选项2" },
              { value: "选项3" },
              { value: "选项4" },
            ],
          },
        ];
      }
    });

  // 提交答案
  mock
    .onPost(
      /\/api\/learning-material\/[\w-]+\/section\/[\w-]+\/question\/[\w-]+\/answer/
    )
    .reply((config) => {
      const { answer } = JSON.parse(config.data);
      const isCorrect = Math.random() > 0.5;

      return [
        200,
        {
          correct: isCorrect,
          correctAnswer: isCorrect ? answer : "正确答案",
          explanation: isCorrect
            ? `恭喜你答对了！正确答案是 ${answer}。`
            : `很遗憾，你答错了。正确答案是 "正确答案"。请仔细阅读题目并重新尝试。`,
        },
      ];
    });

  // 获取学习材料列表
  mock.onGet("/api/learning-materials").reply((config) => {
    const {
      name,
      category,
      school,
      grade,
      page = 1,
      pageSize = 10,
    } = config.params;
    let filteredMaterials = [...allMaterials];

    // 根据搜索参数筛选数据
    if (name) {
      filteredMaterials = filteredMaterials.filter((m) =>
        m.name.toLowerCase().includes(name.toLowerCase())
      );
    }
    if (category) {
      filteredMaterials = filteredMaterials.filter(
        (m) => m.category === category
      );
    }
    if (school) {
      filteredMaterials = filteredMaterials.filter(
        (m) => m.gradeInfo.school === school
      );
    }
    if (grade) {
      filteredMaterials = filteredMaterials.filter(
        (m) => m.gradeInfo.grade === grade
      );
    }

    // 计算总数和分页
    const totalCount = filteredMaterials.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedMaterials = filteredMaterials.slice(startIndex, endIndex);

    return [200, { materials: paginatedMaterials, totalCount }];
  });

  // 获取单个题目
  mock.onGet(/\/api\/questions\/[\w-]+/).reply((config) => {
    const uuid = config.url.split("/").pop();
    return [
      200,
      {
        uuid,
        content: `这是题目 ${uuid} 的内容。请选择正确的答案。`,
        options: ["A. 选项1", "B. 选项2", "C. 选项3", "D. 选项4"],
      },
    ];
  });

  // 提交答案
  mock.onPost(/\/api\/questions\/[\w-]+\/answer/).reply((config) => {
    const questionUuid = config.url.split("/")[3];
    const { answer } = JSON.parse(config.data);
    const isCorrect = Math.random() > 0.5;

    return [
      200,
      {
        correct: isCorrect,
        explanation: isCorrect
          ? `恭喜你答对了！问题 ${questionUuid} 的正确答案是 ${answer}。`
          : `很遗憾，你答错了。问题 ${questionUuid} 的正确答案不是 ${answer}。请仔细阅读题目并重新尝试。`,
      },
    ];
  });
};

export default setupLearningMocks;
