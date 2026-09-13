// Виртуальный Linux-шелл: НАСТОЯЩИЙ (пусть и маленький) интерпретатор команд поверх
// виртуальной файловой системы в памяти. В отличие от terminalSimulator.js здесь нет
// заготовленных ответов — команда реально читает и меняет состояние ФС, поэтому ученик
// может исследовать систему, ошибаться и решать задачу любым способом.
//
// Поддерживается: pwd, ls, cd, cat, mkdir, touch, rm, cp, mv, chmod, chown, echo, grep,
// find, wc, head, tail, sort, uniq, cut, xargs, tee, ps, top, kill, pkill, whoami, sudo,
// history, env/export, а также конвейеры `|`, перенаправления `>`, `>>`, `<`, `2>`,
// связки `&&`, `||`, `;`, переменные `$VAR`, подстановка `$(cmd)`, шаблоны `*.txt` и
// запуск bash-скриптов (`./script.sh`, `bash script.sh`) с `for`, `if`, переменными.
//
// Формат начальной ФС (initialFs) — максимально короткий, чтобы удобно было писать в уроках:
//   {
//     home: { user: { 'notes.txt': 'привет', projects: {} } },   // объект без type = каталог
//     etc:  { hostname: 'backend-01' },                          // строка = файл с таким текстом
//     'script.sh': { type: 'file', content: '...', mode: '755', owner: 'root' }, // полная форма
//   }
// Каждый узел после нормализации: { type: 'dir', children, mode, owner } или
// { type: 'file', content, mode, owner }. mode — три восьмеричные цифры ('644'), owner — имя.

const DEFAULT_USER = 'user';
const HOSTNAME = 'backend';
const KNOWN_USERS = new Set(['root', 'user', 'www-data', 'postgres', 'nobody', 'deploy', 'app']);
const FAKE_DATE = 'Sep 13 10:00';

const DEFAULT_PROCESSES = [
  { pid: 1, user: 'root', cpu: 0.0, mem: 0.1, command: '/sbin/init' },
  { pid: 412, user: 'root', cpu: 0.0, mem: 0.2, command: 'sshd: /usr/sbin/sshd -D' },
  { pid: 613, user: 'postgres', cpu: 0.3, mem: 2.4, command: 'postgres -D /var/lib/postgresql/data' },
  { pid: 977, user: 'user', cpu: 0.0, mem: 0.3, command: '-bash' },
  { pid: 1204, user: 'user', cpu: 1.2, mem: 3.8, command: 'uvicorn main:app --host 0.0.0.0 --port 8000' },
];

const MAX_SCRIPT_STEPS = 5000;

class ShellExit extends Error {
  constructor(code) {
    super('exit');
    this.code = code;
  }
}

// ---------- построение ФС ----------

// Владелец по умолчанию наследуется от родителя; корень принадлежит root, а всё внутри
// /home/<имя> — этому пользователю (если автор урока не указал owner явно).
function normalizeNode(raw, owner = 'root', path = '/') {
  const homeMatch = /^\/home\/([a-z_][a-z0-9_-]*)$/.exec(path);
  if (homeMatch && KNOWN_USERS.has(homeMatch[1])) owner = homeMatch[1];
  const childPath = (name) => (path === '/' ? `/${name}` : `${path}/${name}`);
  if (typeof raw === 'string') {
    return { type: 'file', content: raw, mode: '644', owner };
  }
  if (raw && typeof raw === 'object' && (raw.type === 'file' || raw.type === 'dir')) {
    if (raw.type === 'file') {
      return { type: 'file', content: raw.content ?? '', mode: raw.mode ?? '644', owner: raw.owner ?? owner };
    }
    const nodeOwner = raw.owner ?? owner;
    const children = {};
    for (const [name, child] of Object.entries(raw.children ?? {})) {
      children[name] = normalizeNode(child, nodeOwner, childPath(name));
    }
    return { type: 'dir', children, mode: raw.mode ?? '755', owner: nodeOwner };
  }
  // Обычный объект без поля type — каталог, ключи = имена внутри него.
  const children = {};
  for (const [name, child] of Object.entries(raw ?? {})) {
    children[name] = normalizeNode(child, owner, childPath(name));
  }
  return { type: 'dir', children, mode: '755', owner };
}

function defaultFs() {
  return {
    home: {
      user: {
        'notes.txt': 'Первая заметка.\nВторая заметка.\n',
        projects: {},
      },
    },
    etc: {
      type: 'dir',
      owner: 'root',
      children: {
        hostname: { type: 'file', content: 'backend\n', owner: 'root' },
        shadow: { type: 'file', content: 'root:$6$secret:19000:0:99999:7:::\n', owner: 'root', mode: '600' },
      },
    },
    tmp: { type: 'dir', mode: '777' },
    var: { type: 'dir', owner: 'root', children: { log: { type: 'dir', owner: 'root' } } },
  };
}

function cloneDeep(value) {
  return JSON.parse(JSON.stringify(value));
}

// ---------- работа с путями ----------

function joinPath(base, rel) {
  const parts = (rel.startsWith('/') ? [] : base.split('/').filter(Boolean));
  for (const seg of rel.split('/')) {
    if (!seg || seg === '.') continue;
    if (seg === '..') parts.pop();
    else parts.push(seg);
  }
  return '/' + parts.join('/');
}

function basename(path) {
  const parts = path.split('/').filter(Boolean);
  return parts[parts.length - 1] ?? '/';
}

function dirname(path) {
  const parts = path.split('/').filter(Boolean);
  parts.pop();
  return '/' + parts.join('/');
}

function modeToString(node) {
  const bits = ['r', 'w', 'x'];
  let out = node.type === 'dir' ? 'd' : '-';
  for (const digit of node.mode) {
    const n = Number(digit);
    out += (n & 4 ? bits[0] : '-') + (n & 2 ? bits[1] : '-') + (n & 1 ? bits[2] : '-');
  }
  return out;
}

