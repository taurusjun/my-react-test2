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

const questions = [
  {
    digest: "关于力和运动的多步骤问题",
    material: "以下是一系列关于力和运动的问题，请仔细阅读并回答。",
    questionDetails: [
      {
        questionContent: {
          value: "1. 下列关于力和运动的说法，正确的是：",
          image: null,
        },
        rows: [
          { value: "物体运动一定有力", isAns: false, image: null },
          { value: "物体受力一定运动", isAns: false, image: null },
          { value: "力是物体运动状态改变的原因", isAns: true, image: null },
          { value: "力的作用是相互的", isAns: true, image: null },
        ],
        explanation:
          "力是物体运动状态改变的原因，且力的作用是相互的，这是牛顿运动律的基本内容。",
        answer: ["C", "D"],
      },
      {
        questionContent: {
          value: "2. 一个物体在光滑平面上以恒定速度运动，下列说法正确的是：",
          image: null,
        },
        rows: [
          { value: "物体受到的合力为零", isAns: true, image: null },
          { value: "物体一定不受力", isAns: false, image: null },
          { value: "物体受到的摩擦力等于推力", isAns: false, image: null },
          { value: "物体的加速度不为零", isAns: false, image: null },
        ],
        explanation:
          "物体以恒定速度运动时，其受到的合力为零，但这并不意味着物体不受力，可能是各个力相互抵消。",
        answer: ["A"],
      },
    ],
  },
  {
    digest: "能量转换与守恒多步骤问题",
    material: "以下是关于能量转换与守恒的一系列问题，请仔细思考后回答。",
    questionDetails: [
      {
        questionContent: {
          value: "1. 以下哪种情况不涉及能量转换？",
          image: null,
        },
        rows: [
          { value: "电灯发光", isAns: false, image: null },
          { value: "汽车行驶", isAns: false, image: null },
          { value: "静止的水", isAns: true, image: null },
          { value: "太阳能电池板工作", isAns: false, image: null },
        ],
        explanation: "静止的水没有发生能量转换，其他选项都涉及能量形式的转换。",
        answer: ["C"],
      },
      {
        questionContent: {
          value: "2. 关于能量守恒定律，以下说法正确的是：",
          image: null,
        },
        rows: [
          { value: "能量可以凭空产生", isAns: false, image: null },
          { value: "能量可以完全消失", isAns: false, image: null },
          {
            value: "能量可以从一种形式转化为另一种形式",
            isAns: true,
            image: null,
          },
          {
            value: "在任何过程中，能量的总量保持不变",
            isAns: true,
            image: null,
          },
        ],
        explanation:
          "能量守恒定律指出，能量不能被创造或销毁，只能从一种形式转换为另一种形式，而在任何过程中，能量的总量保持不变。",
        answer: ["C", "D"],
      },
      {
        questionContent: {
          value: "3. 一个重物从高处自由落下，在落地瞬间：",
          image: null,
        },
        rows: [
          { value: "重物的重力势能完全转化为动能", isAns: true, image: null },
          { value: "重物的动能为零", isAns: false, image: null },
          { value: "重物的重力势能为零", isAns: true, image: null },
          { value: "重物的总能量为零", isAns: false, image: null },
        ],
        explanation:
          "在落地瞬间，重物的重力势能完全转化为动能，此时重力势能为零，但动能达到最大值，总能量保持不变。",
        answer: ["A", "C"],
      },
    ],
  },
];

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
      const [, , , materialUuid, , sectionUuid, , questionIndex] =
        config.url.split("/");
      const randomQuestion =
        questions[Math.floor(Math.random() * questions.length)];

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
          sectionUuid: sectionUuid,
          order_in_section: parseInt(questionIndex),
          ...randomQuestion,
          questionDetails: randomQuestion.questionDetails.map(
            (detail, index) => ({
              ...detail,
              uuid: generateUUID("question-detail"),
              order_in_question: index + 1,
              rate: 3,
              uiType:
                detail.answer.length > 1
                  ? "multi_selection"
                  : "single_selection",
              answerImage: null,
            })
          ),
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
