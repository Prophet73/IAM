import { products } from './data/products'
import { ProductCard } from './components/ProductCard'
import { DataBookDemo } from './components/DataBookDemo'
import { DemoAIHub } from './components/DemoAIHub'
import { DemoAutoprotocol } from './components/DemoAutoprotocol'
import { DemoCostManager } from './components/DemoCostManager'

function App() {
  return (
    <>
      <Nav />
      <Hero />
      <Competence />
      <Products />
      <Architecture />
      <Methodology />
      <BusinessValue />
      <Research />
      <Lab />
      <Contact />
    </>
  )
}

/* ── Navigation ── */
function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-bg/85 backdrop-blur-xl border-b border-border py-3">
      <div className="max-w-[1080px] mx-auto px-8 flex justify-between items-center">
        <div className="font-bold text-[0.95rem]">Никита Хроменок</div>
        <div className="hidden md:flex gap-6">
          {[
            ['#competence', 'Опыт'],
            ['#products', 'Продукты'],
            ['#architecture', 'Архитектура'],
            ['#value', 'Подход'],
            ['#research', 'R&D'],
          ].map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="text-muted text-[0.82rem] font-medium hover:text-text-primary transition-colors no-underline"
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  )
}

/* ── Hero ── */
function Hero() {
  const stats = [
    { num: '10 лет', label: 'в строительстве' },
    { num: '15+', label: 'проектов за 1.5 года' },
    { num: 'МГСУ', label: 'аспирантура' },
  ]

  return (
    <section className="pt-28 pb-10 text-center relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(79,124,255,0.08)_0%,transparent_70%)] pointer-events-none" />
      <div className="max-w-[1080px] mx-auto px-8 relative">
        <div className="inline-block px-4 py-1.5 bg-accent-soft text-accent rounded-full text-[0.78rem] font-semibold tracking-wide mb-6">
          От процесса к продукту
        </div>
        <h1 className="text-3xl md:text-[2.6rem] font-extrabold leading-tight mb-4 bg-gradient-to-br from-text-primary to-accent bg-clip-text text-transparent">
          Знаю стройку изнутри —
          <br />
          делаю инструменты для бизнеса, которых нет на рынке
        </h1>
        <p className="text-base text-muted max-w-[700px] mx-auto mb-10 leading-relaxed">
          10 лет в строительном контроле и управлении проектами, аспирантура МГСУ.
          Не нашёл нужных инструментов — написал сам.
          Без ТЗ и бюджетов: услышал боль → прототип → обратная связь → продукт.
          4 инструмента в формате full-cycle R&D, от идеи до production.
        </p>
        <div className="grid grid-cols-3 gap-6 max-w-[480px] mx-auto">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl md:text-3xl font-extrabold text-accent">{s.num}</div>
              <div className="text-xs text-muted mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Competence (merged with Career) ── */
function Competence() {
  const timeline = [
    { date: '2016–2017', role: 'Инженер ПТО', place: 'МГСУ \u2022 Парк Зарядье', desc: 'Исполнительная документация, фасады и благоустройство' },
    { date: '2018–2020', role: 'Строительно-технический эксперт', place: 'Судебная экспертиза', desc: 'Экспертиза и финансово-технический аудит. АО АККУЮ НУКЛЕАР, ВЦ «Павловопосадские платки»' },
    { date: '2020–2021', role: 'Инженер СК', place: 'ТСК-ТИТУЛ', desc: 'Приёмка работ, проверка КС-2, накопительные. ЖК Discovery (MR Group), Савёловский-сити' },
    { date: '2021–2024', role: 'Инженер → ведущий инженер СК', place: 'Severin Development', desc: 'ЖК FORIVER (InGrad/Sminex) — 11 корпусов, 3 года на объекте, получение ЗОС' },
    { date: '2024', role: 'Руководитель группы СК / Департамент качества', place: 'Severin Development', desc: 'Координация 20+ инженеров. Регламенты, шаблоны для проектных команд' },
    { date: '2024–н.в.', role: 'Департамент цифровой трансформации', place: 'Severin Development', desc: '4 продукта в production, ~10 прототипов. Full-cycle R&D — от идеи до внедрения', active: true },
  ]

  const edu = [
    { date: '2014–2018', text: 'Бакалавриат, ПГС' },
    { date: '2018–2020', text: 'Магистратура, ПГС' },
    { date: '2021–2025', text: 'Аспирантура, ЭБСиГХ' },
  ]

  return (
    <section id="competence" className="py-12">
      <div className="max-w-[1080px] mx-auto px-8">
        <div className="bg-surface border border-border rounded-2xl p-6 md:p-8">
          <div className="flex items-start justify-between mb-5">
            <h2 className="text-xl md:text-2xl font-bold">Карьерный трек</h2>
            <span className="px-3 py-1 rounded text-[0.7rem] font-bold tracking-wider uppercase bg-green-soft text-green shrink-0 ml-4">Опыт</span>
          </div>

          {/* Timeline */}
          <div className="space-y-0">
            {timeline.map((t, i) => (
              <div key={t.date} className="flex gap-4 items-stretch">
                <div className="w-[80px] shrink-0 text-right">
                  <div className="text-[0.7rem] font-bold text-accent pt-0.5 leading-tight">{t.date}</div>
                </div>
                <div className="flex flex-col items-center shrink-0">
                  <div className={`w-2.5 h-2.5 rounded-full border-2 border-accent mt-1.5 ${t.active ? 'bg-accent shadow-[0_0_8px_rgba(79,124,255,0.4)]' : 'bg-bg'}`} />
                  {i < timeline.length - 1 && <div className="w-px flex-1 bg-border" />}
                </div>
                <div className="pb-4">
                  <div className="text-[0.85rem] font-semibold leading-tight">{t.role}</div>
                  <div className="text-[0.7rem] text-accent/70 font-medium">{t.place}</div>
                  <div className="text-[0.78rem] text-muted leading-snug mt-0.5">{t.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Education */}
          <div className="mt-4 pt-4 border-t border-border">
            <span className="text-[0.7rem] font-bold uppercase text-muted">Образование — НИУ МГСУ</span>
            <div className="flex gap-6 mt-2 flex-wrap">
              {edu.map((e) => (
                <div key={e.date} className="text-[0.8rem]">
                  <span className="text-accent font-bold text-[0.72rem]">{e.date}</span>
                  <span className="text-muted ml-1.5">{e.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── Products ── */
function Products() {
  return (
    <section id="products" className="bg-surface py-16">
      <div className="max-w-[1080px] mx-auto px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold">Продукты</h2>
        </div>
        {products.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            demo={p.id === 'aihub' ? <DemoAIHub /> : p.id === 'databook' ? <DataBookDemo /> : p.id === 'autoprotocol' ? <DemoAutoprotocol /> : p.id === 'costmanager' ? <DemoCostManager /> : undefined}
          />
        ))}
      </div>
    </section>
  )
}

/* ── Lab / Experiments ── */
function Lab() {
  const experiments = [
    { desc: 'RAG-консультант по строительным нормам с гибридным поиском', tags: ['RAG', 'Gemini', 'Embeddings'] },
    { desc: 'Автоклассификация элементов BIM-моделей через LLM', tags: ['Ollama', 'IFC', 'ML'] },
    { desc: 'AI-ассистент по документации бизнес-процессов', tags: ['RAG', 'BM25', 'ChromaDB'] },
    { desc: 'Голосовой ассистент с распознаванием и синтезом речи', tags: ['STT', 'TTS', 'Gemini'] },
    { desc: 'Real-time перевод аудио на совещаниях', tags: ['Whisper', 'WebSocket', 'Gemini'] },
    { desc: 'Платформа конкурсов с голосованием и OAuth2', tags: ['FastAPI', 'React', 'OAuth2'] },
    { desc: 'Канбан-система для AI-контента с автокатегоризацией', tags: ['Next.js', 'FastAPI', 'Gemini'] },
    { desc: 'Telegram-бот для автоматического создания задач из ссылок', tags: ['aiogram', 'Gemini', 'API'] },
    { desc: 'AI-сравнение версий PDF-документации с визуализацией', tags: ['PyMuPDF', 'Gemini', 'PDF.js'] },
    { desc: 'Автоматический анализ стенограмм совещаний из СЭД', tags: ['Gemini', 'API', 'Pydantic'] },
    { desc: 'Парсинг и структурирование данных из реестров экспертизы', tags: ['Python', 'BeautifulSoup'] },
    { desc: 'Программная генерация документов по корпоративному брендбуку', tags: ['python-docx'] },
  ]

  return (
    <section className="py-12">
      <div className="max-w-[1080px] mx-auto px-8">
        <div className="mb-6">
          <div className="inline-block px-3 py-1 rounded text-[0.7rem] font-bold tracking-wider uppercase mb-3 bg-purple-soft text-purple">
            Эксперименты
          </div>
          <h2 className="text-xl font-bold mb-1">Прототипы и эксперименты</h2>
          <p className="text-[0.85rem] text-muted">Каждый production-продукт вырос из серии экспериментов. Ниже — задачи, которые решались на пути.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {experiments.map((e, i) => (
            <div key={i} className="bg-surface border border-border rounded-lg px-4 py-3 flex flex-col gap-1.5">
              <div className="text-[0.78rem] text-text-primary leading-snug">{e.desc}</div>
              <div className="flex flex-wrap gap-1 mt-auto">
                {e.tags.map((t) => (
                  <span key={t} className="px-1.5 py-0.5 rounded text-[0.62rem] font-medium bg-surface-3 text-muted">{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Architecture ── */
function Architecture() {
  return (
    <section id="architecture" className="py-16">
      <div className="max-w-[1080px] mx-auto px-8">
        <SectionHeader
          tag="Архитектура"
          tagColor="bg-cyan-soft text-cyan"
          title="Как это устроено под капотом"
          subtitle="Общая авторизация, общие данные, общий AI-слой. Всё крутится на одной инфраструктуре."
        />

        {/* Technical landscape */}
        <div className="bg-surface border border-border rounded-2xl p-8 mb-6">
          <div className="text-xs font-bold uppercase tracking-wider text-muted text-center mb-6">
            Технический ландшафт
          </div>
          <div className="flex flex-col gap-3 max-w-[820px] mx-auto">
            <ArchLayer label="Потребители">
              <ArchItem color="amber" title="Инженеры СК" sub="DataBook, Puls" />
              <ArchItem color="amber" title="Экономисты" sub="CostManager" />
              <ArchItem color="amber" title="Руководители" sub="Автопротокол" />
              <ArchItem color="amber" title="Все сотрудники" sub="AI-Hub, AI-чат" />
            </ArchLayer>
            <div className="arch-arrow">&darr; SSO / OAuth2 + PKCE &darr;</div>
            <ArchLayer label="Авторизация">
              <ArchItem color="accent" title="AI-Hub — OAuth2 Authorization Server, RBAC, ADFS/OIDC, аудит" sub="Единая точка входа и управления доступами" wide />
            </ArchLayer>
            <div className="arch-arrow">&darr;</div>
            <ArchLayer label="Приложения">
              <ArchItem color="green" title="DataBook" sub="NLP-поиск" />
              <ArchItem color="green" title="CostManager" sub="Аналитика смет" />
              <ArchItem color="green" title="Автопротокол" sub="ML-транскрипция" />
              <ArchItem color="green" title="Puls" sub="ERP (прототип)" />
            </ArchLayer>
            <div className="arch-arrow">&darr;</div>
            <ArchLayer label="AI / ML слой">
              <ArchItem color="purple" title="Gemini API" sub="Генерация, классификация" />
              <ArchItem color="purple" title="Ollama" sub="Локальный инференс" />
              <ArchItem color="purple" title="WhisperX + pyannote" sub="Speech pipeline" />
              <ArchItem color="purple" title="Embeddings" sub="Векторный поиск" />
            </ArchLayer>
            <div className="arch-arrow">&darr;</div>
            <ArchLayer label="Инфраструктура">
              <ArchItem color="cyan" title="PostgreSQL" sub="СУБД" />
              <ArchItem color="cyan" title="Redis" sub="Очереди, кеш" />
              <ArchItem color="cyan" title="Celery" sub="Async-задачи" />
              <ArchItem color="cyan" title="Docker + Nginx" sub="Контейнеризация" />
              <ArchItem color="cyan" title="GitHub Actions" sub="CI/CD" />
            </ArchLayer>
          </div>
        </div>

      </div>
    </section>
  )
}

/* ── Business Value ── */
function BusinessValue() {
  const cards = [
    {
      title: 'Без посредников',
      text: 'Обычная цепочка: бизнес → аналитик → разработчик. На каждом шаге теряется контекст. Когда сам знаешь предметку и сам пишешь код — попадание в потребность точнее.',
      metric: 'Нулевая потеря контекста',
    },
    {
      title: 'Люди пришли сами',
      text: 'Ни один продукт не внедрялся приказом сверху. DataBook сделал год назад и забыл — а инженеры пользуются каждый день. Это лучшая валидация.',
      metric: 'Adoption без бюджета',
    },
    {
      title: 'Быстрый цикл',
      text: 'От боли до рабочего MVP — 2–3 месяца. Услышал проблему на совещании, за выходные прототип, в понедельник показал, собрал обратную связь, доработал.',
      metric: '4 продукта за 1.5 года (solo)',
    },
  ]

  return (
    <section id="value" className="bg-surface py-16">
      <div className="max-w-[1080px] mx-auto px-8">
        <SectionHeader
          tag="Почему это работает"
          tagColor="bg-green-soft text-green"
          title="Что даёт совмещение отрасли и разработки"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {cards.map((c) => (
            <div key={c.title} className="bg-surface border border-border rounded-xl p-6">
              <h3 className="text-[0.92rem] font-bold mb-1.5">{c.title}</h3>
              <p className="text-[0.8rem] text-muted leading-relaxed">{c.text}</p>
              <div className="mt-3 pt-3 border-t border-border text-[0.78rem] text-green font-semibold">
                {c.metric}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Methodology ── */
function Methodology() {
  const oldChain = ['Заказчик', 'Аналитик', 'Разработчик', 'QA', 'Заказчик']
  const newChain = ['Бизнес-задача', 'Отраслевой эксперт + AI', 'Продукт']

  const steps = [
    { num: '01', title: 'Выявляю потребность', text: 'Не через исследование рынка — а через ежедневную работу внутри процессов. 10 лет в отрасли — понимание задач из первых рук.' },
    { num: '02', title: 'Быстрый прототип', text: 'AI-инструменты снимают технические ограничения. Архитектура → MVP за дни. Минимально достаточный функционал для проверки гипотезы.' },
    { num: '03', title: 'Экспертная валидация', text: 'Отраслевая экспертиза позволяет самостоятельно оценить корректность решения. Без промежуточных звеньев — от задачи до результата напрямую.' },
    { num: '04', title: 'Итеративное развитие', text: 'Развитие по реальным запросам пользователей, не по гипотетическому roadmap. Приоритет — то, что создаёт измеримую ценность.' },
  ]

  return (
    <section className="py-16">
      <div className="max-w-[1080px] mx-auto px-8">
        <SectionHeader
          tag="Как я делаю продукты"
          tagColor="bg-purple-soft text-purple"
          title="От задачи на площадке до рабочего инструмента"
          subtitle="Техническая реализация перестаёт быть ограничением. Ключевой дефицит — понимание предметной области."
        />

        {/* Old vs New model */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Old model */}
          <div className="bg-surface border border-border rounded-xl p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-red/[0.03]" />
            <div className="relative">
              <div className="text-[0.68rem] font-bold uppercase tracking-wider text-red mb-3">Линейная модель</div>
              <div className="flex flex-wrap items-center gap-1.5 mb-4">
                {oldChain.map((item, i) => (
                  <span key={i} className="contents">
                    <span className="px-2.5 py-1 rounded bg-surface-3 text-[0.75rem] text-muted line-through decoration-red/40">{item}</span>
                    {i < oldChain.length - 1 && <span className="text-muted/40 text-xs">&rarr;</span>}
                  </span>
                ))}
              </div>
              <div className="space-y-1.5 text-[0.78rem] text-muted">
                <div className="flex items-start gap-2"><span className="text-red shrink-0">&#x2717;</span> Потеря контекста на каждом звене передачи</div>
                <div className="flex items-start gap-2"><span className="text-red shrink-0">&#x2717;</span> Разработчик не владеет предметной областью</div>
                <div className="flex items-start gap-2"><span className="text-red shrink-0">&#x2717;</span> Аналитик не знает возможностей технологий</div>
                <div className="flex items-start gap-2"><span className="text-red shrink-0">&#x2717;</span> Цикл обратной связи — месяцы</div>
                <div className="flex items-start gap-2"><span className="text-red shrink-0">&#x2717;</span> Ускорение одного звена смещает узкое место в следующее</div>
              </div>
            </div>
          </div>

          {/* New model */}
          <div className="bg-surface border border-accent/30 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-accent/[0.03]" />
            <div className="relative">
              <div className="text-[0.68rem] font-bold uppercase tracking-wider text-accent mb-3">Новая модель</div>
              <div className="flex flex-wrap items-center gap-1.5 mb-4">
                {newChain.map((item, i) => (
                  <span key={i} className="contents">
                    <span className="px-2.5 py-1 rounded bg-accent-soft text-[0.75rem] text-accent font-semibold">{item}</span>
                    {i < newChain.length - 1 && <span className="text-accent/50 text-xs">&rarr;</span>}
                  </span>
                ))}
              </div>
              <div className="space-y-1.5 text-[0.78rem] text-muted">
                <div className="flex items-start gap-2"><span className="text-green shrink-0">&#x2713;</span> Эксперт совмещает понимание процесса и реализацию</div>
                <div className="flex items-start gap-2"><span className="text-green shrink-0">&#x2713;</span> AI снимает технические ограничения</div>
                <div className="flex items-start gap-2"><span className="text-green shrink-0">&#x2713;</span> Валидация встроена в процесс — без промежуточных звеньев</div>
                <div className="flex items-start gap-2"><span className="text-green shrink-0">&#x2713;</span> Цикл обратной связи — дни, а не месяцы</div>
                <div className="flex items-start gap-2"><span className="text-green shrink-0">&#x2713;</span> Ускоряется весь процесс, а не отдельное звено</div>
              </div>
            </div>
          </div>
        </div>

        {/* Thesis */}
        <div className="bg-surface-2 border border-border rounded-xl p-5 mb-8 max-w-[820px] mx-auto text-center">
          <p className="text-[0.88rem] text-text-primary leading-relaxed">
            AI-инструменты снимают барьер технической реализации. Дефицит смещается: разработчик без отраслевой экспертизы теряет ценность, аналитик без понимания технологий — тоже.{' '}
            <span className="text-accent font-semibold">Максимальная эффективность — у специалиста на стыке: предметная область + технологии + AI.</span>{' '}
            Это редкое сочетание, потому что требует двух параллельных карьер.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((s) => (
            <div key={s.num} className="bg-surface border border-border rounded-xl p-5">
              <div className="text-3xl font-extrabold text-accent opacity-30 mb-2">{s.num}</div>
              <h4 className="text-[0.85rem] font-bold mb-1.5">{s.title}</h4>
              <p className="text-[0.76rem] text-muted leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Research ── */
function Research() {
  const items = [
    {
      title: 'AI-агенты и мультиагентные системы',
      text: 'Архитектуры автономных агентов, context engineering, framework-ы для оркестрации. Применение в продуктах: Автопротокол, AI-Hub.',
      tags: [{ label: 'LangChain', color: 'bg-purple-soft text-purple' }, { label: 'MCP Protocol', color: 'bg-purple-soft text-purple' }, { label: 'Claude Code', color: 'bg-purple-soft text-purple' }],
    },
    {
      title: 'LLM: облачные и локальные модели',
      text: 'Prompt engineering, structured output, RAG-системы. Практика с Gemini, Claude, GPT, Ollama (Llama, Mistral, Qwen).',
      tags: [{ label: 'Gemini', color: 'bg-accent-soft text-accent' }, { label: 'Claude', color: 'bg-accent-soft text-accent' }, { label: 'Ollama', color: 'bg-accent-soft text-accent' }],
    },
    {
      title: 'Speech & NLP',
      text: 'Транскрипция, диаризация, анализ эмоций. Работа с WhisperX, pyannote, wav2vec2. Лемматизация русского языка.',
      tags: [{ label: 'WhisperX', color: 'bg-green-soft text-green' }, { label: 'pyannote', color: 'bg-green-soft text-green' }, { label: 'NLP', color: 'bg-green-soft text-green' }],
    },
    {
      title: 'GPU и ML-инфраструктура',
      text: 'Настройка GPU-серверов для инференса. CUDA-оптимизация. Деплой моделей в Docker. Мониторинг ресурсов.',
      tags: [{ label: 'CUDA', color: 'bg-cyan-soft text-cyan' }, { label: 'PyTorch', color: 'bg-cyan-soft text-cyan' }, { label: 'Docker', color: 'bg-cyan-soft text-cyan' }],
    },
    {
      title: 'Научная деятельность',
      text: 'Аспирантура МГСУ. Публикация: «Integrated methodology for environmental risk management in the life cycle of buildings» (2025).',
      tags: [{ label: 'ORCID', color: 'bg-amber-soft text-amber' }, { label: 'МГСУ', color: 'bg-amber-soft text-amber' }],
    },
    {
      title: 'AI-ассистированная разработка',
      text: 'Системная работа с Cursor и Claude Code. Архитектурное проектирование + AI-генерация. Многоагентные workflow для масштабных задач.',
      tags: [{ label: 'Cursor', color: 'bg-red-soft text-red' }, { label: 'Claude Code', color: 'bg-red-soft text-red' }, { label: 'Vibe Coding', color: 'bg-red-soft text-red' }],
    },
  ]

  return (
    <section id="research" className="bg-surface py-16">
      <div className="max-w-[1080px] mx-auto px-8">
        <SectionHeader
          tag="R&D"
          tagColor="bg-purple-soft text-purple"
          title="Чем интересуюсь и что изучаю"
          subtitle="Слежу за технологиями системно: собственный Telegram-бот с AI-классификацией мониторит новые исследования."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-6">
          {items.map((item) => (
            <div key={item.title} className="bg-bg border border-border rounded-xl p-5">
              <h4 className="text-[0.85rem] font-bold mb-1">{item.title}</h4>
              <p className="text-[0.76rem] text-muted leading-relaxed">{item.text}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {item.tags.map((t) => (
                  <span key={t.label} className={`px-1.5 py-0.5 rounded text-[0.66rem] font-semibold ${t.color}`}>
                    {t.label}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}


/* ── Contact ── */
function Contact() {
  return (
    <section className="text-center py-16 pb-24">
      <div className="max-w-[1080px] mx-auto px-8">
        <h2 className="text-2xl font-bold mb-3">Контакты</h2>
        <p className="text-muted text-[0.92rem] mb-8">
          Ищу команду, где опыт на стыке стройки и разработки
          <br />
          будет к месту. Открыт к разговору.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          {['+7 (926) 897-32-25', 'KhromenokNV@mail.ru', 'Москва'].map((c) => (
            <div key={c} className="px-6 py-2.5 bg-surface border border-border rounded-lg text-[0.85rem]">
              {c}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Shared Components ── */
function SectionHeader({
  tag,
  tagColor,
  title,
  subtitle,
}: {
  tag: string
  tagColor: string
  title: string
  subtitle?: string
}) {
  return (
    <div className="mb-10">
      <div className={`inline-block px-3 py-1 rounded text-[0.7rem] font-bold tracking-wider uppercase mb-3 ${tagColor}`}>
        {tag}
      </div>
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      {subtitle && <p className="text-muted text-[0.92rem] max-w-[620px]">{subtitle}</p>}
    </div>
  )
}

function ArchLayer({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-stretch gap-3 flex-col md:flex-row">
      <div className="md:w-[110px] md:min-w-[110px] flex items-center md:justify-end text-[0.7rem] font-bold uppercase tracking-wide text-muted md:text-right md:pr-2">
        {label}
      </div>
      <div className="flex-1 flex gap-2 flex-wrap">{children}</div>
    </div>
  )
}

const archColors = {
  accent: 'bg-accent-soft border-accent/25 text-accent',
  green: 'bg-green-soft border-green/25 text-green',
  purple: 'bg-purple-soft border-purple/25 text-purple',
  cyan: 'bg-cyan-soft border-cyan/25 text-cyan',
  amber: 'bg-amber-soft border-amber/25 text-amber',
}

function ArchItem({
  color,
  title,
  sub,
  wide,
}: {
  color: keyof typeof archColors
  title: string
  sub?: string
  wide?: boolean
}) {
  return (
    <div
      className={`${wide ? 'flex-[3]' : 'flex-1'} min-w-[130px] px-3 py-2.5 rounded-lg text-[0.78rem] font-semibold text-center border ${archColors[color]}`}
    >
      {title}
      {sub && <small className="block text-[0.66rem] font-normal opacity-70 mt-0.5">{sub}</small>}
    </div>
  )
}

export default App