function globToRegex(pattern, { anchored = true } = {}) {
  let re = '';
  for (const ch of pattern) {
    if (ch === '*') re += '.*';
    else if (ch === '?') re += '.';
    else re += ch.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp(anchored ? `^${re}$` : re);
}

function result(stdout = '', stderr = '', code = 0) {
  return { stdout, stderr, code };
}

function errorResult(text, code = 1) {
  return result('', text.endsWith('\n') ? text : text + '\n', code);
}

// ---------- сам шелл ----------

export class VirtualShell {
  constructor(initialFs, options = {}) {
    this.initialFs = initialFs ?? defaultFs();
    this.initialOptions = options;
    this.reset();
  }

  reset() {
    this.fs = normalizeNode(cloneDeep(this.initialFs));
    this.user = this.initialOptions.user ?? DEFAULT_USER;
    this.home = '/home/user';
    this.cwd = this.initialOptions.cwd ?? (this.getNode(this.home) ? this.home : '/');
    this.vars = { HOME: this.home, USER: this.user, PATH: '/usr/local/bin:/usr/bin:/bin', SHELL: '/bin/bash', PWD: this.cwd };
    this.processes = cloneDeep(this.initialOptions.processes ?? DEFAULT_PROCESSES);
    this.history = [];
    this.lastOutput = '';
    this.lastError = null;
    this.lastExitCode = 0;
    this.lastCommand = '';
    this._steps = 0;
    this._scriptDepth = 0;
    this._positional = [];
  }

  _chownRecursive(node, owner, predicate = () => true) {
    if (predicate(node)) node.owner = owner;
    if (node.type === 'dir') Object.values(node.children).forEach((c) => this._chownRecursive(c, owner, predicate));
  }

  prompt() {
    const shown = this.cwd === this.home ? '~' : this.cwd.startsWith(this.home + '/') ? '~' + this.cwd.slice(this.home.length) : this.cwd;
    return `${this.user}@${HOSTNAME}:${shown}${this.user === 'root' ? '#' : '$'}`;
  }

  // ----- публичные помощники для check() в уроках -----

  resolve(path) {
    if (!path) return this.cwd;
    if (path === '~') return this.home;
    if (path.startsWith('~/')) return joinPath(this.home, path.slice(2));
    return joinPath(this.cwd, path);
  }

  getNode(path) {
    const abs = this.resolve(path);
    let node = this.fs;
    for (const seg of abs.split('/').filter(Boolean)) {
      if (node.type !== 'dir' || !node.children[seg]) return null;
      node = node.children[seg];
    }
    return node;
  }

  exists(path) {
    return this.getNode(path) !== null;
  }

  isDir(path) {
    return this.getNode(path)?.type === 'dir';
  }

  isFile(path) {
    return this.getNode(path)?.type === 'file';
  }

  readFile(path) {
    const node = this.getNode(path);
    return node?.type === 'file' ? node.content : null;
  }

  listDir(path) {
    const node = this.getNode(path);
    return node?.type === 'dir' ? Object.keys(node.children).sort() : null;
  }

  getProcess(pid) {
    return this.processes.find((p) => p.pid === Number(pid)) ?? null;
  }

  // ----- права -----

  _can(node, what) {
    if (this.user === 'root') return true;
    const bit = what === 'r' ? 4 : what === 'w' ? 2 : 1;
    const digit = node.owner === this.user ? Number(node.mode[0]) : Number(node.mode[2]);
    return (digit & bit) !== 0;
  }

  // Найти узел и родителя; ошибки — как у настоящих утилит.
  _lookup(path) {
    const abs = this.resolve(path);
    const parent = abs === '/' ? null : this.getNode(dirname(abs));
    return { abs, parent, node: this.getNode(abs), name: basename(abs) };
  }

  // ----- главный вход -----

  run(commandString) {
    const raw = String(commandString ?? '');
    this.lastCommand = raw;
    if (raw.trim()) this.history.push(raw);
    this._steps = 0;
    let res;
    try {
      res = this._runLine(raw, null);
    } catch (e) {
      if (e instanceof ShellExit) res = result('', '', e.code);
      else res = errorResult(`bash: внутренняя ошибка: ${e.message}`);
    }
    if (res.clear) {
      this.lastOutput = '';
      this.lastError = null;
      this.lastExitCode = 0;
      return { output: '', error: null, clear: true };
    }
    const output = res.stdout.replace(/\n$/, '');
    const error = res.stderr.replace(/\n$/, '') || null;
    this.lastOutput = output;
    this.lastError = error;
    this.lastExitCode = res.code;
    this.vars['?'] = String(res.code);
    return { output, error };
  }

  // ----- разбор строки -----

  // Разбивает строку на слова и операторы, раскрывая кавычки, $VAR, $(cmd) и шаблоны.
  _tokenize(line) {
    const tokens = [];
    let i = 0;
    let word = null; // { text, glob }
    const push = () => {
      if (word) tokens.push({ type: 'word', text: word.text, glob: word.glob });
      word = null;
    };
    const append = (text, glob = false) => {
      if (!word) word = { text: '', glob: false };
      word.text += text;
      if (glob) word.glob = true;
    };

    while (i < line.length) {
      const ch = line[i];
      if (ch === ' ' || ch === '\t') {
        push();
        i++;
        continue;
      }
      if (ch === '#' && !word) break;
      if (ch === "'") {
        const end = line.indexOf("'", i + 1);
        const inner = end === -1 ? line.slice(i + 1) : line.slice(i + 1, end);
        append(inner);
        i = end === -1 ? line.length : end + 1;
        continue;
      }
      if (ch === '"') {
        let j = i + 1;
        let buf = '';
        while (j < line.length && line[j] !== '"') {
          if (line[j] === '\\' && j + 1 < line.length && '"$\\`'.includes(line[j + 1])) {
            buf += line[j + 1];
            j += 2;
          } else if (line[j] === '$' || line[j] === '`') {
            const exp = this._expandDollar(line, j);
            buf += exp.text;
            j = exp.next;
          } else {
            buf += line[j++];
          }
        }
        append(buf);
        i = j + 1;
        continue;
      }
      if (ch === '\\' && i + 1 < line.length) {
        append(line[i + 1]);
        i += 2;
        continue;
      }
      // операторы
      const two = line.slice(i, i + 2);
      if (two === '>>' || (two === '2>' && !word)) {
        push();
        if (two === '2>' && line.slice(i, i + 4) === '2>&1') {
          tokens.push({ type: 'op', op: '2>&1' });
          i += 4;
        } else {
          tokens.push({ type: 'op', op: two });
          i += 2;
        }
        continue;
      }
      if (ch === '>' || ch === '<') {
        push();
        tokens.push({ type: 'op', op: ch });
        i++;
        continue;
      }
      if (ch === '$' || ch === '`') {
        const exp = this._expandDollar(line, i);
        append(exp.text);
        i = exp.next;
        continue;
      }
      if (ch === '~' && !word && (i + 1 >= line.length || line[i + 1] === '/' || line[i + 1] === ' ')) {
        append(this.home);
        i++;
        continue;
      }
      append(ch, ch === '*' || ch === '?');
      i++;
    }
    push();
    return tokens;
  }

  // Раскрывает $VAR, ${VAR}, $?, $1, $(cmd), `cmd`, $((1+2)) начиная с позиции i (line[i] === '$' или '`').
  _expandDollar(line, i) {
    if (line[i] === '`') {
      const end = line.indexOf('`', i + 1);
      const inner = end === -1 ? line.slice(i + 1) : line.slice(i + 1, end);
      return { text: this._capture(inner), next: end === -1 ? line.length : end + 1 };
    }
    if (line.slice(i, i + 3) === '$((') {
      const end = this._matchParen(line, i + 1);
      const inner = line.slice(i + 3, end - 1);
      return { text: this._arith(inner), next: end + 1 };
    }
    if (line.slice(i, i + 2) === '$(') {
      const end = this._matchParen(line, i + 1);
      const inner = line.slice(i + 2, end);
      return { text: this._capture(inner), next: end + 1 };
    }
    if (line[i + 1] === '{') {
      const end = line.indexOf('}', i);
      const name = line.slice(i + 2, end === -1 ? line.length : end);
      return { text: this._getVar(name), next: end === -1 ? line.length : end + 1 };
    }
    const m = /^\$([A-Za-z_][A-Za-z0-9_]*|\?|#|@|\*|[0-9])/.exec(line.slice(i));
    if (m) return { text: this._getVar(m[1]), next: i + m[0].length };
    return { text: '$', next: i + 1 };
  }

  _matchParen(line, openIdx) {
    let depth = 0;
    for (let j = openIdx; j < line.length; j++) {
      if (line[j] === '(') depth++;
      else if (line[j] === ')') {
        depth--;
        if (depth === 0) return j;
      }
    }
    return line.length;
  }

  _getVar(name) {
    if (name === '?') return this.vars['?'] ?? '0';
    if (name === '#') return String(this._positional.length);
    if (name === '@' || name === '*') return this._positional.join(' ');
    if (/^[0-9]$/.test(name)) return name === '0' ? 'bash' : (this._positional[Number(name) - 1] ?? '');
    if (name === 'PWD') return this.cwd;
    if (name === 'RANDOM') return String(Math.floor(Math.random() * 32768));
    return this.vars[name] ?? '';
  }

  _arith(expr) {
    const expanded = expr.replace(/\$?\b([A-Za-z_][A-Za-z0-9_]*)\b/g, (_, n) => this._getVar(n) || '0');
    if (!/^[\d\s+\-*/%()]*$/.test(expanded)) return '0';
    try {
      // Строка уже проверена: только цифры, скобки и арифметические знаки.
      const value = Function(`"use strict"; return (${expanded || 0});`)();
      return String(Number.isFinite(value) ? Math.trunc(value) : 0);
    } catch {
      return '0';
    }
  }

  _capture(inner) {
    const res = this._runLine(inner, null);
    return res.stdout.replace(/\n+$/, '');
  }

  _expandGlob(token) {
    if (!token.glob) return [token.text];
    const text = token.text;
    const slash = text.lastIndexOf('/');
    const dirPart = slash === -1 ? '' : text.slice(0, slash + 1);
    const namePart = slash === -1 ? text : text.slice(slash + 1);
    const dirNode = this.getNode(dirPart || '.');
    if (!dirNode || dirNode.type !== 'dir') return [text];
    const re = globToRegex(namePart);
    const matches = Object.keys(dirNode.children)
      .filter((n) => !n.startsWith('.') || namePart.startsWith('.'))
      .filter((n) => re.test(n))
      .sort()
      .map((n) => dirPart + n);
    return matches.length ? matches : [text];
  }

  // Выполняет одну строку: список команд через && || ;, каждая — конвейер.
  // Раскрытие переменных/шаблонов делается для каждой простой команды отдельно,
  // прямо перед её запуском — как в настоящем bash (`N=5; echo $N` печатает 5).
  _runLine(line, stdin) {
    if (++this._steps > MAX_SCRIPT_STEPS) {
      return errorResult('bash: слишком много команд подряд — выполнение остановлено');
    }
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return result();

    const lists = splitTopLevel(trimmed, ['&&', '||', ';']);
    let stdout = '';
    let stderr = '';
    let last = result();
    let clear = false;
    for (let k = 0; k < lists.length; k++) {
      const item = lists[k];
      if (item.joiner === '&&' && last.code !== 0) continue;
      if (item.joiner === '||' && last.code === 0) continue;
      if (!item.text.trim()) continue;
      // for / if, набранные прямо в строке приглашения — это уже скрипт: отдаём ему
      // весь остаток строки (там же лежат do/done/then/fi)
      if (/^(for|if|while|until)\s/.test(item.text.trim())) {
        const rest = lists.slice(k).map((it, idx) => (idx === 0 ? '' : it.joiner) + it.text).join('');
        last = this._runScript(rest, this._positional, stdin, 'bash');
        stdout += last.stdout;
        stderr += last.stderr;
        break;
      }
      last = this._runPipeline(item.text, stdin);
      if (last.clear) clear = true;
      stdout += last.stdout;
      stderr += last.stderr;
    }
    return { stdout, stderr, code: last.code, clear };
  }

  _runPipeline(text, stdin) {
    const stages = splitTopLevel(text, ['|']);
    let input = stdin;
    let stderr = '';
    let last = result();
    for (const stage of stages) {
      last = this._runSimple(stage.text, input);
      stderr += last.stderr;
      input = last.stdout;
    }
    return { stdout: last.stdout, stderr, code: last.code, clear: last.clear };
  }

  _runSimple(text, stdin) {
    const tokens = this._tokenize(text);
    const words = [];
    const redirects = [];
    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];
      if (t.type === 'op') {
        const target = tokens[i + 1];
        if (t.op === '2>&1') {
          redirects.push({ op: t.op });
          continue;
        }
        if (!target || target.type !== 'word') {
          return errorResult("bash: syntax error near unexpected token `newline'", 2);
        }
        redirects.push({ op: t.op, target: target.text });
        i++;
      } else words.push(...this._expandGlob(t));
    }

    // перенаправление ввода `< file`
    for (const r of redirects) {
      if (r.op === '<') {
        const node = this.getNode(r.target);
        if (!node) return errorResult(`bash: ${r.target}: No such file or directory`);
        if (!this._can(node, 'r')) return errorResult(`bash: ${r.target}: Permission denied`);
        stdin = node.content;
      }
    }

    let res = words.length === 0 ? result() : this._exec(words, stdin);
    if (res.clear) return res;

    for (const r of redirects) {
      if (r.op === '>' || r.op === '>>') {
        const err = this._writeFile(r.target, res.stdout, r.op === '>>');
        res = err ? { ...res, stdout: '', stderr: res.stderr + err, code: 1 } : { ...res, stdout: '' };
      } else if (r.op === '2>') {
        if (r.target !== '/dev/null') {
          const err = this._writeFile(r.target, res.stderr, false);
          if (err) return { ...res, stderr: err, code: 1 };
        }
        res = { ...res, stderr: '' };
      } else if (r.op === '2>&1') {
        res = { ...res, stdout: res.stdout + res.stderr, stderr: '' };
      }
    }
    return res;
  }

  _writeFile(path, content, append) {
    if (this.resolve(path) === '/dev/null') return null;
    const { abs, parent, node, name } = this._lookup(path);
    if (node?.type === 'dir') return `bash: ${path}: Is a directory\n`;
    if (node) {
      if (!this._can(node, 'w')) return `bash: ${path}: Permission denied\n`;
      node.content = append ? node.content + content : content;
      return null;
    }
    if (!parent || parent.type !== 'dir') return `bash: ${path}: No such file or directory\n`;
    if (!this._can(parent, 'w')) return `bash: ${path}: Permission denied\n`;
    parent.children[name] = { type: 'file', content, mode: '644', owner: this.user };
    void abs;
    return null;
  }

  // ----- выполнение одной команды -----

  _exec(words, stdin) {
    const [cmd, ...args] = words;

    // NAME=value — присваивание переменной
    const assign = /^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(cmd);
    if (assign && args.length === 0) {
      this.vars[assign[1]] = assign[2];
      return result();
    }

    if (cmd.includes('/')) return this._execFile(cmd, args, stdin);

    const handler = COMMANDS[cmd];
    if (!handler) return errorResult(`bash: ${cmd}: command not found`, 127);
    return handler.call(this, args, stdin);
  }

  _execFile(path, args, stdin) {
    const node = this.getNode(path);
    if (!node) return errorResult(`bash: ${path}: No such file or directory`, 127);
    if (node.type === 'dir') return errorResult(`bash: ${path}: Is a directory`, 126);
    if (!this._can(node, 'x')) return errorResult(`bash: ${path}: Permission denied`, 126);
    if (!this._can(node, 'r')) return errorResult(`bash: ${path}: Permission denied`, 126);
    return this._runScript(node.content, args, stdin, path);
  }

  // ----- bash-скрипты -----

  _runScript(source, args, stdin, name) {
    const savedPositional = this._positional;
    this._positional = args;
    this._scriptDepth++;
    try {
      const statements = splitStatements(source);
      const { nodes } = parseBlock(statements, 0, []);
      return this._execNodes(nodes, stdin);
    } catch (e) {
      if (e instanceof ShellExit) return result('', '', e.code);
      return errorResult(`${name}: ${e.message}`, 2);
    } finally {
      this._positional = savedPositional;
      this._scriptDepth--;
    }
  }

  _execNodes(nodes, stdin) {
    let stdout = '';
    let stderr = '';
    let code = 0;
    const collect = (r) => {
      stdout += r.stdout;
      stderr += r.stderr;
      code = r.code;
    };
    for (const node of nodes) {
      if (node.kind === 'cmd') {
        collect(this._runLine(node.text, stdin));
      } else if (node.kind === 'for') {
        const words = this._tokenize(node.words)
          .filter((t) => t.type === 'word')
          .flatMap((t) => this._expandGlob(t));
        for (const w of words) {
          this.vars[node.var] = w;
          collect(this._execNodes(node.body, stdin));
        }
      } else if (node.kind === 'if') {
        let done = false;
        for (const branch of node.branches) {
          const cond = this._runLine(branch.cond, stdin);
          stderr += cond.stderr;
          if (cond.code === 0) {
            collect(this._execNodes(branch.body, stdin));
            done = true;
            break;
          }
        }
        if (!done && node.elseBody) collect(this._execNodes(node.elseBody, stdin));
      }
    }
    return { stdout, stderr, code };
  }
}

