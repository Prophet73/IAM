import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { tracker } from '../utils/tracker'

/* ═══════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════ */
type PMTab = 'dashboard' | 'progress' | 'contract' | 'issues' | 'team' | 'references'

/* ═══════════════════════════════════════════════════════════
   STATIC DATA
   ═══════════════════════════════════════════════════════════ */
const PROJECT = {
  name: 'АЭС Курск-2. Блок 1', code: 'KUR2-B1', status: 'В работе',
  statusColor: 'bg-green-100 text-green-700', completion: 67,
  startDate: '01.03.2024', plannedEnd: '30.11.2026',
  teamCount: 24, headcount: 28,
  contract: { number: 'ГК-2024/0341', date: '15.02.2024', monthlyCost: '4 850 000 ₽', totalPaid: '33 950 000 ₽', monthsPaid: 7, overdueActs: 1 },
  issues: { total: 18, critical: 3, controlled: 5, byStatus: { identified: 6, inProgress: 7, waiting: 3, resolved: 2 } },
}

const ISSUES_DATA = [
  { id: 1, title: 'Задержка поставки арматуры А500С', category: 'Снабжение', catColor: 'bg-orange-100 text-orange-700', priority: 'critical' as const, status: 'IN_PROGRESS' as const, date: '10.02.2026', daysAgo: 18, attachments: 3, description: 'Поставщик ООО МеталлТрейд задерживает партию арматуры А500С Ø25. Необходимо для бетонирования перекрытия на отм. +6.600. Срыв поставки влечет простой бригады монтажников.' },
  { id: 2, title: 'Несогласованность РД по секции С-3', category: 'Проектирование', catColor: 'bg-blue-100 text-blue-700', priority: 'high' as const, status: 'IN_PROGRESS' as const, date: '12.02.2026', daysAgo: 16, attachments: 2, description: 'Расхождение в координатах осей между разделами КЖ и АС. Отклонение до 45мм. Требуется корректировка РД.' },
  { id: 3, title: 'Дефицит сварщиков НАКС 6 разряда', category: 'Персонал', catColor: 'bg-purple-100 text-purple-700', priority: 'critical' as const, status: 'IDENTIFIED' as const, date: '14.02.2026', daysAgo: 14, attachments: 0, description: 'Для выполнения сварки трубопроводов ду100 требуется 3 сварщика с аттестацией НАКС 6 разряда. В наличии 1 специалист.' },
  { id: 4, title: 'Отказ башенного крана КБ-674', category: 'Техника', catColor: 'bg-red-100 text-red-700', priority: 'high' as const, status: 'WAITING' as const, date: '18.02.2026', daysAgo: 10, attachments: 4, description: 'Неисправность поворотного механизма. Ожидаем запчасти из Тулы. Альтернативный кран КБ-572 загружен на участке Б.' },
  { id: 5, title: 'Превышение допуска по осадке фунд.', category: 'Качество', catColor: 'bg-yellow-100 text-yellow-700', priority: 'critical' as const, status: 'IDENTIFIED' as const, date: '20.02.2026', daysAgo: 8, attachments: 1, description: 'По результатам геодезического мониторинга зафиксирована осадка 12мм при допуске 8мм. Секция Г-7.' },
  { id: 6, title: 'Задержка согласования ИРД', category: 'Документация', catColor: 'bg-gray-200 text-gray-700', priority: 'normal' as const, status: 'IN_PROGRESS' as const, date: '22.02.2026', daysAgo: 6, attachments: 5, description: 'На согласовании у технадзора заказчика находятся 4 комплекта ИРД по скрытым работам. Срок рассмотрения превышен.' },
  { id: 7, title: 'Подтопление котлована после осадков', category: 'Внешние', catColor: 'bg-teal-100 text-teal-700', priority: 'high' as const, status: 'RESOLVED' as const, date: '24.02.2026', daysAgo: 4, attachments: 2, description: 'После ливневых дождей 22-23.02 затоплен котлован на отм. -4.200. Водоотведение выполнено 25.02.' },
]

const ISSUE_DOCS = [
  { name: 'Предписание ППС-001.pdf', type: 'prescription', size: '2.4 МБ', date: '15.02' },
  { name: 'Фото_дефект_001.jpg', type: 'photo', size: '3.1 МБ', date: '16.02' },
  { name: 'Письмо ИСХ-041.pdf', type: 'letter', size: '580 КБ', date: '18.02' },
]

const ISSUE_COMMENTS = [
  { author: 'Петров П.С.', initials: 'ПП', date: '18 фев, 14:30', text: 'Связался с поставщиком, обещают отгрузку до 25.02' },
  { author: 'Иванов И.И.', initials: 'ИИ', date: '19 фев, 09:15', text: 'Нужно подготовить альтернативный вариант на случай срыва' },
]

const ISSUE_CATEGORIES = [
  { id: 'supply', name: 'Снабжение', icon: 'bg-orange-100 text-orange-600', count: 1, subs: ['Арматура', 'Бетон', 'Металлоконструкции'] },
  { id: 'design', name: 'Проектирование', icon: 'bg-blue-100 text-blue-600', count: 1, subs: ['Раздел КЖ', 'Раздел АС', 'Раздел ОВ'] },
  { id: 'personnel', name: 'Персонал', icon: 'bg-purple-100 text-purple-600', count: 1, subs: ['Сварщики', 'Монтажники', 'ИТР'] },
  { id: 'equipment', name: 'Техника', icon: 'bg-red-100 text-red-600', count: 1, subs: ['Краны', 'Транспорт', 'Механизмы'] },
  { id: 'quality', name: 'Качество', icon: 'bg-yellow-100 text-yellow-600', count: 1, subs: ['Геодезия', 'Лаборатория', 'ОТК'] },
  { id: 'docs', name: 'Документация', icon: 'bg-gray-200 text-gray-600', count: 1, subs: ['ИРД', 'Согласования', 'Реестры'] },
  { id: 'external', name: 'Внешние', icon: 'bg-teal-100 text-teal-600', count: 1, subs: ['Погода', 'Инфраструктура'] },
]

// @ts-expect-error reserved for future use
const ATTENDANCE = [
  { name: 'Иванов И.И.', role: 'Ведущий инженер', days: [1,1,1,1,1,0,0,1,1,1,1,1,0,0,1,1,1,1,1,0,0,1,1,1,1,1,0,0] },
  { name: 'Петров П.С.', role: 'Инженер СКС', days: [1,1,1,1,1,0,0,1,1,0,1,1,0,0,1,1,1,1,1,0,0,1,1,1,1,1,0,0] },
  { name: 'Сидорова А.В.', role: 'Инженер ОТК', days: [1,1,1,1,1,0,0,1,1,1,1,1,0,0,1,1,1,0,1,0,0,1,1,1,1,1,0,0] },
  { name: 'Козлов Д.М.', role: 'Геодезист', days: [1,1,1,1,1,0,0,1,1,1,1,1,0,0,1,1,1,1,1,0,0,1,1,1,1,0,0,0] },
  { name: 'Николаева Е.К.', role: 'Инженер ПТО', days: [1,1,1,1,1,0,0,1,1,1,1,1,0,0,1,1,1,1,1,0,0,1,1,1,1,1,0,0] },
  { name: 'Морозов А.Г.', role: 'Сварщик НАКС', days: [1,1,1,1,1,0,0,0,0,1,1,1,0,0,1,1,1,1,1,0,0,1,1,1,1,1,0,0] },
]

const PAYMENTS = [
  { period: 'Мар 2024', planned: 4850000, fact: 4850000, fte: 8.0, status: 'PAID', actSent: '05.04', actSigned: '12.04', paidDate: '20.04', act: 'АКТ-001' },
  { period: 'Апр 2024', planned: 4850000, fact: 4850000, fte: 8.0, status: 'PAID', actSent: '06.05', actSigned: '14.05', paidDate: '22.05', act: 'АКТ-002' },
  { period: 'Май 2024', planned: 4850000, fact: 4850000, fte: 8.0, status: 'PAID', actSent: '04.06', actSigned: '11.06', paidDate: '19.06', act: 'АКТ-003' },
  { period: 'Июн 2024', planned: 4850000, fact: 4850000, fte: 8.0, status: 'PAID', actSent: '05.07', actSigned: '12.07', paidDate: '21.07', act: 'АКТ-004' },
  { period: 'Июл 2024', planned: 4850000, fact: 4850000, fte: 7.5, status: 'PAID', actSent: '04.08', actSigned: '13.08', paidDate: '20.08', act: 'АКТ-005' },
  { period: 'Авг 2024', planned: 4850000, fact: 4850000, fte: 8.0, status: 'PAID', actSent: '05.09', actSigned: '12.09', paidDate: '19.09', act: 'АКТ-006' },
  { period: 'Сен 2024', planned: 4850000, fact: 4850000, fte: 8.0, status: 'PAID', actSent: '07.10', actSigned: '14.10', paidDate: '23.10', act: 'АКТ-007' },
  { period: 'Окт 2024', planned: 4850000, fact: 4200000, fte: 7.0, status: 'ACT_SIGNED', actSent: '06.11', actSigned: '18.11', paidDate: '—', act: 'АКТ-008' },
  { period: 'Ноя 2024', planned: 4850000, fact: null, fte: 8.0, status: 'ACT_SENT', actSent: '05.12', actSigned: '—', paidDate: '—', act: '—' },
  { period: 'Дек 2024', planned: 4850000, fact: null, fte: 8.0, status: 'OVERDUE', actSent: '—', actSigned: '—', paidDate: '—', act: '—' },
  { period: 'Янв 2025', planned: 4850000, fact: null, fte: 8.0, status: 'PLANNED', actSent: '—', actSigned: '—', paidDate: '—', act: '—' },
]

const PAY_STATUS: Record<string, { label: string; c: string }> = {
  PAID: { label: 'Оплачено', c: 'bg-green-50 text-green-600' },
  ACT_SIGNED: { label: 'Акт подписан', c: 'bg-blue-50 text-blue-600' },
  ACT_SENT: { label: 'Акт отправлен', c: 'bg-amber-50 text-amber-600' },
  OVERDUE: { label: 'Просрочено', c: 'bg-red-50 text-red-600' },
  PLANNED: { label: 'План', c: 'bg-gray-100 text-gray-500' },
}

// @ts-expect-error reserved for future use
const TEAM_MEMBERS = [
  { name: 'Иванов Иван Иванович', position: 'Ведущий инженер', fte: 1.0, status: 'active' },
  { name: 'Петров Петр Сергеевич', position: 'Инженер СКС', fte: 1.0, status: 'active' },
  { name: 'Сидорова Анна Владимировна', position: 'Инженер ОТК', fte: 1.0, status: 'active' },
  { name: 'Козлов Дмитрий Михайлович', position: 'Геодезист', fte: 0.5, status: 'active' },
  { name: 'Николаева Елена Константиновна', position: 'Инженер ПТО', fte: 1.0, status: 'active' },
  { name: 'Морозов Алексей Григорьевич', position: 'Сварщик НАКС', fte: 1.0, status: 'vacation' },
  { name: 'Васильева Мария Дмитриевна', position: 'Документовед', fte: 1.0, status: 'active' },
  { name: 'Кузнецов Сергей Павлович', position: 'Инженер-сметчик', fte: 0.5, status: 'active' },
]

const fmtMoney = (n: number | null) => n != null ? new Intl.NumberFormat('ru-RU').format(n) + ' ₽' : '—'

/* ═══════════════════════════════════════════════════════════
   TAB CONFIG — 6 tabs matching real ProjectHeader
   ═══════════════════════════════════════════════════════════ */
const PM_TABS: { key: PMTab; label: string }[] = [
  { key: 'dashboard', label: 'Дашборд' },
  { key: 'progress', label: 'Ход работ' },
  { key: 'contract', label: 'Договор' },
  { key: 'issues', label: 'Канбан проблем' },
  { key: 'team', label: 'Команда' },
  { key: 'references', label: 'Справочники' },
]

/* ═══════════════════════════════════════════════════════════
   MOBILE TEASER
   ═══════════════════════════════════════════════════════════ */
