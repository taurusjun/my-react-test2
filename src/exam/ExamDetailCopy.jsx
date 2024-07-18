import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from "@mui/material";
import { RichTreeView, useTreeViewApiRef } from "@mui/x-tree-view";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { TreeItem, treeItemClasses } from "@mui/x-tree-view/TreeItem";
import { styled, alpha } from "@mui/material/styles";
import { ExamNav } from "./components/ExamNav";

export const ExamDetailCopy = () => {
  const params = useParams();
  const { uuid } = params;

  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState({});
  const [question, setQuestion] = useState({});
  const [curruntQuestionUUID, setCurruntQuestionUUID] = useState("");
  const [curruntQuestionIndex, setCurruntQuestionIndex] = useState(0);
  const [currentAns, setCurrentAns] = useState(null);
  const [error, setError] = React.useState(false);
  const [helperText, setHelperText] = React.useState("");

  const [sectionName, setSectionName] = useState("");
  const [content, setContent] = useState("");
  const [options, setOptions] = useState({});
  const [answersMap, setAnswersMap] = useState(new Map());

  const treeViewApiRef = useTreeViewApiRef();

  const asyncFetchExamDetail = async (examUUID) => {
    const data = await axios.post("/api/v1/exam/view", {
      uuid: examUUID,
    });
    setLoading(false);
    setExam(data.data.data);
  };

  const asyncFetchQuestion = async (questionUUID, questionIndex) => {
    const fqResponse = await axios.post("/api/v1/question/view", {
      uuid: questionUUID,
    });
    setQuestion(fqResponse.data.data);
    setCurruntQuestionIndex(questionIndex);
    if (questionSectionMap[questionUUID] != null) {
      setSectionName(questionSectionMap[questionUUID].name);
    } else {
      setSectionName("");
    }
    if (answersMap.get(questionUUID) != null) {
      setCurrentAns(answersMap.get(questionUUID).answer);
    } else {
      setCurrentAns(null);
    }
  };

  //handle question
  const handleQuestion = (question) => {
    if (question.mode === "Single") {
      handleSingleQuestion(question);
    }
  };

  const handleSingleQuestion = (question) => {
    if (
      question.QuestionDetails == null ||
      question.QuestionDetails.length == 0
    ) {
      return;
    }
    var qDetail = question.QuestionDetails[0];
    setContent(qDetail.question);
    setOptions(qDetail.option_map);
    setCurruntQuestionUUID(question.uuid);
  };

  useEffect(() => {
    asyncFetchExamDetail(uuid);
  }, [uuid]);

  useEffect(() => {
    handleQuestion(question);
  }, [question]);

  if (loading) {
    return <div>Loading</div>;
  }

  //////////////////// 将exam section中的数据进行转换 ///////////////////////
  const item_type_section = "section";
  const item_type_question = "question";

  // tree data
  let gQIndex = 0;
  const sectionUUIDArray = [];
  const questionUUIDArray = [];
  const treeViewData = exam.sections.map((section, index) => {
    sectionUUIDArray.push(section.uuid);
    return {
      id: section.uuid,
      type: item_type_section,
      name: section.name,
      label: `[${index + 1}]${section.name}`,
      children: section.question_list.map((question, qIndex) => {
        questionUUIDArray[gQIndex] = question.question_uuid;
        return {
          id: question.question_uuid,
          type: item_type_question,
          index: gQIndex++,
          sectionName: section.name,
          label: `[${index + 1}-${qIndex + 1}]`,
        };
      }),
    };
  });

  //   treeViewApiRef.current.selectItem({
  //     event: null,
  //     itemId: questionUUIDArray[0],
  //     keepExistingSelection: false,
  //     shouldBeSelected: true,
  //   });

  // map: question_uuid -> section_uuid
  const questionSectionMap = {};
  exam.sections.forEach((section) => {
    section.question_list.forEach((question) => {
      questionSectionMap[question.question_uuid] = section;
    });
  });

  // map: section_uuid -> Array[question_uuid]
  const sectionQuestionListMap = {};
  exam.sections.forEach((section) => {
    const questionUuids = section.question_list.map(
      (question) => question.question_uuid
    );
    sectionQuestionListMap[section.uuid] = questionUuids;
  });
  ////////////////////////////////////////////////////////////////////////

  ////////////////////////////// 各种handler //////////////////////////////
  const handleSelectedItemsChange = (event, id) => {
    console.log(id);
    var item = treeViewApiRef.current.getItem(id);
    console.log(item.type);
    if (item.type === item_type_question) {
      //   console.log(item.index);
      //   console.log(questionArray[item.index]);
      setSectionName(item.sectionName);
      asyncFetchQuestion(item.id, item.index);
    }
  };

  const handleRadioChange = (event) => {
    setCurrentAns(event.target.value);
    setHelperText(" ");
    setError(false);
    saveAnswer(curruntQuestionUUID, event.target.value, curruntQuestionIndex);
  };

  const questionUUIDAnsMap = new Map();
  const handleNextQuestion = (event) => {
    event.preventDefault();
    console.log(currentAns);
    if (currentAns == null) {
      setHelperText("还未选择答案");
      setError(true);
    } else {
      console.log(curruntQuestionIndex);
      console.log(curruntQuestionUUID);
      //   saveAnswer(curruntQuestionUUID, currentAns, curruntQuestionIndex);

      gotoNextQuestion();
    }
  };

  function saveAnswer(questionUUID, ans, questionIndex) {
    var uKey = questionUUID;
    var uAns = ans;
    var uIndex = questionIndex;
    // console.log(answersMap);
    setAnswersMap(
      (answersMap) =>
        new Map(
          answersMap.set(uKey, {
            index: uIndex,
            answer: uAns,
          })
        )
    );
  }

  const gotoNextQuestion = () => {
    var nextQuestionIndex = curruntQuestionIndex + 1;
    if (questionUUIDArray.length > nextQuestionIndex) {
      var nextQuestionUUID = questionUUIDArray[nextQuestionIndex];
      //TODO: add cache
      asyncFetchQuestion(nextQuestionUUID, nextQuestionIndex);
    }
  };

  const handleSubmitExam = (event) => {
    event.preventDefault();
    console.log("submit!");
    console.log(answersMap);
    asyncSubmit();
  };

  const asyncSubmit = async () => {
    const listItems = Array.from(answersMap).map(([ky, val]) => [
      { [ky]: val.answer },
    ]);
    const fqResponse = await axios.post("/api/v1/exam/submit", {
      examUUID: exam.uuid,
      answerList: listItems,
    });
  };

  ////////////////////////////////////////////////////////////////////////

  const CustomTreeItem = styled(TreeItem)(({ theme }) => ({
    color:
      theme.palette.mode === "light"
        ? theme.palette.grey[800]
        : theme.palette.grey[200],
    [`& .${treeItemClasses.content}`]: {
      borderRadius: theme.spacing(0.5),
      padding: theme.spacing(0.5, 1),
      margin: theme.spacing(0.2, 0),
      [`& .${treeItemClasses.label}`]: {
        fontSize: 15,
        fontWeight: 500,
      },
    },
    [`& .${treeItemClasses.iconContainer}`]: {
      borderRadius: "50%",
      backgroundColor:
        theme.palette.mode === "light"
          ? alpha(theme.palette.primary.main, 0.25)
          : theme.palette.primary.dark,
      color:
        theme.palette.mode === "dark" && theme.palette.primary.contrastText,
      padding: theme.spacing(0, 1.2),
    },
    [`& .${treeItemClasses.groupTransition}`]: {
      marginLeft: 15,
      paddingLeft: 18,
      borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`,
    },
    [`& .${treeItemClasses.selected}`]: {
      color: "red",
    },
    // color:
    //   treeItemClasses.content == { curruntQuestionUUID } ? "yellow" : "blue",
  }));

  return (
    <Stack direction="row" spacing={2} justifyContent="flex-start">
      <ExamNav
        exam={exam}
        curruntQuestionUUID={curruntQuestionUUID}
        handleSelectedItemsChange={handleSelectedItemsChange}
      />
      {/* <Box sx={{ minWidth: 250 }}>
        <RichTreeView
          sx={{ m: 3 }}
          apiRef={treeViewApiRef}
          defaultExpandedItems={sectionUUIDArray}
          slots={{ item: CustomTreeItem }}
          selectedItems={curruntQuestionUUID}
          items={treeViewData}
          onSelectedItemsChange={handleSelectedItemsChange}
        />
      </Box> */}
      <Box>
        {content !== "" ? (
          <Paper elevation={5} sx={{ minHeight: 300, mr: 20 }}>
            <form onSubmit={handleNextQuestion}>
              <FormControl sx={{ m: 3 }} error={error} variant="standard">
                <Typography
                  variant="h6"
                  sx={{ textDecoration: "underline", mb: 2 }}
                >
                  {sectionName}
                </Typography>
                <Typography variant="span" sx={{ mb: 2, textIndent: 16 }}>
                  {content}
                </Typography>
                {/* <FormLabel id="demo-error-radios">Pop quiz: MUI is...</FormLabel> */}
                <RadioGroup
                  aria-labelledby="demo-error-radios"
                  name="quiz"
                  value={currentAns}
                  onChange={handleRadioChange}
                >
                  {Object.keys(options).map((key) => (
                    <FormControlLabel
                      key={key}
                      value={options[key]}
                      control={<Radio />}
                      label={
                        <Typography variant="body1" sx={{ fontSize: 15 }}>
                          {options[key]}
                        </Typography>
                      }
                      extraField="999"
                    />
                  ))}
                </RadioGroup>
                <FormHelperText>{helperText}</FormHelperText>
                {questionUUIDArray.length - 1 > curruntQuestionIndex ? (
                  <Box flex={4}>
                    <Button
                      sx={{ mt: 1, mr: 20, width: 200 }}
                      type="submit"
                      variant="contained"
                    >
                      下一题
                    </Button>
                    <Button
                      sx={{ mt: 1, mr: 1, width: 100 }}
                      variant="outlined"
                      onClick={handleSubmitExam}
                    >
                      直接交卷
                    </Button>
                  </Box>
                ) : (
                  <Button
                    sx={{ mt: 1, mr: 1 }}
                    variant="contained"
                    onClick={handleSubmitExam}
                  >
                    交卷
                  </Button>
                )}
              </FormControl>
            </form>
          </Paper>
        ) : (
          <Paper
            elevation={5}
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 300,
              minWidth: 400,
            }}
          >
            <Typography textAlign="center" variant="h6">
              等待试题载入...
            </Typography>
          </Paper>
        )}
      </Box>
    </Stack>
  );
};