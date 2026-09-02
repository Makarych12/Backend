const PART_COLORS = ['var(--info)', 'var(--accent)', 'var(--warning)', 'var(--violet-soft-text)'];

/**
 * Разбор команды по кусочкам — показывается один раз, при первом появлении команды в уроке.
 * Каждая часть команды подсвечена своим цветом и подписана простыми словами.
 */
export default function CommandExplainer({ command, parts, result }) {
  return (
    <div
      className="overflow-hidden rounded-xl border"
      style={{ borderColor: 'var(--info-soft-border)', background: 'var(--info-soft-bg)' }}
    >
      <div className="px-4 pt-3 text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--info-soft-text)' }}>
        Разбираем команду по частям
      </div>

      <div className="px-4 py-3 font-mono text-[15px]" aria-label={command}>
        {parts.map((part, i) => (
          <span key={i} className="mr-1.5 font-medium" style={{ color: PART_COLORS[i % PART_COLORS.length] }}>
            {part.text}
          </span>
        ))}
      </div>

      <div className="space-y-2 border-t px-4 py-3" style={{ borderColor: 'var(--info-soft-border)' }}>
        {parts.map((part, i) => (
          <div key={i} className="flex gap-2 text-sm">
            <code
              className="shrink-0 rounded px-1.5 py-0.5 font-mono text-[12px] font-medium"
              style={{ background: 'var(--bg-elevated)', color: PART_COLORS[i % PART_COLORS.length] }}
            >
              {part.text}
            </code>
            <span style={{ color: 'var(--text-secondary)' }}>{part.desc}</span>
          </div>
        ))}
      </div>

      {result && (
        <div className="border-t px-4 py-3 text-sm leading-relaxed" style={{ borderColor: 'var(--info-soft-border)', color: 'var(--text-primary)' }}>
          <span className="font-medium">Что произойдёт: </span>
          {result}
        </div>
      )}
    </div>
  );
}
