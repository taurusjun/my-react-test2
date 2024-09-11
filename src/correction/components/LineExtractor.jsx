import React, { useState } from "react";

const LineExtractor = ({ lines }) => {
  const [lineNumbers, setLineNumbers] = useState("");
  const [extractedContent, setExtractedContent] = useState("");

  const handleExtract = () => {
    const numbers = lineNumbers
      .split(",")
      .map((num) => parseInt(num.trim(), 10));
    const content = numbers
      .filter((num) => num > 0 && num <= lines.length)
      .map((num) => lines[num - 1])
      .join("\n");
    setExtractedContent(content);
  };

  return (
    <div>
      <h2>行号提取器</h2>
      <textarea
        rows="4"
        cols="50"
        placeholder="输入行号，用逗号分隔，例如：1, 2, 3"
        value={lineNumbers}
        onChange={(e) => setLineNumbers(e.target.value)}
      />
      <button onClick={handleExtract}>提取内容</button>
      <textarea
        rows="10"
        cols="50"
        readOnly
        value={extractedContent}
        placeholder="提取的内容将显示在这里"
      />
    </div>
  );
};

export default LineExtractor;
