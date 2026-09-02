import { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ThemeToggle from './components/ThemeToggle';
import GamificationWidget from './components/GamificationWidget';
import Home from './pages/Home';
import ModulePage from './pages/ModulePage';
import LessonPage from './pages/LessonPage';
import Cheatsheets from './pages/Cheatsheets';
import Projects from './pages/Projects';
import EnglishForDevs from './pages/EnglishForDevs';
import InterviewSimulator from './pages/InterviewSimulator';
import SystemDesign from './pages/SystemDesign';
import RealWorldSystems from './pages/RealWorldSystems';
import ResumeBuilder from './pages/ResumeBuilder';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className="sticky top-0 z-20 flex items-center gap-3 border-b px-4 py-3 backdrop-blur md:hidden"
          style={{ borderColor: 'var(--border)', background: 'color-mix(in srgb, var(--bg) 90%, transparent)' }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-1.5 transition hover:bg-[var(--bg-hover)]"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="Открыть меню"
          >
            ☰
          </button>
          <span className="flex-1 font-medium" style={{ color: 'var(--text-primary)' }}>
            🐍 Python с нуля
          </span>
          <GamificationWidget />
          <ThemeToggle />
        </header>

        <main key={location.pathname} className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/module/:moduleId" element={<ModulePage />} />
            <Route path="/module/:moduleId/:lessonId" element={<LessonPage />} />
            <Route path="/cheatsheets" element={<Cheatsheets />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/english" element={<EnglishForDevs />} />
            <Route path="/interview-simulator" element={<InterviewSimulator />} />
            <Route path="/system-design" element={<SystemDesign />} />
            <Route path="/real-world-systems" element={<RealWorldSystems />} />
            <Route path="/resume-builder" element={<ResumeBuilder />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
