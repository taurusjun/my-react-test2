class MdMap {
  constructor(lineCount) {
    this.map = new Map();
    this.lineCount = lineCount;
    this.isLocked = false;
    this.initialize();
  }

  initialize() {
    for (let i = 1; i <= this.lineCount; i++) {
      this.map.set(i, null);
    }
  }

  lock() {
    this.isLocked = true;
  }

  unlock() {
    this.isLocked = false;
  }

  set(lineNumber, value) {
    if (this.isLocked) {
      throw new Error("MdMap 当前被锁定，无法进行设置操作");
    }

    this.lock();
    try {
      if (lineNumber < 1 || lineNumber > this.lineCount) {
        throw new Error(`行号 ${lineNumber} 超出范围`);
      }
      this.map.set(lineNumber, value);
    } finally {
      this.unlock();
    }
  }

  setMultiLinesWithLock(lineNumbers, value) {
    if (this.isLocked) {
      throw new Error("MdMap 当前被锁定，无法进行设置操作");
    }

    this.lock();
    try {
      for (const lineNumber of lineNumbers) {
        this.map.set(lineNumber, value);
      }
    } finally {
      this.unlock();
    }
  }

  setWithLock(lineNumber, value) {
    if (this.isLocked) {
      throw new Error("MdMap 当前被锁定，无法进行设置操作");
    }

    this.lock();
    try {
      this.map.set(lineNumber, value);
    } finally {
      this.unlock();
    }
  }

  get(lineNumber) {
    if (lineNumber < 1 || lineNumber > this.lineCount) {
      throw new Error(`行号 ${lineNumber} 超出范围`);
    }
    return this.map.get(lineNumber);
  }

  setRange(start, end, value) {
    this.lock();
    try {
      for (let i = start; i <= end; i++) {
        this.map.set(i, value);
      }
    } finally {
      this.unlock();
    }
  }

  clear() {
    this.lock();
    try {
      this.initialize();
    } finally {
      this.unlock();
    }
  }

  getLineCount() {
    return this.lineCount;
  }

  findNearestSection(lineNumber) {
    if (lineNumber < 1 || lineNumber > this.lineCount) {
      throw new Error(`行号 ${lineNumber} 超出范围`);
    }

    for (let i = lineNumber; i >= 1; i--) {
      const value = this.map.get(i);
      if (value && value.type === "section") {
        return value;
      }
    }

    return null; // 如果没有找到 section，返回 null
  }

  findNearestQuestion(lineNumber) {
    if (lineNumber < 1 || lineNumber > this.lineCount) {
      throw new Error(`行号 ${lineNumber} 超出范围`);
    }

    for (let i = lineNumber; i >= 1; i--) {
      const value = this.map.get(i);
      if (value && value.type === "question") {
        return value;
      }
    }

    return null; // 如果没有找到 section，返回 null
  }

  findPreviousObject(startLine, type) {
    for (let i = startLine - 1; i >= 1; i--) {
      const value = this.map.get(i);
      if (value !== null && (type ? value.type === type : true)) {
        return { value, lineNumber: i }; // 返回 value 和对应的行号
      }
    }
    return null;
  }

  findNextObject(endLine, type) {
    for (let i = endLine + 1; i <= this.lineCount; i++) {
      const value = this.map.get(i);
      if (value !== null && (type ? value.type === type : true)) {
        return { value, lineNumber: i }; // 返回 value 和对应的行号
      }
    }
    return null;
  }

  hasOverlap(lineNumbers, inputObject) {
    const allLines = [
      ...new Set([...lineNumbers, ...(inputObject?.extra || [])]),
    ];
    const start = Math.min(...allLines);
    const end = Math.max(...allLines);

    // 1. 检查内部范围
    for (let i = start; i <= end; i++) {
      const value = this.map.get(i);
      if (value !== null && value.uuid !== inputObject.uuid) {
        return true; // 发现重叠
      }
    }

    // 2. 检查外部范围
    const frontObjectResult = this.findPreviousObject(start);
    const backObjectResult = this.findNextObject(end);

    // 检查 frontObject 和 backObject 是否为同一个对象
    if (
      frontObjectResult &&
      backObjectResult &&
      frontObjectResult.value === backObjectResult.value &&
      frontObjectResult.value.uuid !== inputObject.uuid
    ) {
      return true; // 发现重叠
    }

    return false; // 没有重叠
  }

  // 强业务属性代码，加入updatedSectionObj, quickLookupMap是为了方便处理业务
  insertSection(lines, updatedSectionObj, quickLookupMap) {
    const minLine = Math.min(...lines);
    const maxLine = Math.max(...lines);

    // 插入新的 section
    this.setMultiLinesWithLock(lines, updatedSectionObj);

    // 1. 找到 frontSection
    let frontSection = null;
    const frontSectionResult = this.findPreviousObject(minLine, "section");
    if (frontSectionResult) {
      frontSection = quickLookupMap.get(frontSectionResult.value.uuid);
      this.addQuestionsToSection(
        frontSectionResult.lineNumber + 1,
        minLine - 1,
        frontSection,
        quickLookupMap
      );
    }

    // 2. 往后
    this.addQuestionsToSection(
      maxLine + 1,
      this.lineCount,
      updatedSectionObj,
      quickLookupMap
    );

    if (!frontSection) {
      return [updatedSectionObj];
    }
    return [frontSection, updatedSectionObj];
  }

  addQuestionsToSection(startLine, endLine, targetSection, quickLookupMap) {
    targetSection.questions = [];
    for (let i = startLine; i <= endLine; i++) {
      const value = this.map.get(i);
      if (value && value.type === "question") {
        // 检查是否已存在，避免重复
        const question = quickLookupMap.get(value.uuid);
        if (!targetSection.questions.includes(question)) {
          targetSection.questions.push(question);
        }
      }
      if (value && value.type === "section") break; // 找到下一个 section，停止
    }
  }

  //////////
  // 强业务属性代码，加入updatedSectionObj, quickLookupMap是为了方便处理业务
  insertQuestion(lines, updatedQuestionObj, quickLookupMap) {
    const minLine = Math.min(...lines);
    const maxLine = Math.max(...lines);

    // 插入新的 section
    this.setMultiLinesWithLock(lines, updatedQuestionObj);

    // 1. 找到 frontSection
    let frontQuestion = null;
    const frontQuestionResult = this.findPreviousObject(minLine, "question");
    if (frontQuestionResult) {
      frontQuestion = quickLookupMap.get(frontQuestionResult.value.uuid);
      this.addQuestionDetailsToQuestion(
        frontQuestionResult.lineNumber + 1,
        minLine - 1,
        frontQuestion,
        quickLookupMap
      );
    }

    // 2. 往后
    this.addQuestionDetailsToQuestion(
      maxLine + 1,
      this.lineCount,
      updatedQuestionObj,
      quickLookupMap
    );

    if (!frontQuestion) {
      return [updatedQuestionObj];
    }
    return [frontQuestion, updatedQuestionObj];
  }

  addQuestionDetailsToQuestion(
    startLine,
    endLine,
    targetQuestion,
    quickLookupMap
  ) {
    targetQuestion.questionDetails = [];
    for (let i = startLine; i <= endLine; i++) {
      const value = this.map.get(i);
      if (value && value.type === "questionDetail") {
        // 检查是否已存在，避免重复
        const questionDetail = quickLookupMap.get(value.uuid);
        if (!targetQuestion.questionDetails.includes(questionDetail)) {
          targetQuestion.questionDetails.push(questionDetail);
        }
      }
      if (value && value.type === "question") break;
    }
  }
}

export default MdMap;
