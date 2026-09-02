import { useState } from 'react';
import { englishData } from '../data/englishData';
import CodeBlock from '../components/CodeBlock';

export default function EnglishForDevs() {
  const [activeTab, setActiveTab] = useState('terms'); // 'terms' | 'interviews' | 'phrases' | 'docs' | 'quiz'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Состояние квиза:
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const copyToClipboard = (text, id) => {
    navigator.clipboard?.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const filteredTerms = englishData.terms.filter((item) => {
    const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchSearch =
      searchQuery === '' ||
      item.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.translation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.simpleExplanation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const filteredQuestions = englishData.interviewQuestions.filter((q) => {
    return (
      searchQuery === '' ||
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.sampleAnswerEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.topic.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleSelectQuizOption = (qId, optionIdx) => {
    if (quizSubmitted) return;
    setQuizAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
  };

  const getQuizScore = () => {
    let correct = 0;
    englishData.quizzes.termsQuiz.forEach((q) => {
      if (quizAnswers[q.id] === q.correct) correct++;
    });
    return correct;
  };

  return (
    <div className="mx-auto max-w-5xl animate-fade-in px-4 py-8 sm:px-6 sm:py-10">
      {/* Шапка раздела */}
      <div className="mb-8">
        <div className="mb-3 flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 text-2xl">
            🇬🇧
          </span>
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl" style={{ color: 'var(--text-primary)' }}>
              {englishData.title}
            </h1>
            <p className="text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>
              {englishData.subtitle}
            </p>
          </div>
        </div>

        {/* Навигационные табы */}
        <div className="mt-6 flex flex-wrap gap-2 border-b pb-3" style={{ borderColor: 'var(--border)' }}>
          {[
            { id: 'terms', label: '📖 Термины в коде', count: englishData.terms.length },
            { id: 'interviews', label: '💼 Вопросы на собеседовании', count: englishData.interviewQuestions.length },
            { id: 'phrases', label: '💬 Фразы для переписки и созвонов', count: '14+' },
            { id: 'docs', label: '📄 Чтение документации', count: 'Гайд' },
            { id: 'quiz', label: '🎯 Мини-квиз', count: 'Тест' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition"
                style={{
                  background: isActive ? 'var(--accent)' : 'var(--bg-secondary)',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  border: `1px solid ${isActive ? 'transparent' : 'var(--border)'}`,
                }}
              >
                <span>{tab.label}</span>
                <span
                  className="rounded-full px-1.5 py-0.5 text-[11px]"
                  style={{
                    background: isActive ? 'rgba(255,255,255,0.25)' : 'var(--bg-hover)',
                    color: isActive ? '#ffffff' : 'var(--text-muted)',
                  }}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ВКЛАДКА 1: ТЕРМИНЫ В КОДЕ */}
      {/* ========================================================================= */}
      {activeTab === 'terms' && (
        <div>
          {/* Поиск и фильтры по категориям */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-1.5">
              {englishData.termsCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className="rounded-lg px-2.5 py-1 text-xs font-medium transition"
                  style={{
                    background: selectedCategory === cat.id ? 'var(--bg-hover)' : 'transparent',
                    color: selectedCategory === cat.id ? 'var(--text-primary)' : 'var(--text-muted)',
                    border: `1px solid ${selectedCategory === cat.id ? 'var(--accent)' : 'var(--border)'}`,
                  }}
                >
                  {cat.title}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Поиск термина (Variable, Query...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border px-3 py-1.5 text-xs outline-none transition sm:w-64"
              style={{
                background: 'var(--bg-secondary)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {/* Сетка карточек терминов */}
          <div className="grid gap-4 md:grid-cols-2">
            {filteredTerms.map((item, idx) => (
              <div
                key={idx}
                className="group flex flex-col justify-between rounded-2xl border p-5 transition hover:shadow-lg"
                style={{
                  background: 'var(--bg-secondary)',
                  borderColor: 'var(--border)',
                }}
              >
                <div>
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                        {item.term}
                      </h3>
                      <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                        {item.pronunciation}
                      </p>
                    </div>
                    <span
                      className="rounded-lg px-2 py-0.5 text-xs font-semibold"
                      style={{ background: 'color-mix(in srgb, var(--accent) 15%, transparent)', color: 'var(--accent)' }}
                    >
                      {item.translation}
                    </span>
                  </div>

                  <p className="mb-3 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {item.simpleExplanation}
                  </p>

                  {item.analogy && (
                    <div
                      className="mb-3 rounded-xl p-3 text-xs leading-relaxed"
                      style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}
                    >
                      <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        💡 Бытовая аналогия:{' '}
                      </span>
                      {item.analogy}
                    </div>
                  )}
                </div>

                {item.exampleCode && (
                  <div className="mt-2">
                    <CodeBlock code={item.exampleCode} lang="python" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredTerms.length === 0 && (
            <div className="rounded-2xl border p-10 text-center" style={{ borderColor: 'var(--border)' }}>
              <p style={{ color: 'var(--text-muted)' }}>Ничего не найдено по запросу &quot;{searchQuery}&quot;</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ВКЛАДКА 2: ВОПРОСЫ НА СОБЕСЕДОВАНИИ */}
      {/* ========================================================================= */}
      {activeTab === 'interviews' && (
        <div className="space-y-6">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Поиск по вопросам (REST, Docker, Auth, Caching...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition"
              style={{
                background: 'var(--bg-secondary)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          <div className="space-y-4">
            {filteredQuestions.map((q, idx) => (
              <div
                key={q.id}
                className="rounded-2xl border p-5 transition"
                style={{
                  background: 'var(--bg-secondary)',
                  borderColor: 'var(--border)',
                }}
              >
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <span
                    className="rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider"
                    style={{ background: 'var(--bg-hover)', color: 'var(--accent)' }}
                  >
                    {q.topic}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Вопрос #{idx + 1}
                  </span>
                </div>

                <h3 className="mb-2 text-base font-bold sm:text-lg" style={{ color: 'var(--text-primary)' }}>
                  &ldquo;{q.question}&rdquo;
                </h3>

                <p className="mb-4 text-xs italic" style={{ color: 'var(--text-muted)' }}>
                  🎯 Что имеет в виду интервьюер: {q.meaning}
                </p>

                {/* Образцовый ответ на английском */}
                <div
                  className="mb-3 rounded-xl border-l-4 p-4"
                  style={{
                    background: 'var(--bg-hover)',
                    borderColor: 'var(--accent)',
                  }}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase" style={{ color: 'var(--accent)' }}>
                      🗣️ Образец ответа на английском:
                    </span>
                    <button
                      onClick={() => copyToClipboard(q.sampleAnswerEn, q.id)}
                      className="text-xs transition hover:underline"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {copiedIndex === q.id ? '✓ Скопировано' : 'Скопировать ответ'}
                    </button>
                  </div>
                  <p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                    {q.sampleAnswerEn}
                  </p>
                </div>

                {/* Перевод ответа */}
                <div className="mb-3 rounded-xl p-3 text-xs leading-relaxed" style={{ background: 'var(--bg)', color: 'var(--text-secondary)' }}>
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    🇷🇺 Перевод ответа:{' '}
                  </span>
                  {q.sampleAnswerRu}
                </div>

                {/* Ключевые выражения */}
                {q.keyPhrases && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {q.keyPhrases.map((kp, kIdx) => (
                      <span
                        key={kIdx}
                        className="rounded-lg px-2.5 py-1 text-[11px]"
                        style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}
                      >
                        <strong style={{ color: 'var(--text-primary)' }}>{kp.en}</strong> — {kp.ru}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ВКЛАДКА 3: ФРАЗЫ ДЛЯ РАБОЧЕЙ ПЕРЕПИСКИ */}
      {/* ========================================================================= */}
      {activeTab === 'phrases' && (
        <div className="space-y-6">
          {englishData.workplacePhrases.map((group, gIdx) => (
            <div
              key={gIdx}
              className="rounded-2xl border p-5"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
            >
              <h2 className="mb-4 text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                {group.title}
              </h2>

              <div className="space-y-3">
                {group.items.map((item, itemIdx) => {
                  const uniqueId = `phrase_${gIdx}_${itemIdx}`;
                  return (
                    <div
                      key={itemIdx}
                      className="flex flex-col justify-between gap-2 rounded-xl p-3.5 transition hover:bg-[var(--bg-hover)] sm:flex-row sm:items-center"
                      style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-mono text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                            &ldquo;{item.en}&rdquo;
                          </p>
                        </div>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          👉 {item.ru}
                        </p>
                        <span className="inline-block text-[11px] italic" style={{ color: 'var(--text-muted)' }}>
                          Контекст: {item.usage}
                        </span>
                      </div>

                      <button
                        onClick={() => copyToClipboard(item.en, uniqueId)}
                        className="self-start rounded-lg px-3 py-1.5 text-xs font-medium transition sm:self-center"
                        style={{
                          background: copiedIndex === uniqueId ? 'var(--accent)' : 'var(--bg-hover)',
                          color: copiedIndex === uniqueId ? '#ffffff' : 'var(--text-secondary)',
                        }}
                      >
                        {copiedIndex === uniqueId ? '✓ Скопировано' : '📋 Скопировать'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ВКЛАДКА 4: ЧТЕНИЕ ДОКУМЕНТАЦИИ */}
      {/* ========================================================================= */}
      {activeTab === 'docs' && (
        <div className="space-y-6">
          {/* Словарь ключевых слов документации */}
          <div
            className="rounded-2xl border p-5"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
          >
            <h2 className="mb-2 text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              📚 Топ-словарь для чтения официальной документации
            </h2>
            <p className="mb-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
              Эти 5 терминов встречаются в документации Python, FastAPI, Docker и PostgreSQL каждый день:
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              {englishData.documentationReading.guide.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-xl p-3.5"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-mono text-sm font-bold" style={{ color: 'var(--accent)' }}>
                      {item.keyword}
                    </span>
                    <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                      {item.translation}
                    </span>
                  </div>
                  <p className="mb-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {item.explanation}
                  </p>
                  <div
                    className="rounded-md p-2 font-mono text-[11px]"
                    style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)' }}
                  >
                    {item.snippet}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Разбор реальных предложений из доки */}
          <div
            className="rounded-2xl border p-5"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
          >
            <h2 className="mb-4 text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              🔍 Пошаговый анатомический разбор фрагментов документации
            </h2>

            <div className="space-y-4">
              {englishData.documentationReading.realDocSamples.map((sample, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border p-4"
                  style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
                >
                  <h3 className="mb-2 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {sample.title}
                  </h3>

                  {/* Оригинал */}
                  <div
                    className="mb-3 rounded-lg border-l-4 p-3 font-mono text-xs leading-relaxed"
                    style={{ background: 'var(--bg-hover)', borderColor: 'var(--accent)', color: 'var(--text-primary)' }}
                  >
                    &ldquo;{sample.englishText}&rdquo;
                  </div>

                  {/* Пословный разбор */}
                  <div className="mb-3 space-y-1 text-xs">
                    {sample.breakdown.map((b, bIdx) => (
                      <div key={bIdx} className="flex gap-2">
                        <span className="font-mono font-medium" style={{ color: 'var(--accent)' }}>
                          • {b.phrase}
                        </span>
                        <span style={{ color: 'var(--text-muted)' }}>— {b.meaning}</span>
                      </div>
                    ))}
                  </div>

                  {/* Итоговый перевод */}
                  <div
                    className="rounded-lg p-2.5 text-xs"
                    style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}
                  >
                    <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      🇷🇺 Полный перевод:{' '}
                    </span>
                    {sample.fullTranslation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ВКЛАДКА 5: МИНИ-КВИЗ */}
      {/* ========================================================================= */}
      {activeTab === 'quiz' && (
        <div
          className="rounded-2xl border p-6"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
        >
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b pb-4" style={{ borderColor: 'var(--border)' }}>
            <div>
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                🎯 Проверь свои знания: Английский для бэкендера
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                7 практических вопросов по ключевым терминам и ситуациям.
              </p>
            </div>
            {quizSubmitted && (
              <div
                className="rounded-xl px-4 py-2 font-bold"
                style={{
                  background: 'color-mix(in srgb, var(--accent) 20%, transparent)',
                  color: 'var(--accent)',
                }}
              >
                Твой результат: {getQuizScore()} / {englishData.quizzes.termsQuiz.length}
              </div>
            )}
          </div>

          <div className="space-y-6">
            {englishData.quizzes.termsQuiz.map((q, qIndex) => {
              const selectedOpt = quizAnswers[q.id];
              const isAnswered = selectedOpt !== undefined;
              const isCorrect = isAnswered && selectedOpt === q.correct;

              return (
                <div
                  key={q.id}
                  className="rounded-xl border p-4"
                  style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
                >
                  <p className="mb-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {qIndex + 1}. {q.question}
                  </p>

                  <div className="space-y-2">
                    {q.options.map((opt, optIndex) => {
                      let btnBg = 'var(--bg-secondary)';
                      let btnBorder = 'var(--border)';
                      let btnColor = 'var(--text-primary)';

                      if (quizSubmitted) {
                        if (optIndex === q.correct) {
                          btnBg = 'rgba(34, 197, 94, 0.15)';
                          btnBorder = '#22c55e';
                          btnColor = '#22c55e';
                        } else if (selectedOpt === optIndex) {
                          btnBg = 'rgba(239, 68, 68, 0.15)';
                          btnBorder = '#ef4444';
                          btnColor = '#ef4444';
                        }
                      } else if (selectedOpt === optIndex) {
                        btnBg = 'color-mix(in srgb, var(--accent) 15%, transparent)';
                        btnBorder = 'var(--accent)';
                        btnColor = 'var(--accent)';
                      }

                      return (
                        <button
                          key={optIndex}
                          onClick={() => handleSelectQuizOption(q.id, optIndex)}
                          className="w-full rounded-lg border p-3 text-left text-xs font-medium transition"
                          style={{
                            background: btnBg,
                            borderColor: btnBorder,
                            color: btnColor,
                          }}
                        >
                          <span className="mr-2 opacity-60">
                            {['A', 'B', 'C', 'D'][optIndex]})
                          </span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {quizSubmitted && (
                    <div
                      className="mt-3 rounded-lg p-2.5 text-xs"
                      style={{
                        background: isCorrect ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                        color: isCorrect ? '#22c55e' : '#ef4444',
                      }}
                    >
                      {isCorrect ? '✔ Верно!' : '✖ Неверно.'} {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-between border-t pt-4" style={{ borderColor: 'var(--border)' }}>
            {!quizSubmitted ? (
              <button
                onClick={() => setQuizSubmitted(true)}
                disabled={Object.keys(quizAnswers).length === 0}
                className="rounded-xl px-5 py-2.5 text-xs font-bold transition disabled:opacity-50"
                style={{ background: 'var(--accent)', color: '#ffffff' }}
              >
                Проверить ответы ({Object.keys(quizAnswers).length}/{englishData.quizzes.termsQuiz.length})
              </button>
            ) : (
              <button
                onClick={() => {
                  setQuizAnswers({});
                  setQuizSubmitted(false);
                }}
                className="rounded-xl border px-5 py-2.5 text-xs font-medium transition hover:bg-[var(--bg-hover)]"
                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              >
                🔄 Пройти квиз заново
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
