import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'

type Screen = 'apps' | 'chat' | 'prompts' | 'tools' | 'monitoring' | 'users' | 'appAccess' | 'adminAi' | 'adminTools'

/* ── SVG Icons ── */
const Ico = {
  Apps: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>,
  Chat: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>,
  Prompts: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>,
  Tools: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.573-1.066z"/><circle cx="12" cy="12" r="3"/></svg>,
  Monitor: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>,
  Users: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>,
  Link: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>,
  Download: () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>,
}

const IcoBot = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="8.5" cy="16" r="1.5"/><circle cx="15.5" cy="16" r="1.5"/><path d="M12 2v5M8 8h8"/></svg>
const IcoAppWindow = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 8h20"/><circle cx="5" cy="6" r="0.5" fill="currentColor"/><circle cx="7.5" cy="6" r="0.5" fill="currentColor"/></svg>
const IcoWrench = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>

const nav: { key: Screen; icon: () => JSX.Element; label: string; admin?: boolean }[] = [
  { key: 'apps', icon: Ico.Apps, label: 'Приложения' },
  { key: 'chat', icon: Ico.Chat, label: 'AI-чат' },
  { key: 'prompts', icon: Ico.Prompts, label: 'Промпты' },
  { key: 'tools', icon: Ico.Tools, label: 'Инструменты' },
  { key: 'monitoring', icon: Ico.Monitor, label: 'Мониторинг', admin: true },
  { key: 'users', icon: Ico.Users, label: 'Пользователи и группы' },
  { key: 'appAccess', icon: IcoAppWindow, label: 'Приложения и доступ' },
  { key: 'adminAi', icon: IcoBot, label: 'AI и промпты' },
  { key: 'adminTools', icon: IcoWrench, label: 'Инструменты' },
]

const titles: Record<Screen, string> = {
  apps: 'Приложения', chat: 'AI-чат', prompts: 'Промпты', tools: 'Инструменты',
  monitoring: 'Панель администратора', users: 'Пользователи и группы',
  appAccess: 'Приложения и доступ', adminAi: 'AI и промпты', adminTools: 'Инструменты',
}

/* ===== EXPORT ===== */
export function DemoAIHub() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <div className="mt-5 flex justify-center">
        <button onClick={(e) => { e.stopPropagation(); setOpen(true) }} className="px-6 py-3 bg-accent hover:bg-accent/90 text-white font-semibold rounded-xl text-sm transition-all cursor-pointer border-none flex items-center gap-2 shadow-lg shadow-accent/25">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
          Открыть демо
        </button>
      </div>
      {open && <Modal onClose={() => setOpen(false)} />}
    </>
  )
}

/* ===== MODAL ===== */
function Modal({ onClose }: { onClose: () => void }) {
  const [screen, setScreen] = useState<Screen>('apps')
  const handleKey = useCallback((e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }, [onClose])
  useEffect(() => {
    document.addEventListener('keydown', handleKey)
    document.body.classList.add('demo-modal-open')
    return () => { document.removeEventListener('keydown', handleKey); document.body.classList.remove('demo-modal-open') }
  }, [handleKey])

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="demo-modal-enter relative w-full max-w-[1400px] rounded-2xl overflow-hidden shadow-2xl flex flex-col" style={{ height: '90vh', maxHeight: '920px' }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 z-50 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center cursor-pointer border-none transition-colors text-lg" aria-label="Close">&times;</button>
        <div className="flex flex-1 min-h-0">
          {/* Sidebar */}
          <div className="w-[240px] bg-white border-r border-gray-200 flex flex-col shrink-0">
            <div className="h-14 flex items-center px-4 border-b border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-[#E52713] flex items-center justify-center text-xs text-white font-bold mr-3">AI</div>
              <div className="text-sm font-bold text-gray-800">AI-Hub</div>
            </div>
            <div className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto">
              {nav.map(item => (
                <div key={item.key}>
                  {item.admin && <div className="pt-4 pb-2 px-2"><div className="text-[0.6rem] font-bold text-gray-400 uppercase tracking-wider">Администрирование</div></div>}
                  <button onClick={() => setScreen(item.key)} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left cursor-pointer border-none transition-colors text-[0.8rem] ${screen === item.key ? 'bg-[#E52713]/8 text-[#E52713] font-semibold' : 'bg-transparent text-gray-600 hover:bg-gray-50'}`}>
                    <item.icon /><span>{item.label}</span>
                  </button>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-gray-100">
              <div className="flex items-center gap-2.5 p-2 rounded-lg bg-gray-50">
                <div className="w-8 h-8 rounded-full bg-[#E52713]/15 flex items-center justify-center text-[0.65rem] text-[#E52713] font-bold">НХ</div>
                <div className="flex-1 min-w-0"><div className="text-[0.75rem] font-semibold text-gray-800 truncate">Никита Х.</div><div className="text-[0.6rem] text-gray-400">Администратор</div></div>
              </div>
              <div className="text-[0.58rem] text-gray-300 text-center mt-2">v1.0</div>
            </div>
          </div>
          {/* Content */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#FAFAFA]">
            <div className="h-14 flex items-center justify-between px-6 bg-white border-b border-gray-200 shrink-0">
              <h2 className="text-[0.95rem] font-bold text-gray-800 m-0">{titles[screen]}</h2>
              <span className="text-[0.72rem] text-gray-400">16 февр. 2026</span>
            </div>
            <div className="flex-1 overflow-y-auto">
              {screen === 'apps' && <PgApps />}
              {screen === 'chat' && <PgChat />}
              {screen === 'prompts' && <PgPrompts />}
              {screen === 'tools' && <PgTools />}
              {screen === 'monitoring' && <PgMonitoring />}
              {screen === 'users' && <PgUsers />}
              {screen === 'appAccess' && <PgAppAccess />}
              {screen === 'adminAi' && <PgAdminAi />}
              {screen === 'adminTools' && <PgAdminTools />}
            </div>
          </div>
        </div>
      </div>
    </div>, document.body)
}

/* ── Spotlight Card ── */
function Spot({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [s, setS] = useState({ x: 0, y: 0, on: false })
  return (
    <div ref={ref} className="relative bg-white border border-gray-200 rounded-xl p-4 cursor-default transition-all hover:border-[#E52713]/30 hover:shadow-lg group overflow-hidden"
      onMouseMove={e => { const r = ref.current?.getBoundingClientRect(); if (r) setS({ x: e.clientX - r.left, y: e.clientY - r.top, on: true }) }}
      onMouseLeave={() => setS(p => ({ ...p, on: false }))}>
      <div className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: s.on ? `radial-gradient(300px circle at ${s.x}px ${s.y}px, rgba(229,39,19,0.06), transparent 60%)` : 'none' }} />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

/* ── Btn helpers ── */
function ExportBtn({ label }: { label: string }) {
  return <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[0.7rem] text-gray-600 font-medium cursor-pointer hover:border-[#E52713]/30 hover:text-[#E52713] transition-colors"><Ico.Download />{label}</button>
}
function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button onClick={onClick} className={`px-3 py-1.5 rounded-lg text-[0.75rem] font-medium cursor-pointer border transition-colors ${active ? 'bg-[#E52713]/10 text-[#E52713] border-[#E52713]/20' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}>{children}</button>
}
function StatCard({ label, val, sub, color }: { label: string; val: string; sub: string; color: string }) {
  return <div className="bg-white rounded-xl p-4 border border-gray-200" style={{ borderLeftWidth: 3, borderLeftColor: color }}><span className="text-[0.65rem] text-gray-400 uppercase font-bold tracking-wider">{label}</span><div className="text-2xl font-extrabold text-gray-800 mt-1">{val}</div><div className="text-[0.7rem] text-gray-400 mt-0.5">{sub}</div></div>
}

/* ===== APPS ===== */
function PgApps() {
  const cats = ['Все', 'Аналитика', 'AI & ML', 'Финансы', 'Инструменты']
  const [cat, setCat] = useState('Все')
  const apps = [
    { name: 'DataBook', desc: 'Интеллектуальный поиск предписаний строительного контроля', cat: 'Аналитика', users: 28, color: '#3B82F6' },
    { name: 'AI-чат', desc: 'Корпоративный AI-ассистент для сотрудников', cat: 'AI & ML', users: 47, color: '#E52713' },
    { name: 'CostManager', desc: 'Контроль себестоимости строительных объектов', cat: 'Финансы', users: 15, color: '#10B981' },
    { name: 'Автопротокол', desc: 'ML-протоколирование совещаний', cat: 'AI & ML', users: 34, color: '#8B5CF6' },
    { name: 'Puls', desc: 'ERP-прототип управления строительными проектами', cat: 'Аналитика', users: 12, color: '#F59E0B' },
    { name: 'Сметный калькулятор', desc: 'Быстрые расчёты на основе нормативной базы', cat: 'Инструменты', users: 41, color: '#6B7280' },
  ]
  const list = cat === 'Все' ? apps : apps.filter(a => a.cat === cat)
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-2">{cats.map(c => <TabBtn key={c} active={cat === c} onClick={() => setCat(c)}>{c}</TabBtn>)}</div>
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-[0.78rem] text-gray-400 min-w-[200px]">Поиск приложений...</div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map(a => (
          <Spot key={a.name}>
            <div className="flex items-start gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-[0.7rem] font-bold shrink-0" style={{ background: `${a.color}15`, color: a.color }}>{a.name.slice(0, 2).toUpperCase()}</div>
              <div className="flex-1 min-w-0"><div className="text-[0.88rem] font-semibold text-gray-800">{a.name}</div><div className="text-[0.72rem] text-gray-400 mt-0.5 leading-snug">{a.desc}</div></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-md text-[0.65rem] font-semibold" style={{ background: `${a.color}15`, color: a.color }}>{a.cat}</span>
              <span className="text-[0.65rem] text-gray-400">{a.users} польз.</span>
            </div>
          </Spot>
        ))}
      </div>
    </div>
  )
}