// Делит строку по операторам верхнего уровня (вне кавычек и скобок $(...)).
// Возвращает [{ text, joiner }], где joiner — оператор ПЕРЕД этим куском (null у первого).
function splitTopLevel(line, ops) {
  const parts = [];
  let buf = '';
  let joiner = null;
  let quote = null;
  let depth = 0;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quote) {
      buf += ch;
      if (ch === quote && line[i - 1] !== '\\') quote = null;
      continue;
    }
    if (ch === '\\' && i + 1 < line.length) {
      buf += ch + line[i + 1];
      i++;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch;
      buf += ch;
      continue;
    }
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (depth === 0) {
      const op = ops.find((o) => line.startsWith(o, i) && !(o === '|' && line[i + 1] === '|'));
      if (op) {
        parts.push({ text: buf, joiner });
        buf = '';
        joiner = op;
        i += op.length - 1;
        continue;
      }
    }
    buf += ch;
  }
  parts.push({ text: buf, joiner });
  return parts;
}

// Делим текст скрипта на отдельные инструкции: по переводам строк и по `;` вне кавычек.
function splitStatements(source) {
  const out = [];
  for (const rawLine of source.split('\n')) {
    let line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    let buf = '';
    let quote = null;
    let depth = 0;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (quote) {
        buf += ch;
        if (ch === quote) quote = null;
        continue;
      }
      if (ch === '"' || ch === "'") {
        quote = ch;
        buf += ch;
      } else if (ch === '(') {
        depth++;
        buf += ch;
      } else if (ch === ')') {
        depth--;
        buf += ch;
      } else if (ch === ';' && depth === 0) {
        if (buf.trim()) out.push(buf.trim());
        buf = '';
      } else if (ch === '#' && (i === 0 || line[i - 1] === ' ')) {
        break;
      } else buf += ch;
    }
    if (buf.trim()) out.push(buf.trim());
  }
  // `do echo $f` → ['do', 'echo $f'], `then echo ok` → ['then', 'echo ok'] и т.д.
  const flat = [];
  for (const st of out) {
    const m = /^(do|then|else)\s+(.+)$/.exec(st);
    if (m) flat.push(m[1], m[2]);
    else flat.push(st);
  }
  return flat;
}

