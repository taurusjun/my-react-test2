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
import Login from "./pages/auth/Login";
import UserCenter from "./pages/UserCenter";

export const routeConfig = [
  { path: "/", element: Home, protected: true },
  { path: "/login", element: Login, protected: false },
  { path: "/questions", element: QuestionList, protected: true },
  { path: "/about/:id", element: About, protected: false },
  { path: "/exam/:uuid", element: ExamDetail, protected: true },
  { path: "/contact", element: Contact, protected: false },
  { path: "/list", element: List, protected: false },
  { path: "/question-edit", element: QuestionEdit, protected: true },
  { path: "/question-edit/:uuid", element: QuestionEdit, protected: true },
  { path: "/exam/new", element: NewExam, protected: true },
  { path: "/exam/edit/:uuid", element: EditExam, protected: true },
  { path: "/exam/view/:uuid", element: ViewExam, protected: true },
  { path: "/exam/paper/:uuid", element: ExamPaper, protected: true },
  { path: "/exam/grading/:uuid", element: ExamGrading, protected: true },
  { path: "/exam-result/:uuid", element: ExamResult, protected: true },
  { path: "/user-center", element: UserCenter, protected: true },
  { path: "/exam/list", element: ExamList, protected: true },
];
