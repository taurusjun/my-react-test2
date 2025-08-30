# 题型映射系统

## 概述

本系统提供了UI题型（前端显示）和后端题型（数据库存储）之间的双向映射功能。

## 题型对照表

| UI题型 (uiType) | 中文名称 | 后端题型 (type) | 中文名称 |
|----------------|---------|----------------|---------|
| single_selection | 单项选择题 | selection | 单项选择题 |
| multi_selection | 多项选择题 | multiSelection | 多项选择题 |
| fill_blank | 填空题 | fillInBlank | 填空题 |
| short_answer | 简答题 | shortAnswer | 简答题 |
| calculation | 计算题 | calculation | 计算题 |
| essay | 论述题 | essay | 论述题 |

## 使用方法

### 导入映射函数

```javascript
import { mapUITypeToBackendType, mapBackendTypeToUIType } from './constants';
```

### UI题型转后端题型

```javascript
const backendType = mapUITypeToBackendType('single_selection');
// 返回: 'selection'
```

### 后端题型转UI题型

```javascript
const uiType = mapBackendTypeToUIType('selection');
// 返回: 'single_selection'
```

### 处理未知类型

```javascript
const unknownUI = mapUITypeToBackendType('unknown_type');
// 返回: 'fillInBlank' (默认值)

const unknownBackend = mapBackendTypeToUIType('unknown_type');
// 返回: 'fill_blank' (默认值)
```

## 扩展新题型

要添加新的题型，只需要在 `constants.js` 中进行以下修改：

1. 在 `QUESTION_UI_TYPES` 中添加UI题型定义
2. 在 `QUESTION_TYPES` 中添加后端题型定义  
3. 在 `UI_TYPE_TO_BACKEND_TYPE_MAPPING` 中添加映射关系

### 示例：添加"判断题"

```javascript
// 1. 添加UI题型
export const QUESTION_UI_TYPES = {
  // ... 现有题型
  true_false: "判断题",
};

// 2. 添加后端题型
export const QUESTION_TYPES = {
  // ... 现有题型
  trueFalse: "判断题",
};

// 3. 添加映射关系
export const UI_TYPE_TO_BACKEND_TYPE_MAPPING = {
  // ... 现有映射
  true_false: "trueFalse",
};
```

## 验证映射

系统会自动进行双向映射一致性验证，确保：
- UI题型 → 后端题型 → UI题型 = 原始UI题型
- 所有定义的题型都有对应的映射关系

## 优势

1. **独立性**：映射逻辑与业务逻辑分离
2. **可扩展性**：添加新题型只需修改配置，无需改动业务代码
3. **一致性**：确保前后端题型定义的统一性
4. **容错性**：对未知类型提供默认值处理
5. **双向性**：支持双向转换，满足不同场景需求