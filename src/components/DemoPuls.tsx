import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { tracker } from '../utils/tracker'
import { MobileStories, StorySlide, PainSlide, StoryClosingSlide } from './MobileStories'

/* ═══════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════ */
type PMTab = 'dashboard' | 'progress' | 'contract' | 'issues' | 'team' | 'economy' | 'references'

/* ═══════════════════════════════════════════════════════════
   STATIC DATA
   ═══════════════════════════════════════════════════════════ */
const PROJECT = {
  name: 'БЦ «Магеллан», корп. А1', code: 'MGL-A1', status: 'В работе',
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
  { key: 'economy', label: 'Экономика' },
  { key: 'references', label: 'Справочники' },
]

/* ═══════════════════════════════════════════════════════════
   ECONOMY MOCK DATA — 30 months (Apr 2024 — Sep 2026), 6 positions
   ═══════════════════════════════════════════════════════════ */
const ECONOMY_TOTAL_MONTHS = 30
const ECONOMY_CLOSED_MONTHS = 18  // апр'24 — сен'25 закрыто, окт'25 — прогноз

const MONTH_SHORT = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']

type Tone = 'ok' | 'under' | 'over_minor' | 'over_critical' | 'empty'

interface EconomyMonth {
  contract: number
  plan: number
  fact: number | null
}

interface TimelinePoint {
  label: string      // "Апр'24"
  monthShort: string // "Апр"
  yearShort: string  // "24"
  year: number
  month: number      // 1..12
  isYearStart: boolean // январь
}

interface EconomyPosition {
  id: string
  name: string
  months: EconomyMonth[]
}

const ECONOMY_TIMELINE: TimelinePoint[] = (() => {
  const out: TimelinePoint[] = []
  const startY = 2024, startM = 4 // апрель 2024
  for (let i = 0; i < ECONOMY_TOTAL_MONTHS; i++) {
    const m = ((startM - 1 + i) % 12) + 1
    const y = startY + Math.floor((startM - 1 + i) / 12)
    const monthShort = MONTH_SHORT[m - 1]
    const yearShort = String(y).slice(-2)
    out.push({
      label: `${monthShort}'${yearShort}`,
      monthShort, yearShort, year: y, month: m,
      isYearStart: m === 1,
    })
  }
  return out
})()

/* Линейная интерполяция между keypoints с округлением до шага 0.5 */
type Keypoint = [m: number, v: number]
function interp(keys: Keypoint[]): number[] {
  const out: number[] = []
  for (let i = 0; i < ECONOMY_TOTAL_MONTHS; i++) {
    let prev = keys[0], next = keys[keys.length - 1]
    for (let k = 0; k < keys.length - 1; k++) {
      if (keys[k][0] <= i && keys[k + 1][0] >= i) { prev = keys[k]; next = keys[k + 1]; break }
    }
    const v = prev[0] === next[0] ? prev[1] : prev[1] + (next[1] - prev[1]) * ((i - prev[0]) / (next[0] - prev[0]))
    out.push(Math.max(0, Math.round(v * 2) / 2))
  }
  return out
}

/* Детерминированный «шум» в [-1, 1] для индекса позиции и месяца */
function noise(seed: number, i: number): number {
  const h = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453
  return (h - Math.floor(h)) * 2 - 1
}

function buildPosition(
  id: string, name: string, seedIdx: number,
  contractKeys: Keypoint[],
  planKeys: Keypoint[] | null,    // если null → план = договор
  factNoise: number,              // амплитуда шума факта (например 0.05 = ±5%)
  factBias: number = 0,           // смещение факта (например -0.05 = систематический недобор 5%)
): EconomyPosition {
  const contract = interp(contractKeys)
  const plan = planKeys ? interp(planKeys) : [...contract]
  const months: EconomyMonth[] = contract.map((c, i) => {
    const p = plan[i]
    let fact: number | null
    if (i >= ECONOMY_CLOSED_MONTHS) fact = null
    else if (p === 0) fact = 0
    else fact = Math.round((p * (1 + factBias + noise(seedIdx, i) * factNoise)) * 100) / 100
    return { contract: c, plan: p, fact }
  })
  return { id, name, months }
}

const ECONOMY_POSITIONS: EconomyPosition[] = [
  // Ведущий инженер: стабильный, чуть растёт в пиковую фазу
  buildPosition('lead', 'Ведущий инженер', 1,
    [[0, 0.5], [3, 1.0], [8, 1.0], [12, 1.5], [22, 1.5], [26, 1.0], [29, 0.5]],
    null,
    0.04,
  ),
  // Инженер участка: основная масса, колоколом, недобор плана в пик
  buildPosition('site', 'Инженер участка', 2,
    [[0, 1.0], [3, 2.5], [6, 4.0], [10, 5.0], [16, 5.0], [20, 4.0], [24, 3.0], [29, 1.0]],
    [[0, 1.0], [3, 2.5], [6, 4.0], [10, 4.5], [13, 4.0], [16, 4.5], [20, 4.0], [24, 3.0], [29, 1.0]],
    0.06, -0.02,
  ),
  // Инженер по спецразделу: появляется только в стадии 2 (с ДС №2, мес 6)
  buildPosition('spec', 'Инженер по спецразделу', 3,
    [[0, 0], [5, 0], [6, 1.0], [20, 1.0], [22, 0.5], [24, 0]],
    null,
    0.05, 0.04, // лёгкий перегруз (иногда работают сверх плана)
  ),
  // Инженер контроля качества: стабильный 2.0, на пике 2.5
  buildPosition('qc', 'Инженер контроля качества', 4,
    [[0, 1.5], [4, 2.0], [10, 2.5], [18, 2.5], [22, 2.0], [26, 1.5], [29, 1.0]],
    null,
    0.04,
  ),
  // Геодезист: волнообразный, бывает 0.5 (точечные работы)
  buildPosition('geo', 'Геодезист', 5,
    [[0, 0.5], [3, 1.0], [6, 1.5], [10, 1.0], [14, 0.5], [18, 1.0], [22, 1.5], [26, 0.5], [29, 0.5]],
    [[0, 0.5], [3, 1.0], [6, 1.0], [10, 0.5], [14, 0.5], [18, 1.0], [22, 1.0], [26, 0.5], [29, 0.5]],
    0.05, -0.04, // систематический недобор плана
  ),
  // Руководитель ПТО: ровная единица всё время
  buildPosition('pto', 'Руководитель ПТО', 6,
    [[0, 1.0], [29, 1.0]],
    null,
    0.03,
  ),
]

