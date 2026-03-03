import { useState, useEffect, useCallback } from 'react'
import { flushSync } from 'react-dom'
import { products } from './data/products'
import { ProductsEcosystem } from './components/ProductsEcosystem'
import { Reveal } from './components/Reveal'
import { DataBookDemo } from './components/DataBookDemo'
import { DemoAIHub } from './components/DemoAIHub'
import { DemoAutoprotocol } from './components/DemoAutoprotocol'
import { DemoCostManager } from './components/DemoCostManager'
import { DemoPuls } from './components/DemoPuls'

function App() {
  return (
    <>
      <Nav />
      <Hero />
      <Products />
      <Approach />
      <Research />
      <Career />
      <Contact />
    </>
  )
}

/* ── Scroll Progress ── */
function ScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const update = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      setProgress(docHeight > 0 ? scrollTop / docHeight : 0)
    }
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  return <div className="scroll-progress" style={{ width: `${progress * 100}%` }} />
}

/* ── Navigation ── */
function Nav() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'light' || saved === 'dark') return saved
    if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'light'
    return 'dark'
  })
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('')

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light')
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const sections = document.querySelectorAll('section[id]')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { threshold: 0.3, rootMargin: '-80px 0px -40% 0px' },
    )
    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  const toggleTheme = useCallback((e: React.MouseEvent) => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    const x = e.clientX
    const y = e.clientY
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    )

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const doc = document as any
    if (!doc.startViewTransition) {
      setTheme(newTheme)
      return
    }

    const transition = doc.startViewTransition(() => {
      flushSync(() => setTheme(newTheme))
    })

    transition.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`] },
        { duration: 600, easing: 'ease-in-out', pseudoElement: '::view-transition-new(root)' },
      )
    })
  }, [theme])

  const navLinks = [
    ['#products', 'products', 'Продукты'],
    ['#approach', 'approach', 'Подход'],
    ['#research', 'research', 'R&D'],
    ['#career', 'career', 'Опыт'],
  ]

  return (
    <>
      <ScrollProgress />
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'py-3 backdrop-blur-xl bg-bg/90 shadow-sm border-b border-border' : 'py-5 bg-transparent'}`}>
        <div className="max-w-[1080px] mx-auto px-8 flex justify-between items-center">
          <div className="font-display font-bold text-[0.95rem]">Никита Хроменок</div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex bg-surface-2/50 p-1 rounded-xl border border-border/50">
              {navLinks.map(([href, id, label]) => (
                <a
                  key={href}
                  href={href}
                  className={`text-sm font-medium transition-all duration-200 no-underline px-3 py-1.5 rounded-lg ${activeSection === id ? 'bg-surface text-accent shadow-sm' : 'text-muted hover:text-text-primary'}`}
                >
                  {label}
                </a>
              ))}
            </div>
            <button
              onClick={toggleTheme}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-2 border border-border text-muted hover:text-text-primary transition-colors cursor-pointer"
              aria-label="Переключить тему"
            >
              {theme === 'dark' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>
    </>
  )
}

