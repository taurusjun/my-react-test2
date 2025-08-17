import { USER_ROLES } from '../config/menuItems';

/**
 * 检查用户是否有指定角色
 * @param {string} userRole - 用户角色
 * @param {string|Array} requiredRole - 需要的角色或角色数组
 * @returns {boolean} 是否有权限
 */
export const hasRole = (userRole, requiredRole) => {
  if (!userRole) return false;
  
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(userRole);
  }
  
  return userRole === requiredRole;
};

/**
 * 检查用户是否为管理员
 * @param {string} userRole - 用户角色
 * @returns {boolean} 是否为管理员
 */
export const isAdmin = (userRole) => {
  return hasRole(userRole, USER_ROLES.ADMIN);
};

/**
 * 检查用户是否为教师
 * @param {string} userRole - 用户角色
 * @returns {boolean} 是否为教师
 */
export const isTeacher = (userRole) => {
  return hasRole(userRole, [USER_ROLES.TEACHER, USER_ROLES.ADMIN]);
};

/**
 * 检查用户是否为学生
 * @param {string} userRole - 用户角色
 * @returns {boolean} 是否为学生
 */
export const isStudent = (userRole) => {
  return hasRole(userRole, USER_ROLES.STUDENT);
};

/**
 * 获取角色显示名称
 * @param {string} role - 角色代码
 * @returns {string} 角色显示名称
 */
export const getRoleDisplayName = (role) => {
  switch (role) {
    case USER_ROLES.ADMIN:
      return '管理员';
    case USER_ROLES.TEACHER:
      return '教师';
    case USER_ROLES.STUDENT:
      return '学生';
    default:
      return '未知';
  }
};

/**
 * 获取角色优先级（数字越大权限越高）
 * @param {string} role - 角色代码
 * @returns {number} 角色优先级
 */
export const getRolePriority = (role) => {
  switch (role) {
    case USER_ROLES.ADMIN:
      return 3;
    case USER_ROLES.TEACHER:
      return 2;
    case USER_ROLES.STUDENT:
      return 1;
    default:
      return 0;
  }
};

/**
 * 检查用户是否有足够权限
 * @param {string} userRole - 用户角色
 * @param {string} requiredRole - 需要的角色
 * @returns {boolean} 是否有足够权限
 */
export const hasEnoughPermission = (userRole, requiredRole) => {
  const userPriority = getRolePriority(userRole);
  const requiredPriority = getRolePriority(requiredRole);
  return userPriority >= requiredPriority;
};

/**
 * 获取用户可访问的功能列表
 * @param {string} userRole - 用户角色
 * @returns {Array} 可访问的功能列表
 */
export const getAccessibleFeatures = (userRole) => {
  const features = {
    [USER_ROLES.STUDENT]: [
      'view_exams',
      'take_exams',
      'view_results',
      'view_learning_materials',
      'view_error_questions'
    ],
    [USER_ROLES.TEACHER]: [
      'view_exams',
      'take_exams',
      'view_results',
      'view_learning_materials',
      'view_error_questions',
      'create_exams',
      'edit_exams',
      'delete_exams',
      'create_questions',
      'edit_questions',
      'delete_questions',
      'grade_exams',
      'view_statistics'
    ],
    [USER_ROLES.ADMIN]: [
      'view_exams',
      'take_exams',
      'view_results',
      'view_learning_materials',
      'view_error_questions',
      'create_exams',
      'edit_exams',
      'delete_exams',
      'create_questions',
      'edit_questions',
      'delete_questions',
      'grade_exams',
      'view_statistics',
      'manage_users',
      'manage_roles',
      'system_settings',
      'view_logs'
    ]
  };

  return features[userRole] || features[USER_ROLES.STUDENT];
};

/**
 * 检查用户是否有特定功能权限
 * @param {string} userRole - 用户角色
 * @param {string} feature - 功能名称
 * @returns {boolean} 是否有权限
 */
export const hasFeaturePermission = (userRole, feature) => {
  const accessibleFeatures = getAccessibleFeatures(userRole);
  return accessibleFeatures.includes(feature);
};
