/**
 * 将旧的answer数组格式转换为新的对象格式
 * @param {Array|Object} answer - 旧的answer格式或新的answer格式
 * @returns {Object} 新的answer格式 {content: [], images: []}
 */
export const normalizeAnswer = (answer) => {
  // 如果已经是正确格式，直接返回
  if (answer && typeof answer === 'object' && answer.content && Array.isArray(answer.content)) {
    return {
      content: answer.content,
      images: answer.images || []
    };
  }
  
  // 如果是数组格式，转换为新格式
  if (Array.isArray(answer)) {
    return {
      content: answer,
      images: []
    };
  }
  
  // 如果不存在或无效，返回默认格式
  return {
    content: [],
    images: []
  };
};

/**
 * 从answer对象中获取内容数组
 * @param {Object} answer - answer对象
 * @returns {Array} 内容数组
 */
export const getAnswerContent = (answer) => {
  const normalized = normalizeAnswer(answer);
  return normalized.content;
};

/**
 * 从answer对象中获取图片数组
 * @param {Object} answer - answer对象
 * @returns {Array} 图片数组
 */
export const getAnswerImages = (answer) => {
  const normalized = normalizeAnswer(answer);
  return normalized.images;
};

/**
 * 创建新的answer对象
 * @param {Array} content - 内容数组
 * @param {Array} images - 图片数组
 * @returns {Object} answer对象
 */
export const createAnswer = (content = [], images = []) => {
  return {
    content: Array.isArray(content) ? content : [content],
    images: Array.isArray(images) ? images : [images]
  };
};

/**
 * 更新answer对象的内容
 * @param {Object} answer - 当前answer对象
 * @param {Array} content - 新的内容数组
 * @returns {Object} 更新后的answer对象
 */
export const updateAnswerContent = (answer, content) => {
  const normalized = normalizeAnswer(answer);
  return {
    ...normalized,
    content: Array.isArray(content) ? content : [content]
  };
};

/**
 * 更新answer对象的图片
 * @param {Object} answer - 当前answer对象
 * @param {Array} images - 新的图片数组
 * @returns {Object} 更新后的answer对象
 */
export const updateAnswerImages = (answer, images) => {
  const normalized = normalizeAnswer(answer);
  return {
    ...normalized,
    images: Array.isArray(images) ? images : [images]
  };
};

/**
 * 添加图片到answer对象
 * @param {Object} answer - 当前answer对象
 * @param {string} image - 图片数据
 * @returns {Object} 更新后的answer对象
 */
export const addAnswerImage = (answer, image) => {
  const normalized = normalizeAnswer(answer);
  return {
    ...normalized,
    images: [...normalized.images, image]
  };
};

/**
 * 移除answer对象中的图片
 * @param {Object} answer - 当前answer对象
 * @param {number} index - 要移除的图片索引
 * @returns {Object} 更新后的answer对象
 */
export const removeAnswerImage = (answer, index) => {
  const normalized = normalizeAnswer(answer);
  const newImages = [...normalized.images];
  newImages.splice(index, 1);
  return {
    ...normalized,
    images: newImages
  };
};

/**
 * 获取answer的显示文本（用于渲染）
 * @param {Object|Array} answer - answer对象或数组
 * @param {string} separator - 分隔符，默认为", "
 * @returns {string} 显示文本
 */
export const getAnswerDisplayText = (answer, separator = ", ") => {
  // 处理新的answer对象格式
  if (answer && typeof answer === 'object' && answer.content) {
    const content = answer.content;
    if (Array.isArray(content)) {
      return content.join(separator);
    }
    return content;
  }
  
  // 处理旧的数组格式（向后兼容）
  if (Array.isArray(answer)) {
    return answer.join(separator);
  }
  
  // 处理字符串或其他类型
  return answer || "";
};

/**
 * 检查answer是否为空
 * @param {Object|Array} answer - answer对象或数组
 * @returns {boolean} 是否为空
 */
export const isAnswerEmpty = (answer) => {
  if (!answer) return true;
  
  // 处理新的answer对象格式
  if (typeof answer === 'object' && answer.content) {
    return !Array.isArray(answer.content) || answer.content.length === 0;
  }
  
  // 处理数组格式
  if (Array.isArray(answer)) {
    return answer.length === 0;
  }
  
  return false;
};