function MobileTeaser({ onClose }: { onClose: () => void }) {
  const B = '#2563EB'
  const screens = ['projects', 'pm', 'operations', 'pmu', 'director'] as const
  type Scr = typeof screens[number]
  const [scr, setScr] = useState<Scr>('projects')
  const idx = screens.indexOf(scr)

  // Swipe
  const touchRef = useRef<{ x: number; y: number } | null>(null)
  const handleTouchStart = (e: React.TouchEvent) => { touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY } }
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchRef.current) return
    const dx = e.changedTouches[0].clientX - touchRef.current.x
    const dy = e.changedTouches[0].clientY - touchRef.current.y
    touchRef.current = null
    if (Math.abs(dx) < 40 || Math.abs(dy) > Math.abs(dx)) return
    if (dx < 0 && idx < screens.length - 1) setScr(screens[idx + 1])
    if (dx > 0 && idx > 0) setScr(screens[idx - 1])
  }

  // PM sub-tab
  const [pmTab, setPmTab] = useState<'team' | 'contract' | 'attendance' | 'issues'>('team')
  useEffect(() => { if (scr !== 'pm') setPmTab('team') }, [scr])

  // Director tab
  const [dirTab, setDirTab] = useState<'portfolio' | 'finance' | 'staff'>('portfolio')
  useEffect(() => { if (scr !== 'director') setDirTab('portfolio') }, [scr])

  const labels: Record<Scr, string> = { projects: 'Проекты', pm: 'Кабинет РП', operations: 'Операционка', pmu: 'ПМЮ', director: 'Портфель' }

  return (
    <div className="flex md:hidden flex-col h-full bg-[#F8FAFC]" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {/* Header */}
      <div className="bg-white px-4 pt-4 pb-2 shrink-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[9px] text-white font-bold" style={{ background: B }}>P</div>
            <div><div className="text-sm font-bold text-slate-800">Puls</div><div className="text-[9px] text-slate-400">Оперативный контроль объектов</div></div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center border-none text-sm cursor-pointer">&times;</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b border-slate-200/60 px-1 shrink-0 overflow-x-auto scrollbar-hidden">
        {screens.map(s => (
          <button key={s} onClick={() => setScr(s)}
            className={`flex-1 px-1.5 py-2.5 text-[9px] font-semibold whitespace-nowrap transition-colors border-none cursor-pointer bg-transparent ${scr === s ? 'text-[#2563EB]' : 'text-slate-400'}`}
            style={scr === s ? { borderBottom: `2px solid ${B}` } : { borderBottom: '2px solid transparent' }}
          >{labels[s]}</button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">

        {/* ─── PROJECTS ─── */}
        {scr === 'projects' && <>
          <div className="text-[9px] text-slate-400 px-1">Выберите проект для работы</div>
          {[
            { code: 'KUR2-B1', name: 'АЭС Курск-2. Блок 1', pct: 67, status: 'В работе', color: 'green', team: 8, issues: 3 },
            { code: 'RES-A', name: 'ЖК «Объект-A» корп. 7-11', pct: 89, status: 'В работе', color: 'green', team: 12, issues: 1 },
            { code: 'RES-B', name: 'ЖК «Объект-B» корп. 3', pct: 34, status: 'В работе', color: 'green', team: 6, issues: 5 },
            { code: 'OFF-01', name: 'Офисный центр Сириус', pct: 12, status: 'Планирование', color: 'amber', team: 3, issues: 0 },
          ].map((p, i) => (
            <div key={i} className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm cursor-pointer" onClick={() => setScr('pm')}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[8px] font-mono font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">{p.code}</span>
                  <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full bg-${p.color}-100 text-${p.color}-700`}>{p.status}</span>
                </div>
                <span className="text-[9px] text-slate-300">→</span>
              </div>
              <div className="text-[11px] font-semibold text-slate-800 mb-2">{p.name}</div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-blue-500" style={{ width: `${p.pct}%` }} />
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-600">{p.pct}%</span>
                <span className="text-[8px] text-slate-400">👥{p.team}</span>
                {p.issues > 0 && <span className="text-[8px] text-red-500">⚠{p.issues}</span>}
              </div>
            </div>
          ))}
        </>}

        {/* ─── PM WORKSPACE ─── */}
        {scr === 'pm' && <>
          {/* Project header */}
          <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-slate-800">АЭС Курск-2. Блок 1</span>
              <span className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">67%</span>
            </div>
            <div className="text-[9px] text-slate-400">РП: Иванов А.С. · Срок: 15.12.2026</div>
          </div>

          {/* PM sub-tabs */}
          <div className="flex gap-1 overflow-x-auto scrollbar-hidden">
            {([['team', 'Команда'], ['contract', 'Контракт'], ['attendance', 'Табель'], ['issues', 'Проблемы']] as const).map(([k, l]) => (
              <button key={k} onClick={() => setPmTab(k)}
                className={`shrink-0 text-[9px] px-2.5 py-1.5 rounded-lg font-semibold border-none cursor-pointer transition-colors ${pmTab === k ? 'bg-[#2563EB]/10 text-[#2563EB]' : 'bg-white text-slate-400'}`}
              >{l}</button>
            ))}
          </div>

          {/* Team */}
          {pmTab === 'team' && <>
            <div className="text-[9px] text-slate-400 px-1">Штатное расписание: план / факт</div>
            {[
              { pos: 'Ведущий инженер СК', plan: 1, fact: 1, name: 'Петров И.А.' },
              { pos: 'Инженер СК', plan: 4, fact: 3, name: 'Сидоров, Козлов, Морозов' },
              { pos: 'Инженер ОТК', plan: 2, fact: 2, name: 'Волков Д., Лебедев К.' },
              { pos: 'Геодезист', plan: 1, fact: 1, name: 'Новиков Р.С.' },
            ].map((r, i) => (
              <div key={i} className="bg-white rounded-lg p-2.5 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-semibold text-slate-700">{r.pos}</div>
                  <div className="text-[8px] text-slate-400">{r.name}</div>
                </div>
                <div className={`text-[10px] font-bold ${r.fact < r.plan ? 'text-red-500' : 'text-green-600'}`}>{r.fact}/{r.plan}</div>
              </div>
            ))}
          </>}

          {/* Contract */}
          {pmTab === 'contract' && <>
            <div className="bg-white rounded-xl p-3 border border-slate-200 space-y-2">
              <div className="flex justify-between"><span className="text-[9px] text-slate-400">Контракт</span><span className="text-[10px] font-mono font-semibold text-slate-700">ДУ-2024/087</span></div>
              <div className="flex justify-between"><span className="text-[9px] text-slate-400">Стоимость/мес</span><span className="text-[10px] font-semibold text-slate-700">2 450 000 ₽</span></div>
              <div className="flex justify-between"><span className="text-[9px] text-slate-400">Срок</span><span className="text-[10px] font-semibold text-slate-700">01.03.2024 — 15.12.2026</span></div>
              <div className="flex justify-between"><span className="text-[9px] text-slate-400">ДС</span><span className="text-[10px] font-semibold text-slate-700">2 (продление + штат)</span></div>
            </div>
            <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider px-1">Оплаты</div>
            {[
              { month: 'Янв 2026', sum: '2 450 000', status: 'Оплачен', st: 'green' },
              { month: 'Фев 2026', sum: '2 450 000', status: 'Акт подписан', st: 'blue' },
              { month: 'Мар 2026', sum: '2 450 000', status: 'Акт отправлен', st: 'amber' },
            ].map((p, i) => (
              <div key={i} className="bg-white rounded-lg p-2.5 border border-slate-200 flex items-center justify-between">
                <div><div className="text-[10px] font-semibold text-slate-700">{p.month}</div><div className="text-[9px] text-slate-400">{p.sum} ₽</div></div>
                <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full bg-${p.st}-100 text-${p.st}-700`}>{p.status}</span>
              </div>
            ))}
          </>}

          {/* Attendance */}
          {pmTab === 'attendance' && <>
            <div className="text-[9px] text-slate-400 px-1">Март 2026 · Норма: 22 дн / 176 ч</div>
            <div className="bg-white rounded-xl p-2.5 border border-slate-200">
              {/* Mini calendar header */}
              <div className="grid grid-cols-7 gap-px mb-1">
                {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(d => (
                  <div key={d} className="text-[7px] text-slate-400 text-center font-semibold">{d}</div>
                ))}
              </div>
              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-px">
                {/* March 2026 starts on Sunday, offset 6 */}
                {Array.from({ length: 6 }, () => null).map((_, i) => <div key={`e${i}`} />)}
                {Array.from({ length: 31 }, (_, i) => i + 1).map(d => {
                  const isWeekend = [1, 7, 8, 14, 15, 21, 22, 28, 29].includes(d)
                  const isVacation = d >= 16 && d <= 20
                  const isSick = d === 10
                  const today = d === 6
                  return (
                    <div key={d} className={`w-full aspect-square rounded-sm flex items-center justify-center text-[7px] font-medium
                      ${isVacation ? 'bg-purple-100 text-purple-600' : isSick ? 'bg-red-100 text-red-500' : isWeekend ? 'bg-slate-50 text-slate-300' : today ? 'bg-blue-500 text-white' : 'text-slate-600'}
                    `}>{d}</div>
                  )
                })}
              </div>
              <div className="flex gap-3 mt-2 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-blue-500" /><span className="text-[7px] text-slate-400">Сегодня</span></div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-purple-100" /><span className="text-[7px] text-slate-400">Отпуск</span></div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-red-100" /><span className="text-[7px] text-slate-400">Больничный</span></div>
              </div>
            </div>
            {/* Engineer stats */}
            {[
              { name: 'Петров И.А.', hours: '44/176', rate: '100%' },
              { name: 'Сидоров К.М.', hours: '36/176', rate: '82%' },
              { name: 'Козлов Д.В.', hours: '44/176', rate: '100%' },
            ].map((e, i) => (
              <div key={i} className="bg-white rounded-lg p-2 border border-slate-200 flex items-center justify-between">
                <span className="text-[10px] text-slate-700">{e.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-slate-400">{e.hours}ч</span>
                  <span className={`text-[9px] font-bold ${e.rate === '100%' ? 'text-green-600' : 'text-amber-500'}`}>{e.rate}</span>
                </div>
              </div>
            ))}
          </>}

          {/* Issues */}
          {pmTab === 'issues' && <>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hidden">
              {['Все (9)', 'Критичные (2)', 'В работе (4)', 'Решено (3)'].map((f, i) => (
                <span key={f} className={`shrink-0 text-[8px] px-2 py-1 rounded-full font-medium ${i === 0 ? 'bg-[#2563EB]/10 text-[#2563EB]' : 'bg-white text-slate-400 border border-slate-200'}`}>{f}</span>
              ))}
            </div>
            {[
              { title: 'Задержка поставки арматуры', cat: 'СМР', priority: 'КРИТИЧНАЯ', pColor: 'red', days: 12, status: 'В работе' },
              { title: 'Просрочка акта КС-2 за январь', cat: 'Финансы', priority: 'ВЫСОКАЯ', pColor: 'orange', days: 8, status: 'В работе' },
              { title: 'Несогласованные изменения в РД', cat: 'РД', priority: 'КРИТИЧНАЯ', pColor: 'red', days: 5, status: 'Выявлена' },
              { title: 'Замечания Ростехнадзора п.3.2', cat: 'ИРД', priority: 'СРЕДНЯЯ', pColor: 'amber', days: 20, status: 'В работе' },
            ].map((issue, i) => (
              <div key={i} className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm" style={{ borderLeft: `3px solid ${issue.pColor === 'red' ? '#ef4444' : issue.pColor === 'orange' ? '#f97316' : '#f59e0b'}` }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded bg-${issue.pColor}-100 text-${issue.pColor}-600`}>{issue.priority}</span>
                  <span className="text-[8px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">{issue.cat}</span>
                </div>
                <div className="text-[10px] font-semibold text-slate-700 mb-1">{issue.title}</div>
                <div className="flex items-center justify-between">
                  <span className="text-[8px] text-slate-400">{issue.days} дн. открыта</span>
                  <span className="text-[8px] font-medium text-slate-500">{issue.status}</span>
                </div>
              </div>
            ))}
          </>}
        </>}

        {/* ─── OPERATIONS ─── */}
        {scr === 'operations' && <>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-200/50">
            <div className="text-[10px] font-bold text-blue-800 mb-1">Операционная отчётность</div>
            <div className="text-[9px] text-blue-600 leading-relaxed">Инженеры и РП фиксируют прогресс по этапам и проблемы на объектах. Данные консолидируются в портфельную картину наверх.</div>
          </div>

          {/* Progress updates */}
          <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider px-1">Прогресс по этапам</div>
          {[
            { obj: 'Блок 1 · Монолит', stage: 'Перекрытие отм. +12.6', pct: 78, delta: '+12%', status: 'В срок' },
            { obj: 'Блок 1 · Стены', stage: 'Армирование 3 этаж', pct: 45, delta: '+8%', status: 'Отстаёт' },
          ].map((p, i) => (
            <div key={i} className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-semibold text-slate-700">{p.obj}</span>
                <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${p.status === 'В срок' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{p.status}</span>
              </div>
              <div className="text-[10px] text-slate-600 mb-1.5">{p.stage}</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-blue-500" style={{ width: `${p.pct}%` }} />
                </div>
                <span className="text-[10px] font-bold text-slate-600">{p.pct}%</span>
                <span className="text-[8px] text-green-600 font-semibold">{p.delta}</span>
              </div>
            </div>
          ))}

          {/* Critical issues */}
          <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider px-1 mt-1">Критические проблемы</div>
          {[
            { cat: 'Снабжение', text: 'Задержка поставки арматуры А500С', daysAgo: 18, priority: 'critical' },
            { cat: 'Персонал', text: 'Дефицит сварщиков НАКС 6 разряда', daysAgo: 14, priority: 'critical' },
            { cat: 'Качество', text: 'Превышение допуска по осадке фундамента', daysAgo: 8, priority: 'critical' },
          ].map((p, i) => (
            <div key={i} className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600">{p.cat}</span>
                <span className="text-[8px] ml-auto text-slate-400">{p.daysAgo} дн. назад</span>
              </div>
              <div className="text-[10px] text-slate-700">{p.text}</div>
            </div>
          ))}

          {/* Flow arrow */}
          <div className="flex items-center justify-center py-1">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200/50">
              <span className="text-[9px] text-blue-600 font-semibold">Данные → ПМЮ → Директор</span>
              <svg className="w-3 h-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </div>
          </div>
        </>}

        {/* ─── PMU ─── */}
        {scr === 'pmu' && <>
          <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-3 border border-violet-200/50">
            <div className="text-[10px] font-bold text-violet-800 mb-1">ПМЮ — мультипроектный контроль</div>
            <div className="text-[9px] text-violet-600 leading-relaxed">Консолидация данных всех проектов. Критичные проблемы, сроки контрактов, загрузка персонала.</div>
          </div>

          {/* Filters */}
          <div className="flex gap-1 overflow-x-auto scrollbar-hidden">
            {[
              { l: 'Все (4)', active: true },
              { l: 'Критичные (1)', active: false },
              { l: 'Истекают <90д (1)', active: false },
              { l: 'Недобор (2)', active: false },
            ].map((f, i) => (
              <span key={i} className={`shrink-0 text-[8px] px-2 py-1 rounded-full font-medium ${f.active ? 'bg-violet-100 text-violet-700' : 'bg-white text-slate-400 border border-slate-200'}`}>{f.l}</span>
            ))}
          </div>

          {/* Project cards with consolidated metrics */}
          {[
            { name: 'АЭС Курск-2', pct: 67, critical: 2, staff: '7/8', contract: 'OK', cColor: 'green' },
            { name: 'ЖК «Объект-A» к.7-11', pct: 89, critical: 0, staff: '12/12', contract: '<60д', cColor: 'amber' },
            { name: 'ЖК «Объект-B» к.3', pct: 34, critical: 1, staff: '5/6', contract: 'OK', cColor: 'green' },
          ].map((p, i) => (
            <div key={i} className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-800">{p.name}</span>
                <span className="text-[10px] font-bold text-blue-600">{p.pct}%</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-1.5 rounded-lg bg-slate-50">
                  <div className={`text-[11px] font-bold ${p.critical > 0 ? 'text-red-500' : 'text-green-600'}`}>{p.critical}</div>
                  <div className="text-[7px] text-slate-400">Критичных</div>
                </div>
                <div className="text-center p-1.5 rounded-lg bg-slate-50">
                  <div className={`text-[11px] font-bold ${p.staff.split('/')[0] !== p.staff.split('/')[1] ? 'text-amber-500' : 'text-slate-700'}`}>{p.staff}</div>
                  <div className="text-[7px] text-slate-400">Персонал</div>
                </div>
                <div className="text-center p-1.5 rounded-lg bg-slate-50">
                  <div className={`text-[11px] font-bold text-${p.cColor}-600`}>{p.contract}</div>
                  <div className="text-[7px] text-slate-400">Контракт</div>
                </div>
              </div>
            </div>
          ))}

          {/* Critical issues across projects */}
          <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider px-1">Критичные проблемы</div>
          {[
            { project: 'Курск-2', issue: 'Задержка поставки арматуры', days: 12 },
            { project: 'Курск-2', issue: 'Несогласованные изменения в РД', days: 5 },
            { project: 'Объект-B', issue: 'Подрядчик приостановил работы', days: 3 },
          ].map((c, i) => (
            <div key={i} className="bg-red-50 rounded-lg p-2.5 border border-red-200/50 flex items-start gap-2">
              <span className="text-[8px] font-bold text-red-500 mt-0.5">!</span>
              <div className="flex-1">
                <div className="text-[10px] font-semibold text-red-700">{c.issue}</div>
                <div className="text-[8px] text-red-400">{c.project} · {c.days} дн.</div>
              </div>
            </div>
          ))}
        </>}

        {/* ─── DIRECTOR PORTFOLIO ─── */}
        {scr === 'director' && <>
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl p-3">
            <div className="text-[10px] font-bold text-white mb-1">Портфельный дашборд</div>
            <div className="text-[9px] text-slate-300 leading-relaxed">Консолидированная аналитика: загрузка, финансы, контракты, риски.</div>
          </div>

          {/* Director sub-tabs */}
          <div className="flex gap-1">
            {([['portfolio', 'Обзор'], ['finance', 'Финансы'], ['staff', 'Персонал']] as const).map(([k, l]) => (
              <button key={k} onClick={() => setDirTab(k)}
                className={`flex-1 text-[9px] py-1.5 rounded-lg font-semibold border-none cursor-pointer transition-colors ${dirTab === k ? 'bg-slate-800 text-white' : 'bg-white text-slate-400'}`}
              >{l}</button>
            ))}
          </div>

          {dirTab === 'portfolio' && <>
            {/* KPI cards */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: '👷', label: 'Загрузка', val: '87%', sub: '24/28 на объектах', trend: '+3%' },
                { icon: '💰', label: 'Выручка/чел', val: '312K', sub: '₽/мес на человека', trend: '+8%' },
                { icon: '📋', label: 'Контракты', val: '4', sub: '1 истекает <90д', trend: '' },
                { icon: '📈', label: 'Маржа', val: '34%', sub: 'средняя по портфелю', trend: '+2%' },
              ].map((k, i) => (
                <div key={i} className="bg-white rounded-xl p-2.5 border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-xs">{k.icon}</span>
                    <span className="text-[9px] text-slate-400">{k.label}</span>
                    {k.trend && <span className="text-[8px] text-green-500 ml-auto">{k.trend}</span>}
                  </div>
                  <div className="text-base font-bold text-slate-800">{k.val}</div>
                  <div className="text-[8px] text-slate-400">{k.sub}</div>
                </div>
              ))}
            </div>

            {/* Risk summary */}
            <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider px-1">Риски</div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Критичных проблем', val: '3', color: 'red' },
                { label: 'Срыв сроков', val: '1', color: 'amber' },
                { label: 'Истекающие контракты', val: '1', color: 'amber' },
                { label: 'Недобор персонала', val: '2', color: 'orange' },
              ].map((r, i) => (
                <div key={i} className={`rounded-lg p-2 border bg-${r.color}-50 border-${r.color}-200/50`}>
                  <div className={`text-sm font-bold text-${r.color}-600`}>{r.val}</div>
                  <div className="text-[8px] text-slate-500">{r.label}</div>
                </div>
              ))}
            </div>
          </>}

          {dirTab === 'finance' && <>
            {/* Monthly revenue/costs chart mock */}
            <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
              <div className="text-[10px] font-semibold text-slate-700 mb-2">Выручка и затраты, млн ₽</div>
              <div className="flex items-end gap-1.5 h-24">
                {[
                  { m: 'Окт', rev: 8.2, cost: 5.4 }, { m: 'Ноя', rev: 8.5, cost: 5.6 }, { m: 'Дек', rev: 9.1, cost: 5.8 },
                  { m: 'Янв', rev: 8.8, cost: 5.5 }, { m: 'Фев', rev: 9.4, cost: 6.0 }, { m: 'Мар', rev: 9.8, cost: 6.1 },
                ].map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                    <div className="w-full flex gap-px justify-center" style={{ height: '100%', alignItems: 'flex-end' }}>
                      <div className="w-2 rounded-t bg-blue-400" style={{ height: `${(d.rev / 10) * 100}%` }} />
                      <div className="w-2 rounded-t bg-slate-300" style={{ height: `${(d.cost / 10) * 100}%` }} />
                    </div>
                    <span className="text-[7px] text-slate-400">{d.m}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-4 mt-2 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-blue-400" /><span className="text-[7px] text-slate-400">Выручка</span></div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-slate-300" /><span className="text-[7px] text-slate-400">Затраты</span></div>
              </div>
            </div>

            {/* Per-project finance */}
            {[
              { name: 'IND-1',    rev: '2.45M', margin: '32%' },
              { name: 'Объект-A', rev: '3.80M', margin: '38%' },
              { name: 'Объект-B', rev: '1.95M', margin: '29%' },
              { name: 'OFF-01',   rev: '1.60M', margin: '35%' },
            ].map((p, i) => (
              <div key={i} className="bg-white rounded-lg p-2.5 border border-slate-200 flex items-center justify-between">
                <span className="text-[10px] font-semibold text-slate-700">{p.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-500">{p.rev}</span>
                  <span className="text-[10px] font-bold text-green-600">{p.margin}</span>
                </div>
              </div>
            ))}
          </>}

          {dirTab === 'staff' && <>
            {/* Utilization chart */}
            <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
              <div className="text-[10px] font-semibold text-slate-700 mb-2">Загрузка персонала</div>
              <div className="flex items-end gap-1 h-20">
                {[
                  { m: 'Окт', pct: 78 }, { m: 'Ноя', pct: 82 }, { m: 'Дек', pct: 80 },
                  { m: 'Янв', pct: 85 }, { m: 'Фев', pct: 84 }, { m: 'Мар', pct: 87 },
                  { m: 'Апр', pct: 90, forecast: true }, { m: 'Май', pct: 92, forecast: true },
                ].map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                    <div className={`w-full rounded-t ${(d as { forecast?: boolean }).forecast ? 'bg-blue-200 border border-dashed border-blue-300' : 'bg-blue-500'}`} style={{ height: `${d.pct}%` }} />
                    <span className="text-[6px] text-slate-400">{d.m}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-2 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-blue-500" /><span className="text-[7px] text-slate-400">Факт</span></div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-blue-200 border border-dashed border-blue-300" /><span className="text-[7px] text-slate-400">Прогноз</span></div>
              </div>
            </div>

            {/* By position */}
            <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider px-1">По должностям</div>
            {[
              { pos: 'Ведущий инженер СК', total: 4, on: 4 },
              { pos: 'Инженер СК', total: 14, on: 12 },
              { pos: 'Инженер ОТК', total: 6, on: 5 },
              { pos: 'Геодезист', total: 4, on: 3 },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-lg p-2.5 border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-slate-700">{s.pos}</span>
                  <span className={`text-[10px] font-bold ${s.on < s.total ? 'text-amber-500' : 'text-green-600'}`}>{s.on}/{s.total}</span>
                </div>
                <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-blue-500" style={{ width: `${(s.on / s.total) * 100}%` }} />
                </div>
              </div>
            ))}
          </>}
        </>}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 bg-white border-t border-slate-200/60 shrink-0">
        <div className="flex justify-center gap-1.5 mb-1.5">
          {screens.map((s, i) => (
            <div key={s} className={`rounded-full transition-all ${i === idx ? 'w-4 h-1.5' : 'w-1.5 h-1.5 bg-slate-300'}`} style={i === idx ? { background: B } : undefined} />
          ))}
        </div>
        <p className="text-[9px] text-slate-400 text-center">Полноэкранная версия с живым интерактивным демо доступна на ПК</p>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   MAIN EXPORT
   ═══════════════════════════════════════════════════════════ */
export function DemoPuls() {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<PMTab>('dashboard')
  const [showProfile, setShowProfile] = useState(false)
  const openedAt = useRef(0)

  const handleOpen = () => { setOpen(true); openedAt.current = Date.now(); tracker.track('demo_open', { product: 'puls' }) }
  const handleClose = useCallback(() => { setOpen(false); tracker.track('demo_close', { product: 'puls', duration_s: Math.round((Date.now() - openedAt.current) / 1000) }) }, [])

  const onEsc = useCallback((e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }, [handleClose])
  useEffect(() => {
    if (open) { document.addEventListener('keydown', onEsc); document.body.style.overflow = 'hidden' }
    return () => { document.removeEventListener('keydown', onEsc); document.body.style.overflow = '' }
  }, [open, onEsc])

  if (!open) return (
    <div className="btn-premium-wrap" onClick={handleOpen}>
      <button className="btn-premium">
        <div className="btn-premium-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold">Запустить демо</div>
          <div className="text-xs text-muted mt-0.5">Интерактивный концепт (live-демо)</div>
        </div>
        <svg className="btn-premium-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
    </div>
  )

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={handleClose}>
      <div className="relative w-[96vw] h-[92vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col bg-gray-100" onClick={e => e.stopPropagation()}>
        {/* Mobile teaser */}
        <MobileTeaser onClose={handleClose} />

        {/* ── PMLayout header (h-12) ── */}
        <header className="hidden md:block bg-white border-b shrink-0 h-12 relative z-50">
          <div className="h-full px-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">P</span>
                </div>
                <span className="text-sm font-bold text-gray-800 tracking-tight">Puls</span>
              </div>
              <div className="h-6 w-px bg-gray-300" />
              <button className="px-3 py-1 rounded text-xs bg-blue-100 text-blue-700 font-medium">Мои проекты</button>
            </div>
            <div className="relative flex items-center gap-3">
              <button onClick={handleClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 text-base">×</button>
              <button onClick={() => setShowProfile(!showProfile)} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100">
                <span className="text-xs text-gray-700">Хроменков Н.Д.</span>
                <div className="h-7 w-7 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center text-[10px] font-medium shadow-sm">ХН</div>
              </button>
              {showProfile && <>
                <div className="fixed inset-0 z-10" onClick={() => setShowProfile(false)} />
                <div className="absolute right-0 top-full mt-1 w-64 bg-white rounded-lg shadow-lg border z-20">
                  <div className="p-3 border-b">
                    <div className="text-sm font-medium text-gray-900">Хроменков Н.Д.</div>
                    <div className="text-xs text-gray-500">n.khromenkov@example.com</div>
                    <div className="mt-1 inline-block px-2 py-0.5 bg-gradient-to-r from-blue-100 to-indigo-100 text-indigo-700 rounded text-xs font-medium">Руководитель проекта</div>
                  </div>
                  <div className="py-1">
                    <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><span className="w-4 text-gray-400 text-xs">👤</span>Личный кабинет</button>
                    <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><span className="w-4 text-gray-400 text-xs">⚙</span>Настройки</button>
                  </div>
                  <div className="border-t py-1"><button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"><span className="w-4 text-xs">🚪</span>Выйти</button></div>
                </div>
              </>}
            </div>
          </div>
        </header>

        {/* ── ProjectHeader tabs (h-12) ── */}
        <div className="hidden md:flex bg-white border-b shrink-0 items-center gap-1 px-4 h-12 overflow-x-auto snap-x snap-mandatory scrollbar-hidden">
          {PM_TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`snap-start px-4 flex items-center h-full border-b-2 text-sm whitespace-nowrap transition-colors ${tab === t.key ? 'border-blue-500 text-blue-600 font-medium' : 'border-transparent text-gray-600 hover:text-gray-800'} ${t.key === 'issues' && tab !== 'issues' ? 'animate-guide-pulse' : ''}`}>
              {t.label}
            </button>
          ))}
          <div className="ml-auto text-xs text-gray-400 shrink-0 pr-2">{PROJECT.name}</div>
        </div>

        {/* ── Content ── */}
        <div className="hidden md:block flex-1 overflow-hidden">
          {tab === 'dashboard' && <DashboardScreen />}
          {tab === 'progress' && <ProgressScreen />}
          {tab === 'contract' && <ContractScreen />}
          {tab === 'issues' && <IssuesScreen />}
          {tab === 'team' && <TeamScreen />}
          {tab === 'references' && <ReferencesScreen />}
        </div>
      </div>
    </div>,
    document.body,
  )
}

