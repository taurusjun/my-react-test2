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
import { ITEM_TYPE_QUESTION } from "./components/Constants";
import { SingleSelectionQuestion } from "./components/SingleSelectionQuestion";

export const ExamDetail = () => {
  const params = useParams();
  const { uuid } = params;

  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState({});
  const [question, setQuestion] = useState(null);
  const [curruntQuestionUUID, setCurruntQuestionUUID] = useState("");
  const [curruntQuestionIndex, setCurruntQuestionIndex] = useState(0);
  const [currentAns, setCurrentAns] = useState({});
  const [error, setError] = React.useState(false);
  const [helperText, setHelperText] = React.useState("");

  const [sectionName, setSectionName] = useState("");
  const [content, setContent] = useState("");
  const [options, setOptions] = useState({});
  const [answersMap, setAnswersMap] = useState(new Map());

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
      setCurrentAns(answersMap.get(questionUUID));
    } else {
      setCurrentAns({});
    }
  };

  useEffect(() => {
    asyncFetchExamDetail(uuid);
  }, [uuid]);

  if (loading) {
    return <div>Loading</div>;
  }

  //////////////////// 将exam section中的数据进行转换 ///////////////////////
  let gQIndex = 0;
  const questionUUIDArray = [];
  // map: question_uuid -> section_uuid
  const questionSectionMap = {};
  // map: section_uuid -> Array[question_uuid]
  const sectionQuestionListMap = {};
  exam.sections.forEach((section) => {
    section.question_list.forEach((question) => {
      questionUUIDArray[gQIndex++] = question.question_uuid;
      questionSectionMap[question.question_uuid] = section;
    });
    const questionUuids = section.question_list.map(
      (question) => question.question_uuid
    );
    sectionQuestionListMap[section.uuid] = questionUuids;
  });

  ////////////////////////////// 各种handler //////////////////////////////
  //跟TreeView联动
  const handleTreeViewSelectedItemsChange = (item) => {
    console.log(item);
    console.log(item.type);
    if (item.type === ITEM_TYPE_QUESTION) {
      //   console.log(item.index);
      //   console.log(questionArray[item.index]);
      setSectionName(item.sectionName);
      asyncFetchQuestion(item.id, item.index);
    }
  };

  //答案选中时
  const handleAnswerChange = (uuid, quuid, selectedAnswer) => {
    // setCurrentAns(selectedAnswer);
    saveAnswer(uuid, quuid, selectedAnswer, curruntQuestionIndex);
  };

  function saveAnswer(questionUUID, quuid, ans, questionIndex) {
    var uKey = questionUUID;
    var uAns = ans;
    var uIndex = questionIndex;
    var mp = answersMap.get(uKey);
    if (mp == null) {
      mp = {};
    }
    mp[quuid] = uAns;
    setAnswersMap((answersMap) => new Map(answersMap.set(uKey, mp)));
  }

  /////// go to next
  const handleNextQuestion = (event) => {
    event.preventDefault();
    console.log(currentAns);
    if (currentAns == null) {
      setHelperText("还未选择答案");
      setError(true);
    } else {
      gotoNextQuestion();
    }
  };

  const gotoNextQuestion = () => {
    var nextQuestionIndex = curruntQuestionIndex + 1;
    if (questionUUIDArray.length > nextQuestionIndex) {
      var nextQuestionUUID = questionUUIDArray[nextQuestionIndex];
      //TODO: add cache
      asyncFetchQuestion(nextQuestionUUID, nextQuestionIndex);
    }
  };

  /////// submit

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

  return (
    <Stack direction="row" spacing={2} justifyContent="flex-start">
      <ExamNav
        exam={exam}
        curruntQuestionUUID={curruntQuestionUUID}
        handleSelectedItemsChange={handleTreeViewSelectedItemsChange}
      />
      <Box>
        {question !== null ? (
          <Paper elevation={5} sx={{ minHeight: 300, mr: 20 }}>
            <form onSubmit={handleNextQuestion}>
              <FormControl sx={{ m: 3 }} error={error} variant="standard">
                <Typography
                  variant="h6"
                  sx={{ textDecoration: "underline", mb: 2 }}
                >
                  {sectionName}
                </Typography>
                <SingleSelectionQuestion
                  question={question}
                  savedAnswer={currentAns}
                  handleAnswerChange={handleAnswerChange}
                />
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
