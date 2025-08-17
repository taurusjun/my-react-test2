# 考试用户关联管理功能

## 功能概述

考试用户关联管理是一个专为管理员设计的页面，用于将多个考试与用户进行关联。这个功能允许管理员：

- 单个关联：将一个考试与一个或多个用户关联
- 批量关联：将多个考试与多个用户进行批量关联
- 查看和管理所有关联关系
- 监控关联状态（有效、待激活、已过期）

## 功能特性

### 1. 权限控制
- 只有管理员（admin）角色可以访问此页面
- 自动权限检查，非管理员用户会看到权限错误提示

### 2. 单个关联
- 选择单个考试
- 选择多个用户
- 实时预览关联信息
- 一键添加关联

### 3. 批量关联
- 支持两种分配模式：
  - **全部关联**：所有选中的考试分配给所有选中的用户
  - **一对一关联**：考试数量必须等于用户数量，按顺序一一对应
- 实时显示将要创建的关联数量
- 智能验证分配规则

### 4. 关联管理
- 查看所有关联列表
- 显示关联状态（有效、待激活、已过期）
- 支持删除单个关联
- 批量保存所有关联到后端

### 5. 统计信息
- 总关联数
- 有效关联数
- 待激活关联数
- 已过期关联数

## 页面结构

```
考试用户关联管理
├── 添加新关联
│   ├── 选择考试（下拉选择）
│   ├── 选择用户（多选）
│   └── 添加关联按钮
├── 操作按钮
│   ├── 保存所有关联
│   ├── 批量关联
│   └── 刷新数据
├── 关联列表
│   ├── 考试名称
│   ├── 用户
│   ├── 状态
│   ├── 关联时间
│   └── 操作（删除）
└── 统计信息
    ├── 总关联数
    ├── 有效关联
    ├── 待激活
    └── 已过期
```

## API接口

### 获取考试列表
```
GET /api/exams
```

### 获取用户列表
```
GET /api/users
```

### 获取关联列表
```
GET /api/exam-user-assignments
```

### 批量保存关联
```
POST /api/exam-user-assignments/batch
Content-Type: application/json

{
  "assignments": [
    {
      "examUuid": "exam-1",
      "userUuid": "user-1"
    }
  ]
}
```

## 数据模型

### 考试对象
```javascript
{
  uuid: string,
  name: string,
  category: string,
  gradeInfo: {
    school: string,
    grade: string
  }
}
```

### 用户对象
```javascript
{
  uuid: string,
  name: string,
  username: string,
  role: string
}
```

### 关联对象
```javascript
{
  uuid: string,
  examUuid: string,
  userUuid: string,
  examName: string,
  userName: string,
  status: 'active' | 'pending' | 'expired',
  assignedAt: string // ISO 8601 格式
}
```

## 状态说明

- **active（有效）**：关联已激活，用户可以正常参加考试
- **pending（待激活）**：关联已创建但尚未激活
- **expired（已过期）**：关联已过期，用户无法参加考试

## 使用流程

### 1. 单个关联
1. 在"添加新关联"区域选择要关联的考试
2. 选择要关联的用户（可多选）
3. 点击"添加关联"按钮
4. 关联会添加到列表中，状态为"待激活"
5. 点击"保存所有关联"将关联保存到后端

### 2. 批量关联
1. 点击"批量关联"按钮打开批量操作模态框
2. 选择分配类型（全部关联或一对一关联）
3. 选择要关联的考试
4. 选择要关联的用户
5. 确认关联信息
6. 点击"确认关联"完成批量操作

### 3. 管理关联
1. 在关联列表中查看所有关联
2. 使用删除按钮移除不需要的关联
3. 查看统计信息了解关联状态分布
4. 定期刷新数据获取最新状态

## 权限配置

### 菜单权限
在 `src/config/menuItems.js` 中配置：
```javascript
{
  text: "考试用户关联",
  link: "/exam-user-assignment",
  roles: [USER_ROLES.ADMIN],
  icon: null
}
```

### 路由权限
在 `src/routeConfig.js` 中配置：
```javascript
{
  path: "/exam-user-assignment",
  element: ExamUserAssignment,
  protected: true,
  allowedRoles: [USER_ROLES.ADMIN]
}
```

### 路径权限
在 `src/config/menuItems.js` 的路径模式中添加：
```javascript
{ pattern: '/exam-user-assignment', roles: [USER_ROLES.ADMIN] }
```

## 组件结构

```
src/pages/admin/
├── ExamUserAssignment.jsx          # 主页面组件
└── components/
    └── BatchAssignmentModal.jsx    # 批量关联模态框
```

## 模拟数据

为了开发和测试，系统提供了模拟数据：

- 4个示例考试（数学、英语、物理、化学）
- 5个示例用户（3个学生、1个教师、1个学生）
- 4个示例关联关系

模拟数据在 `src/setupProxy.js` 中配置，可以直接用于测试功能。

## 扩展功能

### 可能的扩展
1. **关联模板**：保存常用的关联组合为模板
2. **批量导入**：支持Excel文件批量导入关联
3. **关联历史**：记录关联的创建和修改历史
4. **关联搜索**：支持按考试、用户、状态等条件搜索
5. **关联导出**：导出关联数据为Excel或CSV格式
6. **关联通知**：关联创建后自动通知相关用户

### 技术扩展
1. **实时更新**：使用WebSocket实现关联状态的实时更新
2. **缓存优化**：对考试和用户列表进行缓存优化
3. **分页加载**：对大量关联数据进行分页显示
4. **批量操作**：支持批量删除、批量修改状态等操作

## 注意事项

1. **权限检查**：确保只有管理员可以访问此功能
2. **数据验证**：在保存前验证关联数据的完整性
3. **状态管理**：正确处理关联状态的变化
4. **错误处理**：提供友好的错误提示和恢复机制
5. **性能优化**：对大量数据的操作进行性能优化
