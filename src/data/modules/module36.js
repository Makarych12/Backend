// Модуль 36 — Git: ветвление и конфликты. Практика — в поле `gitLab`: тот же виртуальный
// терминал, что и в Linux-модулях, плюс учебный git (src/utils/gitEngine.js) поверх той же ФС.
// check() смотрит на результат (граф коммитов, содержимое файлов), а не на текст команд.

const APP_BASE = 'APP_NAME = "shop-api"\nVERSION = "1.0"\nDEBUG = True\nGREETING = "hello"\n';

// Урок 1: main с двумя коммитами, веток пока нет
const BRANCH_LAB_REPO = {
  commits: [
    { id: 'a1b2c3d', parentIds: [], message: 'Initial commit', tree: { 'app.py': 'print("hello")\n', 'README.md': '# Shop API\n' } },
    { id: 'b2c3d4e', parentIds: ['a1b2c3d'], message: 'Add readme description', tree: { 'app.py': 'print("hello")\n', 'README.md': '# Shop API\n\nБэкенд интернет-магазина.\n' } },
  ],
  branches: { main: 'b2c3d4e' },
  HEAD: 'main',
};

// Урок 2 (теория, полигон fast-forward): feature строго впереди main
const FF_REPO = {
  commits: [
    { id: 'a1b2c3d', parentIds: [], message: 'Initial commit', tree: { 'app.py': 'print("hello")\n' } },
    { id: 'c3d4e5f', parentIds: ['a1b2c3d'], message: 'Greet by name', tree: { 'app.py': 'print("hello, user")\n' } },
  ],
  branches: { main: 'a1b2c3d', feature: 'c3d4e5f' },
  HEAD: 'main',
};

// Урок 2 (лаборатория): ветки разошлись, но меняли РАЗНЫЕ файлы
const MERGE_LAB_REPO = {
  commits: [
    { id: 'a1b2c3d', parentIds: [], message: 'Initial commit', tree: { 'app.py': 'print("hello")\n', 'README.md': '# Shop API\n' } },
    { id: 'd4e5f6a', parentIds: ['a1b2c3d'], message: 'Describe project in readme', tree: { 'app.py': 'print("hello")\n', 'README.md': '# Shop API\n\nБэкенд интернет-магазина.\n' } },
    { id: 'e7f8a9b', parentIds: ['a1b2c3d'], message: 'Greet by name', tree: { 'app.py': 'print("hello, user")\n', 'README.md': '# Shop API\n' } },
  ],
  branches: { main: 'd4e5f6a', feature: 'e7f8a9b' },
  HEAD: 'main',
};

// Урок 3: обе ветки меняли строку VERSION по-разному + по одной своей строке
const CONFLICT_LAB_REPO = {
  commits: [
    { id: 'a1b2c3d', parentIds: [], message: 'Initial config', tree: { 'config.py': APP_BASE } },
    {
      id: 'd4e5f6a',
      parentIds: ['a1b2c3d'],
      message: 'Bump version to 1.1, disable debug',
      tree: { 'config.py': 'APP_NAME = "shop-api"\nVERSION = "1.1"\nDEBUG = False\nGREETING = "hello"\n' },
    },
    {
      id: 'e7f8a9b',
      parentIds: ['a1b2c3d'],
      message: 'Release 2.0 with personal greeting',
      tree: { 'config.py': 'APP_NAME = "shop-api"\nVERSION = "2.0"\nDEBUG = True\nGREETING = "hello, user"\n' },
    },
  ],
  branches: { main: 'd4e5f6a', release: 'e7f8a9b' },
  HEAD: 'main',
};

// Урок 4: те же разошедшиеся ветки без конфликта — для rebase
const REBASE_LAB_REPO = {
  commits: [
    { id: 'a1b2c3d', parentIds: [], message: 'Initial commit', tree: { 'app.py': 'print("hello")\n', 'README.md': '# Shop API\n' } },
    { id: 'd4e5f6a', parentIds: ['a1b2c3d'], message: 'Describe project in readme', tree: { 'app.py': 'print("hello")\n', 'README.md': '# Shop API\n\nБэкенд интернет-магазина.\n' } },
    { id: 'e7f8a9b', parentIds: ['a1b2c3d'], message: 'Greet by name', tree: { 'app.py': 'print("hello, user")\n', 'README.md': '# Shop API\n' } },
  ],
  branches: { main: 'd4e5f6a', feature: 'e7f8a9b' },
  HEAD: 'feature',
};

function hasMergeCommitInHistory(git, branch) {
  return git.history(branch).some((c) => c.parentIds.length > 1);
}