function parseBlock(stmts, i, terminators) {
  const nodes = [];
  while (i < stmts.length) {
    const st = stmts[i];
    const head = st.split(/\s+/)[0];
    if (terminators.includes(head)) return { nodes, i };
    if (head === 'for') {
      const m = /^for\s+([A-Za-z_][A-Za-z0-9_]*)\s+in\s+(.*)$/.exec(st);
      if (!m) throw new Error(`syntax error near 'for'`);
      i++;
      if (stmts[i] !== 'do') throw new Error(`syntax error: expected 'do' after 'for'`);
      const body = parseBlock(stmts, i + 1, ['done']);
      if (stmts[body.i] !== 'done') throw new Error(`syntax error: expected 'done'`);
      nodes.push({ kind: 'for', var: m[1], words: m[2], body: body.nodes });
      i = body.i + 1;
      continue;
    }
    if (head === 'while' || head === 'until') {
      throw new Error(`'${head}' в учебном шелле не поддерживается — используй for`);
    }
    if (head === 'if' || head === 'elif') {
      if (head === 'if') {
        const branches = [];
        let elseBody = null;
        let cond = st.replace(/^if\s+/, '');
        i++;
        while (true) {
          if (stmts[i] !== 'then') throw new Error(`syntax error: expected 'then' after 'if'`);
          const body = parseBlock(stmts, i + 1, ['elif', 'else', 'fi']);
          branches.push({ cond, body: body.nodes });
          i = body.i;
          const next = stmts[i]?.split(/\s+/)[0];
          if (next === 'elif') {
            cond = stmts[i].replace(/^elif\s+/, '');
            i++;
            continue;
          }
          if (next === 'else') {
            const eb = parseBlock(stmts, i + 1, ['fi']);
            elseBody = eb.nodes;
            i = eb.i;
          }
          if (stmts[i] !== 'fi') throw new Error(`syntax error: expected 'fi'`);
          i++;
          break;
        }
        nodes.push({ kind: 'if', branches, elseBody });
        continue;
      }
    }
    nodes.push({ kind: 'cmd', text: st });
    i++;
  }
  return { nodes, i };
}

// ---------- команды ----------

function parseFlags(args, { withValue = [] } = {}) {
  const flags = new Set();
  const values = {};
  const positional = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--') {
      positional.push(...args.slice(i + 1));
      break;
    }
    if (a.startsWith('--') && a.length > 2) {
      flags.add(a.slice(2));
      continue;
    }
    if (a.startsWith('-') && a.length > 1 && !/^-\d+$/.test(a)) {
      const letters = a.slice(1);
      let consumed = false;
      for (let k = 0; k < letters.length; k++) {
        const f = letters[k];
        if (withValue.includes(f)) {
          const rest = letters.slice(k + 1);
          values[f] = rest || args[++i] || '';
          consumed = true;
          break;
        }
        flags.add(f);
      }
      if (consumed) continue;
      continue;
    }
    positional.push(a);
  }
  return { flags, values, positional };
}

function walk(node, path, visit) {
  visit(node, path);
  if (node.type === 'dir') {
    for (const name of Object.keys(node.children).sort()) {
      walk(node.children[name], path === '/' ? `/${name}` : `${path}/${name}`, visit);
    }
  }
}

function lines(stdin) {
  if (!stdin) return [];
  return stdin.replace(/\n$/, '').split('\n');
}

