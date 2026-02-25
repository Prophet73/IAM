import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'

type Screen = 'dashboard' | 'project' | 'analogs' | 'report' | 'ai' | 'deflators'

const BRAND = '#059669'

/* ── Icons ── */
const I = {
  Download: () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>,
  ChevronRight: () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>,
  ChevronDown: () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>,
  Upload: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>,
}

const nav: { key: Screen; emoji: string; label: string; section?: string }[] = [
  { key: 'dashboard', emoji: '📊', label: 'Дашборд' },
  { key: 'project', emoji: '🏗', label: 'Проект' },
  { key: 'analogs', emoji: '🔍', label: 'Аналоги', section: 'АНАЛИЗ' },
  { key: 'report', emoji: '📄', label: 'Отчёт' },
  { key: 'ai', emoji: '🤖', label: 'AI-классификация', section: 'ИНСТРУМЕНТЫ' },
  { key: 'deflators', emoji: '📈', label: 'Дефляторы' },
]

const titles: Record<Screen, string> = {
  dashboard: 'Дашборд', project: 'Анализ проекта', analogs: 'Поиск аналогов',
  report: 'Сравнительный отчёт', ai: 'AI-классификация', deflators: 'Дефляторы',
}

/* ── Number formatter ── */
function fmt(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

/* ===== EXPORT ===== */
export function DemoCostManager() {
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
  const [screen, setScreen] = useState<Screen>('dashboard')
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
          {/* Sidebar — WHITE */}
          <div className="w-[240px] bg-white border-r border-slate-200 flex flex-col shrink-0">
            <div className="h-14 flex items-center px-4 border-b border-slate-200">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[0.6rem] text-white font-bold mr-3" style={{ background: BRAND }}>CM</div>
              <div><div className="text-sm font-bold text-slate-800">CostManager</div><div className="text-[0.58rem] text-slate-400">v1.4</div></div>
            </div>
            <div className="flex-1 py-2 px-3 space-y-0.5 overflow-y-auto">
              {nav.map(item => (
                <div key={item.key}>
                  {item.section && <div className="pt-4 pb-2 px-2"><div className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-wider">{item.section}</div></div>}
                  <button onClick={() => setScreen(item.key)} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left cursor-pointer border-none transition-colors text-[0.8rem] ${screen === item.key ? 'bg-[#059669]/10 text-[#059669] font-semibold' : 'bg-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-800'}`}>
                    <span className="text-[0.85rem]">{item.emoji}</span><span>{item.label}</span>
                  </button>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-slate-200">
              <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[0.65rem] font-bold" style={{ background: `${BRAND}15`, color: BRAND }}>НХ</div>
                <div className="flex-1 min-w-0"><div className="text-[0.75rem] font-semibold text-slate-700 truncate">Хроменок Н.В.</div><div className="text-[0.6rem] text-slate-400">Администратор</div></div>
              </div>
              <div className="text-[0.55rem] text-slate-400 text-center mt-2">v1.4 · Design by N. Khromenok & V. Vasin</div>
            </div>
          </div>
          {/* Content */}
          <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
            <div className="h-14 flex items-center justify-between px-6 bg-white border-b border-slate-200 shrink-0">
              <h2 className="text-[0.95rem] font-bold text-slate-800 m-0">{titles[screen]}</h2>
              <div className="flex items-center gap-3">
                <span className="text-[0.72rem] text-slate-400">Портфель: 24 проекта</span>
                <span className="text-[0.72rem] text-slate-400">19 февр. 2026</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {screen === 'dashboard' && <PgDashboard />}
              {screen === 'project' && <PgProject />}
              {screen === 'analogs' && <PgAnalogs />}
              {screen === 'report' && <PgReport />}
              {screen === 'ai' && <PgAI />}
              {screen === 'deflators' && <PgDeflators />}
            </div>
          </div>
        </div>
      </div>
    </div>, document.body)
}

/* ── Helpers ── */
function StatCard({ label, val, sub, color }: { label: string; val: string; sub: string; color: string }) {
  return <div className="bg-white rounded-xl p-4 border border-slate-200" style={{ borderLeftWidth: 3, borderLeftColor: color }}><span className="text-[0.65rem] text-slate-400 uppercase font-bold tracking-wider">{label}</span><div className="text-2xl font-extrabold text-slate-800 mt-1">{val}</div><div className="text-[0.7rem] text-slate-400 mt-0.5">{sub}</div></div>
}

function Badge({ children, color }: { children: React.ReactNode; color: string }) {
  const colors: Record<string, string> = {
    green: 'bg-green-100 text-green-600',
    amber: 'bg-amber-100 text-amber-600',
    blue: 'bg-blue-100 text-blue-600',
    red: 'bg-red-100 text-red-600',
    slate: 'bg-slate-100 text-slate-500',
  }
  return <span className={`px-2 py-0.5 rounded text-[0.65rem] font-bold ${colors[color] || colors.slate}`}>{children}</span>
}

/* ===== DASHBOARD ===== */
function PgDashboard() {
  const barData = [
    { label: 'Жилой комплекс', value: 8.2, color: BRAND },
    { label: 'Бизнес-центр', value: 4.1, color: '#10B981' },
    { label: 'Складской комплекс', value: 3.2, color: '#34D399' },
    { label: 'ЦОД', value: 2.1, color: '#6EE7B7' },
    { label: 'Прочие', value: 1.1, color: '#A7F3D0' },
  ]
  const maxBar = Math.max(...barData.map(b => b.value))

  const projects = [
    { name: 'ЖК «Северный»', code: 'PRJ-2024-015', cost: '6.00 млрд ₽', status: 'Активный', statusColor: 'green' },
    { name: 'БЦ «Горизонт»', code: 'PRJ-2024-022', cost: '2.80 млрд ₽', status: 'Активный', statusColor: 'green' },
    { name: 'Склад «Логопарк»', code: 'PRJ-2023-089', cost: '1.95 млрд ₽', status: 'Завершён', statusColor: 'slate' },
    { name: 'ЦОД «Дата-1»', code: 'PRJ-2024-031', cost: '2.10 млрд ₽', status: 'Оценка', statusColor: 'amber' },
  ]

  return (
    <div className="p-6">
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Проектов" val="24" sub="12 активных" color={BRAND} />
        <StatCard label="Общая стоимость" val="18.7 млрд ₽" sub="портфель" color="#10B981" />
        <StatCard label="Ср. стоимость / м²" val="127 659 ₽/м²" sub="по активным проектам" color="#34D399" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Bar chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="text-[0.82rem] font-bold text-slate-800 mb-4">Стоимость по классам объектов</div>
          <div className="space-y-3">
            {barData.map(bar => (
              <div key={bar.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[0.72rem] text-slate-600">{bar.label}</span>
                  <span className="text-[0.72rem] font-bold text-slate-700">{bar.value} млрд</span>
                </div>
                <div className="h-5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(bar.value / maxBar) * 100}%`, background: bar.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent projects */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="text-[0.82rem] font-bold text-slate-800 mb-4">Последние проекты</div>
          <div className="space-y-2.5">
            {projects.map(p => (
              <div key={p.code} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors cursor-pointer">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-[0.6rem] font-bold shrink-0" style={{ background: BRAND }}>{p.code.slice(-3)}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[0.78rem] font-semibold text-slate-800 truncate">{p.name}</div>
                  <div className="text-[0.65rem] text-slate-400">{p.code} · {p.cost}</div>
                </div>
                <Badge color={p.statusColor}>{p.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ===== PROJECT ===== */
interface CostNode {
  id: string
  name: string
  cost: number
  materials?: number
  works?: number
  sqm?: number
  children?: CostNode[]
}

const costTree: CostNode[] = [
  { id: '1', name: '1. ПИР и Разрешительная документация', cost: 280000000, materials: 0, works: 280000000, sqm: 5957 },
  { id: '2', name: '2. Подготовительные работы и Временные сооружения', cost: 185000000, materials: 74000000, works: 111000000, sqm: 3936 },
  {
    id: '3', name: '3. Земляные работы и Ограждение котлована', cost: 320000000, materials: 128000000, works: 192000000, sqm: 6809,
    children: [
      { id: '3.1', name: '3.1 Ограждения котлована', cost: 145000000, materials: 58000000, works: 87000000, sqm: 3085 },
      { id: '3.2', name: '3.2 Разработка котлована', cost: 98000000, materials: 39200000, works: 58800000, sqm: 2085 },
      { id: '3.3-5', name: '3.3–3.5 Вывоз, засыпка, водопонижение', cost: 77000000, materials: 30800000, works: 46200000, sqm: 1638 },
    ],
  },
  {
    id: '4', name: '4. Фундаменты и Конструкции подземной части', cost: 980000000, materials: 637000000, works: 343000000, sqm: 20851,
    children: [
      { id: '4.1', name: '4.1 Свайные основания (БНС)', cost: 210000000, materials: 136500000, works: 73500000, sqm: 4468 },
      { id: '4.3', name: '4.3 Монолитные ростверки и фунд. плиты', cost: 320000000, materials: 208000000, works: 112000000, sqm: 6809 },
      { id: '4.4', name: '4.4 Монолитные ЖБК подземной части', cost: 280000000, materials: 182000000, works: 98000000, sqm: 5957 },
      { id: '4.5', name: '4.5 Гидроизоляция подземной части', cost: 95000000, materials: 61750000, works: 33250000, sqm: 2021 },
      { id: '4.6-7', name: '4.6–4.7 Утепление, дренаж', cost: 75000000, materials: 48750000, works: 26250000, sqm: 1596 },
    ],
  },
  {
    id: '5', name: '5. Надземные несущие конструкции (КР)', cost: 1120000000, materials: 728000000, works: 392000000, sqm: 23830,
    children: [
      { id: '5.1', name: '5.1 Монолитные ЖБК', cost: 850000000, materials: 552500000, works: 297500000, sqm: 18085 },
      { id: '5.2', name: '5.2 Металлические несущие конструкции', cost: 180000000, materials: 117000000, works: 63000000, sqm: 3830 },
      { id: '5.3', name: '5.3 Сборные ЖБК', cost: 90000000, materials: 58500000, works: 31500000, sqm: 1915 },
    ],
  },
  {
    id: '6', name: '6. Общестроительные работы (АР)', cost: 720000000, materials: 432000000, works: 288000000, sqm: 15319,
    children: [
      { id: '6.1', name: '6.1 Фасадные работы', cost: 320000000, materials: 192000000, works: 128000000, sqm: 6809 },
      { id: '6.2', name: '6.2 Заполнение оконных проёмов', cost: 145000000, materials: 87000000, works: 58000000, sqm: 3085 },
      { id: '6.3', name: '6.3 Кровельные работы', cost: 95000000, materials: 57000000, works: 38000000, sqm: 2021 },
      { id: '6.4-8', name: '6.4–6.8 Стены, перегородки, двери, лестницы', cost: 160000000, materials: 96000000, works: 64000000, sqm: 3404 },
    ],
  },
  {
    id: '7', name: '7. Отделочные работы (АИ)', cost: 480000000, materials: 288000000, works: 192000000, sqm: 10213,
    children: [
      { id: '7.1', name: '7.1 Отделка Паркинга', cost: 65000000, materials: 39000000, works: 26000000, sqm: 1383 },
      { id: '7.3-4', name: '7.3–7.4 Отделка МОП (подз. + надз.)', cost: 185000000, materials: 111000000, works: 74000000, sqm: 3936 },
      { id: '7.5-6', name: '7.5–7.6 Отделка жилых помещений', cost: 180000000, materials: 108000000, works: 72000000, sqm: 3830 },
      { id: '7.7-9', name: '7.7–7.9 Коммерция, соцобъекты, мокапы', cost: 50000000, materials: 30000000, works: 20000000, sqm: 1064 },
    ],
  },
  {
    id: '8', name: '8. Внутренние инженерные системы (ВИС)', cost: 1050000000, materials: 630000000, works: 420000000, sqm: 22340,
    children: [
      { id: '8.1', name: '8.1 ВК, ВПВ', cost: 220000000, materials: 132000000, works: 88000000, sqm: 4681 },
      { id: '8.2', name: '8.2 ОВиК, ИТП', cost: 310000000, materials: 186000000, works: 124000000, sqm: 6596 },
      { id: '8.3', name: '8.3 Электроснабжение (ЭОМ)', cost: 280000000, materials: 168000000, works: 112000000, sqm: 5957 },
      { id: '8.4', name: '8.4 Слаботочные системы', cost: 95000000, materials: 57000000, works: 38000000, sqm: 2021 },
      { id: '8.5', name: '8.5 Противопожарная защита', cost: 85000000, materials: 51000000, works: 34000000, sqm: 1809 },
      { id: '8.6', name: '8.6 Вертикальный транспорт (лифты)', cost: 60000000, materials: 36000000, works: 24000000, sqm: 1277 },
    ],
  },
  { id: '9', name: '9. Наружные инженерные сети (НС)', cost: 195000000, materials: 117000000, works: 78000000, sqm: 4149 },
  { id: '10', name: '10. Благоустройство', cost: 155000000, materials: 93000000, works: 62000000, sqm: 3298 },
  { id: '11', name: '11. Технологические решения и Спецоборудование', cost: 65000000, materials: 45500000, works: 19500000, sqm: 1383 },
  { id: '12', name: '12. Сопутствующие расходы', cost: 335000000, materials: 67000000, works: 268000000, sqm: 7128 },
  { id: '13', name: '13. Непредвиденные расходы', cost: 115000000, materials: 0, works: 115000000, sqm: 2447 },
]

const DEFLATOR_2024 = 1.085 * 1.047

function PgProject() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['4', '5', '8']))
  const [deflated, setDeflated] = useState(false)

  const toggle = useCallback((id: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }, [])

  const applyDeflator = useCallback((v: number) => deflated ? Math.round(v / DEFLATOR_2024) : v, [deflated])

  const renderRows = useMemo(() => {
    const rows: { node: CostNode; level: number; hasChildren: boolean; isExpanded: boolean }[] = []
    const walk = (nodes: CostNode[], level: number) => {
      for (const n of nodes) {
        const hasChildren = !!n.children && n.children.length > 0
        rows.push({ node: n, level, hasChildren, isExpanded: expanded.has(n.id) })
        if (hasChildren && expanded.has(n.id)) walk(n.children!, level + 1)
      }
    }
    walk(costTree, 0)
    return rows
  }, [expanded])

  const totalCost = costTree.reduce((s, n) => s + n.cost, 0)

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="text-[0.95rem] font-bold text-slate-800">ЖК «Северный»</div>
          <div className="text-[0.72rem] text-slate-400">Код: PRJ-2024-015 · Площадь: 47 000 м² · Москва, СЗАО</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden">
            <button onClick={() => setDeflated(false)} className={`px-3 py-1.5 text-[0.72rem] font-medium border-none cursor-pointer transition-colors ${!deflated ? 'bg-[#059669]/10 text-[#059669]' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>Исходные цены</button>
            <button onClick={() => setDeflated(true)} className={`px-3 py-1.5 text-[0.72rem] font-medium border-none cursor-pointer transition-colors ${deflated ? 'bg-[#059669]/10 text-[#059669]' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>Дефлятированные</button>
          </div>
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <div className="bg-white rounded-xl p-3 border border-slate-200 text-center">
          <div className="text-[0.65rem] text-slate-400 uppercase font-bold">Итого</div>
          <div className="text-lg font-extrabold text-slate-800 mt-0.5">{fmt(applyDeflator(totalCost))} ₽</div>
        </div>
        <div className="bg-white rounded-xl p-3 border border-slate-200 text-center">
          <div className="text-[0.65rem] text-slate-400 uppercase font-bold">Материалы</div>
          <div className="text-lg font-extrabold text-slate-800 mt-0.5">{fmt(applyDeflator(3239500000))} ₽</div>
        </div>
        <div className="bg-white rounded-xl p-3 border border-slate-200 text-center">
          <div className="text-[0.65rem] text-slate-400 uppercase font-bold">Работы</div>
          <div className="text-lg font-extrabold text-slate-800 mt-0.5">{fmt(applyDeflator(2760500000))} ₽</div>
        </div>
        <div className="bg-white rounded-xl p-3 border border-slate-200 text-center">
          <div className="text-[0.65rem] text-slate-400 uppercase font-bold">₽ / м²</div>
          <div className="text-lg font-extrabold text-slate-800 mt-0.5">{fmt(applyDeflator(127659))}</div>
        </div>
      </div>

      {/* Cost tree table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-5">
        <table className="w-full">
          <thead>
            <tr className="text-[0.65rem] text-slate-400 uppercase tracking-wider bg-slate-50">
              <th className="text-left px-4 py-2.5 font-semibold" style={{ width: '40%' }}>Наименование</th>
              <th className="text-right px-4 py-2.5 font-semibold">Стоимость</th>
              <th className="text-right px-4 py-2.5 font-semibold">Материалы</th>
              <th className="text-right px-4 py-2.5 font-semibold">Работы</th>
              <th className="text-right px-4 py-2.5 font-semibold">₽/м²</th>
            </tr>
          </thead>
          <tbody>
            {renderRows.map(({ node, level, hasChildren, isExpanded }) => (
              <tr key={node.id} className="border-t border-slate-100 text-[0.75rem] hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-2.5">
                  <div className="flex items-center" style={{ paddingLeft: `${level * 20}px` }}>
                    {hasChildren ? (
                      <button onClick={() => toggle(node.id)} className="w-5 h-5 flex items-center justify-center rounded cursor-pointer border-none bg-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors mr-1.5 shrink-0">
                        {isExpanded ? <I.ChevronDown /> : <I.ChevronRight />}
                      </button>
                    ) : <span className="w-5 mr-1.5 shrink-0" />}
                    <span className={`${level === 0 ? 'font-bold text-slate-800' : level === 1 ? 'font-semibold text-slate-700' : 'text-slate-600'}`}>{node.name}</span>
                  </div>
                </td>
                <td className={`text-right px-4 py-2.5 font-mono ${level === 0 ? 'font-bold text-slate-800' : 'text-slate-600'}`}>{fmt(applyDeflator(node.cost))}</td>
                <td className="text-right px-4 py-2.5 font-mono text-slate-500">{node.materials !== undefined ? fmt(applyDeflator(node.materials)) : '—'}</td>
                <td className="text-right px-4 py-2.5 font-mono text-slate-500">{node.works !== undefined ? fmt(applyDeflator(node.works)) : '—'}</td>
                <td className="text-right px-4 py-2.5 font-mono text-slate-500">{node.sqm !== undefined ? fmt(applyDeflator(node.sqm)) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Local objects */}
      <div className="text-[0.82rem] font-bold text-slate-800 mb-3">Локальные объекты</div>
      <div className="grid grid-cols-2 gap-4">
        {[
          { name: 'Корпус 1', floors: '24 этажа', area: '22 500 м²', cost: '2 980 000 000 ₽', sqm: '132 444 ₽/м²' },
          { name: 'Корпус 2', floors: '28 этажей', area: '24 500 м²', cost: '3 190 000 000 ₽', sqm: '130 204 ₽/м²' },
        ].map(obj => (
          <div key={obj.name} className="bg-white rounded-xl border border-slate-200 p-4 hover:border-[#059669]/30 transition-colors cursor-pointer">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[0.6rem] font-bold" style={{ background: BRAND }}>🏢</div>
              <div>
                <div className="text-[0.82rem] font-bold text-slate-800">{obj.name}</div>
                <div className="text-[0.65rem] text-slate-400">{obj.floors} · {obj.area}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-50 rounded-lg p-2"><div className="text-[0.6rem] text-slate-400">Стоимость</div><div className="text-[0.78rem] font-bold text-slate-700">{obj.cost}</div></div>
              <div className="bg-slate-50 rounded-lg p-2"><div className="text-[0.6rem] text-slate-400">₽/м²</div><div className="text-[0.78rem] font-bold text-slate-700">{obj.sqm}</div></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── FilterSection (extracted to avoid re-creation during render) ── */
function FilterSection({ id, title, children, openSections, toggleSection }: {
  id: string; title: string; children: React.ReactNode;
  openSections: Set<string>; toggleSection: (s: string) => void
}) {
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button onClick={() => toggleSection(id)} className="w-full flex items-center justify-between px-4 py-3 bg-white text-[0.78rem] font-semibold text-slate-700 cursor-pointer border-none hover:bg-slate-50 transition-colors">
        <span>{title}</span>
        {openSections.has(id) ? <I.ChevronDown /> : <I.ChevronRight />}
      </button>
      {openSections.has(id) && <div className="px-4 pb-4 bg-white border-t border-slate-100">{children}</div>}
    </div>
  )
}

/* ===== ANALOGS ===== */
function PgAnalogs() {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['location', 'chars']))

  const toggleSection = useCallback((s: string) => {
    setOpenSections(prev => {
      const next = new Set(prev)
      if (next.has(s)) next.delete(s); else next.add(s)
      return next
    })
  }, [])

  const analogs = [
    { name: 'ЖК «Восточный парк»', sqm: '126 000', city: 'Москва', floors: 22, area: '38 500 м²', year: 2023, match: 87,
      struct: [{ l: 'Конструктив', v: 36, c: '#059669' }, { l: 'Фасад/Отделка', v: 19, c: '#10B981' }, { l: 'Инж. системы', v: 17, c: '#34D399' }, { l: 'Прочие', v: 28, c: '#A7F3D0' }] },
    { name: 'ЖК «Панорама»', sqm: '138 000', city: 'МО', floors: 25, area: '42 000 м²', year: 2023, match: 82,
      struct: [{ l: 'Конструктив', v: 33, c: '#059669' }, { l: 'Фасад/Отделка', v: 23, c: '#10B981' }, { l: 'Инж. системы', v: 18, c: '#34D399' }, { l: 'Прочие', v: 26, c: '#A7F3D0' }] },
    { name: 'ЖК «Сити-Холл»', sqm: '155 000', city: 'Москва', floors: 30, area: '55 000 м²', year: 2024, match: 74,
      struct: [{ l: 'Конструктив', v: 34, c: '#059669' }, { l: 'Фасад/Отделка', v: 20, c: '#10B981' }, { l: 'Инж. системы', v: 21, c: '#34D399' }, { l: 'Прочие', v: 25, c: '#A7F3D0' }] },
  ]

  return (
    <div className="p-6">
      {/* Reference selector */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-5">
        <div className="text-[0.72rem] text-slate-400 uppercase font-bold tracking-wider mb-2">Эталонный объект</div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-[0.65rem] font-bold" style={{ background: BRAND }}>015</div>
          <div className="flex-1">
            <div className="text-[0.85rem] font-bold text-slate-800">ЖК «Северный»</div>
            <div className="text-[0.7rem] text-slate-400">PRJ-2024-015 · 47 000 м² · 142 500 ₽/м² · Москва, СЗАО</div>
          </div>
          <Badge color="green">Выбран</Badge>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Filters */}
        <div className="space-y-3">
          <div className="text-[0.82rem] font-bold text-slate-800 mb-1">Фильтры поиска</div>
          <FilterSection id="location" title="📍 Локация" openSections={openSections} toggleSection={toggleSection}>
            <div className="space-y-2 pt-2">
              <div><div className="text-[0.68rem] text-slate-500 mb-1">Регион</div><div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-[0.75rem] text-slate-700">Москва и МО</div></div>
              <div><div className="text-[0.68rem] text-slate-500 mb-1">Город</div><div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-[0.75rem] text-slate-700">Все</div></div>
              <div><div className="text-[0.68rem] text-slate-500 mb-1">Класс</div><div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-[0.75rem] text-slate-700">Комфорт / Бизнес</div></div>
            </div>
          </FilterSection>
          <FilterSection id="chars" title="📐 Характеристики" openSections={openSections} toggleSection={toggleSection}>
            <div className="space-y-2 pt-2">
              <div><div className="text-[0.68rem] text-slate-500 mb-1">Тип объекта</div><div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-[0.75rem] text-slate-700">Жилой комплекс</div></div>
              <div className="grid grid-cols-2 gap-2">
                <div><div className="text-[0.68rem] text-slate-500 mb-1">Площадь, от</div><div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-[0.75rem] text-slate-700">30 000 м²</div></div>
                <div><div className="text-[0.68rem] text-slate-500 mb-1">Площадь, до</div><div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-[0.75rem] text-slate-700">70 000 м²</div></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><div className="text-[0.68rem] text-slate-500 mb-1">Этажность, от</div><div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-[0.75rem] text-slate-700">15</div></div>
                <div><div className="text-[0.68rem] text-slate-500 mb-1">Этажность, до</div><div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-[0.75rem] text-slate-700">35</div></div>
              </div>
            </div>
          </FilterSection>
          <FilterSection id="cost" title="💰 Стоимость" openSections={openSections} toggleSection={toggleSection}>
            <div className="space-y-2 pt-2">
              <div className="grid grid-cols-2 gap-2">
                <div><div className="text-[0.68rem] text-slate-500 mb-1">₽/м², от</div><div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-[0.75rem] text-slate-700">100 000</div></div>
                <div><div className="text-[0.68rem] text-slate-500 mb-1">₽/м², до</div><div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-[0.75rem] text-slate-700">200 000</div></div>
              </div>
              <div><div className="text-[0.68rem] text-slate-500 mb-1">Доля категории, %</div><div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-[0.75rem] text-slate-700">СМР: 75-90%</div></div>
            </div>
          </FilterSection>
          <button className="w-full py-2.5 text-white rounded-xl text-[0.8rem] font-semibold border-none cursor-pointer hover:opacity-90 transition-opacity flex items-center justify-center gap-2" style={{ background: BRAND }}>
            🔍 Найти аналоги
          </button>
        </div>

        {/* Results */}
        <div className="col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[0.82rem] font-bold text-slate-800">Найденные аналоги</div>
            <span className="text-[0.72rem] text-slate-400">3 проекта</span>
          </div>
          <div className="space-y-3">
            {analogs.map(a => (
              <div key={a.name} className="bg-white rounded-xl border border-slate-200 p-4 hover:border-[#059669]/30 transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-[0.7rem] font-bold" style={{ background: BRAND }}>{a.floors}э</div>
                    <div>
                      <div className="text-[0.85rem] font-bold text-slate-800">{a.name}</div>
                      <div className="text-[0.7rem] text-slate-400">{a.city} · {a.area} · {a.year} г.</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-extrabold" style={{ color: BRAND }}>{a.sqm} ₽/м²</div>
                    <div className="text-[0.65rem] text-slate-400">совпадение: {a.match}%</div>
                  </div>
                </div>
                <div>
                  <div className="flex h-2.5 rounded-full overflow-hidden mb-1.5">
                    {a.struct.map(s => (
                      <div key={s.l} style={{ width: `${s.v}%`, background: s.c }} />
                    ))}
                  </div>
                  <div className="flex gap-3">
                    {a.struct.map(s => (
                      <span key={s.l} className="flex items-center gap-1 text-[0.6rem] text-slate-500">
                        <span className="w-1.5 h-1.5 rounded-sm shrink-0" style={{ background: s.c }} />{s.l} {s.v}%
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[0.8rem] font-semibold text-slate-700 cursor-pointer hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
            📄 Сформировать отчёт
          </button>
        </div>
      </div>
    </div>
  )
}

/* ===== REPORT ===== */
function PgReport() {
  const [tab, setTab] = useState<'table' | 'chart'>('table')

  const sections = [
    { id: '1', name: 'ПИР и РД', ref: 5957, a1: 5100, a2: 6200, a3: 7800, share: 4.7, avg: 6275, median: 5650, p10: 4500, p90: 7900 },
    { id: '2', name: 'Подготовительные работы', ref: 3936, a1: 3400, a2: 4100, a3: 5200, share: 3.1, avg: 4233, median: 4100, p10: 3000, p90: 5400 },
    { id: '3', name: 'Земляные и Котлован', ref: 6809, a1: 5800, a2: 7200, a3: 8500, share: 5.3, avg: 7167, median: 7200, p10: 5200, p90: 9200 },
    { id: '4', name: 'Фундаменты и подз. часть', ref: 20851, a1: 18500, a2: 21200, a3: 24500, share: 16.3, avg: 21400, median: 21200, p10: 16800, p90: 25500 },
    { id: '5', name: 'Надземные несущие КР', ref: 23830, a1: 22000, a2: 24800, a3: 28500, share: 18.7, avg: 25100, median: 24800, p10: 19500, p90: 29500 },
    { id: '6', name: 'Общестроительные (АР)', ref: 15319, a1: 13500, a2: 16000, a3: 18200, share: 12.0, avg: 15900, median: 16000, p10: 12000, p90: 19000 },
    { id: '7', name: 'Отделочные работы (АИ)', ref: 10213, a1: 8900, a2: 10800, a3: 12500, share: 8.0, avg: 10733, median: 10800, p10: 7800, p90: 13500 },
    { id: '8', name: 'ВИС (инж. системы)', ref: 22340, a1: 20100, a2: 23600, a3: 27200, share: 17.5, avg: 23633, median: 23600, p10: 17500, p90: 28000 },
    { id: '9', name: 'Наружные инж. сети', ref: 4149, a1: 3500, a2: 4200, a3: 5100, share: 3.3, avg: 4267, median: 4200, p10: 3000, p90: 5600 },
    { id: '10', name: 'Благоустройство', ref: 3298, a1: 2800, a2: 3400, a3: 4200, share: 2.6, avg: 3467, median: 3400, p10: 2300, p90: 4600 },
    { id: '11', name: 'Технологические решения', ref: 1383, a1: 1000, a2: 1400, a3: 1800, share: 1.1, avg: 1400, median: 1400, p10: 850, p90: 2000 },
    { id: '12', name: 'Сопутствующие расходы', ref: 7128, a1: 6200, a2: 7500, a3: 8800, share: 5.6, avg: 7500, median: 7500, p10: 5300, p90: 9500 },
    { id: '13', name: 'Непредвиденные расходы', ref: 2447, a1: 1800, a2: 2500, a3: 3200, share: 1.9, avg: 2500, median: 2500, p10: 1500, p90: 3400 },
  ]

  const totalRef = sections.reduce((s, c) => s + c.ref, 0)
  const totalA1 = sections.reduce((s, c) => s + c.a1, 0)
  const totalA2 = sections.reduce((s, c) => s + c.a2, 0)
  const totalA3 = sections.reduce((s, c) => s + c.a3, 0)
  const totalAvg = sections.reduce((s, c) => s + c.avg, 0)
  const totalMedian = sections.reduce((s, c) => s + c.median, 0)
  const totalP10 = sections.reduce((s, c) => s + c.p10, 0)
  const totalP90 = sections.reduce((s, c) => s + c.p90, 0)

  const maxChart = Math.max(...sections.map(s => Math.max(s.p90, s.ref))) * 1.12
  const pct = (v: number) => (v / maxChart) * 100

  const devPct = (ref: number, avg: number) => ((ref - avg) / avg * 100).toFixed(1)
  const devCls = (ref: number, avg: number) => {
    const d = Math.abs((ref - avg) / avg * 100)
    return d > 15 ? 'text-red-600 font-bold' : d > 8 ? 'text-amber-600' : 'text-green-600'
  }
  const refCls = (ref: number, p10: number, p90: number) => ref < p10 || ref > p90 ? 'bg-red-50/60' : ''

  return (
    <div className="p-6">
      {/* Report header */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[0.95rem] font-bold text-slate-800">Сравнительный анализ стоимости строительства</div>
            <div className="text-[0.72rem] text-slate-400 mt-0.5">ЖК «Северный» · PRJ-2024-015 · Данные дефлятированы к Q1 2024</div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-white rounded-lg text-[0.72rem] font-medium cursor-pointer border-none hover:opacity-90 transition-opacity" style={{ background: BRAND }}><I.Download /> .xlsx</button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 text-white rounded-lg text-[0.72rem] font-medium cursor-pointer border-none hover:bg-slate-600 transition-colors"><I.Download /> .pdf</button>
          </div>
        </div>
        <div className="flex gap-3">
          {[
            { l: 'Площадь', v: '47 000 м²' }, { l: 'Этажность', v: '24 + 2 подз.' },
            { l: 'Класс', v: 'Бизнес' }, { l: 'Аналогов', v: '3 проекта' },
            { l: 'Выборка', v: '18 проектов' }, { l: 'Дата отчёта', v: '19.02.2026' },
          ].map(t => (
            <div key={t.l} className="flex-1 bg-slate-50 rounded-lg px-3 py-1.5">
              <div className="text-[0.55rem] text-slate-400 uppercase font-bold">{t.l}</div>
              <div className="text-[0.72rem] font-semibold text-slate-700">{t.v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-4">
        {([
          { key: 'table' as const, label: '📊 Сравнительный анализ' },
          { key: 'chart' as const, label: '📈 Разброс P10 – Медиана – P90' },
        ]).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-2 rounded-lg text-[0.75rem] font-medium border cursor-pointer transition-colors ${tab === t.key ? 'bg-[#059669]/10 text-[#059669] font-semibold border-[#059669]/20' : 'bg-white text-slate-500 hover:bg-slate-50 border-slate-200'}`}>{t.label}</button>
        ))}
      </div>

      {tab === 'table' && (
        <>
          {/* Comparison table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-[0.58rem] text-slate-400 uppercase tracking-wider bg-slate-50">
                    <th className="text-left px-3 py-2 font-semibold" style={{ minWidth: 155 }}>Раздел</th>
                    <th className="text-right px-2 py-2 font-semibold" style={{ background: '#05966910', minWidth: 68 }}>Проект</th>
                    <th className="text-right px-2 py-2 font-semibold" style={{ minWidth: 62 }}>Аналог 1</th>
                    <th className="text-right px-2 py-2 font-semibold" style={{ minWidth: 62 }}>Аналог 2</th>
                    <th className="text-right px-2 py-2 font-semibold" style={{ minWidth: 62 }}>Аналог 3</th>
                    <th className="text-center px-1 py-2 font-semibold" style={{ minWidth: 36 }}>Доля</th>
                    <th className="text-right px-2 py-2 font-semibold text-blue-400" style={{ minWidth: 52 }}>P10</th>
                    <th className="text-right px-2 py-2 font-semibold" style={{ minWidth: 58 }}>Среднее</th>
                    <th className="text-right px-2 py-2 font-semibold text-emerald-500" style={{ minWidth: 56 }}>Медиана</th>
                    <th className="text-right px-2 py-2 font-semibold text-blue-400" style={{ minWidth: 52 }}>P90</th>
                    <th className="text-right px-2 py-2 font-semibold" style={{ minWidth: 48 }}>Откл.%</th>
                  </tr>
                </thead>
                <tbody>
                  {sections.map(c => (
                    <tr key={c.id} className={`border-t border-slate-100 text-[0.68rem] hover:bg-slate-50/50 ${refCls(c.ref, c.p10, c.p90)}`}>
                      <td className="px-3 py-1.5 font-semibold text-slate-700"><span className="text-slate-400 mr-0.5">{c.id}.</span> {c.name}</td>
                      <td className="text-right px-2 py-1.5 font-mono font-bold text-slate-800" style={{ background: '#05966906' }}>{fmt(c.ref)}</td>
                      <td className="text-right px-2 py-1.5 font-mono text-slate-500">{fmt(c.a1)}</td>
                      <td className="text-right px-2 py-1.5 font-mono text-slate-500">{fmt(c.a2)}</td>
                      <td className="text-right px-2 py-1.5 font-mono text-slate-500">{fmt(c.a3)}</td>
                      <td className="text-center px-1 py-1.5 text-[0.6rem] text-slate-400">{c.share}%</td>
                      <td className="text-right px-2 py-1.5 font-mono text-[0.62rem] text-blue-500">{fmt(c.p10)}</td>
                      <td className="text-right px-2 py-1.5 font-mono text-slate-600 font-semibold">{fmt(c.avg)}</td>
                      <td className="text-right px-2 py-1.5 font-mono text-emerald-600 font-semibold">{fmt(c.median)}</td>
                      <td className="text-right px-2 py-1.5 font-mono text-[0.62rem] text-blue-500">{fmt(c.p90)}</td>
                      <td className={`text-right px-2 py-1.5 font-mono text-[0.62rem] ${devCls(c.ref, c.avg)}`}>{Number(devPct(c.ref, c.avg)) > 0 ? '+' : ''}{devPct(c.ref, c.avg)}%</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-slate-300 bg-slate-50 text-[0.7rem] font-bold">
                    <td className="px-3 py-2 text-slate-800">Итого (₽/м²)</td>
                    <td className="text-right px-2 py-2 font-mono text-slate-800" style={{ background: '#05966910' }}>{fmt(totalRef)}</td>
                    <td className="text-right px-2 py-2 font-mono text-slate-600">{fmt(totalA1)}</td>
                    <td className="text-right px-2 py-2 font-mono text-slate-600">{fmt(totalA2)}</td>
                    <td className="text-right px-2 py-2 font-mono text-slate-600">{fmt(totalA3)}</td>
                    <td className="text-center px-1 py-2 text-slate-400">100%</td>
                    <td className="text-right px-2 py-2 font-mono text-blue-500">{fmt(totalP10)}</td>
                    <td className="text-right px-2 py-2 font-mono text-slate-800">{fmt(totalAvg)}</td>
                    <td className="text-right px-2 py-2 font-mono text-emerald-600">{fmt(totalMedian)}</td>
                    <td className="text-right px-2 py-2 font-mono text-blue-500">{fmt(totalP90)}</td>
                    <td className={`text-right px-2 py-2 font-mono text-[0.62rem] ${devCls(totalRef, totalAvg)}`}>{Number(devPct(totalRef, totalAvg)) > 0 ? '+' : ''}{devPct(totalRef, totalAvg)}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-white rounded-xl border border-slate-200 p-3 text-center">
              <div className="text-[0.58rem] text-blue-400 uppercase font-bold">P10</div>
              <div className="text-lg font-extrabold text-blue-600">{fmt(totalP10)}</div>
              <div className="text-[0.58rem] text-slate-400">₽/м²</div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-3 text-center" style={{ borderBottomWidth: 3, borderBottomColor: '#22c55e' }}>
              <div className="text-[0.58rem] text-emerald-500 uppercase font-bold">Медиана</div>
              <div className="text-lg font-extrabold text-slate-800">{fmt(totalMedian)}</div>
              <div className="text-[0.58rem] text-slate-400">₽/м²</div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-3 text-center" style={{ borderBottomWidth: 3, borderBottomColor: '#1e293b' }}>
              <div className="text-[0.58rem] text-slate-500 uppercase font-bold">Среднее</div>
              <div className="text-lg font-extrabold text-slate-800">{fmt(totalAvg)}</div>
              <div className="text-[0.58rem] text-slate-400">₽/м²</div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-3 text-center">
              <div className="text-[0.58rem] text-blue-400 uppercase font-bold">P90</div>
              <div className="text-lg font-extrabold text-blue-600">{fmt(totalP90)}</div>
              <div className="text-[0.58rem] text-slate-400">₽/м²</div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-5 mt-3">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-red-50 border border-red-200" /><span className="text-[0.65rem] text-slate-500">Проект за пределами P10–P90</span></div>
            <div className="flex items-center gap-1.5"><span className="text-[0.65rem] text-green-600 font-mono font-bold">+2.1%</span><span className="text-[0.65rem] text-slate-500">— отклонение от среднего в норме</span></div>
            <div className="flex items-center gap-1.5"><span className="text-[0.65rem] text-red-600 font-mono font-bold">-18.3%</span><span className="text-[0.65rem] text-slate-500">— значительное отклонение</span></div>
          </div>
        </>
      )}

      {tab === 'chart' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="text-[0.85rem] font-bold text-slate-800 mb-1">Разброс и статистика (P10 – Медиана – P90)</div>
          <div className="text-[0.68rem] text-slate-400 mb-4">Удельная стоимость по разделам, ₽/м² · ЖК «Северный» vs выборка 18 проектов</div>

          {/* Legend */}
          <div className="flex items-center gap-5 mb-5 pb-3 border-b border-slate-100">
            <span className="flex items-center gap-1.5 text-[0.68rem] text-slate-600">
              <span className="inline-block w-5 h-3 rounded-sm" style={{ background: '#bfdbfe' }} />Разброс P10–P90
            </span>
            <span className="flex items-center gap-1.5 text-[0.68rem] text-slate-600">
              <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: '#22c55e' }} />Медиана
            </span>
            <span className="flex items-center gap-1.5 text-[0.68rem] text-slate-600">
              <span className="inline-block w-1 h-3" style={{ background: '#1e293b', borderRadius: 1 }} />Среднее
            </span>
            <span className="flex items-center gap-1.5 text-[0.68rem] text-slate-600">
              <span className="inline-block" style={{ width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '8px solid #ef4444' }} />Объект проверки
            </span>
          </div>

          {/* Chart rows */}
          <div className="space-y-1.5">
            {sections.map(s => (
              <div key={s.id} className="flex items-center gap-2 group">
                <div className="text-[0.65rem] text-slate-600 text-right shrink-0 truncate" style={{ width: 165 }}>
                  <span className="text-slate-400">{s.id}.</span> {s.name}
                </div>
                <div className="flex-1 relative" style={{ height: 22 }}>
                  {/* P10-P90 range bar */}
                  <div className="absolute rounded" style={{ left: `${pct(s.p10)}%`, width: `${pct(s.p90) - pct(s.p10)}%`, top: 3, height: 16, background: '#bfdbfe' }} />
                  {/* Average bar */}
                  <div className="absolute" style={{ left: `${pct(s.avg)}%`, top: 3, width: 3, height: 16, background: '#1e293b', borderRadius: 1, transform: 'translateX(-50%)' }} />
                  {/* Median square */}
                  <div className="absolute" style={{ left: `${pct(s.median)}%`, top: 5, width: 10, height: 10, background: '#22c55e', borderRadius: 2, transform: 'translateX(-50%)', border: '1.5px solid white', boxShadow: '0 0 0 0.5px #22c55e' }} />
                  {/* Project value triangle */}
                  <div className="absolute" style={{ left: `${pct(s.ref)}%`, top: 0, transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '8px solid #ef4444' }} />
                </div>
                <div className="text-[0.58rem] font-mono text-slate-400 shrink-0 text-right" style={{ width: 45 }}>{fmt(s.ref)}</div>
              </div>
            ))}
          </div>

          {/* X-axis */}
          <div className="flex items-center gap-2 mt-2">
            <div style={{ width: 165 }} className="shrink-0" />
            <div className="flex-1 relative h-5 border-t border-slate-200">
              {[0, 5000, 10000, 15000, 20000, 25000, 30000].map(v => (
                <div key={v} className="absolute text-[0.52rem] text-slate-400" style={{ left: `${pct(v)}%`, top: 3, transform: 'translateX(-50%)' }}>{v === 0 ? '0' : `${v / 1000}k`}</div>
              ))}
            </div>
            <div style={{ width: 45 }} className="shrink-0 text-[0.52rem] text-slate-400 text-right">₽/м²</div>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100">
            <div className="bg-blue-50 rounded-lg p-2.5 text-center">
              <div className="text-[0.55rem] text-blue-500 font-bold uppercase">P10 итого</div>
              <div className="text-[0.85rem] font-extrabold text-blue-700">{fmt(totalP10)} ₽/м²</div>
            </div>
            <div className="bg-emerald-50 rounded-lg p-2.5 text-center">
              <div className="text-[0.55rem] text-emerald-500 font-bold uppercase">Медиана</div>
              <div className="text-[0.85rem] font-extrabold text-emerald-700">{fmt(totalMedian)} ₽/м²</div>
            </div>
            <div className="bg-slate-100 rounded-lg p-2.5 text-center">
              <div className="text-[0.55rem] text-slate-500 font-bold uppercase">Среднее</div>
              <div className="text-[0.85rem] font-extrabold text-slate-700">{fmt(totalAvg)} ₽/м²</div>
            </div>
            <div className="bg-red-50 rounded-lg p-2.5 text-center">
              <div className="text-[0.55rem] text-red-500 font-bold uppercase">Объект проверки</div>
              <div className="text-[0.85rem] font-extrabold text-red-700">{fmt(totalRef)} ₽/м²</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ===== AI CLASSIFICATION ===== */
function PgAI() {
  const [model, setModel] = useState<'gemini' | 'ollama'>('gemini')

  const classifications = [
    { input: 'Бетон В25 монолитных стен подземной части', l1: '4. Фундаменты и Конструкции подземной части', l2: '4.4 Монолитные ЖБК подземной части', l3: '4.4.1 Устр-во монолитных стен', l4: '4.4.1.1 Бетон B25, А500С, 80-110 кг/м³', confidence: 97 },
    { input: 'Кладка стен из газобетонных блоков D500', l1: '6. Общестроительные работы (АР)', l2: '6.5 Внутренние стены и перегородки', l3: '6.5.2 Кладка перегородок из газобетонных блоков', l4: '—', confidence: 95 },
    { input: 'Устройство навесного вент. фасада из керамогранита', l1: '6. Общестроительные работы (АР)', l2: '6.1 Фасадные работы', l3: '6.1.1 Навесные вентилируемые фасадные системы (НВФ)', l4: '—', confidence: 93 },
    { input: 'Прокладка кабеля ВВГнг-LS 3x2.5 в гофре', l1: '8. Внутренние инженерные системы (ВИС)', l2: '8.3 Системы электроснабжения (ЭОМ)', l3: '8.3.1 Силовое электрооборудование (ЭМ)', l4: '—', confidence: 91 },
    { input: 'Монтаж приточно-вытяжной установки', l1: '8. Внутренние инженерные системы (ВИС)', l2: '8.2 Системы ОВиК', l3: '8.2.2 Вентиляция общеобменная (В)', l4: '—', confidence: 78 },
    { input: 'Устройство бетонных полов с упрочнением MasterTop', l1: '7. Отделочные работы (АИ)', l2: '7.1 Отделка Паркинга', l3: '7.1.1 Устройство и отделка полов', l4: '7.1.1.3 Бетонные полы с упрочн. слоем', confidence: 94 },
    { input: 'Разработка грунта экскаватором с погрузкой', l1: '3. Земляные работы и Огражд. котлована', l2: '3.2 Разработка котлована', l3: '—', l4: '—', confidence: 64 },
    { input: 'Монтаж подвесного потолка Армстронг в офисах', l1: '7. Отделочные работы (АИ)', l2: '7.7 Отделка Коммерческих/Офисных помещ.', l3: '7.7.3 Устройство и отделка потолков', l4: '7.7.3.1 Подвесной потолок Армстронг', confidence: 96 },
  ]

  const confColor = (c: number) => {
    if (c >= 90) return 'bg-green-50 text-green-700 border-green-200'
    if (c >= 70) return 'bg-amber-50 text-amber-700 border-amber-200'
    return 'bg-red-50 text-red-700 border-red-200'
  }

  const pipelineSteps = [
    { label: 'Загрузка', emoji: '📥', done: true },
    { label: 'Парсинг', emoji: '📋', done: true },
    { label: 'AI-классификация', emoji: '🤖', done: true },
    { label: 'Валидация', emoji: '✅', done: true },
    { label: 'Экспорт', emoji: '📤', done: false },
  ]

  return (
    <div className="p-6">
      {/* Upload zone */}
      <div className="border-2 border-dashed rounded-xl p-5 text-center mb-5 transition-colors" style={{ borderColor: `${BRAND}40`, background: `${BRAND}05` }}>
        <div className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center" style={{ background: `${BRAND}15` }}>
          <div style={{ color: BRAND }}><I.Upload /></div>
        </div>
        <div className="text-[0.82rem] font-medium text-slate-700 mb-1">Загрузите XLSX-файл сметы</div>
        <div className="text-[0.7rem] text-slate-400">Перетащите файл или нажмите для выбора · .xlsx, .xls до 50 MB</div>
      </div>

      {/* Model selector + stats */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="text-[0.72rem] text-slate-500 font-medium">Модель:</div>
          <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden">
            <button onClick={() => setModel('gemini')} className={`px-3 py-1.5 text-[0.72rem] font-medium border-none cursor-pointer transition-colors ${model === 'gemini' ? 'bg-[#059669]/10 text-[#059669]' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>✨ Gemini Pro</button>
            <button onClick={() => setModel('ollama')} className={`px-3 py-1.5 text-[0.72rem] font-medium border-none cursor-pointer transition-colors ${model === 'ollama' ? 'bg-[#059669]/10 text-[#059669]' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>🦙 Ollama (local)</button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-[0.72rem] text-slate-500"><span className="font-bold text-slate-800">847</span> позиций → <span className="font-bold text-green-600">812</span> классифицировано (95.9%)</div>
          <div className="text-[0.72rem] text-amber-500 font-medium">35 требуют проверки</div>
        </div>
      </div>

      {/* Pipeline */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-5">
        <div className="text-[0.72rem] font-semibold text-slate-700 mb-3">Конвейер обработки</div>
        <div className="flex items-center gap-1">
          {pipelineSteps.map((step, i) => (
            <div key={step.label} className="flex items-center gap-1 flex-1">
              <div className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border ${step.done ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
                <span className="text-[0.8rem]">{step.emoji}</span>
                <span className={`text-[0.7rem] font-medium ${step.done ? 'text-green-700' : 'text-slate-400'}`}>{step.label}</span>
                {step.done && <span className="text-green-500 text-[0.7rem] ml-auto">✓</span>}
              </div>
              {i < pipelineSteps.length - 1 && <span className="text-slate-300 text-[0.8rem] shrink-0">→</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Classification results table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-[0.65rem] text-slate-400 uppercase tracking-wider bg-slate-50">
              <th className="text-left px-4 py-2.5 font-semibold" style={{ width: '22%' }}>Исходная позиция</th>
              <th className="text-left px-3 py-2.5 font-semibold">L1 · Раздел</th>
              <th className="text-left px-3 py-2.5 font-semibold">L2 · Группа</th>
              <th className="text-left px-3 py-2.5 font-semibold">L3 · Подгруппа</th>
              <th className="text-left px-3 py-2.5 font-semibold">L4 · Позиция</th>
              <th className="text-center px-3 py-2.5 font-semibold">Точность</th>
            </tr>
          </thead>
          <tbody>
            {classifications.map((c, i) => (
              <tr key={i} className={`border-t border-slate-100 text-[0.73rem] hover:bg-slate-50/50 ${i % 2 ? 'bg-slate-50/30' : ''}`}>
                <td className="px-4 py-2.5 text-slate-700 font-medium">{c.input}</td>
                <td className="px-3 py-2.5"><span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[0.6rem] font-medium">{c.l1}</span></td>
                <td className="px-3 py-2.5"><span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[0.6rem] font-medium">{c.l2}</span></td>
                <td className="px-3 py-2.5"><span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[0.6rem] font-medium">{c.l3}</span></td>
                <td className="px-3 py-2.5">{c.l4 !== '—' ? <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 text-[0.6rem] font-medium">{c.l4}</span> : <span className="text-[0.6rem] text-slate-300">—</span>}</td>
                <td className="px-3 py-2.5 text-center">
                  <span className={`inline-block px-2 py-0.5 rounded border text-[0.65rem] font-bold ${confColor(c.confidence)}`}>{c.confidence}%</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between mt-3">
        <span className="text-[0.72rem] text-slate-400">Показано 8 из 847 позиций · Классификатор: 14 разделов, 4 уровня</span>
        <button className="flex items-center gap-1.5 px-4 py-2 text-white rounded-lg text-[0.75rem] font-medium cursor-pointer border-none hover:opacity-90 transition-opacity" style={{ background: BRAND }}>
          <I.Download /> Экспорт результатов
        </button>
      </div>
    </div>
  )
}

/* ===== DEFLATORS ===== */
function PgDeflators() {
  const deflators = [
    { year: 2022, coeff: 1.000, cumulative: 1.000 },
    { year: 2023, coeff: 1.085, cumulative: 1.085 },
    { year: 2024, coeff: 1.047, cumulative: 1.136 },
    { year: 2025, coeff: 1.032, cumulative: 1.172 },
    { year: 2026, coeff: 1.025, cumulative: 1.202 },
  ]

  return (
    <div className="p-6">
      <div className="max-w-[800px]">
        {/* Info card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-5" style={{ borderLeftWidth: 3, borderLeftColor: BRAND }}>
          <div className="text-[0.82rem] font-bold text-slate-800 mb-2">Что такое дефляторы?</div>
          <div className="text-[0.75rem] text-slate-600 leading-relaxed">
            Дефляторы — это индексы, отражающие изменение уровня цен в строительной отрасли по годам.
            Они применяются для приведения стоимости строительства разных лет к единой ценовой базе,
            что позволяет корректно сравнивать проекты, реализованные в разное время. Базовый год (2022)
            принимается за 1.000. Кумулятивный коэффициент рассчитывается как произведение всех
            годовых коэффициентов от базового года до текущего.
          </div>
        </div>

        {/* Deflator table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-5">
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50">
            <div className="text-[0.82rem] font-bold text-slate-700">Таблица дефляторов</div>
            <span className="text-[0.68rem] text-slate-400">Базовый год: 2022</span>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-[0.65rem] text-slate-400 uppercase tracking-wider bg-slate-50/50">
                <th className="text-left px-5 py-2.5 font-semibold">Год</th>
                <th className="text-right px-5 py-2.5 font-semibold">Годовой коэффициент</th>
                <th className="text-right px-5 py-2.5 font-semibold">Кумулятивный</th>
                <th className="text-right px-5 py-2.5 font-semibold">Рост к базе</th>
              </tr>
            </thead>
            <tbody>
              {deflators.map((d) => (
                <tr key={d.year} className={`border-t border-slate-100 text-[0.78rem] hover:bg-slate-50/50 ${d.year === 2022 ? 'bg-[#059669]/5' : ''}`}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">{d.year}</span>
                      {d.year === 2022 && <Badge color="green">Базовый</Badge>}
                      {d.year === 2026 && <Badge color="amber">Прогноз</Badge>}
                    </div>
                  </td>
                  <td className="text-right px-5 py-3 font-mono text-slate-700">{d.coeff.toFixed(3)}</td>
                  <td className="text-right px-5 py-3 font-mono font-bold text-slate-800">{d.cumulative.toFixed(3)}</td>
                  <td className="text-right px-5 py-3">
                    <span className={`font-mono text-[0.75rem] ${d.year === 2022 ? 'text-slate-400' : 'text-amber-600'}`}>
                      {d.year === 2022 ? '—' : `+${((d.cumulative - 1) * 100).toFixed(1)}%`}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Visual bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-5">
          <div className="text-[0.82rem] font-bold text-slate-800 mb-4">Динамика кумулятивного индекса</div>
          <div className="space-y-2.5">
            {deflators.map(d => (
              <div key={d.year} className="flex items-center gap-3">
                <span className="text-[0.75rem] font-bold text-slate-600 w-10">{d.year}</span>
                <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2" style={{ width: `${(d.cumulative / 1.25) * 100}%`, background: `linear-gradient(90deg, ${BRAND}, #34D399)` }}>
                    <span className="text-[0.6rem] font-bold text-white">{d.cumulative.toFixed(3)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Example */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-5">
          <div className="text-[0.82rem] font-bold text-slate-800 mb-3">Пример расчёта</div>
          <div className="bg-slate-50 rounded-xl p-4 text-[0.75rem] text-slate-600 leading-relaxed">
            <p className="mb-2">Стоимость объекта в ценах 2024 г.: <span className="font-bold text-slate-800">5 650 000 000 ₽</span></p>
            <p className="mb-2">Кумулятивный дефлятор 2024: <span className="font-bold text-slate-800">1.136</span></p>
            <p className="mb-2">Стоимость в базовых ценах 2022 г.: <span className="font-bold text-slate-800">5 650 000 000 / 1.136 = {fmt(Math.round(5650000000 / 1.136))} ₽</span></p>
            <p>Разница: <span className="font-bold text-amber-600">-{fmt(5650000000 - Math.round(5650000000 / 1.136))} ₽</span> (инфляционная составляющая)</p>
          </div>
        </div>

        <button className="px-5 py-2.5 text-white rounded-xl text-[0.8rem] font-semibold border-none cursor-pointer hover:opacity-90 transition-opacity flex items-center justify-center gap-2" style={{ background: BRAND }}>
          + Добавить
        </button>
      </div>
    </div>
  )
}
