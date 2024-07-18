import { alpha, Box, styled } from "@mui/material";
import {
  RichTreeView,
  TreeItem,
  treeItemClasses,
  useTreeViewApiRef,
} from "@mui/x-tree-view";
import React from "react";
import { ITEM_TYPE_QUESTION, ITEM_TYPE_SECTION } from "./Constants";

export const ExamNav = ({
  exam,
  curruntQuestionUUID,
  handleSelectedItemsChange,
}) => {
  const treeViewApiRef = useTreeViewApiRef();

  // tree data
  let gQIndex = 0;
  const sectionUUIDArray = [];
  const questionUUIDArray = [];
  const treeViewData = exam.sections.map((section, index) => {
    sectionUUIDArray.push(section.uuid);
    return {
      id: section.uuid,
      type: ITEM_TYPE_SECTION,
      name: section.name,
      label: `[${index + 1}]${section.name}`,
      children: section.question_list.map((question, qIndex) => {
        questionUUIDArray[gQIndex] = question.question_uuid;
        return {
          id: question.question_uuid,
          type: ITEM_TYPE_QUESTION,
          index: gQIndex++,
          sectionName: section.name,
          label: `[${index + 1}-${qIndex + 1}]`,
        };
      }),
    };
  });

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

  const innerHandleSelectedItemsChange = (event, id) => {
    console.log(id);
    var item = treeViewApiRef.current.getItem(id);
    console.log(item.type);
    handleSelectedItemsChange(item);
  };

  return (
    <>
      <Box sx={{ minWidth: 250 }}>
        <RichTreeView
          sx={{ m: 3 }}
          apiRef={treeViewApiRef}
          defaultExpandedItems={sectionUUIDArray}
          slots={{ item: CustomTreeItem }}
          selectedItems={curruntQuestionUUID}
          items={treeViewData}
          onSelectedItemsChange={innerHandleSelectedItemsChange}
        />
      </Box>
    </>
  );
};
