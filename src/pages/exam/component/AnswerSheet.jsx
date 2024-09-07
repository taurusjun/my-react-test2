import React from "react";
import { Typography, Box, Grid, Paper } from "@mui/material";

const AnswerSheet = ({ exam }) => {
  return (
    <Paper elevation={0} className="answer-sheet">
      <Box p={3}>
        <Typography variant="h4" align="center" gutterBottom>
          答题纸
        </Typography>
        <Typography variant="h5" align="center" gutterBottom>
          {exam.name}
        </Typography>
        <Grid container spacing={2} mt={2}>
          <Grid item xs={6}>
            <Typography>姓名：________________</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>考号：________________</Typography>
          </Grid>
        </Grid>
        {exam.sections.map((section, sectionIndex) => (
          <Box
            key={section.uuid}
            mt={4}
            className={sectionIndex > 0 ? "page-break" : ""}
          >
            <Typography variant="h6" gutterBottom>
              {section.name}
            </Typography>
            <Grid container spacing={1}>
              {section.questions.flatMap((question, questionIndex) =>
                question.questionDetails.map((detail, detailIndex) => {
                  const questionNumber = `${sectionIndex + 1}-${
                    questionIndex + 1
                  }-${detailIndex + 1}`;
                  return (
                    <Grid item xs={3} key={`${questionIndex}-${detailIndex}`}>
                      <Box
                        border={1}
                        borderColor="grey.300"
                        p={1}
                        height={60}
                        display="flex"
                        flexDirection="column"
                      >
                        <Typography variant="caption">
                          {questionNumber}
                        </Typography>
                        <Box
                          flex={1}
                          border={1}
                          borderColor="grey.200"
                          mt={1}
                        />
                      </Box>
                    </Grid>
                  );
                })
              )}
            </Grid>
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

export default AnswerSheet;