const COMMANDS = {
  pwd() {
    return result(this.cwd + '\n');
  },

  cd(args) {
    const target = args[0] ?? '~';
    const abs = this.resolve(target);
    const node = this.getNode(abs);
    if (!node) return errorResult(`bash: cd: ${target}: No such file or directory`);
    if (node.type !== 'dir') return errorResult(`bash: cd: ${target}: Not a directory`);
    if (!this._can(node, 'x')) return errorResult(`bash: cd: ${target}: Permission denied`);
    this.cwd = abs;
    this.vars.PWD = abs;
    return result();
  },

  ls(args) {
    const { flags, positional } = parseFlags(args);
    const long = flags.has('l');
    const all = flags.has('a') || flags.has('A');
    const targets = positional.length ? positional : ['.'];
    let err = '';
    let code = 0;
    const files = [];
    const dirs = [];
    for (const t of targets) {
      const node = this.getNode(t);
      if (!node) {
        err += `ls: cannot access '${t}': No such file or directory\n`;
        code = 2;
      } else if (node.type === 'file') files.push({ label: t, node });
      else dirs.push({ label: t, node });
    }
    const blocks = [];
    if (files.length) {
      blocks.push(long ? files.map((f) => formatLong(f.label, f.node)).join('\n') : files.map((f) => f.label).join('  '));
    }
    for (const { label, node } of dirs) {
      if (!this._can(node, 'r')) {
        err += `ls: cannot open directory '${label}': Permission denied\n`;
        code = 2;
        continue;
      }
      let names = Object.keys(node.children).sort();
      if (!all) names = names.filter((n) => !n.startsWith('.'));
      else if (flags.has('a')) names = ['.', '..', ...names];
      let body;
      if (long) {
        const rows = names.map((n) => {
          const child = n === '.' ? node : n === '..' ? this.getNode(dirname(this.resolve(label))) ?? node : node.children[n];
          return formatLong(n, child);
        });
        body = [`total ${names.length}`, ...rows].join('\n');
      } else body = names.join('  ');
      blocks.push((targets.length > 1 ? `${label}:\n` : '') + body);
    }
    const out = blocks.join('\n\n');
    return { stdout: out ? out + '\n' : '', stderr: err, code };
  },

  cat(args, stdin) {
    if (args.length === 0) return result(stdin ?? '');
    let out = '';
    let err = '';
    let code = 0;
    for (const a of args) {
      if (a === '-') {
        out += stdin ?? '';
        continue;
      }
      const node = this.getNode(a);
      if (!node) {
        err += `cat: ${a}: No such file or directory\n`;
        code = 1;
      } else if (node.type === 'dir') {
        err += `cat: ${a}: Is a directory\n`;
        code = 1;
      } else if (!this._can(node, 'r')) {
        err += `cat: ${a}: Permission denied\n`;
        code = 1;
      } else out += node.content;
    }
    if (out && !out.endsWith('\n')) out += '\n';
    return { stdout: out, stderr: err, code };
  },

  echo(args) {
    let i = 0;
    let newline = true;
    let escapes = false;
    while (i < args.length && /^-[neE]+$/.test(args[i])) {
      if (args[i].includes('n')) newline = false;
      if (args[i].includes('e')) escapes = true;
      i++;
    }
    let text = args.slice(i).join(' ');
    if (escapes) text = text.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
    return result(newline ? text + '\n' : text);
  },

  mkdir(args) {
    const { flags, positional } = parseFlags(args);
    if (positional.length === 0) return errorResult('mkdir: missing operand');
    let err = '';
    for (const p of positional) {
      const abs = this.resolve(p);
      const parts = abs.split('/').filter(Boolean);
      let node = this.fs;
      let path = '';
      for (let i = 0; i < parts.length; i++) {
        const seg = parts[i];
        path += '/' + seg;
        const isLast = i === parts.length - 1;
        const existing = node.children[seg];
        if (existing) {
          if (isLast && !flags.has('p')) err += `mkdir: cannot create directory '${p}': File exists\n`;
          else if (existing.type !== 'dir') {
            err += `mkdir: cannot create directory '${p}': Not a directory\n`;
            break;
          }
          node = existing;
          continue;
        }
        if (!isLast && !flags.has('p')) {
          err += `mkdir: cannot create directory '${p}': No such file or directory\n`;
          break;
        }
        if (!this._can(node, 'w')) {
          err += `mkdir: cannot create directory '${p}': Permission denied\n`;
          break;
        }
        node.children[seg] = { type: 'dir', children: {}, mode: '755', owner: this.user };
        node = node.children[seg];
      }
    }
    return err ? errorResult(err) : result();
  },

  touch(args) {
    const { positional } = parseFlags(args);
    if (positional.length === 0) return errorResult('touch: missing file operand');
    let err = '';
    for (const p of positional) {
      const { parent, node, name } = this._lookup(p);
      if (node) continue;
      if (!parent || parent.type !== 'dir') {
        err += `touch: cannot touch '${p}': No such file or directory\n`;
        continue;
      }
      if (!this._can(parent, 'w')) {
        err += `touch: cannot touch '${p}': Permission denied\n`;
        continue;
      }
      parent.children[name] = { type: 'file', content: '', mode: '644', owner: this.user };
    }
    return err ? errorResult(err) : result();
  },

  rm(args) {
    const { flags, positional } = parseFlags(args);
    const recursive = flags.has('r') || flags.has('R');
    const force = flags.has('f');
    if (positional.length === 0) return errorResult('rm: missing operand');
    let err = '';
    for (const p of positional) {
      const { abs, parent, node, name } = this._lookup(p);
      if (!node) {
        if (!force) err += `rm: cannot remove '${p}': No such file or directory\n`;
        continue;
      }
      if (abs === '/' || abs === this.home) {
        err += `rm: it is dangerous to operate recursively on '${p}'\n`;
        continue;
      }
      if (node.type === 'dir' && !recursive) {
        err += `rm: cannot remove '${p}': Is a directory\n`;
        continue;
      }
      if (!this._can(parent, 'w') || (!force && node.type === 'file' && !this._can(node, 'w'))) {
        err += `rm: cannot remove '${p}': Permission denied\n`;
        continue;
      }
      delete parent.children[name];
    }
    return err ? errorResult(err) : result();
  },

  cp(args) {
    const { flags, positional } = parseFlags(args);
    if (positional.length < 2) return errorResult(`cp: missing ${positional.length ? 'destination file operand after' : 'file operand'} ${positional[0] ? `'${positional[0]}'` : ''}`.trim());
    const dest = positional[positional.length - 1];
    const sources = positional.slice(0, -1);
    const destNode = this.getNode(dest);
    if (sources.length > 1 && destNode?.type !== 'dir') return errorResult(`cp: target '${dest}' is not a directory`);
    let err = '';
    for (const src of sources) {
      const node = this.getNode(src);
      if (!node) {
        err += `cp: cannot stat '${src}': No such file or directory\n`;
        continue;
      }
      if (node.type === 'dir' && !flags.has('r') && !flags.has('R')) {
        err += `cp: -r not specified; omitting directory '${src}'\n`;
        continue;
      }
      if (!this._can(node, 'r')) {
        err += `cp: cannot open '${src}' for reading: Permission denied\n`;
        continue;
      }
      const target = destNode?.type === 'dir' ? `${this.resolve(dest)}/${basename(this.resolve(src))}` : dest;
      const { parent, name } = this._lookup(target);
      if (!parent || parent.type !== 'dir') {
        err += `cp: cannot create regular file '${target}': No such file or directory\n`;
        continue;
      }
      if (!this._can(parent, 'w')) {
        err += `cp: cannot create regular file '${target}': Permission denied\n`;
        continue;
      }
      const copy = cloneDeep(node);
      this._chownRecursive(copy, this.user);
      parent.children[name] = copy;
    }
    return err ? errorResult(err) : result();
  },

  mv(args) {
    const { positional } = parseFlags(args);
    if (positional.length < 2) return errorResult(`mv: missing ${positional.length ? 'destination file operand after' : 'file operand'} ${positional[0] ? `'${positional[0]}'` : ''}`.trim());
    const dest = positional[positional.length - 1];
    const sources = positional.slice(0, -1);
    const destNode = this.getNode(dest);
    if (sources.length > 1 && destNode?.type !== 'dir') return errorResult(`mv: target '${dest}' is not a directory`);
    let err = '';
    for (const src of sources) {
      const from = this._lookup(src);
      if (!from.node) {
        err += `mv: cannot stat '${src}': No such file or directory\n`;
        continue;
      }
      const target = destNode?.type === 'dir' ? `${this.resolve(dest)}/${from.name}` : dest;
      const to = this._lookup(target);
      if (to.abs === from.abs) continue;
      if (!to.parent || to.parent.type !== 'dir') {
        err += `mv: cannot move '${src}' to '${target}': No such file or directory\n`;
        continue;
      }
      if (!this._can(from.parent, 'w') || !this._can(to.parent, 'w')) {
        err += `mv: cannot move '${src}' to '${target}': Permission denied\n`;
        continue;
      }
      if (to.abs.startsWith(from.abs + '/')) {
        err += `mv: cannot move '${src}' to a subdirectory of itself, '${target}'\n`;
        continue;
      }
      delete from.parent.children[from.name];
      to.parent.children[to.name] = from.node;
      if (this.cwd === from.abs || this.cwd.startsWith(from.abs + '/')) this.cwd = to.abs + this.cwd.slice(from.abs.length);
    }
    return err ? errorResult(err) : result();
  },

  chmod(args) {
    const { flags, positional } = parseFlags(args);
    if (positional.length < 2) return errorResult('chmod: missing operand');
    const [modeSpec, ...files] = positional;
    let err = '';
    const apply = (node, label) => {
      if (this.user !== 'root' && node.owner !== this.user) {
        err += `chmod: changing permissions of '${label}': Operation not permitted\n`;
        return;
      }
      const next = applyMode(node.mode, modeSpec, node.type === 'dir');
      if (!next) {
        err += `chmod: invalid mode: '${modeSpec}'\n`;
        return;
      }
      node.mode = next;
    };
    for (const f of files) {
      const node = this.getNode(f);
      if (!node) {
        err += `chmod: cannot access '${f}': No such file or directory\n`;
        continue;
      }
      if (flags.has('R')) walk(node, this.resolve(f), (n, p) => apply(n, p));
      else apply(node, f);
    }
    return err ? errorResult(err) : result();
  },

  chown(args) {
    const { flags, positional } = parseFlags(args);
    if (positional.length < 2) return errorResult('chown: missing operand');
    const [spec, ...files] = positional;
    const owner = spec.split(':')[0];
    if (!KNOWN_USERS.has(owner)) return errorResult(`chown: invalid user: '${spec}'`);
    let err = '';
    for (const f of files) {
      const node = this.getNode(f);
      if (!node) {
        err += `chown: cannot access '${f}': No such file or directory\n`;
        continue;
      }
      if (this.user !== 'root') {
        err += `chown: changing ownership of '${f}': Operation not permitted\n`;
        continue;
      }
      if (flags.has('R')) this._chownRecursive(node, owner);
      else node.owner = owner;
    }
    return err ? errorResult(err) : result();
  },

  grep(args, stdin) {
    const { flags, positional } = parseFlags(args, { withValue: ['e'] });
    const patternRaw = positional[0];
    if (patternRaw === undefined) return errorResult('Usage: grep [OPTION]... PATTERNS [FILE]...', 2);
    const files = positional.slice(1);
    const recursive = flags.has('r') || flags.has('R');
    let re;
    try {
      re = new RegExp(patternRaw, flags.has('i') ? 'i' : '');
    } catch {
      re = new RegExp(patternRaw.replace(/[.+^${}()|[\]\\*?]/g, '\\$&'), flags.has('i') ? 'i' : '');
    }
    const invert = flags.has('v');
    let out = '';
    let err = '';
    let matched = false;
    const scan = (text, label, showLabel) => {
      const rows = lines(text);
      let count = 0;
      rows.forEach((row, idx) => {
        const hit = re.test(row) !== invert;
        if (!hit) return;
        count++;
        matched = true;
        if (flags.has('c') || flags.has('l')) return;
        const prefix = (showLabel ? `${label}:` : '') + (flags.has('n') ? `${idx + 1}:` : '');
        out += prefix + row + '\n';
      });
      if (flags.has('c')) out += (showLabel ? `${label}:` : '') + count + '\n';
      else if (flags.has('l') && count > 0) out += label + '\n';
    };
    if (files.length === 0) {
      if (recursive) files.push('.');
      else {
        scan(stdin ?? '', '(stdin)', false);
        return { stdout: out, stderr: err, code: matched ? 0 : 1 };
      }
    }
    const multi = (files.length > 1 || recursive) && !flags.has('h');
    for (const f of files) {
      const node = this.getNode(f);
      if (!node) {
        err += `grep: ${f}: No such file or directory\n`;
        continue;
      }
      if (node.type === 'dir') {
        if (!recursive) {
          err += `grep: ${f}: Is a directory\n`;
          continue;
        }
        walk(node, f.replace(/\/$/, ''), (n, p) => {
          if (n.type !== 'file') return;
          if (!this._can(n, 'r')) {
            err += `grep: ${p}: Permission denied\n`;
            return;
          }
          scan(n.content, p, true);
        });
        continue;
      }
      if (!this._can(node, 'r')) {
        err += `grep: ${f}: Permission denied\n`;
        continue;
      }
      scan(node.content, f, multi);
    }
    return { stdout: out, stderr: err, code: matched ? 0 : err ? 2 : 1 };
  },

  find(args) {
    // find [path...] [-name X] [-iname X] [-type f|d] [-perm -u+x]
    const paths = [];
    let i = 0;
    while (i < args.length && !args[i].startsWith('-')) paths.push(args[i++]);
    if (paths.length === 0) paths.push('.');
    const filters = [];
    while (i < args.length) {
      const opt = args[i];
      const val = args[i + 1];
      if (opt === '-name' || opt === '-iname') {
        if (val === undefined) return errorResult(`find: missing argument to \`${opt}'`);
        const re = new RegExp(globToRegex(val).source, opt === '-iname' ? 'i' : '');
        filters.push((n, p) => re.test(basename(p)));
        i += 2;
      } else if (opt === '-type') {
        if (val !== 'f' && val !== 'd') return errorResult(`find: Unknown argument to -type: ${val ?? ''}`);
        filters.push((n) => (val === 'f' ? n.type === 'file' : n.type === 'dir'));
        i += 2;
      } else if (opt === '-perm') {
        const want = (val ?? '').replace(/^[-/]/, '');
        filters.push((n) => (/^\d{3}$/.test(want) ? n.mode === want : /x/.test(want) ? Number(n.mode[0]) & 1 : true));
        i += 2;
      } else if (opt === '-empty') {
        filters.push((n) => (n.type === 'file' ? n.content.length === 0 : Object.keys(n.children).length === 0));
        i += 1;
      } else if (opt === '-user') {
        filters.push((n) => n.owner === val);
        i += 2;
      } else if (opt === '-maxdepth' || opt === '-mindepth' || opt === '-print') {
        i += opt === '-print' ? 1 : 2;
      } else {
        return errorResult(`find: unknown predicate \`${opt}'`);
      }
    }
    let out = '';
    let err = '';
    for (const p of paths) {
      const node = this.getNode(p);
      if (!node) {
        err += `find: '${p}': No such file or directory\n`;
        continue;
      }
      walk(node, p.replace(/(.)\/$/, '$1'), (n, path) => {
        if (filters.every((f) => f(n, path))) out += path + '\n';
      });
    }
    return { stdout: out, stderr: err, code: err ? 1 : 0 };
  },

  wc(args, stdin) {
    const { flags, positional } = parseFlags(args);
    const which = flags.size ? flags : new Set(['l', 'w', 'c']);
    const fmt = (text, label) => {
      const cols = [];
      if (which.has('l')) cols.push(String((text.match(/\n/g) || []).length).padStart(7));
      if (which.has('w')) cols.push(String(text.split(/\s+/).filter(Boolean).length).padStart(7));
      if (which.has('c')) cols.push(String(text.length).padStart(7));
      return cols.join('') + (label ? ` ${label}` : '') + '\n';
    };
    if (positional.length === 0) return result(fmt(stdin ?? '', ''));
    let out = '';
    let err = '';
    for (const f of positional) {
      const node = this.getNode(f);
      if (!node) err += `wc: ${f}: No such file or directory\n`;
      else if (node.type === 'dir') err += `wc: ${f}: Is a directory\n`;
      else if (!this._can(node, 'r')) err += `wc: ${f}: Permission denied\n`;
      else out += fmt(node.content, f);
    }
    return { stdout: out, stderr: err, code: err ? 1 : 0 };
  },

  head(args, stdin) {
    return headTail.call(this, 'head', args, stdin);
  },

  tail(args, stdin) {
    return headTail.call(this, 'tail', args, stdin);
  },

  sort(args, stdin) {
    const { flags, values, positional } = parseFlags(args, { withValue: ['k', 't'] });
    const text = positional.length ? this._readAll(positional, 'sort') : { text: stdin ?? '' };
    if (text.err) return errorResult(text.err, 2);
    let rows = lines(text.text);
    const field = values.k ? Number(String(values.k).split(',')[0]) : 0;
    const key = (row) => {
      if (!field) return row;
      const parts = values.t ? row.split(values.t) : row.trim().split(/\s+/);
      return parts[field - 1] ?? '';
    };
    const num = (v) => parseFloat(key(v)) || 0;
    rows.sort(flags.has('n') ? (a, b) => num(a) - num(b) || a.localeCompare(b) : (a, b) => key(a).localeCompare(key(b)));
    if (flags.has('r')) rows.reverse();
    if (flags.has('u')) rows = rows.filter((r, i) => i === 0 || r !== rows[i - 1]);
    return result(rows.length ? rows.join('\n') + '\n' : '');
  },

  uniq(args, stdin) {
    const { flags, positional } = parseFlags(args);
    const text = positional.length ? this._readAll(positional, 'uniq') : { text: stdin ?? '' };
    if (text.err) return errorResult(text.err);
    const rows = lines(text.text);
    const out = [];
    for (const r of rows) {
      const last = out[out.length - 1];
      if (last && last.row === r) last.count++;
      else out.push({ row: r, count: 1 });
    }
    const filtered = flags.has('d') ? out.filter((o) => o.count > 1) : out;
    return result(filtered.map((o) => (flags.has('c') ? `${String(o.count).padStart(7)} ${o.row}` : o.row)).join('\n') + (filtered.length ? '\n' : ''));
  },

  cut(args, stdin) {
    const { values, positional } = parseFlags(args, { withValue: ['d', 'f', 'c'] });
    const text = positional.length ? this._readAll(positional, 'cut') : { text: stdin ?? '' };
    if (text.err) return errorResult(text.err);
    if (!values.f && !values.c) return errorResult('cut: you must specify a list of bytes, characters, or fields');
    const rows = lines(text.text);
    if (values.c) {
      const [a, b] = values.c.split('-').map((n) => (n === '' ? undefined : Number(n)));
      return result(rows.map((r) => r.slice((a ?? 1) - 1, b ?? (values.c.includes('-') ? undefined : a))).join('\n') + '\n');
    }
    const delim = values.d ?? '\t';
    const fields = values.f.split(',').map(Number);
    return result(rows.map((r) => {
      const parts = r.split(delim);
      return fields.map((f) => parts[f - 1] ?? '').join(delim);
    }).join('\n') + (rows.length ? '\n' : ''));
  },

  tr(args, stdin) {
    const [from, to] = args;
    if (from === undefined) return errorResult('tr: missing operand');
    const text = stdin ?? '';
    if (from === 'a-z' && to === 'A-Z') return result(text.toUpperCase());
    if (from === 'A-Z' && to === 'a-z') return result(text.toLowerCase());
    if (args[0] === '-d') return result(text.split('').filter((c) => !args[1].includes(c)).join(''));
    let out = '';
    for (const ch of text) {
      const idx = from.indexOf(ch);
      out += idx === -1 ? ch : (to ?? '')[Math.min(idx, (to ?? '').length - 1)] ?? ch;
    }
    return result(out);
  },

  xargs(args, stdin) {
    const items = (stdin ?? '').split(/\s+/).filter(Boolean);
    const cmd = args.length ? args : ['echo'];
    return this._exec([...cmd, ...items], null);
  },

  tee(args, stdin) {
    const { flags, positional } = parseFlags(args);
    let err = '';
    for (const f of positional) {
      const e = this._writeFile(f, stdin ?? '', flags.has('a'));
      if (e) err += e.replace(/^bash/, 'tee');
    }
    return { stdout: stdin ?? '', stderr: err, code: err ? 1 : 0 };
  },

  ps(args) {
    const full = args.some((a) => /aux|-e|-A|ef/.test(a));
    const sortArg = args.find((a) => a.startsWith('--sort'));
    let procs = this.processes;
    if (sortArg) {
      const spec = sortArg.split('=')[1] ?? args[args.indexOf(sortArg) + 1] ?? '';
      const desc = spec.startsWith('-');
      const key = spec.replace(/^[-+]/, '').replace('%', '');
      const field = key === 'mem' || key === 'rss' ? 'mem' : key === 'cpu' ? 'cpu' : 'pid';
      procs = [...procs].sort((a, b) => (desc ? b[field] - a[field] : a[field] - b[field]));
    }
    if (!full) {
      const rows = procs.filter((p) => p.user === this.user);
      return result(
        ['    PID TTY          TIME CMD', ...rows.map((p) => `${String(p.pid).padStart(7)} pts/0    00:00:0${p.pid % 10} ${p.command.split(' ')[0].replace(/^-/, '')}`)].join('\n') + '\n'
      );
    }
    const header = 'USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND';
    const rows = procs.map((p) => {
      const rss = Math.round(p.mem * 8192 * 4);
      return `${p.user.padEnd(9)}${String(p.pid).padStart(8)} ${p.cpu.toFixed(1).padStart(4)} ${p.mem.toFixed(1).padStart(4)} ${String(rss * 3).padStart(6)} ${String(rss).padStart(5)} ?        S${p.cpu > 50 ? 'l' : 's'}   10:00   0:0${p.pid % 10} ${p.command}`;
    });
    return result([header, ...rows].join('\n') + '\n');
  },

  top() {
    const sorted = [...this.processes].sort((a, b) => b.cpu - a.cpu || b.mem - a.mem);
    const totalCpu = sorted.reduce((s, p) => s + p.cpu, 0);
    const header = [
      `top - 10:00:00 up 3 days,  4:12,  1 user,  load average: ${(totalCpu / 100).toFixed(2)}, 0.31, 0.28`,
      `Tasks: ${sorted.length} total,   1 running, ${sorted.length - 1} sleeping,   0 stopped,   0 zombie`,
      `%Cpu(s): ${Math.min(totalCpu, 100).toFixed(1)} us,  1.0 sy,  0.0 ni, ${Math.max(0, 99 - totalCpu).toFixed(1)} id`,
      `MiB Mem :   3936.0 total,   ${(3936 * (1 - sorted.reduce((s, p) => s + p.mem, 0) / 100)).toFixed(1)} free`,
      '',
      '    PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND',
    ];
    const rows = sorted.map((p) => {
      const res = Math.round(p.mem * 8192 * 4);
      return `${String(p.pid).padStart(7)} ${p.user.padEnd(9)} 20   0 ${String(res * 3).padStart(7)} ${String(res).padStart(6)} ${String(Math.round(res / 4)).padStart(6)} ${p.cpu > 50 ? 'R' : 'S'} ${p.cpu.toFixed(1).padStart(5)} ${p.mem.toFixed(1).padStart(5)}   0:0${p.pid % 10}.00 ${p.command.split(' ')[0].replace(/^.*\//, '')}`;
    });
    return result([...header, ...rows].join('\n') + '\n');
  },

  kill(args) {
    const pids = args.filter((a) => !a.startsWith('-'));
    if (pids.length === 0) return errorResult('kill: usage: kill [-s sigspec | -n signum | -sigspec] pid | jobspec ... or kill -l [sigspec]', 2);
    let err = '';
    for (const p of pids) {
      if (!/^\d+$/.test(p)) {
        err += `bash: kill: ${p}: arguments must be process or job IDs\n`;
        continue;
      }
      const proc = this.getProcess(p);
      if (!proc) {
        err += `bash: kill: (${p}) - No such process\n`;
        continue;
      }
      if (proc.user !== this.user && this.user !== 'root') {
        err += `bash: kill: (${p}) - Operation not permitted\n`;
        continue;
      }
      if (proc.pid === 1) {
        err += `bash: kill: (1) - Operation not permitted\n`;
        continue;
      }
      this.processes = this.processes.filter((x) => x !== proc);
    }
    return err ? errorResult(err) : result();
  },

  pkill(args) {
    return killByName.call(this, 'pkill', args);
  },

  killall(args) {
    return killByName.call(this, 'killall', args);
  },

  fg() {
    return errorResult('bash: fg: current: no such job');
  },

  bg() {
    return errorResult('bash: bg: current: no such job');
  },

  jobs() {
    return result();
  },

  whoami() {
    return result(this.user + '\n');
  },

  id() {
    const uid = this.user === 'root' ? 0 : 1000;
    return result(`uid=${uid}(${this.user}) gid=${uid}(${this.user}) groups=${uid}(${this.user})${this.user === 'user' ? ',27(sudo)' : ''}\n`);
  },

  hostname() {
    return result(HOSTNAME + '\n');
  },

  uname(args) {
    return result(args.includes('-a') ? 'Linux backend 6.8.0-45-generic #45-Ubuntu SMP x86_64 GNU/Linux\n' : 'Linux\n');
  },

  date() {
    return result('Sun Sep 13 10:00:00 UTC 2026\n');
  },

  sudo(args, stdin) {
    if (args.length === 0) return errorResult('usage: sudo command');
    if (args[0] === 'su' || args[0] === '-i' || args[0] === '-s') {
      const target = args[0] === 'su' ? args.filter((a) => !a.startsWith('-'))[1] ?? 'root' : 'root';
      if (!KNOWN_USERS.has(target)) return errorResult(`su: user ${target} does not exist`);
      this.user = target;
      this.vars.USER = target;
      return result();
    }
    const saved = this.user;
    this.user = 'root';
    try {
      return this._exec(args, stdin);
    } finally {
      this.user = saved;
    }
  },

  su(args) {
    const target = args.filter((a) => !a.startsWith('-'))[0] ?? 'root';
    if (!KNOWN_USERS.has(target)) return errorResult(`su: user ${target} does not exist`);
    if (this.user !== 'root') return errorResult('su: Authentication failure\nПодсказка: в этом терминале стать root можно через sudo su');
    this.user = target;
    this.vars.USER = target;
    return result();
  },

  exit(args) {
    if (this.user === 'root' && this._scriptDepth === 0) {
      this.user = DEFAULT_USER;
      this.vars.USER = DEFAULT_USER;
      return result();
    }
    throw new ShellExit(Number(args[0] ?? 0));
  },

  clear() {
    return { ...result(), clear: true };
  },

  history() {
    return result(this.history.map((h, i) => `${String(i + 1).padStart(5)}  ${h}`).join('\n') + '\n');
  },

  env() {
    return result(Object.entries(this.vars).filter(([k]) => /^[A-Z_]+$/.test(k)).map(([k, v]) => `${k}=${v}`).join('\n') + '\n');
  },

  printenv(args) {
    if (args[0]) return this.vars[args[0]] !== undefined ? result(this.vars[args[0]] + '\n') : result('', '', 1);
    return COMMANDS.env.call(this);
  },

  export(args) {
    for (const a of args) {
      const m = /^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(a);
      if (m) this.vars[m[1]] = m[2];
    }
    return result();
  },

  unset(args) {
    for (const a of args) delete this.vars[a];
    return result();
  },

  true() {
    return result();
  },

  false() {
    return result('', '', 1);
  },

  test(args) {
    return testCommand.call(this, args);
  },

  '[': function (args) {
    if (args[args.length - 1] !== ']') return errorResult("bash: [: missing `]'", 2);
    return testCommand.call(this, args.slice(0, -1));
  },

  bash(args, stdin) {
    return runScriptFile.call(this, 'bash', args, stdin);
  },

  sh(args, stdin) {
    return runScriptFile.call(this, 'sh', args, stdin);
  },

  source(args, stdin) {
    return runScriptFile.call(this, 'source', args, stdin);
  },

  '.': function (args, stdin) {
    return runScriptFile.call(this, '.', args, stdin);
  },

  which(args) {
    const out = args.filter((a) => COMMANDS[a] && !['[', '.'].includes(a)).map((a) => `/usr/bin/${a}`);
    return { stdout: out.length ? out.join('\n') + '\n' : '', stderr: '', code: out.length === args.length ? 0 : 1 };
  },

  man(args) {
    const name = args[0];
    if (!name) return errorResult('What manual page do you want?\nFor example, try \'man ls\'.');
    if (!COMMANDS[name]) return errorResult(`No manual entry for ${name}`, 16);
    return result(`${name.toUpperCase()}(1)\n\nВ учебном терминале полных страниц справки нет — краткое описание команды ${name} есть в теории урока.\n`);
  },

  file(args) {
    if (!args.length) return errorResult('Usage: file [FILE...]');
    let out = '';
    for (const a of args) {
      const node = this.getNode(a);
      if (!node) out += `${a}: cannot open (No such file or directory)\n`;
      else if (node.type === 'dir') out += `${a}: directory\n`;
      else if (node.content.startsWith('#!')) out += `${a}: ${node.content.split('\n')[0].slice(2).trim()} script, ASCII text executable\n`;
      else if (node.content.length === 0) out += `${a}: empty\n`;
      else out += `${a}: ASCII text\n`;
    }
    return result(out);
  },

  stat(args) {
    const f = args.find((a) => !a.startsWith('-'));
    const node = f && this.getNode(f);
    if (!node) return errorResult(`stat: cannot statx '${f ?? ''}': No such file or directory`);
    const size = node.type === 'dir' ? 4096 : node.content.length;
    return result(`  File: ${f}\n  Size: ${size}\tBlocks: 8\t${node.type === 'dir' ? 'directory' : 'regular file'}\nAccess: (0${node.mode}/${modeToString(node)})  Uid: (${node.owner === 'root' ? 0 : 1000}/${node.owner.padEnd(8)})\n`);
  },

  tree(args) {
    const start = args.find((a) => !a.startsWith('-')) ?? '.';
    const node = this.getNode(start);
    if (!node) return errorResult(`${start} [error opening dir]`);
    let dirs = 0;
    let files = 0;
    const render = (n, prefix) => {
      const names = Object.keys(n.children).filter((x) => !x.startsWith('.')).sort();
      return names.map((name, i) => {
        const child = n.children[name];
        const last = i === names.length - 1;
        const branch = `${prefix}${last ? '└── ' : '├── '}${name}${child.type === 'dir' ? '/' : ''}\n`;
        if (child.type === 'dir') {
          dirs++;
          return branch + render(child, prefix + (last ? '    ' : '│   '));
        }
        files++;
        return branch;
      }).join('');
    };
    const body = node.type === 'dir' ? render(node, '') : '';
    return result(`${start}\n${body}\n${dirs} directories, ${files} files\n`);
  },
};

