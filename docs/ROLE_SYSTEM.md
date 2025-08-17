# 角色权限系统使用指南

## 概述

本系统实现了基于角色的权限控制（RBAC），支持三种用户角色：
- **学生 (student)** - 基础权限，可以参加考试、查看学习材料
- **教师 (teacher)** - 中等权限，可以创建考试、管理题库、阅卷
- **管理员 (admin)** - 最高权限，可以管理用户、系统设置

## 角色定义

### 用户角色常量
```javascript
import { USER_ROLES } from '../config/menuItems';

USER_ROLES.STUDENT  // 'student'
USER_ROLES.TEACHER  // 'teacher'
USER_ROLES.ADMIN    // 'admin'
```

## 菜单权限配置

### 菜单项配置
在 `src/config/menuItems.js` 中配置菜单项的角色权限：

```javascript
const menuItemConfigs = [
  {
    text: "欢迎",
    link: "/",
    roles: [USER_ROLES.STUDENT, USER_ROLES.TEACHER, USER_ROLES.ADMIN],
    icon: null
  },
  {
    text: "考卷中心",
    link: "/exams/list",
    roles: [USER_ROLES.TEACHER, USER_ROLES.ADMIN], // 只有教师和管理员可见
    icon: null
  }
];
```

### 根据角色获取菜单
```javascript
import { getMenuItemsByRole } from '../config/menuItems';

const userRole = 'teacher';
const menuItems = getMenuItemsByRole(userRole);
```

## 路由保护

### 基本用法
```javascript
import ProtectedRoute from '../components/common/ProtectedRoute';
import { USER_ROLES } from '../config/menuItems';

// 保护特定角色
<ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
  <AdminPage />
</ProtectedRoute>

// 保护多个角色
<ProtectedRoute allowedRoles={[USER_ROLES.TEACHER, USER_ROLES.ADMIN]}>
  <TeacherPage />
</ProtectedRoute>
```

### 高级用法
```javascript
<ProtectedRoute 
  allowedRoles={[USER_ROLES.TEACHER, USER_ROLES.ADMIN]}
  fallbackPath="/my-exams/list"
  showAccessDenied={true}
>
  <GradingCenter />
</ProtectedRoute>
```

## 权限检查工具

### 角色检查
```javascript
import { hasRole, isAdmin, isTeacher, isStudent } from '../utils/roleUtils';

const userRole = 'teacher';

hasRole(userRole, USER_ROLES.TEACHER);  // true
hasRole(userRole, [USER_ROLES.TEACHER, USER_ROLES.ADMIN]);  // true
isAdmin(userRole);   // false
isTeacher(userRole); // true
isStudent(userRole); // false
```

### 功能权限检查
```javascript
import { hasFeaturePermission } from '../utils/roleUtils';

const userRole = 'teacher';

hasFeaturePermission(userRole, 'create_exams');     // true
hasFeaturePermission(userRole, 'manage_users');     // false
hasFeaturePermission(userRole, 'grade_exams');      // true
```

## 组件中的权限控制

### 条件渲染
```javascript
import React, { useContext } from 'react';
import { UserContext } from '../contexts/UserContext';
import { isTeacher } from '../utils/roleUtils';

const MyComponent = () => {
  const { user } = useContext(UserContext);
  const userRole = user?.role;

  return (
    <div>
      <h1>考试页面</h1>
      
      {/* 只有教师可以看到的按钮 */}
      {isTeacher(userRole) && (
        <button>创建新考试</button>
      )}
      
      {/* 根据角色显示不同内容 */}
      {userRole === 'admin' && (
        <div>管理员专用功能</div>
      )}
    </div>
  );
};
```

### 角色显示组件
```javascript
import RoleDisplay from '../components/common/RoleDisplay';

// 在组件中显示用户角色
<RoleDisplay showLabel={true} variant="outlined" size="small" />
```

## 登录时的角色处理

### 确保用户对象包含角色信息
```javascript
// 在登录成功后
const userWithRole = {
  ...user,
  username,
  role: user.role || 'student' // 确保有角色信息
};

login(userWithRole);
```

## 权限层级

### 角色优先级
1. **学生 (1)** - 基础权限
2. **教师 (2)** - 包含学生权限 + 教学管理权限
3. **管理员 (3)** - 包含教师权限 + 系统管理权限

### 功能权限矩阵

| 功能 | 学生 | 教师 | 管理员 |
|------|------|------|--------|
| 查看考试 | ✅ | ✅ | ✅ |
| 参加考试 | ✅ | ✅ | ✅ |
| 查看结果 | ✅ | ✅ | ✅ |
| 创建考试 | ❌ | ✅ | ✅ |
| 管理题库 | ❌ | ✅ | ✅ |
| 阅卷 | ❌ | ✅ | ✅ |
| 用户管理 | ❌ | ❌ | ✅ |
| 系统设置 | ❌ | ❌ | ✅ |

## 最佳实践

### 1. 始终检查权限
```javascript
// 好的做法
if (hasRole(userRole, USER_ROLES.TEACHER)) {
  // 执行教师操作
}

// 避免的做法
if (userRole === 'teacher') {
  // 硬编码角色检查
}
```

### 2. 使用常量
```javascript
// 好的做法
import { USER_ROLES } from '../config/menuItems';

// 避免的做法
const role = 'teacher'; // 硬编码字符串
```

### 3. 提供友好的错误信息
```javascript
<ProtectedRoute 
  requiredRole={USER_ROLES.ADMIN}
  showAccessDenied={true}
  fallbackPath="/"
>
  <AdminPage />
</ProtectedRoute>
```

### 4. 测试权限
```javascript
// 在测试中验证权限
test('只有管理员可以访问用户管理页面', () => {
  const user = { role: 'teacher' };
  expect(hasRole(user.role, USER_ROLES.ADMIN)).toBe(false);
});
```

## 扩展指南

### 添加新角色
1. 在 `USER_ROLES` 中添加新角色常量
2. 在 `menuItemConfigs` 中配置新角色的菜单权限
3. 在 `getAccessibleFeatures` 中添加新角色的功能权限
4. 更新 `getRoleDisplayName` 和 `getRolePriority` 函数

### 添加新功能权限
1. 在 `getAccessibleFeatures` 中添加新功能
2. 使用 `hasFeaturePermission` 检查权限
3. 在组件中应用权限检查

### 自定义权限检查
```javascript
// 创建自定义权限检查函数
const canEditExam = (userRole, examCreatorId, userId) => {
  return isTeacher(userRole) && (examCreatorId === userId || isAdmin(userRole));
};
```
