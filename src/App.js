import { Routes, Route } from "react-router-dom";
import { Home } from "./components/Home";
import { About } from "./components/About";
import { Contact } from "./components/Contact";
import { List } from "./components/List";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="about/:id" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="list" element={<List />} />
      </Routes>
    </div>
  );
}

export default App;
