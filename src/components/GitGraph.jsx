/**
 * Простая SVG-картинка графа коммитов учебного git: кружки — коммиты (слева направо в порядке
 * создания), линии — к родителям, подписи — ветки у их кончиков, HEAD — текущая ветка.
 * Получает снимок { commits: [{id, parentIds, message}], branches: {name: id}, head, merging }.
 */
const STEP_X = 76;
const STEP_Y = 34;
const PAD_X = 36;
const PAD_TOP = 30;

function layout(snapshot) {
  const commits = snapshot.commits;
  const index = new Map(commits.map((c, i) => [c.id, i]));
  const lanes = new Map();
  // main/master — нулевая дорожка, остальные ветки — по алфавиту ниже
  const names = Object.keys(snapshot.branches).sort((a, b) => {
    const rank = (n) => (n === 'main' || n === 'master' ? 0 : 1);
    return rank(a) - rank(b) || a.localeCompare(b);
  });
  let nextLane = 0;
  for (const name of names) {
    let id = snapshot.branches[name];
    let lane = null;
    // идём по первым родителям, пока не упрёмся в уже размеченный коммит;
    // ветка, целиком лежащая на чужой дорожке (main после fast-forward), новой дорожки не получает
    while (id && index.has(id) && !lanes.has(id)) {
      if (lane === null) lane = nextLane++;
      lanes.set(id, lane);
      id = commits[index.get(id)].parentIds[0];
    }
  }
  for (const c of commits) if (!lanes.has(c.id)) lanes.set(c.id, 0);
  const laneCount = Math.max(1, ...[...lanes.values()].map((l) => l + 1));
  return { index, lanes, laneCount };
}

export default function GitGraph({ snapshot }) {
  if (!snapshot || snapshot.commits.length === 0) {
    return (
      <div className="rounded-xl border px-4 py-3 text-xs" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', background: 'var(--bg-secondary)' }}>
        Граф коммитов появится после первого <code>git commit</code>.
      </div>
    );
  }
  const { index, lanes, laneCount } = layout(snapshot);
  const pos = (id) => ({ x: PAD_X + index.get(id) * STEP_X, y: PAD_TOP + lanes.get(id) * STEP_Y });
  const width = PAD_X * 2 + (snapshot.commits.length - 1) * STEP_X + 120;
  const height = PAD_TOP + laneCount * STEP_Y + 26;
  const tips = {};
  for (const [name, id] of Object.entries(snapshot.branches)) (tips[id] ??= []).push(name);

  return (
    <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
      <div className="flex items-center justify-between px-4 pt-2.5">
        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
          Граф коммитов
        </span>
        {snapshot.merging && (
          <span className="text-xs font-medium" style={{ color: 'var(--warning-soft-text)' }}>
            идёт слияние с {snapshot.merging} — есть конфликты
          </span>
        )}
      </div>
      <svg width={width} height={height} className="block" style={{ minWidth: '100%' }}>
        {snapshot.commits.map((c) =>
          c.parentIds.map((pid, k) => {
            if (!index.has(pid)) return null;
            const a = pos(pid);
            const b = pos(c.id);
            const d = a.y === b.y ? `M${a.x},${a.y} L${b.x},${b.y}` : `M${a.x},${a.y} C${(a.x + b.x) / 2},${a.y} ${(a.x + b.x) / 2},${b.y} ${b.x},${b.y}`;
            return <path key={`${c.id}-${pid}`} d={d} fill="none" stroke={k === 0 ? 'var(--text-muted)' : 'var(--accent)'} strokeWidth="2" strokeDasharray={k === 0 ? undefined : '4 3'} />;
          })
        )}
        {snapshot.commits.map((c) => {
          const p = pos(c.id);
          const isTip = tips[c.id];
          const isMerge = c.parentIds.length > 1;
          return (
            <g key={c.id}>
              <circle cx={p.x} cy={p.y} r={isMerge ? 8 : 6} fill={isTip ? 'var(--accent)' : 'var(--bg)'} stroke="var(--accent)" strokeWidth="2" />
              <text x={p.x} y={p.y + 19} textAnchor="middle" fontSize="10" fontFamily="monospace" fill="var(--text-muted)">
                {c.id.slice(0, 7)}
              </text>
              {isTip && (
                <text x={p.x} y={p.y - 12} textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text-primary)">
                  {isTip.map((n) => (n === snapshot.head ? `HEAD → ${n}` : n)).join(', ')}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <p className="px-4 pb-2.5 text-[11px]" style={{ color: 'var(--text-muted)' }}>
        Сплошная линия — первый родитель, пунктир — второй (merge-коммит, кружок крупнее). Закрашенный кружок — кончик ветки.
      </p>
    </div>
  );
}
