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
  ErrorQuestionPracticeDetails,
  ErrorQuestionPracticeList,
} from "./pages/errorQuestions";
// 导入新的学习相关组件
import LearningMaterialListPage from "./learning/pages/LearningMaterialListPage";
import LearningPage from "./learning/pages/LearningPage";

// 导入文件校正相关组件
import FileCorrectionListPage from "./correction/pages/FileCorrectionListPage";
import FileCorrectionEditorPage from "./correction/pages/FileCorrectionEditorPage";

// 导入管理员页面
import ExamUserAssignment from "./pages/admin/ExamUserAssignment";

import { USER_ROLES } from "./config/menuItems";

// 保留现有的路由配置并添加新的错题集路由和阅卷中心路由
export const routeConfig = [
  { path: "/login", element: Login, protected: false },
  { path: "/", element: Landing, protected: true, allowedRoles: [USER_ROLES.STUDENT, USER_ROLES.TEACHER, USER_ROLES.ADMIN] },
  { path: "/exams/list", element: ExamList, protected: true, allowedRoles: [USER_ROLES.TEACHER, USER_ROLES.ADMIN] },
  { path: "/user-center", element: UserCenter, protected: true, allowedRoles: [USER_ROLES.STUDENT, USER_ROLES.TEACHER, USER_ROLES.ADMIN] },
  { path: "/questions", element: QuestionList, protected: true, allowedRoles: [USER_ROLES.TEACHER, USER_ROLES.ADMIN] },
  { path: "/about/:id", element: About, protected: false },
  { path: "/contact", element: Contact, protected: false },
  { path: "/question-edit", element: QuestionEdit, protected: true, allowedRoles: [USER_ROLES.TEACHER, USER_ROLES.ADMIN] },
  { path: "/question-edit/:uuid", element: QuestionEdit, protected: true, allowedRoles: [USER_ROLES.TEACHER, USER_ROLES.ADMIN] },
  { path: "/exam/new", element: NewExam, protected: true, allowedRoles: [USER_ROLES.TEACHER, USER_ROLES.ADMIN] },
  { path: "/exam/edit/:uuid", element: EditExam, protected: true, allowedRoles: [USER_ROLES.TEACHER, USER_ROLES.ADMIN] },
  { path: "/exam/view/:uuid", element: ViewExam, protected: true, allowedRoles: [USER_ROLES.TEACHER, USER_ROLES.ADMIN] },
  { path: "/exam/paper/:uuid", element: ExamPaper, protected: true, allowedRoles: [USER_ROLES.STUDENT, USER_ROLES.TEACHER, USER_ROLES.ADMIN] },
  { path: "/exam/grading/:uuid", element: ExamGrading, protected: true, allowedRoles: [USER_ROLES.TEACHER, USER_ROLES.ADMIN] },
  { path: "/exam/result/:uuid", element: ExamResult, protected: true, allowedRoles: [USER_ROLES.STUDENT, USER_ROLES.TEACHER, USER_ROLES.ADMIN] },
  { path: "/my-exams/list", element: MyExams, protected: true, allowedRoles: [USER_ROLES.STUDENT, USER_ROLES.TEACHER, USER_ROLES.ADMIN] },
  { path: "/exam/:uuid", element: ExamPaper, protected: true, allowedRoles: [USER_ROLES.STUDENT, USER_ROLES.TEACHER, USER_ROLES.ADMIN] },

  // 新的错题集路由
  { path: "/error-questions", element: ErrorQuestionList, protected: true, allowedRoles: [USER_ROLES.STUDENT, USER_ROLES.TEACHER, USER_ROLES.ADMIN] },
  {
    path: "/error-questions/:uuid",
    element: ErrorQuestionList,
    protected: true,
    allowedRoles: [USER_ROLES.STUDENT, USER_ROLES.TEACHER, USER_ROLES.ADMIN]
  },
  {
    path: "/error-questions/view/:uuid",
    element: ErrorQuestionView,
    protected: true,
    allowedRoles: [USER_ROLES.STUDENT, USER_ROLES.TEACHER, USER_ROLES.ADMIN]
  },
  {
    path: "/error-questions/practice",
    element: ErrorQuestionPractice,
    protected: true,
    allowedRoles: [USER_ROLES.STUDENT, USER_ROLES.TEACHER, USER_ROLES.ADMIN]
  },
  {
    path: "/error-questions/practice/:uuid",
    element: ErrorQuestionPracticeDetails,
    protected: true,
    allowedRoles: [USER_ROLES.STUDENT, USER_ROLES.TEACHER, USER_ROLES.ADMIN]
  },
  {
    path: "/error-questions/practice/list",
    element: ErrorQuestionPracticeList,
    protected: true,
    allowedRoles: [USER_ROLES.STUDENT, USER_ROLES.TEACHER, USER_ROLES.ADMIN]
  },

  // 保留旧的错题路由，以防需要
  {
    path: "/error-questions-old/",
    element: ErrorQuestionsBak,
    protected: true,
    allowedRoles: [USER_ROLES.STUDENT, USER_ROLES.TEACHER, USER_ROLES.ADMIN]
  },
  {
    path: "/error-questions-old/:examId",
    element: ErrorQuestionsBak,
    protected: true,
    allowedRoles: [USER_ROLES.STUDENT, USER_ROLES.TEACHER, USER_ROLES.ADMIN]
  },

  // 新增阅卷中心路由
  { path: "/grading-center", element: GradingCenter, protected: true, allowedRoles: [USER_ROLES.TEACHER, USER_ROLES.ADMIN] },

  // 添加新的学习资料路由
  { path: "/learning", element: LearningMaterialListPage, protected: true, allowedRoles: [USER_ROLES.STUDENT, USER_ROLES.TEACHER, USER_ROLES.ADMIN] },
  { path: "/learning/:materialUuid", element: LearningPage, protected: true, allowedRoles: [USER_ROLES.STUDENT, USER_ROLES.TEACHER, USER_ROLES.ADMIN] },

  // 添加文件校正相关路由
  {
    path: "/file-correction",
    element: FileCorrectionListPage,
    protected: true,
    allowedRoles: [USER_ROLES.TEACHER, USER_ROLES.ADMIN]
  },
  {
    path: "/file-correction/:fileUuid",
    element: FileCorrectionEditorPage,
    protected: true,
    allowedRoles: [USER_ROLES.TEACHER, USER_ROLES.ADMIN]
  },
  {
    path: "/exam-user-assignment",
    element: ExamUserAssignment,
    protected: true,
    allowedRoles: [USER_ROLES.ADMIN]
  },
];
