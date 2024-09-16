import React from "react";
import { Paper, styled } from "@mui/material";
import ExamContent from "../../components/ExamContent";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2, 0),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[3],
}));

const ExamPreview = ({ exam }) => {
  return (
    <StyledPaper>
      <ExamContent exam={exam} showHeader={false} />
    </StyledPaper>
  );
};

export default ExamPreview;
