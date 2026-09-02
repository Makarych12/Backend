import { useState, useRef } from 'react';
import { evaluateSystemDesignArchitecture, getCustomApiKey, setCustomApiKey } from '../utils/aiService';

const BLOCK_TYPES = [
  { type: 'client', label: 'Клиент (Web/App)', icon: '💻', color: '#3b82f6', desc: 'Браузер или смартфон пользователя' },
  { type: 'lb', label: 'Load Balancer (Nginx)', icon: '⚖️', color: '#06b6d4', desc: 'Балансировка трафика и SSL' },
  { type: 'api', label: 'FastAPI Backend', icon: '⚡', color: '#10b981', desc: 'Сервер бизнес-логики и роутинга' },
  { type: 'db', label: 'PostgreSQL Database', icon: '🗄️', color: '#8b5cf6', desc: 'Основная база данных (ACID)' },
  { type: 'cache', label: 'Redis Cache', icon: '🚀', color: '#ef4444', desc: 'Кэш в RAM и Rate Limiting' },
  { type: 'queue', label: 'Celery + Redis Queue', icon: '📬', color: '#f59e0b', desc: 'Очередь тяжелых фоновых задач' },
  { type: 'storage', label: 'S3 / Cloud Storage', icon: '☁️', color: '#64748b', desc: 'Хранение картинок и файлов' },
];

const TASKS = [
  {
    id: 'ecommerce',
    title: '1. Интернет-магазин под нагрузкой (Black Friday)',
    requirements: 'Каталог смотрят 50 000 пользователей одновременно. Заказы должны сохраняться надежно, а чеки и email отправляться в фоне, не замедляя оформление.',
    recommendedBlocks: ['client', 'lb', 'api', 'db', 'cache', 'queue'],
    hint: 'Добавь Load Balancer перед API, Redis для кэша каталога и Celery для отправки email.',
  },
  {
    id: 'photos',
    title: '2. Сервис загрузки и шеринга фото (Instagram MVP)',
    requirements: 'Пользователи загружают фото до 10 МБ. Метаданные (лайки, авторы) хранятся в БД, а сами файлы — в масштабируемом облаке с кэшированием.',
    recommendedBlocks: ['client', 'lb', 'api', 'db', 'storage', 'cache'],
    hint: 'Файлы фото должны лететь в S3, а ссылки и профили пользователей — в PostgreSQL + Redis.',
  },
  {
    id: 'shortener',
    title: '3. Сервис коротких ссылок (TinyURL / Bitly)',
    requirements: 'Миллионы редиректов в сутки. Время ответа p99 < 5 миллисекунд. Аналитика переходов пишется асинхронно.',
    recommendedBlocks: ['client', 'lb', 'api', 'cache', 'db', 'queue'],
    hint: 'Кэшируй популярные ссылки в Redis, чтобы 95% запросов даже не касались PostgreSQL.',
  },
];

