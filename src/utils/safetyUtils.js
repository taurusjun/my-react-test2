/**
 * 安全地访问对象属性，避免null/undefined错误
 * @param {Object} obj - 要访问的对象
 * @param {string} path - 属性路径，用点号分隔
 * @param {*} defaultValue - 默认值
 * @returns {*} 属性值或默认值
 */
export const safeGet = (obj, path, defaultValue = null) => {
  if (!obj || typeof obj !== 'object') {
    return defaultValue;
  }
  
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result === null || result === undefined || typeof result !== 'object') {
      return defaultValue;
    }
    result = result[key];
  }
  
  return result !== undefined ? result : defaultValue;
};

/**
 * 安全地检查数组是否存在且不为空
 * @param {Array} arr - 要检查的数组
 * @returns {boolean} 是否为有效数组
 */
export const isSafeArray = (arr) => {
  return Array.isArray(arr) && arr.length > 0;
};

/**
 * 安全地执行数组map操作
 * @param {Array} arr - 要操作的数组
 * @param {Function} callback - 回调函数
 * @param {Array} defaultValue - 默认返回值
 * @returns {Array} map结果或默认值
 */
export const safeMap = (arr, callback, defaultValue = []) => {
  if (!isSafeArray(arr)) {
    return defaultValue;
  }
  
  try {
    return arr.map(callback);
  } catch (error) {
    console.warn('safeMap error:', error);
    return defaultValue;
  }
};

/**
 * 安全地访问字符串属性
 * @param {*} value - 要检查的值
 * @param {string} defaultValue - 默认值
 * @returns {string} 字符串值或默认值
 */
export const safeString = (value, defaultValue = '') => {
  if (value === null || value === undefined) {
    return defaultValue;
  }
  return String(value);
};

/**
 * 安全地访问数字属性
 * @param {*} value - 要检查的值
 * @param {number} defaultValue - 默认值
 * @returns {number} 数字值或默认值
 */
export const safeNumber = (value, defaultValue = 0) => {
  if (value === null || value === undefined) {
    return defaultValue;
  }
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
};

/**
 * 安全地检查对象是否存在
 * @param {*} value - 要检查的值
 * @returns {boolean} 是否为有效对象
 */
export const isSafeObject = (value) => {
  return value !== null && value !== undefined && typeof value === 'object';
};