const ECONOMY_VERSIONS = [
  { id: 'v1', label: 'Договор + ДС №1',  note: 'стартовая версия (апр 2024)',           active: false },
  { id: 'v2', label: 'Договор + ДС №2',  note: '+1 позиция по спецразделу (с окт 2024)', active: false },
  { id: 'v3', label: 'Договор + ДС №3',  note: 'продление до сен 2026',                  active: true  },
]

const ECONOMY_CURRENT_MONTH_IDX = ECONOMY_CLOSED_MONTHS - 1 // последний закрытый = сен'25

function classifyFact(fact: number | null, contract: number): Tone {
  if (fact == null) return 'empty'
  if (contract === 0 && fact === 0) return 'empty'
  if (contract === 0) return 'over_critical'
  const diff = fact - contract
  const pct = (diff / contract) * 100
  if (diff > 0 && pct >= 10) return 'over_critical'
  if (diff > 0 && pct >= 5)  return 'over_minor'
  if (diff < -0.05)           return 'under'
  return 'ok'
}

function classifyPositionLight(plan: number, contract: number): 'green' | 'yellow' | 'red' | 'gray' {
  if (contract === 0) return plan > 0 ? 'red' : 'gray'
  if (plan > contract + 0.001)   return 'red'
  if (plan < contract * 0.7)      return 'yellow'
  return 'green'
}

const TONE_BG: Record<Tone, string> = {
  ok: 'bg-emerald-50 text-emerald-700',
  under: 'bg-amber-50 text-amber-700',
  over_minor: 'bg-orange-50 text-orange-700',
  over_critical: 'bg-rose-50 text-rose-700',
  empty: 'bg-slate-50 text-slate-300',
}


/* ═══════════════════════════════════════════════════════════
   MOBILE TEASER (Stories)
   ═══════════════════════════════════════════════════════════ */
