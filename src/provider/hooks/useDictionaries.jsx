import { useState, useEffect } from "react";
import axios from "axios";

export function useDictionaries() {
  const [dictionaries, setDictionaries] = useState({
    TypeDict: {},
    CategoryDict: {},
    KNDict: {},
    SchoolDict: {},
    GradeDict: {},
    SchoolGradeMapping: {},
    DifficultyDict: {},
    TagDict: {},
    CategoryKNMapping: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDictionaries = async () => {
      try {
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
