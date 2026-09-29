// Общий формат новых уроков. Содержание примеров и упражнений задаётся отдельно в каждом модуле.
export function expansionLesson({ id, title, summary, goal, known, analogy, steps, explanation, example, practice, tasks, mistakes, checklist, bridge, terminal }) {
  return {
    id, title, summary,
    theory: [
      { type: 'p', text: `После урока ты сможешь ${goal}. ${known}` },
      { type: 'analogy', text: analogy },
      { type: 'steps', title: 'Собираем по шагам', items: steps.map(([code, note]) => ({ code, note })) },
      { type: 'p', text: explanation },
      { type: 'callout', variant: 'info', title: 'Связь уроков', text: bridge },
    ],
    ...(example ? { example: { title: example.title, lang: 'python', code: example.code, explanation: example.explanation } } : {}),
    ...(example ? { sandbox: { description: practice, initialCode: example.code } } : {}),
    ...(terminal ? { terminal } : {}),
    tasks: tasks.map(([title, description, hint, solution], index) => ({
      title, difficulty: ['easy', 'medium', 'hard'][index], description,
      hints: [hint, 'Проверь ожидаемый результат небольшим запуском или пройди шаги вручную.'],
      ...(solution ? { solution } : {}),
    })),
    mistakes: mistakes.map(([wrong, right]) => ({ wrong, right })),
    checklist,
  };
}
