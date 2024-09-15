import { About } from "./components/About";
import { Contact } from "./components/Contact";
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
  GradingCenter,
} from "./pages/exam";
import Login from "./pages/auth/Login";
import UserCenter from "./pages/user/UserCenter";
import Landing from "./pages/Landing";
import MyExams from "./pages/exam/MyExams";
import ErrorQuestionsBak from "./pages/exam/ErrorQuestionsBak";
import {
  ErrorQuestionList,
  ErrorQuestionView,
  ErrorQuestionPractice,
} from "./pages/errorQuestions";
// 导入新的学习相关组件
import LearningMaterialListPage from "./learning/pages/LearningMaterialListPage";
import LearningPage from "./learning/pages/LearningPage";

// 导入文件校正相关组件
import FileCorrectionListPage from "./correction/pages/FileCorrectionListPage";
import FileCorrectionEditorPage from "./correction/pages/FileCorrectionEditorPage";

// 保留现有的路由配置并添加新的错题集路由和阅卷中心路由
export const routeConfig = [
  { path: "/login", element: Login, protected: false },
  { path: "/", element: Landing, protected: true },
  { path: "/exam/list", element: ExamList, protected: true },
  { path: "/user-center", element: UserCenter, protected: true },
  { path: "/questions", element: QuestionList, protected: true },
  { path: "/about/:id", element: About, protected: false },
  { path: "/contact", element: Contact, protected: false },
  { path: "/question-edit", element: QuestionEdit, protected: true },
  { path: "/question-edit/:uuid", element: QuestionEdit, protected: true },
  { path: "/exam/new", element: NewExam, protected: true },
  { path: "/exam/edit/:uuid", element: EditExam, protected: true },
  { path: "/exam/view/:uuid", element: ViewExam, protected: true },
  { path: "/exam/paper/:uuid", element: ExamPaper, protected: true },
  { path: "/exam/grading/:uuid", element: ExamGrading, protected: true },
  { path: "/exam/result/:uuid", element: ExamResult, protected: true },
  { path: "/my-exam/list", element: MyExams, protected: true },
  { path: "/exam/:uuid", element: ExamPaper, protected: true },

  // 新的错题集路由
  { path: "/error-questions", element: ErrorQuestionList, protected: true },
  {
    path: "/error-questions/:uuid",
    element: ErrorQuestionList,
    protected: true,
  },
  {
    path: "/error-questions/view/:uuid",
    element: ErrorQuestionView,
    protected: true,
  },
  {
    path: "/error-questions/practice",
    element: ErrorQuestionPractice,
    protected: true,
  },

  // 保留旧的错题路由，以防需要
  {
    path: "/error-questions-old/",
    element: ErrorQuestionsBak,
    protected: true,
  },
  {
    path: "/error-questions-old/:examId",
    element: ErrorQuestionsBak,
    protected: true,
  },

  // 新增阅卷中心路由
  { path: "/grading-center", element: GradingCenter, protected: true },

  // 添加新的学习资料路由
  { path: "/learning", element: LearningMaterialListPage, protected: true },
  { path: "/learning/:materialUuid", element: LearningPage, protected: true },

  // 添加文件校正相关路由
  {
    path: "/file-correction",
    element: FileCorrectionListPage,
    protected: true,
  },
  {
    path: "/file-correction/:fileUuid",
    element: FileCorrectionEditorPage,
    protected: true,
  },
];
