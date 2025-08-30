# 判断题功能实现文档

## 概述

本系统完整支持判断题功能，从前端标注到编辑、预览和提交的整个流程。

## 题型定义

### UI题型
- **类型**: `true_false`
- **显示名称**: "判断题"
- **选项**: 固定为"正确"和"错误"两个选项

### 后端题型
- **类型**: `trueFalse`
- **显示名称**: "判断题"

## 功能特性

### 1. 标注系统
- ✅ 在题型选择器中可以选择"判断题"
- ✅ 支持标注为简单题判断题
- ✅ 支持标注为复杂题中的判断题小题

### 2. 编辑系统 (ExamEditor)
- ✅ 判断题专用答案选择器，只显示"正确"和"错误"选项
- ✅ 支持行内编辑题目内容和解释
- ✅ 与其他题型统一的编辑界面

### 3. 预览系统 (ExamPreview) 
- ✅ 判断题专用选项显示：显示为"A. 正确  B. 错误"的格式
- ✅ 特殊样式：灰色背景框，清晰区分正确/错误选项
- ✅ 答案和解释正常显示

### 4. 提交系统
- ✅ 正确的类型映射：`true_false` → `trueFalse`
- ✅ 与后端API兼容的数据格式

## 使用方法

### 标注判断题
1. 选择文本行
2. 右键选择"标注为简单题"或"标注为小题"
3. 在题型选择器中选择"判断题"
4. 确认标注

### 编辑判断题
1. 在ExamEditor中找到判断题
2. 点击题目内容进行编辑（支持Markdown和LaTeX）
3. 在答案下拉框中选择"正确"或"错误"
4. 编辑解释说明

### 预览判断题
- 判断题会显示特殊的选项格式：
  ```
  A. 正确    B. 错误
  ```
- 答案会显示为"正确"或"错误"
- 解释会正常渲染Markdown和LaTeX内容

## 数据结构示例

### 简单题判断题
```json
{
  "uuid": "simple-true-false-1",
  "type": "simpleQuestion", 
  "uiType": "true_false",
  "questionContent": {
    "value": "判断：2 + 2 = 4"
  },
  "rows": [],
  "answer": {
    "content": ["正确"],
    "images": []
  },
  "explanation": "这是基本的数学运算"
}
```

### 复杂题中的判断题小题
```json
{
  "uuid": "detail-true-false-1",
  "uiType": "true_false",
  "questionContent": {
    "value": "函数f(x)=x²的图像开口向上。"
  },
  "rows": [],
  "answer": {
    "content": ["正确"],
    "images": []
  },
  "explanation": "二次项系数为正，所以开口向上"
}
```

## 提交后的数据格式

```json
{
  "type": "trueFalse",
  "questionDetails": [{
    "uiType": "true_false",
    "questionContent": {
      "value": "题目内容"
    },
    "rows": [],
    "answer": {
      "content": ["正确"],
      "images": []
    }
  }]
}
```

## 扩展说明

判断题的实现完全基于现有的题型系统架构：
- 使用标准的题型映射机制
- 复用现有的编辑和预览组件
- 特殊处理仅在必要的地方进行

这确保了系统的一致性和可维护性。

## 测试数据

可以使用 `test-true-false-question.json` 文件来测试判断题的各种功能。