class MdMap {
  constructor(lineCount) {
    this.map = new Map();
    this.lineCount = lineCount;
    this.initialize();
  }

  initialize() {
    for (let i = 1; i <= this.lineCount; i++) {
      this.map.set(i, null);
    }
  }

  set(lineNumber, value) {
    if (lineNumber < 1 || lineNumber > this.lineCount) {
      throw new Error(`行号 ${lineNumber} 超出范围`);
    }
    this.map.set(lineNumber, value);
  }

  get(lineNumber) {
    if (lineNumber < 1 || lineNumber > this.lineCount) {
      throw new Error(`行号 ${lineNumber} 超出范围`);
    }
    return this.map.get(lineNumber);
  }

  setRange(start, end, value) {
    for (let i = start; i <= end; i++) {
      this.set(i, value);
    }
  }

  clear() {
    this.initialize();
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
}

export default MdMap;