// Общие помощники для команд (вызываются с this = shell).

VirtualShell.prototype._readAll = function (files, tool) {
  let text = '';
  for (const f of files) {
    const node = this.getNode(f);
    if (!node) return { err: `${tool}: cannot read: ${f}: No such file or directory` };
    if (node.type === 'dir') return { err: `${tool}: read failed: ${f}: Is a directory` };
    if (!this._can(node, 'r')) return { err: `${tool}: cannot read: ${f}: Permission denied` };
    text += node.content.endsWith('\n') || !node.content ? node.content : node.content + '\n';
  }
  return { text };
};

function headTail(which, args, stdin) {
  let count = 10;
  const files = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '-n') count = Number(args[++i]);
    else if (/^-n\d+$/.test(a)) count = Number(a.slice(2));
    else if (/^-\d+$/.test(a)) count = Number(a.slice(1));
    else files.push(a);
  }
  if (!Number.isFinite(count)) return errorResult(`${which}: invalid number of lines`);
  const take = (text, label) => {
    const rows = lines(text);
    const part = which === 'head' ? rows.slice(0, count) : rows.slice(Math.max(0, rows.length - count));
    return (label ? `==> ${label} <==\n` : '') + (part.length ? part.join('\n') + '\n' : '');
  };
  if (files.length === 0) return result(take(stdin ?? '', null));
  let out = '';
  let err = '';
  for (const f of files) {
    const node = this.getNode(f);
    if (!node) err += `${which}: cannot open '${f}' for reading: No such file or directory\n`;
    else if (node.type === 'dir') err += `${which}: error reading '${f}': Is a directory\n`;
    else if (!this._can(node, 'r')) err += `${which}: cannot open '${f}' for reading: Permission denied\n`;
    else out += take(node.content, files.length > 1 ? f : null);
  }
  return { stdout: out, stderr: err, code: err ? 1 : 0 };
}

