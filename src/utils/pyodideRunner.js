import MINI_FASTAPI_SOURCE from './miniFastapi.py?raw';
import MINI_SQLALCHEMY_SOURCE from './miniSqlalchemy.py?raw';

const PYODIDE_VERSION = '0.26.4';
const PYODIDE_CDN = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

// bootstrap 'fastapi' и 'sqlalchemy' подставляют мини-модуль перед кодом ученика.
// 'sqlite3' ничего не подставляет — просто догружает настоящий модуль sqlite3
// (в Pyodide он не встроен по умолчанию, его нужно догрузить отдельным пакетом).
const BOOTSTRAP_SOURCE = {
  fastapi: MINI_FASTAPI_SOURCE,
  sqlalchemy: MINI_SQLALCHEMY_SOURCE,
};
const BOOTSTRAP_PACKAGES = {
  sqlalchemy: ['sqlite3'],
  sqlite3: ['sqlite3'],
};

let pyodidePromise = null;
let runQueue = Promise.resolve();
const loadedPackages = new Set();

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Не удалось загрузить Python-движок. Проверь интернет-соединение.'));
    document.head.appendChild(script);
  });
}

// Pyodide — это настоящий Python, скомпилированный так, чтобы работать прямо в браузере.
// Загружается один раз (при первом запуске кода) и потом переиспользуется на всех уроках.
export function getPyodide(onStatus) {
  if (!pyodidePromise) {
    pyodidePromise = (async () => {
      onStatus?.('loading');
      if (!window.loadPyodide) {
        await loadScript(`${PYODIDE_CDN}pyodide.js`);
      }
      const pyodide = await window.loadPyodide({ indexURL: PYODIDE_CDN });
      onStatus?.('ready');
      return pyodide;
    })();
  }
  return pyodidePromise;
}

export function isPyodideLoaded() {
  return pyodidePromise !== null;
}

const ERROR_HINTS = {
  NameError: 'Похоже, ты используешь переменную, которой ещё нет — проверь, нет ли опечатки в имени, или объяви её раньше.',
  SyntaxError: 'Где-то нарушены правила записи кода Python — например, забыта скобка, двоеточие или кавычка.',
  IndentationError:
    'Проверь отступы (пробелы в начале строки). В Python именно отступы показывают, какой код относится к if, for, def и т.д.',
  TabError: 'В коде перемешаны пробелы и табуляции для отступов. Используй что-то одно — лучше пробелы.',
  TypeError: 'Ты пытаешься выполнить операцию над данными неподходящего типа — например, сложить число и текст напрямую.',
  ValueError: 'Тип значения правильный, но само значение не подходит — например, превратить в число текст, который числом не является.',
  ZeroDivisionError: 'На ноль делить нельзя — даже компьютер не может сказать, что получится.',
  IndexError: 'Ты обращаешься к элементу списка по номеру, которого в списке нет. Проверь длину списка через len(...) — индексы начинаются с 0.',
  KeyError: 'В словаре нет ключа с таким именем. Проверь написание ключа или используй .get(), чтобы не получать ошибку.',
  AttributeError: 'У этого объекта нет такого метода или свойства — возможно, опечатка, или это не тот тип данных, который ты ожидал.',
  ModuleNotFoundError: 'Такой модуль недоступен в песочнице. Здесь можно использовать только то, что показано в уроке.',
  ImportError: 'Не получилось что-то импортировать. Проверь название модуля и то, что именно ты импортируешь.',
  RecursionError: 'Функция вызывает сама себя бесконечно, без остановки. Проверь условие, при котором рекурсия должна закончиться.',
};

function formatPyError(rawMessage, sourceCode) {
  const message = String(rawMessage || '').trim();
  const lines = message.split('\n').filter(Boolean);
  const lastLine = lines[lines.length - 1] || message;

  const frameRegex = /File "<exec>", line (\d+)(?:, in (\S+))?/g;
  let match;
  let lastFrame = null;
  while ((match = frameRegex.exec(message))) {
    lastFrame = { line: Number(match[1]), func: match[2] };
  }

  const typeMatch = lastLine.match(/^(\w+(?:Error|Exception|Warning)):?\s*(.*)$/);
  const errorType = typeMatch ? typeMatch[1] : null;
  const errorText = typeMatch ? typeMatch[2] : lastLine;

  const codeLines = sourceCode.split('\n');
  const sourceLine =
    lastFrame && codeLines[lastFrame.line - 1] !== undefined ? codeLines[lastFrame.line - 1].trim() : null;

  let out = '';
  if (lastFrame) {
    out += `Строка ${lastFrame.line}`;
    if (lastFrame.func && lastFrame.func !== '<module>') out += ` (внутри функции ${lastFrame.func})`;
    out += ':\n';
    if (sourceLine) out += `  ${sourceLine}\n`;
  }
  out += `${errorType || 'Ошибка'}: ${errorText || message}`;
  if (errorType && ERROR_HINTS[errorType]) {
    out += `\n💡 ${ERROR_HINTS[errorType]}`;
  }
  return out;
}

async function runPythonInner(code, { bootstrap = null, onStatus } = {}) {
  const pyodide = await getPyodide(onStatus);

  const neededPackages = BOOTSTRAP_PACKAGES[bootstrap] || [];
  const toLoad = neededPackages.filter((p) => !loadedPackages.has(p));
  if (toLoad.length) {
    onStatus?.('loading');
    await pyodide.loadPackage(toLoad);
    toLoad.forEach((p) => loadedPackages.add(p));
    onStatus?.('ready');
  }

  const logs = [];
  pyodide.setStdout({ batched: (text) => logs.push({ type: 'log', text }) });
  pyodide.setStderr({ batched: (text) => logs.push({ type: 'error', text }) });

  const namespace = pyodide.globals.get('dict')();
  try {
    const bootstrapSource = BOOTSTRAP_SOURCE[bootstrap];
    if (bootstrapSource) {
      await pyodide.runPythonAsync(bootstrapSource, { globals: namespace });
    }
    await pyodide.runPythonAsync(code, { globals: namespace });
  } catch (err) {
    logs.push({ type: 'error', text: formatPyError(err && err.message ? err.message : String(err), code) });
  } finally {
    namespace.destroy();
  }
  return logs;
}

// Выполнения ставятся в очередь — Pyodide один на всё приложение, поэтому
// два запуска одновременно (например, из двух открытых уроков) не должны мешать друг другу.
export function runPython(code, options = {}) {
  const result = runQueue.then(() => runPythonInner(code, options));
  runQueue = result.then(
    () => undefined,
    () => undefined
  );
  return result;
}
