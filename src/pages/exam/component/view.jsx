import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Typography,
  Box,
  CircularProgress,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  Grid,
  Chip,
  Button,
  styled,
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import CommonLayout from "../../../layouts/CommonLayout";
import { getBreadcrumbPaths } from "../../../config/breadcrumbPaths";
import CommonBreadcrumbs from "../../../components/CommonBreadcrumbs";
import "../../../styles/print.css";
import AnswerSheet from "./AnswerSheet";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2, 0),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[3],
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(2),
  color: theme.palette.primary.main,
}));

const QuestionBox = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
}));

const ViewExam = () => {
  const { uuid } = useParams();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const response = await axios.get(`/api/examview/${uuid}`);
        setExam(response.data);
      } catch (error) {
        console.error("获取考试数据失败", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [uuid]);

  const renderQuestionOptions = (rows) => {
    return (
      <List dense>
        {rows.map((row, index) => (
          <ListItem key={index}>
            <ListItemText
              primary={`${String.fromCharCode(65 + index)}. ${row.value}`}
              secondary={
                row.image && (
                  <img
                    src={row.image}
                    alt={`选项 ${String.fromCharCode(65 + index)}`}
                    style={{ maxWidth: "100%", marginTop: "8px" }}
                  />
                )
              }
            />
          </ListItem>
        ))}
      </List>
    );
  };

  const handlePrintExam = () => {
    const printContent = document.getElementById("printable-content");
    const printWindow = window.open("", "_blank");
    printWindow.document.write("<html><head><title>打印试卷</title>");
    printWindow.document.write(
      '<link rel="stylesheet" type="text/css" href="/path/to/your/print.css">'
    );
    printWindow.document.write("</head><body>");
    printWindow.document.write(printContent.innerHTML);
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.onafterprint = () => printWindow.close();
  };

  const handlePrintAnswerSheet = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write("<html><head><title>答题纸</title>");
    printWindow.document.write(
      '<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />'
    );
    printWindow.document.write(
      '<link rel="stylesheet" type="text/css" href="/path/to/your/print.css">'
    );
    printWindow.document.write(
      '<style>body { font-family: "Roboto", sans-serif; }</style>'
    );
    printWindow.document.write("</head><body>");
    printWindow.document.write('<div id="print-root"></div>');
    printWindow.document.write("</body></html>");
    printWindow.document.close();

    const root = ReactDOM.createRoot(
      printWindow.document.getElementById("print-root")
    );
    root.render(<AnswerSheet uuid={uuid} />);

    printWindow.onload = () => {
      printWindow.print();
      printWindow.onafterprint = () => {
        printWindow.close();
      };
    };
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!exam) {
    return <Typography>未找到考试信息</Typography>;
  }

  const breadcrumbPaths = getBreadcrumbPaths().examView;

  return (
    <CommonLayout
      currentPage="考卷详情"
      maxWidth="xl"
      showBreadcrumbs={true}
      BreadcrumbsComponent={() => <CommonBreadcrumbs paths={breadcrumbPaths} />}
    >
      <StyledPaper>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
          className="no-print"
        >
          <Box>
            <Button
              variant="contained"
              startIcon={<PrintIcon />}
              onClick={handlePrintExam}
              sx={{ mr: 1 }}
            >
              打印试卷
            </Button>
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={handlePrintAnswerSheet}
            >
              打印答题纸
            </Button>
          </Box>
        </Box>

        <div id="printable-content">
          <Typography variant="h4" gutterBottom>
            考试详情
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography>
                <strong>名称:</strong> {exam.name}
              </Typography>
              <Typography>
                <strong>科目:</strong> {exam.category}
              </Typography>
              <Typography>
                <strong>年级:</strong> {exam.gradeInfo.school}{" "}
                {exam.gradeInfo.grade}
              </Typography>
              <Typography>
                <strong>创建时间:</strong> {exam.createdAt}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography>
                <strong>开始时间:</strong> {exam.startTime}
              </Typography>
              <Typography>
                <strong>持续时间:</strong> {exam.duration} 分钟
              </Typography>
              <Typography>
                <strong>总分:</strong> {exam.totalScore} 分
              </Typography>
              <Typography>
                <strong>状态:</strong>{" "}
                <Chip label={exam.status} color="primary" size="small" />
              </Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <SectionTitle variant="h5">试卷内容</SectionTitle>
          <Box className="print-content">
            {exam.sections && exam.sections.length > 0 ? (
              exam.sections.map((section, sectionIndex) => {
                let detailCounter = 0;
                return (
                  <Box
                    key={section.uuid}
                    sx={{ mb: 4 }}
                    className={sectionIndex > 0 ? "page-break" : ""}
                  >
                    <Typography variant="h6" gutterBottom>
                      {section.order_in_exam}. {section.name}
                    </Typography>
                    {section.questions && section.questions.length > 0 ? (
                      section.questions.map((question) => (
                        <QuestionBox key={question.uuid}>
                          {question.material && (
                            <Typography sx={{ mb: 1 }}>
                              {question.material}
                            </Typography>
                          )}
                          {question.questionDetails.map((detail) => {
                            detailCounter++;
                            return (
                              <Box key={detail.uuid} sx={{ mt: 2 }}>
                                <Typography
                                  variant="subtitle1"
                                  component="div"
                                  sx={{ display: "flex", alignItems: "center" }}
                                >
                                  <span>
                                    <strong>{detailCounter}:</strong>{" "}
                                    {detail.questionContent.value}
                                  </span>
                                  <Chip
                                    label={`${detail.score} 分`}
                                    size="small"
                                    sx={{ ml: 1, minWidth: "auto" }}
                                  />
                                </Typography>
                                {detail.questionContent.image && (
                                  <img
                                    src={detail.questionContent.image}
                                    alt="问题图片"
                                    style={{
                                      maxWidth: "100%",
                                      marginTop: "8px",
                                    }}
                                  />
                                )}
                                {renderQuestionOptions(detail.rows)}
                              </Box>
                            );
                          })}
                        </QuestionBox>
                      ))
                    ) : (
                      <Typography>本节没有问题。</Typography>
                    )}
                  </Box>
                );
              })
            ) : (
              <Typography>没有可用的试卷内容。</Typography>
            )}
          </Box>
        </div>
      </StyledPaper>
    </CommonLayout>
  );
};

export default ViewExam;
