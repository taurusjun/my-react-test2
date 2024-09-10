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
    material: "以下是一系列关于力和运动的问题，请仔细读回答。",
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
          "力是物体运动状态改变的原因，且力的作用是相互的，这是牛���运动律的基本内容。",
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
          "物体以恒定速度运动时，其到的合力为零，但这并不意味着物体不受力，可能是各个力相互抵消。",
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
  {
    digest: "电学基础知识综合题",
    material:
      "以下是一系列关于电学基础知识的问题，包括不同类型的题目请仔细阅读并回答。",
    questionDetails: [
      {
        questionContent: {
          value: "1. 下列关于电流的说法，正确的是：",
          image: null,
        },
        rows: [
          { value: "电流的方向是从负极到正极", isAns: false, image: null },
          { value: "电流的单位是伏特（V）", isAns: false, image: null },
          { value: "电流是有方向的电荷流动", isAns: true, image: null },
          { value: "导体中的所有电子都参与电流", isAns: false, image: null },
        ],
        explanation:
          "电流是有方向的电荷流动，其方向规定为从正��到负极，单位是安培（A）。",
        answer: ["C"],
        uiType: "single_selection",
      },
      {
        questionContent: {
          value: "2. 关于欧姆定律，以下说法正确的有：",
          image: null,
        },
        rows: [
          { value: "电压与电流成正比", isAns: true, image: null },
          { value: "电阻与电流成反比", isAns: true, image: null },
          { value: "电阻与电压成正比", isAns: false, image: null },
          { value: "适用于所有导体", isAns: false, image: null },
        ],
        explanation:
          "欧姆定律指出，在恒温条件下，体两端的电压与通过的电流成正比，电阻与电流成反比。但它并不适用于所有导体。",
        answer: ["A", "B"],
        uiType: "multi_selection",
      },
      {
        questionContent: {
          value: "3. 在电路中，电阻的作用是 ________ 电流。",
          image: null,
        },
        rows: [{ value: "限制", isAns: true, image: null }],
        explanation: "电阻在电路中的主要作用是限制电流，控制电流的大小。",
        answer: ["限制"],
        uiType: "fill_in_blank",
      },
      {
        questionContent: {
          value:
            "4. 一个�����为5Ω的导体，当两端电压为10V时，过它的电流是多少？",
          image: null,
        },
        rows: [{ value: "2A", isAns: true, image: null }],
        explanation:
          "根据欧姆定律，I = U / R，其中I是电流，U是电压，R是电阻。代入数值：I = 10V / 5Ω = 2A",
        answer: ["2A"],
        uiType: "calculation",
      },
    ],
  },
  {
    digest: "化学反应与能量变化综合题",
    material:
      "以下是关于化学反应与能量变化的一系列问题，包括不同类型的题目。请仔细思考后回答。",
    questionDetails: [
      {
        questionContent: {
          value: "1. 下列反应中，属于吸热反应的是：",
          image: null,
        },
        rows: [
          { value: "铁与硫粉反应", isAns: false, image: null },
          { value: "碳酸钙分解", isAns: true, image: null },
          { value: "镁带燃烧", isAns: false, image: null },
          { value: "铝与氧气反应", isAns: false, image: null },
        ],
        explanation:
          "碳酸钙分解是一个吸热反应，需要持续加热才能进行。其他选项都是放热反应。",
        answer: ["B"],
        uiType: "single_selection",
      },
      {
        questionContent: {
          value: "2. 关于化学反应的能量变化，以下说法正确的有：",
          image: null,
        },
        rows: [
          { value: "所有化学反应都伴随能量变化", isAns: true, image: null },
          {
            value: "放热反应的生成物总能量低于反应物",
            isAns: true,
            image: null,
          },
          { value: "吸热反应一定不会自发进行", isAns: false, image: null },
          { value: "催化剂可以改变反应的热效应", isAns: false, image: null },
        ],
        explanation:
          "所有化学反应都伴随能量变化，放热应的成物总能量确实低于反应物。但吸热反应在某些条件下也可能自发进行，而催化剂不会改变反应的热效应。",
        answer: ["A", "B"],
        uiType: "multi_selection",
      },
      {
        questionContent: {
          value: "3. 在化学反应方程式中，表示放热反应的符号是 ________。",
          image: null,
        },
        rows: [{ value: "-Q", isAns: true, image: null }],
        explanation: "在化学反应方程式中，-Q表示放热反应，+Q表示吸热反应。",
        answer: ["-Q"],
        uiType: "fill_in_blank",
      },
      {
        questionContent: {
          value:
            "4. 某反应的反应热为-285.8 kJ/mol，反应物的总能量为500 kJ/mol，求生成物的总能量。",
          image: null,
        },
        rows: [{ value: "214.2 kJ/mol", isAns: true, image: null }],
        explanation:
          "根据能量守恒定律，生成物的总能量 = 反应物的总能量 + 反应热。代入数值：500 kJ/mol + (-285.8 kJ/mol) = 214.2 kJ/mol",
        answer: ["214.2 kJ/mol"],
        uiType: "calculation",
      },
    ],
  },
];

