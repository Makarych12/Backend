import { useState } from 'react';
import LinuxTerminal from './LinuxTerminal';
import GitGraph from './GitGraph';
import Hint from './Hint';
import CodeBlock from './CodeBlock';

// Снимок графа коммитов для GitGraph — простые данные, без ссылок на движок.
function snapshotGit(git) {
  return {
    commits: git.order.map((id) => ({ id, parentIds: git.commits[id].parentIds, message: git.commits[id].message })),
    branches: { ...git.branches },
    head: git.head,
    merging: git.mergeState ? git.mergeState.branch : null,
  };
}

function snapshotFromRepo(repo) {
  return {
    commits: (repo.commits ?? []).map((c) => ({ id: c.id, parentIds: c.parentIds ?? [], message: c.message })),
    branches: { ...(repo.branches ?? {}) },
    head: repo.HEAD ?? 'main',
    merging: null,
  };
}

/**
 * Практическое задание в виртуальном Linux-терминале (поле урока `linuxLab` или `gitLab`).
 * Проверка мгновенная: после каждой команды вызывается lab.check(shell) — как только она
 * вернула true, показывается зелёная галочка "Готово" (и остаётся до кнопки "Сбросить"). Проверяется РЕЗУЛЬТАТ (состояние файлов,
 * процессов, вывод), а не текст команды — любой правильный способ засчитывается.
 */
export default function LinuxLab({ lab }) {
  const [done, setDone] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [checkError, setCheckError] = useState(null);
  const [gitSnapshot, setGitSnapshot] = useState(null);

  function handleStateChange(shell, meta) {
    if (lab.initialRepo) setGitSnapshot(shell.git ? snapshotGit(shell.git) : null);
    if (meta?.reset) {
      setDone(false);
      setCheckError(null);
      return;
    }
    try {
      // Галочка "липкая": раз цель достигнута — остаётся, пока ученик не нажмёт "Сбросить".
      if (lab.check(shell)) setDone(true);
      setCheckError(null);
    } catch (e) {
      // Ошибка в самой проверке (например, ученик удалил каталог, который check читает) —
      // не роняем страницу, просто показываем, что оценить пока нельзя.
      setCheckError(e.message);
    }
  }

  return (
    <div className="space-y-3">
      <div
        className="flex flex-col gap-2 rounded-xl border p-4 sm:flex-row sm:items-start sm:justify-between"
        style={
          done
            ? { borderColor: 'var(--accent-soft-border)', background: 'var(--accent-soft-bg)' }
            : { borderColor: 'var(--border)', background: 'var(--bg-secondary)' }
        }
      >
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide" style={{ color: done ? 'var(--accent-soft-text)' : 'var(--text-muted)' }}>
            Цель
          </p>
          <p className="text-sm leading-relaxed" style={{ color: done ? 'var(--accent-soft-text)' : 'var(--text-primary)' }}>
            {lab.goal}
          </p>
        </div>
        <span
          className="shrink-0 rounded-full border px-3 py-1 text-xs font-semibold"
          style={
            done
              ? { borderColor: 'var(--accent-soft-border)', background: 'var(--accent)', color: 'var(--accent-contrast)' }
              : { borderColor: 'var(--border)', color: 'var(--text-muted)' }
          }
        >
          {done ? '✓ Готово' : 'Не выполнено'}
        </span>
      </div>

      {lab.description && (
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {lab.description}
        </p>
      )}

      <LinuxTerminal
        title={lab.title || 'Linux-терминал'}
        initialFs={lab.initialFs}
        processes={lab.processes}
        cwd={lab.cwd}
        initialRepo={lab.initialRepo}
        welcome={lab.welcome}
        suggestions={lab.suggestions}
        onStateChange={handleStateChange}
      />

      {lab.initialRepo && <GitGraph snapshot={gitSnapshot ?? snapshotFromRepo(lab.initialRepo)} />}

      {checkError && (
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Проверка пока не может оценить результат: {checkError}
        </p>
      )}

      {lab.hint && <Hint index={1} text={lab.hint} />}

      {lab.solution && (
        <div>
          {!showSolution ? (
            <button
              onClick={() => setShowSolution(true)}
              className="text-xs font-medium underline decoration-dotted underline-offset-4 hover:opacity-80"
              style={{ color: 'var(--accent)' }}
            >
              Показать решение
            </button>
          ) : (
            <div>
              <button
                onClick={() => setShowSolution(false)}
                className="mb-2 text-xs font-medium hover:opacity-80"
                style={{ color: 'var(--text-muted)' }}
              >
                Скрыть решение
              </button>
              <CodeBlock code={lab.solution} lang="bash" title="Возможное решение" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
