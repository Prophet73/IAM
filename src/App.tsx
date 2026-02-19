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
      <BusinessValue />
      <Methodology />
      <Research />
      <Career />
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
            ['#competence', 'Компетенции'],
            ['#products', 'Продукты'],
            ['#code', 'Код'],
            ['#architecture', 'Архитектура'],
            ['#value', 'Ценность'],
            ['#research', 'R&D'],
            ['#career', 'Карьера'],
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
    { num: '4', label: 'продукта в production' },
    { num: '20 млрд \u20BD', label: 'бюджет ключевого объекта' },
    { num: '8 500+', label: 'предписаний в базе знаний' },
  ]

  return (
    <section className="pt-32 pb-16 text-center relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(79,124,255,0.08)_0%,transparent_70%)] pointer-events-none" />
      <div className="max-w-[1080px] mx-auto px-8 relative">
        <div className="inline-block px-4 py-1.5 bg-accent-soft text-accent rounded-full text-[0.78rem] font-semibold tracking-wide mb-6">
          Цифровизация строительных процессов
        </div>
        <h1 className="text-3xl md:text-[2.6rem] font-extrabold leading-tight mb-4 bg-gradient-to-br from-text-primary to-accent bg-clip-text text-transparent">
          Продукты, которыми строители
          <br />
          пользуются каждый день
        </h1>
        <p className="text-base text-muted max-w-[700px] mx-auto mb-10 leading-relaxed">
          Специалист с 10-летним опытом в строительной отрасли.
          Проектирую и разрабатываю цифровые решения для автоматизации строительных процессов.
          4 продукта в промышленной эксплуатации, созданные в формате full-cycle R&D.
        </p>
        <div className="flex justify-center gap-8 md:gap-12 flex-wrap">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-2xl md:text-3xl font-extrabold text-accent">{s.num}</div>
              <div className="text-xs text-muted mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Competence ── */
function Competence() {
  const cards = [
    {
      title: 'Полный цикл строительного контроля',
      text: 'Карьерный путь от лаборанта МГСУ до заместителя руководителя проекта. Проверка КС-2, ведение исполнительной документации, контроль СМР, приёмка скрытых работ, участие в приёмочных комиссиях.',
    },
    {
      title: 'Строительно-техническая экспертиза',
      text: 'Подписант экспертных заключений. Крупнейший проект: экспертиза для АО АККУЮ НУКЛЕАР (186 стр.). Финансово-технический аудит, определение стоимости и качества выполненных работ.',
      highlight: 'АО АККУЮ НУКЛЕАР',
    },
    {
      title: 'ЖК FORIVER — 20 млрд \u20BD',
      text: '3 года на объекте: 11 корпусов, 1 300 квартир бизнес/премиум-класса. Координация команды 20+ инженеров в роли зам. РП. Методологическая поддержка, контроль качества, участие в получении ЗОС.',
    },
    {
      title: 'Контроль финансовой дисциплины',
      text: 'Жёсткая проверка объёмов при приёмке КС-2. Выявление завышений, защита позиции заказчика перед генподрядчиком. Опыт на объектах MR Group, Sminex (FORIVER), Савёловский-сити.',
    },
  ]

  return (
    <section id="competence" className="py-16">
      <div className="max-w-[1080px] mx-auto px-8">
        <SectionHeader
          tag="Отраслевая экспертиза"
          tagColor="bg-green-soft text-green"
          title="Строительный фундамент"
          subtitle="Каждый продукт вырос из задач, с которыми я сталкивался лично на протяжении десяти лет работы на строительных площадках."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cards.map((c) => (
            <div key={c.title} className="bg-surface border border-border rounded-xl p-6">
              <h3 className="text-[0.92rem] font-bold mb-1.5">{c.title}</h3>
              <p className="text-[0.83rem] text-muted leading-relaxed">{c.text}</p>
            </div>
          ))}
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
        <SectionHeader
          tag="Продуктовый портфель"
          tagColor="bg-accent-soft text-accent"
          title="Экосистема цифровых продуктов"
          subtitle="Четыре взаимосвязанных решения, объединённых общей инфраструктурой авторизации и данных. Нажмите на карточку для детальной информации."
        />
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

/* ── Architecture ── */
function Architecture() {
  return (
    <section id="architecture" className="py-16">
      <div className="max-w-[1080px] mx-auto px-8">
        <SectionHeader
          tag="Системная архитектура"
          tagColor="bg-cyan-soft text-cyan"
          title="Техническая и бизнес-архитектура"
          subtitle="Единая платформа с общей инфраструктурой авторизации, данных и AI-сервисов."
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

        {/* Business coverage */}
        <div className="bg-surface border border-border rounded-2xl p-8">
          <div className="text-xs font-bold uppercase tracking-wider text-muted text-center mb-6">
            Покрытие строительного цикла
          </div>
          <div className="flex flex-col gap-3 max-w-[820px] mx-auto">
            <ArchLayer label="Планирование">
              <ArchItem color="green" title="CostManager — анализ себестоимости, бенчмаркинг объектов-аналогов, обоснование бюджета" wide />
            </ArchLayer>
            <ArchLayer label="Строительство">
              <ArchItem color="green" title="DataBook" sub="База предписаний СК" />
              <ArchItem color="green" title="Puls" sub="Операционная отчётность" />
            </ArchLayer>
            <ArchLayer label="Управление">
              <ArchItem color="green" title="Автопротокол" sub="Совещания, поручения" />
              <ArchItem color="green" title="Puls" sub="Портфельный дашборд" />
            </ArchLayer>
            <ArchLayer label="Платформа">
              <ArchItem color="accent" title="AI-Hub — SSO, управление доступами, AI-инструменты, аудит" wide />
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
      title: 'Органическое внедрение',
      text: 'Продукты внедрены без административного давления, без бюджета на change management. Пользователи перешли на инструменты добровольно, потому что они решают реальные задачи.',
      metric: 'Adoption без приказа сверху',
    },
    {
      title: 'Минимальные потери при переводе',
      text: 'Стандартная цепочка: бизнес → аналитик → разработчик. Каждый слой — потеря контекста. Объединение отраслевой экспертизы и технической реализации в одном специалисте исключает потери.',
      metric: 'Точное попадание в потребность',
    },
    {
      title: 'Скорость: от гипотезы до production',
      text: 'Полный цикл R&D: выявление потребности → прототипирование → валидация → промышленная эксплуатация. Средний цикл: 2–3 месяца на продукт.',
      metric: '4 продукта за 1.5 года (solo)',
    },
  ]

  return (
    <section id="value" className="bg-surface py-16">
      <div className="max-w-[1080px] mx-auto px-8">
        <SectionHeader
          tag="Бизнес-ценность"
          tagColor="bg-green-soft text-green"
          title="Ключевые преимущества подхода"
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
  const steps = [
    { num: '01', title: 'Погружение в предметную область', text: 'Не внешнее исследование, а десятилетний опыт внутри отрасли. Карта болей сформирована на основе личной практики.' },
    { num: '02', title: 'Быстрое прототипирование', text: 'AI-augmented development: архитектура → MVP за дни. Минимальный набор функций для проверки гипотезы.' },
    { num: '03', title: 'Валидация через adoption', text: 'Критерий успеха — не метрики, а факт добровольного использования. Продукт предлагается, а не навязывается.' },
    { num: '04', title: 'Итеративное развитие', text: 'Развитие по обратной связи от реальных пользователей. Приоритизация на основе частоты запросов, а не roadmap.' },
  ]

  return (
    <section className="py-16">
      <div className="max-w-[1080px] mx-auto px-8">
        <SectionHeader
          tag="Методология"
          tagColor="bg-purple-soft text-purple"
          title="Подход к разработке продуктов"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
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
          tag="Исследования"
          tagColor="bg-purple-soft text-purple"
          title="Непрерывный R&D"
          subtitle="Систематическое отслеживание и апробация новых технологий. Автоматизированный мониторинг исследований через собственного Telegram-бота с AI-классификацией."
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

/* ── Career Timeline ── */
function Career() {
  const timeline = [
    { date: '2016 – 2017', title: 'МГСУ \u2022 Парк Зарядье', desc: 'Лаборант кафедры строительных материалов. Инженер ПТО: фасады и благоустройство.' },
    { date: '2018 – 2020', title: 'Судебная экспертиза', desc: 'Строительно-технический эксперт. АККУЮ НУКЛЕАР (186 стр.). Технадзор, финансовый аудит.' },
    { date: '2020 – 2021', title: 'ТСК-ТИТУЛ', desc: 'ЖК Discovery (MR Group), Савёловский-сити. 1 200+ квартир. Приёмка ПНР. ЗОС.' },
    { date: '2021 – 2024', title: 'Severin \u2022 FORIVER', desc: 'Инженер → ведущий → зам. РП. 11 корпусов, 1 300 квартир, 20 млрд \u20BD. Координация 20+ чел. ЗОС.' },
    { date: '2024', title: 'Severin \u2022 Качество', desc: 'Стандарты и регламенты. Excel-шаблоны отчётности: 15–20 из 60 проектов компании.' },
    { date: '2024 – н.в.', title: 'Цифровая трансформация', desc: 'Экосистема из 4 продуктов. Стратегия AI-лаборатории. Full-cycle R&D.', active: true },
  ]

  return (
    <section id="career" className="py-16">
      <div className="max-w-[1080px] mx-auto px-8">
        <SectionHeader
          tag="Карьерный путь"
          tagColor="bg-amber-soft text-amber"
          title="От строительной площадки до экосистемы продуктов"
        />
        <div className="timeline-scroll mt-6">
          <div className="flex gap-0 min-w-max relative">
            <div className="absolute top-7 left-0 right-0 h-0.5 bg-border" />
            {timeline.map((t) => (
              <div key={t.date} className="w-[180px] relative pt-12 shrink-0">
                <div
                  className={`absolute top-[22px] left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-accent z-10 ${
                    t.active ? 'bg-accent shadow-[0_0_10px_rgba(79,124,255,0.4)]' : 'bg-bg'
                  }`}
                />
                <div className="bg-surface border border-border rounded-xl p-4 mx-1.5 h-full">
                  <div className="text-[0.68rem] text-accent font-bold mb-1">{t.date}</div>
                  <div className="text-[0.8rem] font-bold mb-0.5 leading-tight">{t.title}</div>
                  <div className="text-[0.72rem] text-muted leading-snug">{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Education block */}
        <div className="mt-8 p-5 bg-surface rounded-xl border border-border flex gap-8 flex-wrap">
          <div>
            <span className="text-[0.72rem] font-bold uppercase text-muted">Образование</span>
            <div className="text-[0.85rem] mt-1">
              <strong>НИУ МГСУ</strong> — Аспирантура (2024), Магистратура (2020), Бакалавриат (2018)
            </div>
          </div>
          <div>
            <span className="text-[0.72rem] font-bold uppercase text-muted">Публикация</span>
            <div className="text-[0.85rem] mt-1">
              «Integrated methodology for environmental risk management...» (2025)
            </div>
          </div>
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
        <h2 className="text-2xl font-bold mb-3">Открыт к диалогу</h2>
        <p className="text-muted text-[0.92rem] mb-8">
          Готов обсудить, как опыт на стыке строительства и технологий
          <br />
          может быть полезен вашей команде цифровизации.
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
