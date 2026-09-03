import { useState } from 'react';
import { BADGES, updateStreakOnActivity, calculateBenchmark } from '../utils/gamification';
import { useProgress } from '../hooks/useProgress';
import Modal from './Modal';

export default function GamificationWidget() {
  const { completed } = useProgress();
  const [streak] = useState(() => {
    return updateStreakOnActivity();
  });
  const [showModal, setShowModal] = useState(false);

  const benchmark = calculateBenchmark(completed.size);

  const unlockedCount = BADGES.filter((b) => b.check(completed)).length;

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition hover:scale-105 shadow-sm"
        style={{
          background: 'var(--bg-secondary)',
          borderColor: 'var(--border)',
          color: 'var(--text-primary)',
        }}
        title="Достижения и стрик обучения"
      >
        <span className="text-sm">🔥</span>
        <span>{streak.currentStreak} дн.</span>
        <span className="opacity-40">•</span>
        <span className="text-sm">🏆</span>
        <span>{unlockedCount}/{BADGES.length}</span>
      </button>

      {/* Модальное окно ачивок и стрика */}
      {showModal && (
        <Modal
          onClose={() => setShowModal(false)}
          panelClassName="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border shadow-2xl"
          panelStyle={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
        >
            {/* Шапка модалки */}
            <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏆</span>
                <div>
                  <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                    Твои достижения и прогресс
                  </h2>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    Разблокировано {unlockedCount} из {BADGES.length} бейджей
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1.5 text-lg transition hover:bg-[var(--bg-hover)]"
                style={{ color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>

            {/* Тело модалки */}
            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              {/* Плашки Стрика и Бенчмарка */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div
                  className="rounded-2xl border p-4 shadow-sm"
                  style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🔥</span>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                        Стрик обучения
                      </p>
                      <p className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
                        {streak.currentStreak} {streak.currentStreak === 1 ? 'день' : streak.currentStreak < 5 ? 'дня' : 'дней'} подряд
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    Заходи каждый день и завершай уроки, чтобы не потерять стрик!
                  </p>
                </div>

                <div
                  className="rounded-2xl border p-4 shadow-sm"
                  style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">⚡</span>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                        Твой темп ({benchmark.topPercentile})
                      </p>
                      <p className="text-sm font-bold" style={{ color: 'var(--accent)' }}>
                        {benchmark.message}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Сетка бейджей */}
              <div>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Коллекция бейджей курса ({unlockedCount}/{BADGES.length}):
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {BADGES.map((badge) => {
                    const isUnlocked = badge.check(completed);
                    return (
                      <div
                        key={badge.id}
                        className={`flex flex-col items-center justify-between rounded-2xl border p-3.5 text-center transition ${
                          isUnlocked ? 'shadow-md ring-1 ring-amber-500/30' : 'opacity-40 grayscale'
                        }`}
                        style={{
                          background: isUnlocked
                            ? 'color-mix(in srgb, var(--accent) 8%, var(--bg-secondary))'
                            : 'var(--bg-secondary)',
                          borderColor: isUnlocked ? 'var(--accent)' : 'var(--border)',
                        }}
                      >
                        <div className="mb-1 text-3xl sm:text-4xl">{badge.icon}</div>
                        <div>
                          <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                            {badge.title}
                          </p>
                          <p className="mt-1 text-[10px] leading-tight" style={{ color: 'var(--text-secondary)' }}>
                            {badge.desc}
                          </p>
                        </div>
                        <span
                          className="mt-2 rounded-full px-2 py-0.5 text-[9px] font-semibold"
                          style={{
                            background: isUnlocked ? 'rgba(34, 197, 94, 0.15)' : 'var(--bg-hover)',
                            color: isUnlocked ? '#22c55e' : 'var(--text-muted)',
                          }}
                        >
                          {isUnlocked ? '✔ Получено' : '🔒 Заблокировано'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
        </Modal>
      )}
    </>
  );
}
