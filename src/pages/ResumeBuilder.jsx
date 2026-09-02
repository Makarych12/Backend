import { useState, useEffect } from 'react';
import { modules } from '../data/modules';
import { projects } from '../data/projects';
import { useProgress } from '../hooks/useProgress';

const SKILL_MAPPINGS = [
  { modIds: ['basics', 'python-basics', 'oop'], skill: 'Python 3 (ООП, структуры данных, typing, генераторы)' },
  { modIds: ['fastapi-basics', 'validation'], skill: 'FastAPI (RESTful API, Pydantic v2, Swagger UI, Depends)' },
  { modIds: ['databases'], skill: 'PostgreSQL, SQLAlchemy 2.0 ORM, Alembic миграции' },
  { modIds: ['auth', 'security'], skill: 'JWT аутентификация, OAuth2, хеширование bcrypt, CORS' },
  { modIds: ['testing'], skill: 'Автотесты: pytest, TestClient, фикстуры, моки' },
  { modIds: ['async'], skill: 'Асинхронное программирование (asyncio, async/await, non-blocking I/O)' },
  { modIds: ['docker', 'docker-deep-dive'], skill: 'Docker, Docker Compose, контейнеризация' },
  { modIds: ['celery-redis', 'caching-deep-dive'], skill: 'Redis (кэширование, Rate Limiting) и Celery (очереди задач)' },
  { modIds: ['ai-integration'], skill: 'AI Интеграции: OpenAI/Claude API, RAG, стриминг SSE' },
  { modIds: ['stripe-payments'], skill: 'Приём платежей Stripe & безопасные Webhooks' },
  { modIds: ['file-storage-s3'], skill: 'Облачные хранилища S3 / R2 (boto3, Presigned URLs)' },
  { modIds: ['websockets-realtime'], skill: 'WebSockets (Real-time события, Redis Pub/Sub)' },
  { modIds: ['pagination-search'], skill: 'Курсорная пагинация и полнотекстовый поиск PostgreSQL' },
  { modIds: ['ci-cd-github-actions'], skill: 'CI/CD конвейеры (GitHub Actions)' },
  { modIds: ['monitoring-sentry'], skill: 'Мониторинг Sentry (трекинг ошибок) и Prometheus/Grafana метрики' },
];