/* ===== CHAT ===== */
type ConvKey = 'letter' | 'ks2' | 'agenda' | 'norm'
const convData: Record<ConvKey, { title: string; suggestion: string; userMsg: string; aiReply: string }> = {
  letter: {
    title: 'Письмо подрядчику',
    suggestion: 'Составь письмо подрядчику',
    userMsg: 'Составь письмо подрядчику ООО "СтройМонтаж" о задержке сроков по корпусу 3',
    aiReply: `Исх. No 156/ДЦТ от 16.02.2026\n\nГенеральному директору\nООО "СтройМонтаж"\nИванову И.И.\n\nУважаемый Иван Иванович!\n\nВ связи с нарушением сроков выполнения работ по объекту "Корпус 3" (договор No 78/2025 от 15.03.2025), просим Вас в срок до 20.02.2026:\n\n1. Предоставить актуализированный график производства работ\n2. Обеспечить мобилизацию дополнительных бригад\n3. Представить план компенсационных мероприятий\n\nВ случае дальнейшего нарушения сроков оставляем за собой право применения штрафных санкций согласно п.8.3 договора.\n\nС уважением,\nРуководитель ДЦТ`,
  },
  ks2: {
    title: 'Анализ КС-2 январь',
    suggestion: 'Проанализируй отчёт КС-2',
    userMsg: 'Проанализируй отклонения по КС-2 за январь. Какие подрядчики завышают объёмы?',
    aiReply: `Анализ отклонений КС-2 (январь 2026):\n\n1. ООО "СтройМонтаж" -- отклонение +12.3% по бетонным работам\n2. ИП Петров -- завышение объёмов кладки на корп. 3\n3. ООО "ФасадПро" -- в пределах нормы (<3%)\n\nРекомендация: запросить детализацию у СтройМонтаж по актам скрытых работ.`,
  },
  agenda: {
    title: 'Повестка совещания',
    suggestion: 'Подготовь повестку совещания',
    userMsg: 'Подготовь повестку еженедельного производственного совещания на 17.02',
    aiReply: `Повестка производственного совещания\n17.02.2026, 10:00, каб. 301\n\n1. Статус работ по корпусам 1-4 (отв. Петров К.Л., 15 мин)\n2. Отклонения по КС-2 за январь (отв. Хроменок Н.В., 10 мин)\n3. Поставка материалов: задержки и замены (отв. Лебедев А.М., 10 мин)\n4. Результаты проверки СК по корпусу 2 (отв. Иванов А.С., 10 мин)\n5. Корректировка графика на март (отв. Сидоров К.Л., 15 мин)\n6. Разное\n\nОбщая длительность: ~60 мин\nПротоколирование: Автопротокол (AI)`,
  },
  norm: {
    title: 'Нормативы СНиП',
    suggestion: 'Найди нормативный документ',
    userMsg: 'Найди актуальный нормативный документ по допустимым отклонениям при кирпичной кладке',
    aiReply: `Основные нормативные документы:\n\n1. СП 70.13330.2012 "Несущие и ограждающие конструкции" (актуализ. СНиП 3.03.01-87)\n   -- Раздел 9: Каменные конструкции\n   -- Таблица 9.8: допустимые отклонения\n\n2. Допуски при кладке из кирпича:\n   -- Толщина швов: горизонт. -2/+3 мм, вертик. -2/+2 мм\n   -- Отклонение от вертикали: на этаж не более 10 мм, на здание -- 30 мм\n   -- Отклонение рядов от горизонтали: 15 мм на 10 м длины\n   -- Неровности поверхности: 10 мм (кладка под штукатурку)\n\n3. ГОСТ 530-2012 "Кирпич и камень керамические" -- требования к материалу`,
  },
}
const historyItems: { key: ConvKey; time: string }[] = [
  { key: 'ks2', time: 'Сейчас' },
  { key: 'letter', time: '1 час назад' },
  { key: 'agenda', time: 'Вчера' },
  { key: 'norm', time: '2 дня назад' },
]

type ChatPhase = 'welcome' | 'typing' | 'thinking' | 'streaming' | 'done'

