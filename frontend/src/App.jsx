"use client"

import { BrowserRouter as Router, Routes, Route, useParams } from "react-router-dom"
import Home from "./pages/Home"
import FindMore from "./pages/FindMore"
import AIAnalysis from "./pages/AIAnalysis"
import About from "./pages/About"
import "./App.css"

// Componenta wrapper pentru a gestiona parametrii URL
function AIAnalysisWithParams() {
  const { postUrl } = useParams()
  return <AIAnalysis initialPostUrl={postUrl} />
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/find-more" element={<FindMore />} />
        <Route path="/ai-analysis" element={<AIAnalysis />} />
        <Route path="/about" element={<About />} />
        <Route path="/ai-analysis/:postUrl" element={<AIAnalysisWithParams />} />
      </Routes>
    </Router>
  )
}

export default App
