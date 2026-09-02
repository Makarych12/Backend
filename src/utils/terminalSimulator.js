// Имитация поведения настоящего терминала. Ничего не выполняется по-настоящему —
// мы просто показываем ученику ТО, ЧТО РЕАЛЬНО ПРОИЗОШЛО БЫ, если бы он ввёл
// эту же команду на своём компьютере с уже настроенным Python.

const PACKAGES = {
  fastapi: '0.115.6',
  uvicorn: '0.34.0',
  pydantic: '2.10.4',
  sqlalchemy: '2.0.36',
  alembic: '1.14.0',
  'psycopg2-binary': '2.9.10',
  'python-dotenv': '1.0.1',
  pytest: '8.3.4',
  httpx: '0.28.1',
  passlib: '1.7.4',
  bcrypt: '4.2.1',
  'python-jose': '3.3.0',
  celery: '5.4.0',
  redis: '5.2.1',
  websockets: '14.1',
  requests: '2.32.3',
  jinja2: '3.1.4',
  'python-multipart': '0.0.20',
};

function line(text, tone = 'default') {
  return { text, tone };
}

function ok(lines) {
  return { ok: true, lines };
}

function fail(lines) {
  return { ok: false, lines };
}

export function createTerminalSession() {
  const state = {
    cwd: '~/project',
    venvActive: false,
    installed: new Set(['pip', 'setuptools']),
  };

  function prompt() {
    const venvPrefix = state.venvActive ? '(venv) ' : '';
    return `${venvPrefix}user@backend:${state.cwd}$`;
  }

  function pipInstall(args) {
    const packages = args.filter((a) => !a.startsWith('-'));
    if (packages.length === 0) {
      return fail([line('ERROR: You must give at least one requirement to install', 'error')]);
    }
    const lines = [];
    let anyOk = false;
    let anyFail = false;
    for (const pkg of packages) {
      const name = pkg.toLowerCase();
      if (state.installed.has(name)) {
        lines.push(line(`Requirement already satisfied: ${pkg} in ./venv/lib/python3.12/site-packages`, 'muted'));
        anyOk = true;
        continue;
      }
      if (PACKAGES[name]) {
        lines.push(line(`Collecting ${pkg}`, 'default'));
        lines.push(line(`  Downloading ${pkg}-${PACKAGES[name]}-py3-none-any.whl (128 kB)`, 'muted'));
        lines.push(line(`Installing collected packages: ${pkg}`, 'default'));
        lines.push(line(`Successfully installed ${pkg}-${PACKAGES[name]}`, 'success'));
        state.installed.add(name);
        anyOk = true;
      } else {
        lines.push(line(`ERROR: Could not find a version that satisfies the requirement ${pkg} (from versions: none)`, 'error'));
        lines.push(line(`ERROR: No matching distribution found for ${pkg}`, 'error'));
        anyFail = true;
      }
    }
    return anyFail && !anyOk ? fail(lines) : ok(lines);
  }

  function pipList() {
    const rows = Array.from(state.installed).sort();
    const lines = [line('Package         Version', 'muted'), line('--------------- -------', 'muted')];
    for (const name of rows) {
      const version = PACKAGES[name] || (name === 'pip' ? '24.3.1' : name === 'setuptools' ? '75.6.0' : '0.0.0');
      lines.push(line(`${name.padEnd(16)}${version}`, 'default'));
    }
    return ok(lines);
  }

  function pipUninstall(args) {
    const pkg = args.find((a) => !a.startsWith('-'));
    if (!pkg) return fail([line('ERROR: You must give at least one requirement to uninstall', 'error')]);
    const name = pkg.toLowerCase();
    if (!state.installed.has(name)) {
      return fail([line(`WARNING: Skipping ${pkg} as it is not installed.`, 'error')]);
    }
    state.installed.delete(name);
    return ok([line(`Successfully uninstalled ${pkg}-${PACKAGES[name] || '0.0.0'}`, 'success')]);
  }

  function venvActivate(cmd) {
    if (!state.venvCreated) {
      const missingPath = cmd.includes('Scripts') ? 'venv\\Scripts\\activate' : 'venv/bin/activate';
      return fail([
        line(`bash: ${missingPath}: No such file or directory`, 'error'),
        line('Сначала создай виртуальное окружение: python -m venv venv', 'muted'),
      ]);
    }
    state.venvActive = true;
    return ok([]);
  }

  function uvicornStart(args) {
    const target = args.find((a) => !a.startsWith('-')) || 'main:app';
    const reload = args.includes('--reload');
    const lines = [];
    if (reload) {
      lines.push(line('INFO:     Will watch for changes in these directories: [\'/home/user/project\']', 'default'));
    }
    lines.push(line('INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)', 'success'));
    if (reload) {
      lines.push(line('INFO:     Started reloader process [12345] using WatchFiles', 'default'));
    }
    lines.push(line('INFO:     Started server process [12347]', 'default'));
    lines.push(line('INFO:     Waiting for application startup.', 'default'));
    lines.push(line('INFO:     Application startup complete.', 'success'));
    if (!target.includes(':')) {
      return fail([
        line(`Error loading ASGI app. Import string "${target}" must be in format "<module>:<attribute>".`, 'error'),
      ]);
    }
    return ok(lines);
  }

  // lessonCommands — необязательная карта точных команд для конкретного урока
  // (например, что выведет python app.py именно в этом уроке). Проверяется первой.
  function execute(raw, lessonCommands = {}) {
    const trimmed = raw.trim();
    if (!trimmed) return ok([]);

    if (lessonCommands[trimmed]) {
      const def = lessonCommands[trimmed];
      const lines = (Array.isArray(def.output) ? def.output : [def.output]).map((text) =>
        line(text, def.type === 'error' ? 'error' : def.type === 'success' ? 'success' : 'default')
      );
      if (def.type === 'success' && lines.length) {
        lines[lines.length - 1] = { ...lines[lines.length - 1], tone: 'success' };
      }
      return def.type === 'error' ? fail(lines) : ok(lines);
    }

    const parts = trimmed.split(/\s+/);
    const [cmd, ...args] = parts;

    if (trimmed === 'clear' || trimmed === 'cls') {
      return { ok: true, lines: [], clear: true };
    }

    if (cmd === 'python' || cmd === 'python3') {
      if (args[0] === '--version' || args[0] === '-V') {
        return ok([line('Python 3.12.7', 'success')]);
      }
      if (args[0] === '-m' && args[1] === 'venv') {
        state.venvCreated = true;
        return ok([]);
      }
      if (args.length === 0) {
        return ok([
          line('Python 3.12.7 (main, Oct  1 2025, 10:00:00) on linux', 'default'),
          line('Type "help", "copyright", "credits" or "license" for more information.', 'muted'),
          line('>>> ', 'default'),
        ]);
      }
      if (args[0] && args[0].endsWith('.py')) {
        return fail([line(`python: can't open file '${args[0]}': [Errno 2] No such file or directory`, 'error')]);
      }
      return fail([line(`python: command not recognized: ${args.join(' ')}`, 'error')]);
    }

    if (cmd === 'pip' || cmd === 'pip3') {
      if (args[0] === 'install') return pipInstall(args.slice(1));
      if (args[0] === 'uninstall') return pipUninstall(args.slice(1));
      if (args[0] === 'list') return pipList();
      if (args[0] === 'freeze') {
        return ok(
          Array.from(state.installed)
            .filter((n) => PACKAGES[n])
            .sort()
            .map((n) => line(`${n}==${PACKAGES[n]}`))
        );
      }
      if (args[0] === '--version') {
        return ok([line('pip 24.3.1 from /usr/lib/python3.12/site-packages/pip (python 3.12)', 'default')]);
      }
      return fail([line(`ERROR: unknown command "${args[0] || ''}"`, 'error')]);
    }

    if (cmd === 'uvicorn') return uvicornStart(args);

    if (cmd === 'pytest') {
      if (!state.installed.has('pytest')) {
        return fail([line('bash: pytest: command not found', 'error'), line('Сначала установи pytest: pip install pytest', 'muted')]);
      }
      const isVerbose = args.includes('-v');
      const lines = [
        line('============================= test session starts ==============================', 'default'),
        line('platform linux -- Python 3.12.7, pytest-8.3.4, pluggy-1.5.0', 'default'),
        line('rootdir: /home/user/project', 'default'),
        line('collected 3 items', 'default'),
        line('', 'default'),
      ];
      if (isVerbose) {
        lines.push(line('test_main.py::test_create_item PASSED                                     [ 33%]', 'default'));
        lines.push(line('test_main.py::test_get_item PASSED                                        [ 66%]', 'default'));
        lines.push(line('test_main.py::test_invalid_item PASSED                                    [100%]', 'default'));
      } else {
        lines.push(line('test_main.py ...                                                              [100%]', 'default'));
      }
      lines.push(line('', 'default'));
      lines.push(line('============================== 3 passed in 0.04s ===============================', 'success'));
      return ok(lines);
    }

    if (trimmed.includes('activate') && (trimmed.startsWith('source ') || cmd.startsWith('venv') || cmd.startsWith('.\\venv') || cmd.startsWith('.venv'))) {
      return venvActivate(trimmed);
    }

    if (cmd === 'deactivate') {
      if (!state.venvActive) return fail([line('bash: deactivate: command not found', 'error')]);
      state.venvActive = false;
      return ok([]);
    }

    if (cmd === 'ls' || cmd === 'dir') {
      return ok([line('app.py  requirements.txt  venv/', 'default')]);
    }

    if (cmd === 'cd') {
      const target = args[0] || '~';
      state.cwd = target === '..' ? state.cwd.split('/').slice(0, -1).join('/') || '~' : `${state.cwd}/${target}`.replace('~/', '~/');
      return ok([]);
    }

    if (cmd === 'mkdir' || cmd === 'touch') {
      return ok([]);
    }

    if (cmd === 'git') {
      const sub = args[0];
      if (sub === 'init') {
        state.gitInitialized = true;
        return ok([line('Initialized empty Git repository in /home/user/project/.git/', 'success')]);
      }
      if (sub === 'config') {
        return ok([]);
      }
      if (sub === 'status') {
        if (!state.gitInitialized) {
          return fail([line('fatal: not a git repository (or any of the parent directories): .git', 'error')]);
        }
        return ok([
          line('On branch main', 'default'),
          line('No commits yet', 'muted'),
          line('Changes to be committed:', 'success'),
          line('  (use "git rm --cached <file>..." to unstage)', 'muted'),
          line('        new file:   main.py', 'success'),
          line('        new file:   requirements.txt', 'success'),
          line('        new file:   README.md', 'success'),
        ]);
      }
      if (sub === 'add') {
        return ok([]);
      }
      if (sub === 'commit') {
        return ok([
          line('[main (root-commit) 4a1f9e2] Initial commit: FastAPI backend with PostgreSQL', 'success'),
          line(' 3 files changed, 142 insertions(+)', 'default'),
          line(' create mode 100644 main.py', 'muted'),
          line(' create mode 100644 requirements.txt', 'muted'),
          line(' create mode 100644 README.md', 'muted'),
        ]);
      }
      if (sub === 'log') {
        return ok([
          line('commit 4a1f9e2d8b7c3e1a0f9d8c7b6a5e4d3c2b1a0f9e (HEAD -> main)', 'warning'),
          line('Author: Alex Developer <alex@example.com>', 'default'),
          line('Date:   Wed Sep 2 14:00:00 2026 +0300', 'muted'),
          line('', 'default'),
          line('    feat: add user authentication and order endpoints', 'default'),
          line('', 'default'),
          line('commit 1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c', 'warning'),
          line('Author: Alex Developer <alex@example.com>', 'default'),
          line('Date:   Wed Sep 2 12:30:00 2026 +0300', 'muted'),
          line('', 'default'),
          line('    Initial commit: FastAPI backend with PostgreSQL', 'default'),
        ]);
      }
      if (sub === 'branch') {
        if (args[1]) {
          return ok([line(`Created branch '${args[1]}'`, 'success')]);
        }
        return ok([
          line('* main', 'success'),
          line('  feature/auth-jwt', 'default'),
          line('  fix/db-connection', 'default'),
        ]);
      }
      if (sub === 'checkout' || sub === 'switch') {
        const branchName = args[1] === '-b' || args[1] === '-c' ? args[2] : args[1] || 'main';
        return ok([line(`Switched to branch '${branchName}'`, 'success')]);
      }
      if (sub === 'merge') {
        const branchName = args[1] || 'feature';
        return ok([
          line(`Updating 4a1f9e2..8b9c0d1`, 'default'),
          line(`Fast-forward (${branchName})`, 'muted'),
          line(` auth.py | 45 +++++++++++++++++++++++++++++++++++++++++++++`, 'success'),
          line(` 1 file changed, 45 insertions(+)`, 'default'),
        ]);
      }
      if (sub === 'push') {
        return ok([
          line('Enumerating objects: 7, done.', 'default'),
          line('Counting objects: 100% (7/7), done.', 'muted'),
          line('Writing objects: 100% (7/7), 1.42 KiB | 1.42 MiB/s, done.', 'muted'),
          line('To https://github.com/alex/my-backend-app.git', 'default'),
          line(' * [new branch]      main -> main', 'success'),
          line('Branch \'main\' set up to track remote branch \'main\' from \'origin\'.', 'success'),
        ]);
      }
      if (sub === 'pull') {
        return ok([
          line('Already up to date.', 'success'),
        ]);
      }
      return ok([line(`git version 2.47.1`, 'default')]);
    }

    if (cmd === 'docker') {
      const sub = args[0];
      if (sub === 'build') {
        return ok([
          line('DEBU[0000] Initializing docker build context...', 'muted'),
          line('[+] Building 1.2s (8/8) FINISHED', 'success'),
          line(' => [internal] load build definition from Dockerfile', 'default'),
          line(' => => transferring dockerfile: 320B', 'muted'),
          line(' => [1/4] FROM docker.io/library/python:3.12-slim@sha256:abc123...', 'default'),
          line(' => [2/4] WORKDIR /app', 'default'),
          line(' => [3/4] COPY requirements.txt .', 'default'),
          line(' => [4/4] RUN pip install -r requirements.txt', 'default'),
          line(' => exporting to image', 'success'),
          line(' => => naming to docker.io/library/myapp:latest', 'success'),
          line('Successfully built image myapp:latest', 'success'),
        ]);
      }
      if (sub === 'run') {
        return ok([
          line('INFO:     Started server process [1]', 'default'),
          line('INFO:     Waiting for application startup.', 'default'),
          line('INFO:     Application startup complete.', 'success'),
          line('INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)', 'success'),
        ]);
      }
      if (sub === 'stop') {
        const id = args[1] || 'myapp_container';
        return ok([line(id, 'success')]);
      }
      if (sub === 'rm') {
        const id = args[1] || 'myapp_container';
        return ok([line(id, 'success')]);
      }
      if (sub === 'compose') {
        const action = args[1];
        if (action === 'up') {
          return ok([
            line('[+] Running 2/2', 'success'),
            line(' ✔ Container project-db-1   Started', 'success'),
            line(' ✔ Container project-web-1  Started', 'success'),
            line('project-db-1   | PostgreSQL Database directory appears to contain a database; Skipping initialization', 'muted'),
            line('project-db-1   | database system is ready to accept connections', 'success'),
            line('project-web-1  | INFO:     Uvicorn running on http://0.0.0.0:8000', 'success'),
          ]);
        }
        if (action === 'down') {
          return ok([
            line('[+] Running 2/2', 'default'),
            line(' ✔ Container project-web-1  Removed', 'success'),
            line(' ✔ Container project-db-1   Removed', 'success'),
            line(' ✔ Network project_default  Removed', 'success'),
          ]);
        }
      }
      if (sub === 'ps') {
        return ok([
          line('CONTAINER ID   IMAGE          COMMAND                  CREATED         STATUS         PORTS                    NAMES', 'muted'),
          line('a1b2c3d4e5f6   myapp:latest   "uvicorn main:app..."    2 minutes ago   Up 2 minutes   0.0.0.0:8000->8000/tcp   myapp_container', 'default'),
        ]);
      }
      return ok([
        line('Docker version 27.3.1, build ce12230', 'default'),
        line('Usage:  docker [OPTIONS] COMMAND', 'muted'),
      ]);
    }

    if (cmd === 'curl') {
      return ok([
        line('HTTP/1.1 200 OK', 'success'),
        line('content-type: application/json', 'muted'),
        line('{"status":"online","message":"Backend is healthy"}', 'default'),
      ]);
    }

    return fail([line(`bash: ${cmd}: command not found`, 'error')]);
  }

  return { execute, prompt };
}
