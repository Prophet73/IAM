import { Link } from 'react-router-dom'

/* ── Problem → Solution card ── */
function PSCard({ problem, solution, tech }: { problem: string; solution: string; tech: string[] }) {
  return (
    <div className="group bg-surface/40 border border-border/60 rounded-2xl p-5 hover:bg-surface-2/60 hover:border-border transition-all duration-300">
      <div className="flex items-start gap-3 mb-3">
        <span className="shrink-0 mt-0.5 w-5 h-5 rounded-md bg-red/10 text-red flex items-center justify-center text-[11px] font-bold">!</span>
        <p className="text-sm text-text-primary/70 leading-relaxed">{problem}</p>
      </div>
      <div className="flex items-start gap-3 mb-4">
        <span className="shrink-0 mt-0.5 w-5 h-5 rounded-md bg-green/10 text-green flex items-center justify-center text-[11px] font-bold">→</span>
        <p className="text-sm text-text-primary leading-relaxed">{solution}</p>
      </div>
      <div className="flex flex-wrap gap-1.5 pl-8">
        {tech.map((t) => (
          <span key={t} className="px-2 py-0.5 rounded-md bg-surface-2 border border-border/50 text-[10px] font-mono text-muted">{t}</span>
        ))}
      </div>
    </div>
  )
}

/* ── Section ── */
interface Card { problem: string; solution: string; tech: string[] }

function Section({
  index, color, tag, title, description, cards,
}: {
  index: number; color: string; tag: string; title: string; description: string; cards: Card[]
}) {
  return (
    <section>
      <div className={`${color} text-sm font-bold uppercase tracking-widest mb-3`}>{index}. {tag}</div>
      <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">{title}</h2>
      <p className="text-muted leading-relaxed mb-8 max-w-3xl">{description}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c, i) => <PSCard key={i} {...c} />)}
      </div>
    </section>
  )
}

