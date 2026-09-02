export default function ProgressBar({ pct, size = 'md' }) {
  const height = size === 'sm' ? 'h-1.5' : 'h-2.5';
  return (
    <div className={`w-full overflow-hidden rounded-full ${height}`} style={{ background: 'var(--bg-hover)' }}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, background: 'linear-gradient(to right, var(--accent), var(--info))' }}
      />
    </div>
  );
}
