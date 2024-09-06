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
import UserCenter from "./pages/user/UserCenter";
import Landing from "./pages/Landing";
import MyExams from "./pages/exam/MyExams";
import ErrorQuestions from "./pages/exam/ErrorQuestions";

// 保留现有的路由配置
export const routeConfig = [
  { path: "/login", element: Login, protected: false },
  { path: "/", element: Landing, protected: true }, // 新的 landing 页面
  { path: "/exam/list", element: ExamList, protected: true },
  { path: "/user-center", element: UserCenter, protected: true },
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
  { path: "/my-exam/list", element: MyExams, protected: true },
  { path: "/exam/:uuid", element: ExamPaper, protected: true },
  { path: "/error-questions/", element: ErrorQuestions, protected: true },
  {
    path: "/error-questions/:examId",
    element: ErrorQuestions,
    protected: true,
  },
];
