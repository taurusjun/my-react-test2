import React from "react";
import { Box } from "@mui/material";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

/**
 * A reusable Markdown renderer component with support for:
 * - LaTeX formulas (using KaTeX)
 * - HTML content (using rehype-raw)
 * - Code blocks with proper styling
 * - Tables, lists, blockquotes and other Markdown elements
 * 
 * @param {Object} props Component properties
 * @param {string} props.content The markdown content to render
 * @param {Object} props.sx Additional styling properties to apply to the container
 * @param {Object} props.options Additional options for customization
 * @param {Object} props.options.paragraph Styling for paragraphs
 * @param {Object} props.options.inline Whether to use inline styling for paragraphs
 * @param {Object} props.options.fontSize Font size overrides for rendered content
 */
const MarkdownRenderer = ({ content, sx = {}, options = {} }) => {
  // Check if content is null, undefined, or not a string
  if (!content) return null;
  
  // Ensure content is a string
  const contentString = typeof content === 'string' ? content : String(content || '');
  
  // Default styling for paragraphs
  const paragraphStyle = options.inline ? 
    { margin: 0, display: "inline" } : 
    { margin: "8px 0", lineHeight: "1.6" };
    
  // Font size override if provided
  const fontSizeStyle = options.fontSize ? 
    { fontSize: options.fontSize } : 
    {};
  
  return (
    <Box sx={sx}>
      <ReactMarkdown
        components={{
          p: ({ node, ...props }) => (
            <p 
              style={{
                ...paragraphStyle,
                ...options.paragraph,
              }} 
              {...props} 
            />
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
                ...fontSizeStyle,
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
                ...fontSizeStyle,
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
                ...fontSizeStyle,
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
                ...fontSizeStyle,
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
                ...fontSizeStyle,
              }}
              {...props}
            />
          ),
          td: ({ node, ...props }) => (
            <td
              style={{
                border: "1px solid #ddd",
                padding: "8px 12px",
                ...fontSizeStyle,
              }}
              {...props}
            />
          ),
          // Apply font size to all heading elements
          h1: ({ node, ...props }) => (
            <h1 style={{ ...fontSizeStyle }} {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 style={{ ...fontSizeStyle }} {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 style={{ ...fontSizeStyle }} {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 style={{ ...fontSizeStyle }} {...props} />
          ),
          h5: ({ node, ...props }) => (
            <h5 style={{ ...fontSizeStyle }} {...props} />
          ),
          h6: ({ node, ...props }) => (
            <h6 style={{ ...fontSizeStyle }} {...props} />
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