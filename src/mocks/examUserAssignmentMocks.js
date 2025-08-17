// 模拟考试用户关联数据
export const mockExamUserAssignments = [
  {
    uuid: '1',
    examUuid: 'exam-1',
    userUuid: 'user-1',
    examName: '数学期中考试',
    userName: '张三',
    status: 'active',
    assignedAt: '2024-01-15T10:00:00Z'
  },
  {
    uuid: '2',
    examUuid: 'exam-1',
    userUuid: 'user-2',
    examName: '数学期中考试',
    userName: '李四',
    status: 'pending',
    assignedAt: '2024-01-15T11:00:00Z'
  },
  {
    uuid: '3',
    examUuid: 'exam-2',
    userUuid: 'user-1',
    examName: '英语期末考试',
    userName: '张三',
    status: 'active',
    assignedAt: '2024-01-16T09:00:00Z'
  },
  {
    uuid: '4',
    examUuid: 'exam-3',
    userUuid: 'user-3',
    examName: '物理单元测试',
    userName: '王五',
    status: 'expired',
    assignedAt: '2024-01-10T14:00:00Z'
  }
];

// 模拟考试数据
export const mockExams = [
  {
    uuid: 'exam-1',
    name: '数学期中考试',
    category: '数学',
    gradeInfo: { school: '初中', grade: '七年级' }
  },
  {
    uuid: 'exam-2',
    name: '英语期末考试',
    category: '英语',
    gradeInfo: { school: '初中', grade: '七年级' }
  },
  {
    uuid: 'exam-3',
    name: '物理单元测试',
    category: '物理',
    gradeInfo: { school: '初中', grade: '八年级' }
  },
  {
    uuid: 'exam-4',
    name: '化学期中考试',
    category: '化学',
    gradeInfo: { school: '初中', grade: '九年级' }
  }
];

// 模拟用户数据
export const mockUsers = [
  {
    uuid: 'user-1',
    name: '张三',
    username: 'zhangsan',
    role: 'student'
  },
  {
    uuid: 'user-2',
    name: '李四',
    username: 'lisi',
    role: 'student'
  },
  {
    uuid: 'user-3',
    name: '王五',
    username: 'wangwu',
    role: 'student'
  },
  {
    uuid: 'user-4',
    name: '赵六',
    username: 'zhaoliu',
    role: 'teacher'
  },
  {
    uuid: 'user-5',
    name: '钱七',
    username: 'qianqi',
    role: 'student'
  }
];

// 模拟API响应
export const createMockResponse = (data, success = true) => ({
  data: {
    success,
    data,
    message: success ? '操作成功' : '操作失败'
  }
});

// 模拟API延迟
export const mockApiDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));
