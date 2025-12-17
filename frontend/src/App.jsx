import { BrowserRouter, Routes, Route } from "react-router-dom";
import Admin from "./Admin"
import Reveal from "./Reveal";
import Dashboard from "./Dashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<Admin />} />
        <Route path="/reveal/:token" element={<Reveal />} />
        <Route path= "/" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
