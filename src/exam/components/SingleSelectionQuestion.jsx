import { FormControlLabel, Radio, RadioGroup, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";

export const SingleSelectionQuestion = ({
  question,
  savedAnswer,
  handleAnswerChange,
}) => {
  const [answer, setAnswer] = useState(savedAnswer);
  const [uuid, setUuid] = useState(null);
  const [questionDetails, setQuestionDetails] = useState([]);

  ///////Notice：[踩坑记录] 当两次传入的options有选项不变的时候，savedAnswer从A变成null，RadioGroup的value不会变化
  ////// 猜即一张考卷中，如果存在2题的4选项中存在一摸一样的情况，即第1题C选项与第2题的C选项完全一样，如果第1题选了C，到第2题会在页面上默认选中C
  ////// 猜想同一张考卷中，不存在选项一摸一样的情况，先不处理
  ////// 可能的解法：使用uuid_key作为FormControlLabel的value

  useEffect(() => {
    setAnswer(savedAnswer);
    if (
      question.QuestionDetails == null ||
      question.QuestionDetails.length == 0
    ) {
      console.log("invalid question: " + question);
      return;
    }
    setQuestionDetails(question.QuestionDetails);
    setUuid(question.uuid);
  }, [savedAnswer, question]);

  //答案选中时
  const innerHandleRadioChange = (event) => {
    var currentAns = event.target.value;
    var quuid = event.target.name;
    setAnswer({ ...answer, [quuid]: currentAns });
    handleAnswerChange(uuid, quuid, currentAns);
  };

  return (
    <>
      {questionDetails.map((qDetail) => (
        <div key={qDetail.uuid}>
          <Typography variant="span" sx={{ mb: 2, textIndent: 16 }}>
            {qDetail.question}
          </Typography>
          <RadioGroup
            aria-labelledby="demo-error-radios"
            name={qDetail.uuid}
            value={answer[qDetail.uuid] ?? ""}
            onChange={innerHandleRadioChange}
          >
            {Object.keys(qDetail.option_map).map((ky) => (
              <FormControlLabel
                key={`${qDetail.uuid}_${ky}`}
                value={qDetail.option_map[ky]}
                control={<Radio />}
                label={
                  <Typography variant="body1" sx={{ fontSize: 15 }}>
                    {qDetail.option_map[ky]}
                  </Typography>
                }
              />
            ))}
          </RadioGroup>
        </div>
      ))}
    </>
  );
};
