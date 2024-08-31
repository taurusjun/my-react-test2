import { Routes, Route } from "react-router-dom";
import { Home } from "./exam/Home";
import { About } from "./components/About";
import { Contact } from "./components/Contact";
import { List } from "./components/List";
import { ExamDetail } from "./exam/ExamDetail";
import { Provider } from "./provider/Provider";
import QuestionEdit from "./provider/components/QuestionEdit";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/question-list" element={<Provider />} />
        <Route path="about/:id" element={<About />} />
        <Route path="exam/:uuid" element={<ExamDetail />} />
        <Route path="contact" element={<Contact />} />
        <Route path="list" element={<List />} />
        <Route path="/question-edit/:uuid" element={<QuestionEdit />} />
      </Routes>
    </div>
  );
}

export default App;
