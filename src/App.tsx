// src/App.tsx
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/posts/:slug" element={<Home />} />
      <Route path="/about" element={<Home />} />
      {/* Catch-all: let Terminal render its own "not found" inside the terminal chrome, rather than a blank page */}
      <Route path="*" element={<Home />} />
    </Routes>
  );
}