export const setupLearningMocks = (mock) => {
  const allMaterials = generateMockMaterials(100);

  // 准备多个 section 的模拟数据
  const mockSections = [
    {
      uuid: generateUUID("section"),
      name: "第一章：力学基础",
      order_in_exam: 1,
      questions: [
        {
          uuid: generateUUID("question"),
          order_in_section: 1,
          ...questions[0], // 力和运动的多步骤问题
        },
        {
          uuid: generateUUID("question"),
          order_in_section: 2,
          ...questions[1], // 能量转换与守恒多步骤问题
        },
      ],
    },
    {
      uuid: generateUUID("section"),
      name: "第二章：电学基础",
      order_in_exam: 2,
      questions: [
        {
          uuid: generateUUID("question"),
          order_in_section: 1,
          ...questions[2], // 电学基础知识综合题
        },
      ],
    },
    {
      uuid: generateUUID("section"),
      name: "第三章：化学反应",
      order_in_exam: 3,
      questions: [
        {
          uuid: generateUUID("question"),
          order_in_section: 1,
          ...questions[3], // 化学反应与能量变化综合题
        },
      ],
    },
  ];

  // 获取学习资料结构
  mock.onGet(/\/api\/learning-material\/[\w-]+\/structure/).reply((config) => {
    const uuid = config.url.split("/")[3];
    let material = allMaterials.find((m) => m.uuid === uuid);

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
        sections: mockSections.map(
          ({ uuid, name, order_in_exam, questions }) => ({
            uuid,
            name,
            order_in_exam,
            questionCount: questions.length,
            questions: questions.map((q) => ({
              questionDetailCount: q.questionDetails.length,
              uuid: q.uuid,
              order_in_section: q.order_in_section,
            })),
          })
        ),
      },
    ];
  });

  // 获取单个问题
  mock
    .onGet(
      /\/api\/learning-material\/[\w-]+\/section\/[\w-]+\/question\/[\w-]+\/detail\/\d+/
    )
    .reply((config) => {
      const [, , , materialUuid, , sectionUuid, , questionUuid, , detailIndex] =
        config.url.split("/");

      const section = mockSections.find((s) => s.uuid === sectionUuid);
      const question = section.questions.find((q) => q.uuid === questionUuid);
      const questionDetail =
        question.questionDetails[parseInt(detailIndex) - 1];

      // 模拟从缓存中获取答案和状态
      const cachedAnswer = ["A", "B"]; // 这里应该是从某个缓存中获取的数据
      const cachedStatus = "completed"; // 这里应该是从某个缓存中获取的数据

      return [
        200,
        {
          uuid: questionUuid,
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
          order_in_section: question.order_in_section,
          ...question,
          currentDetail: {
            ...questionDetail,
            uuid: generateUUID("question-detail"),
            order_in_question: parseInt(detailIndex),
            rate: 3,
            uiType: questionDetail.uiType,
            answerImage: null,
          },
          cachedAnswer: cachedAnswer,
          cachedStatus: cachedStatus,
        },
      ];
    });

  // 提交答案
  // mock
  //   .onPost(
  //     /\/api\/learning-material\/[\w-]+\/section\/[\w-]+\/question\/[\w-]+\/answer/
  //   )
  //   .reply((config) => {
  //     const { answer } = JSON.parse(config.data);
  //     const correctAnswer = ["C", "D"];
  //     const isCorrect =
  //       JSON.stringify(answer.sort()) === JSON.stringify(correctAnswer);

  //     return [
  //       200,
  //       {
  //         correct: isCorrect,
  //         correctAnswer: correctAnswer,
  //         explanation: isCorrect
  //           ? "恭喜你答对了！力是物体运动状态改变的原因，且力的作用是相互的，这是牛顿运动律的基本内容。"
  //           : "很遗憾，你答错了。正确答案是C和D。力是物体运动状态改变的原因，且力的作用是相互的，这是牛顿运动律的基本内容。请仔细阅读题目并重新尝试。",
  //       },
  //     ];
  //   });

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
  // mock.onPost(/\/api\/questions\/[\w-]+\/answer/).reply((config) => {
  //   const questionUuid = config.url.split("/")[3];
  //   const { answer } = JSON.parse(config.data);
  //   const isCorrect = Math.random() > 0.5;

  //   return [
  //     200,
  //     {
  //       correct: isCorrect,
  //       explanation: isCorrect
  //         ? `恭喜你答对了！问题 ${questionUuid} 的正确答案是 ${answer}。`
  //         : `很遗憾，你答错了。问题 ${questionUuid} 的正确答案不是 ${answer}。请仔细阅读题目并重新尝试。`,
  //     },
  //   ];
  // });

  // 新增：模拟保存答案和状态的 API
  mock
    .onPost(
      /\/api\/learning-material\/[\w-]+\/section\/[\w-]+\/question\/[\w-]+\/answer/
    )
    .reply((config) => {
      const { answer, status } = JSON.parse(config.data);
      console.log("保存答案和状态:", { answer, status });

      // 这里可以添加一些逻辑来模拟保存答案和状态
      // 例如，可以将答案和状态存储在一个对象中，以便后续使用

      return [200, { message: "答案和状态已保存" }];
    });

  // 添加到错题集
  mock.onPost(/\/api\/learning-material\/[\w-]+\/mistakes/).reply((config) => {
    const materialUuid = config.url.split("/")[3];
    const { questionUuid, questionDetailUuid } = JSON.parse(config.data);

    console.log("添加到错题集:", {
      materialUuid,
      questionUuid,
      questionDetailUuid,
    });

    // 这里可以添加一些逻辑来模拟将题目添加到错题集
    // 例如，可以将题目信息存储在一个数组中

    return [
      200,
      {
        message: "题目已成功添加到错题集",
        mistakeId: generateUUID("mistake"), // 生成一个唯一的错题ID
      },
    ];
  });
};

export default setupLearningMocks;
