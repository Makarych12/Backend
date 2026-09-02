import { Link } from 'react-router-dom';
import { modules } from '../data/modules';
import { useProgress, moduleProgress, overallProgress } from '../hooks/useProgress';
import ProgressBar from '../components/ProgressBar';

export default function Home() {
  const { completed } = useProgress();
  const overall = overallProgress(modules, completed);

  return (
    <div className="mx-auto max-w-5xl animate-fade-in px-6 py-10">
      <div className="mb-10">
        <p className="mb-2 text-sm font-medium uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
          Интерактивный курс · с нуля
        </p>
        <h1 className="mb-3 text-3xl font-bold sm:text-4xl" style={{ color: 'var(--text-primary)' }}>
          Python и backend-разработка — с полного нуля
        </h1>
        <p className="max-w-2xl text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Даже если ты никогда в жизни не программировал — этот курс проведёт тебя за руку от вопроса
          «что такое код» до написания настоящих серверов на Python. Простыми словами, маленькими шагами,
          с настоящим Python прямо в браузере и встроенным терминалом.
        </p>
      </div>

      <div className="mb-10 rounded-2xl border p-5" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            Твой прогресс
          </span>
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {overall.done} из {overall.total} уроков
          </span>
        </div>
        <ProgressBar pct={overall.pct} />
        {overall.done === 0 && (
          <p className="mt-3 text-sm" style={{ color: 'var(--text-muted)' }}>
            Начни с модуля «Что такое программирование» — там всё объясняется совсем на пальцах.
          </p>
        )}
      </div>

      <h2 className="mb-4 text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
        Модули курса
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {modules.map((module) => {
          const mp = moduleProgress(module, completed);
          return (
            <Link
              key={module.id}
              to={`/module/${module.id}`}
              className="group rounded-xl border p-5 transition hover:border-[var(--border-strong)]"
              style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}
            >
              <div className="mb-2 flex items-start justify-between">
                <span className="text-2xl">{module.icon}</span>
                {module.comingSoon ? (
                  <span
                    className="rounded-full border px-2 py-0.5 text-[11px]"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                  >
                    скоро
                  </span>
                ) : mp.pct === 100 ? (
                  <span
                    className="rounded-full border px-2 py-0.5 text-[11px]"
                    style={{ borderColor: 'var(--accent-soft-border)', background: 'var(--accent-soft-bg)', color: 'var(--accent-soft-text)' }}
                  >
                    пройдено
                  </span>
                ) : (
                  <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    {mp.done}/{mp.total}
                  </span>
                )}
              </div>
              <h3 className="mb-1.5 font-medium transition group-hover:opacity-80" style={{ color: 'var(--text-primary)' }}>
                {module.order}. {module.title}
              </h3>
              <p className="mb-3 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {module.description}
              </p>
              {!module.comingSoon && <ProgressBar pct={mp.pct} size="sm" />}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
