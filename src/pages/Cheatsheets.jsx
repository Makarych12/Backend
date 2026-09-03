import { cheatsheets } from '../data/cheatsheets';
import CodeBlock from '../components/CodeBlock';

export default function Cheatsheets() {
  return (
    <div className="mx-auto max-w-5xl animate-fade-in px-4 py-6 sm:px-6 sm:py-10">
      <h1 className="mb-2 text-2xl font-bold sm:text-3xl" style={{ color: 'var(--text-primary)' }}>
        Шпаргалки
      </h1>
      <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
        Самые нужные команды Python, FastAPI и терминала — чтобы не искать их каждый раз заново.
      </p>

      <div className="grid gap-5 lg:grid-cols-2">
        {cheatsheets.map((sheet) => (
          <div key={sheet.id} className="rounded-xl border p-5" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
            <h2 className="mb-3 flex items-center gap-2 font-medium" style={{ color: 'var(--text-primary)' }}>
              <span className="text-xl">{sheet.icon}</span>
              {sheet.title}
            </h2>

            {sheet.description && (
              <p className="mb-3 text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {sheet.description}
              </p>
            )}

            {sheet.code && <CodeBlock code={sheet.code} lang={sheet.lang || 'bash'} title={sheet.title} />}

            {sheet.items && (
              <ul className="space-y-2">
                {sheet.items.map((item, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <code
                      className="shrink-0 rounded px-1.5 py-0.5 font-mono text-[12px] font-medium"
                      style={{ background: 'var(--bg-hover)', color: 'var(--accent)' }}
                    >
                      {item.label}
                    </code>
                    <span style={{ color: 'var(--text-secondary)' }}>{item.text}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
