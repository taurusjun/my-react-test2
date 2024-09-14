import React, { useState, useEffect, useMemo } from "react";
import { Grid, Box, Button, TextField, Snackbar, Alert } from "@mui/material";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import axios from "axios";
import MarkdownAnnotator from "./MarkdownAnnotator";
import MdMap from "../utils/MdMap";
import { v4 as uuidv4 } from "uuid";

const COLORS = {
  SECTION: "#ffeb3b",
  QUESTION: "#8bc34a",
  QUESTION_DETAIL: "#03a9f4",
};

const FileCorrectionEditor = ({ fileUuid }) => {
  const [markdownLines, setMarkdownLines] = useState([]);
  const [selectedLines, setSelectedLines] = useState([]);
  const [exam, setExam] = useState({ sections: [] });
  const [isEditing, setIsEditing] = useState(false);
  const [anchorPosition, setAnchorPosition] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [fixedStartIndex, setFixedStartIndex] = useState(null);
  const [mdMap, setMdMap] = useState(null);

  const quickLookupMap = useMemo(() => {
    const map = new Map();

    exam.sections.forEach((section) => {
      map.set(section.uuid, section);
      section.questions.forEach((question) => {
        map.set(question.uuid, question);
        question.questionDetails.forEach((detail) => {
          map.set(detail.uuid, detail);
        });
      });
    });

    return map;
  }, [exam.sections]);

  const convertMdMapToExamStructure = () => {
    const sections = [];
    const questions = [];
    const questionDetails = [];

    for (let i = 1; i <= mdMap.getLineCount(); i++) {
      const value = mdMap.get(i);
      if (value) {
        if (value.type === "section") {
          let section = sections.find((s) => s.uuid === value.uuid);
          if (!section) {
            section = {
              uuid: value.uuid,
              type: "section",
              extra: [],
              questions: [],
            };
            sections.push(section);
          }
          section.extra.push(i);
        } else if (value.type === "question") {
          let question = {
            uuid: value.uuid,
            type: "question",
            extra: [],
            questionDetails: [],
          };
          question.extra.push(i);
          // 将问题直接添加到最近的 section 中
          const lastSection = sections[sections.length - 1];
          if (lastSection) {
            lastSection.questions.push(question);
          }
          questions.push(question);
        } else if (value.type === "questionDetail") {
          let questionDetail = questionDetails.find(
            (d) => d.uuid === value.uuid
          );
          if (!questionDetail) {
            questionDetail = {
              uuid: value.uuid,
              type: "questionDetail",
              extra: [],
            };
            questionDetails.push(questionDetail);
          }
          questionDetail.extra.push(i);
          // 将问题细节添加到最近的 question 中
          const lastQuestion = questions[questions.length - 1];
          if (lastQuestion) {
            lastQuestion.questionDetails.push(questionDetail);
          }
        }
      }
    }

    return sections;
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleLineClick = (event, index) => {
    event.preventDefault();
    event.stopPropagation();

    setMousePosition({ x: event.clientX, y: event.clientY });

    if (event.shiftKey) {
      const startIndex = fixedStartIndex !== null ? fixedStartIndex : index;
      const range = [startIndex, index].sort((a, b) => a - b);
      const newSelectedLines = [];
      for (let i = range[0]; i <= range[1]; i++) {
        newSelectedLines.push(i);
      }
      setSelectedLines(newSelectedLines);
      if (fixedStartIndex === null) {
        setFixedStartIndex(index); // 设置固定的起始位置
      }
    } else if (event.metaKey || event.ctrlKey) {
      setSelectedLines((prev) =>
        prev.includes(index)
          ? prev.filter((line) => line !== index)
          : [...prev, index]
      );
    } else {
      setSelectedLines([index]);
      setAnchorPosition({
        top: event.clientY,
        left: event.clientX,
      });
    }

    if (!event.shiftKey && !event.metaKey && !event.ctrlKey) {
      setAnchorPosition({
        top: event.clientY,
        left: event.clientX,
      });
    }
  };

  const handleKeyUp = (event) => {
    if (
      event.key === "Shift" ||
      event.key === "Meta" ||
      event.key === "Control"
    ) {
      if (selectedLines.length > 1) {
        setAnchorPosition({
          top: mousePosition.y,
          left: mousePosition.x,
        });
      }
    }
  };

  // 重新排序
  const sortAndRenameSections = (sections) => {
    // 根据每个大题的最小行号重新排序和重命名
    sections.sort((a, b) => Math.min(...a.extra) - Math.min(...b.extra));
    return sections.map((section, index) => {
      // 对每个 section 进行排序和重命名
      const sortedQuestions = section.questions
        .sort((q1, q2) => Math.min(...q1.extra) - Math.min(...q2.extra))
        .map((question, questionIndex) => {
          // 对每个 question 进行排序和重命名
          const sortedQuestionDetails = question.questionDetails
            ? question.questionDetails
                .sort((d1, d2) => Math.min(...d1.extra) - Math.min(...d2.extra))
                .map((detail, detailIndex) => ({
                  ...detail,
                  order: detailIndex + 1, // 设置 questionDetail 的 order
                  name: `小题${index + 1}.${questionIndex + 1}.${
                    detailIndex + 1
                  }`, // 更新 name
                }))
            : [];

          return {
            ...question,
            order: questionIndex + 1, // 设置 question 的 order
            name: `标准题${index + 1}.${questionIndex + 1}`, // 更新 name
            questionDetails: sortedQuestionDetails, // 更新 questionDetails
          };
        });

      return {
        ...section,
        order: index + 1, // 设置 section 的 order
        questions: sortedQuestions, // 更新 questions
        name: `大题${index + 1}`, // 更新 name
      };
    });
  };

  const updateMarkdownLines = (sections) => {
    setMarkdownLines((prevLines) =>
      prevLines.map((line, index) => {
        const sectionForLine = sections.find((section) =>
          section.extra.includes(index + 1)
        );

        if (sectionForLine) {
          return {
            ...line,
            backgroundColor: COLORS.SECTION,
            label: sectionForLine.name,
          };
        }

        // 检查是否属于某个 question
        const questionForLine = sections
          .flatMap((section) => section.questions)
          .find((question) => question.extra.includes(index + 1));

        if (questionForLine) {
          return {
            ...line,
            backgroundColor: COLORS.QUESTION,
            label: questionForLine.name, // 更新标签格式
          };
        }

        // 检查是否属于某个 questionDetail
        const questionDetailForLine = sections
          .flatMap((section) =>
            section.questions.flatMap((question) => question.questionDetails)
          )
          .find((detail) => detail.extra.includes(index + 1));

        if (questionDetailForLine) {
          return {
            ...line,
            backgroundColor: COLORS.QUESTION_DETAIL,
            label: questionDetailForLine.name, // 更新标签格式
          };
        }

        return line;
      })
    );
  };

  // const onMarkSection = (selectedLineRange, selectedSectionObject) => {
  //   setExam((prev) => {
  //     let newSections = [...prev.sections];
  //     let updatedSection;
  //     if (selectedSectionObject) {
  //       // 更新现有大题
  //       updatedSection = {
  //         ...selectedSectionObject,
  //         extra: [
  //           ...new Set([...selectedSectionObject.extra, ...selectedLineRange]),
  //         ].sort((a, b) => a - b),
  //       };
  //       const index = newSections.findIndex(
  //         (s) => s.uuid === updatedSection.uuid
  //       );
  //       newSections[index] = updatedSection;
  //     } else {
  //       // 创建新大题
  //       updatedSection = {
  //         uuid: uuidv4(), // 添加 uuid
  //         type: "section", // 添加 type 属性
  //         extra: selectedLineRange,
  //         questions: [],
  //       };

  //       const changedSections = mdMap.insertSection(
  //         selectedLineRange,
  //         updatedSection,
  //         quickLookupMap
  //       );

  //       if (newSections.length === 0) {
  //         newSections = changedSections;
  //       } else {
  //         changedSections.forEach((section) => {
  //           const index = newSections.findIndex((s) => s.uuid === section.uuid);
  //           if (index !== -1) {
  //             newSections[index] = section;
  //           } else {
  //             newSections.push(section);
  //           }
  //         });
  //       }
  //     }

  //     //重新排序
  //     newSections = sortAndRenameSections(newSections);

  //     return {
  //       ...prev,
  //       sections: newSections,
  //     };
  //   });
  // };

  const onMarkSection = (selectedLineRange, selectedSectionObject) => {
    setExam((prev) => {
      let updatedSection = {
        uuid: uuidv4(), // 添加 uuid
        type: "section", // 添加 type 属性
      };
      if (selectedSectionObject) {
        updatedSection = {
          uuid: selectedSectionObject.uuid,
          type: "section",
        };
      }

      mdMap.setMultiLinesWithLock(selectedLineRange, updatedSection);

      let newSections = convertMdMapToExamStructure();
      //重新排序
      newSections = sortAndRenameSections(newSections);

      return {
        ...prev,
        sections: newSections,
      };
    });
  };

  // selectedLines 选中的行， currentSection 行所归属的section
  //   const onMarkQuestion = (selectedLines, currentSection) => {
  //     setExam((prevExam) => {
  //       let newSections = [...prevExam.sections];
  //       // 创建新的标准题对象
  //       const selectedLineNumbers = selectedLines.map((index) => index + 1);
  //       const newQuestion = {
  //         uuid: uuidv4(), // 添加 uuid
  //         type: "question", // 添加 type 属性
  //         extra: selectedLineNumbers, // 将行号加入 question 的 extra 属性
  //         materials: [],
  //       };

  //       const changedQuestions = mdMap.insertQuestion(
  //         selectedLines,
  //         newQuestion,
  //         quickLookupMap
  //       );

  //       // 将新的标准题添加到当前大题
  //       const sectionIndex = newSections.findIndex(
  //         (section) => section.uuid === currentSection.uuid
  //       );
  //       changedQuestions.forEach((question) => {
  //         const index = newSections[sectionIndex].questions.findIndex(
  //           (s) => s.uuid === question.uuid
  //         );
  //         if (index !== -1) {
  //           newSections[sectionIndex].questions[index] = question;
  //         } else {
  //           newSections[sectionIndex].questions.push(question);
  //         }
  //       });

  //       //重新排序
  //       newSections = sortAndRenameSections(newSections);
  //       return { ...prevExam, sections: newSections };
  //     });
  //   };

  const onMarkQuestion = (selectedLines, currentSection) => {
    setExam((prevExam) => {
      const newQuestion = {
        uuid: uuidv4(), // 添加 uuid
        type: "question", // 添加 type 属性
      };

      const selectedLineNumbers = selectedLines.map((index) => index + 1);
      mdMap.setMultiLinesWithLock(selectedLineNumbers, newQuestion);

      let newSections = convertMdMapToExamStructure();

      //重新排序
      newSections = sortAndRenameSections(newSections);
      return { ...prevExam, sections: newSections };
    });
  };

  //   const onMarkQuestionDetail = (
  //     selectedLines,
  //     currentSection,
  //     currentQuestion
  //   ) => {
  //     setExam((prevExam) => {
  //       let newSections = [...prevExam.sections];
  //       const newQuestionDetail = {
  //         uuid: uuidv4(), // 添加 uuid
  //         type: "questionDetail", // 添加 type 属性
  //         extra: selectedLines.map((index) => index + 1),
  //       };

  //       currentQuestion.questionDetails.push(newQuestionDetail);
  //       currentSection.questions[
  //         currentSection.questions.findIndex(
  //           (s) => s.uuid === currentQuestion.uuid
  //         )
  //       ] = currentQuestion;

  //       const index = newSections.findIndex(
  //         (s) => s.uuid === currentSection.uuid
  //       );
  //       newSections[index] = currentSection;

  //       //重新排序
  //       newSections = sortAndRenameSections(newSections);

  //       mdMap.setMultiLinesWithLock(newQuestionDetail.extra, newQuestionDetail);

  //       return { ...prevExam, sections: newSections };
  //     });
  //   };

  const onMarkQuestionDetail = (
    selectedLines,
    currentSection,
    currentQuestion
  ) => {
    setExam((prevExam) => {
      const newQuestionDetail = {
        uuid: uuidv4(), // 添加 uuid
        type: "questionDetail", // 添加 type 属性
      };

      const selectedLineNumbers = selectedLines.map((index) => index + 1);
      mdMap.setMultiLinesWithLock(selectedLineNumbers, newQuestionDetail);

      let newSections = convertMdMapToExamStructure();

      //重新排序
      newSections = sortAndRenameSections(newSections);
      return { ...prevExam, sections: newSections };
    });
  };

  //   const onCancelAnnotation = (lineIndex) => {
  //     setExam((prevExam) => {
  //       let newSections = prevExam.sections
  //         .map((section) => ({
  //           ...section,
  //           extra: section.extra.filter((line) => line !== lineIndex + 1),
  //           questions: section.questions
  //             .map((question) => ({
  //               ...question,
  //               extra: question.extra.filter((line) => line !== lineIndex + 1),
  //               questionDetails: question.questionDetails
  //                 ? question.questionDetails.map((detail) => ({
  //                     ...detail,
  //                     extra: detail.extra.filter(
  //                       (line) => line !== lineIndex + 1
  //                     ),
  //                   }))
  //                 : [],
  //             }))
  //             .filter((question) => question.extra.length > 0),
  //         }))
  //         .filter((section) => section.extra.length > 0);

  //       // 重新排序和重命名大题
  //       //   const updatedSections = newSections
  //       //     .sort((a, b) => Math.min(...a.extra) - Math.min(...b.extra))
  //       //     .map((section, index) => ({
  //       //       ...section,
  //       //       order: index + 1,
  //       //       name: `大题${index + 1}`,
  //       //     }));

  //       // 更新 markdownLines
  //       setMarkdownLines((prevLines) =>
  //         prevLines.map((line, index) => {
  //           if (index === lineIndex) {
  //             return {
  //               content: line.content,
  //               backgroundColor: undefined,
  //               label: undefined,
  //             };
  //           }
  //           return line;
  //         })
  //       );

  //       mdMap.set(lineIndex + 1, null);

  //       //重新排序
  //       newSections = sortAndRenameSections(newSections);

  //       return {
  //         ...prevExam,
  //         sections: newSections,
  //       };
  //     });
  //   };

  const onCancelAnnotation = (selectedLines) => {
    setExam((prevExam) => {
      // 更新 markdownLines
      setMarkdownLines((prevLines) =>
        prevLines.map((line, index) => {
          if (selectedLines.includes(index)) {
            return {
              content: line.content,
              backgroundColor: undefined,
              label: undefined,
            };
          }
          return line;
        })
      );

      const selectedLineNumbers = selectedLines.map((index) => index + 1);
      mdMap.setMultiLinesWithLock(selectedLineNumbers, null);

      let newSections = convertMdMapToExamStructure();

      //重新排序
      newSections = sortAndRenameSections(newSections);

      return {
        ...prevExam,
        sections: newSections,
      };
    });
  };

  const renderMarkdownWithLineNumbers = (extra) => {
    return extra.map((line, index) => {
      const isSelected = selectedLines.includes(index);
      const backgroundColor = isSelected
        ? "#d0e0ff"
        : line.backgroundColor || (index % 2 === 0 ? "#f9f9f9" : "#ffffff");

      return (
        <div
          key={index}
          style={{
            display: "flex",
            alignItems: "center",
            lineHeight: "1.5",
            backgroundColor,
            cursor: "pointer",
          }}
          onMouseDown={(event) => handleLineClick(event, index)}
        >
          <div
            style={{ width: "50px", textAlign: "right", paddingRight: "10px" }}
          >
            {index + 1}
          </div>
          <div style={{ flex: 1 }}>
            {line.label && (
              <span style={{ fontWeight: "bold", marginRight: "10px" }}>
                {line.label}
              </span>
            )}
            <ReactMarkdown
              components={{ p: ({ node, ...props }) => <p {...props} /> }}
              rehypePlugins={[rehypeRaw]}
            >
              {typeof line === "string" ? line : line.content || ""}
            </ReactMarkdown>
          </div>
        </div>
      );
    });
  };

  useEffect(() => {
    const fetchFileContent = async () => {
      const response = await axios.get(`/api/file-corrections/${fileUuid}`);
      const extra = response.data.content
        .split("\n")
        .map((content) => ({ content }));
      setMarkdownLines(extra);
      if (response.data.exam) {
        setExam(response.data.exam);
      }
      const newMdMap = new MdMap(extra.length);
      setMdMap(newMdMap);
    };
    fetchFileContent();
  }, [fileUuid]);

  useEffect(() => {
    updateMarkdownLines(exam.sections);
  }, [exam]);

  useEffect(() => {
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [selectedLines, mousePosition]);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Box
          display="flex"
          alignItems="center"
          style={{ marginBottom: "10px" }}
        >
          <Button
            onClick={handleEditToggle}
            variant="contained"
            style={{
              backgroundColor: isEditing ? "#3f51b5" : "#f50057",
              color: "#fff",
            }}
          >
            {isEditing ? "保存" : "编辑"}
          </Button>
        </Box>
        <Box display="flex" flexDirection="column" width="100%">
          {isEditing ? (
            <TextField
              label="编辑Markdown"
              value={markdownLines.map((line) => line.content || "").join("\n")}
              onChange={(e) =>
                setMarkdownLines(
                  e.target.value.split("\n").map((content) => ({ content }))
                )
              }
              fullWidth
              multiline
              rows={10}
              margin="normal"
            />
          ) : (
            <div style={{ width: "100%" }}>
              {renderMarkdownWithLineNumbers(markdownLines)}
            </div>
          )}
        </Box>
        <MarkdownAnnotator
          selectedLines={selectedLines}
          exam={exam}
          updateExam={setExam}
          anchorPosition={anchorPosition}
          onClose={() => setAnchorPosition(null)}
          onMarkSection={onMarkSection}
          onMarkQuestion={onMarkQuestion}
          onMarkQuestionDetail={onMarkQuestionDetail}
          onCancelAnnotation={onCancelAnnotation}
          colors={COLORS}
          markdownLines={markdownLines}
          setSelectedLines={setSelectedLines}
          mdMap={mdMap}
        />
      </Grid>
    </Grid>
  );
};

export default FileCorrectionEditor;
