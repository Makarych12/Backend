import { Link, Navigate, useParams } from 'react-router-dom';
import { findModule } from '../data/modules';
import { useProgress, moduleProgress } from '../hooks/useProgress';
import ProgressBar from '../components/ProgressBar';

export default function ModulePage() {
  const { moduleId } = useParams();
  const module = findModule(moduleId);
  const { completed } = useProgress();

  if (!module) return <Navigate to="/" replace />;

  const mp = moduleProgress(module, completed);

  return (
    <div className="mx-auto max-w-4xl animate-fade-in px-6 py-10">
      <Link to="/" className="mb-6 inline-block text-sm hover:opacity-80" style={{ color: 'var(--text-muted)' }}>
        ← Все модули
      </Link>

      <div className="mb-8 flex items-start gap-4">
        <span className="text-4xl">{module.icon}</span>
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--accent)' }}>
            Модуль {module.order}
          </p>
          <h1 className="text-2xl font-bold sm:text-3xl" style={{ color: 'var(--text-primary)' }}>
            {module.title}
          </h1>
          <p className="mt-2 max-w-xl" style={{ color: 'var(--text-secondary)' }}>
            {module.description}
          </p>
        </div>
      </div>

      {module.comingSoon ? (
        <div className="rounded-xl border border-dashed p-8 text-center" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
          <p className="mb-1" style={{ color: 'var(--text-primary)' }}>
            Этот модуль в разработке
          </p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Полностью готовы модули 1–9. Остальные появятся следующими.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-6 rounded-xl border p-4" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span style={{ color: 'var(--text-primary)' }}>Прогресс по модулю</span>
              <span style={{ color: 'var(--text-secondary)' }}>
                {mp.done}/{mp.total}
              </span>
            </div>
            <ProgressBar pct={mp.pct} size="sm" />
          </div>

          <div className="space-y-3">
            {module.lessons.map((lesson, i) => {
              const done = completed.has(lesson.id);
              return (
                <Link
                  key={lesson.id}
                  to={`/module/${module.id}/${lesson.id}`}
                  className="flex items-center gap-4 rounded-xl border p-4 transition hover:border-[var(--border-strong)]"
                  style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}
                >
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium"
                    style={
                      done
                        ? { background: 'var(--accent-soft-bg)', color: 'var(--accent-soft-text)' }
                        : { background: 'var(--bg-hover)', color: 'var(--text-secondary)' }
                    }
                  >
                    {done ? '✓' : i + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {lesson.title}
                    </h3>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {lesson.summary}
                    </p>
                  </div>
                  <span style={{ color: 'var(--text-muted)' }}>→</span>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
