import {
  Box,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import { RichTreeView } from "@mui/x-tree-view";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { TreeItem, treeItemClasses } from "@mui/x-tree-view/TreeItem";
import { styled, alpha } from "@mui/material/styles";

export const ExamDetail = () => {
  const params = useParams();
  const { uuid } = params;

  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState({});
  const [question, setQuestion] = useState({});
  const [content, setContent] = useState("");
  const [options, setOptions] = useState({});

  const asyncFetchExamDetail = async (examUUID) => {
    const data = await axios.post("/api/v1/exam/view", {
      uuid: examUUID,
    });
    setLoading(false);
    setExam(data.data.data);
  };

  const asyncFetchQuestion = async (questionUUID) => {
    const fqResponse = await axios.post("/api/v1/question/view", {
      uuid: questionUUID,
    });
    setQuestion(fqResponse.data.data);
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
  // tree data
  const treeViewData = exam.sections.map((section, index) => ({
    id: section.uuid,
    label: `[${index + 1}]${section.name}`,
    children: section.question_list.map((question, qIndex) => ({
      id: question.question_uuid,
      label: `[${index + 1}-${qIndex + 1}]`,
    })),
  }));

  // map: question_uuid -> section_uuid
  const questionSectionMap = {};
  exam.sections.forEach((section) => {
    section.question_list.forEach((question) => {
      questionSectionMap[question.question_uuid] = section.uuid;
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
  const isQuestionUUID = (selected_uuid) => {
    return questionSectionMap[selected_uuid] == null ? false : true;
  };

  const handleSelectedItemsChange = (event, id) => {
    console.log(id);
    if (isQuestionUUID(id)) {
      asyncFetchQuestion(id);
      console.log(question);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
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
        fontSize: "0.8rem",
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
  }));

  return (
    <>
      <Box sx={{ minWidth: 250 }}>
        <RichTreeView
          defaultExpandedItems={["272722ad-4421-4869-a325-0db2baefd949"]}
          slots={{ item: CustomTreeItem }}
          //   items={uiTreeData}
          items={treeViewData}
          onSelectedItemsChange={handleSelectedItemsChange}
        />
      </Box>
      <Box>
        <form onSubmit={handleSubmit}>
          {/* <FormControl sx={{ m: 3 }} error={error} variant="standard"> */}
          <FormControl sx={{ m: 3 }} variant="standard">
            <Typography variant="h6">单项选择</Typography>
            <Typography variant="span">{content}</Typography>
            {/* <FormLabel id="demo-error-radios">Pop quiz: MUI is...</FormLabel> */}
            <RadioGroup
              aria-labelledby="demo-error-radios"
              name="quiz"
              //   value={value}
              //   onChange={handleRadioChange}
            >
              {Object.keys(options).map((key) => (
                <FormControlLabel
                  key={key}
                  value={key}
                  control={<Radio />}
                  label={options[key]}
                />
              ))}
            </RadioGroup>
            {/* <FormHelperText>{helperText}</FormHelperText>
            <Button sx={{ mt: 1, mr: 1 }} type="submit" variant="outlined">
              Check Answer
            </Button> */}
          </FormControl>
        </form>
      </Box>
    </>
  );
};
