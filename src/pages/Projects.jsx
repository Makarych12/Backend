import { projects } from '../data/projects';

export default function Projects() {
  return (
    <div className="mx-auto max-w-4xl animate-fade-in px-6 py-10">
      <h1 className="mb-2 text-2xl font-bold sm:text-3xl" style={{ color: 'var(--text-primary)' }}>
        Итоговые проекты
      </h1>
      <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
        Четыре проекта нарастающей сложности на FastAPI — именно такие задачи чаще всего встречаются
        в тестовых заданиях и на собеседованиях backend-разработчика. Собери их в портфолио.
      </p>

      <div className="space-y-6">
        {projects.map((p) => (
          <div key={p.id} className="rounded-2xl border p-6" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <span className="text-3xl">{p.icon}</span>
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--accent)' }}>
                  Проект {p.level}
                </p>
                <h2 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
                  {p.title}
                </h2>
              </div>
              <span
                className="ml-auto rounded-full border px-3 py-1 text-xs"
                style={{ borderColor: 'var(--border-strong)', color: 'var(--text-secondary)' }}
              >
                {p.difficulty}
              </span>
            </div>

            <p className="mb-4 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {p.description}
            </p>

            <div className="mb-4 flex flex-wrap gap-1.5">
              {p.stack.map((tech) => (
                <span
                  key={tech}
                  className="rounded-md px-2 py-1 text-[11px] font-medium"
                  style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}
                >
                  {tech}
                </span>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                  Что реализовать
                </p>
                <ul className="space-y-1.5">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full" style={{ background: 'var(--accent)' }} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                  На что смотрят на собеседовании
                </p>
                <ul className="space-y-1.5">
                  {p.interviewFocus.map((f, i) => (
                    <li key={i} className="flex gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full" style={{ background: 'var(--info)' }} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
