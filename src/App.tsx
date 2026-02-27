import { useState, useEffect, useCallback } from 'react'
import { flushSync } from 'react-dom'
import { products } from './data/products'
import { ProductCard } from './components/ProductCard'
import { Reveal } from './components/Reveal'
import { DataBookDemo } from './components/DataBookDemo'
import { DemoAIHub } from './components/DemoAIHub'
import { DemoAutoprotocol } from './components/DemoAutoprotocol'
import { DemoCostManager } from './components/DemoCostManager'

function App() {
  return (
    <>
      <Nav />
      <Hero />
      <Philosophy />
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
    ['#competence', 'competence', 'Опыт'],
    ['#products', 'products', 'Продукты'],
    ['#architecture', 'architecture', 'Архитектура'],
    ['#value', 'value', 'Подход'],
    ['#research', 'research', 'R&D'],
  ]

  return (
    <>
      <ScrollProgress />
      <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b border-border py-3 transition-all duration-300 ${scrolled ? 'bg-bg/95 shadow-sm' : 'bg-bg/85'}`}>
        <div className="max-w-[1080px] mx-auto px-8 flex justify-between items-center">
          <div className="font-display font-bold text-[0.95rem]">Никита Хроменок</div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex gap-6">
              {navLinks.map(([href, id, label]) => (
                <a
                  key={href}
                  href={href}
                  className={`text-sm font-medium transition-colors no-underline ${activeSection === id ? 'text-accent' : 'text-muted hover:text-text-primary'}`}
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
    { num: '10 лет', label: 'в строительстве' },
    { num: '15+', label: 'проектов за 1.5 года' },
    { num: 'МГСУ', label: 'аспирантура' },
  ]

  return (
    <section className="pt-28 pb-10 relative overflow-hidden">
      <div className="absolute -top-[100px] right-[-200px] w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(79,124,255,0.08)_0%,transparent_70%)] pointer-events-none animate-[heroOrb_8s_ease-in-out_infinite]" />
      <div className="max-w-[1080px] mx-auto px-8 relative">
        <div className="inline-block px-4 py-1.5 bg-accent-soft text-accent rounded-full text-sm font-semibold tracking-wide mb-6">
          От процесса к продукту
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-extrabold leading-[1.15] mb-4 bg-gradient-to-br from-text-primary to-accent bg-clip-text text-transparent max-w-[720px]">
          Знаю стройку изнутри — делаю инструменты для бизнеса, которых нет на рынке
        </h1>
        <p className="text-base text-muted max-w-[580px] mb-8 leading-relaxed">
          10 лет в строительном контроле — понимаю отрасль изнутри, не по описанию.
          Нужных инструментов не было, написал сам: 4 продукта в production и 12+ прототипов
          за полтора года, в одиночку и без ТЗ сверху.
        </p>
        <div className="w-12 h-px bg-border mb-6" />
        <div className="flex items-center gap-2 text-sm text-muted">
          {stats.map((s, i) => (
            <span key={s.label} className="contents">
              {i > 0 && <span className="text-border mx-1">·</span>}
              <span><span className="text-accent font-bold">{s.num}</span> {s.label}</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Philosophy ── */
function Philosophy() {
  const items = [
    {
      num: '01',
      text: 'Строительный контроль не прощает теорий: конструкция либо стоит, либо нет. Этот принцип я перенёс в разработку.',
    },
    {
      num: '02',
      text: 'Я не разделяю «придумать» и «построить». Когда понимаешь каждый уровень системы — решения получаются другими.',
    },
    {
      num: '03',
      text: 'Ищу роль с настоящей ответственностью за результат: R&D, продукт или их пересечение — там где делают, а не координируют.',
    },
  ]

  return (
    <section className="py-12 border-b border-border">
      <div className="max-w-[1080px] mx-auto px-8">
        <Reveal stagger className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {items.map((item) => (
            <div key={item.num} className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-px bg-accent/60" />
                <span className="text-xs font-bold tracking-widest text-accent/50 font-display">{item.num}</span>
              </div>
              <p className="text-[0.95rem] leading-relaxed text-text-primary">{item.text}</p>
            </div>
          ))}
        </Reveal>
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
        <Reveal>
        <div className="bg-surface border border-border rounded-2xl p-6 md:p-8">
          <div className="flex items-start justify-between mb-5">
            <h2 className="font-display text-xl md:text-2xl font-bold">Карьерный трек</h2>
            <span className="px-3 py-1 rounded text-xs font-bold tracking-wider uppercase bg-green-soft text-green shrink-0 ml-4">Опыт</span>
          </div>

          {/* Timeline */}
          <div className="space-y-0">
            {timeline.map((t, i) => (
              <div key={t.date} className="flex gap-4 items-stretch">
                <div className="w-[80px] shrink-0 text-right">
                  <div className="text-xs font-bold text-accent pt-0.5 leading-tight">{t.date}</div>
                </div>
                <div className="flex flex-col items-center shrink-0">
                  <div className={`w-2.5 h-2.5 rounded-full border-2 border-accent mt-1.5 ${t.active ? 'bg-accent animate-[pulseGlow_2s_ease-in-out_infinite]' : 'bg-bg'}`} />
                  {i < timeline.length - 1 && <div className="w-px flex-1 bg-border" />}
                </div>
                <div className="pb-4">
                  <div className="text-sm font-semibold leading-tight">{t.role}</div>
                  <div className="text-xs text-accent/70 font-medium">{t.place}</div>
                  <div className="text-sm text-muted leading-snug mt-0.5">{t.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Education */}
          <div className="mt-4 pt-4 border-t border-border">
            <span className="text-xs font-bold uppercase text-muted">Образование — НИУ МГСУ</span>
            <div className="flex gap-6 mt-2 flex-wrap">
              {edu.map((e) => (
                <div key={e.date} className="text-sm">
                  <span className="text-accent font-bold text-xs">{e.date}</span>
                  <span className="text-muted ml-1.5">{e.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ── Products ── */
function Products() {
  return (
    <section id="products" className="bg-surface py-16">
      <div className="max-w-[1080px] mx-auto px-8">
        <Reveal>
          <div className="mb-8">
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">Продукты</h2>
            <p className="text-muted text-[0.95rem]">Четыре инструмента, написанных с нуля под реальные задачи строительного бизнеса.</p>
          </div>
        </Reveal>
        <Reveal stagger>
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              demo={p.id === 'aihub' ? <DemoAIHub /> : p.id === 'databook' ? <DataBookDemo /> : p.id === 'autoprotocol' ? <DemoAutoprotocol /> : p.id === 'costmanager' ? <DemoCostManager /> : undefined}
            />
          ))}
        </Reveal>
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
        <Reveal>
          <div className="mb-6">
            <div className="inline-block px-3 py-1 rounded text-xs font-bold tracking-wider uppercase mb-3 bg-purple-soft text-purple">
              Эксперименты
            </div>
            <h2 className="font-display text-xl md:text-2xl font-bold mb-1">Прототипы и эксперименты</h2>
            <p className="text-sm text-muted">Каждый production-продукт вырос из серии экспериментов. Ниже — задачи, которые решались на пути.</p>
          </div>
        </Reveal>
        <Reveal stagger>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {experiments.map((e, i) => (
              <div key={i} className="bg-surface border border-border rounded-lg px-4 py-3 flex flex-col gap-1.5 transition-colors hover:border-accent/20">
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

/* ── Architecture ── */
function Architecture() {
  return (
    <section id="architecture" className="py-16">
      <div className="max-w-[1080px] mx-auto px-8">
        <Reveal>
          <SectionHeader
            tag="Архитектура"
            tagColor="bg-cyan-soft text-cyan"
            title="Как это устроено под капотом"
            subtitle="Общая авторизация, общие данные, общий AI-слой. Всё крутится на одной инфраструктуре."
          />
        </Reveal>

        {/* Technical landscape */}
        <Reveal>
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
        </Reveal>

      </div>
    </section>
  )
}

/* ── Business Value ── */
function BusinessValue() {
  const cards = [
    {
      num: '01',
      title: 'Без посредников',
      text: 'Обычная цепочка: бизнес → аналитик → разработчик. На каждом шаге теряется контекст. Когда сам знаешь предметку и сам пишешь код — попадание в потребность точнее.',
      metric: 'Нулевая потеря контекста',
    },
    {
      num: '02',
      title: 'Люди пришли сами',
      text: 'Ни один продукт не внедрялся приказом сверху. DataBook сделал год назад и забыл — а инженеры пользуются каждый день. Это лучшая валидация.',
      metric: 'Adoption без бюджета',
    },
    {
      num: '03',
      title: 'Быстрый цикл',
      text: 'От боли до рабочего MVP — 2–3 месяца. Услышал проблему на совещании, за выходные прототип, в понедельник показал, собрал обратную связь, доработал.',
      metric: '4 продукта за 1.5 года (solo)',
    },
  ]

  return (
    <section id="value" className="bg-surface py-16">
      <div className="max-w-[1080px] mx-auto px-8">
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
              <div key={c.title} className="bg-bg border border-border rounded-xl p-6 relative overflow-hidden transition-transform hover:-translate-y-0.5">
                <div className="absolute top-3 right-4 text-4xl font-extrabold font-display text-border/30 leading-none select-none">{c.num}</div>
                <h3 className="text-[0.95rem] font-bold mb-1.5 relative">{c.title}</h3>
                <p className="text-sm text-muted leading-relaxed relative">{c.text}</p>
                <div className="mt-3 pt-3 border-t border-border text-sm text-green font-semibold relative">
                  {c.metric}
                </div>
              </div>
            ))}
          </div>
        </Reveal>
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
        <Reveal>
          <SectionHeader
            tag="Как я делаю продукты"
            tagColor="bg-purple-soft text-purple"
            title="От задачи на площадке до рабочего инструмента"
            subtitle="Техническая реализация перестаёт быть ограничением. Ключевой дефицит — понимание предметной области."
          />
        </Reveal>

        {/* Old vs New model */}
        <Reveal stagger>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* Old model */}
            <div className="bg-surface border border-border rounded-xl p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-red/[0.03]" />
              <div className="relative">
                <div className="text-xs font-bold uppercase tracking-wider text-red mb-3">Линейная модель</div>
                <div className="flex flex-wrap items-center gap-1.5 mb-4">
                  {oldChain.map((item, i) => (
                    <span key={i} className="contents">
                      <span className="px-2.5 py-1 rounded bg-surface-3 text-xs text-muted line-through decoration-red/40">{item}</span>
                      {i < oldChain.length - 1 && <span className="text-muted/40 text-xs">&rarr;</span>}
                    </span>
                  ))}
                </div>
                <div className="space-y-1.5 text-sm text-muted">
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
                <div className="text-xs font-bold uppercase tracking-wider text-accent mb-3">Новая модель</div>
                <div className="flex flex-wrap items-center gap-1.5 mb-4">
                  {newChain.map((item, i) => (
                    <span key={i} className="contents">
                      <span className="px-2.5 py-1 rounded bg-accent-soft text-xs text-accent font-semibold">{item}</span>
                      {i < newChain.length - 1 && <span className="text-accent/50 text-xs">&rarr;</span>}
                    </span>
                  ))}
                </div>
                <div className="space-y-1.5 text-sm text-muted">
                  <div className="flex items-start gap-2"><span className="text-green shrink-0">&#x2713;</span> Эксперт совмещает понимание процесса и реализацию</div>
                  <div className="flex items-start gap-2"><span className="text-green shrink-0">&#x2713;</span> AI снимает технические ограничения</div>
                  <div className="flex items-start gap-2"><span className="text-green shrink-0">&#x2713;</span> Валидация встроена в процесс — без промежуточных звеньев</div>
                  <div className="flex items-start gap-2"><span className="text-green shrink-0">&#x2713;</span> Цикл обратной связи — дни, а не месяцы</div>
                  <div className="flex items-start gap-2"><span className="text-green shrink-0">&#x2713;</span> Ускоряется весь процесс, а не отдельное звено</div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Thesis */}
        <Reveal>
          <div className="bg-surface-2 border border-border rounded-xl p-5 mb-8 max-w-[820px] mx-auto text-center">
            <p className="text-[0.95rem] text-text-primary leading-relaxed">
              AI-инструменты снимают барьер технической реализации. Дефицит смещается: разработчик без отраслевой экспертизы теряет ценность, аналитик без понимания технологий — тоже.{' '}
              <span className="text-accent font-semibold">Максимальная эффективность — у специалиста на стыке: предметная область + технологии + AI.</span>{' '}
              Это редкое сочетание, потому что требует двух параллельных карьер.
            </p>
          </div>
        </Reveal>

        {/* Steps */}
        <Reveal stagger>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {steps.map((s) => (
              <div key={s.num} className="bg-surface border border-border rounded-xl p-5">
                <div className="text-3xl font-extrabold font-display text-accent opacity-30 mb-2">{s.num}</div>
                <h4 className="text-sm font-bold mb-1.5">{s.title}</h4>
                <p className="text-sm text-muted leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
        </Reveal>
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
        <Reveal>
          <SectionHeader
            tag="R&D"
            tagColor="bg-purple-soft text-purple"
            title="Чем интересуюсь и что изучаю"
            subtitle="Слежу за технологиями системно: собственный Telegram-бот с AI-классификацией мониторит новые исследования."
          />
        </Reveal>
        <Reveal stagger>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-6">
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
                Ищу роль в R&D или продуктовом направлении — там где нужно не координировать разработку, а делать её.
                Руководящая позиция или автономный проект — главное, чтобы было что строить.
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

function ArchLayer({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-stretch gap-3 flex-col md:flex-row">
      <div className="md:w-[110px] md:min-w-[110px] flex items-center md:justify-end text-xs font-bold uppercase tracking-wide text-muted md:text-right md:pr-2">
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
      className={`${wide ? 'flex-[3]' : 'flex-1'} min-w-[130px] px-3 py-2.5 rounded-lg text-sm font-semibold text-center border ${archColors[color]}`}
    >
      {title}
      {sub && <small className="block text-xs font-normal opacity-70 mt-0.5">{sub}</small>}
    </div>
  )
}

export default App