export const module36 = {
  id: 'git-conflicts',
  order: 36,
  title: 'Git: ветвление и конфликты',
  icon: '🌿',
  description:
    'Что происходит, когда над кодом работают двое: ветки как параллельные линии времени, слияние, первый мерж-конфликт своими руками и rebase.',
  lessons: [
    // ------------------------------------------------------------------
    // Урок 1. Ветки
    // ------------------------------------------------------------------
    {
      id: 'git-branches-timelines',
      title: 'Ветки как параллельные линии времени',
      summary: 'Что такое ветка и HEAD на самом деле, зачем работать не в main и почему коммит в ветке не трогает main',
      theory: [
        {
          type: 'p',
          text: 'В модуле 19 ты освоил git add, commit, push, pull и уже слышал про ветки. Здесь — то, что начинается, когда над кодом работают двое: ты и коллега одновременно меняете один проект, а потом ваши изменения нужно соединить. Иногда Git делает это сам, а иногда останавливается и говорит: «решай ты». Этот модуль — про то, как не бояться этого момента. Всё происходит в виртуальном терминале: команды настоящие, репозиторий настоящий (в памяти), сломать ничего нельзя — есть кнопка «Сбросить».',
        },
        {
          type: 'analogy',
          text: 'Представь общий документ, который два человека скопировали себе и правят порознь. Каждая копия — ветка: своя линия времени, где правки накапливаются независимо от чужих. Коммит — это сохранение в своей копии. А HEAD — закладка «в какой копии я сейчас работаю»: git checkout просто перекладывает закладку, и файлы на столе мгновенно становятся файлами той копии. Пока копии не соединили (merge, следующий урок), правки в одной никак не видны в другой.',
        },
        {
          type: 'steps',
          title: 'Ветка технически — это просто подвижная наклейка на коммите',
          items: [
            { code: 'git branch', note: 'Список веток; звёздочка — текущая (там HEAD)' },
            { code: 'git branch feature', note: 'Создать ветку feature на текущем коммите. Наклейка появилась, но ты ещё в main' },
            { code: 'git checkout feature', note: 'Перейти в ветку: HEAD теперь на feature, файлы — как в её последнем коммите. Новее: git switch feature' },
            { code: 'git checkout -b feature', note: 'Создать и сразу перейти — две команды выше одной. Новее: git switch -c feature' },
            { code: 'git commit -m "..."', note: 'Коммит двигает наклейку ТЕКУЩЕЙ ветки вперёд. Наклейка main остаётся где была' },
            { code: 'git log --oneline --all', note: 'История всех веток; в скобках видно, где какая наклейка и где HEAD' },
            { code: 'git checkout main', note: 'Вернуться: файлы снова такие, как в main — твоих правок из feature здесь нет и не должно быть' },
          ],
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Зачем вообще не работать в main',
          text: 'main — это то, что задеплоено или готово к деплою (модули 13, 30). Пока ты полдня ломаешь код новой фичи, main должен оставаться рабочим: коллега может в любой момент выкатить из него срочное исправление. Поэтому правило команды: одна задача — одна ветка от main; готово и проверено — слить в main. В GitHub этот момент оформляется как Pull Request — ты видел его в модуле 19.',
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Git не даст переключить ветку с несохранёнными правками',
          text: 'Если ты поменял файл, но не сделал коммит, и пишешь git checkout другая-ветка — Git откажет: «Your local changes would be overwritten by checkout». Это защита: иначе твои правки бы исчезли вместе с файлами старой ветки. Сначала git add + git commit (или git restore файл, чтобы отменить правку), потом переключайся. В настоящем Git есть ещё git stash — «отложить правки в карман»; в учебном терминале его нет, коммить.',
        },
        {
          type: 'p',
          text: 'Под терминалом в практике рисуется граф коммитов: кружки — коммиты, подписи — ветки, стрелка HEAD — где ты. Смотри на него после каждой команды: он показывает, что на самом деле сделала команда, лучше любого текста.',
        },
      ],
      example: {
        title: 'Типичный день: задача в своей ветке, main не тронут',
        lang: 'bash',
        code: `user@backend:~/project$ git branch
* main

user@backend:~/project$ git checkout -b feature-greeting
Switched to a new branch 'feature-greeting'

user@backend:~/project$ echo 'print("hello, user")' > app.py
user@backend:~/project$ git add app.py
user@backend:~/project$ git commit -m "Greet by name"
[feature-greeting 3f9a1c2] Greet by name
 1 file changed

user@backend:~/project$ git log --oneline --all
3f9a1c2 (HEAD -> feature-greeting) Greet by name
b2c3d4e (main) Add readme description
a1b2c3d Initial commit

user@backend:~/project$ git checkout main
Switched to branch 'main'
user@backend:~/project$ cat app.py
print("hello")                  # в main — старая версия, как и должно быть`,
        explanation: 'Обрати внимание на скобки в git log: наклейка feature-greeting уехала на новый коммит, наклейка main осталась на b2c3d4e. Коммит принадлежит ветке, а не «проекту вообще» — поэтому в main файл не изменился.',
      },
      gitLab: {
        initialRepo: BRANCH_LAB_REPO,
        goal: 'Создай новую ветку (например, feature-greeting), сделай в ней хотя бы один коммит с любым изменением файлов, а потом вернись в main. В итоге: ты стоишь на main, main не сдвинулся ни на один коммит, а в новой ветке есть коммит, которого в main нет.',
        check: (shell) => {
          const git = shell.git;
          if (!git || git.head !== 'main') return false;
          if (git.branches.main !== 'b2c3d4e') return false;
          if (git.mergeState) return false;
          const other = Object.keys(git.branches).find((b) => b !== 'main' && git.branches[b] !== 'b2c3d4e' && git.isAncestor('b2c3d4e', git.branches[b]));
          if (!other) return false;
          // рабочие файлы соответствуют main
          const tree = git.headCommit().tree;
          return Object.entries(tree).every(([p, content]) => shell.readFile(`/home/user/project/${p}`) === content);
        },
        hint: 'Три шага: создать ветку и перейти в неё; изменить файл (echo ... > app.py), добавить и закоммитить; вернуться в main. После каждого шага смотри git status, git log --oneline --all и граф под терминалом.',
        solution: `git checkout -b feature-greeting
echo 'print("hello, user")' > app.py
git add app.py
git commit -m "Greet by name"
git checkout main
cat app.py                     # print("hello") — main не тронут
git log --oneline --all`,
        suggestions: ['git status', 'git branch', 'git log --oneline --all', 'cat app.py', 'git checkout main'],
      },
      tasks: [
        {
          title: 'Задание 1: наклейка без переключения',
          difficulty: 'easy',
          lang: 'bash',
          description: 'В терминале выше создай ветку hotfix командой git branch (без -b) и посмотри git branch и git log --oneline --all. Где стоит новая наклейка и где HEAD? Потом перейди в hotfix и убедись, что файлы не изменились — почему?',
          hints: ['git branch hotfix ставит наклейку на текущий коммит, HEAD остаётся в main.', 'Обе ветки указывают на один и тот же коммит — файлы одинаковые, менять нечего.'],
          solution: `git branch hotfix
git branch                      # * main, hotfix
git log --oneline --all         # b2c3d4e (HEAD -> main, hotfix) ...
git checkout hotfix
cat app.py                      # тот же файл: ветки пока на одном коммите`,
        },
        {
          title: 'Задание 2: защита от потери правок',
          difficulty: 'medium',
          lang: 'bash',
          description: 'Находясь в любой ветке, измени app.py, НЕ коммить и попробуй переключиться на другую ветку. Прочитай отказ. Затем реши проблему двумя способами по очереди: (а) отменить правку через git restore и переключиться; (б) вернуть правку, закоммитить её и переключиться.',
          hints: ['error: Your local changes to the following files would be overwritten by checkout — Git защищает незакоммиченные правки.', 'git restore app.py возвращает файл к последнему коммиту; после этого checkout проходит.'],
          solution: `git branch hotfix               # вторая ветка, если её ещё нет
echo 'print("draft")' > app.py
git checkout hotfix             # error: ... would be overwritten by checkout
git restore app.py              # (а) отменить правку
git checkout hotfix             # Switched to branch 'hotfix'
echo 'print("draft")' > app.py  # (б) вернуть правку и закоммитить
git add app.py && git commit -m "Draft"
git checkout main`,
        },
        {
          title: 'Задание 3: две ветки — две линии времени',
          difficulty: 'hard',
          lang: 'bash',
          description: 'Сделай так, чтобы в репозитории было две ветки, отходящие от main, с одним коммитом в каждой: в первой изменён app.py, во второй — README.md. Не создавай вторую ветку из первой! Проверь по git log --oneline --all и по графу, что обе ветки растут из одного коммита main, а main остался на месте. Объясни, что будет с файлами при переключении между ними.',
          hints: ['Перед созданием второй ветки вернись в main: git checkout main, иначе вторая ветка унаследует коммит первой.', 'При переключении app.py и README.md меняются на версии той ветки, куда ты перешёл, — каждая ветка видит только свои коммиты.'],
          solution: `git checkout -b feature-app
echo 'print("v2")' > app.py && git add . && git commit -m "App v2"
git checkout main                       # обязательно вернуться в main!
git checkout -b feature-docs
echo "# Shop API — docs" > README.md && git add . && git commit -m "Docs"
git checkout main
git log --oneline --all                 # обе ветки над b2c3d4e (main)`,
        },
      ],
      mistakes: [
        {
          wrong: 'Создавать вторую ветку, не вернувшись в main — и получать в ней «чужие» коммиты первой ветки',
          right: 'Новая ветка начинается там, где стоит HEAD. Перед git checkout -b всегда проверь git branch: ты должен быть в main (или в той ветке, от которой действительно хочешь отойти)',
        },
        {
          wrong: 'Думать, что коммит «в проекте» виден во всех ветках',
          right: 'Коммит двигает только текущую ветку. Пока ветку не слили (merge), в main её изменений нет — именно так и задумано',
        },
      ],
      checklist: [
        'Объясняю: ветка — подвижная наклейка на коммите, HEAD — где я сейчас, коммит двигает только текущую ветку',
        'Умею git branch, git checkout -b / git switch -c, git checkout, git log --oneline --all',
        'Знаю, почему задачу делают в отдельной ветке, а main держат рабочим',
        'Понимаю отказ «would be overwritten by checkout» и что делать: commit или restore',
        'Читаю граф коммитов: где кончики веток, где HEAD, откуда ветка отошла',
      ],
    },

    // ------------------------------------------------------------------
    // Урок 2. Слияние без конфликтов
    // ------------------------------------------------------------------
    {
      id: 'git-merge-no-conflicts',
      title: 'Слияние без конфликтов: fast-forward и merge-коммит',
      summary: 'Два вида git merge — когда Git просто двигает наклейку и когда создаёт коммит с двумя родителями, — и как он соединяет правки, если они не пересекаются',
      theory: [
        {
          type: 'p',
          text: 'Ветка готова — пора вернуть её изменения в main. Это делает git merge: стоя в main, ты говоришь «влей сюда feature». Дальше Git смотрит на историю и выбирает один из двух путей — и важно понимать оба, потому что на собеседовании спрашивают «что такое fast-forward» так же часто, как «что такое конфликт».',
        },
        {
          type: 'analogy',
          text: 'Снова общий документ. Случай первый: пока коллега правил свою копию, ты в своей НИЧЕГО не менял. Соединять нечего — ты просто берёшь его версию как новую общую. Это fast-forward: наклейка main перепрыгивает вперёд на коммит feature, новых коммитов не появляется. Случай второй: вы оба что-то правили, но в разных абзацах. Git берёт общий исходник (последний коммит, который есть у обоих, — общий предок), смотрит, что изменил каждый, и складывает: твой абзац + его абзац. Результат — новый merge-коммит, у которого два родителя: твой последний коммит и его.',
        },
        {
          type: 'steps',
          title: 'Три сравнения вместо двух: как Git решает, что взять',
          items: [
            { code: 'base = общий предок main и feature', note: 'Git находит последний коммит, из которого выросли обе ветки, — точку, где документ был один' },
            { code: 'строка одинакова в base, main и feature', note: 'Никто не трогал → берём как есть' },
            { code: 'строка изменена только в feature', note: 'Берём версию feature (main её не менял — значит, не против)' },
            { code: 'строка изменена только в main', note: 'Берём версию main' },
            { code: 'изменена в обеих, одинаково', note: 'Оба сделали одно и то же → берём, конфликта нет' },
            { code: 'изменена в обеих, ПО-РАЗНОМУ', note: 'Git не знает, кто прав → конфликт. Это следующий урок' },
          ],
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Честное упрощение учебного git',
          text: 'Учебный движок сравнивает файлы построчно по номеру строки: строка 2 в base против строки 2 в main и строки 2 в feature. Настоящий Git умнее: он использует алгоритм diff3 и умеет понимать, что ты вставил строку в начало файла и всё остальное просто сдвинулось, а не изменилось. В учебном терминале такая вставка в одной ветке и правка ниже в другой может дать конфликт там, где настоящий Git справился бы сам. Для понимания, что такое конфликт и как его решать, этого достаточно — так же, как в модуле 9 мини-FastAPI честно не кэширует Depends.',
        },
        {
          type: 'list',
          title: 'Как отличить один случай от другого в выводе',
          items: [
            'Fast-forward: в выводе слово Fast-forward, в git log новых коммитов нет — только наклейка main переехала. История остаётся прямой линией.',
            'Merge-коммит: в выводе «Merge made by the ...», в git log появляется коммит «Merge branch \'feature\'» со строкой Merge: <родитель1> <родитель2>. В графе — кружок крупнее с двумя входящими линиями.',
            'Already up to date — в feature нет ничего, чего ещё нет в main: сливать нечего.',
            'Сливать можно и в обратную сторону — стоя в feature, git merge main «подтягивает» свежий main в свою ветку, чтобы конфликты ловить рано и у себя, а не в момент Pull Request.',
          ],
        },
        {
          type: 'p',
          text: 'Полигон ниже — случай fast-forward: feature ушла вперёд, main стоял на месте. Сделай git merge feature и посмотри на граф: новых кружков не появится, наклейка main просто переедет.',
        },
        {
          type: 'linuxTerminal',
          title: 'Полигон: fast-forward',
          initialRepo: FF_REPO,
          welcome: 'Ты в main. feature на один коммит впереди. Попробуй: git log --oneline --all, потом git merge feature.',
          suggestions: ['git log --oneline --all', 'git merge feature', 'git log --oneline --all', 'cat app.py'],
        },
      ],
      example: {
        title: 'Merge-коммит: ветки меняли разные файлы',
        lang: 'bash',
        code: `user@backend:~/project$ git log --oneline --all
e7f8a9b (feature) Greet by name               # менял app.py
d4e5f6a (HEAD -> main) Describe project in readme   # менял README.md
a1b2c3d Initial commit                        # общий предок

user@backend:~/project$ git merge feature
Merge made by the 'ort' strategy.
 app.py       |  2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)

user@backend:~/project$ git log --oneline
7c1e5b0 (HEAD -> main) Merge branch 'feature'   # новый коммит с двумя родителями
d4e5f6a Describe project in readme
e7f8a9b (feature) Greet by name
a1b2c3d Initial commit

user@backend:~/project$ git log -1
commit 7c1e5b0 (HEAD -> main)
Merge: d4e5f6a e7f8a9b          # вот они, два родителя
...`,
        explanation: 'Git сам понял, что README.md менял только main, а app.py — только feature, и сложил оба изменения. Такое слияние не требует от тебя ничего, кроме команды. Строка Merge: с двумя id — главный признак merge-коммита; у обычных коммитов её нет.',
      },
      gitLab: {
        initialRepo: MERGE_LAB_REPO,
        goal: 'Ветки main и feature разошлись: main обновил README.md, feature — app.py. Слей feature в main так, чтобы в main появился merge-коммит с двумя родителями, а в рабочих файлах были оба изменения (описание в README и «hello, user» в app.py).',
        check: (shell) => {
          const git = shell.git;
          if (!git || git.mergeState) return false;
          const tip = git.branchCommit('main');
          if (!tip || tip.parentIds.length !== 2) return false;
          const parents = new Set(tip.parentIds);
          if (!parents.has('d4e5f6a') || !parents.has('e7f8a9b')) return false;
          return tip.tree['app.py'] === 'print("hello, user")\n' && tip.tree['README.md'] === '# Shop API\n\nБэкенд интернет-магазина.\n';
        },
        hint: 'Слияние делают, стоя в той ветке, КУДА вливают. Проверь git branch, потом одна команда. После — git log (полный, не --oneline), чтобы увидеть строку Merge: с двумя родителями, и cat обоих файлов.',
        solution: `git checkout main            # если ещё не там
git merge feature
git log -1                   # Merge: d4e5f6a e7f8a9b
cat app.py README.md`,
        suggestions: ['git log --oneline --all', 'git branch', 'git merge feature', 'git log -1', 'cat app.py'],
      },
      tasks: [
        {
          title: 'Задание 1: узнай общего предка',
          difficulty: 'easy',
          lang: 'bash',
          description: 'До слияния (нажми «Сбросить», если уже слил) по git log --oneline --all определи: какой коммит — общий предок main и feature? Какие файлы менял каждый из веток относительно него? Проверь догадку через git show <id> для обоих кончиков.',
          hints: ['Общий предок — самый новый коммит, который есть в истории обеих веток: здесь a1b2c3d.', 'git show d4e5f6a покажет diff README.md, git show e7f8a9b — diff app.py.'],
          solution: `git log --oneline --all
git show d4e5f6a           # README.md: +Бэкенд интернет-магазина.
git show e7f8a9b           # app.py: -print("hello") +print("hello, user")`,
        },
        {
          title: 'Задание 2: слияние в обратную сторону',
          difficulty: 'medium',
          lang: 'bash',
          description: 'Сбрось терминал. Перейди в feature и подтяни в неё main (git merge main). Что за коммит появился и в какой ветке? Потом вернись в main и слей feature — какого вида слияние получилось теперь и почему?',
          hints: ['В feature появится merge-коммит «Merge branch \'main\' into feature» с двумя родителями; main не изменился.', 'Теперь main — прямой предок feature, поэтому git merge feature из main — это Fast-forward, без нового коммита.'],
          solution: `git checkout feature
git merge main                 # Merge made ... — merge-коммит в feature
git log --oneline --all
git checkout main
git merge feature              # Fast-forward: main просто догнал feature`,
        },
        {
          title: 'Задание 3: три ветки, один main',
          difficulty: 'hard',
          lang: 'bash',
          description: 'Сбрось терминал. Кроме feature создай от main ещё одну ветку docs, в которой добавь в README.md строку (echo "..." >> README.md) и закоммить. Затем слей в main обе ветки по очереди. Сколько merge-коммитов получилось, и почему одно из слияний могло оказаться fast-forward, а другое — нет? Проверь, что в main есть все три изменения.',
          hints: ['docs отходит от текущего main (d4e5f6a), поэтому первое слияние docs в main — fast-forward (main не двигался с момента создания docs).', 'feature отошла раньше и разошлась с main — её слияние даёт merge-коммит. Порядок можно поменять — результат по содержимому тот же.'],
          solution: `git checkout -b docs
echo "Документация в разработке." >> README.md
git add README.md && git commit -m "Docs note"
git checkout main
git merge docs                 # Fast-forward
git merge feature              # Merge made by the 'ort' strategy
git log --oneline --all
cat README.md app.py`,
        },
      ],
      mistakes: [
        {
          wrong: 'Запускать git merge main, стоя в main, и ждать, что feature вольётся',
          right: 'Слияние всегда идёт В текущую ветку ИЗ указанной. Хочешь feature в main — сначала git checkout main, потом git merge feature',
        },
        {
          wrong: 'Считать, что merge «перезаписывает» main версией feature',
          right: 'Git складывает изменения обеих веток относительно общего предка. Правки main никуда не деваются — в merge-коммите есть и они',
        },
      ],
      checklist: [
        'Различаю fast-forward (наклейка переехала, коммитов нет) и merge-коммит (два родителя, строка Merge: в git log)',
        'Объясняю three-way merge: общий предок + что изменил каждый → сложить',
        'Помню: merge вливает В текущую ветку, сначала git checkout main',
        'Знаю, что подтянуть main в свою ветку (git merge main из feature) — нормальная практика',
        'Понимаю ограничение учебного движка (построчное сравнение) и чем настоящий diff3 умнее',
      ],
    },

    // ------------------------------------------------------------------
    // Урок 3. Первый конфликт
    // ------------------------------------------------------------------
    {
      id: 'git-first-conflict',
      title: 'Первый конфликт: маркеры, выбор и коммит',
      summary: 'Самый важный урок модуля: как выглядит конфликт, что значат <<<<<<< ======= >>>>>>>, и как разрулить его руками — спокойно и осознанно',
      theory: [
        {
          type: 'p',
          text: 'Рано или поздно это случается с каждым: git merge не заканчивается тихо, а печатает CONFLICT и останавливается. Новички в этот момент паникуют, удаляют папку и клонируют заново. Не надо. Конфликт — это не ошибка и не поломка. Это Git честно говорит: «вы оба изменили одну и ту же строку по-разному, я не знаю, чья версия правильная, — реши сам». И ждёт.',
        },
        {
          type: 'analogy',
          text: 'Те же два человека с копиями документа. Один исправил в третьем предложении «версия 1.0» на «версия 1.1», другой — на «версия 2.0». Складывать нечего: два разных исправления одного и того же места. Редактор (Git) не может решить за вас, поэтому кладёт на стол оба варианта, обведя карандашом: «вот твой, вот его — оставь один или напиши третий». Всё остальное в документе — абзацы, которые правил только кто-то один, — он уже сложил сам.',
        },
        {
          type: 'command',
          command: '<<<<<<< HEAD / VERSION = "1.1" / ======= / VERSION = "2.0" / >>>>>>> release',
          parts: [
            { text: '<<<<<<< HEAD', desc: 'начало конфликтного места. HEAD — «твоя» сторона: ветка, в которой ты стоишь и в которую вливаешь' },
            { text: 'VERSION = "1.1"', desc: 'строка (или несколько) в твоей версии' },
            { text: '=======', desc: 'граница между двумя версиями' },
            { text: 'VERSION = "2.0"', desc: 'та же строка в версии вливаемой ветки' },
            { text: '>>>>>>> release', desc: 'конец конфликтного места и имя вливаемой ветки' },
          ],
          result: 'Всё, что ВНЕ этих маркеров, Git уже слил сам. Твоя работа — заменить блок от <<<<<<< до >>>>>>> включительно на правильный текст: одну из версий, обе или что-то третье. Маркеры удаляются вместе с ним — в файле их остаться не должно.',
        },
        {
          type: 'steps',
          title: 'Разрулить конфликт: пять шагов, всегда одинаковых',
          items: [
            { code: 'git status', note: '«Unmerged paths» и «both modified: config.py» — список файлов, где нужна твоя рука' },
            { code: 'cat config.py', note: 'Найти блоки <<<<<<< ... >>>>>>>. Понять, что хотела каждая сторона, а не выбирать наугад' },
            { code: 'echo "..." > config.py', note: 'Переписать файл без маркеров с правильным содержимым. На настоящем сервере — nano/VS Code; в учебном терминале — echo и >> построчно' },
            { code: 'git add config.py', note: '«Я разрешил конфликт в этом файле». Пока файл не добавлен, Git считает его нерешённым' },
            { code: 'git commit -m "Merge release: keep version 2.0"', note: 'Завершить слияние. Получится обычный merge-коммит с двумя родителями' },
          ],
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Две ошибки, которые ломают проект',
          text: 'Первая: оставить маркеры в файле и закоммитить. Python-файл с <<<<<<< внутри — синтаксическая ошибка, и упадёт всё. Настоящий Git позволяет такой коммит (он не читает содержимое); учебный — откажет с подсказкой. Вторая, хуже: не читая, оставить «свою» версию, потому что она привычнее. Коллега поднимал версию до 2.0 не просто так — если ты молча вернул 1.1, его релиз потерян, и никто не заметит до продакшена. Конфликт — момент, когда нужно ПОНЯТЬ обе стороны; иногда для этого пишут коллеге.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Если всё пошло не так — git merge --abort',
          text: 'Пока слияние не завершено коммитом, его можно отменить целиком: git merge --abort вернёт файлы и ветку в состояние до git merge. Никаких следов. Это «кнопка паники», которая делает конфликт безопасным упражнением: испортил файл — отменил — попробовал снова.',
        },
        {
          type: 'p',
          text: 'В редакторах вроде VS Code над конфликтным блоком появляются кнопки «Accept Current», «Accept Incoming», «Accept Both» — это те же действия, что ты сейчас сделаешь руками через echo. Понимая, что происходит с текстом, ты не будешь жать кнопки наугад.',
        },
      ],
      example: {
        title: 'Конфликт от начала до конца',
        lang: 'bash',
        code: `user@backend:~/project$ git merge release
Auto-merging config.py
CONFLICT (content): Merge conflict in config.py
Automatic merge failed; fix conflicts and then commit the result.

user@backend:~/project$ git status
On branch main
You have unmerged paths.
  (fix conflicts and run "git commit")
  (use "git merge --abort" to abort the merge)

Unmerged paths:
  (use "git add <file>..." to mark resolution)
	both modified:   config.py

user@backend:~/project$ cat config.py
APP_NAME = "shop-api"
<<<<<<< HEAD
VERSION = "1.1"
=======
VERSION = "2.0"
>>>>>>> release
DEBUG = False                 # это Git слил сам: менял только main
GREETING = "hello, user"      # и это: менял только release

user@backend:~/project$ echo 'APP_NAME = "shop-api"' > config.py
user@backend:~/project$ echo 'VERSION = "2.0"' >> config.py      # осознанный выбор: релиз важнее
user@backend:~/project$ echo 'DEBUG = False' >> config.py
user@backend:~/project$ echo 'GREETING = "hello, user"' >> config.py
user@backend:~/project$ git add config.py
user@backend:~/project$ git commit -m "Merge release: keep version 2.0"
[main 5d2c8e1] Merge release: keep version 2.0
 1 file changed (merge commit)`,
        explanation: 'Заметь, что DEBUG и GREETING не в конфликте: их менял только кто-то один, и Git сложил их сам. Конфликт — только строка VERSION. После правки файл выглядит как обычный config.py, без единого маркера, и в нём сохранены изменения ОБЕИХ сторон плюс осознанный выбор версии.',
      },
      gitLab: {
        initialRepo: CONFLICT_LAB_REPO,
        goal: 'Слей ветку release в main. Обе ветки меняли строку VERSION в config.py по-разному — Git остановится с конфликтом. Разреши его так: оставь БОЛЬШИЙ номер версии (2.0 — это релиз, его нельзя потерять), сохрани изменения обеих сторон (DEBUG = False из main и GREETING = "hello, user" из release), убери все маркеры и заверши слияние коммитом.',
        check: (shell) => {
          const git = shell.git;
          if (!git || git.mergeState || git.head !== 'main') return false;
          const tip = git.branchCommit('main');
          if (!tip || tip.parentIds.length !== 2) return false;
          if (!tip.parentIds.includes('d4e5f6a') || !tip.parentIds.includes('e7f8a9b')) return false;
          const committed = tip.tree['config.py'] ?? '';
          const working = shell.readFile('/home/user/project/config.py') ?? '';
          const hasMarkers = (t) => /^(<<<<<<<|=======|>>>>>>>)/m.test(t);
          if (hasMarkers(committed) || hasMarkers(working)) return false;
          const lines = committed.split('\n').map((l) => l.trim()).filter(Boolean);
          const has = (l) => lines.includes(l);
          return has('APP_NAME = "shop-api"') && has('VERSION = "2.0"') && !has('VERSION = "1.1"') && has('DEBUG = False') && has('GREETING = "hello, user"') && lines.length === 4;
        },
        hint: 'Сначала git merge release и git status. Потом cat config.py — найди блок с маркерами и пойми, что менял каждый. Перепиши файл целиком: первая строка через >, остальные через >>. Проверь cat, что маркеров нет, и только тогда git add и git commit. Если запутался — git merge --abort и заново.',
        solution: `git merge release                 # CONFLICT (content): Merge conflict in config.py
git status
cat config.py
echo 'APP_NAME = "shop-api"' > config.py
echo 'VERSION = "2.0"' >> config.py
echo 'DEBUG = False' >> config.py
echo 'GREETING = "hello, user"' >> config.py
cat config.py                     # маркеров нет, оба изменения на месте
git add config.py
git commit -m "Merge release: keep version 2.0"
git log --oneline`,
        suggestions: ['git merge release', 'git status', 'cat config.py', 'git add config.py', 'git commit -m "Merge release"', 'git merge --abort'],
      },
      tasks: [
        {
          title: 'Задание 1: прочитай конфликт, не решая его',
          difficulty: 'easy',
          lang: 'bash',
          description: 'Сбрось терминал, сделай git merge release и, не трогая файл, ответь по выводу cat config.py: какие строки Git слил сам, какая строка в конфликте, что предлагает каждая сторона? Потом отмени слияние через git merge --abort и убедись через git status и cat, что всё как было.',
          hints: ['Вне маркеров — уже слито: APP_NAME, DEBUG = False (из main), GREETING (из release). В маркерах — только VERSION.', 'После --abort: working tree clean, config.py — версия main с VERSION = "1.1".'],
          solution: `git merge release
cat config.py
git merge --abort
git status                        # nothing to commit, working tree clean
cat config.py                     # VERSION = "1.1", DEBUG = False`,
        },
        {
          title: 'Задание 2: попробуй сделать неправильно',
          difficulty: 'medium',
          lang: 'bash',
          description: 'Сбрось терминал, снова вызови конфликт. Сначала попробуй git commit сразу — прочитай отказ. Потом сделай git add config.py, НЕ убрав маркеры, и снова git commit — прочитай отказ учебного git и объясни, почему настоящий Git тут бы коммит пропустил и чем это опасно. Затем разреши правильно.',
          hints: ['Первый отказ: unmerged files — файл не добавлен. Второй: маркеры в содержимом — учебная защита; настоящий Git содержимое не проверяет, и файл с <<<<<<< уехал бы в main.', 'Python-файл с маркерами — SyntaxError при запуске: упадёт приложение.'],
          solution: `git merge release
git commit -m "merge"             # error: unmerged files
git add config.py
git commit -m "merge"             # error: остались маркеры конфликта
echo 'APP_NAME = "shop-api"' > config.py
echo 'VERSION = "2.0"' >> config.py
echo 'DEBUG = False' >> config.py
echo 'GREETING = "hello, user"' >> config.py
git add config.py && git commit -m "Merge release: keep version 2.0"`,
        },
        {
          title: 'Задание 3: конфликт своими руками с нуля',
          difficulty: 'hard',
          lang: 'bash',
          description: 'Сбрось терминал и создай СВОЙ конфликт: от main сделай ветку experiment, в ней измени первую строку config.py (APP_NAME) и закоммить; вернись в main, измени ту же первую строку по-другому и закоммить; слей experiment в main. Разреши конфликт третьим вариантом — значением, которого не было ни в одной ветке (например, APP_NAME = "shop-api-v3"), и заверши слияние. Убедись через git log, что это merge-коммит.',
          hints: ['Чтобы изменить только первую строку и сохранить остальные, проще переписать файл целиком четырьмя echo.', 'Третий вариант — тоже законное разрешение: главное, чтобы в файле не было маркеров и результат был осознанным.'],
          solution: `git checkout -b experiment
echo 'APP_NAME = "shop-api-experimental"' > config.py
echo 'VERSION = "1.1"' >> config.py; echo 'DEBUG = False' >> config.py; echo 'GREETING = "hello"' >> config.py
git add . && git commit -m "Rename app (experiment)"
git checkout main
echo 'APP_NAME = "shop-api-prod"' > config.py
echo 'VERSION = "1.1"' >> config.py; echo 'DEBUG = False' >> config.py; echo 'GREETING = "hello"' >> config.py
git add . && git commit -m "Rename app (prod)"
git merge experiment              # CONFLICT в строке APP_NAME
echo 'APP_NAME = "shop-api-v3"' > config.py
echo 'VERSION = "1.1"' >> config.py; echo 'DEBUG = False' >> config.py; echo 'GREETING = "hello"' >> config.py
git add config.py && git commit -m "Merge experiment: new app name"
git log -1                        # Merge: ... ...`,
        },
      ],
      mistakes: [
        {
          wrong: 'Увидеть CONFLICT, испугаться, удалить папку проекта и склонировать заново',
          right: 'Конфликт — штатная ситуация. git status покажет файлы, cat — маркеры, echo/редактор — правка, git add + git commit — завершение. А git merge --abort всегда вернёт всё как было',
        },
        {
          wrong: 'Разрешать конфликт, оставляя «свою» версию не глядя (или жать Accept Current во всех местах подряд)',
          right: 'Прочитай, что хотела другая сторона. Часто правильный результат — обе правки или третий вариант. Молча выкинутая чужая правка — потерянная работа коллеги, которую заметят в проде',
        },
      ],
      checklist: [
        'Спокойно читаю вывод CONFLICT и git status с Unmerged paths',
        'Разбираю блок <<<<<<< HEAD / ======= / >>>>>>> ветка: чья версия где',
        'Разрешаю конфликт: переписать файл без маркеров → git add → git commit',
        'Никогда не коммичу маркеры и не выбираю версию не глядя — сохраняю изменения обеих сторон',
        'Знаю git merge --abort как безопасный откат незавершённого слияния',
      ],
    },

    // ------------------------------------------------------------------
    // Урок 4. Rebase
    // ------------------------------------------------------------------
    {
      id: 'git-rebase-basics',
      title: 'Rebase: переписать историю вместо merge-коммита',
      summary: 'Чем rebase отличается от merge, когда в команде выбирают что, золотое правило «не перебазируй общие ветки» — и rebase руками на ветке без конфликтов',
      theory: [
        {
          type: 'p',
          text: 'После десятка слияний git log превращается в паутину из merge-коммитов «Merge branch \'feature-17\'». Читать её тяжело, искать, где сломалось, — тем более. Многие команды поэтому предпочитают другой способ соединять ветки — rebase. Результат по содержимому тот же, но история остаётся прямой линией. Цена — rebase переписывает коммиты, и это накладывает одно жёсткое правило.',
        },
        {
          type: 'analogy',
          text: 'Merge — это склеить две линии времени и оставить шов: «здесь встретились». Rebase — это переписать СВОЮ линию так, будто ты начал работу уже после того, как коллега закончил свою. Твои коммиты по одному «переносятся» на конец его истории: тот же смысл, те же правки, но каждый — заново, с новым id. Швов нет, история читается сверху вниз как рассказ. Но раз коммиты пересозданы — старых больше нет, и если кто-то успел взять их себе, у него в руках останется «старая» версия истории, несовместимая с твоей.',
        },
        {
          type: 'steps',
          title: 'Rebase по шагам (стоя в feature)',
          items: [
            { code: 'git checkout feature', note: 'Перебазируют СВОЮ ветку на чужую, поэтому стоим в feature' },
            { code: 'git rebase main', note: '«Возьми мои коммиты, которых нет в main, и переложи их поверх последнего коммита main». Git временно откладывает твои коммиты, ставит ветку на main и применяет их по одному' },
            { code: 'git log --oneline --all', note: 'История прямая: main → твои коммиты. Id твоих коммитов изменились — это новые коммиты с тем же содержимым' },
            { code: 'git checkout main && git merge feature', note: 'Теперь main — прямой предок feature, и слияние — fast-forward: без merge-коммита, история остаётся линией' },
          ],
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Золотое правило: не перебазируй то, что уже у других',
          text: 'Rebase создаёт новые коммиты вместо старых. Если старые уже запушены и коллега их скачал, после твоего rebase у вас разная история — и следующий git pull превратится в кашу из дубликатов и конфликтов. Поэтому: rebase — только для своей локальной ветки, пока она не слита и не используется другими. main, develop и любую общую ветку не перебазируют никогда. Нарушение этого правила — классический способ испортить день всей команде.',
        },
        {
          type: 'list',
          title: 'Merge или rebase — как решают в командах',
          items: [
            'Типичный рабочий процесс: пока делаешь фичу, периодически git rebase main в своей ветке — подтягиваешь свежий main и ловишь конфликты рано, маленькими порциями. Перед Pull Request — ещё раз, чтобы ветка «ложилась» на main без швов.',
            'Слияние в main — по правилам команды: merge (виден шов, видно, что фича — это группа коммитов), squash (все коммиты фичи схлопываются в один) или rebase-and-merge (линейная история). На GitHub это три кнопки в Pull Request.',
            'Конфликт при rebase тоже возможен — на каждом переносимом коммите. Решается так же: поправить файл, git add, но затем git rebase --continue вместо commit. Если запутался — git rebase --abort.',
            'Учебный движок переносит коммиты только без конфликтов; при конфликте он честно отменит rebase и предложит merge. В настоящем Git ты бы решил конфликт и продолжил — механика та же, что в прошлом уроке.',
          ],
        },
      ],
      example: {
        title: 'Одни и те же ветки: merge против rebase',
        lang: 'bash',
        code: `# Исходно: main и feature разошлись от a1b2c3d
#   d4e5f6a (main)    Describe project in readme
#   e7f8a9b (feature) Greet by name
#   a1b2c3d           Initial commit

# --- Вариант A: merge (в main) ---
git checkout main && git merge feature
git log --oneline
#   7c1e5b0 (HEAD -> main) Merge branch 'feature'    ← шов, два родителя
#   d4e5f6a Describe project in readme
#   e7f8a9b (feature) Greet by name
#   a1b2c3d Initial commit

# --- Вариант B: rebase (в feature), затем fast-forward ---
git checkout feature && git rebase main
git log --oneline
#   9a4f2d7 (HEAD -> feature) Greet by name      ← тот же коммит, но НОВЫЙ id
#   d4e5f6a (main) Describe project in readme
#   a1b2c3d Initial commit
git checkout main && git merge feature          # Fast-forward
#   9a4f2d7 (HEAD -> main, feature) Greet by name  ← прямая линия, швов нет`,
        explanation: 'Содержимое файлов в обоих вариантах одинаковое. Разница — в форме истории: A хранит факт «здесь было слияние», B выглядит так, будто feature писали уже после d4e5f6a. Обрати внимание на id: e7f8a9b исчез, вместо него 9a4f2d7 — именно поэтому rebase опасен для веток, которые уже у других.',
      },
      gitLab: {
        initialRepo: REBASE_LAB_REPO,
        goal: 'Ты в feature; main ушёл вперёд (обновил README.md). Перебазируй feature на main, а затем влей feature в main так, чтобы история main осталась ПРЯМОЙ ЛИНИЕЙ: без merge-коммитов, коммит «Greet by name» стоит сразу после «Describe project in readme», и в main есть оба изменения. Сам main переписывать нельзя — его коммит d4e5f6a должен остаться в истории.',
        check: (shell) => {
          const git = shell.git;
          if (!git || git.mergeState) return false;
          const tip = git.branchCommit('main');
          if (!tip || hasMergeCommitInHistory(git, 'main')) return false;
          if (tip.message !== 'Greet by name' || tip.parentIds[0] !== 'd4e5f6a') return false;
          if (tip.id === 'e7f8a9b') return false; // должен быть перенесённый (новый) коммит
          return tip.tree['app.py'] === 'print("hello, user")\n' && tip.tree['README.md'] === '# Shop API\n\nБэкенд интернет-магазина.\n';
        },
        hint: 'Rebase делают из СВОЕЙ ветки (ты уже в feature) и указывают, на что перебазировать. Потом посмотри git log --oneline --all: feature должна стоять над main. Дальше — перейти в main и слить feature: это будет fast-forward.',
        solution: `git rebase main                  # Successfully rebased ...
git log --oneline --all          # feature над main, новый id у "Greet by name"
git checkout main
git merge feature                # Fast-forward
git log --oneline                # прямая линия без Merge-коммитов`,
        suggestions: ['git log --oneline --all', 'git rebase main', 'git checkout main', 'git merge feature', 'git log --oneline'],
      },
      tasks: [
        {
          title: 'Задание 1: найди переписанный коммит',
          difficulty: 'easy',
          lang: 'bash',
          description: 'Сбрось терминал. Запиши id коммита «Greet by name» до rebase (git log --oneline). Сделай git rebase main и снова посмотри лог. Что изменилось у этого коммита, а что нет? Проверь через git show, что содержимое правки то же самое.',
          hints: ['До: e7f8a9b. После — новый id, но сообщение и diff (+print("hello, user")) те же.', 'Родитель нового коммита — d4e5f6a (кончик main), а не a1b2c3d.'],
          solution: `git log --oneline --all          # e7f8a9b (HEAD -> feature) Greet by name
git rebase main
git log --oneline --all          # <новый id> (HEAD -> feature) Greet by name, под ним d4e5f6a (main)
git show HEAD                    # тот же diff app.py`,
        },
        {
          title: 'Задание 2: сравни две формы истории',
          difficulty: 'medium',
          lang: 'bash',
          description: 'Сбрось терминал и сделай слияние ЧЕРЕЗ MERGE (без rebase): перейди в main и влей feature. Посмотри git log и граф. Затем сбрось и сделай через rebase + fast-forward (как в цели). Сравни два git log: где merge-коммит, где прямая линия, одинаковы ли файлы в итоге?',
          hints: ['Вариант merge: в логе «Merge branch \'feature\'» с двумя родителями, граф с кружком-швом.', 'Вариант rebase: три коммита в линию, файлы app.py и README.md в обоих вариантах одинаковые.'],
          solution: `# вариант A
git checkout main && git merge feature && git log --oneline && cat app.py README.md
# «Сбросить», вариант B
git rebase main && git checkout main && git merge feature && git log --oneline && cat app.py README.md`,
        },
        {
          title: 'Задание 3: нарушь золотое правило и объясни последствия',
          difficulty: 'hard',
          lang: 'bash',
          description: 'Сбрось терминал. Перейди в main и перебазируй его на feature (git rebase feature) — то есть перепиши ОБЩУЮ ветку. Посмотри лог: что случилось с коммитом d4e5f6a? Представь, что d4e5f6a уже был запушен и коллега его скачал. Опиши словами, что увидит коллега при следующем git pull и почему это правило называют золотым. (Файлы при этом получились правильные — в чём тогда проблема?)',
          hints: ['d4e5f6a исчез из main — вместо него новый коммит с тем же сообщением поверх feature. На сервере же по-прежнему d4e5f6a.', 'У коллеги и у тебя main теперь расходится: git pull попытается слить «две версии» одного коммита — дубликаты, конфликты, испорченная история у всей команды. Проблема не в файлах, а в несовместимой истории общей ветки.'],
          solution: `git checkout main
git rebase feature
git log --oneline --all          # d4e5f6a пропал: вместо него новый id поверх e7f8a9b
# Файлы верные, но общая ветка main переписана. Коллега с «настоящим» d4e5f6a
# при git pull получит расхождение историй — поэтому rebase только для своих
# локальных, ещё не запушенных веток.`,
        },
      ],
      mistakes: [
        {
          wrong: 'Сделать git rebase на main или другой общей ветке «чтобы история была красивой»',
          right: 'Rebase переписывает коммиты. Общие ветки не перебазируют никогда — только свою локальную, пока она не запушена и не используется другими',
        },
        {
          wrong: 'После конфликта при rebase писать git commit, как при merge',
          right: 'При rebase после правки и git add — git rebase --continue (Git продолжит переносить остальные коммиты). Запутался — git rebase --abort',
        },
      ],
      checklist: [
        'Объясняю разницу: merge оставляет шов (merge-коммит), rebase переписывает мои коммиты поверх чужих — прямая история, новые id',
        'Умею: git checkout feature → git rebase main → git checkout main → git merge feature (fast-forward)',
        'Знаю золотое правило: не перебазировать общие/запушенные ветки — и могу объяснить почему',
        'Понимаю, как командный процесс сочетает rebase в своей ветке и merge/squash в main',
        'Знаю, что конфликт при rebase решается так же, но завершается git rebase --continue',
      ],
    },
  ],
};