/* ── Page ── */
export default function Architecture() {
  return (
    <div className="min-h-screen bg-bg text-text-primary">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-bg/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-sm text-muted hover:text-text-primary transition-colors">← Портфолио</Link>
          <span className="font-display text-sm font-bold">System Architecture</span>
        </div>
      </header>

      {/* Hero */}
      <div className="relative pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 z-0" style={{
          backgroundSize: '40px 40px',
          backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)',
          maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
        }} />
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-2 border border-border text-xs font-mono text-green mb-8">
            <span className="w-2 h-2 rounded-full bg-green animate-pulse" />
            SYSTEM.STATUS = PRODUCTION
          </div>

          <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
            Enterprise AI Pipeline<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple">
              Архитектурные решения.
            </span>
          </h1>

          <p className="text-lg text-muted max-w-3xl mx-auto leading-relaxed mb-12">
            Не код, а инженерные решения. Каждый блок — это конкретная проблема продакшена
            и выбранный подход к её устранению.
          </p>

          {/* High-level flow */}
          <div className="glass-panel rounded-2xl p-6 md:p-8 max-w-5xl mx-auto text-left relative overflow-hidden">
            <h3 className="text-[11px] font-mono text-muted mb-6 uppercase tracking-widest">High-level Data Flow</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'FastAPI Gateway', color: 'text-accent', items: ['OAuth2/SSO ADFS', 'Error Middleware', 'Upload Validation'] },
                { label: 'Redis Broker', color: 'text-red', items: ['Job State Store', 'Celery Queue', 'TTL = 24h'] },
                { label: 'GPU Worker (c=1)', color: 'text-purple', items: ['WhisperX (ASR)', 'Pyannote 3.1', 'Wav2Vec2 (Emotions)'], border: 'border-l-2 border-l-purple' },
                { label: 'LLM Worker (c=3)', color: 'text-green', items: ['Gemini 2.5 Pro/Flash', 'Reports Gen', 'Structured Output'], border: 'border-l-2 border-l-green' },
              ].map((block) => (
                <div key={block.label} className={`bg-surface-2 border border-border p-4 rounded-xl ${block.border ?? ''}`}>
                  <div className={`${block.color} font-semibold text-sm mb-2`}>{block.label}</div>
                  <div className="text-xs text-muted leading-relaxed">{block.items.map((item, i) => <div key={i}>{item}</div>)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-24">

        {/* 1. GPU & Orchestration */}
        <Section
          index={1}
          color="text-purple"
          tag="GPU & ОРКЕСТРАЦИЯ"
          title="CUDA OOM Protection"
          description="ML-модели суммарно требуют больше VRAM, чем доступно. При конкурентных запросах — OOM и падение сервиса."
          cards={[
            {
              problem: 'WhisperX + Pyannote + Wav2Vec2 не помещаются в VRAM одновременно. Конкурентные запросы → Out of Memory.',
              solution: 'Thread-safe Singleton GPUMemoryManager. Двухуровневая очистка: мягкая при >85% VRAM, агрессивная при >95% с двойной синхронизацией и GC.',
              tech: ['PyTorch CUDA', 'threading.Lock', 'gc.collect', 'Singleton'],
            },
            {
              problem: 'Модели нужны эпизодически, но занимают VRAM постоянно. Память утекает между задачами.',
              solution: 'Lazy-load моделей через model_cache. Проверка VRAM перед каждой стадией пайплайна. При критическом пороге — принудительная выгрузка всех кешированных моделей.',
              tech: ['model_context()', 'gpu_cleanup decorator', 'VRAM thresholds'],
            },
            {
              problem: 'Транскрипция 2-часового аудио = 15 минут. Нельзя блокировать API на это время.',
              solution: 'Celery воркеры с разделёнными очередями: GPU (concurrency=1, чтобы не было VRAM-конфликтов) и LLM (concurrency=3, параллельная генерация отчётов).',
              tech: ['Celery', 'Redis', 'task routing', 'queue separation'],
            },
          ]}
        />

        {/* 2. DDD */}
        <Section
          index={2}
          color="text-green"
          tag="АРХИТЕКТУРА"
          title="Domain-Driven Design"
          description="Пайплайн транскрипции один, а бизнес-доменов пять. У каждого свои типы совещаний, промпты и артефакты. Ядро не должно знать о специфике."
          cards={[
            {
              problem: 'Стройка, HR, IT, CEO — у каждого домена свои правила генерации отчётов. Хардкод в ядре превращается в if/else-ад.',
              solution: 'Единый реестр доменов (registry pattern). Новый домен = Pydantic-схема + YAML-конфиг. Ядро не трогается. Фабрика сама подтягивает генераторы отчётов.',
              tech: ['Pydantic', 'dataclasses', 'Registry Pattern', 'Factory'],
            },
            {
              problem: 'Доменные сервисы тяжёлые. Загрузка всех при старте — лишний расход памяти.',
              solution: 'Lazy-load через строковый путь (importlib). Сервис инстанцируется только при первом запросе к домену.',
              tech: ['importlib', 'lazy loading', 'string-based service path'],
            },
            {
              problem: 'Фронтенд и бэкенд должны знать о доменах синхронно. Рассинхрон = баги.',
              solution: 'Зеркальный реестр на фронте: иконки, цвета, lazy-роутинг. Домен добавляется один раз — оба слоя подхватывают.',
              tech: ['TypeScript config', 'React.lazy()', 'route generation'],
            },
          ]}
        />

        {/* 3. Observability */}
        <Section
          index={3}
          color="text-red"
          tag="НАБЛЮДАЕМОСТЬ"
          title="Error Tracking & Watchdog"
          description="Продакшен без мониторинга слеп. Каждая ошибка ловится, каждый зависший воркер находится и рестартуется."
          cards={[
            {
              problem: '500-я ошибка в проде — теряется контекст: что за запрос, какие данные, кто пользователь.',
              solution: 'ErrorLoggingMiddleware перехватывает все 500-е. StackTrace + Request Body + User ID → БД. Полный контекст для дебага без Sentry.',
              tech: ['FastAPI Middleware', 'SQLAlchemy', 'traceback'],
            },
            {
              problem: 'Celery воркер упал или завис — задача теряется, пользователь ждёт бесконечно.',
              solution: 'Celery Beat каждые 5 минут ищет зависшие задачи и рестартует их. Каждые 15 минут — проверка здоровья всей системы. Массовые сбои → алерт на почту.',
              tech: ['Celery Beat', 'task_acks_late', 'reject_on_worker_lost'],
            },
            {
              problem: 'Нет единой картины здоровья системы — Redis может лежать, GPU отвалиться, диск переполниться.',
              solution: '/health эндпоинт: Redis, GPU, Celery, диск. Любая деградация компонента → статус "degraded" вместо "healthy".',
              tech: ['psutil', 'torch.cuda', 'celery.control.ping'],
            },
          ]}
        />

        {/* 4. Auth & Admin */}
        <Section
          index={4}
          color="text-amber"
          tag="УПРАВЛЕНИЕ"
          title="Enterprise Auth & Admin"
          description="Корпоративная среда: Active Directory, разграничение доступа, учёт расходов на LLM."
          cards={[
            {
              problem: '200+ сотрудников в компании. Отдельная регистрация невозможна — только корпоративный SSO.',
              solution: 'OAuth2 интеграция с ADFS. Автопровижининг при первом входе: пользователь получает роль и домен автоматически. Redis-backed rate limiting.',
              tech: ['OAuth2', 'ADFS', 'JWT', 'Redis state'],
            },
            {
              problem: 'Разные пользователи — разные права. Admin видит аналитику, user — только свои записи.',
              solution: 'Двухуровневая авторизация: superuser (полный доступ к системе) + admin (управление своим доменом). Доменная изоляция данных на уровне ORM-запросов.',
              tech: ['FastAPI Depends', 'JWT claims', 'domain filtering'],
            },
            {
              problem: 'LLM-вызовы стоят денег. Непонятно, сколько тратит каждый домен и на какие модели.',
              solution: 'Token tracker на каждый job: input/output токены, модель (Flash vs Pro), расчёт стоимости. Агрегация в admin dashboard с фильтрами по периоду.',
              tech: ['Token tracker', 'Gemini billing', 'PostgreSQL aggregates'],
            },
          ]}
        />

        {/* 5. LLM Engineering */}
        <Section
          index={5}
          color="text-pink-400"
          tag="LLM ИНЖЕНЕРИЯ"
          title="Отказоустойчивая генерация"
          description="LLM-провайдеры падают, возвращают мусор, превышают rate limits. Система должна генерировать отчёты несмотря ни на что."
          cards={[
            {
              problem: 'Gemini Pro возвращает 503 или таймаутит при перегрузке. Отчёт не генерируется.',
              solution: 'Retry на основной модели → автоматический каскад: Pro → Flash → следующий fallback. Адаптивные таймауты под тип ошибки (503 vs timeout vs rate limit).',
              tech: ['Gemini API', 'retry logic', 'FALLBACK_MODELS chain'],
            },
            {
              problem: 'LLM возвращает "почти JSON" — с markdown-обёрткой, лишними символами, невалидной структурой.',
              solution: 'strip_markdown_json() чистит ответ от обёрток. Все вызовы проходят через единый token tracker для биллинга и мониторинга.',
              tech: ['regex parsing', 'token accounting', 'error classification'],
            },
            {
              problem: '5 доменов × N типов совещаний = десятки промптов. Хардкод в коде невозможен.',
              solution: '45KB промптов в YAML. Обновление без деплоя. Для риск-анализа — INoT (Introspection of Thought): агенты Скептик и Рисковик спорят внутри промпта.',
              tech: ['YAML config (819 строк)', 'INoT agent debate', 'domain templates'],
            },
          ]}
        />

        {/* 6. Pipeline */}
        <Section
          index={6}
          color="text-cyan"
          tag="ML PIPELINE"
          title="7-Stage Weighted Pipeline"
          description="Каждая стадия имеет реальный вычислительный вес. Прогресс-бар не врёт."
          cards={[
            {
              problem: 'Линейный прогресс (14% на стадию) — ложь. Транскрипция занимает 35% времени, а извлечение аудио — 5%.',
              solution: 'Взвешенный прогресс: audio=5%, VAD=10%, transcription=35%, diarization=25%, translation=10%, emotions=10%, reports=5%. Пользователь видит реальную картину.',
              tech: ['STAGE_WEIGHTS', 'Redis progress state', 'WebSocket updates'],
            },
            {
              problem: 'GPU-стадии (ASR, diarization) и лёгкие LLM-вызовы (отчёты) конкурируют за ресурсы в одной очереди.',
              solution: 'GPU-очередь (concurrency=1) и LLM-очередь (concurrency=3). Celery chain последовательно связывает: транскрипция → отчёты → сохранение → email-уведомление.',
              tech: ['Celery chain', 'task routing', 'queue separation'],
            },
            {
              problem: 'Воркер падает посреди обработки — задача теряется, файл обработан наполовину.',
              solution: 'task_acks_late: задача подтверждается только после завершения. При падении воркера — автоматический requeue. Hard limit = 2 часа на задачу.',
              tech: ['acks_late', 'reject_on_worker_lost', 'time_limit=7200'],
            },
          ]}
        />

      </div>

      {/* Stats */}
      <div className="max-w-6xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { num: '80+', label: 'REST эндпоинтов' },
            { num: '5', label: 'бизнес-доменов' },
            { num: '90+', label: 'языков транскрипции' },
            { num: '7', label: 'стадий ML-пайплайна' },
          ].map((s) => (
            <div key={s.label} className="glass-panel rounded-xl p-4 text-center">
              <div className="text-2xl font-extrabold text-accent">{s.num}</div>
              <div className="text-xs text-muted mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-12 border-t border-border">
        <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent/90 text-white rounded-xl font-semibold transition-colors">
          ← Вернуться к портфолио
        </Link>
        <div className="text-muted text-xs font-mono uppercase tracking-widest mt-6">
          Severin Development · R&D Engineering
        </div>
      </div>
    </div>
  )
}
