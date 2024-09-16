import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Typography,
  Box,
  CircularProgress,
  Paper,
  Button,
  styled,
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import CommonLayout from "../../../layouts/CommonLayout";
import { getBreadcrumbPaths } from "../../../config/breadcrumbPaths";
import CommonBreadcrumbs from "../../../components/CommonBreadcrumbs";
import "../../../styles/print.css";
import AnswerSheet from "./AnswerSheet";
import ExamContent from "../../../components/ExamContent";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2, 0),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[3],
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
          <ExamContent exam={exam} />
        </div>
      </StyledPaper>
    </CommonLayout>
  );
};

export default ViewExam;
