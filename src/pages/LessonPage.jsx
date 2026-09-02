import { Link, Navigate, useParams } from 'react-router-dom';
import { findLesson, adjacentLessons } from '../data/modules';
import { useProgress } from '../hooks/useProgress';
import CodeBlock from '../components/CodeBlock';
import Sandbox from '../components/Sandbox';
import Terminal from '../components/Terminal';
import CommandExplainer from '../components/CommandExplainer';
import TaskCard from '../components/TaskCard';
import MistakesList from '../components/MistakesList';
import Checklist from '../components/Checklist';
import Callout from '../components/Callout';

function TheoryBlock({ block }) {
  switch (block.type) {
    case 'p':
      return (
        <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {block.text}
        </p>
      );
    case 'analogy':
      return <Callout variant="analogy" title="Представь так" text={block.text} />;
    case 'callout':
      return <Callout variant={block.variant} title={block.title} text={block.text} />;
    case 'command':
      return <CommandExplainer command={block.command} parts={block.parts} result={block.result} />;
    case 'terminal':
      return (
        <Terminal
          title={block.title || 'Терминал'}
          script={block.script}
          lessonCommands={block.lessonCommands}
          suggestions={block.suggestions}
          welcome={block.welcome}
        />
      );
    case 'steps':
      return (
        <div className="rounded-xl border" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
          {block.title && (
            <p className="border-b px-4 py-2.5 text-sm font-medium" style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
              {block.title}
            </p>
          )}
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {block.items.map((step, i) => (
              <div key={i} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center" style={{ borderColor: 'var(--border)' }}>
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-medium"
                  style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}
                >
                  {i + 1}
                </span>
                <code
                  className="shrink-0 rounded px-2 py-1 font-mono text-[13px] font-medium sm:min-w-[40%]"
                  style={{ background: 'var(--code-bg)', color: 'var(--accent)' }}
                >
                  {step.code}
                </code>
                <span className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {step.note}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    case 'list':
      return (
        <div>
          {block.title && (
            <p className="mb-2 font-medium" style={{ color: 'var(--text-primary)' }}>
              {block.title}
            </p>
          )}
          <ul className="space-y-1.5">
            {block.items.map((item, i) => (
              <li key={i} className="flex gap-2 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full" style={{ background: 'var(--accent)' }} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    case 'code':
      return (
        <div className="space-y-1.5 my-2">
          <CodeBlock code={block.code} lang={block.lang || 'python'} title={block.title} />
          {block.explanation && (
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {block.explanation}
            </p>
          )}
        </div>
      );
    default:
      return null;
  }
}

function Section({ number, title, children }) {
  return (
    <section className="mb-10">
      <h2 className="mb-4 flex items-center gap-2.5 text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
        <span
          className="flex h-7 w-7 items-center justify-center rounded-full text-sm"
          style={{ background: 'var(--bg-hover)', color: 'var(--accent)' }}
        >
          {number}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function LessonPage() {
  const { moduleId, lessonId } = useParams();
  const found = findLesson(moduleId, lessonId);
  const { isComplete, toggleComplete } = useProgress();

  if (!found) return <Navigate to={`/module/${moduleId}`} replace />;

  const { module, lesson } = found;
  const { prev, next } = adjacentLessons(moduleId, lessonId);
  const done = isComplete(lesson.id);

  let sectionNumber = 0;
  const num = () => ++sectionNumber;

  const rawExamples = lesson.examples || (lesson.example ? [lesson.example] : []);

  return (
    <div className="mx-auto max-w-3xl animate-fade-in px-6 py-10">
      <div className="mb-6 flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
        <Link to="/" className="hover:opacity-80">
          Курс
        </Link>
        <span>/</span>
        <Link to={`/module/${module.id}`} className="hover:opacity-80">
          {module.title}
        </Link>
      </div>

      <h1 className="mb-2 text-2xl font-bold sm:text-3xl" style={{ color: 'var(--text-primary)' }}>
        {lesson.title}
      </h1>
      <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
        {lesson.summary}
      </p>

      <Section number={num()} title="Теория">
        <div className="space-y-4">
          {lesson.theory.map((block, i) => (
            <TheoryBlock key={i} block={block} />
          ))}
        </div>
      </Section>

      {rawExamples.length > 0 && (
        <Section number={num()} title={rawExamples.length > 1 ? "Рабочие примеры" : "Рабочий пример"}>
          <div className="space-y-6">
            {rawExamples.map((ex, i) => (
              <div key={i} className="space-y-2">
                <CodeBlock code={ex.code} lang={ex.lang || 'python'} title={ex.title} />
                {ex.explanation && (
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {ex.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {lesson.terminal && (
        <Section number={num()} title={lesson.terminal.title || 'Терминал'}>
          <div className="space-y-2">
            {lesson.terminal.description && (
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {lesson.terminal.description}
              </p>
            )}
            <Terminal
              title={lesson.terminal.title || 'Терминал'}
              lessonCommands={lesson.terminal.lessonCommands}
              suggestions={lesson.terminal.suggestions}
              script={lesson.terminal.script}
              welcome={lesson.terminal.welcome}
            />
          </div>
        </Section>
      )}

      {lesson.sandbox && (
        <Section number={num()} title="Попробуй сам">
          <Sandbox initialCode={lesson.sandbox.initialCode} bootstrap={lesson.sandbox.bootstrap} description={lesson.sandbox.description} />
        </Section>
      )}

      {lesson.tasks?.length > 0 && (
        <Section number={num()} title="Задания">
          <div className="space-y-4">
            {lesson.tasks.map((task, i) => (
              <TaskCard key={i} task={task} />
            ))}
          </div>
        </Section>
      )}

      {lesson.mistakes?.length > 0 && (
        <Section number={num()} title="Типичные ошибки новичков">
          <MistakesList mistakes={lesson.mistakes} />
        </Section>
      )}

      <Section number={num()} title="Чек-лист">
        <Checklist lessonId={lesson.id} items={lesson.checklist} />
      </Section>

      <div className="mb-10 flex items-center justify-center">
        <button
          onClick={() => toggleComplete(lesson.id)}
          className="rounded-full px-6 py-2.5 text-sm font-semibold transition hover:opacity-90"
          style={
            done
              ? { border: '1px solid var(--accent-soft-border)', background: 'var(--accent-soft-bg)', color: 'var(--accent-soft-text)' }
              : { background: 'var(--accent)', color: 'var(--accent-contrast)' }
          }
        >
          {done ? '✓ Урок пройден' : 'Отметить урок пройденным'}
        </button>
      </div>

      <div className="flex items-center justify-between border-t pt-6" style={{ borderColor: 'var(--border)' }}>
        {prev ? (
          <Link
            to={`/module/${prev.module.id}/${prev.lesson.id}`}
            className="max-w-[45%] text-sm hover:opacity-80"
            style={{ color: 'var(--text-secondary)' }}
          >
            ← {prev.lesson.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            to={`/module/${next.module.id}/${next.lesson.id}`}
            className="max-w-[45%] text-right text-sm hover:opacity-80"
            style={{ color: 'var(--text-secondary)' }}
          >
            {next.lesson.title} →
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
