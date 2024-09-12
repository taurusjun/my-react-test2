import React, { useEffect, useState } from "react";
import { Box, Button } from "@mui/material";
import ExamCuttingTool from "../components/ExamCuttingTool";
import CutPreview from "../components/CutPreview";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { useParams } from "react-router";

const ExamCuttingPage = () => {
  const [markdownContent, setMarkdownContent] = useState("");
  const [exam, setExam] = useState({ sections: [] });
  const [isCuttingMode, setIsCuttingMode] = useState(false); // 切割模式状态
  const { fileUuid } = useParams(); // 获取文件 UUID

  useEffect(() => {
    const fetchExamData = async () => {
      try {
        const response = await axios.get(`/api/file-corrections/${fileUuid}`);
        const content = response.data.content;
        setMarkdownContent(content); // 设置Markdown内容
      } catch (error) {
        console.error("获取数据失败:", error);
      }
    };
    fetchExamData();
  }, [fileUuid]);

  const toggleCuttingMode = () => {
    setIsCuttingMode((prev) => !prev);
  };

  return (
    <Box>
      <Button onClick={toggleCuttingMode}>
        {isCuttingMode ? "退出切割模式" : "进入切割模式"}
      </Button>
      <Box>
        <ReactMarkdown rehypePlugins={[rehypeRaw]}>
          {markdownContent}
        </ReactMarkdown>
      </Box>
      <ExamCuttingTool
        exam={exam}
        updateExam={setExam}
        isCuttingMode={isCuttingMode}
        markdownContent={markdownContent} // 传递Markdown内容
      />
      <CutPreview sections={exam.sections} />
    </Box>
  );
};

export default ExamCuttingPage;
