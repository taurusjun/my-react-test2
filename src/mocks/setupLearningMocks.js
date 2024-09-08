import MockAdapter from "axios-mock-adapter";
import { v4 as uuidv4 } from "uuid";

const generateUUID = (prefix) => {
  return `uuid-${prefix}-${uuidv4().substr(0, 8)}`;
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
        category: "physics",
        gradeInfo: {
          school: "primary",
          grade: "grade5",
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
            order_in_material: 1,
            questionCount: 3,
          },
          {
            uuid: generateUUID("section"),
            name: "第二章：进阶内容",
            order_in_material: 2,
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

      return [
        200,
        {
          uuid: generateUUID("question"),
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
          sectionUuid: sectionUuid,
          order_in_section: parseInt(questionIndex),
          questionDetails: [
            {
              uuid: generateUUID("question-detail"),
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
              rate: 3,
              explanation:
                "力是物体运动状态改变的原因，且力的作用是相互的，这是牛顿运动律的基本内容。",
              uiType: "multi_selection",
              answer: ["C", "D"],
              answerImage: null,
            },
          ],
        },
      ];
    });

  // 提交答案
  mock
    .onPost(
      /\/api\/learning-material\/[\w-]+\/section\/[\w-]+\/question\/[\w-]+\/answer/
    )
    .reply((config) => {
      const { answer } = JSON.parse(config.data);
      const correctAnswer = ["C", "D"];
      const isCorrect =
        JSON.stringify(answer.sort()) === JSON.stringify(correctAnswer);

      return [
        200,
        {
          correct: isCorrect,
          correctAnswer: correctAnswer,
          explanation: isCorrect
            ? "恭喜你答对了！力是物体运动状态改变的原因，且力的作用是相互的，这是牛顿运动律的基本内容。"
            : "很遗憾，你答错了。正确答案是C和D。力是物体运动状态改变的原因，且力的作用是相互的，这是牛顿运动律的基本内容。请仔细阅读题目并重新尝试。",
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
