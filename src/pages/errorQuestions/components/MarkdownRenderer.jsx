import React from "react";
import { Box } from "@mui/material";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

// 可重用的Markdown渲染组件
const MarkdownRenderer = ({ content, sx = {} }) => {
  // Check if content is null, undefined, or not a string
  if (!content) return null;
  
  // Ensure content is a string
  const contentString = typeof content === 'string' ? content : String(content || '');
  
  return (
    <Box sx={sx}>
      <ReactMarkdown
        components={{
          p: ({ node, ...props }) => (
            <p style={{ margin: "8px 0", lineHeight: "1.6" }} {...props} />
          ),
          code: ({ node, inline, className, children, ...props }) => (
            <code
              style={{
                backgroundColor: inline ? "#f5f5f5" : "#f8f8f8",
                padding: inline ? "2px 4px" : "12px 16px",
                borderRadius: "4px",
                fontFamily: "Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace",
                fontSize: inline ? "0.9em" : "0.85em",
                border: "1px solid #e1e1e1",
                display: inline ? "inline" : "block",
                whiteSpace: inline ? "nowrap" : "pre-wrap",
                overflow: inline ? "visible" : "auto",
              }}
              {...props}
            >
              {children}
            </code>
          ),
          pre: ({ node, ...props }) => (
            <pre
              style={{
                backgroundColor: "#f8f8f8",
                padding: "16px",
                borderRadius: "6px",
                overflow: "auto",
                border: "1px solid #e1e1e1",
                margin: "16px 0",
                lineHeight: "1.4",
              }}
              {...props}
            />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote
              style={{
                borderLeft: "4px solid #ddd",
                paddingLeft: "16px",
                margin: "16px 0",
                color: "#666",
                fontStyle: "italic",
              }}
              {...props}
            />
          ),
          table: ({ node, ...props }) => (
            <table
              style={{
                borderCollapse: "collapse",
                width: "100%",
                margin: "16px 0",
              }}
              {...props}
            />
          ),
          th: ({ node, ...props }) => (
            <th
              style={{
                border: "1px solid #ddd",
                padding: "8px 12px",
                backgroundColor: "#f5f5f5",
                textAlign: "left",
              }}
              {...props}
            />
          ),
          td: ({ node, ...props }) => (
            <td
              style={{
                border: "1px solid #ddd",
                padding: "8px 12px",
              }}
              {...props}
            />
          ),
        }}
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeRaw]}
      >
        {contentString}
      </ReactMarkdown>
    </Box>
  );
};

export default MarkdownRenderer;