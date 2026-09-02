import { NavLink, useParams } from 'react-router-dom';
import { modules } from '../data/modules';
import { useProgress, moduleProgress, overallProgress } from '../hooks/useProgress';
import ProgressBar from './ProgressBar';
import ThemeToggle from './ThemeToggle';

export default function Sidebar({ open, onClose }) {
  const { completed } = useProgress();
  const { moduleId: activeModuleId } = useParams();
  const overall = overallProgress(modules, completed);

  return (
    <>
      {open && <div onClick={onClose} className="fixed inset-0 z-30 bg-black/60 md:hidden" aria-hidden="true" />}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 shrink-0 flex-col border-r transition-transform md:sticky md:top-0 md:h-screen md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}
      >
        <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: 'var(--border)' }}>
          <NavLink to="/" onClick={onClose} className="flex items-center gap-2">
            <span className="text-xl">🐍</span>
            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
              Python с нуля
            </span>
          </NavLink>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button onClick={onClose} className="text-lg md:hidden" style={{ color: 'var(--text-muted)' }}>
              ✕
            </button>
          </div>
        </div>

        <div className="border-b px-5 py-3.5" style={{ borderColor: 'var(--border)' }}>
          <div className="mb-1.5 flex items-center justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
            <span>Общий прогресс</span>
            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
              {overall.done}/{overall.total}
            </span>
          </div>
          <ProgressBar pct={overall.pct} size="sm" />
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
          {modules.map((module) => {
            const mp = moduleProgress(module, completed);
            const isActive = module.id === activeModuleId;
            return (
              <div key={module.id} className="rounded-lg">
                <NavLink
                  to={`/module/${module.id}`}
                  onClick={onClose}
                  className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition"
                  style={({ isActive: navActive }) => ({
                    background: navActive || isActive ? 'var(--bg-hover)' : 'transparent',
                    color: navActive || isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  })}
                >
                  <span className="text-base">{module.icon}</span>
                  <span className="flex-1 truncate">
                    {module.order}. {module.title}
                  </span>
                  {module.comingSoon ? (
                    <span
                      className="rounded-full px-1.5 py-0.5 text-[10px]"
                      style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}
                    >
                      скоро
                    </span>
                  ) : mp.pct === 100 ? (
                    <span style={{ color: 'var(--accent)' }}>✓</span>
                  ) : mp.done > 0 ? (
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      {mp.done}/{mp.total}
                    </span>
                  ) : null}
                </NavLink>

                {isActive && module.lessons.length > 0 && (
                  <div className="ml-6 mt-1 space-y-0.5 border-l pl-3" style={{ borderColor: 'var(--border)' }}>
                    {module.lessons.map((lesson) => (
                      <NavLink
                        key={lesson.id}
                        to={`/module/${module.id}/${lesson.id}`}
                        onClick={onClose}
                        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] transition"
                        style={({ isActive: navActive }) => ({
                          color: navActive ? 'var(--accent)' : 'var(--text-muted)',
                        })}
                      >
                        <span className="w-3.5 shrink-0">{completed.has(lesson.id) ? '✓' : ''}</span>
                        <span className="truncate">{lesson.title}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="space-y-1 border-t px-3 py-3" style={{ borderColor: 'var(--border)' }}>
          <NavLink
            to="/cheatsheets"
            onClick={onClose}
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition"
            style={({ isActive }) => ({
              background: isActive ? 'var(--bg-hover)' : 'transparent',
              color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
            })}
          >
            <span className="text-base">📋</span> Шпаргалки
          </NavLink>
          <NavLink
            to="/projects"
            onClick={onClose}
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition"
            style={({ isActive }) => ({
              background: isActive ? 'var(--bg-hover)' : 'transparent',
              color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
            })}
          >
            <span className="text-base">🏆</span> Итоговые проекты
          </NavLink>
          <NavLink
            to="/english"
            onClick={onClose}
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition"
            style={({ isActive }) => ({
              background: isActive ? 'var(--bg-hover)' : 'transparent',
              color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
            })}
          >
            <span className="text-base">🇬🇧</span> Английский для backend
          </NavLink>
        </div>
      </aside>
    </>
  );
}