export default function ResumeBuilder() {
  const { completed } = useProgress();

  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('backend_course_resume_draft');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return {
      fullName: 'Алексей Смирнов',
      targetTitle: 'Junior Python Backend Developer',
      location: 'Москва / Удалённо',
      email: 'alex.developer@example.com',
      telegram: '@alex_backend_dev',
      github: 'https://github.com/alex-dev',
      summary:
        'Мотивированный backend-разработчик на Python и FastAPI. Умею проектировать масштабируемые REST API, работать с PostgreSQL и SQLAlchemy, настраивать кэширование в Redis, очереди фоновых задач Celery и упаковывать сервисы в Docker.',
      selectedProjects: ['auth-api', 'shop-api', 'realtime-chat', 'tg-bot-backend'],
    };
  });

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    localStorage.setItem('backend_course_resume_draft', JSON.stringify(formData));
  }, [formData]);

  // Расчёт освоенных навыков на основе прогресса
  const acquiredSkills = SKILL_MAPPINGS.map((item) => {
    const hasCompletedAny = item.modIds.some((id) => {
      const mod = modules.find((m) => m.id === id);
      return mod && mod.lessons.some((l) => completed.has(l.id));
    });
    return {
      name: item.skill,
      verified: hasCompletedAny,
    };
  });

  const generateMarkdownResume = () => {
    return `# ${formData.fullName}
**${formData.targetTitle}**
📍 ${formData.location} | 📧 ${formData.email} | ✈️ ${formData.telegram} | 🐙 [GitHub](${formData.github})

---

## 👨‍💻 О себе
${formData.summary}

---

## 🛠 Технические навыки
${acquiredSkills
  .filter((s) => s.verified)
  .map((s) => `- **${s.name}**`)
  .join('\n')}
- **Инструменты и практики:** Git, GitHub, Linux, Postman, CI/CD, Agile/Scrum
- **Английский язык:** B1/B2 (чтение документации, техническая переписка)

---

## 🏆 Проекты в портфолио
${projects
  .filter((p) => formData.selectedProjects.includes(p.id))
  .map(
    (p) => `### ${p.title}
*Стек: ${p.stack.join(', ')}*
${p.description}

**Реализованный функционал:**
${p.features.map((f) => `- ${f}`).join('\n')}
`
  )
  .join('\n')}
`;
  };

  const handleCopyMarkdown = () => {
    const md = generateMarkdownResume();
    navigator.clipboard?.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const md = generateMarkdownResume();
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Resume_${formData.fullName.replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleProject = (projId) => {
    setFormData((prev) => {
      const exists = prev.selectedProjects.includes(projId);
      return {
        ...prev,
        selectedProjects: exists
          ? prev.selectedProjects.filter((id) => id !== projId)
          : [...prev.selectedProjects, projId],
      };
    });
  };

  return (
    <div className="mx-auto max-w-6xl animate-fade-in px-4 py-8 sm:px-6 sm:py-10">
      {/* Шапка */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-3xl">📄</span>
            <h1 className="text-2xl font-bold sm:text-3xl" style={{ color: 'var(--text-primary)' }}>
              Генератор резюме и портфолио
            </h1>
          </div>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Автоматически формирует идеальное резюме Python Backend разработчика на основе пройденных уроков курса.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopyMarkdown}
            className="flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition hover:bg-[var(--bg-hover)]"
            style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          >
            <span>📋</span>
            <span>{copied ? '✓ Скопировано!' : 'Скопировать Markdown'}</span>
          </button>

          <button
            onClick={handleDownloadFile}
            className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-md transition hover:brightness-110"
            style={{ background: 'var(--accent)' }}
          >
            <span>💾</span>
            <span>Скачать резюме (.md)</span>
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Форма редактирования данных (Слева 5 колонок) */}
        <div className="space-y-5 lg:col-span-5">
          <div
            className="space-y-4 rounded-2xl border p-5"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
          >
            <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              1. Личная информация
            </h2>

            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                ФИО:
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full rounded-xl border p-2.5 text-xs outline-none"
                style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                Целевая должность:
              </label>
              <input
                type="text"
                value={formData.targetTitle}
                onChange={(e) => setFormData({ ...formData, targetTitle: e.target.value })}
                className="w-full rounded-xl border p-2.5 text-xs outline-none"
                style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Город / Формат:
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full rounded-xl border p-2.5 text-xs outline-none"
                  style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Email:
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-xl border p-2.5 text-xs outline-none"
                  style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Telegram:
                </label>
                <input
                  type="text"
                  value={formData.telegram}
                  onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
                  className="w-full rounded-xl border p-2.5 text-xs outline-none"
                  style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                  GitHub профиль:
                </label>
                <input
                  type="text"
                  value={formData.github}
                  onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                  className="w-full rounded-xl border p-2.5 text-xs outline-none"
                  style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                Краткое резюме / О себе:
              </label>
              <textarea
                rows={4}
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                className="w-full rounded-xl border p-2.5 text-xs leading-relaxed outline-none"
                style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          {/* Выбор проектов для резюме */}
          <div
            className="space-y-3 rounded-2xl border p-5"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
          >
            <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              2. Включить проекты в резюме
            </h2>
            <div className="space-y-2">
              {projects.map((proj) => {
                const isChecked = formData.selectedProjects.includes(proj.id);
                return (
                  <label
                    key={proj.id}
                    className="flex cursor-pointer items-center justify-between rounded-xl border p-3 transition hover:bg-[var(--bg-hover)]"
                    style={{ background: 'var(--bg)', borderColor: isChecked ? 'var(--accent)' : 'var(--border)' }}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleProject(proj.id)}
                        className="rounded"
                      />
                      <div>
                        <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                          {proj.title}
                        </p>
                        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          {proj.stack.slice(0, 4).join(', ')}
                        </p>
                      </div>
                    </div>
                    <span className="text-base">{proj.icon || '🚀'}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Предпросмотр резюме в реальном времени (Справа 7 колонок) */}
        <div className="space-y-4 lg:col-span-7">
          <div
            className="rounded-3xl border p-6 sm:p-8 shadow-xl"
            style={{
              background: 'var(--bg-secondary)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="border-b pb-4">
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {formData.fullName}
              </h2>
              <p className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>
                {formData.targetTitle}
              </p>
              <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                📍 {formData.location} • 📧 {formData.email} • ✈️ {formData.telegram} • 🐙 {formData.github}
              </p>
            </div>

            {/* О себе */}
            <div className="mt-5 border-b pb-5">
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                О себе:
              </h3>
              <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {formData.summary}
              </p>
            </div>

            {/* Технические навыки */}
            <div className="mt-5 border-b pb-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Технический стек (Автоматически по курсу):
                </h3>
                <span className="text-[10px] text-green-500 font-semibold">
                  ✔ {acquiredSkills.filter((s) => s.verified).length} навыков подтверждено
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {acquiredSkills.map((skill, sIdx) => (
                  <span
                    key={sIdx}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                      skill.verified ? 'ring-1 ring-green-500/40' : 'opacity-40'
                    }`}
                    style={{
                      background: skill.verified ? 'color-mix(in srgb, var(--accent) 15%, transparent)' : 'var(--bg)',
                      color: skill.verified ? 'var(--text-primary)' : 'var(--text-muted)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    {skill.verified ? '✔ ' : '○ '}
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Проекты портфолио */}
            <div className="mt-5">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Проекты в резюме:
              </h3>
              <div className="space-y-4">
                {projects
                  .filter((p) => formData.selectedProjects.includes(p.id))
                  .map((p) => (
                    <div
                      key={p.id}
                      className="rounded-2xl border p-4"
                      style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                          {p.title}
                        </h4>
                        <span className="text-[11px] font-mono" style={{ color: 'var(--accent)' }}>
                          {p.stack.slice(0, 3).join(' • ')}
                        </span>
                      </div>
                      <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {p.description}
                      </p>
                      <ul className="mt-2 space-y-1">
                        {p.features.slice(0, 3).map((feat, fIdx) => (
                          <li key={fIdx} className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                            • {feat}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
