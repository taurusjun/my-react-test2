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

  toJSONString() {
    const jsonObject = {};
    for (let [key, value] of this.map) {
      if (value !== null) {
        jsonObject[key] = value;
      }
    }
    return JSON.stringify(jsonObject, null, 2);
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

  findNearestObject(lineNumber, type = null) {
    if (lineNumber < 1 || lineNumber > this.lineCount) {
      throw new Error(`行号 ${lineNumber} 超出范围`);
    }

    const validTypes = type
      ? [type]
      : ["section", "question", "questionDetail"];

    for (let i = lineNumber; i >= 1; i--) {
      const value = this.map.get(i);
      if (value && validTypes.includes(value.type)) {
        return value;
      }
    }

    return null; // 如果没有找到匹配的对象，返回 null
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
      if (value !== null && (!inputObject || value.uuid !== inputObject.uuid)) {
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
      (!inputObject || frontObjectResult.value.uuid !== inputObject.uuid)
    ) {
      return true; // 发现重叠
    }

    return false; // 没有重叠
  }
}

export default MdMap;
