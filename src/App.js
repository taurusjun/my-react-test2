import { Routes, Route } from "react-router-dom";
import { Home } from "./exam/Home";
import { About } from "./components/About";
import { Contact } from "./components/Contact";
import { List } from "./components/List";
import { ExamDetail } from "./exam/ExamDetail";
import QuestionList from "./provider/components/QuestionList";
import QuestionEdit from "./provider/components/QuestionEdit";
import {
  ExamList,
  NewExam,
  EditExam,
  ViewExam,
  ExamPaper,
  ExamGrading,
  ExamResult,
} from "./pages/exam";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/questions" element={<QuestionList />} />
        <Route path="about/:id" element={<About />} />
        <Route path="exam/:uuid" element={<ExamDetail />} />
        <Route path="contact" element={<Contact />} />
        <Route path="list" element={<List />} />
        <Route path="/question-edit" element={<QuestionEdit />} />
        <Route path="/question-edit/:uuid" element={<QuestionEdit />} />
        <Route path="/exams" element={<ExamList />} />
        <Route path="/exam/new" element={<NewExam />} />
        <Route path="/exam/edit/:uuid" element={<EditExam />} />
        <Route path="/exam/view/:uuid" element={<ViewExam />} />
        <Route path="/exam/paper/:uuid" element={<ExamPaper />} />
        <Route path="/exam/grading/:uuid" element={<ExamGrading />} />
        <Route path="/exam-result/:uuid" element={<ExamResult />} />
      </Routes>
    </div>
  );
}

export default App;