/* ═══════════════════════════════════════════════════════════
   1. DASHBOARD
   ═══════════════════════════════════════════════════════════ */
function DashboardScreen() {
  return (
    <div className="h-full overflow-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Статус проекта</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${PROJECT.statusColor}`}>{PROJECT.status}</span>
          </div>
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1"><span className="text-gray-600">Готовность</span><span className="font-medium">{PROJECT.completion}%</span></div>
            <div className="w-full bg-gray-200 rounded-full h-3"><div className="bg-blue-600 h-3 rounded-full bar-grow" style={{ width: `${PROJECT.completion}%` }} /></div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-600">Начало:</span><span className="font-medium">{PROJECT.startDate}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">План. завершение:</span><span className="font-medium">{PROJECT.plannedEnd}</span></div>
          </div>
        </div>
        {/* Team */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold text-gray-800">Команда</h3><span className="text-blue-600 text-sm cursor-pointer">Подробнее →</span></div>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl">👥</div>
            <div><div className="text-3xl font-bold text-gray-800">{PROJECT.teamCount}</div><div className="text-sm text-gray-600">человек в команде</div></div>
          </div>
          <div className="mt-4 text-sm text-gray-500">По штатному расписанию: {PROJECT.headcount} чел.</div>
        </div>
        {/* Contract */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold text-gray-800">Контракт</h3><span className="text-blue-600 text-sm cursor-pointer">Подробнее →</span></div>
          <div className="text-sm text-gray-600 mb-3">№ {PROJECT.contract.number} от {PROJECT.contract.date}</div>
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div><div className="text-sm text-gray-600">Ежемесячно</div><div className="text-lg font-semibold">{PROJECT.contract.monthlyCost}</div></div>
            <div><div className="text-sm text-gray-600">Оплачено</div><div className="text-lg font-semibold text-green-600">{PROJECT.contract.totalPaid}</div></div>
          </div>
          <div className="flex justify-between text-sm"><span className="text-gray-600">Оплачено месяцев:</span><span className="font-medium">{PROJECT.contract.monthsPaid}</span></div>
          {PROJECT.contract.overdueActs > 0 && <div className="flex items-center gap-2 text-red-600 text-sm mt-2"><span>⚠</span>Просрочено актов: {PROJECT.contract.overdueActs}</div>}
        </div>
        {/* Issues */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold text-gray-800">Проблемы</h3><span className="text-blue-600 text-sm cursor-pointer">Канбан →</span></div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center"><span className="text-2xl font-bold text-orange-600">{PROJECT.issues.total}</span></div>
            <div className="text-sm text-gray-600">всего проблем</div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2"><span className="w-2 h-2 bg-red-500 rounded-full" />Критичных: <span className="font-medium text-red-600">{PROJECT.issues.critical}</span></div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 bg-yellow-500 rounded-full" />На контроле: <span className="font-medium text-yellow-600">{PROJECT.issues.controlled}</span></div>
          </div>
          <div className="border-t pt-3 mt-3 grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-600">Выявлено</span><span className="font-medium">{PROJECT.issues.byStatus.identified}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">В работе</span><span className="font-medium">{PROJECT.issues.byStatus.inProgress}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Ожидание</span><span className="font-medium">{PROJECT.issues.byStatus.waiting}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Решено</span><span className="font-medium">{PROJECT.issues.byStatus.resolved}</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   2. PROGRESS (Ход работ)
   ═══════════════════════════════════════════════════════════ */
function ProgressScreen() {
  const stages = [
    { name: 'Подготовительные работы', progress: 100, planned: '01.03 – 30.04.2024', status: 'Завершен' },
    { name: 'Земляные работы и фундамент', progress: 95, planned: '01.05 – 31.08.2024', status: 'Завершается' },
    { name: 'Монтаж каркаса', progress: 67, planned: '01.09.2024 – 28.02.2025', status: 'В работе' },
    { name: 'Инженерные сети', progress: 35, planned: '01.01 – 30.06.2025', status: 'В работе' },
    { name: 'Отделочные работы', progress: 0, planned: '01.07 – 30.09.2025', status: 'Не начат' },
    { name: 'Пусконаладка', progress: 0, planned: '01.10 – 30.11.2026', status: 'Не начат' },
  ]
  return (
    <div className="h-full overflow-auto p-6 bg-gray-50">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Ход работ</h1>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Экспорт отчета</button>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b"><tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Этап</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-48">Прогресс</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-48">Плановые сроки</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase w-28">Статус</th>
          </tr></thead>
          <tbody className="divide-y">{stages.map((s, i) => (
            <tr key={i} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm font-medium text-gray-900">{s.name}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2"><div className={`h-2 rounded-full bar-grow ${s.progress === 100 ? 'bg-green-500' : s.progress > 0 ? 'bg-blue-500' : 'bg-gray-300'}`} style={{ width: `${s.progress}%` }} /></div>
                  <span className="text-xs text-gray-600 w-8">{s.progress}%</span>
                </div>
              </td>
              <td className="px-4 py-3 text-xs text-gray-600">{s.planned}</td>
              <td className="px-4 py-3 text-center"><span className={`px-2 py-1 rounded-full text-xs font-medium ${s.status === 'Завершен' ? 'bg-green-100 text-green-700' : s.status === 'В работе' ? 'bg-blue-100 text-blue-700' : s.status === 'Завершается' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>{s.status}</span></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   3. CONTRACT — sidebar + FTE widget + payments table
   ═══════════════════════════════════════════════════════════ */
function ContractScreen() {
  return (
    <div className="flex h-full overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <aside className="w-80 shrink-0 bg-white border-r overflow-y-auto">
        <div className="p-5">
          <div className="flex items-center justify-between mb-4"><h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Договор</h3><button className="text-xs text-blue-600 hover:text-blue-800">Ред.</button></div>
          <div className="space-y-3 mb-6">
            <div><div className="text-xs text-gray-500">Номер</div><div className="text-sm font-semibold text-gray-900">{PROJECT.contract.number}</div></div>
            <div><div className="text-xs text-gray-500">Дата</div><div className="text-sm font-medium text-gray-800">{PROJECT.contract.date}</div></div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 mb-3 border border-blue-100">
            <div className="text-xs text-blue-600 mb-1">Стоимость / мес.</div><div className="text-xl font-bold text-blue-800">{PROJECT.contract.monthlyCost}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 mb-4 border border-green-100">
            <div className="text-xs text-green-600 mb-1">Итого оплачено</div><div className="text-xl font-bold text-green-800">{PROJECT.contract.totalPaid}</div>
          </div>
          <div className="space-y-2 text-sm mb-6">
            <div className="flex justify-between"><span className="text-gray-600">Оплачено месяцев</span><span className="font-medium">{PROJECT.contract.monthsPaid}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Штатная числ.</span><span className="font-medium">{PROJECT.headcount} чел.</span></div>
          </div>
          {/* Stages */}
          <div className="border-t pt-4 mb-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Этапы</h4>
            {['Мобилизация', 'Основные работы', 'Сдача'].map((s, i) => (
              <div key={i} className="flex items-center gap-2 py-1.5 text-sm">
                <span className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-green-500' : i === 1 ? 'bg-blue-500' : 'bg-gray-300'}`} />
                <span className="text-gray-700">{s}</span>
              </div>
            ))}
          </div>
          {/* Amendments */}
          <div className="border-t pt-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Допсоглашения</h4>
            <div className="p-3 bg-gray-50 rounded-lg border text-sm">
              <div className="flex justify-between items-center"><span className="font-medium">ДС №1</span><span className="text-xs text-gray-500">01.09.2024</span></div>
              <div className="text-xs text-gray-600 mt-1">Увеличение штата +4 чел.</div>
            </div>
            <button className="mt-3 w-full px-3 py-2 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">+ Добавить ДС</button>
          </div>
        </div>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* FTE timeline widget */}
        <div className="bg-white border-b px-4 py-2 flex items-center gap-4 shrink-0">
          <span className="text-sm font-medium text-gray-700">Периоды: 7/11 оплачено</span>
          <div className="flex items-center gap-0.5">
            {PAYMENTS.map((p, i) => (
              <div key={i} className={`w-3 h-4 rounded-sm ${p.status === 'PAID' ? 'bg-green-400' : p.status === 'OVERDUE' ? 'bg-red-400' : p.status === 'ACT_SENT' || p.status === 'ACT_SIGNED' ? 'bg-blue-400' : 'bg-gray-200'}`} title={p.period} />
            ))}
          </div>
          <span className="text-xs text-blue-600 ml-auto cursor-pointer">Команда и график →</span>
        </div>
        {/* Toolbar */}
        <div className="bg-white border-b px-4 py-2 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>✓ Оплачено: <b>{PAYMENTS.filter(p => p.status === 'PAID').length}</b></span>
            <span>⏳ В работе: <b>{PAYMENTS.filter(p => ['ACT_SENT', 'ACT_SIGNED'].includes(p.status)).length}</b></span>
            <span className="text-red-600">⚠ Просрочено: <b>{PAYMENTS.filter(p => p.status === 'OVERDUE').length}</b></span>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100">Экспорт</button>
            <button className="px-3 py-1.5 text-xs font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100">Импорт</button>
            <button className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">+ Добавить</button>
          </div>
        </div>
        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 sticky top-0 z-10 border-b text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Период</th>
                <th className="px-3 py-2 text-right font-medium">Сумма</th>
                <th className="px-3 py-2 text-center font-medium">FTE</th>
                <th className="px-3 py-2 text-left font-medium">Статус</th>
                <th className="px-3 py-2 text-left font-medium">Отправлен</th>
                <th className="px-3 py-2 text-left font-medium">Подписан</th>
                <th className="px-3 py-2 text-left font-medium">Оплата</th>
                <th className="px-3 py-2 text-left font-medium">Акт</th>
              </tr>
            </thead>
            <tbody>{PAYMENTS.map((p, i) => {
              const cfg = PAY_STATUS[p.status] || PAY_STATUS.PLANNED
              return (
                <tr key={i} className={`border-b hover:bg-gray-50 cursor-pointer ${p.status === 'PAID' ? 'bg-green-50/30' : p.status === 'OVERDUE' ? 'bg-red-50/30' : ''} ${p.status === 'PLANNED' ? 'opacity-50' : ''}`}>
                  <td className="px-3 py-2 font-medium text-gray-900">{p.period}</td>
                  <td className="px-3 py-2 text-right font-semibold text-gray-900">{fmtMoney(p.fact ?? p.planned)}</td>
                  <td className="px-3 py-2 text-center"><span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">{p.fte}</span></td>
                  <td className="px-3 py-2"><span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cfg.c}`}>{cfg.label}</span></td>
                  <td className="px-3 py-2 text-xs text-gray-500">{p.actSent}</td>
                  <td className="px-3 py-2 text-xs text-gray-500">{p.actSigned}</td>
                  <td className="px-3 py-2 text-xs">{p.paidDate !== '—' ? <span className="text-green-600 font-medium">{p.paidDate}</span> : '—'}</td>
                  <td className="px-3 py-2 text-xs text-gray-600">{p.act}</td>
                </tr>
              )
            })}</tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   4. ISSUES — 3-column layout with documents/comments
   ═══════════════════════════════════════════════════════════ */
function IssuesScreen() {
  const [selCat, setSelCat] = useState<string | null>(null)
  const [selIssue, setSelIssue] = useState<typeof ISSUES_DATA[0] | null>(null)
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set(ISSUE_CATEGORIES.slice(0, 3).map(c => c.id)))
  const filtered = selCat ? ISSUES_DATA.filter(i => i.category === ISSUE_CATEGORIES.find(c => c.id === selCat)?.name) : ISSUES_DATA

  const toggleCat = (id: string) => setExpandedCats(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  const IST: Record<string, { label: string; dot: string; border: string; bg: string }> = {
    IDENTIFIED: { label: 'Новая', dot: 'bg-red-500', border: 'border-l-red-500', bg: '' },
    IN_PROGRESS: { label: 'В работе', dot: 'bg-blue-500', border: 'border-l-blue-500', bg: '' },
    WAITING: { label: 'Ожидание', dot: 'bg-yellow-500', border: 'border-l-yellow-500', bg: '' },
    RESOLVED: { label: 'Закрыта', dot: 'bg-gray-400', border: 'border-l-gray-300', bg: 'opacity-60' },
  }
  const DOC_TYPE: Record<string, { color: string; bg: string; label: string }> = {
    prescription: { color: 'text-orange-600', bg: 'bg-orange-50', label: 'Предписание' },
    letter: { color: 'text-blue-600', bg: 'bg-blue-50', label: 'Письмо' },
    photo: { color: 'text-purple-600', bg: 'bg-purple-50', label: 'Фото' },
  }

  return (
    <div className="flex h-full overflow-hidden bg-gray-100">
      {/* Col 1: Classifier */}
      <aside className="w-[280px] bg-white border-r flex flex-col shrink-0">
        <div className="p-3 border-b bg-gray-50/80"><h2 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Классификатор</h2></div>
        <div className="flex-1 overflow-y-auto">
          {ISSUE_CATEGORIES.map(cat => (
            <div key={cat.id} className="border-b border-gray-100">
              <div className="flex items-center">
                <button onClick={() => { setSelCat(selCat === cat.id ? null : cat.id) }} className={`flex-1 flex items-center gap-2.5 px-3 py-2.5 hover:bg-gray-50 ${selCat === cat.id ? 'bg-blue-50' : ''}`}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${cat.icon}`}><span className="text-xs">●</span></div>
                  <div className="text-left flex-1"><div className="font-semibold text-sm text-gray-800">{cat.name}</div></div>
                  {cat.count > 0 && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${selCat === cat.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>{cat.count}</span>}
                </button>
                <button onClick={() => toggleCat(cat.id)} className="px-2 py-2.5 hover:bg-gray-100"><span className={`text-[10px] text-gray-400 ${expandedCats.has(cat.id) ? '▲' : '▼'}`}>{expandedCats.has(cat.id) ? '▲' : '▼'}</span></button>
              </div>
              {expandedCats.has(cat.id) && <div className="px-2 pb-2 space-y-0.5">
                {cat.subs.map(sub => <div key={sub} className="flex items-center px-2 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer group">
                  <span className="text-xs text-gray-700 flex-1">{sub}</span>
                  <button className="w-6 h-6 rounded flex items-center justify-center text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-blue-100 hover:text-blue-600 text-xs">+</button>
                </div>)}
              </div>}
            </div>
          ))}
        </div>
        <div className="p-3 border-t bg-gray-50/50"><button className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 text-sm font-medium">+ Вне списка</button></div>
      </aside>

      {/* Col 2: Feed */}
      <div className="w-[320px] shrink-0 border-r flex flex-col bg-gray-50/50">
        <div className="p-3 border-b bg-white shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Журнал проблем</h2>
            <span className="text-[10px] text-gray-400">{filtered.length} из {ISSUES_DATA.length}</span>
          </div>
          <div className="flex gap-2">
            <select className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white"><option>Все статусы</option><option>Новые</option><option>В работе</option><option>Ожидание</option><option>Закрытые</option></select>
          </div>
          <div className="flex gap-3 mt-2">
            <label className="flex items-center gap-1.5 text-xs cursor-pointer"><input type="checkbox" className="rounded border-gray-300 text-red-500" /><span className="text-red-600">Критичные</span></label>
            <label className="flex items-center gap-1.5 text-xs cursor-pointer animate-guide-pulse rounded-lg"><input type="checkbox" className="rounded border-gray-300 text-amber-500" /><span className="text-amber-600">На контроле</span></label>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filtered.map(issue => {
            const st = IST[issue.status]
            return (
              <div key={issue.id} onClick={() => setSelIssue(issue)}
                className={`group p-3 rounded-lg border cursor-pointer border-l-4 ${st.border} ${st.bg} ${selIssue?.id === issue.id ? 'bg-blue-50 ring-2 ring-blue-200 shadow-md border-l-blue-600' : 'bg-white shadow-sm hover:shadow-md border-gray-100'}`}>
                <div className="flex items-center gap-1.5 mb-2">
                  <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${issue.catColor}`}>{issue.category}</span>
                  {issue.priority === 'critical' && <span className="text-[9px] text-red-700 font-bold uppercase bg-red-100 px-1.5 py-0.5 rounded">Критично</span>}
                  {issue.priority === 'high' && <span className="text-[9px] text-amber-700 font-bold uppercase bg-amber-100 px-1.5 py-0.5 rounded">Внимание</span>}
                  <span className="text-[10px] text-gray-400 ml-auto">{issue.daysAgo} дн.</span>
                </div>
                <div className="text-sm font-medium text-gray-800 mb-2 leading-snug line-clamp-2">{issue.title}</div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5"><span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} /><span className="text-[10px] text-gray-500">{st.label}</span></div>
                  {issue.attachments > 0 && <span className="text-[10px] text-gray-400 flex items-center gap-1">📎 {issue.attachments}</span>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Col 3: Detail Panel */}
      <main className="flex-1 bg-white overflow-y-auto">
        {selIssue ? (
          <div>
            {/* Header */}
            <div className="p-5 border-b bg-gradient-to-b from-gray-50 to-white">
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-2 py-1 text-xs font-bold rounded-lg ${selIssue.catColor}`}>{selIssue.category}</span>
                <span className="text-xs text-gray-400 ml-auto">#{selIssue.id}</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2 leading-tight group cursor-pointer hover:bg-gray-100 rounded-lg px-2 py-1 -mx-2">
                {selIssue.title} <span className="text-gray-300 opacity-0 group-hover:opacity-100 text-sm">✏</span>
              </h1>
              <p className="text-sm text-gray-600 leading-relaxed">{selIssue.description}</p>
              <div className="flex items-center gap-3 mt-4 flex-wrap">
                {/* Status */}
                <button className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${selIssue.status === 'IDENTIFIED' ? 'bg-red-100 text-red-700' : selIssue.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' : selIssue.status === 'WAITING' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                  {IST[selIssue.status].label} ▾
                </button>
                {/* Priority */}
                <button className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${selIssue.priority === 'critical' ? 'bg-red-100 text-red-700' : selIssue.priority === 'high' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                  {selIssue.priority === 'critical' ? 'Критичный' : selIssue.priority === 'high' ? 'Высокий' : 'Обычный'} ▾
                </button>
                {/* Toggle buttons */}
                <button className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold ${selIssue.priority === 'critical' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-600'}`}>⚠ Критично</button>
                <button className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold bg-gray-100 text-gray-500 hover:bg-amber-100 hover:text-amber-600">👁 На контроле</button>
                <span className="text-xs text-gray-400 ml-auto">{selIssue.date}</span>
              </div>
            </div>

            {/* Documents Section */}
            <div className="p-5 border-b">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">📎 Документы <span className="bg-gray-200 text-gray-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{selIssue.attachments}</span></h3>
                <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">+ Добавить</button>
              </div>
              {selIssue.attachments > 0 ? (
                <div className="space-y-2">
                  {ISSUE_DOCS.map((doc, i) => {
                    const dt = DOC_TYPE[doc.type] || { color: 'text-gray-600', bg: 'bg-gray-50', label: 'Документ' }
                    return (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-white hover:bg-gray-50 cursor-pointer group">
                        <div className={`w-10 h-10 ${dt.bg} rounded-lg flex items-center justify-center shrink-0`}>
                          <span className={`text-sm ${dt.color}`}>{doc.type === 'prescription' ? '📋' : doc.type === 'photo' ? '📷' : '✉'}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-800 truncate">{doc.name}</div>
                          <div className="text-[11px] text-gray-400">{dt.label} · {doc.size} · {doc.date}</div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                          <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded text-xs">👁</button>
                          <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded text-xs">⬇</button>
                          <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded text-xs">🗑</button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="border-2 border-dashed rounded-lg p-6 text-center border-gray-300 hover:border-blue-400 cursor-pointer">
                  <span className="text-2xl text-gray-400 block mb-2">📤</span>
                  <p className="text-sm text-gray-600 font-medium">Нет документов</p>
                  <p className="text-xs text-gray-400 mt-1">Перетащите файлы или нажмите для загрузки</p>
                </div>
              )}
            </div>

            {/* Comments */}
            <div className="p-5 border-b">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">💬 Комментарии <span className="bg-gray-200 text-gray-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{ISSUE_COMMENTS.length}</span></h3>
              <div className="space-y-3">
                {ISSUE_COMMENTS.map((c, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center text-[9px] font-medium">{c.initials}</div>
                      <span className="text-xs font-semibold text-gray-700">{c.author}</span>
                      <span className="text-[10px] text-gray-400">{c.date}</span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed pl-8">{c.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Add comment */}
            <div className="p-5 border-b bg-gray-50/30">
              <div className="flex gap-2">
                <input placeholder="Добавить комментарий..." className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white" />
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">➤</button>
              </div>
            </div>

            {/* Actions */}
            <div className="p-5 space-y-3">
              {selIssue.status !== 'RESOLVED' && <>
                <button className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2">✓ Закрыть проблему</button>
                {selIssue.attachments === 0 && <p className="text-xs text-center text-gray-400">Для закрытия нужен хотя бы один документ</p>}
              </>}
              <button className="w-full py-2 text-gray-500 hover:text-red-600 text-xs font-medium flex items-center justify-center gap-1">🗑 Удалить проблему</button>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-300">
            <span className="text-4xl mb-4 opacity-20">📋</span>
            <p className="font-medium text-gray-400">Выберите проблему</p>
            <p className="text-sm text-gray-300 mt-1">или создайте новую из классификатора</p>
          </div>
        )}
      </main>
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════
   6. TEAM — full PM cabinet with collapsible sidebar
   ═══════════════════════════════════════════════════════════ */
type TeamSection = 'attendance' | 'staffing' | 'composition' | 'raci' | 'contract-staff'

const TEAM_NAV = [
  { cat: 'Операционка', items: [{ id: 'attendance' as TeamSection, label: 'Табель и Отпуска', icon: '📅', color: 'text-blue-600 bg-blue-100' }] },
  { cat: 'Отчетность', items: [{ id: 'staffing' as TeamSection, label: 'План / Факт (Сводка)', icon: '📊', color: 'text-green-600 bg-green-100' }] },
  { cat: 'Справочники', items: [
    { id: 'composition' as TeamSection, label: 'Состав команды', icon: '👥', color: 'text-purple-600 bg-purple-100' },
    { id: 'raci' as TeamSection, label: 'Матрица ОИУ', icon: '📋', color: 'text-orange-600 bg-orange-100' },
    { id: 'contract-staff' as TeamSection, label: 'График по договору', icon: '📄', color: 'text-gray-600 bg-gray-200' },
  ] },
]

function TeamScreen() {
  const [section, setSection] = useState<TeamSection>('attendance')
  const [collapsed, setCollapsed] = useState(false)
  const util = 94

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── Collapsible Sidebar ── */}
      <aside className={`${collapsed ? 'w-16' : 'w-64'} shrink-0 bg-slate-50 border-r flex flex-col transition-all duration-300`}>
        {/* FTE Summary */}
        {!collapsed && (
          <div className="p-4 border-b bg-white">
            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 font-semibold">Февраль 2026</div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="bg-blue-50 p-2 rounded border border-blue-100"><div className="text-[10px] text-blue-600">План FTE</div><div className="text-lg font-bold text-blue-800">8.0</div></div>
              <div className="bg-green-50 p-2 rounded border border-green-100"><div className="text-[10px] text-green-600">Факт FTE</div><div className="text-lg font-bold text-green-800">7.5</div></div>
            </div>
            <div className="flex items-center justify-between text-xs"><span className="text-gray-500">Загрузка:</span><span className={`font-bold ${util >= 85 && util <= 100 ? 'text-green-600' : util < 85 ? 'text-orange-600' : 'text-red-600'}`}>{util}%{util >= 85 && util <= 100 ? ' (Оптимально)' : util < 85 ? ' (Недобор)' : ' (Перерасход)'}</span></div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1"><div className={`h-1.5 rounded-full ${util >= 85 && util <= 100 ? 'bg-green-500' : util < 85 ? 'bg-orange-500' : 'bg-red-500'}`} style={{ width: `${Math.min(util, 100)}%` }} /></div>
          </div>
        )}
        {/* Nav */}
        <nav className="flex-1 p-2 overflow-y-auto">
          {TEAM_NAV.map(g => (
            <div key={g.cat}>
              {!collapsed && <div className="px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-2">{g.cat}</div>}
              {g.items.map(item => (
                <button key={item.id} onClick={() => setSection(item.id)} title={item.label}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm mb-0.5 transition-all ${section === item.id ? 'bg-white border border-gray-200 shadow-sm text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
                  <span className={`w-6 h-6 rounded flex items-center justify-center text-xs shrink-0 ${section === item.id ? 'bg-blue-100 text-blue-600' : item.color}`}>{item.icon}</span>
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>
        {/* Collapse toggle */}
        <button onClick={() => setCollapsed(!collapsed)} className="p-3 border-t text-gray-400 hover:text-gray-600 hover:bg-gray-100 text-xs text-center">
          {collapsed ? '▶' : '◀ Свернуть'}
        </button>
      </aside>

      {/* ── Content ── */}
      <main className="flex-1 flex flex-col min-w-0 bg-white overflow-hidden">
        {section === 'attendance' && <AttendanceSection />}
        {section === 'staffing' && <StaffingChartTab />}
        {section === 'composition' && <TeamCompositionTab />}
        {section === 'raci' && <RACIMatrixTab />}
        {section === 'contract-staff' && <ContractStaffTab />}
      </main>
    </div>
  )
}

/* ── Attendance Section: sub-tabs Табель / Отпуска ── */
function AttendanceSection() {
  const [subTab, setSubTab] = useState<'tabel' | 'vacations'>('tabel')
  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b shrink-0 bg-gray-50 px-4 pt-1">
        {[{ k: 'tabel' as const, l: 'Табель' }, { k: 'vacations' as const, l: 'Отпуска' }].map(t => (
          <button key={t.k} onClick={() => setSubTab(t.k)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg -mb-px transition-colors ${subTab === t.k ? 'bg-white text-blue-700 border-t-2 border-x border-blue-600 border-b-white' : 'text-gray-500 hover:text-gray-700 border border-transparent'}`}>{t.l}</button>
        ))}
      </div>
      {subTab === 'tabel' ? <AttendanceTab /> : <VacationsTab />}
    </div>
  )
}

/* ── Attendance Tab: toolbar + legend + calendar grid ── */
const ATT_LEGEND = [
  { code: '8', label: 'Явка', c: 'bg-green-50 text-green-800 border-green-200' },
  { code: 'О', label: 'Отпуск', c: 'bg-blue-50 text-blue-800 border-blue-200' },
  { code: 'Б', label: 'Больничный', c: 'bg-orange-50 text-orange-800 border-orange-200' },
  { code: 'К', label: 'Командировка', c: 'bg-purple-50 text-purple-800 border-purple-200' },
  { code: 'Н', label: 'Неявка', c: 'bg-red-50 text-red-800 border-red-200' },
  { code: 'ЗС', label: 'За свой счёт', c: 'bg-yellow-50 text-yellow-800 border-yellow-200' },
]

// Extended attendance data with statuses (O=vacation, B=sick, K=trip, N=absent)
const ATT_DATA: { name: string; role: string; days: (number | string)[] }[] = [
  { name: 'Иванов И.И.', role: 'Ведущий инженер', days: [8,8,8,8,8,0,0,8,8,8,8,8,0,0,8,8,8,8,8,0,0,8,8,8,8,8,0,0] },
  { name: 'Петров П.С.', role: 'Инженер СКС', days: [8,8,8,8,8,0,0,8,8,'Б','Б',8,0,0,8,8,8,8,8,0,0,8,8,8,8,8,0,0] },
  { name: 'Сидорова А.В.', role: 'Инженер ОТК', days: [8,8,8,8,8,0,0,8,8,8,8,8,0,0,8,8,8,'К',8,0,0,8,8,8,8,8,0,0] },
  { name: 'Козлов Д.М.', role: 'Геодезист', days: [8,8,8,8,8,0,0,8,8,8,8,8,0,0,8,8,8,8,8,0,0,8,8,8,8,0,0,0] },
  { name: 'Николаева Е.К.', role: 'Инженер ПТО', days: [8,8,8,8,8,0,0,8,8,8,8,8,0,0,8,8,8,8,8,0,0,8,8,8,8,8,0,0] },
  { name: 'Морозов А.Г.', role: 'Сварщик НАКС', days: ['О','О','О','О','О',0,0,'О','О','О',8,8,0,0,8,8,8,8,8,0,0,8,8,8,8,8,0,0] },
  { name: 'Васильева М.Д.', role: 'Документовед', days: [8,8,8,8,8,0,0,8,8,8,8,8,0,0,8,8,'Н',8,8,0,0,8,8,8,8,8,0,0] },
  { name: 'Кузнецов С.П.', role: 'Инженер-сметчик', days: [8,8,8,8,8,0,0,8,8,8,8,8,0,0,8,8,8,8,8,0,0,8,8,8,8,8,0,0] },
]

const weekendDays = new Set([5, 6, 12, 13, 19, 20, 26, 27])
const dayNames = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс','Пн','Вт','Ср','Чт','Пт','Сб','Вс','Пн','Вт','Ср','Чт','Пт','Сб','Вс','Пн','Вт','Ср','Чт','Пт','Сб','Вс']

function cellColor(v: number | string): string {
  if (typeof v === 'string') {
    if (v === 'О') return 'bg-blue-50 text-blue-700'
    if (v === 'Б') return 'bg-orange-50 text-orange-700'
    if (v === 'К') return 'bg-purple-50 text-purple-700'
    if (v === 'Н') return 'bg-red-50 text-red-700'
    if (v === 'ЗС') return 'bg-yellow-50 text-yellow-700'
  }
  if (v === 8) return 'bg-green-50 text-green-700'
  return 'bg-gray-100 text-gray-400'
}

function cellDisplay(v: number | string): string {
  if (typeof v === 'string') return v
  if (v === 8) return '8'
  return '—'
}

function AttendanceTab() {
  const [viewMode, setViewMode] = useState<'plan' | 'fact'>('fact')
  const [selCells, setSelCells] = useState<Set<string>>(new Set())

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Toolbar */}
      <div className="px-4 py-2 bg-gray-50 border-b shrink-0">
        <div className="flex items-center justify-between flex-wrap gap-2">
          {/* Month nav */}
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 border rounded hover:bg-gray-100 text-sm flex items-center justify-center">◀</button>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded font-medium text-sm min-w-[140px] text-center">Февраль 2026</span>
            <button className="w-8 h-8 border rounded hover:bg-gray-100 text-sm flex items-center justify-center">▶</button>
          </div>
          {/* Plan/Fact toggle */}
          <div className="inline-flex rounded border bg-white">
            <button onClick={() => setViewMode('plan')} className={`px-3 py-1.5 text-xs font-medium transition-colors ${viewMode === 'plan' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>План</button>
            <button onClick={() => setViewMode('fact')} className={`px-3 py-1.5 text-xs font-medium transition-colors ${viewMode === 'fact' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>Факт</button>
          </div>
          {/* Actions */}
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded hover:bg-green-700">Сгенерировать план</button>
            <button className="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded hover:bg-green-100">Экспорт Excel</button>
            <button className="px-3 py-1.5 text-xs font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded hover:bg-orange-100">Импорт</button>
          </div>
          {/* Legend */}
          <div className="flex items-center gap-1.5">
            {ATT_LEGEND.map(l => (
              <span key={l.code} className={`px-1.5 py-0.5 text-[10px] rounded border font-medium ${l.c}`}>{l.code} {l.label}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Selection toolbar */}
      {selCells.size > 0 && (
        <div className="px-4 py-2 bg-blue-50 border-b shrink-0 flex items-center gap-3">
          <span className="text-xs text-blue-700 font-medium">Выбрано ячеек: {selCells.size}</span>
          <div className="flex gap-1">
            {[{ l: '8ч', c: 'bg-green-500' }, { l: '12ч', c: 'bg-green-600' }, { l: 'О', c: 'bg-blue-500' }, { l: 'Б', c: 'bg-orange-500' }, { l: 'К', c: 'bg-purple-500' }, { l: 'Н', c: 'bg-red-500' }, { l: 'ЗС', c: 'bg-yellow-500' }].map(b => (
              <button key={b.l} className={`px-2 py-1 text-white rounded text-xs ${b.c}`}>{b.l}</button>
            ))}
            <button className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-xs">Очистить</button>
          </div>
          <button onClick={() => setSelCells(new Set())} className="ml-auto text-xs text-blue-600 hover:text-blue-800">Снять выделение</button>
        </div>
      )}

      {/* Stats bar */}
      <div className="bg-white border-b px-4 py-2.5 shrink-0 grid grid-cols-4 gap-4">
        <div className="text-center"><div className="text-xl font-bold text-blue-600">8</div><div className="text-xs text-gray-500">Инженеров</div></div>
        <div className="text-center"><div className="text-xl font-bold text-green-600">1 280</div><div className="text-xs text-gray-500">План часов</div></div>
        <div className="text-center"><div className="text-xl font-bold text-purple-600">1 136</div><div className="text-xs text-gray-500">Факт часов</div></div>
        <div className="text-center"><div className="text-xl font-bold text-orange-600">88.8%</div><div className="text-xs text-gray-500">Посещаемость</div></div>
      </div>

      {/* Calendar grid */}
      <div className="flex-1 overflow-auto">
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-max text-xs border-collapse">
            <thead className="sticky top-0 z-10 bg-gray-100">
              <tr>
                <th className="px-3 py-1.5 text-left font-medium text-gray-500 sticky left-0 z-20 bg-gray-100 min-w-[160px] border-b">ФИО</th>
                <th className="px-2 py-1.5 text-center font-medium text-gray-500 w-14 border-b">Норма</th>
                <th className="px-2 py-1.5 text-center font-medium text-gray-500 w-14 border-b">{viewMode === 'plan' ? 'План' : 'Факт'}</th>
                {Array.from({ length: 28 }, (_, i) => (
                  <th key={i} className={`w-12 min-w-[48px] border-b text-center ${weekendDays.has(i) ? 'bg-gray-200' : ''}`}>
                    <div className={`text-[10px] font-medium ${weekendDays.has(i) ? 'text-red-400' : 'text-gray-600'}`}>{i + 1}</div>
                    <div className="text-[9px] text-gray-400">{dayNames[i]}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>{ATT_DATA.map((e, idx) => {
              const total = e.days.filter(d => d === 8).length * 8
              const norm = 20 * 8
              return (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50/50">
                  <td className="px-3 py-1.5 sticky left-0 bg-white z-10 border-r">
                    <div className="font-medium text-gray-900 text-xs">{e.name}</div>
                    <div className="text-[10px] text-gray-500">{e.role}</div>
                  </td>
                  <td className="px-2 py-1.5 text-center text-gray-500">{norm}</td>
                  <td className="px-2 py-1.5 text-center font-semibold text-gray-800">{total}</td>
                  {e.days.map((d, di) => {
                    const key = `${idx}-${di}`
                    const selected = selCells.has(key)
                    return (
                      <td key={di} className={`text-center ${weekendDays.has(di) ? 'bg-gray-50' : ''}`}
                        onClick={() => setSelCells(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n })}>
                        <span className={`inline-flex items-center justify-center w-8 h-7 rounded text-[11px] font-medium cursor-pointer transition-all hover:ring-2 hover:ring-blue-300 ${cellColor(d)} ${selected ? 'ring-2 ring-inset ring-blue-500 bg-blue-100 text-blue-800' : ''}`}>
                          {cellDisplay(d)}
                        </span>
                      </td>
                    )
                  })}
                </tr>
              )
            })}</tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* ── Vacations Tab: Gantt timeline ── */
const VACATIONS = [
  { name: 'Морозов А.Г.', position: 'Сварщик НАКС', vacations: [{ type: 'annual', status: 'actual', start: 1, end: 10, label: 'Отп' }] },
  { name: 'Петров П.С.', position: 'Инженер СКС', vacations: [{ type: 'annual', status: 'planned', start: 60, end: 74, label: 'Отп' }, { type: 'sick', status: 'actual', start: 10, end: 11, label: 'Б/Л' }] },
  { name: 'Иванов И.И.', position: 'Ведущий инженер', vacations: [{ type: 'annual', status: 'planned', start: 120, end: 134, label: 'Отп' }] },
  { name: 'Сидорова А.В.', position: 'Инженер ОТК', vacations: [{ type: 'annual', status: 'approved', start: 180, end: 194, label: 'Отп' }] },
  { name: 'Николаева Е.К.', position: 'Инженер ПТО', vacations: [{ type: 'annual', status: 'planned', start: 210, end: 224, label: 'Отп' }] },
  { name: 'Козлов Д.М.', position: 'Геодезист', vacations: [{ type: 'study', status: 'planned', start: 90, end: 100, label: 'Уч' }] },
  { name: 'Васильева М.Д.', position: 'Документовед', vacations: [{ type: 'annual', status: 'planned', start: 270, end: 284, label: 'Отп' }] },
  { name: 'Кузнецов С.П.', position: 'Инженер-сметчик', vacations: [{ type: 'annual', status: 'planned', start: 300, end: 314, label: 'Отп' }] },
]
const MONTHS_SHORT = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']

function vacBarColor(type: string, status: string) {
  if (type === 'sick') return 'bg-red-400 text-white'
  if (type === 'unpaid') return 'bg-orange-400 text-white'
  if (type === 'study') return 'bg-purple-400 text-white'
  if (status === 'actual') return 'bg-blue-600 text-white'
  if (status === 'approved') return 'bg-blue-500 text-white'
  return 'bg-blue-400 text-white'
}

function VacationsTab() {
  const [view, setView] = useState<'gantt' | 'table'>('gantt')
  const todayOffset = ((31 + 28) / 365) * 100 // ~March 1 position

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Toolbar */}
      <div className="px-4 py-2 bg-gray-50 border-b shrink-0 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-700">2026</span>
          <div className="inline-flex rounded border bg-white">
            <button onClick={() => setView('gantt')} className={`px-3 py-1.5 text-xs font-medium ${view === 'gantt' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}>Гант</button>
            <button onClick={() => setView('table')} className={`px-3 py-1.5 text-xs font-medium ${view === 'table' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}>Таблица</button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 text-xs text-gray-600 bg-gray-100 border rounded hover:bg-gray-200">Синхр. с табелем</button>
          <button className="px-3 py-1.5 text-xs text-green-700 bg-green-50 border border-green-200 rounded hover:bg-green-100">Импорт</button>
          <button className="px-3 py-1.5 text-xs text-gray-700 bg-gray-50 border rounded hover:bg-gray-100">Экспорт</button>
          <button className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700">+ Добавить отпуск</button>
        </div>
      </div>
      {/* Legend */}
      <div className="px-4 py-1.5 bg-white border-b shrink-0 flex items-center gap-3 text-[10px]">
        {[{ l: 'Отпуск (план)', c: 'bg-blue-400' }, { l: 'Отпуск (факт)', c: 'bg-blue-600' }, { l: 'Больничный', c: 'bg-red-400' }, { l: 'За свой счёт', c: 'bg-orange-400' }, { l: 'Учебный', c: 'bg-purple-400' }].map(x => (
          <span key={x.l} className="flex items-center gap-1"><span className={`w-3 h-3 rounded ${x.c}`} /><span className="text-gray-600">{x.l}</span></span>
        ))}
      </div>

      {view === 'gantt' ? (
        <div className="flex-1 overflow-auto">
          <div className="min-w-[900px]">
            {/* Month headers */}
            <div className="sticky top-0 z-10 bg-gray-100 flex border-b">
              <div className="w-[200px] shrink-0 sticky left-0 z-20 bg-gray-100 px-3 py-2 text-xs font-medium text-gray-500">Сотрудник</div>
              <div className="flex-1 flex">
                {MONTHS_SHORT.map((m, i) => (
                  <div key={m} className={`flex-1 text-center text-xs py-2 font-medium ${i % 3 === 0 ? 'border-r border-gray-400 bg-gray-50' : 'border-r border-gray-200'} ${i === 1 ? 'text-blue-600' : 'text-gray-500'}`}>{m}</div>
                ))}
              </div>
            </div>
            {/* Rows */}
            {VACATIONS.map((emp, idx) => (
              <div key={idx} className="flex border-b border-gray-100 hover:bg-gray-50/50">
                <div className="w-[200px] shrink-0 sticky left-0 bg-white px-3 py-3 z-10">
                  <div className="text-sm font-medium text-gray-900">{emp.name}</div>
                  <div className="text-xs text-gray-500">{emp.position}</div>
                </div>
                <div className="flex-1 relative" style={{ minHeight: 48 }}>
                  {/* Month dividers */}
                  {Array.from({ length: 12 }, (_, i) => (
                    <div key={i} className={`absolute top-0 bottom-0 ${i % 3 === 0 ? 'border-r border-gray-300' : 'border-r border-gray-100'}`} style={{ left: `${((i + 1) / 12) * 100}%` }} />
                  ))}
                  {/* Today marker */}
                  <div className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10" style={{ left: `${todayOffset}%` }} />
                  {/* Bars */}
                  {emp.vacations.map((v, vi) => (
                    <div key={vi} className={`absolute top-2 h-8 rounded px-1.5 flex items-center text-[10px] font-medium shadow-sm hover:shadow-lg hover:scale-105 transition-all cursor-pointer z-[5] ${vacBarColor(v.type, v.status)}`}
                      style={{ left: `${(v.start / 365) * 100}%`, width: `${Math.max(((v.end - v.start) / 365) * 100, 2)}%`, minWidth: 24 }}>
                      {v.label}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto p-4">
          <table className="w-full bg-white rounded-lg border text-sm">
            <thead className="bg-gray-50 border-b"><tr>
              <th className="px-4 py-2 text-left font-medium text-gray-500">ФИО</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500">Начало</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500">Конец</th>
              <th className="px-4 py-2 text-center font-medium text-gray-500">Дней</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500">Тип</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500">Статус</th>
              <th className="px-4 py-2 text-center font-medium text-gray-500">Действия</th>
            </tr></thead>
            <tbody className="divide-y">{VACATIONS.flatMap(emp => emp.vacations.map((v, vi) => {
              const typeLabel: Record<string, { l: string; c: string }> = { annual: { l: 'Ежегодный', c: 'bg-blue-50 text-blue-700' }, sick: { l: 'Больничный', c: 'bg-red-50 text-red-700' }, unpaid: { l: 'За свой счёт', c: 'bg-orange-50 text-orange-700' }, study: { l: 'Учебный', c: 'bg-purple-50 text-purple-700' } }
              const statusLabel: Record<string, { l: string; c: string }> = { planned: { l: 'Запланировано', c: 'bg-blue-100 text-blue-700' }, approved: { l: 'Утвержден', c: 'bg-green-100 text-green-700' }, actual: { l: 'Факт', c: 'bg-green-100 text-green-800' } }
              const t = typeLabel[v.type] || typeLabel.annual
              const s = statusLabel[v.status] || statusLabel.planned
              return (
                <tr key={`${emp.name}-${vi}`} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium text-gray-900">{emp.name}</td>
                  <td className="px-4 py-2 text-gray-600">{`${String(v.start).padStart(2, '0')}.01.2026`}</td>
                  <td className="px-4 py-2 text-gray-600">{`${String(v.end).padStart(2, '0')}.01.2026`}</td>
                  <td className="px-4 py-2 text-center">{v.end - v.start}</td>
                  <td className="px-4 py-2"><span className={`px-2 py-0.5 rounded text-xs font-medium ${t.c}`}>{t.l}</span></td>
                  <td className="px-4 py-2"><span className={`px-2 py-0.5 rounded text-xs font-medium ${s.c}`}>{s.l}</span></td>
                  <td className="px-4 py-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {v.status === 'planned' && <button className="p-1 rounded hover:bg-green-100 text-green-600 text-xs" title="Утвердить">✓</button>}
                      <button className="p-1 rounded hover:bg-blue-100 text-blue-600 text-xs" title="Изменить">✎</button>
                      <button className="p-1 rounded hover:bg-red-100 text-red-600 text-xs" title="Удалить">✕</button>
                    </div>
                  </td>
                </tr>
              )
            }))}</tbody>
          </table>
        </div>
      )}
    </div>
  )
}

/* ── Staffing Chart Tab: metrics + chart + monthly table ── */
const STAFFING_MONTHS = [
  { m: 'Янв', contract: 8, plan: 8.0, fact: 7.5 },
  { m: 'Фев', contract: 8, plan: 8.0, fact: 7.0 },
  { m: 'Мар', contract: 8, plan: 8.0, fact: 0 },
  { m: 'Апр', contract: 8, plan: 8.0, fact: 0 },
  { m: 'Май', contract: 8, plan: 8.0, fact: 0 },
  { m: 'Июн', contract: 8, plan: 8.0, fact: 0 },
  { m: 'Июл', contract: 8, plan: 7.0, fact: 0 },
  { m: 'Авг', contract: 8, plan: 8.0, fact: 0 },
  { m: 'Сен', contract: 8, plan: 8.0, fact: 0 },
  { m: 'Окт', contract: 8, plan: 8.0, fact: 0 },
  { m: 'Ноя', contract: 8, plan: 8.0, fact: 0 },
  { m: 'Дек', contract: 8, plan: 7.0, fact: 0 },
]

function staffingCellColor(contract: number, val: number): string {
  if (val === 0) return ''
  const ratio = val / contract
  if (ratio > 1.1) return 'bg-red-100 text-red-700'
  if (ratio > 1.05) return 'bg-orange-100 text-orange-700'
  if (ratio < 0.85) return 'bg-yellow-100 text-yellow-700'
  return 'bg-green-50 text-green-700'
}

function StaffingChartTab() {
  const [view, setView] = useState<'summary' | 'detail'>('summary')
  const totalContract = STAFFING_MONTHS.reduce((s, m) => s + m.contract, 0)
  const totalPlan = STAFFING_MONTHS.reduce((s, m) => s + m.plan, 0)
  const totalFact = STAFFING_MONTHS.filter(m => m.fact > 0).reduce((s, m) => s + m.fact, 0)
  const utilPct = totalFact > 0 ? Math.round((totalFact / (STAFFING_MONTHS.filter(m => m.fact > 0).length * 8)) * 100) : 0

  return (
    <div className="h-full overflow-auto p-6 bg-gray-50">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">План / Факт (Сводка)</h2>
          <select className="px-3 py-1.5 border rounded text-sm bg-white"><option>2026</option><option>2025</option><option>2024</option></select>
        </div>
        <div className="flex items-center gap-3">
          <div className="inline-flex rounded border bg-white">
            <button onClick={() => setView('summary')} className={`px-3 py-1.5 text-xs font-medium ${view === 'summary' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}>Сводка</button>
            <button onClick={() => setView('detail')} className={`px-3 py-1.5 text-xs font-medium ${view === 'detail' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}>Детали</button>
          </div>
          <button className="px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded hover:bg-green-700">Пересчитать факт</button>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4"><div className="text-sm text-purple-600">Договор FTE (год)</div><div className="text-2xl font-bold text-purple-700">{totalContract.toFixed(1)}</div></div>
        <div className="bg-white rounded-lg shadow p-4"><div className="text-sm text-blue-600">Плановая загрузка</div><div className="text-2xl font-bold text-blue-700">{totalPlan.toFixed(1)}</div></div>
        <div className="bg-white rounded-lg shadow p-4"><div className="text-sm text-green-600">Фактическая загрузка</div><div className="text-2xl font-bold text-green-700">{totalFact.toFixed(1)}</div></div>
        <div className="bg-white rounded-lg shadow p-4"><div className="text-sm text-gray-600">Утилизация</div><div className={`text-2xl font-bold ${utilPct >= 85 && utilPct <= 100 ? 'text-green-600' : utilPct < 85 ? 'text-yellow-600' : 'text-red-600'}`}>{utilPct}%</div></div>
      </div>

      {/* Area chart simulation */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Динамика загрузки</h3>
        <div className="h-48 flex items-end gap-1">
          {STAFFING_MONTHS.map((m, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex flex-col items-center relative" style={{ height: 140 }}>
                {/* Contract bar */}
                <div className="absolute bottom-0 w-full rounded-t opacity-20 bg-purple-500" style={{ height: `${(m.contract / 8) * 100}%` }} />
                {/* Plan bar */}
                <div className="absolute bottom-0 w-[70%] rounded-t opacity-40 bg-blue-500" style={{ height: `${(m.plan / 8) * 100}%` }} />
                {/* Fact bar */}
                {m.fact > 0 && <div className="absolute bottom-0 w-[40%] rounded-t bg-green-500" style={{ height: `${(m.fact / 8) * 100}%` }} />}
              </div>
              <span className="text-[10px] text-gray-500">{m.m}</span>
            </div>
          ))}
        </div>
        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-3 text-xs">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-purple-500 opacity-40" />Договор</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-500 opacity-60" />План</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-500" />Факт</span>
        </div>
      </div>

      {/* Monthly summary table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b"><tr>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Месяц</th>
            <th className="px-4 py-3 text-center font-medium text-purple-600">Договор</th>
            <th className="px-4 py-3 text-center font-medium text-blue-600">План</th>
            <th className="px-4 py-3 text-center font-medium text-green-600">Факт</th>
            <th className="px-4 py-3 text-center font-medium text-gray-500">Отклонение</th>
            <th className="px-4 py-3 text-center font-medium text-gray-500">%</th>
            <th className="px-4 py-3 text-center font-medium text-gray-500">Статус</th>
          </tr></thead>
          <tbody className="divide-y">{STAFFING_MONTHS.map((m, i) => {
            const dev = m.fact > 0 ? m.fact - m.contract : 0
            const pct = m.fact > 0 ? Math.round((m.fact / m.contract) * 100) : 0
            const statusLabel = m.fact === 0 ? { l: '—', c: 'text-gray-400' } : pct >= 85 && pct <= 100 ? { l: 'Норма', c: 'bg-green-100 text-green-700' } : pct < 85 ? { l: 'Недобор', c: 'bg-yellow-100 text-yellow-700' } : { l: 'Перерасход', c: 'bg-red-100 text-red-700' }
            return (
              <tr key={i} className={`hover:bg-gray-50 ${m.fact > 0 ? staffingCellColor(m.contract, m.fact) : ''}`}>
                <td className="px-4 py-2 font-medium text-gray-900">{m.m}</td>
                <td className="px-4 py-2 text-center text-purple-700">{m.contract.toFixed(1)}</td>
                <td className="px-4 py-2 text-center text-blue-700">{m.plan.toFixed(1)}</td>
                <td className="px-4 py-2 text-center font-semibold text-green-700">{m.fact > 0 ? m.fact.toFixed(1) : '—'}</td>
                <td className="px-4 py-2 text-center">{m.fact > 0 ? <span className={dev < 0 ? 'text-yellow-600' : dev > 0 ? 'text-red-600' : 'text-green-600'}>{dev > 0 ? '+' : ''}{dev.toFixed(1)}</span> : '—'}</td>
                <td className="px-4 py-2 text-center">{pct > 0 ? `${pct}%` : '—'}</td>
                <td className="px-4 py-2 text-center">{statusLabel.l !== '—' ? <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusLabel.c}`}>{statusLabel.l}</span> : '—'}</td>
              </tr>
            )
          })}
          {/* Totals */}
          <tr className="bg-gray-50 font-bold border-t-2">
            <td className="px-4 py-2 text-gray-900">Итого</td>
            <td className="px-4 py-2 text-center text-purple-700">{totalContract.toFixed(1)}</td>
            <td className="px-4 py-2 text-center text-blue-700">{totalPlan.toFixed(1)}</td>
            <td className="px-4 py-2 text-center text-green-700">{totalFact.toFixed(1)}</td>
            <td className="px-4 py-2 text-center text-yellow-600">{(totalFact - STAFFING_MONTHS.filter(m => m.fact > 0).length * 8).toFixed(1)}</td>
            <td className="px-4 py-2 text-center">{utilPct}%</td>
            <td className="px-4 py-2 text-center"><span className={`px-2 py-0.5 rounded text-xs font-medium ${utilPct >= 85 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{utilPct >= 85 ? 'Норма' : 'Недобор'}</span></td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ── Team Composition Tab: vacancies, over-contract ── */
const COMP_MEMBERS = [
  { name: 'Иванов И.И.', realPos: 'Ведущий инженер', contractRole: 'Ведущий инженер', planFte: 1.0, factFte: 1.0, status: 'active', category: 'ИТР', overContract: false },
  { name: 'Петров П.С.', realPos: 'Инженер СКС', contractRole: 'Инженер СКС', planFte: 1.0, factFte: 0.9, status: 'sick', category: 'ИТР', overContract: false },
  { name: 'Сидорова А.В.', realPos: 'Инженер ОТК', contractRole: 'Инженер ОТК', planFte: 1.0, factFte: 1.0, status: 'active', category: 'ИТР', overContract: false },
  { name: 'Козлов Д.М.', realPos: 'Геодезист', contractRole: 'Геодезист', planFte: 0.5, factFte: 0.5, status: 'active', category: 'Специалисты', overContract: false },
  { name: 'Николаева Е.К.', realPos: 'Инженер ПТО', contractRole: 'Инженер ПТО', planFte: 1.0, factFte: 1.0, status: 'active', category: 'ИТР', overContract: false },
  { name: 'Морозов А.Г.', realPos: 'Сварщик НАКС', contractRole: 'Сварщик НАКС', planFte: 1.0, factFte: 0, status: 'vacation', category: 'Рабочие', overContract: false },
  { name: 'Васильева М.Д.', realPos: 'Документовед', contractRole: 'Документовед', planFte: 1.0, factFte: 1.0, status: 'active', category: 'ИТР', overContract: false },
  { name: 'Кузнецов С.П.', realPos: 'Инженер-сметчик', contractRole: 'Инженер-сметчик', planFte: 0.5, factFte: 0.5, status: 'active', category: 'ИТР', overContract: false },
  { name: null, realPos: null, contractRole: 'Инженер-эколог', planFte: 1.0, factFte: 0, status: 'vacancy', category: 'ИТР', overContract: false },
  { name: null, realPos: null, contractRole: 'Инженер по ОТ и ТБ', planFte: 1.0, factFte: 0, status: 'vacancy', category: 'ИТР', overContract: false },
  { name: 'Белов Р.А.', realPos: 'Стажёр ПТО', contractRole: '—', planFte: 0.5, factFte: 0.5, status: 'active', category: 'Доп. ресурсы', overContract: true },
]

function TeamCompositionTab() {
  const categories = [...new Set(COMP_MEMBERS.map(m => m.category))]
  const contractFte = COMP_MEMBERS.filter(m => !m.overContract).reduce((s, m) => s + m.planFte, 0)
  const assignedFte = COMP_MEMBERS.filter(m => m.name && !m.overContract).reduce((s, m) => s + m.planFte, 0)
  const factFte = COMP_MEMBERS.reduce((s, m) => s + m.factFte, 0)
  const vacancies = COMP_MEMBERS.filter(m => m.status === 'vacancy').length
  const overloaded = COMP_MEMBERS.filter(m => m.overContract).length

  return (
    <div className="h-full overflow-auto p-6 bg-gray-50">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Состав команды</h2>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 border rounded hover:bg-gray-100 text-sm flex items-center justify-center">◀</button>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded font-medium text-sm">Февраль 2026</span>
          <button className="w-8 h-8 border rounded hover:bg-gray-100 text-sm flex items-center justify-center">▶</button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100"><div className="text-sm text-blue-600">По договору</div><div className="text-2xl font-bold text-blue-800">{contractFte.toFixed(1)}</div></div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-100"><div className="text-sm text-green-600">Назначено</div><div className="text-2xl font-bold text-green-800">{assignedFte.toFixed(1)}</div></div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-100"><div className="text-sm text-purple-600">Факт FTE</div><div className="text-2xl font-bold text-purple-800">{factFte.toFixed(1)}</div></div>
        <div className={`rounded-lg p-4 border ${vacancies > 0 ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-200'}`}><div className="text-sm text-red-600">Вакансии</div><div className={`text-2xl font-bold ${vacancies > 0 ? 'text-red-700' : 'text-gray-400'}`}>{vacancies}</div></div>
        <div className={`rounded-lg p-4 border ${overloaded > 0 ? 'bg-orange-50 border-orange-100' : 'bg-gray-50 border-gray-200'}`}><div className="text-sm text-orange-600">Сверх договора</div><div className={`text-2xl font-bold ${overloaded > 0 ? 'text-orange-700' : 'text-gray-400'}`}>{overloaded}</div></div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b"><tr>
            <th className="px-4 py-3 text-left font-medium text-gray-500">ФИО</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Факт. должность</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Роль по договору</th>
            <th className="px-4 py-3 text-center font-medium text-gray-500">План FTE</th>
            <th className="px-4 py-3 text-center font-medium text-gray-500">Факт FTE</th>
            <th className="px-4 py-3 text-center font-medium text-gray-500">%</th>
            <th className="px-4 py-3 text-center font-medium text-gray-500">Статус</th>
          </tr></thead>
          <tbody>{categories.map(cat => (<>
            <tr key={`cat-${cat}`} className="bg-slate-100"><td colSpan={7} className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">{cat}</td></tr>
            {COMP_MEMBERS.filter(m => m.category === cat).map((m, i) => {
              const pct = m.planFte > 0 ? Math.round((m.factFte / m.planFte) * 100) : 0
              const isVacancy = m.status === 'vacancy'
              const isOver = m.overContract
              const statusBadge: Record<string, { l: string; c: string }> = {
                active: { l: 'Активен', c: 'bg-green-100 text-green-700' },
                vacation: { l: 'Отпуск', c: 'bg-blue-100 text-blue-700' },
                sick: { l: 'Больничный', c: 'bg-orange-100 text-orange-700' },
                vacancy: { l: 'ВАКАНСИЯ', c: 'bg-red-100 text-red-700 font-semibold' },
              }
              const st = statusBadge[m.status] || statusBadge.active
              return (
                <tr key={`${cat}-${i}`} className={`border-b hover:bg-gray-50 ${isVacancy ? 'bg-red-50 hover:bg-red-100 border-l-4 border-l-red-400' : isOver ? 'bg-yellow-50 hover:bg-yellow-100 border-l-4 border-l-yellow-400' : ''}`}>
                  <td className="px-4 py-2.5">
                    {m.name ? (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center text-[10px] font-medium shrink-0">{m.name.split(' ').slice(0, 2).map(n => n[0]).join('')}</div>
                        <span className="font-medium text-gray-900">{m.name}</span>
                      </div>
                    ) : (
                      <span className="text-red-500 italic">Не назначен</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-gray-700">{m.realPos || '—'}</td>
                  <td className="px-4 py-2.5">
                    <span className="text-gray-900">{m.contractRole}</span>
                    {isOver && <span className="ml-2 px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded text-[10px] font-semibold">Сверх договора</span>}
                  </td>
                  <td className="px-4 py-2.5 text-center">{m.planFte.toFixed(1)}</td>
                  <td className="px-4 py-2.5 text-center font-semibold">{m.factFte > 0 ? m.factFte.toFixed(1) : '—'}</td>
                  <td className="px-4 py-2.5 text-center"><span className={`text-xs font-medium ${!isVacancy && pct > 0 ? (pct > 110 ? 'text-red-600' : pct < 85 ? 'text-yellow-600' : 'text-green-600') : 'text-gray-400'}`}>{pct > 0 ? `${pct}%` : '—'}</span></td>
                  <td className="px-4 py-2.5 text-center">
                    {isVacancy ? (
                      <button className="px-3 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700">Нанять</button>
                    ) : (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${st.c}`}>{st.l}</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </>))}</tbody>
        </table>
      </div>
    </div>
  )
}

/* ── RACI (OIU) Matrix Tab: clickable cells O→И→У→empty ── */
const OIU_ROLES = ['РП', 'Вед. инж.', 'ОТК', 'СКС', 'Геод.', 'ПТО', 'Свар.']
const OIU_TASKS = [
  { cat: 'Входной контроль', tasks: [{ name: 'Приемка арматуры', doc: 'СП 70.13330', clause: 'п. 5.2', vals: ['О', 'У', 'И', '', '', 'У', ''] }, { name: 'Проверка бетонной смеси', doc: 'ГОСТ 7473', clause: 'п. 4.1', vals: ['', 'У', 'И', '', '', '', ''] }] },
  { cat: 'Геодезический контроль', tasks: [{ name: 'Разбивка осей', doc: 'СП 126.13330', clause: 'п. 7.3', vals: ['О', '', '', '', 'И', 'У', ''] }, { name: 'Исполнительная съемка', doc: 'СП 126.13330', clause: 'п. 8.1', vals: ['', '', 'У', '', 'И', 'У', ''] }] },
  { cat: 'Сварочные работы', tasks: [{ name: 'Контроль сварных соединений', doc: 'ГОСТ 23118', clause: 'п. 6.4', vals: ['', 'У', 'И', 'У', '', '', 'И'] }, { name: 'Аттестация сварщиков', doc: 'РД 03-615', clause: 'п. 3.1', vals: ['О', '', '', '', '', '', 'И'] }] },
  { cat: 'Документирование', tasks: [{ name: 'Оформление ИРД', doc: 'РД-11-02', clause: 'п. 5.6', vals: ['О', 'У', 'У', 'У', 'У', 'И', ''] }, { name: 'Акты скрытых работ', doc: 'РД-11-02', clause: 'п. 5.3', vals: ['О', 'И', 'И', '', 'У', 'У', ''] }] },
]

const OIU_STYLE: Record<string, { bg: string; text: string; border: string; label: string }> = {
  'О': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300', label: 'Ответственный' },
  'И': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', label: 'Исполнитель' },
  'У': { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-300', label: 'Участник' },
}
const OIU_CYCLE = ['О', 'И', 'У', '']

function RACIMatrixTab() {
  const [matrix, setMatrix] = useState(() => OIU_TASKS.flatMap(cat => cat.tasks.map(t => [...t.vals])))

  const cycleCell = (taskIdx: number, roleIdx: number) => {
    setMatrix(prev => {
      const next = prev.map(r => [...r])
      const cur = next[taskIdx][roleIdx]
      const ci = OIU_CYCLE.indexOf(cur)
      next[taskIdx][roleIdx] = OIU_CYCLE[(ci + 1) % OIU_CYCLE.length]
      return next
    })
  }

  let taskIdx = 0
  const countO = matrix.flat().filter(v => v === 'О').length
  const countI = matrix.flat().filter(v => v === 'И').length
  const countU = matrix.flat().filter(v => v === 'У').length

  return (
    <div className="h-full overflow-auto p-6 bg-gray-50">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Матрица ОИУ (ответственности)</h2>
          <p className="text-xs text-gray-500 mt-0.5">Кликните по ячейке для переключения: О → И → У → пусто</p>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 text-xs text-purple-700 bg-purple-50 border border-purple-200 rounded hover:bg-purple-100">Скачать шаблон</button>
          <button className="px-3 py-1.5 text-xs text-green-700 bg-green-50 border border-green-200 rounded hover:bg-green-100">Импорт Excel</button>
          <button className="px-3 py-1.5 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100">Заполнить шаблон</button>
          <button className="px-3 py-1.5 text-xs text-gray-700 bg-gray-100 border rounded hover:bg-gray-200">Экспорт CSV</button>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-gray-50 rounded-lg border p-3 mb-4 grid grid-cols-3 gap-3">
        {Object.entries(OIU_STYLE).map(([k, v]) => (
          <div key={k} className="flex items-center gap-2">
            <span className={`w-7 h-7 rounded flex items-center justify-center font-bold text-sm ${v.bg} ${v.text}`}>{k}</span>
            <span className="text-xs text-gray-700">{v.label}</span>
          </div>
        ))}
      </div>

      {/* Matrix table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto" style={{ maxHeight: 'calc(100vh - 400px)' }}>
        <table className="w-full text-xs" style={{ minWidth: 900 }}>
          <thead className="sticky top-0 z-10 bg-gray-100 border-b"><tr>
            <th className="px-2 py-2 text-left font-medium text-gray-500 w-8">№</th>
            <th className="px-3 py-2 text-left font-medium text-gray-500 min-w-[300px]">Вид работ / услуг</th>
            <th className="px-2 py-2 text-left font-medium text-gray-500 w-24">Документ</th>
            <th className="px-2 py-2 text-left font-medium text-gray-500 w-16">Пункт</th>
            {OIU_ROLES.map(r => <th key={r} className="px-1 py-2 text-center font-medium text-gray-500" style={{ minWidth: 50 }}>{r}</th>)}
          </tr></thead>
          <tbody>{OIU_TASKS.map((cat, ci) => (<>
            <tr key={`cat-${ci}`} className="bg-slate-200"><td colSpan={4 + OIU_ROLES.length} className="px-3 py-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">{cat.cat}</td></tr>
            {cat.tasks.map((t, ti) => {
              const idx = taskIdx++
              return (
                <tr key={`${ci}-${ti}`} className="border-b hover:bg-gray-50">
                  <td className="px-2 py-2 text-gray-500">{idx + 1}</td>
                  <td className="px-3 py-2 font-medium text-gray-900">{t.name}</td>
                  <td className="px-2 py-2 text-gray-600 text-[10px]">{t.doc}</td>
                  <td className="px-2 py-2 text-gray-500 text-[10px]">{t.clause}</td>
                  {OIU_ROLES.map((_, ri) => {
                    const val = matrix[idx]?.[ri] || ''
                    const style = OIU_STYLE[val]
                    return (
                      <td key={ri} className="px-1 py-2 text-center">
                        <button onClick={() => cycleCell(idx, ri)}
                          className={`w-7 h-7 rounded inline-flex items-center justify-center font-bold transition-all ${style ? `${style.bg} ${style.text}` : 'border-2 border-dashed border-gray-200 text-gray-300 hover:border-blue-300 hover:text-blue-400'}`}>
                          {val || '+'}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </>))}</tbody>
        </table>
      </div>

      {/* Stats */}
      <div className="mt-4 flex items-center gap-6 text-xs text-gray-500">
        <span>Задач: <b>{matrix.length}</b></span>
        <span>Ролей: <b>{OIU_ROLES.length}</b></span>
        <span className="text-red-600">О: <b>{countO}</b></span>
        <span className="text-blue-600">И: <b>{countI}</b></span>
        <span className="text-gray-600">У: <b>{countU}</b></span>
      </div>
    </div>
  )
}

/* ── Contract Staff Schedule Tab: year/month FTE grid ── */
const SCHEDULE_ROLES = [
  { role: 'Ведущий инженер', fteByMonth: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1] },
  { role: 'Инженер СКС', fteByMonth: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1] },
  { role: 'Инженер ОТК', fteByMonth: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1] },
  { role: 'Геодезист', fteByMonth: [0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5] },
  { role: 'Инженер ПТО', fteByMonth: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1] },
  { role: 'Сварщик НАКС', fteByMonth: [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0] },
  { role: 'Документовед', fteByMonth: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1] },
  { role: 'Инженер-сметчик', fteByMonth: [0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5] },
]
const SCHED_YEARS = [2024, 2025, 2026]
const SCHED_MONTHS_SHORT = ['М','А','М','И','И','А','С','О','Н','Д','Я','Ф','М','А','М','И','И','А','С','О','Н','Д','Я','Ф','М','А','М','И','И','А','С','О','Н']

function ContractStaffTab() {
  const [editMode, setEditMode] = useState(false)
  const [activeYear, setActiveYear] = useState(2026)
  // Current month index (March 2026 = index 24)
  const currentMonthIdx = 24

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
      {/* Control panel */}
      <div className="bg-white border-b px-5 py-3 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-gray-900">График загрузки</h2>
            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs border border-blue-200">{PROJECT.contract.number}</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-xs text-purple-700 bg-purple-50 border border-purple-200 rounded hover:bg-purple-100">Версии</button>
            <button onClick={() => setEditMode(!editMode)} className={`px-3 py-1.5 text-xs font-medium rounded ${editMode ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100'}`}>{editMode ? '● Ред.' : 'Ред.'}</button>
            <button className="px-3 py-1.5 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100">+ ДС</button>
          </div>
        </div>
        {/* Year pills */}
        <div className="flex items-center gap-2">
          {SCHED_YEARS.map(y => (
            <button key={y} onClick={() => setActiveYear(y)} className={`px-4 py-1 rounded-full text-xs font-medium ${activeYear === y ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'}`}>{y}</button>
          ))}
          <span className="text-xs text-gray-500 ml-2">Мар 2024 — Ноя 2026 (33 мес.)</span>
        </div>
      </div>

      {/* Schedule grid */}
      <div className="flex-1 overflow-auto">
        <table className="border-separate border-spacing-0 w-max text-xs">
          <thead className="sticky top-0 z-30">
            {/* Year row */}
            <tr className="bg-gray-100">
              <th className="sticky left-0 z-40 w-[280px] min-w-[280px] bg-gray-100 border-b border-r" />
              {SCHED_YEARS.map(y => {
                const count = y === 2024 ? 10 : y === 2025 ? 12 : 11
                return <th key={y} colSpan={count} className="border-b border-r px-2 py-1.5 text-center text-sm font-semibold text-gray-700">{y}</th>
              })}
            </tr>
            {/* Month row */}
            <tr className="bg-gray-50">
              <th className="sticky left-0 z-40 w-[280px] min-w-[280px] bg-gray-50 border-b border-r px-3 py-1.5 text-left font-medium text-gray-500">Должность</th>
              {SCHED_MONTHS_SHORT.map((m, i) => (
                <th key={i} className={`min-w-[60px] w-[60px] h-[30px] border-b border-r text-center font-medium ${i === currentMonthIdx ? 'bg-blue-100 text-blue-900 font-bold' : 'text-gray-500'}`}>{m}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SCHEDULE_ROLES.map((r, ri) => (
              <tr key={ri} className="border-b hover:bg-gray-50/50">
                <td className="sticky left-0 z-20 w-[280px] min-w-[280px] bg-white border-r px-3 py-2 font-medium text-gray-900">{r.role}</td>
                {r.fteByMonth.map((fte, mi) => (
                  <td key={mi} className={`text-center border-r py-1.5 ${mi === currentMonthIdx ? 'bg-blue-50' : ''} ${editMode ? 'cursor-pointer hover:bg-blue-100' : ''}`}>
                    {fte > 0 ? (
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${fte >= 1 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{fte}</span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
            {/* Summary row */}
            <tr className="bg-gray-100 font-bold border-t-2">
              <td className="sticky left-0 z-20 bg-gray-100 border-r px-3 py-2 text-gray-700">Итого FTE</td>
              {Array.from({ length: 33 }, (_, mi) => {
                const total = SCHEDULE_ROLES.reduce((s, r) => s + (r.fteByMonth[mi] || 0), 0)
                return <td key={mi} className={`text-center border-r py-1.5 ${mi === currentMonthIdx ? 'bg-blue-100' : ''}`}><span className="text-gray-800">{total.toFixed(1)}</span></td>
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Add role button */}
      {editMode && (
        <div className="bg-white border-t px-5 py-3 shrink-0">
          <button className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 text-sm font-medium">+ Добавить должность</button>
        </div>
      )}
    </div>
  )
}



/* ═══════════════════════════════════════════════════════════
   9. REFERENCES (Справочники)
   ═══════════════════════════════════════════════════════════ */
function ReferencesScreen() {
  const refs = [
    { name: 'Подрядные организации', count: 6, icon: '🏢' },
    { name: 'Локальные объекты', count: 14, icon: '📍' },
    { name: 'Классификатор проблем', count: 48, icon: '📋' },
    { name: 'Должности', count: 24, icon: '👤' },
    { name: 'Производственный календарь', count: 365, icon: '📅' },
  ]
  return (
    <div className="h-full overflow-auto p-6 bg-gray-50">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Справочники проекта</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {refs.map((r, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl group-hover:bg-blue-50">{r.icon}</div>
              <div><div className="font-semibold text-gray-900">{r.name}</div><div className="text-sm text-gray-500">{r.count} записей</div></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
