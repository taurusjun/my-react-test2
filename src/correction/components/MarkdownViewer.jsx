import React, { useEffect, useState } from "react";
import { marked } from "marked"; // 修改为命名导入
import "./MarkdownViewer.css"; // 引入 CSS 文件

const MarkdownViewer = ({ filePath }) => {
  const [markdownLines, setMarkdownLines] = useState([]);

  useEffect(() => {
    const fetchMarkdown = async () => {
      try {
        const response = await fetch(filePath);
        const text = await response.text();
        const lines = text.split("\n");
        setMarkdownLines(lines);
      } catch (error) {
        console.error("加载 Markdown 文件失败:", error);
      }
    };

    fetchMarkdown();
  }, [filePath]);

  return (
    <div className="markdown-container">
      {markdownLines.map((line, index) => (
        <div key={index} className="markdown-line" id={`line-${index + 1}`}>
          <span className="line-number">{index + 1}</span>
          <span
            dangerouslySetInnerHTML={{ __html: marked(line) }} // 使用 marked 函数
            className="line-content"
          />
        </div>
      ))}
    </div>
  );
};

export default MarkdownViewer;
