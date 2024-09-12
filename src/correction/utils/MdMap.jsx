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

    if (lineNumber < 1 || lineNumber > this.lineCount) {
      throw new Error(`行号 ${lineNumber} 超出范围`);
    }
    this.map.set(lineNumber, value);
  }

  setWithLock(lineNumber, value) {
    this.lock();
    try {
      this.set(lineNumber, value);
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
        this.set(i, value);
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
}

export default MdMap;
