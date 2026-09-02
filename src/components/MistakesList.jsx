export default function MistakesList({ mistakes }) {
  if (!mistakes?.length) return null;
  return (
    <div className="space-y-3">
      {mistakes.map((m, i) => (
        <div key={i} className="rounded-xl border p-4" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
          <div className="mb-2 flex gap-2 text-sm">
            <span className="shrink-0" style={{ color: 'var(--danger)' }}>
              ✗
            </span>
            <p className="leading-relaxed line-through" style={{ color: 'var(--text-muted)' }}>
              {m.wrong}
            </p>
          </div>
          <div className="flex gap-2 text-sm">
            <span className="shrink-0" style={{ color: 'var(--accent)' }}>
              ✓
            </span>
            <p className="leading-relaxed" style={{ color: 'var(--text-primary)' }}>
              {m.right}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
