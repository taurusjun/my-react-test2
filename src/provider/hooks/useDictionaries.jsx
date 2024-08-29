import { useState, useEffect } from "react";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import {
  TypeDict,
  CategoryDict,
  KNDict,
  SchoolDict,
  GradeDict,
  DifficultyDict,
  SchoolGradeMapping,
  PredefinedTags,
} from "../utils/dictionaries.js"; // 导入各种字典

// 创建一个模拟适配器实例
const mock = new MockAdapter(axios);

// 使用 utils/dictionaries.js 中的数据模拟 /api/dictionaries 的响应
mock.onGet("/api/dictionaries").reply(200, {
  TypeDict,
  CategoryDict,
  KNDict,
  SchoolDict,
  GradeDict,
  SchoolGradeMapping,
  DifficultyDict,
  PredefinedTags,
});

export function useDictionaries() {
  const [dictionaries, setDictionaries] = useState({
    TypeDict: {},
    CategoryDict: {},
    KNDict: {},
    SchoolDict: {},
    GradeDict: {},
    SchoolGradeMapping: {},
    DifficultyDict: {},
    PredefinedTags: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDictionaries = async () => {
      try {
        // 这里的 axios.get 调用将被拦截并返回模拟数据
        const response = await axios.get("/api/dictionaries");
        setDictionaries(response.data);
        setLoading(false);
      } catch (err) {
        console.error("获取字典数据失败:", err);
        setError(err);
        setLoading(false);
      }
    };

    fetchDictionaries();
  }, []);

  return { dictionaries, loading, error };
}
