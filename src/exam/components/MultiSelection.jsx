import {
  Checkbox,
  FormControlLabel,
  FormGroup,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { json } from "react-router";

export const MultiSelection = ({ qDetail, qAnswer, handleSelectionChange }) => {
  const [questionDetail, setQuestionDetail] = useState(qDetail);
  const [answer, setAnswer] = useState(qAnswer);
  const [checkedMap, setCheckedMap] = useState(new Map());

  useEffect(() => {
    setQuestionDetail(qDetail);
    setAnswer(qAnswer);
    // update checked Map
    var quuid = qDetail.uuid;
    var inAns = qAnswer[quuid];
    if (inAns != null) {
      var ansArray = JSON.parse(inAns);
      const output = {};
      Object.keys(qDetail.option_map).forEach((key) => {
        output[key] = ansArray.includes(qDetail.option_map[key]);
      });
      setCheckedMap((checkedMap) => new Map(checkedMap.set(quuid, output)));
    }
    //
  }, [qDetail, qAnswer]);

  const innerHandleRadioChange = (event) => {
    // var currentAns = event.target.value;
    var checkBoxName = event.target.name;
    var [quuid, opt] = checkBoxName.split("|");
    // update checked Map
    var mp = checkedMap.get(quuid);
    if (mp == null) {
      mp = {};
    }
    mp[opt] = event.target.checked;
    setCheckedMap((checkedMap) => new Map(checkedMap.set(quuid, mp)));
    //
    // 找到值为 true 的键
    const trueAns = Object.keys(mp).filter((key) => mp[key]);
    const ansValArray = trueAns.map((key) => questionDetail.option_map[key]);
    const jsonAns = JSON.stringify(ansValArray);

    setAnswer({ ...answer, [quuid]: jsonAns });
    handleSelectionChange(quuid, jsonAns);
  };

  return (
    <>
      <Typography variant="span" sx={{ mb: 2, textIndent: 16 }}>
        {questionDetail.question}
      </Typography>
      {/* <RadioGroup
        aria-labelledby="demo-error-radios"
        name={questionDetail.uuid}
        value={answer[questionDetail.uuid] ?? ""}
        onChange={innerHandleRadioChange}
      > */}
      <FormGroup
        name={questionDetail.uuid}
        value={answer[questionDetail.uuid] ?? ""}
        // onChange={innerHandleRadioChange}
      >
        {Object.keys(questionDetail.option_map).map((ky) => (
          <FormControlLabel
            key={`${questionDetail.uuid}_${ky}`}
            value={questionDetail.option_map[ky]}
            control={
              <Checkbox
                name={`${questionDetail.uuid}|${ky}`}
                checked={
                  checkedMap.get(questionDetail.uuid)
                    ? checkedMap.get(questionDetail.uuid)[ky]
                      ? checkedMap.get(questionDetail.uuid)[ky]
                      : false
                    : false
                }
                onChange={innerHandleRadioChange}
              />
            }
            label={
              <Typography variant="body1" sx={{ fontSize: 15 }}>
                {questionDetail.option_map[ky]}
              </Typography>
            }
          />
        ))}
      </FormGroup>
    </>
  );
};
