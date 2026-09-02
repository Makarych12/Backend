const VARIANTS = {
  info: { icon: 'ℹ️', bg: '--info-soft-bg', border: '--info-soft-border', title: '--info-soft-text' },
  warning: { icon: '⚠️', bg: '--warning-soft-bg', border: '--warning-soft-border', title: '--warning-soft-text' },
  analogy: { icon: '💡', bg: '--violet-soft-bg', border: '--violet-soft-border', title: '--violet-soft-text' },
};

export default function Callout({ variant = 'info', title, text }) {
  const v = VARIANTS[variant] || VARIANTS.info;
  return (
    <div
      className="rounded-xl border px-4 py-3"
      style={{ background: `var(${v.bg})`, borderColor: `var(${v.border})` }}
    >
      <div className="flex gap-2.5">
        <span className="mt-0.5 shrink-0">{v.icon}</span>
        <div>
          {title && (
            <p className="mb-1 text-sm font-medium" style={{ color: `var(${v.title})` }}>
              {title}
            </p>
          )}
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {text}
          </p>
        </div>
      </div>
    </div>
  );
}
