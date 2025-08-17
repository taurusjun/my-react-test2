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
  const menuItem = menuItemConfigs.find(item => item.link === path);
  if (!menuItem) return false;
  return menuItem.roles.includes(userRole);
};
