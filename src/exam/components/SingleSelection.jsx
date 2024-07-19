import { FormControlLabel, Radio, RadioGroup, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";

export const SingleSelection = ({
  qDetail,
  qAnswer,
  handleSelectionChange,
}) => {
  const [questionDetail, setQuestionDetail] = useState(qDetail);
  const [answer, setAnswer] = useState(qAnswer);

  useEffect(() => {
    setQuestionDetail(qDetail);
    setAnswer(qAnswer);
  }, [qDetail, qAnswer]);

  const innerHandleRadioChange = (event) => {
    var currentAns = event.target.value;
    var quuid = event.target.name;
    setAnswer({ ...answer, [quuid]: currentAns });
    handleSelectionChange(quuid, currentAns);
  };

  return (
    <>
      <Typography variant="span" sx={{ mb: 2, textIndent: 16 }}>
        {questionDetail.question}
      </Typography>
      <RadioGroup
        aria-labelledby="demo-error-radios"
        name={questionDetail.uuid}
        value={answer[questionDetail.uuid] ?? ""}
        onChange={innerHandleRadioChange}
      >
        {Object.keys(questionDetail.option_map).map((ky) => (
          <FormControlLabel
            key={`${questionDetail.uuid}_${ky}`}
            value={questionDetail.option_map[ky]}
            control={<Radio />}
            label={
              <Typography variant="body1" sx={{ fontSize: 15 }}>
                {questionDetail.option_map[ky]}
              </Typography>
            }
          />
        ))}
      </RadioGroup>
    </>
  );
};