function MobileTeaser({ onClose }: { onClose: () => void }) {
  const B = '#4F46E5' // indigo

  const ROLES = [
    { initials: 'И',  name: 'Инженер',          desc: 'Журнал смены, операционные отчёты' },
    { initials: 'РП', name: 'Руководитель проекта', desc: 'Команда, договор, табели, проблемы', em: true },
    { initials: 'К',  name: 'Куратор',          desc: 'Группа объектов одного направления' },
    { initials: 'Д',  name: 'Директор',         desc: 'Портфельная картина — KPI, риски' },
  ]

  const slides: ReactNode[] = [
    /* 0 — Боль */
    <PainSlide
      key={0}
      title="Технический заказчик — десятки объектов"
      intro="Экономика проектов, риски, готовность по этапам, рабочие группы, оплаты, отклонения по работам — каждый показатель в своей системе."
      pains={[
        'Excel-справки и реестры в разных форматах',
        'Выгрузки из 1С и других учётных систем',
        'Оперативная переписка по почте и в чатах',
        'Свести всё в единую картину — трудоёмко',
      ]}
    />,

    /* 1 — Ролевые интерфейсы */
    <StorySlide
      key={1}
      title="5 ролей — 5 рабочих экранов"
      caption="У каждой роли свой набор данных и действий. Система собирается модулями — каждый стабилизируется отдельно, без «большой коробки, которую так и не запустят»."
    >
      <div className="w-full max-w-[320px] space-y-1.5">
        {ROLES.map(r => (
          <div
            key={r.name}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 border ${r.em ? 'bg-white shadow-sm' : 'bg-white/60'}`}
            style={r.em ? { borderColor: `${B}66` } : { borderColor: '#e2e8f0' }}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-[12px] font-bold text-white shrink-0"
              style={{ background: r.em ? B : '#94a3b8' }}
            >
              {r.initials}
            </div>
            <div className="text-left flex-1 min-w-0">
              <div className="text-[12px] font-bold text-slate-800">{r.name}</div>
              <div className="text-[11px] text-slate-500 leading-snug">{r.desc}</div>
            </div>
            {r.em && <span className="text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider" style={{ background: `${B}1a`, color: B }}>есть</span>}
          </div>
        ))}
      </div>
    </StorySlide>,

    /* 2 — Кабинет РП: 6 разделов */
    <StorySlide
      key={2}
      title="Кабинет руководителя проекта"
      caption="Один объект — все данные в одном месте. Команда, договор, табель, ход работ, проблемы, экономика."
    >
      <div className="w-full max-w-[320px] bg-white border border-slate-200 rounded-xl shadow-sm p-3 text-left">
        <div className="text-[11px] font-bold text-slate-700 mb-1">БЦ «Магеллан», корп. А1</div>
        <div className="text-[9px] text-slate-400 mb-3">РП: Иванов А.С. · 67% готовности</div>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { l: 'Команда',    v: '24 / 28', sub: 'факт / штат' },
            { l: 'Договор',    v: '4.85 М ₽', sub: 'в месяц' },
            { l: 'Табель',     v: '176 ч',   sub: 'норма марта' },
            { l: 'Проблемы',   v: '7',        sub: '3 критич.', warn: true },
          ].map(c => (
            <div key={c.l} className="rounded-lg bg-slate-50 px-2.5 py-1.5">
              <div className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">{c.l}</div>
              <div className={`text-[14px] font-extrabold ${c.warn ? 'text-rose-500' : 'text-slate-800'} tabular-nums`}>{c.v}</div>
              <div className="text-[9px] text-slate-400">{c.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </StorySlide>,

    /* 3 — Договор → штат → табель */
    <StorySlide
      key={3}
      title="Договор → штатное расписание → табель"
      caption="Главная связка: штат пересчитывается под договор, фактическая загрузка сравнивается с планом."
    >
      <div className="w-full max-w-[320px] space-y-2">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-3 flex items-center justify-between">
          <div className="text-left">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Договор</div>
            <div className="text-[12px] font-semibold text-slate-700 mt-0.5">ГК-2024/0341 · 8 чел.</div>
          </div>
          <div className="text-[10px] text-slate-500">→</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-3 text-left">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Команда: план / факт</div>
          {[
            { pos: 'Ведущий инженер', plan: 1, fact: 1 },
            { pos: 'Инженер СК', plan: 4, fact: 3, bad: true },
            { pos: 'Инженер ОТК', plan: 2, fact: 2 },
            { pos: 'Геодезист', plan: 1, fact: 1 },
          ].map(r => (
            <div key={r.pos} className="flex items-center justify-between py-1">
              <span className="text-[11px] text-slate-700">{r.pos}</span>
              <span className={`text-[11px] font-bold tabular-nums ${r.bad ? 'text-rose-500' : 'text-emerald-600'}`}>{r.fact}/{r.plan}</span>
            </div>
          ))}
        </div>
      </div>
    </StorySlide>,

    /* 4 — Журнал проблем */
    <StorySlide
      key={4}
      title="Журнал проблем по объекту"
      caption="Категория, приоритет, сколько дней открыта. Критичные автоматически уходят куратору и в портфельную картину."
    >
      <div className="w-full max-w-[320px] space-y-1.5">
        {ISSUES_DATA.slice(0, 3).map(i => {
          const pColor = i.priority === 'critical' ? '#ef4444' : i.priority === 'high' ? '#f97316' : '#94a3b8'
          return (
            <div
              key={i.id}
              className="bg-white border border-slate-200 rounded-xl shadow-sm px-3 py-2 text-left"
              style={{ borderLeft: `3px solid ${pColor}` }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: `${pColor}1a`, color: pColor }}>
                  {i.priority === 'critical' ? 'КРИТИЧНАЯ' : i.priority === 'high' ? 'ВЫСОКАЯ' : 'СРЕДНЯЯ'}
                </span>
                <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${i.catColor}`}>{i.category}</span>
              </div>
              <div className="text-[11px] font-semibold text-slate-700 leading-snug">{i.title}</div>
              <div className="text-[9px] text-slate-400 mt-0.5">{i.daysAgo} дн. открыта</div>
            </div>
          )
        })}
      </div>
    </StorySlide>,

    /* 5 — Закрытие */
    <StoryClosingSlide
      key={5}
      accent={B}
      onClose={onClose}
      title="Прототип — фундамент"
      caption="Реализован кабинет руководителя проекта с 6 разделами. Единый источник правды: от заявленной экономики по договору до фактического табеля людей на объекте."
    >
      <div className="w-full max-w-[300px] space-y-1.5">
        {[
          { v: 'Договор vs факт', l: 'штат и табель против контракта' },
          { v: 'Проектные показатели', l: 'риски, сроки, объёмы работ' },
          { v: 'От инженера до директора', l: 'каждая роль со своим срезом' },
        ].map(m => (
          <div key={m.l} className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3.5 py-2 gap-2">
            <span className="text-[11px] font-bold shrink-0" style={{ color: B }}>{m.v}</span>
            <span className="text-[10px] text-slate-500 text-right">{m.l}</span>
          </div>
        ))}
      </div>
    </StoryClosingSlide>,
  ]

  return (
    <MobileStories
      brand={{ initials: 'P', name: 'Puls', sub: 'Управление портфелем объектов', accent: B }}
      slides={slides}
      onClose={onClose}
    />
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
                <span className="text-xs text-gray-700">Хроменок Н.В.</span>
                <div className="h-7 w-7 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center text-[10px] font-medium shadow-sm">ХН</div>
              </button>
              {showProfile && <>
                <div className="fixed inset-0 z-10" onClick={() => setShowProfile(false)} />
                <div className="absolute right-0 top-full mt-1 w-64 bg-white rounded-lg shadow-lg border z-20">
                  <div className="p-3 border-b">
                    <div className="text-sm font-medium text-gray-900">Хроменок Н.В.</div>
                    <div className="text-xs text-gray-500">@psykhrometer</div>
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
          {tab === 'economy' && <EconomyScreen />}
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

/* ═══════════════════════════════════════════════════════════
   7. ECONOMY — реальный модуль из Puls (адаптация)
   ═══════════════════════════════════════════════════════════ */
function EconomyScreen() {
  const [versionId, setVersionId] = useState('v3')
  const [view, setView] = useState<'chart' | 'table'>('chart')
  const monthIdx = ECONOMY_CURRENT_MONTH_IDX

  const monthAgg = useMemo(() => ECONOMY_TIMELINE.map((t, i) => {
    const contract = ECONOMY_POSITIONS.reduce((s, p) => s + p.months[i].contract, 0)
    const plan = ECONOMY_POSITIONS.reduce((s, p) => s + p.months[i].plan, 0)
    const facts = ECONOMY_POSITIONS.map(p => p.months[i].fact)
    const hasAnyFact = facts.some(f => f != null)
    const fact = hasAnyFact ? facts.reduce<number>((s, f) => s + (f ?? 0), 0) : null
    return { tp: t, month: t.label, contract, plan, fact }
  }), [])

  const totalsClosed = monthAgg.filter(m => m.fact != null)
  const yearContract = monthAgg.reduce((s, m) => s + m.contract, 0)
  const yearPlan = monthAgg.reduce((s, m) => s + m.plan, 0)
  const yearFact = totalsClosed.reduce<number>((s, m) => s + (m.fact ?? 0), 0)
  const closedContract = totalsClosed.reduce((s, m) => s + m.contract, 0)
  const closedPlan = monthAgg.slice(0, totalsClosed.length).reduce((s, m) => s + m.plan, 0)
  const utilization = closedContract > 0 ? (yearFact / closedContract) * 100 : 0
  const factDelta = yearFact - closedContract
  const factDeltaPct = closedContract > 0 ? (factDelta / closedContract) * 100 : 0
  const planDelta = closedPlan - closedContract
  const planDeltaPct = closedContract > 0 ? (planDelta / closedContract) * 100 : 0

  const lightPositions = ECONOMY_POSITIONS.map(p => {
    const m = p.months[monthIdx]
    return { id: p.id, name: p.name, contract: m.contract, plan: m.plan, tone: classifyPositionLight(m.plan, m.contract) }
  }).sort((a, b) => {
    const order = { red: 0, yellow: 1, green: 2, gray: 3 } as const
    return order[a.tone] - order[b.tone] || b.contract - a.contract
  })
  const problems = lightPositions.filter(p => p.tone === 'red' || p.tone === 'yellow').length

  return (
    <div className="h-full overflow-auto bg-slate-50">
      <div className="p-6 space-y-4">

        {/* ── ContractVersionBanner ── */}
        <div className="bg-white border border-slate-200 rounded-lg px-4 py-3 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Версия договора</span>
          </div>
          <div className="flex items-center rounded-md border border-slate-200 bg-slate-50 overflow-hidden">
            {ECONOMY_VERSIONS.map(v => (
              <button
                key={v.id}
                onClick={() => setVersionId(v.id)}
                className={`px-3 py-1.5 text-xs font-semibold transition-colors border-none cursor-pointer ${
                  versionId === v.id ? 'bg-white text-indigo-700 shadow-sm' : 'bg-transparent text-slate-500 hover:text-slate-700'
                }`}
                title={v.note}
              >
                {v.label}
                {v.active && <span className="ml-1.5 text-[9px] px-1 py-0.5 rounded bg-emerald-100 text-emerald-700">актив</span>}
              </button>
            ))}
          </div>
          <div className="text-[11px] text-slate-500 ml-auto">
            {ECONOMY_VERSIONS.find(v => v.id === versionId)?.note}
          </div>
        </div>

        {/* ── KPI Cards (за закрытые 6 мес — одинаковая база для сравнения) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <KPICard
            accent="indigo"
            title="Договор"
            subtitle={`за ${totalsClosed.length} закрытых мес из ${ECONOMY_TOTAL_MONTHS}`}
            big={`${closedContract.toFixed(1)} FTE·мес`}
            hint={`весь срок — ${yearContract.toFixed(1)} FTE·мес`}
          />
          <KPICard
            accent="sky"
            title="План (Штатка)"
            subtitle={`за ${totalsClosed.length} закрытых мес`}
            big={`${closedPlan.toFixed(1)} FTE·мес`}
            hint={`Δ к договору ${planDelta >= 0 ? '+' : ''}${planDelta.toFixed(1)} (${planDeltaPct >= 0 ? '+' : ''}${planDeltaPct.toFixed(1)}%)`}
            tone={planDelta < -0.5 ? 'amber' : 'emerald'}
          />
          <KPICard
            accent="emerald"
            title="Факт (Табель)"
            subtitle={`за ${totalsClosed.length} закрытых мес`}
            big={`${yearFact.toFixed(1)} FTE·мес`}
            hint={`Δ к договору ${factDelta >= 0 ? '+' : ''}${factDelta.toFixed(1)} (${factDeltaPct >= 0 ? '+' : ''}${factDeltaPct.toFixed(1)}%)`}
            tone={factDeltaPct < -8 ? 'amber' : factDeltaPct >= 5 ? 'rose' : 'emerald'}
          />
          <KPICard
            accent="slate"
            title="Утилизация"
            subtitle="Факт ÷ Договор"
            big={`${utilization.toFixed(1)}%`}
            hint={`${yearFact.toFixed(1)} / ${closedContract.toFixed(1)} FTE·мес`}
            tone={utilization < 85 ? 'amber' : utilization > 105 ? 'rose' : 'emerald'}
          />
        </div>

        {/* ── PositionLighthouse ── */}
        <div className="bg-white border border-slate-200 rounded-lg px-4 py-3 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Позиции · {ECONOMY_TIMELINE[monthIdx].monthShort} 20{ECONOMY_TIMELINE[monthIdx].yearShort}
            </span>
            {problems > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 font-bold">
                {problems} внимание
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
            {lightPositions.map(p => {
              const tone = p.tone
              const border = tone === 'green' ? 'border-emerald-200' : tone === 'yellow' ? 'border-amber-200' : tone === 'red' ? 'border-rose-200' : 'border-slate-200'
              const dot = tone === 'green' ? 'bg-emerald-500' : tone === 'yellow' ? 'bg-amber-500' : tone === 'red' ? 'bg-rose-500' : 'bg-slate-300'
              return (
                <span
                  key={p.id}
                  title={`${p.name} · договор ${p.contract.toFixed(1)} / план ${p.plan.toFixed(1)}`}
                  className={`inline-flex items-center gap-2 border bg-white rounded-md px-2.5 py-1.5 text-xs transition-colors hover:shadow-sm ${border}`}
                >
                  <span className={`w-2 h-2 rounded-full ${dot}`} />
                  <span className="font-semibold text-slate-700">{p.name}</span>
                  <span className="tabular-nums text-[11px] text-slate-500 ml-0.5">
                    <span className="font-bold text-slate-700">{p.contract.toFixed(1)}</span>
                    <span className="text-slate-400 mx-0.5">/</span>
                    <span className="font-bold text-slate-700">{p.plan.toFixed(1)}</span>
                  </span>
                </span>
              )
            })}
          </div>
        </div>

        {/* ── Toolbar ── */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="inline-flex rounded border border-slate-300 bg-white overflow-hidden">
            <button
              onClick={() => setView('chart')}
              className={`px-3 py-1 text-xs font-semibold border-none cursor-pointer transition-colors ${view === 'chart' ? 'bg-sky-600 text-white' : 'bg-transparent text-slate-600 hover:bg-slate-50'}`}
            >📊 Диаграмма</button>
            <button
              onClick={() => setView('table')}
              className={`px-3 py-1 text-xs font-semibold border-none cursor-pointer transition-colors ${view === 'table' ? 'bg-sky-600 text-white' : 'bg-transparent text-slate-600 hover:bg-slate-50'}`}
            >📋 Таблица</button>
          </div>
          <span className="text-[11px] text-slate-500">штатка · {ECONOMY_VERSIONS.find(v => v.id === versionId)?.note}</span>
          <div className="ml-auto text-[11px] tabular-nums text-slate-600">
            Весь срок ({ECONOMY_TOTAL_MONTHS} мес) — договор <b>{yearContract.toFixed(1)}</b> · план <b>{yearPlan.toFixed(1)}</b> · факт <b>{yearFact.toFixed(1)}</b> FTE·мес
          </div>
        </div>

        {view === 'chart' && <EconomyAreaChart data={monthAgg} closedIdx={monthIdx} />}
        {view === 'table' && <EconomyHeatmap positions={ECONOMY_POSITIONS} totals={monthAgg} />}

      </div>
    </div>
  )
}

function KPICard({ accent, title, subtitle, big, hint, tone }: {
  accent: 'indigo' | 'sky' | 'emerald' | 'slate'
  title: string; subtitle: string; big: string; hint?: string
  tone?: 'emerald' | 'amber' | 'orange' | 'rose'
}) {
  const accentBorder: Record<typeof accent, string> = {
    indigo: 'border-l-indigo-500', sky: 'border-l-sky-500',
    emerald: 'border-l-emerald-500', slate: 'border-l-slate-500',
  }
  const accentText: Record<typeof accent, string> = {
    indigo: 'text-indigo-700', sky: 'text-sky-700',
    emerald: 'text-emerald-700', slate: 'text-slate-700',
  }
  const toneText: Record<NonNullable<typeof tone>, string> = {
    emerald: 'text-emerald-700', amber: 'text-amber-700',
    orange: 'text-orange-700', rose: 'text-rose-700',
  }
  return (
    <div className={`bg-white border border-slate-200 rounded-xl shadow-sm p-4 border-l-4 ${accentBorder[accent]}`}>
      <div className="text-[11px] uppercase font-semibold text-slate-500 tracking-wide">{title}</div>
      <div className="text-[10px] text-slate-400 mt-0.5">{subtitle}</div>
      <div className={`text-2xl font-bold mt-1 tabular-nums ${tone ? toneText[tone] : accentText[accent]}`}>{big}</div>
      {hint && <div className="text-[11px] text-slate-500 mt-0.5">{hint}</div>}
    </div>
  )
}

function EconomyAreaChart({ data, closedIdx }: {
  data: { month: string; contract: number; plan: number; fact: number | null }[]
  closedIdx: number
}) {
  const W = 1280, H = 320
  const padL = 44, padR = 20, padT = 20, padB = 36
  const innerW = W - padL - padR
  const innerH = H - padT - padB
  const xStep = innerW / (data.length - 1)
  const rawMax = Math.max(...data.map(d => Math.max(d.contract, d.plan, d.fact ?? 0)))
  const maxY = Math.ceil(rawMax * 1.15) || 1
  const yTicks = 5

  const xAt = (i: number) => padL + i * xStep
  const yAt = (v: number) => padT + innerH - (v / maxY) * innerH

  // Smooth path: cubic bezier с горизонтальными касательными (monotone-like)
  const smoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return ''
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`
    let d = `M ${pts[0].x} ${pts[0].y}`
    for (let i = 1; i < pts.length; i++) {
      const p0 = pts[i - 1]
      const p1 = pts[i]
      const dx = (p1.x - p0.x) / 3
      d += ` C ${p0.x + dx} ${p0.y}, ${p1.x - dx} ${p1.y}, ${p1.x} ${p1.y}`
    }
    return d
  }

  const collectPts = (key: 'contract' | 'plan' | 'fact', stopAfter?: number) => {
    const pts: { x: number; y: number }[] = []
    data.forEach((d, i) => {
      const v = d[key]
      if (v == null) return
      if (stopAfter != null && i > stopAfter) return
      pts.push({ x: xAt(i), y: yAt(v) })
    })
    return pts
  }

  const linePath = (key: 'contract' | 'plan' | 'fact', stopAfter?: number) =>
    smoothPath(collectPts(key, stopAfter))

  const areaPath = (key: 'contract' | 'plan' | 'fact', stopAfter?: number) => {
    const pts = collectPts(key, stopAfter)
    if (pts.length === 0) return ''
    const baseY = yAt(0)
    return `${smoothPath(pts)} L ${pts[pts.length - 1].x} ${baseY} L ${pts[0].x} ${baseY} Z`
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-bold text-slate-800">График загрузки · апр 2024 — сен 2026</h4>
        <div className="text-[11px] text-slate-500">Договор — потолок; план и факт стремятся к нему</div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full block h-auto">
        <defs>
          <linearGradient id="gContract" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.22} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="gPlan" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.18} />
            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gFact" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.28} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Y grid + labels */}
        {Array.from({ length: yTicks + 1 }, (_, i) => {
          const v = (maxY / yTicks) * i
          const y = yAt(v)
          return (
            <g key={i}>
              <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#eef2f7" />
              <text x={padL - 8} y={y + 4} fontSize="12" fill="#94a3b8" textAnchor="end">{v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)}</text>
            </g>
          )
        })}

        {/* X labels + dividers (year-start = акцент, quarter = бледный) */}
        {data.map((_, i) => {
          const tp = ECONOMY_TIMELINE[i]
          const isQuarter = i % 3 === 0 && i !== 0
          const isYearStart = tp.isYearStart
          const showLabel = isYearStart || (isQuarter && !isYearStart)
          return (
            <g key={i}>
              {(isQuarter || isYearStart) && (
                <line
                  x1={xAt(i)} y1={padT} x2={xAt(i)} y2={padT + innerH}
                  stroke={isYearStart ? '#cbd5e1' : '#f1f5f9'}
                />
              )}
              {showLabel && (
                isYearStart ? (
                  <text x={xAt(i)} y={H - 12} fontSize="12" fontWeight="700" fill="#475569" textAnchor="middle">
                    {tp.monthShort}{"'"}{tp.yearShort}
                  </text>
                ) : (
                  <text x={xAt(i)} y={H - 12} fontSize="11" fill="#94a3b8" textAnchor="middle">{tp.monthShort}</text>
                )
              )}
              {/* мини-тик для всех месяцев на оси X */}
              <line x1={xAt(i)} y1={padT + innerH} x2={xAt(i)} y2={padT + innerH + 4} stroke="#cbd5e1" />
            </g>
          )
        })}

        {/* Baseline */}
        <line x1={padL} y1={yAt(0)} x2={W - padR} y2={yAt(0)} stroke="#cbd5e1" strokeWidth="1" />

        {/* Closed/forecast separator */}
        <rect x={xAt(closedIdx)} y={padT} width={W - padR - xAt(closedIdx)} height={innerH} fill="#f8fafc" opacity="0.6" />
        <line x1={xAt(closedIdx)} y1={padT} x2={xAt(closedIdx)} y2={padT + innerH} stroke="#94a3b8" strokeDasharray="4 4" strokeWidth="1.5" />
        <text x={xAt(closedIdx) + 8} y={padT + 14} fontSize="11" fill="#64748b" fontWeight="600">прогноз</text>

        {/* Areas */}
        <path d={areaPath('contract')} fill="url(#gContract)" />
        <path d={areaPath('plan')} fill="url(#gPlan)" />
        <path d={areaPath('fact', closedIdx)} fill="url(#gFact)" />

        {/* Lines */}
        <path d={linePath('contract')} fill="none" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" />
        <path d={linePath('plan')} fill="none" stroke="#0ea5e9" strokeWidth="2.5" strokeDasharray="6 5" strokeLinecap="round" />
        <path d={linePath('fact', closedIdx)} fill="none" stroke="#10b981" strokeWidth="3.25" strokeLinecap="round" />

        {/* Dots */}
        {data.map((d, i) => (
          <circle key={`c-${i}`} cx={xAt(i)} cy={yAt(d.contract)} r="4" fill="#fff" stroke="#6366f1" strokeWidth="2.25" />
        ))}
        {data.map((d, i) => (
          <circle key={`p-${i}`} cx={xAt(i)} cy={yAt(d.plan)} r="3.5" fill="#fff" stroke="#0ea5e9" strokeWidth="2" />
        ))}
        {data.map((d, i) => d.fact != null && i <= closedIdx && (
          <circle key={`f-${i}`} cx={xAt(i)} cy={yAt(d.fact)} r="4.5" fill="#10b981" stroke="#fff" strokeWidth="1.75" />
        ))}
      </svg>

      <div className="flex items-center justify-center gap-5 text-[11px] text-slate-600 mt-2">
        <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-sm" style={{ background: '#6366f1' }} />Договор</span>
        <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-sm" style={{ background: '#0ea5e9' }} />План (штатка)</span>
        <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-sm" style={{ background: '#10b981' }} />Факт (табель)</span>
      </div>

      <div className="mt-4 border-t border-slate-100 pt-3">
        <div className="text-[11px] uppercase font-semibold text-slate-500 tracking-wide mb-2">Сводка по месяцам · отклонения от договора</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs tabular-nums">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="text-left px-2 py-1.5 font-semibold">Месяц</th>
                <th className="text-center px-2 py-1.5 font-semibold">Договор</th>
                <th className="text-center px-2 py-1.5 font-semibold">План</th>
                <th className="text-center px-2 py-1.5 font-semibold">Факт</th>
                <th className="text-center px-2 py-1.5 font-semibold">Δ Факт − Договор</th>
                <th className="text-center px-2 py-1.5 font-semibold">Статус</th>
              </tr>
            </thead>
            <tbody>
              {data.map((m, i) => {
                const tone = classifyFact(m.fact, m.contract)
                const diff = m.fact != null ? m.fact - m.contract : null
                const diffPct = diff != null && m.contract > 0 ? (diff / m.contract) * 100 : null
                const label = tone === 'ok' ? 'Норма' : tone === 'under' ? '↓ Недобор' : tone === 'over_minor' ? '⚠ Перегруз' : tone === 'over_critical' ? '↑ +10%' : '—'
                return (
                  <tr key={i} className={`border-t border-slate-100 ${tone === 'empty' ? 'opacity-50' : ''}`}>
                    <td className="px-2 py-1.5 text-slate-700 font-medium">{m.month}</td>
                    <td className="text-center text-indigo-700">{m.contract.toFixed(1)}</td>
                    <td className="text-center text-sky-700">{m.plan.toFixed(1)}</td>
                    <td className="text-center text-emerald-700 font-semibold">{m.fact != null ? m.fact.toFixed(1) : '—'}</td>
                    <td className={`text-center font-semibold ${tone === 'ok' ? 'text-emerald-700' : tone === 'under' ? 'text-amber-700' : tone === 'over_minor' ? 'text-orange-700' : tone === 'over_critical' ? 'text-rose-700' : 'text-slate-400'}`}>
                      {diff != null ? `${diff >= 0 ? '+' : ''}${diff.toFixed(2)}` : '—'}
                      {diffPct != null && Math.abs(diffPct) > 0.5 && <span className="text-[10px] opacity-70 ml-1">({diffPct >= 0 ? '+' : ''}{diffPct.toFixed(1)}%)</span>}
                    </td>
                    <td className="text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${TONE_BG[tone]}`}>{label}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function EconomyHeatmap({ positions, totals }: {
  positions: EconomyPosition[]
  totals: { month: string; contract: number; plan: number; fact: number | null }[]
}) {
  const yearTotal = totals.reduce((s, t) => s + t.contract, 0)
  return (
    <div className="space-y-3">
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs tabular-nums border-separate border-spacing-0">
            <thead>
              <tr className="bg-slate-50 text-slate-500">
                <th className="sticky left-0 bg-slate-50 text-left px-3 py-2 w-[180px] text-[11px] font-semibold uppercase border-b border-slate-200 z-10">Итог по проекту</th>
                {totals.map((_, i) => {
                  const tp = ECONOMY_TIMELINE[i]
                  const isQuarter = i % 3 === 0 && i !== 0
                  return (
                    <th key={i} className={`px-1.5 py-2 text-center text-[10px] font-semibold min-w-[48px] border-b border-slate-200 ${tp.isYearStart ? 'border-l-2 border-l-slate-300' : isQuarter ? 'border-l border-slate-200' : ''}`}>
                      {tp.isYearStart && <div className="text-[9px] text-slate-400 font-bold">20{tp.yearShort}</div>}
                      <div>{tp.monthShort}</div>
                    </th>
                  )
                })}
                <th className="sticky right-0 px-3 py-2 text-center text-[11px] font-semibold bg-slate-100 border-b border-l border-slate-200 z-10">Σ</th>
              </tr>
            </thead>
            <tbody>
              <TotalsRow label="Договор" dot="bg-indigo-500" values={totals.map(t => t.contract)} />
              <TotalsRow label="План (штатка)" dot="bg-sky-500" values={totals.map(t => t.plan)} />
              <TotalsRow label="Факт (табель)" dot="bg-emerald-500" values={totals.map(t => t.fact)} tones={totals.map(t => classifyFact(t.fact, t.contract))} />
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-4 py-2.5 text-[11px] uppercase font-semibold text-slate-500 tracking-wide border-b border-slate-200 bg-slate-50">
          Разбивка по позициям · план / договор; ячейки подсвечены тональностью факта
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs tabular-nums border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="sticky left-0 bg-white text-left px-4 py-2.5 w-[220px] min-w-[220px] text-[11px] font-semibold text-slate-500 uppercase border-b border-slate-200 z-10">Позиция</th>
                {totals.map((_, i) => {
                  const tp = ECONOMY_TIMELINE[i]
                  const isQuarter = i % 3 === 0 && i !== 0
                  return (
                    <th key={i} className={`px-1.5 py-2 text-center text-[10px] font-semibold text-slate-500 min-w-[48px] border-b border-slate-200 ${tp.isYearStart ? 'border-l-2 border-l-slate-300' : isQuarter ? 'border-l border-slate-200' : ''}`}>
                      {tp.isYearStart && <div className="text-[9px] text-slate-400 font-bold">20{tp.yearShort}</div>}
                      <div>{tp.monthShort}</div>
                    </th>
                  )
                })}
                <th className="sticky right-0 bg-slate-50 px-3 py-2.5 text-center text-[11px] font-semibold text-slate-500 uppercase border-b border-l border-slate-200 min-w-[72px] z-10">Σ план</th>
              </tr>
            </thead>
            <tbody>
              {positions.map(pos => {
                const posTotal = pos.months.reduce((s, m) => s + m.plan, 0)
                const posContract = pos.months.reduce((s, m) => s + m.contract, 0)
                return (
                  <tr key={pos.id} className="hover:bg-sky-50/40 group">
                    <td className="sticky left-0 bg-white group-hover:bg-sky-50/40 px-4 py-2 border-b border-slate-100 z-10">
                      <div className="font-semibold text-slate-800 text-[13px] leading-tight">{pos.name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">договор {posContract.toFixed(1)} FTE·мес</div>
                    </td>
                    {pos.months.map((m, i) => {
                      const tp = ECONOMY_TIMELINE[i]
                      const tone = classifyFact(m.fact, m.contract)
                      const has = m.contract > 0 || m.plan > 0 || (m.fact ?? 0) > 0
                      const isQuarter = i % 3 === 0 && i !== 0
                      return (
                        <td key={i}
                          title={has ? `${pos.name} · ${tp.label} · договор ${m.contract.toFixed(1)} · план ${m.plan.toFixed(1)} · факт ${m.fact != null ? m.fact.toFixed(2) : '—'}` : 'нет данных'}
                          className={`px-1 py-1.5 text-center border-b border-slate-100 ${tp.isYearStart ? 'border-l-2 border-l-slate-300' : isQuarter ? 'border-l border-slate-200' : ''} ${TONE_BG[tone]}`}
                        >
                          {has ? (
                            <div className="leading-tight">
                              <div className="text-[11px] font-semibold">
                                {m.plan.toFixed(1)}<span className="text-slate-400 font-normal">/{m.contract.toFixed(1)}</span>
                              </div>
                              <div className="text-[9px] opacity-70 mt-0.5">{m.fact != null ? m.fact.toFixed(2) : '—'}</div>
                            </div>
                          ) : <span className="text-slate-300">·</span>}
                        </td>
                      )
                    })}
                    <td className="sticky right-0 bg-slate-50 px-3 py-2 text-center font-bold text-slate-800 text-[13px] border-b border-l border-slate-200 z-10">{posTotal.toFixed(1)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="px-3 py-2 border-t border-slate-200 bg-slate-50 flex items-center gap-3 text-[10px] text-slate-500 flex-wrap">
          <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-emerald-50 border border-emerald-200" />норма (±5%)</span>
          <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-amber-50 border border-amber-200" />недобор</span>
          <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-orange-50 border border-orange-200" />+5–10%</span>
          <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-rose-50 border border-rose-200" />+10% и более</span>
          <span className="ml-auto text-slate-400">Всего за год · договор {yearTotal.toFixed(1)} FTE·мес</span>
        </div>
      </div>
    </div>
  )
}

function TotalsRow({ label, dot, values, tones }: {
  label: string; dot: string; values: (number | null)[]; tones?: Tone[]
}) {
  const total = values.reduce<number>((s, v) => s + (v ?? 0), 0)
  return (
    <tr>
      <td className="sticky left-0 bg-white px-3 py-1.5 border-b border-slate-100 z-10">
        <span className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${dot}`} />
          <span className="font-semibold text-slate-700">{label}</span>
        </span>
      </td>
      {values.map((v, i) => {
        const t = tones?.[i]
        const bg = t ? TONE_BG[t] : ''
        const tp = ECONOMY_TIMELINE[i]
        const isQuarter = tp && i % 3 === 0 && i !== 0
        const sideBorder = tp?.isYearStart ? 'border-l-2 border-l-slate-300' : isQuarter ? 'border-l border-slate-200' : ''
        return (
          <td key={i} className={`px-1.5 py-1.5 text-center text-[11px] border-b border-slate-100 ${sideBorder} ${bg}`}>
            {v != null && v > 0 ? v.toFixed(1) : <span className="text-slate-300">·</span>}
          </td>
        )
      })}
      <td className="sticky right-0 px-3 py-1.5 text-center font-bold text-slate-800 bg-slate-50 border-b border-l border-slate-200 z-10">{total.toFixed(1)}</td>
    </tr>
  )
}
