import { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ThemeToggle from './components/ThemeToggle';
import GamificationWidget from './components/GamificationWidget';
import BadgeUnlockToast from './components/BadgeUnlockToast';
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

import { AiMentorProvider } from './context/AiMentorContext';
import AiMentorWidget from './components/AiMentorWidget';
import BackendPulseButton from './components/BackendPulseButton';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <AiMentorProvider>
      <div className="flex min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}>
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex min-w-0 flex-1 flex-col">
          <header
            className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b px-4 py-2.5 backdrop-blur sm:px-6"
            style={{ borderColor: 'var(--border)', background: 'color-mix(in srgb, var(--bg) 88%, transparent)' }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setSidebarOpen(true)}
                className="rounded-md p-1.5 transition hover:bg-[var(--bg-hover)] md:hidden cursor-pointer"
                style={{ color: 'var(--text-secondary)' }}
                aria-label="Открыть меню"
              >
                ☰
              </button>
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-semibold text-sm sm:text-base tracking-tight truncate" style={{ color: 'var(--text-primary)' }}>
                  🐍 Python с нуля
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Backend Platform
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <BackendPulseButton />
              <GamificationWidget />
              <ThemeToggle />
            </div>
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

        {/* Единый плавающий AI-наставник */}
        <AiMentorWidget />

        {/* Уведомление о получении нового бейджа */}
        <BadgeUnlockToast />
      </div>
    </AiMentorProvider>
  );
}
