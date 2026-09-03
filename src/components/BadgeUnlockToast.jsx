import { useEffect, useState } from 'react';
import { BADGES } from '../utils/gamification';
import { useProgress } from '../hooks/useProgress';
import { loadJSON, saveJSON } from '../utils/storage';

const SEEN_KEY = 'seen-badges';

export default function BadgeUnlockToast() {
  const { completed } = useProgress();

  // При первом запуске этой фичи не «ретроактивно» уведомляем о бейджах,
  // уже разблокированных прошлым прогрессом — тост должен появляться только
  // в момент реального получения нового бейджа.
  const [seen, setSeen] = useState(() => {
    const stored = loadJSON(SEEN_KEY, null);
    if (stored) return new Set(stored);
    const initial = BADGES.filter((b) => b.check(completed)).map((b) => b.id);
    saveJSON(SEEN_KEY, initial);
    return new Set(initial);
  });
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    const newlyUnlocked = BADGES.filter((b) => b.check(completed) && !seen.has(b.id));
    if (newlyUnlocked.length === 0) return;

    const nextSeen = new Set(seen);
    newlyUnlocked.forEach((b) => nextSeen.add(b.id));
    saveJSON(SEEN_KEY, Array.from(nextSeen));
    setSeen(nextSeen);
    setQueue((prev) => [...prev, ...newlyUnlocked]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completed]);

  useEffect(() => {
    if (queue.length === 0) return undefined;
    const timer = setTimeout(() => setQueue((prev) => prev.slice(1)), 4000);
    return () => clearTimeout(timer);
  }, [queue]);

  if (queue.length === 0) return null;
  const badge = queue[0];

  return (
    <div
      className="fixed left-1/2 top-5 z-[9999] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 animate-fade-in rounded-2xl border p-4 shadow-2xl"
      style={{ background: 'var(--bg)', borderColor: 'var(--accent)' }}
      role="status"
    >
      <div className="flex items-center gap-3">
        <span className="text-3xl">{badge.icon}</span>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
            Новый бейдж разблокирован!
          </p>
          <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
            {badge.title}
          </p>
        </div>
      </div>
    </div>
  );
}
