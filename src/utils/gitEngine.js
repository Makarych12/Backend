// Учебный Git-движок поверх виртуальной файловой системы VirtualShell (src/utils/virtualShell.js).
// Хранит граф коммитов, ветки, HEAD и индекс (staging); рабочая директория — это обычные файлы
// в shell.fs, поэтому конфликт разрешается тем же `echo "..." > file`, что ученик знает из
// модуля 32.
//
// Слияние — упрощённый three-way merge: файлы сравниваются ПОСТРОЧНО ПО НОМЕРУ СТРОКИ относительно
// общего предка (base) по четырём правилам:
//   1. строка не менялась ни в одной ветке      → берём как есть
//   2. менялась только в одной ветке            → берём изменённую
//   3. менялась в обеих одинаково               → берём это изменение
//   4. менялась в обеих по-разному              → КОНФЛИКТ с маркерами <<<<<<< / ======= / >>>>>>>
// Настоящий Git использует diff3/LCS и умеет матчить сдвинутые блоки строк; здесь вставка строки
// в одной ветке «сдвигает» сравнение — это осознанное упрощение, о нём честно сказано в уроке.
//
// Формат initialRepo (для поля урока gitLab и опции VirtualShell { git }):
//   {
//     root: '/home/user/project',                      // необязательно
//     commits: [{ id, parentIds, message, tree: { 'app.py': '...' } }, ...],
//     branches: { main: 'c2', feature: 'c3' },
//     HEAD: 'main',
//     workingFiles: { 'app.py': '...' },                // необязательно: по умолчанию tree HEAD
//   }
// Пустой объект / отсутствие commits — репозитория ещё нет, нужен `git init`.

const AUTHOR = 'user <user@backend>';
const GIT_IGNORED = new Set(['.git']);

function res(stdout = '', stderr = '', code = 0) {
  return { stdout, stderr, code };
}

function fail(text, code = 1) {
  return res('', text.endsWith('\n') ? text : text + '\n', code);
}

function splitLines(text) {
  if (text === '' || text === undefined || text === null) return [];
  return text.replace(/\n$/, '').split('\n');
}

function joinLines(lines) {
  return lines.length ? lines.join('\n') + '\n' : '';
}

// Детерминированный «хеш» коммита — 7 hex-символов, как в git log --oneline.
function fakeHash(seed) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  let hex = h.toString(16);
  while (hex.length < 8) hex = '0' + hex;
  return hex.slice(0, 7);
}

