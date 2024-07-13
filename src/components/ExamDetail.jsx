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

  const [state, setState] = useState([]);
  useEffect(() => {
    const asyncCallback = async () => {
      const data = await axios.post("http://127.0.0.1:8001/v1/exam/view", {
        uuid,
      });
      setState(data);
    };

    asyncCallback();
  }, [uuid]);

  if (state.status != 200) {
    return <div>Loading</div>;
  }

  const { data } = state;
  const examDetail = data.data;
  console.log(examDetail.name);
  const { name, description, sections } = examDetail;

  ////
  const convertJsonToMUITreeViewData = (sections) => {
    return sections.map((section, index) => ({
      id: section.uuid,
      label: `[${index + 1}]${section.name}`,
      children: section.question_list.map((question, qIndex) => ({
        id: question.question_uuid,
        label: `[${index + 1}-${qIndex + 1}]`,
      })),
    }));
  };

  const MUI_X_PRODUCTS = convertJsonToMUITreeViewData(sections);

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

  const handleSelectedItemsChange = (event, id) => {
    console.log(id);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // if (value === "best") {
    //   setHelperText("You got it!");
    //   setError(false);
    // } else if (value === "worst") {
    //   setHelperText("Sorry, wrong answer!");
    //   setError(true);
    // } else {
    //   setHelperText("Please select an option.");
    //   setError(true);
    // }
  };

  const questionContent =
    "A叠放在物体B上，B置于光滑水平面上。A，B质量分别为mA=6kg，mB=2kg，A，B之间的动摩擦因数μ=0.2，开始时F=10N，此后逐渐增加，在增大到45N的过程中，则 [ ]";

  return (
    <>
      <Box sx={{ minWidth: 250 }}>
        <RichTreeView
          defaultExpandedItems={["272722ad-4421-4869-a325-0db2baefd949"]}
          slots={{ item: CustomTreeItem }}
          items={MUI_X_PRODUCTS}
          onSelectedItemsChange={handleSelectedItemsChange}
        />
      </Box>
      <Box>
        <form onSubmit={handleSubmit}>
          {/* <FormControl sx={{ m: 3 }} error={error} variant="standard"> */}
          <FormControl sx={{ m: 3 }} variant="standard">
            <Typography variant="h6">单项选择</Typography>
            <Typography variant="span">{questionContent}</Typography>
            {/* <FormLabel id="demo-error-radios">Pop quiz: MUI is...</FormLabel> */}
            <RadioGroup
              aria-labelledby="demo-error-radios"
              name="quiz"
              //   value={value}
              //   onChange={handleRadioChange}
            >
              <FormControlLabel
                value="A"
                control={<Radio />}
                label="A．当拉力F＜12N时，两物体均保持静止状态"
              />
              <FormControlLabel
                value="B"
                control={<Radio />}
                label="B．两物体开始没有相对运动，当拉力超过12N时，开始相对滑动"
              />
              <FormControlLabel
                value="C"
                control={<Radio />}
                label="C．两物体间从受力开始就有相对运动"
              />
              <FormControlLabel
                value="D"
                control={<Radio />}
                label="D．两物体间始终没有相对运动"
              />
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

  return <div>ExamDetail</div>;
};