function PgChat() {
  const [convKey, setConvKey] = useState<ConvKey | null>(null)
  const [phase, setPhase] = useState<ChatPhase>('welcome')
  const [userText, setUserText] = useState('')
  const [aiText, setAiText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const conv = convKey ? convData[convKey] : null

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [userText, aiText, phase])

  const startConv = (key: ConvKey, instant?: boolean) => {
    setConvKey(key)
    if (instant) {
      setUserText(convData[key].userMsg)
      setAiText(convData[key].aiReply)
      setPhase('done')
    } else {
      setUserText('')
      setAiText('')
      setPhase('typing')
    }
  }

  useEffect(() => {
    if (!conv) return
    if (phase === 'typing') {
      let i = 0
      const id = setInterval(() => { i++; setUserText(conv.userMsg.slice(0, i)); if (i >= conv.userMsg.length) { clearInterval(id); setTimeout(() => setPhase('thinking'), 300) } }, 20)
      return () => clearInterval(id)
    }
    if (phase === 'thinking') { const id = setTimeout(() => setPhase('streaming'), 1000); return () => clearTimeout(id) }
    if (phase === 'streaming') {
      let i = 0
      const id = setInterval(() => { i += 3; setAiText(conv.aiReply.slice(0, i)); if (i >= conv.aiReply.length) { clearInterval(id); setPhase('done') } }, 12)
      return () => clearInterval(id)
    }
  }, [phase, conv])

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col">
        {phase === 'welcome' ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <div className="w-16 h-16 rounded-2xl bg-[#E52713] flex items-center justify-center text-xl text-white font-bold mb-4 shadow-lg shadow-[#E52713]/20">AI</div>
            <div className="text-xl font-bold text-gray-800 mb-1">AI-чат</div>
            <div className="text-[0.82rem] text-gray-400 mb-6">Корпоративный AI-ассистент</div>
            <div className="grid grid-cols-2 gap-3 max-w-[480px] w-full">
              {(Object.keys(convData) as ConvKey[]).map(k => (
                <button key={k} onClick={() => startConv(k)} className="bg-white border border-gray-200 rounded-xl p-3 text-left cursor-pointer hover:border-[#E52713]/30 hover:shadow-md transition-all">
                  <span className="text-[0.78rem] text-gray-600">{convData[k].suggestion}</span>
                </button>
              ))}
            </div>
            <div className="mt-6 text-[0.7rem] text-gray-400">Лимит: 50 запросов / день | Осталось: 43</div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="flex gap-3 max-w-[80%]">
                <div className="w-8 h-8 rounded-full bg-[#E52713] flex items-center justify-center text-white text-[0.6rem] font-bold shrink-0">AI</div>
                <div><div className="text-[0.65rem] text-gray-400 mb-1">AI-ассистент</div><div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-2.5 text-[0.82rem] text-gray-700 leading-relaxed shadow-sm">Добрый день! Чем могу помочь?</div><span className="text-[0.6rem] text-gray-300 mt-1 block">14:30</span></div>
              </div>
              {userText && (
                <div className="flex gap-3 max-w-[75%] ml-auto flex-row-reverse">
                  <div className="w-8 h-8 rounded-full bg-[#E52713]/15 flex items-center justify-center text-[#E52713] text-[0.6rem] font-bold shrink-0">НХ</div>
                  <div className="text-right"><div className="text-[0.65rem] text-gray-400 mb-1">Вы</div>
                    <div className="bg-[#E52713] text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-[0.82rem] leading-relaxed text-left shadow-sm">{userText}{phase === 'typing' && <span className="inline-block w-0.5 h-4 bg-white/70 ml-0.5 animate-pulse align-middle" />}</div>
                  </div>
                </div>
              )}
              {phase === 'thinking' && (
                <div className="flex gap-3"><div className="w-8 h-8 rounded-full bg-[#E52713] flex items-center justify-center text-white text-[0.6rem] font-bold shrink-0">AI</div>
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm"><div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-[#E52713] rounded-full animate-pulse"/><span className="w-1.5 h-1.5 bg-[#E52713]/60 rounded-full animate-pulse" style={{animationDelay:'0.2s'}}/><span className="w-1.5 h-1.5 bg-[#E52713]/30 rounded-full animate-pulse" style={{animationDelay:'0.4s'}}/><span className="text-[0.72rem] text-gray-400 ml-2">Думаю...</span></div></div>
                </div>
              )}
              {(phase === 'streaming' || phase === 'done') && aiText && (
                <div className="flex gap-3 max-w-[85%]">
                  <div className="w-8 h-8 rounded-full bg-[#E52713] flex items-center justify-center text-white text-[0.6rem] font-bold shrink-0">AI</div>
                  <div><div className="text-[0.65rem] text-gray-400 mb-1">AI-ассистент</div>
                    <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 text-[0.82rem] text-gray-700 leading-relaxed shadow-sm whitespace-pre-line">{aiText}{phase === 'streaming' && <span className="inline-block w-0.5 h-4 bg-[#E52713]/50 ml-0.5 animate-pulse align-middle" />}</div>
                    {phase === 'done' && <span className="text-[0.6rem] text-gray-300 mt-1 block">14:32</span>}
                  </div>
                </div>
              )}
              <div ref={bottomRef}/>
            </div>
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-50 rounded-xl px-4 py-3 text-[0.82rem] text-gray-400 border border-gray-200">Введите сообщение...</div>
                <button className="w-10 h-10 rounded-xl bg-[#E52713] flex items-center justify-center border-none cursor-pointer hover:bg-[#E52713]/90 transition-colors"><svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18"/></svg></button>
              </div>
              <div className="flex items-center justify-between mt-2 px-1"><span className="text-[0.65rem] text-gray-300">Enter -- отправить</span><span className="text-[0.65rem] text-gray-400">7 / 50</span></div>
            </div>
          </>
        )}
      </div>
      {/* History */}
      <div className="w-[200px] bg-white border-l border-gray-200 flex flex-col shrink-0">
        <div className="h-12 flex items-center justify-between px-4 border-b border-gray-100"><span className="text-[0.78rem] font-semibold text-gray-600">История</span><button className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center text-gray-400 text-sm border-none cursor-pointer hover:bg-gray-200 transition-colors">+</button></div>
        <div className="flex-1 p-2 space-y-1 overflow-y-auto">
          {historyItems.map(h => (
            <button key={h.key} onClick={() => startConv(h.key, true)} className={`w-full text-left px-3 py-2 rounded-lg cursor-pointer border-none transition-colors ${convKey === h.key ? 'bg-[#E52713]/8 text-[#E52713]' : 'bg-transparent text-gray-500 hover:bg-gray-50'}`}>
              <div className={`text-[0.72rem] truncate ${convKey === h.key ? 'font-semibold' : ''}`}>{convData[h.key].title}</div>
              <div className="text-[0.6rem] text-gray-300 mt-0.5">{h.time}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ===== PROMPTS ===== */
function PgPrompts() {
  const cats = [{ n: 'Все', c: 24 }, { n: 'Написание', c: 8 }, { n: 'Анализ', c: 6 }, { n: 'Код', c: 5 }, { n: 'Перевод', c: 5 }]
  const [cat, setCat] = useState('Все')
  const ps = [
    { t: 'Деловое письмо', d: 'Составить профессиональное письмо по шаблону', c: 'Написание', u: 156 },
    { t: 'Анализ договора', d: 'Выделить ключевые пункты и риски из договора', c: 'Анализ', u: 89 },
    { t: 'Code Review', d: 'Проверить код на ошибки и предложить улучшения', c: 'Код', u: 134 },
    { t: 'Перевод документа', d: 'Технический перевод с сохранением терминологии', c: 'Перевод', u: 67 },
    { t: 'Протокол совещания', d: 'Структурировать заметки в формат протокола', c: 'Написание', u: 203 },
    { t: 'Анализ КС-2', d: 'Выявить отклонения в актах выполненных работ', c: 'Анализ', u: 78 },
    { t: 'SQL-запрос', d: 'Сгенерировать SQL по описанию на естественном языке', c: 'Код', u: 92 },
    { t: 'Краткое содержание', d: 'Сжать длинный текст до ключевых тезисов', c: 'Анализ', u: 145 },
    { t: 'Перевод ТЗ', d: 'Перевести техническое задание EN/RU', c: 'Перевод', u: 53 },
  ]
  const list = cat === 'Все' ? ps : ps.filter(p => p.c === cat)
  return (
    <div className="p-6">
      <div className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-[0.82rem] text-gray-400 mb-5">Поиск промптов...</div>
      <div className="flex items-center gap-2 mb-5 flex-wrap">{cats.map(c => <TabBtn key={c.n} active={cat === c.n} onClick={() => setCat(c.n)}>{c.n} <span className="text-gray-400 ml-1">{c.c}</span></TabBtn>)}</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {list.map(p => (
          <div key={p.t} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-[#E52713]/30 hover:shadow-md transition-all cursor-default group">
            <div className="text-[0.82rem] font-semibold text-gray-800 group-hover:text-[#E52713] transition-colors mb-1">{p.t}</div>
            <div className="text-[0.72rem] text-gray-400 mb-3">{p.d}</div>
            <div className="flex items-center justify-between"><span className="text-[0.65rem] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">{p.c}</span><span className="text-[0.65rem] text-gray-400">{p.u} использований</span></div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ===== TOOLS ===== */
function PgTools() {
  const tools = [
    { name: 'PDF to Excel', desc: 'Конвертация PDF-таблиц в формат XLSX с сохранением структуры', color: '#10B981', status: 'ok', uses: 342, ico: 'XLS' },
    { name: 'OCR', desc: 'Распознавание текста с изображений и сканов документов', color: '#3B82F6', status: 'ok', uses: 218, ico: 'OCR' },
    { name: 'Word to PDF', desc: 'Конвертация документов DOCX в PDF с сохранением форматирования', color: '#8B5CF6', status: 'ok', uses: 567, ico: 'PDF' },
    { name: 'Сжатие изображений', desc: 'Оптимизация размера JPG/PNG без потери качества', color: '#F59E0B', status: 'ok', uses: 189, ico: 'IMG' },
    { name: 'Извлечение таблиц', desc: 'Извлечение табличных данных из PDF и изображений через AI', color: '#E52713', status: 'warn', uses: 95, ico: 'TAB' },
    { name: 'Объединение PDF', desc: 'Склейка нескольких PDF-файлов в один документ', color: '#06B6D4', status: 'ok', uses: 276, ico: 'MRG' },
    { name: 'Excel to PDF', desc: 'Конвертация таблиц XLSX в PDF с настройкой ориентации', color: '#EC4899', status: 'ok', uses: 431, ico: 'E2P' },
    { name: 'Водяные знаки', desc: 'Добавление текстовых/графических водяных знаков на PDF', color: '#6366F1', status: 'ok', uses: 64, ico: 'WM' },
    { name: 'QR-генератор', desc: 'Создание QR-кодов со ссылками и текстом для документов', color: '#6B7280', status: 'ok', uses: 152, ico: 'QR' },
  ]
  return (
    <div className="p-6">
      <div className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-[0.82rem] text-gray-400 mb-5">Поиск инструментов...</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map(t => (
          <div key={t.name} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-md transition-all cursor-default group">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-[0.65rem] font-bold shrink-0 text-white" style={{ background: t.color }}>{t.ico}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="text-[0.85rem] font-semibold text-gray-800">{t.name}</div>
                  <span className={`w-2 h-2 rounded-full shrink-0 ${t.status === 'ok' ? 'bg-green-500' : 'bg-amber-400'}`} />
                </div>
                <div className="text-[0.72rem] text-gray-400 mt-0.5 leading-snug">{t.desc}</div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[0.65rem] text-gray-400">{t.uses} использований</span>
              <button className="px-3 py-1 rounded-lg text-[0.7rem] font-medium border cursor-pointer transition-colors bg-white text-gray-500 border-gray-200 group-hover:border-[#E52713]/30 group-hover:text-[#E52713]">Открыть</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ===== MONITORING ===== */
function PgMonitoring() {
  const [tab, setTab] = useState<'overview' | 'health' | 'stats' | 'audit' | 'logins'>('overview')
  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-5 flex-wrap">{(['overview', 'health', 'stats', 'audit', 'logins'] as const).map(t => <TabBtn key={t} active={tab === t} onClick={() => setTab(t)}>{{ overview: 'Обзор', health: 'Health', stats: 'Статистика', audit: 'Аудит', logins: 'История входов' }[t]}</TabBtn>)}</div>
      {tab === 'overview' && <MonOverview />}
      {tab === 'health' && <MonHealth />}
      {tab === 'stats' && <MonStats />}
      {tab === 'audit' && <MonAudit />}
      {tab === 'logins' && <MonLogins />}
    </div>
  )
}

function MonOverview() {
  return (<>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
      <StatCard label="Пользователи" val="47" sub="32 активных" color="#3B82F6" />
      <StatCard label="Приложения" val="6" sub="4 active" color="#10B981" />
      <StatCard label="Группы" val="8" sub="3 admin" color="#F59E0B" />
      <StatCard label="Токены" val="156" sub="42 активных" color="#8B5CF6" />
    </div>
    <div className="flex items-center gap-2 mb-5 flex-wrap">
      <ExportBtn label="Export Users (.xlsx)" />
      <ExportBtn label="Export Applications (.xlsx)" />
      <button className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-[0.7rem] text-red-600 font-medium cursor-pointer hover:bg-red-100 transition-colors">Очистить старые токены</button>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="text-[0.82rem] font-semibold text-gray-700 mb-3">Сообщений AI-чат</div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div><div className="text-xl font-bold text-gray-800">1,847</div><div className="text-[0.65rem] text-gray-400">Всего</div></div>
          <div><div className="text-xl font-bold text-[#E52713]">34</div><div className="text-[0.65rem] text-gray-400">Сегодня</div></div>
          <div><div className="text-xl font-bold text-gray-800">198</div><div className="text-[0.65rem] text-gray-400">За неделю</div></div>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="text-[0.82rem] font-semibold text-gray-700 mb-3">Токены (стоимость)</div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div><div className="text-xl font-bold text-gray-800">$2.14</div><div className="text-[0.65rem] text-gray-400">Сегодня</div></div>
          <div><div className="text-xl font-bold text-gray-800">$12.80</div><div className="text-[0.65rem] text-gray-400">Неделя</div></div>
          <div><div className="text-xl font-bold text-gray-800">$48.50</div><div className="text-[0.65rem] text-gray-400">Всего</div></div>
        </div>
      </div>
    </div>
  </>)
}

function MonHealth() {
  const svcs = [
    { name: 'Backend API', lat: '8ms', st: 'healthy' }, { name: 'PostgreSQL', lat: '12ms', st: 'healthy' },
    { name: 'Redis', lat: '3ms', st: 'healthy' }, { name: 'LLM API', lat: '180ms', st: 'degraded' },
    { name: 'ADFS / OAuth', lat: '45ms', st: 'healthy' }, { name: 'S3 Storage', lat: '28ms', st: 'healthy' },
    { name: 'Tools Server', lat: '52ms', st: 'healthy' },
  ]
  const stColor = (s: string) => s === 'healthy' ? 'bg-green-500' : s === 'degraded' ? 'bg-amber-400' : 'bg-red-500'
  const stLabel = (s: string) => s === 'healthy' ? 'text-green-600' : s === 'degraded' ? 'text-amber-600' : 'text-red-600'
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="text-[0.82rem] font-semibold text-gray-700">Service Health</div>
        <button className="px-3 py-1 bg-gray-100 rounded-lg text-[0.7rem] text-gray-500 font-medium cursor-pointer border-none hover:bg-gray-200 transition-colors">Refresh</button>
      </div>
      <div className="space-y-3">
        {svcs.map(s => (
          <div key={s.name} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-b-0">
            <div className="flex items-center gap-3"><span className={`w-2.5 h-2.5 rounded-full ${stColor(s.st)}`} /><span className="text-[0.8rem] text-gray-700 font-medium">{s.name}</span></div>
            <div className="flex items-center gap-4"><span className="text-[0.72rem] text-gray-400 font-mono">{s.lat}</span><span className={`text-[0.7rem] font-semibold ${stLabel(s.st)}`}>{s.st}</span></div>
          </div>
        ))}
      </div>
    </div>
  )
}

function MonStats() {
  const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
  const msgs = [42, 38, 55, 61, 34, 12, 8]
  const max = Math.max(...msgs)
  const topUsers = [{ n: 'Хроменок Н.В.', v: 312 }, { n: 'Петрова М.В.', v: 198 }, { n: 'Иванов А.С.', v: 156 }, { n: 'Козлова Е.А.', v: 89 }]
  return (<>
    <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
      <div className="text-[0.82rem] font-semibold text-gray-700 mb-4">Сообщений по дням (последняя неделя)</div>
      <div className="flex items-end gap-3 h-[120px]">
        {days.map((d, i) => (
          <div key={d} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[0.65rem] font-semibold text-gray-800">{msgs[i]}</span>
            <div className="w-full rounded-t-md transition-all" style={{ height: `${(msgs[i] / max) * 90}px`, background: i < 5 ? '#E52713' : '#E5271333' }} />
            <span className="text-[0.6rem] text-gray-400">{d}</span>
          </div>
        ))}
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="text-[0.82rem] font-semibold text-gray-700 mb-3">Top пользователей по сообщениям</div>
        <div className="space-y-2.5">{topUsers.map((u, i) => (
          <div key={u.n} className="flex items-center gap-3">
            <span className="text-[0.7rem] text-gray-400 w-5">{i + 1}.</span>
            <span className="text-[0.78rem] text-gray-700 flex-1">{u.n}</span>
            <span className="text-[0.75rem] font-semibold text-gray-800">{u.v}</span>
          </div>
        ))}</div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="text-[0.82rem] font-semibold text-gray-700 mb-3">Top промптов</div>
        <div className="space-y-2.5">{[{ n: 'Протокол совещания', v: 203 }, { n: 'Деловое письмо', v: 156 }, { n: 'Краткое содержание', v: 145 }, { n: 'Code Review', v: 134 }].map((p, i) => (
          <div key={p.n} className="flex items-center gap-3">
            <span className="text-[0.7rem] text-gray-400 w-5">{i + 1}.</span>
            <span className="text-[0.78rem] text-gray-700 flex-1">{p.n}</span>
            <span className="text-[0.75rem] font-semibold text-gray-800">{p.v}</span>
          </div>
        ))}</div>
      </div>
    </div>
  </>)
}

function MonAudit() {
  const log = [
    { time: '14:32', user: 'Хроменок Н.В.', action: 'login', entity: 'auth', ip: '10.0.1.15', color: '#10B981' },
    { time: '14:30', user: 'Петрова М.В.', action: 'export_report', entity: 'data', ip: '10.0.1.22', color: '#3B82F6' },
    { time: '14:28', user: 'Система', action: 'token_cleanup', entity: 'system', ip: '--', color: '#6B7280' },
    { time: '14:15', user: 'Иванов А.С.', action: 'access_denied', entity: 'security', ip: '10.0.2.8', color: '#EF4444' },
    { time: '14:10', user: 'Морозов Д.И.', action: 'user.update', entity: 'user', ip: '10.0.1.3', color: '#8B5CF6' },
    { time: '14:05', user: 'Хроменок Н.В.', action: 'group.create', entity: 'group', ip: '10.0.1.15', color: '#F59E0B' },
    { time: '13:58', user: 'Система', action: 'health_check', entity: 'system', ip: '--', color: '#6B7280' },
    { time: '13:45', user: 'Козлова Е.А.', action: 'access.grant', entity: 'access', ip: '10.0.3.1', color: '#06B6D4' },
  ]
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-200">
        <span className="text-[0.82rem] font-semibold text-gray-700">Audit Log</span>
        <span className="px-2 py-0.5 bg-amber-100 text-amber-600 rounded-md text-[0.6rem] font-bold">LIVE</span>
      </div>
      <table className="w-full">
        <thead><tr className="text-[0.65rem] text-gray-400 uppercase tracking-wider"><th className="text-left px-5 py-2 font-semibold">Время</th><th className="text-left px-4 py-2 font-semibold">Пользователь</th><th className="text-left px-4 py-2 font-semibold">Действие</th><th className="text-left px-4 py-2 font-semibold">Сущность</th><th className="text-left px-4 py-2 font-semibold">IP</th></tr></thead>
        <tbody>{log.map((l, i) => (
          <tr key={i} className="border-t border-gray-100 hover:bg-gray-50/50 text-[0.78rem]">
            <td className="px-5 py-2 text-gray-400 font-mono text-[0.72rem]">{l.time}</td>
            <td className="px-4 py-2 text-gray-700">{l.user}</td>
            <td className="px-4 py-2"><span className="font-mono font-semibold px-2 py-0.5 rounded-md text-[0.68rem]" style={{ color: l.color, background: `${l.color}15` }}>{l.action}</span></td>
            <td className="px-4 py-2 text-gray-500">{l.entity}</td>
            <td className="px-4 py-2 text-gray-400 font-mono text-[0.7rem]">{l.ip}</td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  )
}

function MonLogins() {
  const logins = [
    { time: '16.02 14:32', user: 'Хроменок Н.В.', email: 'khromenok@company.ru', type: 'SSO/ADFS', ok: true, ip: '10.0.1.15', browser: 'Chrome' },
    { time: '16.02 14:28', user: 'Петрова М.В.', email: 'petrova@company.ru', type: 'SSO/ADFS', ok: true, ip: '10.0.1.22', browser: 'Edge' },
    { time: '16.02 14:15', user: 'Неизвестный', email: 'test@external.ru', type: 'SSO/ADFS', ok: false, ip: '10.0.2.8', browser: 'Firefox' },
    { time: '16.02 13:50', user: 'Иванов А.С.', email: 'ivanov@company.ru', type: 'OAuth', ok: true, ip: '10.0.1.44', browser: 'Chrome' },
    { time: '16.02 13:45', user: 'Козлова Е.А.', email: 'kozlova@company.ru', type: 'SSO/ADFS', ok: true, ip: '10.0.3.1', browser: 'Safari' },
    { time: '15.02 18:30', user: 'Морозов Д.И.', email: 'morozov@company.ru', type: 'Dev Login', ok: true, ip: '127.0.0.1', browser: 'Chrome' },
    { time: '15.02 17:20', user: 'Сидоров К.Л.', email: 'sidorov@company.ru', type: 'SSO/ADFS', ok: true, ip: '10.0.1.88', browser: 'Edge' },
  ]
  const typeBg: Record<string, string> = { 'SSO/ADFS': 'bg-blue-100 text-blue-600', 'Dev Login': 'bg-amber-100 text-amber-600', 'OAuth': 'bg-purple-100 text-purple-600' }
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-200">
        <span className="text-[0.82rem] font-semibold text-gray-700">История входов</span>
        <div className="flex items-center gap-2">
          <div className="bg-white border border-gray-200 rounded-lg px-3 py-1 text-[0.72rem] text-gray-400 min-w-[140px]">Поиск по email...</div>
          <ExportBtn label="Export" />
        </div>
      </div>
      <table className="w-full">
        <thead><tr className="text-[0.65rem] text-gray-400 uppercase tracking-wider"><th className="text-left px-5 py-2 font-semibold">Дата</th><th className="text-left px-4 py-2 font-semibold">Пользователь</th><th className="text-left px-4 py-2 font-semibold">Тип</th><th className="text-center px-4 py-2 font-semibold">Статус</th><th className="text-left px-4 py-2 font-semibold">IP</th><th className="text-left px-4 py-2 font-semibold">Браузер</th></tr></thead>
        <tbody>{logins.map((l, i) => (
          <tr key={i} className="border-t border-gray-100 hover:bg-gray-50/50 text-[0.78rem]">
            <td className="px-5 py-2 text-gray-400 font-mono text-[0.72rem]">{l.time}</td>
            <td className="px-4 py-2"><div className="text-gray-700">{l.user}</div><div className="text-[0.65rem] text-gray-400">{l.email}</div></td>
            <td className="px-4 py-2"><span className={`px-2 py-0.5 rounded-md text-[0.65rem] font-bold ${typeBg[l.type] || 'bg-gray-100 text-gray-500'}`}>{l.type}</span></td>
            <td className="px-4 py-2 text-center">{l.ok ? <span className="text-green-500 text-sm">&#10003;</span> : <span className="text-red-500 text-sm">&#10007;</span>}</td>
            <td className="px-4 py-2 text-gray-400 font-mono text-[0.7rem]">{l.ip}</td>
            <td className="px-4 py-2 text-gray-500 text-[0.72rem]">{l.browser}</td>
          </tr>
        ))}</tbody>
      </table>
      <div className="flex items-center justify-between px-5 py-2.5 bg-gray-50 border-t border-gray-200 text-[0.7rem] text-gray-400">
        <span>1-7 из 156</span>
        <div className="flex gap-1"><button className="px-2 py-0.5 bg-white border border-gray-200 rounded text-[0.65rem] cursor-pointer">&larr;</button><button className="px-2 py-0.5 bg-white border border-gray-200 rounded text-[0.65rem] cursor-pointer">&rarr;</button></div>
      </div>
    </div>
  )
}

/* ===== USERS ===== */
function PgUsers() {
  const [tab, setTab] = useState<'users' | 'groups'>('users')
  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-5"><TabBtn active={tab === 'users'} onClick={() => setTab('users')}>Пользователи</TabBtn><TabBtn active={tab === 'groups'} onClick={() => setTab('groups')}>Группы</TabBtn></div>
      {tab === 'users' ? <UsersTab /> : <GroupsTab />}
    </div>
  )
}

function UsersTab() {
  const [filter, setFilter] = useState('Все')
  const users = [
    { name: 'Хроменок Н.В.', email: 'khromenok@company.ru', dept: 'ДЦТ', role: 'admin', active: true, last: '16.02.2026' },
    { name: 'Иванов А.С.', email: 'ivanov@company.ru', dept: 'Стройконтроль', role: 'user', active: true, last: '16.02.2026' },
    { name: 'Петрова М.В.', email: 'petrova@company.ru', dept: 'Экономика', role: 'user', active: true, last: '15.02.2026' },
    { name: 'Сидоров К.Л.', email: 'sidorov@company.ru', dept: 'ПТО', role: 'user', active: true, last: '14.02.2026' },
    { name: 'Козлова Е.А.', email: 'kozlova@company.ru', dept: 'Юридический', role: 'user', active: true, last: '16.02.2026' },
    { name: 'Морозов Д.И.', email: 'morozov@company.ru', dept: 'ДЦТ', role: 'admin', active: true, last: '16.02.2026' },
    { name: 'Волкова Н.П.', email: 'volkova@company.ru', dept: 'Бухгалтерия', role: 'user', active: false, last: '13.02.2026' },
  ]
  const filtered = filter === 'Все' ? users : filter === 'Админы' ? users.filter(u => u.role === 'admin') : filter === 'Активные' ? users.filter(u => u.active) : users.filter(u => !u.active)
  return (<>
    <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
      <div className="flex items-center gap-2">{['Все', 'Админы', 'Активные', 'Неактивные'].map(f => <TabBtn key={f} active={filter === f} onClick={() => setFilter(f)}>{f}</TabBtn>)}</div>
      <div className="flex items-center gap-2"><ExportBtn label="Export (.xlsx)" /><div className="bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-[0.75rem] text-gray-400 min-w-[160px]">Поиск...</div></div>
    </div>
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead><tr className="text-[0.65rem] text-gray-400 uppercase tracking-wider bg-gray-50"><th className="text-left px-5 py-3 font-semibold">Пользователь</th><th className="text-left px-4 py-3 font-semibold">Email</th><th className="text-left px-4 py-3 font-semibold">Департамент</th><th className="text-left px-4 py-3 font-semibold">Вход</th><th className="text-center px-4 py-3 font-semibold">Роль</th><th className="text-center px-4 py-3 font-semibold">Статус</th></tr></thead>
        <tbody>{filtered.map(u => (
          <tr key={u.email} className="border-t border-gray-100 hover:bg-gray-50/50 text-[0.78rem]">
            <td className="px-5 py-2.5"><div className="flex items-center gap-2.5"><div className="w-7 h-7 rounded-full bg-[#E52713]/10 flex items-center justify-center text-[0.55rem] text-[#E52713] font-bold shrink-0">{u.name.split(' ').map(w => w[0]).join('').slice(0, 2)}</div><span className="font-medium text-gray-800">{u.name}</span></div></td>
            <td className="px-4 py-2.5 text-gray-500 text-[0.72rem]">{u.email}</td>
            <td className="px-4 py-2.5 text-gray-500">{u.dept}</td>
            <td className="px-4 py-2.5 text-gray-400 text-[0.72rem]">{u.last}</td>
            <td className="px-4 py-2.5 text-center">{u.role === 'admin' ? <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-md text-[0.65rem] font-bold">Админ</span> : <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md text-[0.65rem]">User</span>}</td>
            <td className="px-4 py-2.5 text-center"><span className={`w-2 h-2 rounded-full inline-block ${u.active ? 'bg-green-500' : 'bg-gray-300'}`} /></td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  </>)
}

function GroupsTab() {
  const groups = [
    { name: 'Админы', members: 3, color: '#EF4444', desc: 'Полный доступ к системе' },
    { name: 'СК-Инженеры', members: 12, color: '#3B82F6', desc: 'Стройконтроль' },
    { name: 'Экономисты', members: 8, color: '#10B981', desc: 'Финансовый отдел' },
    { name: 'ПТО', members: 6, color: '#F59E0B', desc: 'Проектно-технический отдел' },
    { name: 'Юристы', members: 4, color: '#8B5CF6', desc: 'Юридический отдел' },
    { name: 'Разработчики', members: 3, color: '#06B6D4', desc: 'IT-разработка' },
    { name: 'Бухгалтерия', members: 5, color: '#EC4899', desc: 'Бухгалтерский учёт' },
    { name: 'Снабжение', members: 4, color: '#6B7280', desc: 'Отдел снабжения' },
  ]
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {groups.map(g => (
        <div key={g.name} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all cursor-default">
          <div className="flex items-center gap-2.5 mb-2"><div className="w-3 h-3 rounded-full shrink-0" style={{ background: g.color }} /><span className="text-[0.82rem] font-semibold text-gray-800">{g.name}</span></div>
          <div className="text-[0.7rem] text-gray-400 mb-2">{g.desc}</div>
          <div className="text-[0.72rem] text-gray-500">{g.members} участников</div>
        </div>
      ))}
      <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-4 flex items-center justify-center cursor-default">
        <span className="text-[0.78rem] text-gray-400">+ Создать группу</span>
      </div>
    </div>
  )
}

/* ===== APP ACCESS ===== */
function PgAppAccess() {
  const [tab, setTab] = useState<'apps' | 'departments' | 'groups' | 'oauth'>('apps')
  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-5 flex-wrap"><TabBtn active={tab === 'apps'} onClick={() => setTab('apps')}>Приложения</TabBtn><TabBtn active={tab === 'departments'} onClick={() => setTab('departments')}>По отделам</TabBtn><TabBtn active={tab === 'groups'} onClick={() => setTab('groups')}>По группам</TabBtn><TabBtn active={tab === 'oauth'} onClick={() => setTab('oauth')}>OAuth2 / SSO</TabBtn></div>
      {tab === 'apps' && <IntApps />}
      {tab === 'departments' && <IntDepartments />}
      {tab === 'groups' && <IntAccess />}
      {tab === 'oauth' && <IntOAuth />}
    </div>
  )
}

function IntApps() {
  const apps = [
    { name: 'DataBook', slug: 'databook', clientId: 'hub_dk8f2m', category: 'analytics', active: true, public: false, depts: ['Стройконтроль', 'ПТО'] },
    { name: 'CostManager', slug: 'costmanager', clientId: 'hub_cm3x9p', category: 'documents', active: true, public: false, depts: ['Экономика', 'Бухгалтерия'] },
    { name: 'Автопротокол', slug: 'autoprotocol', clientId: 'hub_ap7k1n', category: 'ai', active: true, public: true, depts: [] },
    { name: 'Puls', slug: 'puls', clientId: 'hub_pl2w5r', category: 'productivity', active: false, public: false, depts: ['ПТО'] },
  ]
  const catColors: Record<string, string> = { ai: '#E52713', analytics: '#3B82F6', documents: '#10B981', productivity: '#F59E0B' }
  return (<>
    <div className="flex items-center justify-between mb-4">
      <ExportBtn label="Export Apps (.xlsx)" />
      <button className="px-3 py-1.5 bg-[#E52713] text-white rounded-lg text-[0.75rem] font-medium border-none cursor-pointer hover:bg-[#E52713]/90 transition-colors">+ Зарегистрировать приложение</button>
    </div>
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead><tr className="text-[0.65rem] text-gray-400 uppercase tracking-wider bg-gray-50"><th className="text-left px-5 py-2.5 font-semibold">Приложение</th><th className="text-left px-4 py-2.5 font-semibold">client_id</th><th className="text-left px-4 py-2.5 font-semibold">Категория</th><th className="text-left px-4 py-2.5 font-semibold">Доступ</th><th className="text-center px-4 py-2.5 font-semibold">Статус</th></tr></thead>
        <tbody>{apps.map(a => (
          <tr key={a.slug} className="border-t border-gray-100 hover:bg-gray-50/50 text-[0.78rem]">
            <td className="px-5 py-2.5 font-medium text-gray-800">{a.name} <span className="text-gray-400 font-normal text-[0.68rem]">/{a.slug}</span></td>
            <td className="px-4 py-2.5 font-mono text-[0.7rem] text-gray-500">{a.clientId}</td>
            <td className="px-4 py-2.5"><span className="px-2 py-0.5 rounded-md text-[0.65rem] font-semibold" style={{ color: catColors[a.category] || '#6B7280', background: `${catColors[a.category] || '#6B7280'}15` }}>{a.category}</span></td>
            <td className="px-4 py-2.5 text-[0.72rem] text-gray-500">{a.public ? 'Public' : a.depts.join(', ')}</td>
            <td className="px-4 py-2.5 text-center"><span className={`w-2 h-2 rounded-full inline-block ${a.active ? 'bg-green-500' : 'bg-gray-300'}`} /></td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  </>)
}

function IntDepartments() {
  const apps = [
    { name: 'DataBook', depts: [{ n: 'Стройконтроль', on: true }, { n: 'ПТО', on: true }, { n: 'Экономика', on: false }, { n: 'Юридический', on: false }, { n: 'Бухгалтерия', on: false }] },
    { name: 'CostManager', depts: [{ n: 'Стройконтроль', on: false }, { n: 'ПТО', on: false }, { n: 'Экономика', on: true }, { n: 'Юридический', on: false }, { n: 'Бухгалтерия', on: true }] },
    { name: 'Автопротокол', depts: [{ n: 'Без ограничений', on: true }] },
    { name: 'AI-чат', depts: [{ n: 'Без ограничений', on: true }] },
  ]
  return (
    <div className="space-y-3">
      {apps.map(a => (
        <div key={a.name} className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-[0.82rem] font-semibold text-gray-800 mb-3">{a.name}</div>
          <div className="flex flex-wrap gap-2">
            {a.depts.map(d => (
              <div key={d.n} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[0.72rem] font-medium border ${d.n === 'Без ограничений' ? 'bg-green-50 border-green-200 text-green-600' : d.on ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                <span className={`w-2 h-2 rounded-full ${d.n === 'Без ограничений' ? 'bg-green-500' : d.on ? 'bg-blue-500' : 'bg-gray-300'}`} />
                {d.n}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function IntAccess() {
  const matrix = [
    { group: 'Админы', apps: ['Все'], level: 'full', color: '#EF4444' },
    { group: 'СК-Инженеры', apps: ['DataBook', 'AI-чат'], level: 'read+write', color: '#3B82F6' },
    { group: 'Экономисты', apps: ['CostManager', 'AI-чат'], level: 'read+write', color: '#10B981' },
    { group: 'ПТО', apps: ['DataBook', 'Puls'], level: 'read', color: '#F59E0B' },
    { group: 'Юристы', apps: ['AI-чат'], level: 'read', color: '#8B5CF6' },
    { group: 'Разработчики', apps: ['Все'], level: 'full', color: '#06B6D4' },
  ]
  const lvl = (l: string) => {
    const m: Record<string, string> = { full: 'bg-red-100 text-red-600', 'read+write': 'bg-blue-100 text-blue-600', read: 'bg-gray-100 text-gray-500' }
    return <span className={`px-2 py-0.5 rounded-md text-[0.65rem] font-bold ${m[l] || m.read}`}>{l}</span>
  }
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <span className="text-[0.82rem] font-semibold text-gray-700">Матрица доступа: группы / приложения</span>
        <ExportBtn label="Export" />
      </div>
      <table className="w-full">
        <thead><tr className="text-[0.65rem] text-gray-400 uppercase tracking-wider"><th className="text-left px-5 py-2.5 font-semibold">Группа</th><th className="text-left px-4 py-2.5 font-semibold">Приложения</th><th className="text-center px-4 py-2.5 font-semibold">Уровень</th></tr></thead>
        <tbody>{matrix.map(r => (
          <tr key={r.group} className="border-t border-gray-100 hover:bg-gray-50/50 text-[0.78rem]">
            <td className="px-5 py-2.5"><div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{ background: r.color }} /><span className="font-medium text-gray-800">{r.group}</span></div></td>
            <td className="px-4 py-2.5"><div className="flex gap-1 flex-wrap">{r.apps.map(a => <span key={a} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-[0.65rem]">{a}</span>)}</div></td>
            <td className="px-4 py-2.5 text-center">{lvl(r.level)}</td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  )
}

function IntOAuth() {
  return (
    <div className="space-y-4">
      {/* OAuth2 flow explanation */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="text-[0.88rem] font-semibold text-gray-800 mb-3">Единая авторизация (SSO + OAuth2)</div>
        <div className="text-[0.78rem] text-gray-600 leading-relaxed mb-4">
          AI-Hub выступает как <strong>OAuth2 Provider</strong> для всех корпоративных приложений. Пользователь логинится один раз через ADFS/OIDC, после чего получает доступ ко всем разрешённым сервисам без повторного ввода пароля.
        </div>
        {/* Flow diagram */}
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
          <div className="text-[0.72rem] font-bold text-gray-500 uppercase tracking-wider mb-4">OAuth2 Authorization Code Flow</div>
          <div className="flex items-start gap-3">
            {[
              { step: '1', title: 'Authorize', desc: 'Приложение направляет пользователя на /oauth/authorize с client_id и redirect_uri' },
              { step: '2', title: 'SSO Login', desc: 'AI-Hub проверяет сессию. Если нет -- редирект на ADFS для ввода корпоративных учётных данных' },
              { step: '3', title: 'Auth Code', desc: 'После успешного входа AI-Hub выдаёт authorization code и редиректит обратно' },
              { step: '4', title: 'Token', desc: 'Приложение обменивает code + client_secret на JWT access_token через /oauth/token' },
            ].map((s, i) => (
              <div key={s.step} className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-[#E52713] text-white text-[0.65rem] font-bold flex items-center justify-center shrink-0">{s.step}</div>
                  {i < 3 && <div className="flex-1 h-px bg-[#E52713]/20" />}
                </div>
                <div className="text-[0.75rem] font-semibold text-gray-800 mb-1">{s.title}</div>
                <div className="text-[0.68rem] text-gray-500 leading-snug">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Endpoints */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="text-[0.82rem] font-semibold text-gray-700 mb-3">API Endpoints</div>
        <div className="space-y-2">
          {[
            { method: 'GET', path: '/oauth/authorize', desc: 'Начало авторизации (client_id, redirect_uri, response_type, state)' },
            { method: 'POST', path: '/oauth/token', desc: 'Обмен code на access_token (grant_type, code, client_id, client_secret)' },
            { method: 'GET', path: '/auth/me', desc: 'Информация о текущем пользователе' },
            { method: 'GET', path: '/auth/sso/login', desc: 'SSO вход через ADFS/OIDC' },
          ].map(e => (
            <div key={e.path} className="flex items-center gap-3 py-1.5 border-b border-gray-50 last:border-b-0">
              <span className={`px-2 py-0.5 rounded text-[0.6rem] font-bold ${e.method === 'GET' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>{e.method}</span>
              <span className="text-[0.75rem] font-mono text-gray-800">{e.path}</span>
              <span className="text-[0.7rem] text-gray-400 flex-1 text-right">{e.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Security info */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Алгоритм" val="HS256" sub="JWT подпись" color="#E52713" />
        <StatCard label="Время жизни" val="60 мин" sub="access_token TTL" color="#3B82F6" />
        <StatCard label="Хранение" val="httpOnly" sub="secure cookie" color="#10B981" />
      </div>
    </div>
  )
}

/* ===== ADMIN AI & PROMPTS ===== */
function PgAdminAi() {
  const [tab, setTab] = useState<'prompts' | 'settings'>('prompts')
  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-5"><TabBtn active={tab === 'prompts'} onClick={() => setTab('prompts')}>Промпты</TabBtn><TabBtn active={tab === 'settings'} onClick={() => setTab('settings')}>Настройки AI</TabBtn></div>
      {tab === 'prompts' ? <AdminPrompts /> : <AdminAiSettings />}
    </div>
  )
}

function AdminPrompts() {
  const prompts = [
    { name: 'Деловое письмо', cat: 'Написание', order: 1, active: true },
    { name: 'Анализ договора', cat: 'Анализ', order: 2, active: true },
    { name: 'Code Review', cat: 'Код', order: 3, active: true },
    { name: 'Перевод документа', cat: 'Перевод', order: 4, active: true },
    { name: 'Протокол совещания', cat: 'Написание', order: 5, active: true },
    { name: 'Анализ КС-2', cat: 'Анализ', order: 6, active: true },
    { name: 'SQL-запрос', cat: 'Код', order: 7, active: false },
    { name: 'Краткое содержание', cat: 'Анализ', order: 8, active: true },
  ]
  const catColor: Record<string, string> = { 'Написание': '#3B82F6', 'Анализ': '#10B981', 'Код': '#F59E0B', 'Перевод': '#8B5CF6' }
  return (<>
    <div className="flex items-center justify-between mb-4">
      <span className="text-[0.78rem] text-gray-500">{prompts.length} промптов</span>
      <button className="px-3 py-1.5 bg-[#E52713] text-white rounded-lg text-[0.75rem] font-medium border-none cursor-pointer hover:bg-[#E52713]/90 transition-colors">+ Создать промпт</button>
    </div>
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead><tr className="text-[0.65rem] text-gray-400 uppercase tracking-wider bg-gray-50"><th className="text-left px-5 py-2.5 font-semibold">Название</th><th className="text-left px-4 py-2.5 font-semibold">Категория</th><th className="text-center px-4 py-2.5 font-semibold">Порядок</th><th className="text-center px-4 py-2.5 font-semibold">Статус</th><th className="text-center px-4 py-2.5 font-semibold">Действия</th></tr></thead>
        <tbody>{prompts.map(p => (
          <tr key={p.name} className="border-t border-gray-100 hover:bg-gray-50/50 text-[0.78rem]">
            <td className="px-5 py-2.5 font-medium text-gray-800">{p.name}</td>
            <td className="px-4 py-2.5"><span className="px-2 py-0.5 rounded-md text-[0.65rem] font-semibold" style={{ color: catColor[p.cat] || '#6B7280', background: `${catColor[p.cat] || '#6B7280'}15` }}>{p.cat}</span></td>
            <td className="px-4 py-2.5 text-center text-gray-400">{p.order}</td>
            <td className="px-4 py-2.5 text-center"><div className={`w-8 h-4 rounded-full mx-auto relative cursor-pointer ${p.active ? 'bg-green-500' : 'bg-gray-300'}`}><div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all ${p.active ? 'left-4' : 'left-0.5'}`}/></div></td>
            <td className="px-4 py-2.5 text-center"><div className="flex items-center justify-center gap-1"><button className="px-2 py-0.5 bg-gray-100 rounded text-[0.65rem] text-gray-500 cursor-pointer border-none hover:bg-gray-200">Ред.</button><button className="px-2 py-0.5 bg-red-50 rounded text-[0.65rem] text-red-500 cursor-pointer border-none hover:bg-red-100">Удал.</button></div></td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  </>)
}

function AdminAiSettings() {
  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="text-[0.82rem] font-semibold text-gray-800 mb-4">Модель</div>
        <div className="space-y-3">
          {[
            { name: 'Быстрая', desc: 'Быстрые ответы на простые вопросы', selected: false },
            { name: 'Продвинутая', desc: 'Глубокий анализ и сложные задачи', selected: true },
          ].map(m => (
            <label key={m.name} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${m.selected ? 'border-[#E52713]/30 bg-[#E52713]/5' : 'border-gray-200 hover:border-gray-300'}`}>
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${m.selected ? 'border-[#E52713]' : 'border-gray-300'}`}>{m.selected && <div className="w-2 h-2 rounded-full bg-[#E52713]"/>}</div>
              <div><div className="text-[0.82rem] font-medium text-gray-800">{m.name}</div><div className="text-[0.7rem] text-gray-400">{m.desc}</div></div>
            </label>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="text-[0.82rem] font-semibold text-gray-800">Чат</div>
          <div className="w-10 h-5 rounded-full bg-green-500 relative cursor-pointer"><div className="absolute top-0.5 left-5 w-4 h-4 rounded-full bg-white shadow"/></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-[0.72rem] text-gray-500 mb-1.5">Лимит сообщений (в день / на пользователя)</div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-[0.82rem] text-gray-800 font-medium">50</div>
          </div>
          <div>
            <div className="text-[0.72rem] text-gray-500 mb-1.5">Макс. токенов на ответ</div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-[0.82rem] text-gray-800 font-medium">8 192</div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="text-[0.82rem] font-semibold text-gray-800 mb-3">Системный промпт</div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-[0.75rem] text-gray-600 font-mono leading-relaxed min-h-[80px]">Ты корпоративный AI-ассистент. Отвечай кратко и по делу на русском языке. Не раскрывай конфиденциальную информацию. При необходимости ссылайся на внутренние нормативные документы.</div>
        <div className="text-[0.65rem] text-gray-400 mt-2">Последнее обновление: 14 февр. 2026, 11:30</div>
      </div>
      <button className="px-5 py-2 bg-[#E52713] text-white rounded-lg text-[0.78rem] font-semibold border-none cursor-pointer hover:bg-[#E52713]/90 transition-colors">Сохранить настройки</button>
    </div>
  )
}

/* ===== ADMIN TOOLS ===== */
function PgAdminTools() {
  const [tab, setTab] = useState<'tools' | 'servers'>('tools')
  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-5"><TabBtn active={tab === 'tools'} onClick={() => setTab('tools')}>Инструменты</TabBtn><TabBtn active={tab === 'servers'} onClick={() => setTab('servers')}>Серверы</TabBtn></div>
      {tab === 'tools' ? <AdminToolsList /> : <AdminServers />}
    </div>
  )
}

function AdminToolsList() {
  const tools = [
    { name: 'PDF to Excel', slug: 'pdf-to-excel', server: 'tools-main', color: '#10B981', active: true, uses: 342, last: '16.02.2026' },
    { name: 'OCR', slug: 'ocr', server: 'tools-main', color: '#3B82F6', active: true, uses: 218, last: '16.02.2026' },
    { name: 'Word to PDF', slug: 'word-to-pdf', server: 'tools-main', color: '#8B5CF6', active: true, uses: 567, last: '16.02.2026' },
    { name: 'Сжатие изображений', slug: 'image-compress', server: 'tools-media', color: '#F59E0B', active: true, uses: 189, last: '15.02.2026' },
    { name: 'Извлечение таблиц', slug: 'table-extract', server: 'tools-ai', color: '#E52713', active: false, uses: 95, last: '14.02.2026' },
    { name: 'Объединение PDF', slug: 'pdf-merge', server: 'tools-main', color: '#06B6D4', active: true, uses: 276, last: '16.02.2026' },
  ]
  return (<>
    <div className="flex items-center justify-between mb-4">
      <span className="text-[0.78rem] text-gray-500">{tools.length} инструментов</span>
      <button className="px-3 py-1.5 bg-[#E52713] text-white rounded-lg text-[0.75rem] font-medium border-none cursor-pointer hover:bg-[#E52713]/90 transition-colors">+ Создать инструмент</button>
    </div>
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead><tr className="text-[0.65rem] text-gray-400 uppercase tracking-wider bg-gray-50"><th className="text-left px-5 py-2.5 font-semibold">Инструмент</th><th className="text-left px-4 py-2.5 font-semibold">Slug</th><th className="text-left px-4 py-2.5 font-semibold">Сервер</th><th className="text-center px-4 py-2.5 font-semibold">Использований</th><th className="text-left px-4 py-2.5 font-semibold">Последний</th><th className="text-center px-4 py-2.5 font-semibold">Статус</th></tr></thead>
        <tbody>{tools.map(t => (
          <tr key={t.slug} className="border-t border-gray-100 hover:bg-gray-50/50 text-[0.78rem]">
            <td className="px-5 py-2.5"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm" style={{ background: t.color }}/><span className="font-medium text-gray-800">{t.name}</span></div></td>
            <td className="px-4 py-2.5 font-mono text-[0.7rem] text-gray-500">{t.slug}</td>
            <td className="px-4 py-2.5 text-[0.72rem] text-gray-500">{t.server}</td>
            <td className="px-4 py-2.5 text-center text-gray-600">{t.uses}</td>
            <td className="px-4 py-2.5 text-[0.72rem] text-gray-400">{t.last}</td>
            <td className="px-4 py-2.5 text-center"><div className={`w-8 h-4 rounded-full mx-auto relative cursor-pointer ${t.active ? 'bg-green-500' : 'bg-gray-300'}`}><div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all ${t.active ? 'left-4' : 'left-0.5'}`}/></div></td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  </>)
}

function AdminServers() {
  const servers = [
    { name: 'tools-main', desc: 'Основной сервер инструментов', url: 'https://tools.internal:8080', health: 'healthy', tools: 4, key: 'sk-tools-***8f2m' },
    { name: 'tools-media', desc: 'Обработка медиа-файлов', url: 'https://media.internal:8081', health: 'healthy', tools: 1, key: 'sk-media-***3x9p' },
    { name: 'tools-ai', desc: 'AI-инструменты (OCR, извлечение)', url: 'https://ai-tools.internal:8082', health: 'unhealthy', tools: 1, key: 'sk-ai-***7k1n' },
  ]
  const stColor = (s: string) => s === 'healthy' ? 'text-green-600 bg-green-50 border-green-200' : s === 'unhealthy' ? 'text-red-600 bg-red-50 border-red-200' : 'text-amber-600 bg-amber-50 border-amber-200'
  return (<>
    <div className="flex items-center justify-between mb-4">
      <span className="text-[0.78rem] text-gray-500">{servers.length} серверов</span>
      <button className="px-3 py-1.5 bg-[#E52713] text-white rounded-lg text-[0.75rem] font-medium border-none cursor-pointer hover:bg-[#E52713]/90 transition-colors">+ Добавить сервер</button>
    </div>
    <div className="space-y-3">
      {servers.map(s => (
        <div key={s.name} className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-[0.85rem] font-semibold text-gray-800">{s.name}</div>
              <div className="text-[0.72rem] text-gray-400 mt-0.5">{s.desc}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-lg text-[0.68rem] font-bold border ${stColor(s.health)}`}>{s.health}</span>
              <button className="px-2.5 py-1 bg-gray-100 rounded-lg text-[0.7rem] text-gray-500 font-medium cursor-pointer border-none hover:bg-gray-200 transition-colors">Check</button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-[0.72rem]">
            <div><span className="text-gray-400">URL:</span> <span className="font-mono text-gray-600">{s.url}</span></div>
            <div><span className="text-gray-400">Инструментов:</span> <span className="font-semibold text-gray-700">{s.tools}</span></div>
            <div><span className="text-gray-400">API Key:</span> <span className="font-mono text-gray-500">{s.key}</span></div>
          </div>
        </div>
      ))}
    </div>
  </>)
}