export default function SystemDesign() {
  const [activeTaskId, setActiveTaskId] = useState('ecommerce');
  const [nodes, setNodes] = useState([
    { id: 'node_1_client', type: 'client', label: 'Клиент (Web/App)', x: 20, y: 140 },
    { id: 'node_2_lb', type: 'lb', label: 'Load Balancer (Nginx)', x: 190, y: 140 },
    { id: 'node_3_api', type: 'api', label: 'FastAPI Backend', x: 360, y: 140 },
    { id: 'node_4_db', type: 'db', label: 'PostgreSQL Database', x: 530, y: 60 },
    { id: 'node_5_cache', type: 'cache', label: 'Redis Cache', x: 530, y: 220 },
  ]);
  const [connections, setConnections] = useState([
    { id: 'c1', from: 'node_1_client', to: 'node_2_lb', protocol: 'HTTPS' },
    { id: 'c2', from: 'node_2_lb', to: 'node_3_api', protocol: 'HTTP' },
    { id: 'c3', from: 'node_3_api', to: 'node_4_db', protocol: 'SQL' },
    { id: 'c4', from: 'node_3_api', to: 'node_5_cache', protocol: 'Redis TCP' },
  ]);

  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [connectMode, setConnectMode] = useState(false);
  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // AI Review state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState(null);
  const [aiError, setAiError] = useState('');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [customKeyInput, setCustomKeyInput] = useState(getCustomApiKey());

  const canvasRef = useRef(null);

  const activeTask = TASKS.find((t) => t.id === activeTaskId) || TASKS[0];

  // Добавление блока на холст
  const addBlockToCanvas = (blockType) => {
    const blockMeta = BLOCK_TYPES.find((b) => b.type === blockType);
    setNodes((prev) => {
      const newId = `node_${prev.length + 1}_${blockType}`;
      const offset = (prev.length * 20) % 120;
      const newNode = {
        id: newId,
        type: blockType,
        label: blockMeta.label,
        x: 100 + offset,
        y: 80 + offset,
      };
      return [...prev, newNode];
    });
  };

  // Удаление блока
  const deleteNode = (nodeId) => {
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setConnections((prev) => prev.filter((c) => c.from !== nodeId && c.to !== nodeId));
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
  };

  // Удаление соединения
  const deleteConnection = (connId) => {
    setConnections((prev) => prev.filter((c) => c.id !== connId));
  };

  // Клик / Тап по блоку
  const handleNodeSelect = (nodeId) => {
    if (connectMode && selectedNodeId && selectedNodeId !== nodeId) {
      // Соединяем два блока
      const sourceId = selectedNodeId;
      setConnections((prev) => {
        const exists = prev.some(
          (c) => (c.from === sourceId && c.to === nodeId) || (c.from === nodeId && c.to === sourceId)
        );
        if (exists) return prev;
        const newConn = {
          id: `conn_${prev.length + 1}_${sourceId}_${nodeId}`,
          from: sourceId,
          to: nodeId,
          protocol: 'TCP/HTTP',
        };
        return [...prev, newConn];
      });
      setConnectMode(false);
      setSelectedNodeId(null);
    } else {
      setSelectedNodeId((prev) => (prev === nodeId ? null : nodeId));
      setConnectMode(false);
    }
  };

  // Клик / Тап по холсту для перемещения выбранного блока
  const handleCanvasClick = (e) => {
    if (!selectedNodeId || !canvasRef.current || connectMode) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const clickX = e.clientX - canvasRect.left - 70;
    const clickY = e.clientY - canvasRect.top - 30;

    const clampedX = Math.max(10, Math.min(canvasRect.width - 150, clickX));
    const clampedY = Math.max(10, Math.min(canvasRect.height - 70, clickY));

    setNodes((prev) =>
      prev.map((n) => (n.id === selectedNodeId ? { ...n, x: clampedX, y: clampedY } : n))
    );
  };

  // Drag-and-Drop (Мышь + Touch)
  const startDrag = (clientX, clientY, node) => {
    setDraggingNodeId(node.id);
    if (!canvasRef.current) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    setDragOffset({
      x: clientX - canvasRect.left - node.x,
      y: clientY - canvasRect.top - node.y,
    });
  };

  const moveDrag = (clientX, clientY) => {
    if (!draggingNodeId || !canvasRef.current) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const newX = Math.max(10, Math.min(canvasRect.width - 150, clientX - canvasRect.left - dragOffset.x));
    const newY = Math.max(10, Math.min(canvasRect.height - 70, clientY - canvasRect.top - dragOffset.y));

    setNodes((prev) =>
      prev.map((n) => (n.id === draggingNodeId ? { ...n, x: newX, y: newY } : n))
    );
  };

  const endDrag = () => {
    setDraggingNodeId(null);
  };

  // Mouse handlers
  const handleMouseDown = (e, node) => {
    e.stopPropagation();
    startDrag(e.clientX, e.clientY, node);
  };

  const handleMouseMove = (e) => {
    moveDrag(e.clientX, e.clientY);
  };

  // Touch handlers
  const handleTouchStart = (e, node) => {
    e.stopPropagation();
    if (e.touches && e.touches[0]) {
      startDrag(e.touches[0].clientX, e.touches[0].clientY, node);
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches && e.touches[0]) {
      moveDrag(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  // AI Оценка архитектуры
  const handleEvaluateAi = async () => {
    setAiLoading(true);
    setAiFeedback(null);
    setAiError('');

    const formattedConns = connections.map((c) => {
      const fromNode = nodes.find((n) => n.id === c.from);
      const toNode = nodes.find((n) => n.id === c.to);
      return {
        fromLabel: fromNode ? fromNode.label : c.from,
        toLabel: toNode ? toNode.label : c.to,
        protocol: c.protocol,
      };
    });

    const res = await evaluateSystemDesignArchitecture({
      taskTitle: activeTask.title,
      taskRequirements: activeTask.requirements,
      nodes,
      connections: formattedConns,
    });

    if (res.ok) {
      setAiFeedback(res.message);
    } else if (res.code === 'NO_API_KEY') {
      // Офлайн эвристическая оценка
      const hasDb = nodes.some((n) => n.type === 'db');
      const hasApi = nodes.some((n) => n.type === 'api');
      const hasCache = nodes.some((n) => n.type === 'cache');
      const hasLb = nodes.some((n) => n.type === 'lb');

      let offlineReview = `### 📋 Локальный архитектурный аудит:\n\n`;
      offlineReview += `**1. Базовые компоненты:**\n`;
      offlineReview += hasApi ? `✔ FastAPI сервер присутствует.\n` : `❌ Не хватает Backend API сервера!\n`;
      offlineReview += hasDb ? `✔ PostgreSQL база данных подключена.\n` : `❌ Отсутствует персистентное хранилище (БД)!\n`;
      offlineReview += hasCache ? `✔ Redis кэш добавлен — отличная защита от перегрузки.\n` : `⚠️ Рекомендуется добавить Redis кэш для снижения RPS к БД.\n`;
      offlineReview += hasLb ? `✔ Load Balancer распределяет трафик.\n` : `💡 Добавь Nginx / Load Balancer для отказоустойчивости.\n\n`;
      offlineReview += `*Подключи OpenRouter API ключ в настройках для развёрнутого AI-анализа масштабируемости и узких мест.*`;

      setAiFeedback(offlineReview);
    } else {
      setAiError(res.error || 'Ошибка связи с AI');
    }
    setAiLoading(false);
  };

  const handleSaveKey = (e) => {
    e.preventDefault();
    setCustomApiKey(customKeyInput);
    setShowKeyModal(false);
  };

  return (
    <div className="mx-auto max-w-6xl animate-fade-in px-3 py-6 sm:px-6 sm:py-10">
      {/* Заголовок */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-3xl">🏗️</span>
            <h1 className="text-xl font-bold sm:text-3xl" style={{ color: 'var(--text-primary)' }}>
              System Design Sandbox
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
            Интерактивный конструктор архитектуры систем: проектируй сервисы, соединяй блоки и оценивай с AI.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowKeyModal(true)}
            className="min-h-[38px] rounded-xl border px-3 py-1.5 text-xs font-medium transition hover:bg-[var(--bg-hover)]"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
          >
            ⚙️ API-ключ
          </button>
          <button
            onClick={handleEvaluateAi}
            disabled={aiLoading || nodes.length === 0}
            className="min-h-[38px] flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-lg transition hover:brightness-110 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' }}
          >
            <span>🤖</span>
            <span>{aiLoading ? 'Оцениваем...' : 'Оценить с AI'}</span>
          </button>
        </div>
      </div>

      {/* Выбор задачи */}
      <div className="mb-6 rounded-2xl border p-3.5 sm:p-4" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
        <div className="mb-3 flex flex-wrap gap-2">
          {TASKS.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setActiveTaskId(t.id);
                setAiFeedback(null);
              }}
              className="min-h-[36px] rounded-xl px-3 py-1.5 text-xs font-semibold transition"
              style={{
                background: activeTaskId === t.id ? 'var(--accent)' : 'var(--bg)',
                color: activeTaskId === t.id ? '#ffffff' : 'var(--text-secondary)',
                border: `1px solid ${activeTaskId === t.id ? 'transparent' : 'var(--border)'}`,
              }}
            >
              {t.title}
            </button>
          ))}
        </div>

        <div className="rounded-xl p-3 text-xs leading-relaxed" style={{ background: 'var(--bg)', color: 'var(--text-secondary)' }}>
          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            🎯 Технические требования: {activeTask.requirements}
          </p>
          <p className="mt-1 italic" style={{ color: 'var(--text-muted)' }}>
            💡 Подсказка: {activeTask.hint}
          </p>
        </div>
      </div>

      {/* Панель управления действиями выбранного блока */}
      {selectedNodeId && (
        <div
          className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border p-3 animate-fade-in text-xs"
          style={{ background: 'color-mix(in srgb, var(--accent) 12%, var(--bg-secondary))', borderColor: 'var(--accent)' }}
        >
          <div className="flex items-center gap-2">
            <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
              Выбран: {nodes.find((n) => n.id === selectedNodeId)?.label}
            </span>
            <span className="hidden text-[11px] sm:inline" style={{ color: 'var(--text-muted)' }}>
              (Тапни на холст, чтобы переместить блок сюда)
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setConnectMode(true)}
              className="min-h-[32px] rounded-lg px-2.5 py-1 font-semibold text-white transition"
              style={{ background: connectMode ? '#f59e0b' : 'var(--accent)' }}
            >
              {connectMode ? '👉 Нажми на цель' : '🔗 Соединить стрелкой'}
            </button>
            <button
              onClick={() => deleteNode(selectedNodeId)}
              className="min-h-[32px] rounded-lg border border-red-500/40 bg-red-500/10 px-2.5 py-1 font-semibold text-red-500 transition"
            >
              ✕ Удалить
            </button>
            <button
              onClick={() => {
                setSelectedNodeId(null);
                setConnectMode(false);
              }}
              className="min-h-[32px] rounded-lg border px-2.5 py-1 font-medium transition"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
            >
              Снять выбор
            </button>
          </div>
        </div>
      )}

      {/* Основная рабочая область: Палитра слева + Холст справа */}
      <div className="grid gap-4 lg:grid-cols-4">
        {/* Палитра блоков */}
        <div className="space-y-2 rounded-2xl border p-3.5 sm:p-4 lg:col-span-1" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
          <h2 className="mb-2 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Палитра блоков:
          </h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1">
            {BLOCK_TYPES.map((block) => (
              <button
                key={block.type}
                onClick={() => addBlockToCanvas(block.type)}
                className="min-h-[44px] flex items-center gap-2 rounded-xl border p-2 text-left text-xs font-medium transition hover:scale-[1.02] hover:shadow-md"
                style={{
                  background: 'var(--bg)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              >
                <span className="text-lg sm:text-xl">{block.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-[11px] sm:text-xs">{block.label}</p>
                  <p className="truncate text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    + Добавить
                  </p>
                </div>
              </button>
            ))}
          </div>

          <div className="pt-3 border-t text-[11px] leading-relaxed hidden sm:block" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
            ℹ️ <strong>Управление:</strong> Перетаскивай мышью или пальцем. Либо нажми на блок и тапни на холст для перемещения.
          </div>
        </div>

        {/* Интерактивный холст (Canvas) */}
        <div
          ref={canvasRef}
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseUp={endDrag}
          onTouchMove={handleTouchMove}
          onTouchEnd={endDrag}
          className="relative h-[380px] sm:h-[480px] overflow-hidden rounded-2xl border select-none lg:col-span-3 touch-none"
          style={{
            background: 'var(--bg)',
            borderColor: 'var(--border)',
            backgroundImage: 'radial-gradient(var(--border) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        >
          {/* SVG линии связей */}
          <svg className="pointer-events-none absolute inset-0 h-full w-full">
            <defs>
              <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="var(--accent)" />
              </marker>
            </defs>
            {connections.map((conn) => {
              const fromNode = nodes.find((n) => n.id === conn.from);
              const toNode = nodes.find((n) => n.id === conn.to);
              if (!fromNode || !toNode) return null;

              const x1 = fromNode.x + 65;
              const y1 = fromNode.y + 30;
              const x2 = toNode.x + 65;
              const y2 = toNode.y + 30;

              return (
                <g key={conn.id}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="var(--accent)"
                    strokeWidth="2"
                    strokeDasharray="4 3"
                    markerEnd="url(#arrowhead)"
                  />
                  <text
                    x={(x1 + x2) / 2}
                    y={(y1 + y2) / 2 - 6}
                    fill="var(--text-muted)"
                    fontSize="10"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {conn.protocol}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Узлы (Блоки на холсте) */}
          {nodes.map((node) => {
            const isSelected = selectedNodeId === node.id;
            const meta = BLOCK_TYPES.find((b) => b.type === node.type) || BLOCK_TYPES[0];

            return (
              <div
                key={node.id}
                onMouseDown={(e) => handleMouseDown(e, node)}
                onTouchStart={(e) => handleTouchStart(e, node)}
                onClick={(e) => {
                  e.stopPropagation();
                  handleNodeSelect(node.id);
                }}
                className={`absolute flex w-36 sm:w-40 cursor-pointer select-none flex-col rounded-xl border p-2 sm:p-2.5 shadow-md transition-shadow duration-150 ${
                  isSelected ? 'ring-2 ring-[var(--accent)] ring-offset-2' : ''
                }`}
                style={{
                  left: `${node.x}px`,
                  top: `${node.y}px`,
                  background: 'var(--bg-secondary)',
                  borderColor: isSelected ? 'var(--accent)' : 'var(--border)',
                }}
              >
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-base">{meta.icon}</span>
                    <span className="truncate text-[11px] sm:text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                      {node.label}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNode(node.id);
                    }}
                    className="h-5 w-5 rounded text-xs text-red-500 hover:bg-red-500/10 flex items-center justify-center"
                    title="Удалить"
                  >
                    ✕
                  </button>
                </div>

                <div className="mt-1 flex items-center justify-between text-[9px] sm:text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  <span>{isSelected ? (connectMode ? '👉 Цель' : 'Выбран') : 'Тап: опции'}</span>
                  <span className="font-mono opacity-60">{node.type}</span>
                </div>
              </div>
            );
          })}

          {nodes.length === 0 && (
            <div className="flex h-full items-center justify-center text-xs p-4 text-center" style={{ color: 'var(--text-muted)' }}>
              Холст пуст. Добавьте компоненты из палитры слева.
            </div>
          )}
        </div>
      </div>

      {/* Список соединений с кнопкой удаления на мобильных */}
      {connections.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5 items-center">
          <span className="text-[11px] font-bold" style={{ color: 'var(--text-muted)' }}>Связи:</span>
          {connections.map((c) => {
            const fromNode = nodes.find((n) => n.id === c.from);
            const toNode = nodes.find((n) => n.id === c.to);
            return (
              <span
                key={c.id}
                className="inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[10px]"
                style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
              >
                <span>{fromNode ? fromNode.label.split(' ')[0] : 'Node'} ➔ {toNode ? toNode.label.split(' ')[0] : 'Node'}</span>
                <button
                  onClick={() => deleteConnection(c.id)}
                  className="text-red-500 hover:opacity-75 font-bold"
                  title="Удалить связь"
                >
                  ✕
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* Блок вердикта AI */}
      {aiFeedback && (
        <div
          className="mt-6 rounded-2xl border p-4 sm:p-5 shadow-lg animate-fade-in"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
        >
          <div className="mb-2 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm sm:text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              <span>🤖</span> Вердикт AI Архитектора:
            </h3>
            <button
              onClick={() => setAiFeedback(null)}
              className="text-xs transition hover:opacity-70"
              style={{ color: 'var(--text-muted)' }}
            >
              ✕ Закрыть
            </button>
          </div>
          <div className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
            {aiFeedback}
          </div>
        </div>
      )}

      {aiError && (
        <div className="mt-4 rounded-xl border p-4 text-xs text-red-500" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--danger)' }}>
          ❌ {aiError}
        </div>
      )}

      {/* Модалка настроек ключа */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div
            className="w-full max-w-md rounded-2xl border p-6 shadow-2xl"
            style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
          >
            <h3 className="mb-2 text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              🔑 OpenRouter API-ключ
            </h3>
            <p className="mb-4 text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Введите ключ OpenRouter для оценки архитектуры систем с помощью передовых языковых моделей.
            </p>

            <form onSubmit={handleSaveKey} className="space-y-3">
              <input
                type="password"
                placeholder="sk-or-v1-..."
                value={customKeyInput}
                onChange={(e) => setCustomKeyInput(e.target.value)}
                className="w-full rounded-xl border px-3.5 py-2 font-mono text-xs outline-none"
                style={{
                  background: 'var(--bg-secondary)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  className="min-h-[40px] rounded-xl border px-4 py-2 text-xs font-medium transition"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="min-h-[40px] rounded-xl px-4 py-2 text-xs font-bold text-white transition"
                  style={{ background: 'var(--accent)' }}
                >
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
