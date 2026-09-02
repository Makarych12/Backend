import { useCallback, useEffect, useState } from 'react';
import { loadJSON, saveJSON } from '../utils/storage';

const KEY = 'completed-lessons';

function loadCompleted() {
  return new Set(loadJSON(KEY, []));
}

// Простой pub/sub, чтобы все компоненты, использующие хук, обновлялись синхронно
const listeners = new Set();

export function useProgress() {
  const [completed, setCompleted] = useState(loadCompleted);

  useEffect(() => {
    listeners.add(setCompleted);
    return () => listeners.delete(setCompleted);
  }, []);

  const persist = useCallback((next) => {
    saveJSON(KEY, Array.from(next));
    listeners.forEach((fn) => fn(new Set(next)));
  }, []);

  const markComplete = useCallback(
    (lessonId) => {
      setCompleted((prev) => {
        const next = new Set(prev);
        next.add(lessonId);
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const markIncomplete = useCallback(
    (lessonId) => {
      setCompleted((prev) => {
        const next = new Set(prev);
        next.delete(lessonId);
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const toggleComplete = useCallback(
    (lessonId) => {
      if (completed.has(lessonId)) markIncomplete(lessonId);
      else markComplete(lessonId);
    },
    [completed, markComplete, markIncomplete]
  );

  const isComplete = useCallback((lessonId) => completed.has(lessonId), [completed]);

  return { completed, markComplete, markIncomplete, toggleComplete, isComplete };
}

export function moduleProgress(module, completedSet) {
  const total = module.lessons.length;
  const done = module.lessons.filter((l) => completedSet.has(l.id)).length;
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
}

export function overallProgress(modules, completedSet) {
  const total = modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const done = modules.reduce(
    (sum, m) => sum + m.lessons.filter((l) => completedSet.has(l.id)).length,
    0
  );
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
}
