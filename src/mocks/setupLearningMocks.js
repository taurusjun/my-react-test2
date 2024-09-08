import MockAdapter from "axios-mock-adapter";

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
      id: i,
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
  const allMaterials = generateMockMaterials(100); // 生成100个模拟数据

  // 学习资料列表（带分页）
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

  // 学习资料结构
  mock.onGet(/\/api\/learning-materials\/\d+/).reply((config) => {
    const id = parseInt(config.url.split("/").pop());
    const material = allMaterials.find((m) => m.id === id);

    if (!material) {
      return [404, { message: "学习资料不存在" }];
    }

    return [
      200,
      {
        ...material,
        sections: [
          {
            id: 1,
            name: "第一章：基础概念",
            questions: [
              { id: 1, order_in_section: 1 },
              { id: 2, order_in_section: 2 },
              { id: 3, order_in_section: 3 },
            ],
          },
          {
            id: 2,
            name: "第二章：进阶内容",
            questions: [
              { id: 4, order_in_section: 1 },
              { id: 5, order_in_section: 2 },
              { id: 6, order_in_section: 3 },
            ],
          },
        ],
      },
    ];
  });

  // 获取单个题目
  mock.onGet(/\/api\/questions\/\d+/).reply((config) => {
    const id = parseInt(config.url.split("/").pop());
    return [
      200,
      {
        id,
        content: `这是第 ${id} 道题目...`,
        options: ["A. 选项1", "B. 选项2", "C. 选项3", "D. 选项4"],
      },
    ];
  });

  // 提交答案
  mock.onPost(/\/api\/questions\/\d+\/answer/).reply(200, {
    correct: Math.random() > 0.5,
    explanation: "这是题目的解析...",
  });
};

export default setupLearningMocks;