// Простой LCS-дифф двух списков строк → [{ type: ' ' | '-' | '+', text }]
function lineDiff(a, b) {
  const n = a.length;
  const m = b.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const out = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      out.push({ type: ' ', text: a[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      out.push({ type: '-', text: a[i++] });
    } else {
      out.push({ type: '+', text: b[j++] });
    }
  }
  while (i < n) out.push({ type: '-', text: a[i++] });
  while (j < m) out.push({ type: '+', text: b[j++] });
  return out;
}

// Три версии файла → { content, conflict }
export function mergeText(base, ours, theirs, oursLabel, theirsLabel) {
  const b = splitLines(base);
  const o = splitLines(ours);
  const t = splitLines(theirs);
  const n = Math.max(b.length, o.length, t.length);
  const out = [];
  let conflict = false;
  let block = null; // { ours: [], theirs: [] }
  const flush = () => {
    if (!block) return;
    out.push(`<<<<<<< ${oursLabel}`);
    out.push(...block.ours);
    out.push('=======');
    out.push(...block.theirs);
    out.push(`>>>>>>> ${theirsLabel}`);
    block = null;
  };
  for (let i = 0; i < n; i++) {
    const bl = b[i];
    const ol = o[i];
    const tl = t[i];
    let take;
    let isConflict = false;
    if (ol === tl) take = ol; // правила 1 и 3
    else if (ol === bl) take = tl; // правило 2 (менялась только у них)
    else if (tl === bl) take = ol; // правило 2 (менялась только у нас)
    else isConflict = true; // правило 4
    if (isConflict) {
      conflict = true;
      if (!block) block = { ours: [], theirs: [] };
      if (ol !== undefined) block.ours.push(ol);
      if (tl !== undefined) block.theirs.push(tl);
    } else {
      flush();
      if (take !== undefined) out.push(take);
    }
  }
  flush();
  return { content: joinLines(out), conflict };
}

export class GitEngine {
  constructor(shell, initialRepo = {}) {
    this.shell = shell;
    this.root = initialRepo.root ?? '/home/user/project';
    this.commits = {};
    this.order = []; // id в порядке создания
    this.branches = {};
    this.head = null; // имя текущей ветки
    this.index = {}; // path → content (снимок, как настоящий индекс git)
    this.mergeState = null; // { branch, commitId, conflicts: Set<path> }
    this.clock = 0;
    this.initialized = false;
    this.load(initialRepo);
  }

  // ---------- загрузка стартового состояния ----------

  load(repo) {
    const commits = repo.commits ?? [];
    if (commits.length === 0 && !repo.branches) {
      // репозитория нет: только рабочие файлы, если заданы
      this._writeWorking(repo.workingFiles ?? {}, true);
      return;
    }
    this.initialized = true;
    for (const c of commits) {
      this.clock += 1;
      this.commits[c.id] = {
        id: c.id,
        parentIds: [...(c.parentIds ?? [])],
        message: c.message,
        tree: { ...(c.tree ?? {}) },
        time: this.clock,
      };
      this.order.push(c.id);
    }
    this.branches = { ...(repo.branches ?? {}) };
    this.head = repo.HEAD ?? Object.keys(this.branches)[0] ?? 'main';
    const headTree = this.headCommit()?.tree ?? {};
    this.index = { ...headTree };
    this._ensureGitDir();
    this._writeWorking(repo.workingFiles ?? headTree, true);
  }

  // ---------- доступ к состоянию (для check() в уроках) ----------

  headCommit() {
    const id = this.branches[this.head];
    return id ? this.commits[id] : null;
  }

  commit(id) {
    return this.commits[id] ?? null;
  }

  branchCommit(name) {
    return this.branches[name] ? this.commits[this.branches[name]] : null;
  }

  // Все коммиты, достижимые из ветки (или HEAD), новые первыми.
  history(branch = this.head) {
    const start = this.branches[branch];
    if (!start) return [];
    const seen = new Set();
    const result = [];
    const stack = [start];
    while (stack.length) {
      const id = stack.pop();
      if (seen.has(id) || !this.commits[id]) continue;
      seen.add(id);
      result.push(this.commits[id]);
      stack.push(...this.commits[id].parentIds);
    }
    return result.sort((a, b) => b.time - a.time);
  }

  isAncestor(maybeAncestor, id) {
    const stack = [id];
    const seen = new Set();
    while (stack.length) {
      const cur = stack.pop();
      if (cur === maybeAncestor) return true;
      if (seen.has(cur) || !this.commits[cur]) continue;
      seen.add(cur);
      stack.push(...this.commits[cur].parentIds);
    }
    return false;
  }

  mergeBase(a, b) {
    const ancestorsA = new Set();
    const stack = [a];
    while (stack.length) {
      const cur = stack.pop();
      if (ancestorsA.has(cur) || !this.commits[cur]) continue;
      ancestorsA.add(cur);
      stack.push(...this.commits[cur].parentIds);
    }
    // обход от b по времени (новые первыми) — первый общий предок и есть база
    const queue = [b];
    const seen = new Set();
    while (queue.length) {
      queue.sort((x, y) => (this.commits[y]?.time ?? 0) - (this.commits[x]?.time ?? 0));
      const cur = queue.shift();
      if (seen.has(cur) || !this.commits[cur]) continue;
      seen.add(cur);
      if (ancestorsA.has(cur)) return cur;
      queue.push(...this.commits[cur].parentIds);
    }
    return null;
  }

  hasConflictMarkers(path) {
    const content = this.workingFile(path);
    return typeof content === 'string' && /^(<<<<<<<|=======|>>>>>>>)/m.test(content);
  }

  workingFile(path) {
    return this.shell.readFile(`${this.root}/${path}`);
  }

  // ---------- рабочая директория ----------

  _ensureGitDir() {
    const rootNode = this.shell.getNode(this.root);
    if (!rootNode) this.shell.run(`mkdir -p ${this.root}`);
    const node = this.shell.getNode(this.root);
    if (node && node.type === 'dir' && !node.children['.git']) {
      node.children['.git'] = { type: 'dir', children: {}, mode: '755', owner: this.shell.user };
    }
  }

  _writeWorking(files, replaceAll = false) {
    const rootNode = this.shell.getNode(this.root) ?? (this.shell.run(`mkdir -p ${this.root}`), this.shell.getNode(this.root));
    if (replaceAll) {
      for (const name of Object.keys(rootNode.children)) {
        if (!GIT_IGNORED.has(name)) delete rootNode.children[name];
      }
    }
    for (const [path, content] of Object.entries(files)) this._writeFile(path, content);
  }

  _writeFile(path, content) {
    const abs = `${this.root}/${path}`;
    const dir = abs.split('/').slice(0, -1).join('/');
    if (!this.shell.getNode(dir)) this.shell.run(`mkdir -p ${dir}`);
    const parent = this.shell.getNode(dir);
    const name = path.split('/').pop();
    const existing = parent.children[name];
    if (existing && existing.type === 'file') existing.content = content;
    else parent.children[name] = { type: 'file', content, mode: '644', owner: this.shell.user };
  }

  _deleteFile(path) {
    const abs = `${this.root}/${path}`;
    const dir = abs.split('/').slice(0, -1).join('/');
    const parent = this.shell.getNode(dir);
    const name = path.split('/').pop();
    if (parent?.children?.[name]) delete parent.children[name];
  }

  // Все файлы рабочей директории: path → content
  workingTree() {
    const out = {};
    const walk = (node, prefix) => {
      for (const [name, child] of Object.entries(node.children)) {
        if (!prefix && GIT_IGNORED.has(name)) continue;
        const path = prefix ? `${prefix}/${name}` : name;
        if (child.type === 'file') out[path] = child.content;
        else walk(child, path);
      }
    };
    const rootNode = this.shell.getNode(this.root);
    if (rootNode?.type === 'dir') walk(rootNode, '');
    return out;
  }

  // Путь из аргумента команды → путь относительно корня репозитория
  _relPath(arg) {
    const abs = this.shell.resolve(arg);
    if (abs === this.root) return '.';
    if (!abs.startsWith(this.root + '/')) return null;
    return abs.slice(this.root.length + 1);
  }

  _inRepo() {
    const cwd = this.shell.cwd;
    return cwd === this.root || cwd.startsWith(this.root + '/');
  }

  // ---------- статус ----------

  _statusData() {
    const headTree = this.headCommit()?.tree ?? {};
    const working = this.workingTree();
    const staged = []; // { type, path }
    const unstaged = [];
    const untracked = [];
    const conflicts = this.mergeState ? [...this.mergeState.conflicts] : [];
    const conflictSet = new Set(conflicts);
    const allPaths = new Set([...Object.keys(headTree), ...Object.keys(this.index), ...Object.keys(working)]);
    for (const path of [...allPaths].sort()) {
      if (conflictSet.has(path)) continue;
      const inHead = path in headTree;
      const inIndex = path in this.index;
      const inWork = path in working;
      if (inIndex && !inHead) staged.push({ type: 'new file', path });
      else if (!inIndex && inHead) staged.push({ type: 'deleted', path });
      else if (inIndex && inHead && this.index[path] !== headTree[path]) staged.push({ type: 'modified', path });

      if (inIndex && inWork && working[path] !== this.index[path]) unstaged.push({ type: 'modified', path });
      else if (inIndex && !inWork) unstaged.push({ type: 'deleted', path });
      else if (!inIndex && inWork && !inHead) untracked.push(path);
    }
    return { staged, unstaged, untracked, conflicts };
  }

  _hasUncommittedTracked() {
    const { staged, unstaged, conflicts } = this._statusData();
    return staged.length > 0 || unstaged.length > 0 || conflicts.length > 0;
  }

  // ---------- команды ----------

  run(args) {
    const [sub, ...rest] = args;
    if (!sub || sub === '--help' || sub === 'help') {
      return res(
        'usage: git <command> [<args>]\n\nПоддерживаемые команды учебного git:\n   init  status  add  commit  branch  checkout  switch  log  diff  merge  rebase  restore  reset\n'
      );
    }
    if (sub === '--version') return res('git version 2.47.1 (учебный движок курса)\n');
    if (sub === 'init') return this.cmdInit();
    if (!this.initialized || !this._inRepo()) {
      return fail('fatal: not a git repository (or any of the parent directories): .git', 128);
    }
    switch (sub) {
      case 'status':
        return this.cmdStatus(rest);
      case 'add':
        return this.cmdAdd(rest);
      case 'commit':
        return this.cmdCommit(rest);
      case 'branch':
        return this.cmdBranch(rest);
      case 'checkout':
        return this.cmdCheckout(rest);
      case 'switch':
        return this.cmdCheckout(rest.map((a) => (a === '-c' ? '-b' : a)));
      case 'log':
        return this.cmdLog(rest);
      case 'diff':
        return this.cmdDiff(rest);
      case 'merge':
        return this.cmdMerge(rest);
      case 'rebase':
        return this.cmdRebase(rest);
      case 'restore':
        return this.cmdRestore(rest);
      case 'reset':
        return this.cmdReset(rest);
      case 'rm':
        return this.cmdRm(rest);
      case 'show':
        return this.cmdShow(rest);
      case 'config':
        return res();
      case 'push':
      case 'pull':
      case 'fetch':
      case 'clone':
      case 'remote':
        return fail(
          `fatal: удалённого репозитория в учебном терминале нет — команда git ${sub} здесь ничего не делает.\nВетки, слияния и конфликты происходят локально; push/pull ты уже знаешь по модулю 19.`
        );
      case 'stash':
        return fail('git stash в учебном движке не поддерживается: сделай коммит перед переключением ветки.');
      default:
        return fail(`git: '${sub}' is not a git command. See 'git --help'.`);
    }
  }

  cmdInit() {
    if (this.initialized && this._inRepo()) {
      return res(`Reinitialized existing Git repository in ${this.root}/.git/\n`);
    }
    this.root = this.shell.cwd;
    this.initialized = true;
    this.commits = {};
    this.order = [];
    this.branches = {};
    this.head = 'main';
    this.index = {};
    this.mergeState = null;
    this._ensureGitDir();
    return res(`Initialized empty Git repository in ${this.root}/.git/\n`);
  }

  cmdStatus(args) {
    const short = args.includes('-s') || args.includes('--short');
    const { staged, unstaged, untracked, conflicts } = this._statusData();
    if (short) {
      const lines = [];
      for (const p of conflicts) lines.push(`UU ${p}`);
      for (const s of staged) lines.push(`${s.type === 'new file' ? 'A' : s.type === 'deleted' ? 'D' : 'M'}  ${s.path}`);
      for (const u of unstaged) lines.push(` ${u.type === 'deleted' ? 'D' : 'M'} ${u.path}`);
      for (const p of untracked) lines.push(`?? ${p}`);
      return res(joinLines(lines));
    }
    const out = [];
    const headCommit = this.headCommit();
    out.push(`On branch ${this.head}`);
    if (!headCommit) out.push('', 'No commits yet');
    if (this.mergeState) {
      if (conflicts.length) {
        out.push('You have unmerged paths.', '  (fix conflicts and run "git commit")', '  (use "git merge --abort" to abort the merge)');
      } else {
        out.push('All conflicts fixed but you are still merging.', '  (use "git commit" to conclude merge)');
      }
    }
    if (conflicts.length) {
      out.push('', 'Unmerged paths:', '  (use "git add <file>..." to mark resolution)');
      for (const p of conflicts) out.push(`\tboth modified:   ${p}`);
    }
    if (staged.length) {
      out.push('', 'Changes to be committed:', '  (use "git restore --staged <file>..." to unstage)');
      for (const s of staged) out.push(`\t${s.type.padEnd(10)}  ${s.path}`);
    }
    if (unstaged.length) {
      out.push('', 'Changes not staged for commit:', '  (use "git add <file>..." to update what will be committed)', '  (use "git restore <file>..." to discard changes in working directory)');
      for (const u of unstaged) out.push(`\t${u.type.padEnd(10)}  ${u.path}`);
    }
    if (untracked.length) {
      out.push('', 'Untracked files:', '  (use "git add <file>..." to include in what will be committed)');
      for (const p of untracked) out.push(`\t${p}`);
    }
    if (!staged.length && !unstaged.length && !conflicts.length) {
      if (untracked.length) out.push('', 'nothing added to commit but untracked files present (use "git add" to track)');
      else if (!this.mergeState) out.push('', headCommit ? 'nothing to commit, working tree clean' : 'nothing to commit (create/copy files and use "git add" to track)');
    }
    return res(joinLines(out));
  }

  cmdAdd(args) {
    const targets = args.filter((a) => !a.startsWith('-'));
    if (targets.length === 0) return fail('Nothing specified, nothing added.\nhint: Maybe you wanted to say \'git add .\'?');
    const working = this.workingTree();
    let err = '';
    for (const t of targets) {
      const rel = this._relPath(t);
      if (rel === null) {
        err += `fatal: ${t}: '${t}' is outside repository at '${this.root}'\n`;
        continue;
      }
      const matches = rel === '.' ? Object.keys(working) : Object.keys(working).filter((p) => p === rel || p.startsWith(rel + '/'));
      const wasTracked = rel !== '.' && rel in this.index;
      if (matches.length === 0 && !wasTracked) {
        err += `fatal: pathspec '${t}' did not match any files\n`;
        continue;
      }
      for (const p of matches) {
        this.index[p] = working[p];
        this.mergeState?.conflicts.delete(p);
      }
      // удалённые из рабочей директории файлы — тоже стейджим удаление
      const scope = rel === '.' ? Object.keys(this.index) : Object.keys(this.index).filter((p) => p === rel || p.startsWith(rel + '/'));
      for (const p of scope) if (!(p in working)) delete this.index[p];
    }
    return err ? fail(err, 128) : res();
  }

  cmdCommit(args) {
    let message = null;
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '-m') message = args[i + 1];
      else if (args[i].startsWith('-m')) message = args[i].slice(2);
      else if (args[i] === '-am' || args[i] === '-a') {
        // git commit -a: застейджить все изменения отслеживаемых файлов
        const working = this.workingTree();
        for (const p of Object.keys(this.index)) {
          if (p in working) this.index[p] = working[p];
          else delete this.index[p];
        }
        if (args[i] === '-am') message = args[i + 1];
      }
    }
    if (!message) {
      return fail('error: в учебном терминале нет редактора для сообщения коммита.\nУкажи его прямо в команде: git commit -m "что сделано"');
    }
    const { staged, unstaged, conflicts, untracked } = this._statusData();
    if (conflicts.length) {
      return fail(
        `error: Committing is not possible because you have unmerged files.\nhint: Fix them up in the work tree, and then use 'git add <file>'\nhint: as appropriate to mark resolution and make a commit.\nfatal: Exiting because of an unresolved conflict.`
      );
    }
    // Учебная защита: маркеры конфликта в застейдженном содержимом
    for (const [p, content] of Object.entries(this.index)) {
      if (typeof content === 'string' && /^(<<<<<<<|=======|>>>>>>>)/m.test(content)) {
        return fail(
          `error: в файле ${p} остались маркеры конфликта (<<<<<<< / ======= / >>>>>>>).\nРазреши конфликт: перепиши файл без маркеров (echo "..." > ${p}), затем git add ${p} и повтори commit.`
        );
      }
    }
    if (staged.length === 0 && !this.mergeState) {
      const out = [`On branch ${this.head}`];
      if (unstaged.length) {
        out.push('Changes not staged for commit:');
        for (const u of unstaged) out.push(`\t${u.type.padEnd(10)}  ${u.path}`);
        out.push('', 'no changes added to commit (use "git add" and/or "git commit -a")');
      } else if (untracked.length) {
        out.push('Untracked files:');
        for (const p of untracked) out.push(`\t${p}`);
        out.push('', 'nothing added to commit but untracked files present (use "git add" to track)');
      } else out.push('nothing to commit, working tree clean');
      return res(joinLines(out), '', 1);
    }
    const parents = [];
    const headId = this.branches[this.head];
    if (headId) parents.push(headId);
    if (this.mergeState) parents.push(this.mergeState.commitId);
    const id = this._createCommit(parents, message, { ...this.index });
    const isMerge = parents.length > 1;
    const isRoot = parents.length === 0;
    this.mergeState = null;
    const changed = staged.length || Object.keys(this.index).length;
    return res(`[${this.head}${isRoot ? ' (root-commit)' : ''} ${id}] ${message}\n ${changed} file${changed === 1 ? '' : 's'} changed${isMerge ? ' (merge commit)' : ''}\n`);
  }

  _createCommit(parentIds, message, tree) {
    this.clock += 1;
    let id = fakeHash(`${parentIds.join(',')}|${message}|${JSON.stringify(tree)}|${this.clock}`);
    while (this.commits[id]) id = fakeHash(id + '.');
    this.commits[id] = { id, parentIds, message, tree, time: this.clock };
    this.order.push(id);
    this.branches[this.head] = id;
    return id;
  }

  cmdBranch(args) {
    const flags = args.filter((a) => a.startsWith('-'));
    const names = args.filter((a) => !a.startsWith('-'));
    if (flags.includes('-d') || flags.includes('-D')) {
      const name = names[0];
      if (!name || !this.branches[name]) return fail(`error: branch '${name ?? ''}' not found.`);
      if (name === this.head) return fail(`error: Cannot delete branch '${name}' checked out at '${this.root}'`);
      if (flags.includes('-d') && !this.isAncestor(this.branches[name], this.branches[this.head])) {
        return fail(`error: The branch '${name}' is not fully merged.\nIf you are sure you want to delete it, run 'git branch -D ${name}'.`);
      }
      const id = this.branches[name];
      delete this.branches[name];
      return res(`Deleted branch ${name} (was ${id}).\n`);
    }
    if (names.length === 0) {
      const list = Object.keys(this.branches).sort().map((b) => (b === this.head ? `* ${b}` : `  ${b}`));
      return res(joinLines(list));
    }
    const name = names[0];
    if (this.branches[name]) return fail(`fatal: a branch named '${name}' already exists`);
    if (!/^[A-Za-z0-9._/-]+$/.test(name)) return fail(`fatal: '${name}' is not a valid branch name`);
    const headId = this.branches[this.head];
    if (!headId) return fail(`fatal: not a valid object name: '${this.head}'`);
    this.branches[name] = headId;
    return res();
  }

  cmdCheckout(args) {
    const create = args.includes('-b');
    const names = args.filter((a) => !a.startsWith('-'));
    const name = names[0];
    if (!name) return fail('error: укажи ветку: git checkout <ветка> или git checkout -b <новая-ветка>');
    if (create) {
      const r = this.cmdBranch([name]);
      if (r.code !== 0) return r;
      this.head = name;
      return res(`Switched to a new branch '${name}'\n`);
    }
    if (!this.branches[name]) {
      // git checkout <file> — восстановить файл из индекса
      const rel = this._relPath(name);
      if (rel !== null && rel in this.index) return this.cmdRestore([name]);
      return fail(`error: pathspec '${name}' did not match any file(s) known to git`);
    }
    if (name === this.head) return res(`Already on '${name}'\n`);
    if (this.mergeState) return fail('error: you need to resolve your current index first (или git merge --abort)');
    if (this._hasUncommittedTracked()) {
      const { staged, unstaged } = this._statusData();
      const files = [...new Set([...staged, ...unstaged].map((x) => x.path))];
      return fail(
        `error: Your local changes to the following files would be overwritten by checkout:\n${files.map((f) => '\t' + f).join('\n')}\nPlease commit your changes or stash them before you switch branches.\nAborting`
      );
    }
    this._switchTo(name);
    return res(`Switched to branch '${name}'\n`);
  }

  _switchTo(branch) {
    const targetTree = this.commits[this.branches[branch]]?.tree ?? {};
    const currentTree = this.headCommit()?.tree ?? {};
    for (const p of Object.keys(currentTree)) if (!(p in targetTree)) this._deleteFile(p);
    for (const [p, content] of Object.entries(targetTree)) this._writeFile(p, content);
    this.index = { ...targetTree };
    this.head = branch;
  }

  _decorations(id) {
    const names = Object.keys(this.branches).filter((b) => this.branches[b] === id).sort();
    if (!names.length) return '';
    const parts = names.map((b) => (b === this.head ? `HEAD -> ${b}` : b));
    // HEAD -> первым
    parts.sort((a, b) => (a.startsWith('HEAD') ? -1 : b.startsWith('HEAD') ? 1 : 0));
    return ` (${parts.join(', ')})`;
  }

  cmdLog(args) {
    const oneline = args.includes('--oneline');
    const all = args.includes('--all');
    const graph = args.includes('--graph');
    let commits;
    if (all) {
      const seen = new Map();
      for (const b of Object.keys(this.branches)) for (const c of this.history(b)) seen.set(c.id, c);
      commits = [...seen.values()].sort((a, b) => b.time - a.time);
    } else commits = this.history();
    if (commits.length === 0) return fail(`fatal: your current branch '${this.head}' does not have any commits yet`, 128);
    const nArg = args.find((a) => /^-\d+$/.test(a)) || (args.includes('-n') ? `-${args[args.indexOf('-n') + 1]}` : null);
    if (nArg) commits = commits.slice(0, Number(nArg.slice(1)));
    const lines = [];
    for (const c of commits) {
      const prefix = graph ? (c.parentIds.length > 1 ? '*   ' : '* ') : '';
      if (oneline) {
        lines.push(`${prefix}${c.id}${this._decorations(c.id)} ${c.message}`);
        continue;
      }
      lines.push(`${prefix}commit ${c.id}${this._decorations(c.id)}`);
      if (c.parentIds.length > 1) lines.push(`${graph ? '|\\  ' : ''}Merge: ${c.parentIds.join(' ')}`);
      lines.push(`${graph ? '| ' : ''}Author: ${AUTHOR}`);
      lines.push(`${graph ? '| ' : ''}Date:   Sun Sep 13 10:${String(c.time).padStart(2, '0')}:00 2026 +0300`);
      lines.push(graph ? '| ' : '');
      lines.push(`${graph ? '| ' : ''}    ${c.message}`);
      lines.push(graph ? '| ' : '');
    }
    return res(joinLines(lines).replace(/\n\n$/, '\n'));
  }

  cmdDiff(args) {
    const staged = args.includes('--staged') || args.includes('--cached');
    const files = args.filter((a) => !a.startsWith('-')).map((a) => this._relPath(a)).filter(Boolean);
    const from = staged ? (this.headCommit()?.tree ?? {}) : this.index;
    const to = staged ? this.index : this.workingTree();
    const paths = [...new Set([...Object.keys(from), ...Object.keys(to)])].sort().filter((p) => !files.length || files.includes(p));
    const out = [];
    for (const p of paths) {
      const a = from[p];
      const b = to[p];
      if (a === b) continue;
      if (!staged && !(p in this.index)) continue; // untracked не показываем, как настоящий git diff
      out.push(`diff --git a/${p} b/${p}`);
      if (a === undefined) out.push('new file mode 100644');
      if (b === undefined) out.push('deleted file mode 100644');
      out.push(`--- ${a === undefined ? '/dev/null' : 'a/' + p}`);
      out.push(`+++ ${b === undefined ? '/dev/null' : 'b/' + p}`);
      const d = lineDiff(splitLines(a ?? ''), splitLines(b ?? ''));
      const removed = d.filter((x) => x.type === '-').length;
      const added = d.filter((x) => x.type === '+').length;
      out.push(`@@ -${removed} +${added} @@`);
      for (const x of d) out.push(`${x.type}${x.text}`);
    }
    return res(joinLines(out));
  }

  _diffStat(fromTree, toTree) {
    const lines = [];
    let files = 0;
    let ins = 0;
    let del = 0;
    const paths = [...new Set([...Object.keys(fromTree), ...Object.keys(toTree)])].sort();
    for (const p of paths) {
      if (fromTree[p] === toTree[p]) continue;
      const d = lineDiff(splitLines(fromTree[p] ?? ''), splitLines(toTree[p] ?? ''));
      const a = d.filter((x) => x.type === '+').length;
      const r = d.filter((x) => x.type === '-').length;
      files += 1;
      ins += a;
      del += r;
      lines.push(` ${p.padEnd(12)} | ${String(a + r).padStart(2)} ${'+'.repeat(Math.min(a, 20))}${'-'.repeat(Math.min(r, 20))}`);
    }
    lines.push(` ${files} file${files === 1 ? '' : 's'} changed, ${ins} insertion${ins === 1 ? '' : 's'}(+), ${del} deletion${del === 1 ? '' : 's'}(-)`);
    return lines;
  }

  cmdMerge(args) {
    if (args.includes('--abort')) {
      if (!this.mergeState) return fail('fatal: There is no merge to abort (MERGE_HEAD missing).', 128);
      const tree = this.headCommit()?.tree ?? {};
      this._writeWorking(tree, true);
      this.index = { ...tree };
      this.mergeState = null;
      return res();
    }
    const name = args.find((a) => !a.startsWith('-'));
    if (!name) return fail('fatal: No remote for the current branch.\nПодсказка: укажи ветку — git merge <ветка>', 128);
    if (this.mergeState) return fail('error: Merging is not possible because you have unmerged files.\nhint: Fix them up in the work tree, and then use \'git add <file>\'\nfatal: Exiting because of an unresolved conflict.', 128);
    if (!this.branches[name]) return fail(`merge: ${name} - not something we can merge`);
    if (name === this.head) return res('Already up to date.\n');
    if (this._hasUncommittedTracked()) {
      return fail('error: Your local changes would be overwritten by merge.\nhint: Please commit your changes before you merge.\nfatal: Exiting because of unfinished changes.', 128);
    }
    const oursId = this.branches[this.head];
    const theirsId = this.branches[name];
    const base = this.mergeBase(oursId, theirsId);
    if (base === theirsId) return res('Already up to date.\n');
    if (base === oursId) {
      // fast-forward
      const fromTree = this.commits[oursId].tree;
      const toTree = this.commits[theirsId].tree;
      this.branches[this.head] = theirsId;
      this._writeWorking(toTree, true);
      this.index = { ...toTree };
      return res(joinLines([`Updating ${oursId}..${theirsId}`, 'Fast-forward', ...this._diffStat(fromTree, toTree)]));
    }
    // three-way merge
    const baseTree = this.commits[base]?.tree ?? {};
    const oursTree = this.commits[oursId].tree;
    const theirsTree = this.commits[theirsId].tree;
    const result = {};
    const conflicts = new Set();
    const out = [];
    const paths = [...new Set([...Object.keys(baseTree), ...Object.keys(oursTree), ...Object.keys(theirsTree)])].sort();
    for (const p of paths) {
      const b = baseTree[p];
      const o = oursTree[p];
      const t = theirsTree[p];
      if (o === t) {
        if (o !== undefined) result[p] = o;
      } else if (o === b) {
        if (t !== undefined) result[p] = t;
      } else if (t === b) {
        if (o !== undefined) result[p] = o;
      } else if (o === undefined || t === undefined) {
        // изменён у одних, удалён у других
        conflicts.add(p);
        result[p] = o ?? t;
        out.push(`CONFLICT (modify/delete): ${p} deleted in ${o === undefined ? this.head : name} and modified in ${o === undefined ? name : this.head}.`);
      } else {
        const merged = mergeText(b ?? '', o, t, 'HEAD', name);
        out.push(`Auto-merging ${p}`);
        result[p] = merged.content;
        if (merged.conflict) {
          conflicts.add(p);
          out.push(`CONFLICT (content): Merge conflict in ${p}`);
        }
      }
    }
    this._writeWorking(result, true);
    this.index = { ...result };
    for (const p of conflicts) delete this.index[p];
    if (conflicts.size) {
      this.mergeState = { branch: name, commitId: theirsId, conflicts };
      out.push('Automatic merge failed; fix conflicts and then commit the result.');
      return res(joinLines(out), '', 1);
    }
    const message = this.head === 'main' || this.head === 'master' ? `Merge branch '${name}'` : `Merge branch '${name}' into ${this.head}`;
    this._createCommit([oursId, theirsId], message, { ...result });
    out.push("Merge made by the 'ort' strategy.", ...this._diffStat(oursTree, result));
    return res(joinLines(out));
  }

  cmdRebase(args) {
    const name = args.find((a) => !a.startsWith('-'));
    if (args.includes('--abort') || args.includes('--continue')) return fail('fatal: No rebase in progress?', 128);
    if (!name) return fail('fatal: укажи ветку, на которую перебазировать: git rebase <ветка>', 128);
    if (!this.branches[name]) return fail(`fatal: invalid upstream '${name}'`, 128);
    if (this.mergeState) return fail('error: cannot rebase: You have unmerged files.', 128);
    if (this._hasUncommittedTracked()) return fail('error: cannot rebase: You have unstaged changes.\nerror: Please commit or stash them.', 128);
    const oursId = this.branches[this.head];
    const ontoId = this.branches[name];
    const base = this.mergeBase(oursId, ontoId);
    if (base === ontoId) return res(`Current branch ${this.head} is up to date.\n`);
    if (base === oursId) {
      // просто fast-forward
      this.branches[this.head] = ontoId;
      this._switchTo(this.head);
      return res(`Successfully rebased and updated refs/heads/${this.head}.\n`);
    }
    // коммиты текущей ветки после базы (по первому родителю), старые первыми
    const chain = [];
    let cur = oursId;
    while (cur && cur !== base) {
      const c = this.commits[cur];
      if (!c) break;
      chain.unshift(c);
      cur = c.parentIds[0];
    }
    let newParent = ontoId;
    let parentTree = this.commits[ontoId].tree;
    const replayed = [];
    for (const c of chain) {
      const oldParentTree = this.commits[c.parentIds[0]]?.tree ?? {};
      const newTree = {};
      const paths = [...new Set([...Object.keys(oldParentTree), ...Object.keys(c.tree), ...Object.keys(parentTree)])];
      for (const p of paths) {
        const b = oldParentTree[p];
        const o = parentTree[p]; // «наше» при rebase — то, на что перебазируем
        const t = c.tree[p]; // «их» — перекладываемый коммит
        if (o === t) {
          if (o !== undefined) newTree[p] = o;
        } else if (t === b) {
          if (o !== undefined) newTree[p] = o;
        } else if (o === b) {
          if (t !== undefined) newTree[p] = t;
        } else if (o === undefined || t === undefined) {
          return this._rebaseConflict(c, p);
        } else {
          const merged = mergeText(b ?? '', o, t, 'HEAD', c.id);
          if (merged.conflict) return this._rebaseConflict(c, p);
          newTree[p] = merged.content;
        }
      }
      this.clock += 1;
      let id = fakeHash(`${newParent}|${c.message}|${JSON.stringify(newTree)}|${this.clock}`);
      while (this.commits[id]) id = fakeHash(id + '.');
      this.commits[id] = { id, parentIds: [newParent], message: c.message, tree: newTree, time: this.clock };
      this.order.push(id);
      replayed.push(id);
      newParent = id;
      parentTree = newTree;
    }
    this.branches[this.head] = newParent;
    this._switchTo(this.head);
    return res(`Successfully rebased and updated refs/heads/${this.head}.\n(перенесено коммитов: ${replayed.length}, старые id заменены новыми — история переписана)\n`);
  }

  _rebaseConflict(commit, path) {
    return fail(
      `CONFLICT (content): Merge conflict in ${path}\nerror: could not apply ${commit.id}... ${commit.message}\n\nУчебный движок не поддерживает разрешение конфликтов во время rebase — rebase отменён, ветка не изменилась\n(в настоящем git ты бы исправил файл, сделал git add и git rebase --continue).\nДля веток с конфликтами используй git merge.`
    );
  }

  cmdRestore(args) {
    const staged = args.includes('--staged');
    const files = args.filter((a) => !a.startsWith('-'));
    if (!files.length) return fail('fatal: you must specify path(s) to restore', 128);
    const headTree = this.headCommit()?.tree ?? {};
    let err = '';
    for (const f of files) {
      const rel = this._relPath(f);
      const paths = rel === '.' ? Object.keys(staged ? this.index : this.index) : [rel];
      for (const p of paths) {
        if (staged) {
          if (p in headTree) this.index[p] = headTree[p];
          else delete this.index[p];
        } else if (p in this.index) {
          this._writeFile(p, this.index[p]);
        } else err += `error: pathspec '${f}' did not match any file(s) known to git\n`;
      }
    }
    return err ? fail(err) : res();
  }

  cmdReset(args) {
    const hard = args.includes('--hard');
    const files = args.filter((a) => !a.startsWith('-') && a !== 'HEAD');
    const headTree = this.headCommit()?.tree ?? {};
    if (files.length) return this.cmdRestore(['--staged', ...files]);
    this.index = { ...headTree };
    if (hard) {
      this._writeWorking(headTree, true);
      this.mergeState = null;
      return res(`HEAD is now at ${this.branches[this.head] ?? ''} ${this.headCommit()?.message ?? ''}\n`);
    }
    return res();
  }

  cmdRm(args) {
    const files = args.filter((a) => !a.startsWith('-'));
    let err = '';
    for (const f of files) {
      const rel = this._relPath(f);
      if (!rel || !(rel in this.index)) {
        err += `fatal: pathspec '${f}' did not match any files\n`;
        continue;
      }
      delete this.index[rel];
      if (!args.includes('--cached')) this._deleteFile(rel);
    }
    return err ? fail(err, 128) : res(files.map((f) => `rm '${f}'`).join('\n') + '\n');
  }

  cmdShow(args) {
    const ref = args.find((a) => !a.startsWith('-')) ?? 'HEAD';
    const id = ref === 'HEAD' ? this.branches[this.head] : this.branches[ref] ?? ref;
    const c = this.commits[id];
    if (!c) return fail(`fatal: ambiguous argument '${ref}': unknown revision`, 128);
    const parentTree = c.parentIds[0] ? this.commits[c.parentIds[0]].tree : {};
    const out = [`commit ${c.id}${this._decorations(c.id)}`, `Author: ${AUTHOR}`, '', `    ${c.message}`, ''];
    for (const p of [...new Set([...Object.keys(parentTree), ...Object.keys(c.tree)])].sort()) {
      if (parentTree[p] === c.tree[p]) continue;
      out.push(`diff --git a/${p} b/${p}`);
      for (const x of lineDiff(splitLines(parentTree[p] ?? ''), splitLines(c.tree[p] ?? ''))) out.push(`${x.type}${x.text}`);
    }
    return res(joinLines(out));
  }
}