/* ── Hero ── */
function Hero() {
  const stats = [
    { num: '4', label: 'продукта в production' },
    { num: '12+', label: 'прототипов за 1.5 года' },
    { num: '10+', label: 'лет в строительстве' },
  ]

  return (
    <section className="min-h-screen relative overflow-hidden flex items-center">
      <div className="absolute -top-[100px] right-[-200px] w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(79,124,255,0.08)_0%,transparent_70%)] pointer-events-none animate-[heroOrb_8s_ease-in-out_infinite]" />

      <div className="w-full pt-14">
        <div className="max-w-[1080px] mx-auto px-8 py-10">
          {/* Верхняя строка: текст + философия */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

            {/* Левая колонка */}
            <div className="animate-[fadeIn_0.8s_ease-out_both]">
              <div className="inline-block px-3 py-1 bg-accent-soft text-accent rounded-full text-xs font-semibold tracking-widest uppercase mb-6">
                От процесса к продукту
              </div>
              <h1 className="font-display text-[2rem] md:text-[2.5rem] font-extrabold leading-[1.2] mb-5">
                <span className="bg-gradient-to-br from-text-primary to-text-primary/80 bg-clip-text text-transparent">Продуктовая разработка и </span>
                <span className="bg-gradient-to-r from-accent to-purple bg-clip-text text-transparent">цифровизация строительства</span>
              </h1>
              <p className="text-[0.95rem] text-text-primary/70 leading-relaxed mb-6">
                Совмещаю инженерный опыт в строительстве с full-stack разработкой.
                Создаю инструменты, которые закрывают боли отрасли — от выдачи замечаний
                до анализа смет и стенограмм совещаний.
              </p>
              {/* CTA кнопки */}
              <div className="flex flex-wrap gap-3">
                <a
                  href="#products"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold no-underline transition-all hover:brightness-110 hover:shadow-lg hover:shadow-accent/20"
                >
                  Экосистема продуктов
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </a>
                <a
                  href="#research"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-surface-2 border border-border text-text-primary rounded-xl text-sm font-semibold no-underline transition-colors hover:border-accent/30 hover:text-accent"
                >
                  R&D подход
                </a>
              </div>
            </div>

            {/* Правая колонка — карточки */}
            <div className="flex flex-col gap-4 justify-center animate-[fadeIn_0.8s_ease-out_0.2s_both]">
              {/* Карточка 1: Знать изнутри */}
              <div className="bg-surface/50 backdrop-blur-sm border border-border rounded-2xl p-5 flex gap-4">
                <div className="shrink-0 w-10 h-10 rounded-xl bg-accent-soft flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-bold mb-1">Знать изнутри</div>
                  <p className="text-[0.85rem] text-muted leading-relaxed">
                    Предвидеть узкие места задолго до дедлайна. Проектировать то, что нужно
                    на площадке, — а не то, что описал аналитик в брифе.
                  </p>
                </div>
              </div>

              {/* Карточка 2: Hands-on */}
              <div className="bg-surface/50 backdrop-blur-sm border border-border rounded-2xl p-5 flex gap-4">
                <div className="shrink-0 w-10 h-10 rounded-xl bg-green-soft flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green">
                    <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-bold mb-1">Hands-on</div>
                  <p className="text-[0.85rem] text-muted leading-relaxed">
                    Быстро собрать работающий прототип и показать пользователям. Рабочий прототип
                    становится живым ТЗ, устраняя потерю смысла при передаче от бизнеса к разработке.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Нижняя строка: статистика */}
          <div className="grid grid-cols-3 gap-3 mt-10 animate-[fadeIn_0.8s_ease-out_0.4s_both]">
            {stats.map((s) => (
              <div key={s.label} className="bg-surface/50 backdrop-blur-sm border border-border rounded-2xl p-4 flex items-center gap-4">
                <div className="text-2xl font-extrabold text-accent font-display leading-none shrink-0">{s.num}</div>
                <div className="text-xs text-muted leading-snug">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}


/* ── Products ── */
function Products() {
  return (
    <section id="products" className="bg-surface py-14 border-t border-border/50">
      <div className="max-w-[1280px] mx-auto px-8">
        <Reveal>
          <div className="mb-8">
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-1">Экосистема продуктов</h2>
            <p className="text-muted text-[0.95rem]">Четыре production-решения и R&D прототип на едином инфраструктурном ядре.</p>
          </div>
        </Reveal>
        <Reveal>
          <ProductsEcosystem
            products={products}
            demos={{
              aihub:        <DemoAIHub />,
              databook:     <DataBookDemo />,
              autoprotocol: <DemoAutoprotocol />,
              costmanager:  <DemoCostManager />,
              puls:         <DemoPuls />,
            }}
          />
        </Reveal>
      </div>
    </section>
  )
}

/* ── Approach (Methodology + BusinessValue) ── */
function Approach() {
  const steps = [
    { num: '01', title: 'Выявление узких мест', text: 'Выхожу с ноутбуком на площадку. Бизнес-боль — из уст инженера СК, не из брифа.' },
    { num: '02', title: 'Сборка MVP', text: 'За неделю — от мокапа до рабочего инструмента у пользователей.' },
    { num: '03', title: 'Валидация', text: 'Инженеры начинают пользоваться каждый день — без давления руководства.' },
    { num: '04', title: 'Масштабирование', text: 'Рабочая гипотеза переезжает на единое ядро AI-Hub с готовой авторизацией и RBAC.' },
  ]

  const cards = [
    {
      num: '01',
      title: 'Единая инфраструктура',
      text: (
        <>
          Не пложу зоопарк систем. Все продукты заведены под{' '}
          <span className="text-text-primary font-semibold">единую точку входа (AI-Hub)</span>{' '}
          с корпоративной авторизацией (SSO/ADFS). Общие паттерны и единая база пользователей
          позволяют не писать бэкенд с нуля для каждой новой идеи.
        </>
      ),
      metric: 'Снижение Time-to-Market до недель',
    },
    {
      num: '02',
      title: 'Прямой контакт с реальностью',
      text: (
        <>
          Убираю эффект «испорченного телефона». Цепочка «бизнес → аналитик → разработчик»
          теряет контекст и добавляет месяцы. Знаю стройку изнутри и пишу код — исключаю
          промежуточное звено и делаю продукты,{' '}
          <span className="text-text-primary font-semibold">которые работают с первого дня.</span>
        </>
      ),
      metric: 'Organic adoption без админ. ресурса',
    },
    {
      num: '03',
      title: 'Быстрый цикл проверки',
      text: (
        <>
          От проблемы на площадке до рабочего MVP —{' '}
          <span className="text-text-primary font-semibold">недели, а не кварталы.</span>{' '}
          Выделяю суть бизнес-требования, быстро собираю работающий инструмент и сразу отдаю
          в поля. Продукт выживает только если инженеры начинают им пользоваться каждый день.
        </>
      ),
      metric: '4 продукта в production за 1.5 года',
    },
  ]

  return (
    <section id="approach" className="py-16">
      <div className="max-w-[1080px] mx-auto px-8">

        {/* Methodology */}
        <Reveal>
          <SectionHeader
            tag="Как я делаю продукты"
            tagColor="bg-purple-soft text-purple"
            title="От задачи на площадке до рабочего инструмента"
            subtitle="Техническая реализация перестаёт быть ограничением. Ключевой дефицит — понимание предметной области."
          />
        </Reveal>
        <Reveal stagger>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            {steps.map((s) => (
              <div key={s.num} className="bg-surface-2/40 backdrop-blur-sm border border-border/60 rounded-xl p-5 relative overflow-hidden">
                <div className="absolute -bottom-2 -right-2 text-6xl font-extrabold font-display text-text-primary opacity-5 select-none">{s.num}</div>
                <div className="relative z-10">
                  <h4 className="text-sm font-bold mb-1.5">{s.title}</h4>
                  <p className="text-sm text-muted leading-relaxed">{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Business Value */}
        <Reveal>
          <SectionHeader
            tag="Почему это работает"
            tagColor="bg-green-soft text-green"
            title="Что даёт совмещение отрасли и разработки"
          />
        </Reveal>
        <Reveal stagger>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {cards.map((c) => (
              <div key={c.title} className="bg-surface-2/50 backdrop-blur-sm border border-border/60 rounded-xl p-6 relative overflow-hidden hover:border-green/40 hover:-translate-y-1 transition-all duration-300">
                <div className="absolute -right-4 -bottom-6 text-[8rem] font-extrabold font-display text-text-primary/5 leading-none select-none z-0">{c.num}</div>
                <div className="relative z-10">
                  <h3 className="text-[0.95rem] font-bold mb-1.5">{c.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{c.text}</p>
                  <div className="mt-3 pt-3 border-t border-border text-sm text-green font-semibold">
                    {c.metric}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

      </div>
    </section>
  )
}

/* ── Research (R&D + Experiments) ── */
function Research() {
  const experiments = [
    { desc: 'RAG-консультант по строительным нормам с гибридным поиском', tags: ['RAG', 'Gemini', 'Embeddings'] },
    { desc: 'Автоклассификация элементов BIM-моделей через LLM', tags: ['Ollama', 'IFC', 'ML'] },
    { desc: 'AI-сравнение версий PDF-документации с визуализацией', tags: ['PyMuPDF', 'Gemini', 'PDF.js'] },
    { desc: 'Автоматический анализ стенограмм совещаний из СЭД', tags: ['Gemini', 'API', 'Pydantic'] },
    { desc: 'Real-time перевод аудио на совещаниях', tags: ['Whisper', 'WebSocket', 'Gemini'] },
    { desc: 'Голосовой ассистент с распознаванием и синтезом речи', tags: ['STT', 'TTS', 'Gemini'] },
    { desc: 'Парсинг и структурирование данных из реестров экспертизы', tags: ['Python', 'BeautifulSoup'] },
    { desc: 'Программная генерация документов по корпоративному брендбуку', tags: ['python-docx'] },
    { desc: 'AI-ассистент по документации бизнес-процессов', tags: ['RAG', 'BM25', 'ChromaDB'] },
  ]

  const items = [
    {
      title: 'LLM и AI-агенты',
      text: 'Архитектуры автономных агентов, RAG-системы, prompt engineering, structured output. Работа с Gemini, Claude, GPT, Ollama, локальным инференсом на GPU.',
      tags: [{ label: 'LangChain', color: 'bg-purple-soft text-purple' }, { label: 'MCP Protocol', color: 'bg-purple-soft text-purple' }, { label: 'RAG', color: 'bg-purple-soft text-purple' }, { label: 'Ollama', color: 'bg-purple-soft text-purple' }],
    },
    {
      title: 'Speech & NLP',
      text: 'Транскрипция, диаризация, анализ эмоций. WhisperX, pyannote, wav2vec2. Real-time перевод совещаний и анализ стенограмм из СЭД.',
      tags: [{ label: 'WhisperX', color: 'bg-green-soft text-green' }, { label: 'pyannote', color: 'bg-green-soft text-green' }, { label: 'NLP', color: 'bg-green-soft text-green' }],
    },
    {
      title: 'Аспирантура и системный подход',
      text: 'Аспирантура МГСУ (ЭБСиГХ). Академический навык структурировать сложную задачу, работать с данными и строить модели — фундамент для R&D в прикладных условиях.',
      tags: [{ label: 'МГСУ', color: 'bg-amber-soft text-amber' }, { label: 'Системотехника', color: 'bg-amber-soft text-amber' }, { label: 'Мат. моделирование', color: 'bg-amber-soft text-amber' }],
    },
    {
      title: 'AI-ассистированная разработка',
      text: 'Системная работа с Cursor и Claude Code. Архитектурное проектирование + AI-генерация. Многоагентные workflow для масштабных задач.',
      tags: [{ label: 'Cursor', color: 'bg-red-soft text-red' }, { label: 'Claude Code', color: 'bg-red-soft text-red' }, { label: 'Agentic dev', color: 'bg-red-soft text-red' }],
    },
  ]

  return (
    <section id="research" className="bg-surface py-16">
      <div className="max-w-[1080px] mx-auto px-8">
        <Reveal>
          <SectionHeader
            tag="R&D"
            tagColor="bg-purple-soft text-purple"
            title="Чем интересуюсь и что изучаю"
            subtitle="Слежу за технологиями системно: собственный Telegram-бот с AI-классификацией мониторит новые исследования."
          />
        </Reveal>
        <Reveal stagger>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
            {items.map((item) => (
              <div key={item.title} className="bg-bg border border-border rounded-xl p-5 transition-colors hover:border-accent/20">
                <h4 className="text-sm font-bold mb-1">{item.title}</h4>
                <p className="text-sm text-muted leading-relaxed">{item.text}</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {item.tags.map((t) => (
                    <span key={t.label} className={`px-1.5 py-0.5 rounded text-xs font-semibold ${t.color}`}>
                      {t.label}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Experiments */}
        <Reveal>
          <div className="mt-14 mb-6 pt-14 border-t border-border">
            <div className="inline-block px-3 py-1 rounded text-xs font-bold tracking-wider uppercase mb-3 bg-purple-soft text-purple">
              Эксперименты
            </div>
            <h3 className="font-display text-xl md:text-2xl font-bold mb-1">Прототипы и эксперименты</h3>
            <p className="text-sm text-muted">Каждый production-продукт вырос из серии экспериментов. Ниже — задачи, которые решались на пути.</p>
          </div>
        </Reveal>
        <Reveal stagger>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {experiments.map((e, i) => (
              <div key={i} className="bg-surface-2 border border-border rounded-lg px-4 py-3 flex flex-col gap-1.5 transition-colors hover:border-accent/20">
                <div className="text-sm text-text-primary leading-snug">{e.desc}</div>
                <div className="flex flex-wrap gap-1 mt-auto">
                  {e.tags.map((t) => (
                    <span key={t} className="px-1.5 py-0.5 rounded text-xs font-medium bg-surface-3 text-muted">{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}


/* ── Career ── */
function Career() {
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
    <section id="career" className="py-16">
      <div className="max-w-[1080px] mx-auto px-8">
        <Reveal>
          <SectionHeader
            tag="Опыт"
            tagColor="bg-amber-soft text-amber"
            title="Строительство и цифровизация"
            subtitle="10 лет на объектах. Последние два — full-cycle разработка продуктов."
          />
        </Reveal>
        <div>
          {timeline.map((t, i) => (
            <div key={t.date} className="flex gap-4 items-stretch">
              <div className="w-[76px] shrink-0 text-right pt-0.5">
                <div className="text-xs font-semibold text-accent leading-tight">{t.date}</div>
              </div>
              <div className="flex flex-col items-center shrink-0">
                <div className={`w-2 h-2 rounded-full border-2 border-accent mt-1 ${t.active ? 'bg-accent' : 'bg-bg'}`} />
                {i < timeline.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
              </div>
              <div className={`${i < timeline.length - 1 ? 'pb-3' : 'pb-0'}`}>
                <div className="text-sm font-semibold leading-tight">{t.role}</div>
                <div className="text-xs text-accent/60 font-medium">{t.place}</div>
                <div className="text-xs text-muted leading-snug mt-0.5">{t.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-border flex flex-wrap items-center gap-x-6 gap-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-muted">НИУ МГСУ</span>
          {edu.map((e) => (
            <div key={e.date} className="text-xs">
              <span className="text-accent font-semibold">{e.date}</span>
              <span className="text-muted ml-1.5">{e.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}


/* ── Contact / Footer ── */
function Contact() {
  return (
    <footer className="border-t border-border py-12">
      <div className="max-w-[1080px] mx-auto px-8">
        <Reveal>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 items-start">
            <div>
              <h2 className="font-display text-xl md:text-2xl font-bold mb-2">Давайте поговорим</h2>
              <p className="text-muted text-sm mb-5 max-w-[440px]">
                Ищу позицию, где строительная экспертиза + full-stack = готовый продукт.
                Продуктовая разработка или внутреннее R&D с реальными пользователями в строительстве.
              </p>
              <div className="flex flex-col gap-2.5">
                <a
                  href="tel:+79268973225"
                  className="inline-flex items-center gap-3 text-sm text-muted hover:text-accent transition-colors no-underline group"
                >
                  <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-2 border border-border group-hover:border-accent/30 transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                  </span>
                  +7 (926) 897-32-25
                </a>
                <a
                  href="mailto:KhromenokNV@mail.ru"
                  className="inline-flex items-center gap-3 text-sm text-muted hover:text-accent transition-colors no-underline group"
                >
                  <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-2 border border-border group-hover:border-accent/30 transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </span>
                  KhromenokNV@mail.ru
                </a>
              </div>
            </div>
            <div className="text-sm text-muted md:text-right">
              <div>Москва</div>
              <div className="mt-1">&copy; 2026</div>
            </div>
          </div>
        </Reveal>
      </div>
    </footer>
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
      <div className={`inline-block px-3 py-1 rounded text-xs font-bold tracking-wider uppercase mb-3 ${tagColor}`}>
        {tag}
      </div>
      <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">{title}</h2>
      {subtitle && <p className="text-muted text-[0.95rem] max-w-[620px]">{subtitle}</p>}
    </div>
  )
}

export default App
