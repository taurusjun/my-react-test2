// 定义用户角色
export const USER_ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin'
};

// 菜单项配置，包含角色权限
const menuItemConfigs = [
  {
    text: "欢迎",
    link: "/",
    roles: [USER_ROLES.STUDENT, USER_ROLES.TEACHER, USER_ROLES.ADMIN],
    icon: null
  },
  {
    text: "我的考试",
    link: "/my-exams/list",
    roles: [USER_ROLES.STUDENT, USER_ROLES.TEACHER, USER_ROLES.ADMIN],
    icon: null
  },
  {
    text: "我的学习",
    link: "/learning",
    roles: [USER_ROLES.STUDENT, USER_ROLES.TEACHER, USER_ROLES.ADMIN],
    icon: null
  },
  {
    text: "错题集",
    link: "/error-questions",
    roles: [USER_ROLES.STUDENT, USER_ROLES.TEACHER, USER_ROLES.ADMIN],
    icon: null
  },
  {
    text: "考卷中心",
    link: "/exams/list",
    roles: [USER_ROLES.TEACHER, USER_ROLES.ADMIN],
    icon: null
  },
  {
    text: "题库",
    link: "/questions",
    roles: [USER_ROLES.TEACHER, USER_ROLES.ADMIN],
    icon: null
  },
  {
    text: "阅卷中心",
    link: "/grading-center",
    roles: [USER_ROLES.TEACHER, USER_ROLES.ADMIN],
    icon: null
  },
  {
    text: "文件校正",
    link: "/file-correction",
    roles: [USER_ROLES.TEACHER, USER_ROLES.ADMIN],
    icon: null
  },
  {
    text: "用户中心",
    link: "/user-center",
    roles: [USER_ROLES.STUDENT, USER_ROLES.TEACHER, USER_ROLES.ADMIN],
    icon: null
  },
  {
    text: "用户管理",
    link: "/user-management",
    roles: [USER_ROLES.ADMIN],
    icon: null
  },
  {
    text: "系统设置",
    link: "/system-settings",
    roles: [USER_ROLES.ADMIN],
    icon: null
  }
];

// 根据用户角色获取菜单项
export const getMenuItemsByRole = (userRole) => {
  if (!userRole) {
    // 如果没有角色信息，返回学生菜单（默认）
    return menuItemConfigs.filter(item => 
      item.roles.includes(USER_ROLES.STUDENT)
    );
  }
  
  return menuItemConfigs.filter(item => 
    item.roles.includes(userRole)
  );
};

// 获取所有菜单项（用于向后兼容）
export const menuItems = menuItemConfigs.filter(item => 
  item.roles.includes(USER_ROLES.STUDENT)
);

// 检查用户是否有权限访问某个菜单项
export const hasMenuPermission = (userRole, menuText) => {
  const menuItem = menuItemConfigs.find(item => item.text === menuText);
  if (!menuItem) return false;
  return menuItem.roles.includes(userRole);
};

// 检查用户是否有权限访问某个路径
export const hasPathPermission = (userRole, path) => {
  // 首先尝试精确匹配
  const exactMatch = menuItemConfigs.find(item => item.link === path);
  if (exactMatch) {
    return exactMatch.roles.includes(userRole);
  }
  
  // 如果没有精确匹配，尝试路径模式匹配
  const pathPatterns = [
    { pattern: '/exam/view/', roles: [USER_ROLES.TEACHER, USER_ROLES.ADMIN] },
    { pattern: '/exam/edit/', roles: [USER_ROLES.TEACHER, USER_ROLES.ADMIN] },
    { pattern: '/exam/paper/', roles: [USER_ROLES.STUDENT, USER_ROLES.TEACHER, USER_ROLES.ADMIN] },
    { pattern: '/exam/grading/', roles: [USER_ROLES.TEACHER, USER_ROLES.ADMIN] },
    { pattern: '/exam/result/', roles: [USER_ROLES.STUDENT, USER_ROLES.TEACHER, USER_ROLES.ADMIN] },
    { pattern: '/question-edit/', roles: [USER_ROLES.TEACHER, USER_ROLES.ADMIN] },
    { pattern: '/error-questions/view/', roles: [USER_ROLES.STUDENT, USER_ROLES.TEACHER, USER_ROLES.ADMIN] },
    { pattern: '/error-questions/practice/', roles: [USER_ROLES.STUDENT, USER_ROLES.TEACHER, USER_ROLES.ADMIN] },
    { pattern: '/learning/', roles: [USER_ROLES.STUDENT, USER_ROLES.TEACHER, USER_ROLES.ADMIN] },
    { pattern: '/file-correction/', roles: [USER_ROLES.TEACHER, USER_ROLES.ADMIN] },
    { pattern: '/my-exams/', roles: [USER_ROLES.STUDENT, USER_ROLES.TEACHER, USER_ROLES.ADMIN] },
    { pattern: '/exams/', roles: [USER_ROLES.TEACHER, USER_ROLES.ADMIN] },
    { pattern: '/questions', roles: [USER_ROLES.TEACHER, USER_ROLES.ADMIN] },
    { pattern: '/grading-center', roles: [USER_ROLES.TEACHER, USER_ROLES.ADMIN] },
    { pattern: '/user-center', roles: [USER_ROLES.STUDENT, USER_ROLES.TEACHER, USER_ROLES.ADMIN] },
    { pattern: '/user-management', roles: [USER_ROLES.ADMIN] },
    { pattern: '/system-settings', roles: [USER_ROLES.ADMIN] },
    { pattern: '/', roles: [USER_ROLES.STUDENT, USER_ROLES.TEACHER, USER_ROLES.ADMIN] }
  ];
  
  for (const pattern of pathPatterns) {
    if (path.startsWith(pattern.pattern)) {
      return pattern.roles.includes(userRole);
    }
  }
  
  // 如果没有匹配的模式，默认允许访问（向后兼容）
  return true;
};
