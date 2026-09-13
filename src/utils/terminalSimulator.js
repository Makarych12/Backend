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
    // Для Linux-модулей: системные пакеты (apt), службы (systemctl), пользователи (useradd).
    aptUpdated: false,
    aptInstalled: new Set(['bash', 'coreutils', 'curl', 'git', 'openssh-server', 'python3', 'sudo']),
    services: {
      nginx: { active: true, enabled: true, pid: 1187, desc: 'A high performance web server and a reverse proxy server' },
      postgresql: { active: true, enabled: true, pid: 912, desc: 'PostgreSQL RDBMS' },
      myapp: { active: false, enabled: false, pid: null, desc: 'FastAPI backend (uvicorn)' },
      ssh: { active: true, enabled: true, pid: 634, desc: 'OpenBSD Secure Shell server' },
    },
    users: new Set(['root', 'user']),
    nextPid: 4021, // PID для служб, запускаемых учеником — детерминированный, чтобы совпадал с journalctl/ss в уроках
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

  // ---------- Linux: apt / systemctl / journalctl / сеть / пользователи ----------
  // Всё ниже — честная имитация: реальную сеть и системных пользователей в браузере
  // трогать нельзя, поэтому показываем ТО, что вывела бы настоящая Ubuntu.

  const APT_PACKAGES = {
    nginx: '1.24.0-2ubuntu7', htop: '3.3.0-4', tree: '2.1.1-2', vim: '2:9.1.0016-1ubuntu7',
    'python3-pip': '24.0+dfsg-1ubuntu1', 'python3-venv': '3.12.3-0ubuntu2', postgresql: '16+257build1',
    'postgresql-contrib': '16+257build1', 'build-essential': '12.10ubuntu1', 'docker.io': '24.0.7-0ubuntu4',
    redis: '5:7.0.15-1ubuntu0.1', 'redis-server': '5:7.0.15-1ubuntu0.1', ufw: '0.36.2-6', fail2ban: '1.0.2-3ubuntu0.1',
    certbot: '2.9.0-1', wget: '1.21.4-1ubuntu4', unzip: '6.0-28ubuntu4',
    'net-tools': '2.10-0.1ubuntu4', git: '1:2.43.0-1ubuntu7', curl: '8.5.0-2ubuntu10', jq: '1.7.1-3build1',
  };

  function requireRoot(cmdLine, isSudo) {
    if (isSudo) return null;
    return fail([
      line(`E: Could not open lock file /var/lib/dpkg/lock-frontend - open (13: Permission denied)`, 'error'),
      line(`E: Unable to acquire the dpkg frontend lock (/var/lib/dpkg/lock-frontend), are you root?`, 'error'),
      line(`Подсказка: команда ${cmdLine} требует прав администратора — добавь sudo в начало`, 'muted'),
    ]);
  }

  function apt(args, isSudo) {
    const sub = args[0];
    if (sub === 'update') {
      const denied = requireRoot('apt update', isSudo);
      if (denied) return denied;
      state.aptUpdated = true;
      return ok([
        line('Hit:1 http://archive.ubuntu.com/ubuntu noble InRelease', 'default'),
        line('Get:2 http://archive.ubuntu.com/ubuntu noble-updates InRelease [126 kB]', 'default'),
        line('Get:3 http://security.ubuntu.com/ubuntu noble-security InRelease [126 kB]', 'default'),
        line('Fetched 252 kB in 1s (210 kB/s)', 'muted'),
        line('Reading package lists... Done', 'default'),
        line('Building dependency tree... Done', 'default'),
        line('3 packages can be upgraded. Run \'apt list --upgradable\' to see them.', 'success'),
      ]);
    }
    if (sub === 'upgrade') {
      const denied = requireRoot('apt upgrade', isSudo);
      if (denied) return denied;
      return ok([
        line('Reading package lists... Done', 'default'),
        line('Building dependency tree... Done', 'default'),
        line('Calculating upgrade... Done', 'default'),
        line('The following packages will be upgraded:', 'default'),
        line('  curl libcurl4 openssl', 'default'),
        line('3 upgraded, 0 newly installed, 0 to remove and 0 not upgraded.', 'default'),
        line('Setting up openssl (3.0.13-0ubuntu3.4) ...', 'muted'),
        line('Setting up curl (8.5.0-2ubuntu10.4) ...', 'muted'),
        line('Processing triggers for man-db (2.12.0-4build2) ...', 'muted'),
      ]);
    }
    if (sub === 'install') {
      const pkgs = args.slice(1).filter((a) => !a.startsWith('-'));
      if (pkgs.length === 0) return fail([line('E: Unable to locate package', 'error')]);
      const denied = requireRoot(`apt install ${pkgs.join(' ')}`, isSudo);
      if (denied) return denied;
      const lines = [line('Reading package lists... Done', 'default'), line('Building dependency tree... Done', 'default')];
      const fresh = [];
      for (const pkg of pkgs) {
        if (!APT_PACKAGES[pkg]) {
          return fail([...lines, line(`E: Unable to locate package ${pkg}`, 'error'), ...(state.aptUpdated ? [] : [line('Подсказка: сначала обнови список пакетов — sudo apt update', 'muted')])]);
        }
        if (state.aptInstalled.has(pkg)) lines.push(line(`${pkg} is already the newest version (${APT_PACKAGES[pkg]}).`, 'muted'));
        else fresh.push(pkg);
      }
      if (fresh.length === 0) {
        lines.push(line('0 upgraded, 0 newly installed, 0 to remove and 0 not upgraded.', 'default'));
        return ok(lines);
      }
      lines.push(line('The following NEW packages will be installed:', 'default'));
      lines.push(line(`  ${fresh.join(' ')}`, 'default'));
      lines.push(line(`0 upgraded, ${fresh.length} newly installed, 0 to remove and 0 not upgraded.`, 'default'));
      lines.push(line(`Need to get ${(fresh.length * 1.3).toFixed(1)} MB of archives.`, 'muted'));
      for (const pkg of fresh) {
        lines.push(line(`Get:1 http://archive.ubuntu.com/ubuntu noble/main amd64 ${pkg} amd64 ${APT_PACKAGES[pkg]} [1,312 kB]`, 'muted'));
      }
      for (const pkg of fresh) {
        lines.push(line(`Selecting previously unselected package ${pkg}.`, 'default'));
        lines.push(line(`Unpacking ${pkg} (${APT_PACKAGES[pkg]}) ...`, 'default'));
      }
      for (const pkg of fresh) {
        lines.push(line(`Setting up ${pkg} (${APT_PACKAGES[pkg]}) ...`, 'success'));
        state.aptInstalled.add(pkg);
        if (pkg === 'nginx' || pkg === 'postgresql' || pkg === 'redis-server' || pkg === 'docker.io') {
          const svc = pkg === 'redis-server' ? 'redis' : pkg === 'docker.io' ? 'docker' : pkg;
          state.services[svc] = state.services[svc] || { active: true, enabled: true, pid: state.nextPid++, desc: `${svc} service` };
        }
      }
      lines.push(line('Processing triggers for man-db (2.12.0-4build2) ...', 'muted'));
      return ok(lines);
    }
    if (sub === 'remove' || sub === 'purge') {
      const pkgs = args.slice(1).filter((a) => !a.startsWith('-'));
      const denied = requireRoot(`apt ${sub} ${pkgs.join(' ')}`, isSudo);
      if (denied) return denied;
      const lines = [line('Reading package lists... Done', 'default'), line('Building dependency tree... Done', 'default')];
      for (const pkg of pkgs) {
        if (!state.aptInstalled.has(pkg)) {
          lines.push(line(`Package '${pkg}' is not installed, so not removed`, 'muted'));
          continue;
        }
        state.aptInstalled.delete(pkg);
        lines.push(line(`Removing ${pkg} (${APT_PACKAGES[pkg] || '1.0'}) ...`, 'default'));
      }
      lines.push(line(`0 upgraded, 0 newly installed, ${pkgs.filter((p) => APT_PACKAGES[p]).length} to remove and 0 not upgraded.`, 'default'));
      return ok(lines);
    }
    if (sub === 'list') {
      if (args.includes('--installed')) {
        return ok([line('Listing... Done', 'muted'), ...Array.from(state.aptInstalled).sort().map((p) => line(`${p}/noble,now ${APT_PACKAGES[p] || '1.0'} amd64 [installed]`, 'default'))]);
      }
      if (args.includes('--upgradable')) {
        return ok([line('Listing... Done', 'muted'), line('curl/noble-updates 8.5.0-2ubuntu10.4 amd64 [upgradable from: 8.5.0-2ubuntu10]', 'default'), line('libcurl4/noble-updates 8.5.0-2ubuntu10.4 amd64 [upgradable from: 8.5.0-2ubuntu10]', 'default'), line('openssl/noble-updates 3.0.13-0ubuntu3.4 amd64 [upgradable from: 3.0.13-0ubuntu3]', 'default')]);
      }
      return ok([line('Listing... Done', 'muted'), ...Object.keys(APT_PACKAGES).sort().map((p) => line(`${p}/noble ${APT_PACKAGES[p]} amd64${state.aptInstalled.has(p) ? ' [installed]' : ''}`, 'default'))]);
    }
    if (sub === 'search') {
      const q = (args[1] || '').toLowerCase();
      const hits = Object.keys(APT_PACKAGES).filter((p) => p.includes(q));
      return ok([line('Sorting... Done', 'muted'), line('Full Text Search... Done', 'muted'), ...hits.map((p) => line(`${p}/noble ${APT_PACKAGES[p]} amd64\n  ${p} package`, 'default'))]);
    }
    if (sub === 'show') {
      const pkg = args[1];
      if (!APT_PACKAGES[pkg]) return fail([line(`N: Unable to locate package ${pkg || ''}`, 'error')]);
      return ok([line(`Package: ${pkg}`, 'default'), line(`Version: ${APT_PACKAGES[pkg]}`, 'default'), line('Priority: optional', 'muted'), line('Section: web', 'muted'), line(`Installed-Size: 1,812 kB`, 'muted'), line(`Description: ${pkg} package`, 'default')]);
    }
    if (sub === 'autoremove') {
      const denied = requireRoot('apt autoremove', isSudo);
      if (denied) return denied;
      return ok([line('Reading package lists... Done', 'default'), line('0 upgraded, 0 newly installed, 0 to remove and 0 not upgraded.', 'default')]);
    }
    return fail([line(`E: Invalid operation ${sub || ''}`, 'error')]);
  }

  function systemctl(args, isSudo) {
    const sub = args[0];
    const name = (args[1] || '').replace(/\.service$/, '');
    const svc = state.services[name];
    const notFound = () => fail([line(`Unit ${name || ''}.service could not be found.`, 'error')]);
    if (sub === 'status') {
      if (!name) {
        return ok([
          line('● backend', 'success'),
          line('    State: running', 'success'),
          line(`    Units: ${Object.keys(state.services).length + 118} loaded`, 'default'),
          line('     Jobs: 0 queued', 'default'),
          line('   Failed: 0 units', 'default'),
          line('    Since: Thu 2026-09-10 08:12:44 UTC; 3 days ago', 'muted'),
        ]);
      }
      if (!svc) return notFound();
      const status = svc.active ? 'active (running)' : svc.failed ? 'failed (Result: exit-code)' : 'inactive (dead)';
      const lines = [
        line(`● ${name}.service - ${svc.desc}`, svc.active ? 'success' : 'default'),
        line(`     Loaded: loaded (/etc/systemd/system/${name}.service; ${svc.enabled ? 'enabled' : 'disabled'}; preset: enabled)`, 'default'),
        line(`     Active: ${status}${svc.active ? ' since Sun 2026-09-13 09:58:02 UTC; 2min ago' : ''}`, svc.active ? 'success' : svc.failed ? 'error' : 'muted'),
      ];
      if (svc.active) {
        lines.push(line(`   Main PID: ${svc.pid} (${name === 'myapp' ? 'uvicorn' : name})`, 'default'));
        lines.push(line(`      Tasks: ${name === 'postgresql' ? 7 : 2} (limit: 4558)`, 'muted'));
        lines.push(line(`     Memory: ${name === 'postgresql' ? '58.4M' : name === 'myapp' ? '41.2M' : '3.7M'}`, 'muted'));
        lines.push(line(`        CPU: 412ms`, 'muted'));
        lines.push(line(`     CGroup: /system.slice/${name}.service`, 'muted'));
        lines.push(line(`             └─${svc.pid} ${name === 'myapp' ? '/opt/myapp/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000' : `/usr/sbin/${name}`}`, 'muted'));
        lines.push(line('', 'default'));
        lines.push(line(`Sep 13 09:58:02 backend systemd[1]: Started ${name}.service - ${svc.desc}.`, 'muted'));
        if (name === 'myapp') lines.push(line('Sep 13 09:58:03 backend uvicorn[' + svc.pid + ']: INFO:     Application startup complete.', 'muted'));
      } else if (svc.failed) {
        lines.push(line(`    Process: ${svc.pid || 4021} ExecStart=/opt/myapp/venv/bin/uvicorn main:app (code=exited, status=1/FAILURE)`, 'error'));
        lines.push(line('', 'default'));
        lines.push(line(`Sep 13 09:58:02 backend systemd[1]: ${name}.service: Main process exited, code=exited, status=1/FAILURE`, 'error'));
        lines.push(line(`Sep 13 09:58:02 backend systemd[1]: ${name}.service: Failed with result 'exit-code'.`, 'error'));
      }
      return svc.active ? ok(lines) : fail(lines);
    }
    if (['start', 'stop', 'restart', 'reload', 'enable', 'disable'].includes(sub)) {
      if (!name) return fail([line(`Too few arguments.`, 'error')]);
      if (!svc) return notFound();
      if (!isSudo) {
        return fail([
          line(`Failed to ${sub} ${name}.service: Access denied`, 'error'),
          line(`See system logs and 'systemctl status ${name}.service' for details.`, 'muted'),
          line(`Подсказка: управлять службами может только администратор — добавь sudo`, 'muted'),
        ]);
      }
      if (sub === 'start' || sub === 'restart' || sub === 'reload') {
        svc.active = true;
        svc.failed = false;
        svc.pid = svc.pid || state.nextPid++;
        return ok([]);
      }
      if (sub === 'stop') {
        svc.active = false;
        return ok([]);
      }
      if (sub === 'enable') {
        svc.enabled = true;
        const now = args.includes('--now');
        if (now) svc.active = true;
        return ok([line(`Created symlink /etc/systemd/system/multi-user.target.wants/${name}.service → /etc/systemd/system/${name}.service.`, 'default')]);
      }
      svc.enabled = false;
      return ok([line(`Removed "/etc/systemd/system/multi-user.target.wants/${name}.service".`, 'default')]);
    }
    if (sub === 'is-active') {
      if (!svc) return fail([line('inactive', 'error')]);
      return svc.active ? ok([line('active', 'success')]) : fail([line('inactive', 'error')]);
    }
    if (sub === 'is-enabled') {
      if (!svc) return notFound();
      return svc.enabled ? ok([line('enabled', 'success')]) : fail([line('disabled', 'muted')]);
    }
    if (sub === 'daemon-reload') {
      if (!isSudo) return fail([line('Failed to reload daemon: Access denied', 'error'), line('Подсказка: добавь sudo', 'muted')]);
      return ok([]);
    }
    if (sub === 'list-units' || sub === undefined) {
      const lines = [line('  UNIT                    LOAD   ACTIVE   SUB     DESCRIPTION', 'muted')];
      for (const [n, s] of Object.entries(state.services)) {
        lines.push(line(`${s.active ? '●' : ' '} ${(n + '.service').padEnd(23)} loaded ${(s.active ? 'active' : 'inactive').padEnd(8)} ${(s.active ? 'running' : 'dead').padEnd(7)} ${s.desc}`, s.active ? 'success' : 'default'));
      }
      lines.push(line('', 'default'));
      lines.push(line(`${Object.keys(state.services).length} loaded units listed.`, 'muted'));
      return ok(lines);
    }
    return fail([line(`Unknown command verb ${sub}.`, 'error')]);
  }

  function journalctl(args) {
    const unitIdx = args.indexOf('-u');
    const name = unitIdx !== -1 ? (args[unitIdx + 1] || '').replace(/\.service$/, '') : null;
    const follow = args.includes('-f');
    const svc = name ? state.services[name] : null;
    if (name && !svc) return ok([line('-- No entries --', 'muted')]);
    const lines = [];
    if (!name) {
      lines.push(line('Sep 13 09:57:41 backend systemd[1]: Starting nginx.service - A high performance web server...', 'muted'));
      lines.push(line('Sep 13 09:57:41 backend systemd[1]: Started nginx.service.', 'default'));
      lines.push(line('Sep 13 09:57:58 backend sshd[634]: Accepted publickey for user from 203.0.113.7 port 51234 ssh2', 'default'));
    }
    if (!name || name === 'myapp') {
      if (svc?.failed || (!svc?.active && name === 'myapp')) {
        lines.push(line('Sep 13 09:58:01 backend systemd[1]: Started myapp.service - FastAPI backend (uvicorn).', 'default'));
        lines.push(line('Sep 13 09:58:02 backend uvicorn[4021]: Traceback (most recent call last):', 'error'));
        lines.push(line('Sep 13 09:58:02 backend uvicorn[4021]:   File "/opt/myapp/main.py", line 3, in <module>', 'error'));
        lines.push(line('Sep 13 09:58:02 backend uvicorn[4021]:     DATABASE_URL = os.environ["DATABASE_URL"]', 'error'));
        lines.push(line("Sep 13 09:58:02 backend uvicorn[4021]: KeyError: 'DATABASE_URL'", 'error'));
        lines.push(line('Sep 13 09:58:02 backend systemd[1]: myapp.service: Main process exited, code=exited, status=1/FAILURE', 'error'));
        lines.push(line("Sep 13 09:58:02 backend systemd[1]: myapp.service: Failed with result 'exit-code'.", 'error'));
      } else {
        lines.push(line('Sep 13 09:58:02 backend systemd[1]: Started myapp.service - FastAPI backend (uvicorn).', 'default'));
        lines.push(line('Sep 13 09:58:03 backend uvicorn[' + (svc?.pid || 4021) + ']: INFO:     Started server process [' + (svc?.pid || 4021) + ']', 'default'));
        lines.push(line('Sep 13 09:58:03 backend uvicorn[' + (svc?.pid || 4021) + ']: INFO:     Application startup complete.', 'success'));
        lines.push(line('Sep 13 09:58:03 backend uvicorn[' + (svc?.pid || 4021) + ']: INFO:     Uvicorn running on http://0.0.0.0:8000', 'success'));
        lines.push(line('Sep 13 09:59:10 backend uvicorn[' + (svc?.pid || 4021) + ']: INFO:     203.0.113.7:51302 - "GET /health HTTP/1.1" 200 OK', 'default'));
      }
    } else if (name === 'nginx') {
      lines.push(line('Sep 13 09:57:41 backend systemd[1]: Starting nginx.service - A high performance web server and a reverse proxy server...', 'muted'));
      lines.push(line('Sep 13 09:57:41 backend systemd[1]: Started nginx.service.', 'success'));
    } else if (name === 'postgresql') {
      lines.push(line('Sep 13 09:57:39 backend systemd[1]: Starting postgresql.service - PostgreSQL RDBMS...', 'muted'));
      lines.push(line('Sep 13 09:57:40 backend postgres[912]: LOG:  database system is ready to accept connections', 'success'));
    } else {
      lines.push(line(`Sep 13 09:57:41 backend systemd[1]: Started ${name}.service - ${svc.desc}.`, 'default'));
    }
    if (follow) lines.push(line('(журнал открыт в режиме -f: новые строки появлялись бы здесь по мере работы службы; выход — Ctrl+C)', 'muted'));
    return ok(lines);
  }

  function curl(args) {
    const url = args.find((a) => !a.startsWith('-') && (a.includes('://') || a.includes('.') || a.startsWith('localhost')));
    const headersOnly = args.includes('-I');
    const verbose = args.includes('-i') || headersOnly;
    if (!url) return fail([line("curl: try 'curl --help' for more information", 'error')]);
    const target = url.replace(/^https?:\/\//, '');
    const lines = [];
    if (target.startsWith('localhost') || target.startsWith('127.0.0.1') || target.startsWith('0.0.0.0')) {
      const port = /:(\d+)/.exec(target)?.[1] || '80';
      const myappUp = state.services.myapp?.active;
      if (port === '8000' && !myappUp) {
        return fail([line(`curl: (7) Failed to connect to localhost port 8000 after 0 ms: Couldn't connect to server`, 'error'), line('Подсказка: на порту 8000 никто не слушает — служба myapp остановлена (systemctl status myapp)', 'muted')]);
      }
      if (port === '80' && !state.services.nginx?.active) {
        return fail([line(`curl: (7) Failed to connect to localhost port 80 after 0 ms: Couldn't connect to server`, 'error')]);
      }
      if (verbose) {
        lines.push(line('HTTP/1.1 200 OK', 'success'));
        lines.push(line(port === '80' ? 'Server: nginx/1.24.0 (Ubuntu)' : 'server: uvicorn', 'muted'));
        lines.push(line('content-type: application/json', 'muted'));
        lines.push(line('', 'default'));
      }
      if (!headersOnly) lines.push(line(port === '80' ? '<!DOCTYPE html><html><head><title>Welcome to nginx!</title></head>...' : '{"status":"ok","message":"Backend is healthy"}', 'default'));
      return ok(lines);
    }
    if (target.includes('example.com') || target.includes('api.github.com') || target.includes('httpbin') || target.includes('google')) {
      if (verbose) {
        lines.push(line('HTTP/2 200', 'success'));
        lines.push(line('content-type: ' + (target.includes('github') || target.includes('httpbin') ? 'application/json; charset=utf-8' : 'text/html; charset=UTF-8'), 'muted'));
        lines.push(line('', 'default'));
      }
      if (!headersOnly) {
        if (target.includes('api.github.com')) lines.push(line('{"login":"octocat","id":583231,"public_repos":8,"followers":15000}', 'default'));
        else if (target.includes('httpbin')) lines.push(line('{"origin": "203.0.113.7", "url": "https://httpbin.org/get"}', 'default'));
        else lines.push(line('<!doctype html><html><head><title>Example Domain</title></head><body><h1>Example Domain</h1></body></html>', 'default'));
      }
      return ok(lines);
    }
    return fail([line(`curl: (6) Could not resolve host: ${target.split('/')[0]}`, 'error')]);
  }

  function ping(args) {
    const countIdx = args.indexOf('-c');
    const host = args.find((a, i) => !a.startsWith('-') && (countIdx === -1 || i !== countIdx + 1));
    const count = countIdx !== -1 ? Math.min(Number(args[countIdx + 1]) || 4, 10) : 4;
    if (!host) return fail([line('ping: usage error: Destination address required', 'error')]);
    const known = { 'google.com': '142.250.74.14', '8.8.8.8': '8.8.8.8', 'example.com': '93.184.215.14', localhost: '127.0.0.1', '127.0.0.1': '127.0.0.1', 'github.com': '140.82.121.4', 'ya.ru': '77.88.55.242' };
    const ip = known[host];
    if (!ip) return fail([line(`ping: ${host}: Name or service not known`, 'error')]);
    const lines = [line(`PING ${host} (${ip}) 56(84) bytes of data.`, 'default')];
    const base = ip === '127.0.0.1' ? 0.04 : 14.2;
    const times = [];
    for (let i = 1; i <= count; i++) {
      const t = (base + (i * 7919) % 13 / 10).toFixed(ip === '127.0.0.1' ? 3 : 1);
      times.push(Number(t));
      lines.push(line(`64 bytes from ${ip}${host !== ip ? ` (${ip})` : ''}: icmp_seq=${i} ttl=${ip === '127.0.0.1' ? 64 : 116} time=${t} ms`, 'default'));
    }
    lines.push(line('', 'default'));
    lines.push(line(`--- ${host} ping statistics ---`, 'default'));
    lines.push(line(`${count} packets transmitted, ${count} received, 0% packet loss, time ${(count - 1) * 1001}ms`, 'success'));
    lines.push(line(`rtt min/avg/max/mdev = ${Math.min(...times)}/${(times.reduce((a, b) => a + b, 0) / count).toFixed(3)}/${Math.max(...times)}/0.412 ms`, 'muted'));
    if (countIdx === -1) lines.push(line('(в настоящем терминале ping шёл бы бесконечно — остановить его можно клавишами Ctrl+C; здесь показаны первые 4 ответа)', 'muted'));
    return ok(lines);
  }

  function ip(args) {
    const sub = args[0];
    if (sub === 'a' || sub === 'addr' || sub === 'address') {
      return ok([
        line('1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000', 'default'),
        line('    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00', 'muted'),
        line('    inet 127.0.0.1/8 scope host lo', 'success'),
        line('       valid_lft forever preferred_lft forever', 'muted'),
        line('2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000', 'default'),
        line('    link/ether 02:42:ac:11:00:02 brd ff:ff:ff:ff:ff:ff', 'muted'),
        line('    inet 203.0.113.42/24 brd 203.0.113.255 scope global eth0', 'success'),
        line('       valid_lft forever preferred_lft forever', 'muted'),
      ]);
    }
    if (sub === 'r' || sub === 'route') {
      return ok([line('default via 203.0.113.1 dev eth0 proto static', 'default'), line('203.0.113.0/24 dev eth0 proto kernel scope link src 203.0.113.42', 'default')]);
    }
    if (sub === 'link') {
      return ok([line('1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 state UNKNOWN', 'default'), line('2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 state UP', 'default')]);
    }
    return fail([line(`Object "${sub || ''}" is unknown, try "ip help".`, 'error')]);
  }

  function useradd(args, isSudo, cmdName) {
    const name = args.filter((a) => !a.startsWith('-')).pop();
    if (!name) return fail([line(`Usage: ${cmdName} [options] LOGIN`, 'error')]);
    if (!isSudo) return fail([line(`${cmdName}: Permission denied.`, 'error'), line(`${cmdName}: cannot lock /etc/passwd; try again later.`, 'error'), line('Подсказка: создавать пользователей может только администратор — добавь sudo', 'muted')]);
    if (state.users.has(name)) return fail([line(`${cmdName}: user '${name}' already exists`, 'error')]);
    state.users.add(name);
    if (cmdName === 'adduser') {
      return ok([
        line(`Adding user \`${name}' ...`, 'default'),
        line(`Adding new group \`${name}' (1001) ...`, 'default'),
        line(`Adding new user \`${name}' (1001) with group \`${name}' ...`, 'default'),
        line(`Creating home directory \`/home/${name}' ...`, 'default'),
        line(`Copying files from \`/etc/skel' ...`, 'muted'),
        line('New password: ********', 'muted'),
        line('Retype new password: ********', 'muted'),
        line('passwd: password updated successfully', 'success'),
      ]);
    }
    return ok([]);
  }

  function passwd(args, isSudo) {
    const name = args.find((a) => !a.startsWith('-')) || 'user';
    if (name !== 'user' && !isSudo) return fail([line(`passwd: You may not view or modify password information for ${name}.`, 'error')]);
    if (!state.users.has(name)) return fail([line(`passwd: user '${name}' does not exist`, 'error')]);
    return ok([
      ...(name === 'user' && !isSudo ? [line('Changing password for user.', 'default'), line('Current password: ********', 'muted')] : []),
      line('New password: ********', 'muted'),
      line('Retype new password: ********', 'muted'),
      line('passwd: password updated successfully', 'success'),
    ]);
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

    // sudo <команда> — просто выполняем ту же команду "от имени администратора"
    if (cmd === 'sudo') {
      if (args.length === 0) return fail([line('usage: sudo -h | -K | -k | -V', 'error'), line('usage: sudo [-u user] command', 'error')]);
      return executeLinux(args[0], args.slice(1), true);
    }
    return executeLinux(cmd, args, false);
  }

  function executeLinux(cmd, args, isSudo) {
    if (cmd === 'apt' || cmd === 'apt-get') return apt(args, isSudo);
    if (cmd === 'dnf' || cmd === 'yum') {
      return fail([line(`bash: ${cmd}: command not found`, 'error'), line('Это Ubuntu/Debian — здесь пакетный менеджер называется apt (dnf/yum живут в Fedora/RHEL)', 'muted')]);
    }
    if (cmd === 'systemctl') return systemctl(args, isSudo);
    if (cmd === 'service') {
      const [name, action] = args;
      return systemctl([action, name], isSudo);
    }
    if (cmd === 'journalctl') return journalctl(args);
    if (cmd === 'curl') return curl(args);
    if (cmd === 'wget') {
      const url = args.find((a) => !a.startsWith('-'));
      if (!url) return fail([line('wget: missing URL', 'error')]);
      const file = url.split('/').filter(Boolean).pop() || 'index.html';
      return ok([line(`--2026-09-13 10:00:00--  ${url}`, 'muted'), line('HTTP request sent, awaiting response... 200 OK', 'default'), line(`Saving to: '${file}'`, 'default'), line(`'${file}' saved [1256/1256]`, 'success')]);
    }
    if (cmd === 'ping') return ping(args);
    if (cmd === 'ip') return ip(args);
    if (cmd === 'ifconfig') return fail([line('bash: ifconfig: command not found', 'error'), line('ifconfig устарел — в современном Linux вместо него используют ip a', 'muted')]);
    if (cmd === 'ss' || cmd === 'netstat') {
      const lines = [line('Netid State  Recv-Q Send-Q Local Address:Port  Peer Address:Port Process', 'muted')];
      if (state.services.ssh?.active) lines.push(line('tcp   LISTEN 0      128          0.0.0.0:22         0.0.0.0:*     users:(("sshd",pid=634,fd=3))', 'default'));
      if (state.services.nginx?.active) lines.push(line('tcp   LISTEN 0      511          0.0.0.0:80         0.0.0.0:*     users:(("nginx",pid=1187,fd=6))', 'default'));
      if (state.services.postgresql?.active) lines.push(line('tcp   LISTEN 0      244        127.0.0.1:5432       0.0.0.0:*     users:(("postgres",pid=912,fd=5))', 'default'));
      if (state.services.myapp?.active) lines.push(line(`tcp   LISTEN 0      2048         0.0.0.0:8000       0.0.0.0:*     users:(("uvicorn",pid=${state.services.myapp.pid},fd=7))`, 'success'));
      return ok(lines);
    }
    if (cmd === 'hostname') return ok([line(args.includes('-I') ? '203.0.113.42' : 'backend', 'default')]);
    if (cmd === 'useradd' || cmd === 'adduser') return useradd(args, isSudo, cmd);
    if (cmd === 'userdel' || cmd === 'deluser') {
      const name = args.filter((a) => !a.startsWith('-')).pop();
      if (!isSudo) return fail([line(`${cmd}: Permission denied.`, 'error')]);
      if (!name || !state.users.has(name)) return fail([line(`${cmd}: user '${name || ''}' does not exist`, 'error')]);
      if (name === 'root') return fail([line(`${cmd}: user root cannot be deleted`, 'error')]);
      state.users.delete(name);
      return ok([]);
    }
    if (cmd === 'passwd') return passwd(args, isSudo);
    if (cmd === 'usermod') {
      const name = args.filter((a) => !a.startsWith('-')).pop();
      if (!isSudo) return fail([line('usermod: Permission denied.', 'error'), line('usermod: cannot lock /etc/passwd; try again later.', 'error')]);
      if (!name || !state.users.has(name)) return fail([line(`usermod: user '${name || ''}' does not exist`, 'error')]);
      return ok([]);
    }
    if (cmd === 'whoami') return ok([line(isSudo ? 'root' : 'user', 'default')]);
    if (cmd === 'id') return ok([line(isSudo ? 'uid=0(root) gid=0(root) groups=0(root)' : 'uid=1000(user) gid=1000(user) groups=1000(user),27(sudo)', 'default')]);
    if (cmd === 'uname') return ok([line(args.includes('-a') ? 'Linux backend 6.8.0-45-generic #45-Ubuntu SMP PREEMPT_DYNAMIC x86_64 GNU/Linux' : 'Linux', 'default')]);
    if (cmd === 'cat' && args[0] === '/etc/os-release') {
      return ok([line('PRETTY_NAME="Ubuntu 24.04.1 LTS"', 'default'), line('NAME="Ubuntu"', 'default'), line('VERSION_ID="24.04"', 'default'), line('ID=ubuntu', 'default'), line('ID_LIKE=debian', 'default')]);
    }
    if (cmd === 'reboot' || cmd === 'shutdown') {
      if (!isSudo) return fail([line(`Failed to ${cmd === 'reboot' ? 'reboot' : 'power off'} system via logind: Access denied`, 'error')]);
      return ok([line('(в учебном терминале сервер, конечно, не перезагружается — но в реальности именно так это и делается)', 'muted')]);
    }
    if (cmd === 'df') return ok([line('Filesystem      Size  Used Avail Use% Mounted on', 'muted'), line('/dev/vda1        40G   12G   27G  31% /', 'default'), line('tmpfs           2.0G     0  2.0G   0% /dev/shm', 'default')]);
    if (cmd === 'free') return ok([line('               total        used        free      shared  buff/cache   available', 'muted'), line(args.includes('-h') ? 'Mem:           3.8Gi       1.1Gi       1.9Gi        12Mi       812Mi       2.5Gi' : 'Mem:         4030412     1153204     1992320       12288      884888     2621644', 'default'), line(args.includes('-h') ? 'Swap:          2.0Gi          0B       2.0Gi' : 'Swap:        2097148           0     2097148', 'default')]);
    if (cmd === 'uptime') return ok([line(' 10:00:00 up 3 days,  1:47,  1 user,  load average: 0.12, 0.31, 0.28', 'default')]);
    if (cmd === 'ufw') {
      if (!isSudo) return fail([line('ERROR: You need to be root to run this script', 'error')]);
      const sub = args[0];
      if (sub === 'status') return ok([line('Status: active', 'success'), line('', 'default'), line('To                         Action      From', 'muted'), line('--                         ------      ----', 'muted'), line('22/tcp                     ALLOW       Anywhere', 'default'), line('80/tcp                     ALLOW       Anywhere', 'default'), line('443/tcp                    ALLOW       Anywhere', 'default')]);
      if (sub === 'allow' || sub === 'deny') return ok([line('Rule added', 'success'), line('Rule added (v6)', 'success')]);
      if (sub === 'enable') return ok([line('Firewall is active and enabled on system startup', 'success')]);
      return fail([line(`ERROR: Invalid syntax`, 'error')]);
    }
    if (cmd === 'ssh') {
      const target = args.find((a) => !a.startsWith('-'));
      if (!target) return fail([line('usage: ssh [-46AaCfGgKkMNnqsTtVvXxYy] destination [command]', 'error')]);
      return ok([line(`Warning: Permanently added '${target.split('@').pop()}' (ED25519) to the list of known hosts.`, 'muted'), line('Welcome to Ubuntu 24.04.1 LTS (GNU/Linux 6.8.0-45-generic x86_64)', 'default'), line('Last login: Sun Sep 13 09:41:12 2026 from 203.0.113.7', 'muted'), line('(в учебном терминале ты остаёшься на той же машине — по-настоящему здесь открылась бы сессия на удалённом сервере)', 'muted')]);
    }
    if (cmd === 'scp') return ok([line(`${(args.find((a) => !a.startsWith('-')) || 'file').split('/').pop().padEnd(30)} 100%  1256   1.2KB/s   00:00`, 'success')]);

    return fail([line(`bash: ${cmd}: command not found`, 'error')]);
  }

  return { execute, prompt };
}