function killByName(tool, args) {
  const name = args.filter((a) => !a.startsWith('-'))[0];
  if (!name) return errorResult(`${tool}: no process specified`);
  const victims = this.processes.filter((p) => p.command.split(' ')[0].replace(/^.*\//, '').replace(/^-/, '') === name || p.command.includes(name));
  if (victims.length === 0) return errorResult(tool === 'killall' ? `${name}: no process found` : '', 1);
  let err = '';
  for (const v of victims) {
    if ((v.user !== this.user && this.user !== 'root') || v.pid === 1) {
      err += `${tool}: killing pid ${v.pid} failed: Operation not permitted\n`;
      continue;
    }
    this.processes = this.processes.filter((x) => x !== v);
  }
  return err ? errorResult(err) : result();
}

function runScriptFile(tool, args, stdin) {
  const file = args.find((a) => !a.startsWith('-'));
  if (!file) {
    if (tool === 'bash' || tool === 'sh') return result(); // просто "открыть новый шелл" — ничего не меняется
    return errorResult(`bash: ${tool}: filename argument required`, 2);
  }
  const node = this.getNode(file);
  if (!node) return errorResult(`${tool}: ${file}: No such file or directory`, 127);
  if (node.type === 'dir') return errorResult(`${tool}: ${file}: Is a directory`, 126);
  if (!this._can(node, 'r')) return errorResult(`${tool}: ${file}: Permission denied`, 126);
  return this._runScript(node.content, args.slice(args.indexOf(file) + 1), stdin, file);
}

function testCommand(args) {
  if (args.length === 0) return result('', '', 1);
  if (args[0] === '!') {
    const inner = testCommand.call(this, args.slice(1));
    return result('', '', inner.code === 0 ? 1 : 0);
  }
  const ok = (v) => result('', '', v ? 0 : 1);
  if (args.length === 1) return ok(args[0] !== '');
  if (args.length === 2) {
    const [op, val] = args;
    const node = this.getNode(val);
    switch (op) {
      case '-e': return ok(!!node);
      case '-f': return ok(node?.type === 'file');
      case '-d': return ok(node?.type === 'dir');
      case '-s': return ok(node?.type === 'file' && node.content.length > 0);
      case '-r': return ok(!!node && this._can(node, 'r'));
      case '-w': return ok(!!node && this._can(node, 'w'));
      case '-x': return ok(!!node && this._can(node, 'x'));
      case '-z': return ok(val === '');
      case '-n': return ok(val !== '');
      default: return errorResult(`bash: [: ${op}: unary operator expected`, 2);
    }
  }
  const [a, op, b] = args;
  switch (op) {
    case '=':
    case '==': return ok(a === b);
    case '!=': return ok(a !== b);
    case '-eq': return ok(Number(a) === Number(b));
    case '-ne': return ok(Number(a) !== Number(b));
    case '-gt': return ok(Number(a) > Number(b));
    case '-lt': return ok(Number(a) < Number(b));
    case '-ge': return ok(Number(a) >= Number(b));
    case '-le': return ok(Number(a) <= Number(b));
    default: return errorResult(`bash: [: ${op}: binary operator expected`, 2);
  }
}

function formatLong(name, node) {
  const size = node.type === 'dir' ? 4096 : node.content.length;
  const links = node.type === 'dir' ? Object.values(node.children).filter((c) => c.type === 'dir').length + 2 : 1;
  return `${modeToString(node)} ${String(links).padStart(2)} ${node.owner.padEnd(8)} ${node.owner.padEnd(8)} ${String(size).padStart(6)} ${FAKE_DATE} ${name}`;
}

// chmod: '755', 'u+x', '+x', 'go-w', 'a=r', 'u+x,g-w'
function applyMode(current, spec, isDir) {
  if (/^[0-7]{3,4}$/.test(spec)) return spec.slice(-3);
  let digits = current.split('').map(Number);
  for (const part of spec.split(',')) {
    const m = /^([ugoa]*)([+\-=])([rwxX]*)$/.exec(part);
    if (!m) return null;
    const who = m[1] || 'a';
    const targets = [];
    if (who.includes('a')) targets.push(0, 1, 2);
    if (who.includes('u')) targets.push(0);
    if (who.includes('g')) targets.push(1);
    if (who.includes('o')) targets.push(2);
    let bits = 0;
    if (m[3].includes('r')) bits |= 4;
    if (m[3].includes('w')) bits |= 2;
    if (m[3].includes('x') || (m[3].includes('X') && (isDir || digits.some((d) => d & 1)))) bits |= 1;
    for (const t of targets) {
      if (m[2] === '+') digits[t] |= bits;
      else if (m[2] === '-') digits[t] &= ~bits;
      else digits[t] = bits;
    }
  }
  return digits.join('');
}

export const SUPPORTED_COMMANDS = Object.keys(COMMANDS).filter((c) => /^[a-z]+$/.test(c));
