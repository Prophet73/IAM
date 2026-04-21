import React, { useState, useEffect, useCallback, Suspense } from 'react'
import { flushSync } from 'react-dom'
import { products } from './data/products'
import { ProductsEcosystem } from './components/ProductsEcosystem'
import { Reveal } from './components/Reveal'
import { tracker } from './utils/tracker'

const DataBookDemo = React.lazy(() => import('./components/DataBookDemo').then(m => ({ default: m.DataBookDemo })))
const DemoAIHub = React.lazy(() => import('./components/DemoAIHub').then(m => ({ default: m.DemoAIHub })))
const DemoAutoprotocol = React.lazy(() => import('./components/DemoAutoprotocol').then(m => ({ default: m.DemoAutoprotocol })))
const DemoCostManager = React.lazy(() => import('./components/DemoCostManager').then(m => ({ default: m.DemoCostManager })))
const DemoPuls = React.lazy(() => import('./components/DemoPuls').then(m => ({ default: m.DemoPuls })))

function App() {
  useEffect(() => { tracker.init() }, [])

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

/* ── Terminal Easter Egg ── */
function TerminalModal({ onClose }: { onClose: () => void }) {
  const lines = [
    '> Establishing secure connection...',
    '> User detected: Tech Lead / CTO',
    '> Loading stack info...',
    '> Frontend: React 19 + TypeScript + Tailwind v4',
    '> Method: Agentic Workflow',
    '> Manual lines of code: 0',
    '> Built via: Claude Code Orchestration',
    '> Status: Ready for production',
    '',
    '> Спасибо, что дочитали до конца.',
    '> Буду рад пообщаться — на связи!',
  ]

  const fullText = lines.join('\n')
  const [visibleLen, setVisibleLen] = useState(0)
  const done = visibleLen >= fullText.length

  useEffect(() => {
    if (done) return
    const char = fullText[visibleLen]
    const delay = char === '\n' ? 300 : 20 + Math.random() * 15
    const timer = setTimeout(() => setVisibleLen(v => v + 1), delay)
    return () => clearTimeout(timer)
  }, [visibleLen, fullText, done])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape' || e.key === 'Enter') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-xl mx-4 rounded-xl overflow-hidden shadow-2xl demo-modal-enter"
        style={{ background: '#1e1e1e' }}
        onClick={e => e.stopPropagation()}
      >
        {/* macOS title bar */}
        <div className="flex items-center gap-2 px-4 py-3" style={{ background: '#2a2a2a' }}>
          <div className="w-3 h-3 rounded-full bg-[#ff5f57] cursor-pointer" onClick={onClose} />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          <span className="ml-2 text-xs font-mono" style={{ color: '#888' }}>terminal</span>
        </div>
        {/* Terminal content */}
        <div className="p-5 min-h-[240px] font-mono text-sm text-emerald-400 terminal-glow leading-relaxed whitespace-pre-wrap">
          {fullText.slice(0, visibleLen)}
          <span className={`inline-block w-[8px] h-[1.1em] ml-0.5 align-middle bg-emerald-400 ${done ? 'animate-blink' : ''}`} />
        </div>
        {/* Close button */}
        {done && (
          <div className="px-5 pb-5 animate-[fadeIn_0.5s_ease-out_both]">
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-mono hover:bg-emerald-500/20 transition-colors"
            >
              [Enter] Закрыть
            </button>
          </div>
        )}
      </div>
    </div>
  )
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
    const sectionIds = ['hero', 'products', 'approach', 'research', 'career']
    const update = () => {
      if (window.scrollY < 100) {
        setActiveSection('hero')
        return
      }
      let current = 'hero'
      for (const id of sectionIds) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= 100) {
          current = id
        }
      }
      setActiveSection(current)
    }
    window.addEventListener('scroll', update, { passive: true })
    update()
    return () => window.removeEventListener('scroll', update)
  }, [])

  const toggleTheme = useCallback((e: React.MouseEvent) => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    tracker.track('theme_toggle', { to: newTheme })
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
    ['#hero', 'hero', 'Главная'],
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
                  onClick={() => tracker.track('nav_click', { section: id })}
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
  const forCompany = new URLSearchParams(window.location.search).get('for')

  const stats = [
    { num: '4', label: 'продукта в production' },
    { num: '12+', label: 'прототипов за 1.5 года' },
    { num: '7+', label: 'лет в строительстве' },
  ]

  return (
    <section id="hero" className="min-h-screen relative overflow-hidden flex items-center">
      <div
        className="absolute -top-[100px] right-[-200px] w-[700px] h-[700px] pointer-events-none animate-[heroOrb_8s_ease-in-out_infinite] blur-[80px] opacity-70"
        style={{ background: 'radial-gradient(circle at 40% 40%, rgba(196,167,125,0.4), transparent 50%), radial-gradient(circle at 65% 55%, rgba(92,158,120,0.2), transparent 45%), radial-gradient(circle at 35% 65%, rgba(139,123,176,0.18), transparent 50%)' }}
      />

      <div className="w-full pt-14">
        <div className="max-w-[1080px] mx-auto px-8 py-10">
          {/* Верхняя строка: текст + философия */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

            {/* Левая колонка */}
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 glass-panel rounded-full mb-6 animate-blur-fade border-accent/30">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
                </span>
                <span className="uppercase tracking-widest text-[10px] text-accent font-bold">PropTech R&D & Product AI-Engineer</span>
              </div>
              <h1 className="font-display text-[2rem] md:text-[2.5rem] font-extrabold leading-[1.2] mb-5 animate-blur-fade delay-100">
                {forCompany ? (
                  <>
                    <span className="text-text-primary">Продуктовая разработка и цифровизация</span>
                    <br/>
                    <span className="text-accent italic font-serif">для команды {forCompany}</span>
                  </>
                ) : (
                  <>
                    <span className="text-text-primary">Продуктовая разработка и </span>
                    <br/>
                    <span className="text-accent italic font-serif">цифровизация строительства</span>
                  </>
                )}
              </h1>
              <p className="hidden md:block text-[0.95rem] text-text-primary/70 leading-relaxed mb-8 animate-blur-fade delay-200 max-w-[500px]">
                Домен и код в одной голове: 7+ лет в строительстве + продуктовый R&D. От боли процесса до production-решения — без «испорченного телефона» между бизнесом и IT.
              </p>
              <p className="block md:hidden text-[0.95rem] text-text-primary/70 leading-relaxed mb-8 animate-blur-fade delay-200 max-w-[500px]">
                Домен и код в одной голове: 7+ лет в строительстве + продуктовый R&D. От боли процесса до production-решения — без «испорченного телефона» между бизнесом и IT.
              </p>
              {/* CTA кнопки */}
              <div className="flex flex-col sm:flex-row gap-4 animate-blur-fade delay-300">
                <a
                  href="#products"
                  className="inline-flex justify-center items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl text-sm font-semibold no-underline transition-all hover:brightness-110 active:scale-[0.98] shadow-lg shadow-accent/20"
                >
                  Production экосистема
                </a>
                <a
                  href="#research"
                  className="inline-flex justify-center items-center gap-2 px-6 py-3 bg-surface-2 border border-border text-text-primary rounded-xl text-sm font-semibold no-underline transition-colors hover:border-accent/30 hover:text-accent"
                >
                  R&D
                </a>
              </div>
            </div>

            {/* Правая колонка — карточки */}
            <div className="flex flex-col gap-4 justify-center animate-[fadeIn_0.8s_ease-out_0.2s_both]">
              {/* Карточка 1: Знать изнутри */}
              <div className="glass-panel rounded-2xl p-5 flex gap-4">
                <div className="shrink-0 w-10 h-10 rounded-xl bg-accent-soft flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                    <path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="m16 21 4-4-4-4"/><path d="M20 17H4"/>
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-bold mb-1">Domain Expertise</div>
                  <p className="text-[0.85rem] text-muted leading-relaxed">
                    Был по ту сторону процесса. Проектирую автоматизацию по опыту исполнения и организации процесса, а не отрабатываю таски из Jira.
                  </p>
                </div>
              </div>

              {/* Карточка 2: Hands-on */}
              <div className="glass-panel rounded-2xl p-5 flex gap-4">
                <div className="shrink-0 w-10 h-10 rounded-xl bg-green-soft flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green">
                    <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/><line x1="14" y1="4" x2="10" y2="20"/>
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-bold mb-1">Hands-on</div>
                  <p className="text-[0.85rem] text-muted leading-relaxed">
                    Показал пользователю — собрал обратную связь — доработал. Рабочий код вместо презентаций о том, как это будет.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Нижняя строка: статистика */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-10 animate-[fadeIn_0.8s_ease-out_0.4s_both]">
            {stats.map((s) => (
              <div key={s.label} className="glass-panel rounded-2xl p-4 flex items-center gap-3">
                <div className="text-2xl sm:text-3xl font-extrabold font-display leading-none shrink-0 bg-gradient-to-b from-text-primary to-muted bg-clip-text text-transparent">{s.num}</div>
                <div className="text-xs text-muted leading-snug min-w-0">{s.label}</div>
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
    <section id="products" className="bg-surface py-24 border-t border-border/50">
      <div className="max-w-[1280px] mx-auto px-8">
        <Reveal>
          <div className="mb-8">
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-1">Экосистема продуктов</h2>
            <p className="text-muted text-[0.95rem]">Четыре production-решения и R&D прототип на едином инфраструктурном ядре.</p>
          </div>
        </Reveal>
        <Reveal rootMargin="300px 0px">
          <Suspense fallback={<div className="animate-pulse w-full h-32 bg-surface-2/50 border border-border rounded-xl" />}>
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
          </Suspense>
        </Reveal>
      </div>
    </section>
  )
}

/* ── Approach (Methodology + BusinessValue) ── */
function Approach() {
  const steps = [
    { num: '01', title: 'Выявление узких мест', text: 'Снимаю требования напрямую у участников процесса — без цепочки «аналитик → архитектор → разработчик».' },
    { num: '02', title: 'Rapid Prototyping', text: 'За пару недель — месяц — от архитектуры до работающего прототипа. Приоритет — скорость доставки до пользователя, а не идеальная кодовая база.' },
    { num: '03', title: 'Валидация', text: 'Продукт приживается естественным путём. Если MVP не решает реальную задачу ежедневно — гипотеза убивается, не сжигая бюджеты.' },
    { num: '04', title: 'Масштабирование', text: 'Успешный прототип переводится на единую инфраструктуру: SSO, ролевой доступ, переиспользуемые сервисы — без технического долга.' },
  ]

  const cards = [
    {
      num: '01',
      title: 'Time-to-Market: недели, не кварталы',
      text: 'Единая инфраструктура с SSO и переиспользуемыми сервисами — новый продукт стартует с готовой платформы, а не с нуля.',
      metric: 'Единая платформа — масштабируемый фундамент',
    },
    {
      num: '02',
      title: 'Domain Oracle: решения без посредников',
      text: 'Архитектурные решения принимаются на стыке домена и кода — без промежуточных звеньев и потери контекста.',
      metric: 'Минимум согласований — максимум итераций',
    },
    {
      num: '03',
      title: 'Fail Fast: дешёвая проверка гипотез',
      text: 'Нерабочая идея убивается за недели, а не после миллионных вложений. Масштабируется и переводится в production только то, что приносит измеримый результат.',
      metric: 'Без CAPEX и кварталов ожидания',
    },
  ]

  return (
    <section id="approach" className="py-24">
      <div className="max-w-[1080px] mx-auto px-8">

        {/* Methodology */}
        <Reveal>
          <SectionHeader
            tag="Как я делаю продукты"
            tagColor="bg-purple-soft text-purple"
            title="От задачи до рабочего инструмента"
            subtitle="Код перестаёт быть ограничением — им становится разрыв между бизнесом и реализацией. Знание домена позволяет проектировать архитектуру напрямую, без цепочки согласований."
          />
        </Reveal>
        <Reveal stagger>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            {steps.map((s) => (
              <div key={s.num} className="glass-panel rounded-xl p-5 relative overflow-hidden">
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
              <div key={c.title} className="glass-panel rounded-xl p-6 relative overflow-hidden hover:border-green/40 hover:-translate-y-1 transition-all duration-300">
                <div className="absolute -right-4 -bottom-6 text-[8rem] font-extrabold font-display text-text-primary/5 leading-none select-none z-0">{c.num}</div>
                <div className="relative z-10">
                  <h3 className="text-[0.95rem] font-bold mb-1.5">{c.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{c.text}</p>
                  <div className="mt-auto pt-4 border-t border-white/5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-green">
                    <span className="w-1.5 h-1.5 rounded-full bg-green" />
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
      text: 'Agentic Workflows, RAG с гибридным поиском, Structured Output, prompt engineering. Работа с Gemini, Claude, GPT, локальный инференс (Ollama).',
      tags: [{ label: 'MCP Protocol', color: 'bg-purple-soft text-purple' }, { label: 'RAG', color: 'bg-purple-soft text-purple' }, { label: 'Ollama', color: 'bg-purple-soft text-purple' }],
    },
    {
      title: 'Speech & NLP',
      text: 'Транскрипция, диаризация, анализ эмоций (WhisperX, pyannote, wav2vec2). Обработка аудио совещаний и генерация структурированных отчётов и аналитики.',
      tags: [{ label: 'WhisperX', color: 'bg-green-soft text-green' }, { label: 'pyannote', color: 'bg-green-soft text-green' }, { label: 'NLP', color: 'bg-green-soft text-green' }],
    },
    {
      title: 'Аспирантура и системный подход',
      text: '10 лет академического образования в МГСУ, что даёт навык структурировать сложную задачу, работать с данными и строить модели — фундамент для R&D в прикладных условиях.',
      tags: [{ label: 'МГСУ', color: 'bg-amber-soft text-amber' }, { label: 'Системотехника', color: 'bg-amber-soft text-amber' }, { label: 'Мат. моделирование', color: 'bg-amber-soft text-amber' }],
    },
    {
      title: 'AI-ассистированная разработка',
      text: 'Глубокая интеграция LLM-агентов (Copilot, Claude Code) в процесс разработки. AI берёт на себя рутину, я фокусируюсь на архитектуре и бизнес-логике.',
      tags: [{ label: 'Cursor', color: 'bg-red-soft text-red' }, { label: 'Claude Code', color: 'bg-red-soft text-red' }, { label: 'Agentic dev', color: 'bg-red-soft text-red' }],
    },
  ]

  return (
    <section id="research" className="bg-surface py-24">
      <div className="max-w-[1080px] mx-auto px-8">
        <Reveal>
          <SectionHeader
            tag="R&D"
            tagColor="bg-purple-soft text-purple"
            title="Чем интересуюсь и что изучаю"
            subtitle=""
          />
        </Reveal>
        <Reveal stagger>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
            {items.map((item) => {
              return (
                <div key={item.title} className="glass-panel rounded-xl p-5 flex flex-col transition-colors hover:border-accent/20">
                  <h4 className="text-sm font-bold mb-1">{item.title}</h4>
                  <p className="text-sm text-muted leading-relaxed">{item.text}</p>
                  <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
                    {item.tags.map((t) => (
                      <span key={t.label} className={`px-1.5 py-0.5 rounded text-xs font-semibold ${t.color}`}>
                        {t.label}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </Reveal>

        {/* Experiments */}
        <Reveal>
          <div className="mt-14 mb-6 pt-14 border-t border-border">
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
    { date: '2024–н.в.', role: 'Департамент цифровой трансформации', place: 'Severin Development', desc: '4 продукта в production, ~10 прототипов. Full-cycle R&D — от идеи до внедрения', active: true },
    { date: '2024', role: 'Руководитель группы СК / Департамент качества', place: 'Severin Development', desc: 'Координация 20+ инженеров. Регламенты, шаблоны для проектных команд' },
    { date: '2021–2024', role: 'Инженер → ведущий инженер СК', place: 'Severin Development', desc: 'ЖК FORIVER (InGrad/Sminex) — 11 корпусов, 3 года на объекте, получение ЗОС' },
    { date: '2020–2021', role: 'Инженер СК', place: 'ТСК-ТИТУЛ', desc: 'Приёмка работ, проверка КС-2, накопительные. ЖК Discovery (MR Group), Савёловский-сити' },
    { date: '2018–2020', role: 'Строительно-технический эксперт', place: 'Судебная экспертиза', desc: 'Экспертиза и финансово-технический аудит. АО АККУЮ НУКЛЕАР, ВЦ «Павловопосадские платки»' },
    { date: '2016–2017', role: 'Инженер ПТО', place: 'МГСУ \u2022 Парк Зарядье', desc: 'Исполнительная документация, фасады и благоустройство' },
  ]

  const edu = [
    { date: '2021–2025', text: 'Аспирантура, ЭБСиГХ' },
    { date: '2018–2020', text: 'Магистратура, ПГС' },
    { date: '2014–2018', text: 'Бакалавриат, ПГС' },
  ]

  return (
    <section id="career" className="py-24">
      <div className="max-w-[1080px] mx-auto px-8">
        <Reveal>
          <SectionHeader
            tag="Опыт"
            tagColor="bg-amber-soft text-amber"
            title="Строительство и цифровизация"
            subtitle="7+ лет в строительной отрасли. Последние 1.5 года — продуктовая разработка полного цикла."
          />
        </Reveal>
        <div>
          {timeline.map((t, i) => (
            <div key={t.date} className="group flex gap-4 items-stretch">
              <div className="w-[76px] shrink-0 text-right pt-0.5">
                <div className="text-xs font-semibold text-accent leading-tight">{t.date}</div>
              </div>
              <div className="flex flex-col items-center shrink-0">
                <div className={`w-2 h-2 rounded-full border-2 border-accent mt-1 ${t.active ? 'bg-accent' : 'bg-bg'}`} />
                {i < timeline.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
              </div>
              <div className={`relative rounded-xl px-3 py-1.5 -ml-1 transition-colors duration-300 hover:bg-surface-2/50 ${i < timeline.length - 1 ? 'pb-3' : 'pb-0'}`}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden rounded-xl">
                  <span className="absolute -right-2 top-1/2 -translate-y-1/2 text-[3.5rem] font-extrabold text-accent/[0.04] leading-none select-none whitespace-nowrap">{t.place.split(' ')[0]}</span>
                </div>
                <div className="relative z-10">
                  <div className="text-sm font-semibold leading-tight">{t.role}</div>
                  <div className="text-xs text-accent/60 font-medium">{t.place}</div>
                  <div className="text-xs text-muted leading-snug mt-0.5">{t.desc}</div>
                </div>
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
  const forCompany = new URLSearchParams(window.location.search).get('for')
  const [terminalOpen, setTerminalOpen] = useState(false)

  return (
    <section className="py-20 pb-10">
      <div className="max-w-3xl mx-auto px-8 text-center">
        <Reveal>
          {/* Heading */}
          <h2 className="font-display text-3xl md:text-4xl font-extrabold mb-5">
            {forCompany ? `Обсудить цифровизацию ${forCompany}` : 'Обсудить сотрудничество'}
          </h2>

          {/* Subtitle */}
          <p className="text-muted text-lg leading-relaxed max-w-2xl mx-auto">
            Есть процесс, который давно просится автоматизироваться? Нужен R&D-партнёр с пониманием стройки изнутри? Или просто хочется обсудить цифровизацию в отрасли — пишите в Telegram.
          </p>

          {/* Action */}
          <div className="flex justify-center mt-10">
            <a
              href="https://t.me/nickkhromenok"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => tracker.track('contact_click', { channel: 'telegram' })}
              className="inline-flex items-center justify-center gap-2.5 bg-accent text-white px-8 py-4 rounded-xl text-sm font-semibold no-underline transition-all hover:brightness-110 active:scale-[0.98] shadow-lg shadow-accent/20"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
              Написать напрямую в Telegram
            </a>
          </div>

          {/* Email & Phone links */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-6">
            <a
              href="mailto:KhromenokNV@mail.ru"
              onClick={() => tracker.track('contact_click', { channel: 'email' })}
              className="inline-flex items-center gap-2 text-sm text-muted hover:text-text-primary transition-colors no-underline"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
              </svg>
              KhromenokNV@mail.ru
            </a>
            <a
              href="tel:+79268973225"
              onClick={() => tracker.track('contact_click', { channel: 'phone' })}
              className="inline-flex items-center gap-2 text-sm text-muted hover:text-text-primary transition-colors no-underline"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              +7 926 897-32-25
            </a>
          </div>
        </Reveal>
      </div>

      {/* Footer */}
      <div className="max-w-[1080px] mx-auto px-8 mt-20 pt-6 border-t border-white/10 pb-10">
        <div className="flex justify-between items-center text-xs text-muted">
          <span>Москва, 2026</span>
          <span
            onClick={() => { setTerminalOpen(true); tracker.track('terminal_open') }}
            className="cursor-pointer hover:text-emerald-400 transition-colors duration-300 select-none"
          >
            Built with AI (Claude Code & React)
          </span>
        </div>
      </div>
      {terminalOpen && <TerminalModal onClose={() => setTerminalOpen(false)} />}
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
      <div className={`inline-block px-3 py-1 rounded text-xs font-bold tracking-wider uppercase mb-3 ${tagColor}`}>
        {tag}
      </div>
      <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">{title}</h2>
      {subtitle && <p className="text-muted text-[0.95rem] max-w-[620px]">{subtitle}</p>}
    </div>
  )
}

export default App
