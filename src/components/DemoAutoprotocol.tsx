import React, { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { tracker } from '../utils/tracker'

type Screen = 'pipeline' | 'history' | 'results' | 'dashboard' | 'admin'

type MeetingType = { id: string; name: string }
type DomainInfo = { label: string; short: string; emoji: string; requiresProject: boolean; hasRiskBrief: boolean; meetingTypes: MeetingType[] }

const DOMAINS: Record<string, DomainInfo> = {
  construction: {
    label: 'Стройка',
    short: 'Стройка',
    emoji: '🏗',
    requiresProject: true,
    hasRiskBrief: true,
    meetingTypes: [{ id: 'site_meeting', name: 'Совещание на объекте' }],
  },
  fta: {
    label: 'Финансовый аудит',
    short: 'Аудит',
    emoji: '📊',
    requiresProject: true,
    hasRiskBrief: false,
    meetingTypes: [{ id: 'audit', name: 'Аудит' }],
  },
  dct: {
    label: 'IT / Разработка',
    short: 'IT',
    emoji: '💻',
    requiresProject: false,
    hasRiskBrief: false,
    meetingTypes: [
      { id: 'standup', name: 'Стендап' },
      { id: 'sprint_planning', name: 'Планирование спринта' },
      { id: 'sprint_review', name: 'Демо / ревью спринта' },
      { id: 'retrospective', name: 'Ретроспектива' },
      { id: 'tech_review', name: 'Архитектурное ревью' },
      { id: 'post_mortem', name: 'Post-mortem / разбор инцидента' },
    ],
  },
  business: {
    label: 'Бизнес-встречи',
    short: 'Бизнес',
    emoji: '💼',
    requiresProject: false,
    hasRiskBrief: false,
    meetingTypes: [
      { id: 'negotiation', name: 'Переговоры' },
      { id: 'client_meeting', name: 'Встреча с клиентом' },
      { id: 'strategic_planning', name: 'Стратегическое планирование' },
      { id: 'presentation', name: 'Презентация' },
      { id: 'work_meeting', name: 'Рабочее совещание' },
      { id: 'brainstorm', name: 'Мозговой штурм' },
      { id: 'lecture', name: 'Лекция / Вебинар' },
    ],
  },
  ceo: {
    label: 'Стратегическое руководство',
    short: 'Руководство',
    emoji: '👔',
    requiresProject: false,
    hasRiskBrief: false,
    meetingTypes: [{ id: 'strategic', name: 'Стратегическое совещание' }],
  },
}

/* ── Icons ── */
const I = {
  Check: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>,
  Download: () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>,
}

const nav: { key: Screen; emoji: string; label: string; section?: string }[] = [
  { key: 'pipeline', emoji: '⚡', label: 'Пайплайн' },
  { key: 'history', emoji: '📋', label: 'История' },
  { key: 'results', emoji: '📄', label: 'Результаты', section: 'АНАЛИТИКА' },
  { key: 'dashboard', emoji: '📊', label: 'Дашборд' },
  { key: 'admin', emoji: '🔧', label: 'Админ-панель', section: 'АДМИНИСТРИРОВАНИЕ' },
]

const titles: Record<Screen, string> = {
  pipeline: 'Пайплайн обработки', history: 'История обработок',
  results: 'Результаты', dashboard: 'Dashboard менеджера', admin: 'Админ-панель',
}

/* ===== EXPORT ===== */
export function DemoAutoprotocol() {
  const [open, setOpen] = useState(false)
  const openedAt = useRef(0)
  const handleOpen = (e: React.MouseEvent) => { e.stopPropagation(); setOpen(true); openedAt.current = Date.now(); tracker.track('demo_open', { product: 'autoprotocol' }) }
  const handleClose = () => { setOpen(false); tracker.track('demo_close', { product: 'autoprotocol', duration_s: Math.round((Date.now() - openedAt.current) / 1000) }) }
  return (
    <>
      <div className="btn-premium-wrap" onClick={handleOpen}>
        <button className="btn-premium">
          <div className="btn-premium-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold"><span className="hidden md:inline">Запустить демо</span><span className="md:hidden">Обзор продукта</span></div>
            <div className="text-xs text-muted mt-0.5"><span className="hidden md:inline">Интерактивный концепт (live-демо)</span><span className="md:hidden">6 слайдов о возможностях</span></div>
          </div>
          <svg className="btn-premium-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
      {open && <Modal onClose={handleClose} />}
    </>
  )
}

/* ===== MOBILE TEASER (Stories format) ===== */
function MobileTeaser({ onClose }: { onClose: () => void }) {
  const TOTAL = 6
  const DURATION = 5000
  const TICK = 50
  const ACCENT = '#8B5CF6'
  const [activeSlide, setActiveSlide] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // Pipeline animation for slide 1
  const [pipeProgress, setPipeProgress] = useState(0)
  const [pipeStageIdx, setPipeStageIdx] = useState(0)
  useEffect(() => {
    if (activeSlide !== 1) { setPipeProgress(0); setPipeStageIdx(0); return }
    if (pipeProgress >= 100) return
    const id = setInterval(() => {
      setPipeProgress(p => {
        const next = Math.min(p + 0.8, 100)
        setPipeStageIdx(Math.min(Math.floor(next / (100 / 7)), 6))
        return next
      })
    }, 50)
    return () => clearInterval(id)
  }, [activeSlide, pipeProgress])

  // Auto-advance (pause on slide 1 until pipeline finishes)
  const pipelineBusy = activeSlide === 1 && pipeProgress < 100
  useEffect(() => {
    if (isPaused || pipelineBusy) return
    const id = setInterval(() => {
      setProgress(prev => {
        const next = prev + (100 / (DURATION / TICK))
        if (next >= 100) {
          setActiveSlide(s => s < TOTAL - 1 ? s + 1 : s)
          return 0
        }
        return next
      })
    }, TICK)
    return () => clearInterval(id)
  }, [isPaused, activeSlide, pipelineBusy])

  useEffect(() => { setProgress(0) }, [activeSlide])

  const goNext = () => { if (activeSlide < TOTAL - 1) setActiveSlide(s => s + 1) }
  const goPrev = () => { if (activeSlide > 0) setActiveSlide(s => s - 1) }
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    if (x < rect.width / 3) goPrev(); else goNext()
  }

  const Slide = ({ title, children, caption }: { title: string; children: React.ReactNode; caption: string }) => (
    <div className="flex flex-col items-center h-full px-6 pt-14 pb-6 text-center">
      <h2 className="text-[22px] font-extrabold text-white mb-auto leading-tight">{title}</h2>
      <div className="w-full flex-1 flex items-center justify-center py-4">{children}</div>
      <p className="text-[14px] text-white/50 leading-relaxed max-w-[300px] mt-auto">{caption}</p>
    </div>
  )

  const pipeStages = [
    { name: 'Извлечение аудио', tech: 'FFmpeg' },
    { name: 'Детекция речи', tech: 'Silero VAD' },
    { name: 'Транскрипция', tech: 'WhisperX' },
    { name: 'Диаризация', tech: 'pyannote 3.1' },
    { name: 'Перевод', tech: 'LLM' },
    { name: 'Анализ эмоций', tech: 'wav2vec2' },
    { name: 'Генерация артефактов', tech: 'LLM' },
  ]
  const pipeDone = pipeProgress >= 100

  const slides: React.ReactNode[] = [
    /* 0 -- Проблема */
    <Slide key={0} title="Ручное протоколирование?" caption="Администратор проекта расшифровывает записи вручную, структурирует повестку и распределяет поручения.">
      <div className="w-full max-w-[300px] space-y-3">
        <div className="bg-white/[0.07] border border-white/10 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
          </div>
          <div className="text-left flex-1 min-w-0">
            <div className="text-[12px] font-semibold text-white truncate">production_meeting.mp4</div>
            <div className="text-[10px] text-white/35">1:23:45 · 847 МБ</div>
          </div>
        </div>
        {['Расшифровка — 3+ часа вручную', 'Идентификация спикеров — вручную', 'Поручения теряются в переписке'].map(t => (
          <div key={t} className="flex items-center gap-3 rounded-xl px-4 py-2.5 bg-red-500/10 border border-red-500/10">
            <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            <span className="text-[13px] text-white/70">{t}</span>
          </div>
        ))}
      </div>
    </Slide>,

    /* 1 -- ML-пайплайн */
    <Slide key={1} title="7 этапов обработки" caption="Celery + Redis + GPU. Час записи обрабатывается примерно за 5 минут.">
      <div className="w-full max-w-[300px]">
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-4">
          <div className="h-full rounded-full transition-all duration-75" style={{ width: `${pipeProgress}%`, background: ACCENT }} />
        </div>
        <div className="space-y-1">
          {pipeStages.map((s, i) => {
            const completed = pipeDone || i < pipeStageIdx
            const active = i === pipeStageIdx && !pipeDone
            return (
              <div key={s.name} className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-all ${active ? 'bg-white/10 border border-purple-500/20' : ''}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 ${completed ? 'bg-green-500/20 text-green-400' : active ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-white/20'}`}>
                  {completed ? '✓' : <span className="text-[9px]">{i + 1}</span>}
                </div>
                <span className={`text-[12px] flex-1 text-left ${completed ? 'text-white/40 line-through' : active ? 'text-white font-medium' : 'text-white/30'}`}>{s.name}</span>
                <span className={`text-[9px] font-mono ${active ? 'text-purple-400' : 'text-white/15'}`}>{s.tech}</span>
                {active && <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: ACCENT }} />}
              </div>
            )
          })}
        </div>
        {pipeDone && (
          <div className="flex justify-center gap-4 mt-3 pt-3 border-t border-white/5">
            {[{ v: '~5 мин', l: 'на час записи' }, { v: '5', l: 'спикеров' }, { v: '90+', l: 'языков' }].map(s => (
              <div key={s.l} className="text-center">
                <div className="text-[15px] font-extrabold text-white">{s.v}</div>
                <div className="text-[9px] text-white/30">{s.l}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Slide>,

    /* 2 -- Артефакты */
    <Slide key={2} title="5 документов на выходе" caption="Все артефакты формируются автоматически на основе structured output LLM.">
      <div className="w-full max-w-[300px] space-y-2">
        {[
          { icon: '\uD83D\uDEE1\uFE0F', name: 'Risk Brief', ext: 'DOCX', desc: 'Матрица рисков, root cause (стройконтроль)', color: '#EF4444' },
          { icon: '\uD83D\uDCCA', name: 'Excel-отчёт', ext: 'XLSX', desc: 'Задачи, сроки, приоритеты', color: '#10B981' },
          { icon: '\uD83D\uDCC4', name: 'Word-протокол', ext: 'DOCX', desc: 'Резюме, повестка, решения', color: '#3B82F6' },
          { icon: '\uD83D\uDCD6', name: 'Конспект', ext: 'DOCX', desc: 'Краткий пересказ совещания', color: '#F59E0B' },
          { icon: '\uD83D\uDCDD', name: 'Pipeline data', ext: 'JSON', desc: 'Сегменты, спикеры, эмоции', color: '#8B5CF6' },
        ].map(d => (
          <div key={d.name} className="flex items-center gap-3 rounded-xl px-4 py-3 bg-white/[0.07] border border-white/10">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0" style={{ background: `${d.color}20` }}>{d.icon}</div>
            <div className="flex-1 min-w-0 text-left">
              <div className="text-[13px] font-semibold text-white">{d.name}</div>
              <div className="text-[11px] text-white/35">{d.desc}</div>
            </div>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded" style={{ background: `${d.color}20`, color: d.color }}>{d.ext}</span>
          </div>
        ))}
      </div>
    </Slide>,

    /* 3 -- Бизнес-домены */
    <Slide key={3} title="Пять доменов в проде" caption="У каждого — свой набор промптов, генераторы артефактов и личный кабинет. Архитектура общая.">
      <div className="w-full max-w-[300px]">
        <div className="space-y-1.5 mb-3">
          {[
            { name: 'Стройконтроль', icon: '🏗', desc: 'Совещания на объекте · Risk Brief', active: true },
            { name: 'Цифровизация',  icon: '🏢', desc: 'IT-команда · спринты, ретро', active: false },
            { name: 'Аудит',         icon: '📊', desc: 'Финансово-технический аудит', active: false },
            { name: 'Business',      icon: '💼', desc: '7 типов переговоров', active: false },
            { name: 'C-level',       icon: '👔', desc: 'Стратегические совещания', active: false },
          ].map(d => (
            <div key={d.name} className={`flex items-center gap-3 rounded-xl px-3 py-2 border ${d.active ? 'bg-purple-500/15 border-purple-500/30' : 'bg-white/5 border-white/5 opacity-60'}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 ${d.active ? 'bg-purple-500/20' : 'bg-white/5'}`}>{d.icon}</div>
              <div className="text-left flex-1 min-w-0">
                <div className={`text-[12px] font-semibold ${d.active ? 'text-white' : 'text-white/60'}`}>{d.name}</div>
                <div className="text-[9px] text-white/30 truncate">{d.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white/[0.04] border border-white/5 rounded-xl px-4 py-2 text-[10px] text-white/30 text-left">
          Единый реестр доменов · фабрика сервисов · lazy-loading промптов
        </div>
      </div>
    </Slide>,

    /* 4 -- Кабинет руководителя */
    <Slide key={4} title="Кабинет руководителя" caption="Все проекты, совещания и артефакты — в одном интерфейсе для каждого руководителя.">
      <div className="w-full max-w-[320px]">
        {/* Project pills */}
        <div className="flex gap-1.5 mb-3 overflow-x-auto">
          <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-purple-500/20 border border-purple-500/30 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            <span className="text-[10px] font-semibold text-white">Все</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-white/5 border border-white/5 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            <span className="text-[10px] text-white/50">Объект-A</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-white/5 border border-white/5 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="text-[10px] text-white/50">Объект-B</span>
          </div>
        </div>

        {/* Weekly calendar with event bars */}
        <div className="bg-white/[0.07] border border-white/10 rounded-xl p-3 mb-2.5">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-semibold text-white">3 — 7 марта</span>
            <span className="text-[8px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-medium">Неделя</span>
          </div>
          <div className="space-y-[3px]">
            {[
              { day: 'пн', d: 3, events: [{ name: 'Объект-A', code: '1041', color: '#EF4444' }, { name: 'Объект-B', code: '2073', color: '#F59E0B' }] },
              { day: 'вт', d: 4, events: [] },
              { day: 'ср', d: 5, events: [{ name: 'Объект-A', code: '1041', color: '#EF4444' }] },
              { day: 'чт', d: 6, events: [{ name: 'Объект-C', code: '3012', color: '#3B82F6' }] },
              { day: 'пт', d: 7, events: [{ name: 'Объект-B', code: '2073', color: '#F59E0B' }, { name: 'Объект-A', code: '1041', color: '#EF4444' }] },
            ].map(row => (
              <div key={row.d} className="flex items-center gap-2">
                <div className="w-[28px] shrink-0 text-right">
                  <span className="text-[8px] text-white/20 mr-1">{row.day}</span>
                  <span className="text-[9px] text-white/40 font-medium">{row.d}</span>
                </div>
                <div className="flex-1 flex flex-col gap-[2px] min-h-[16px]">
                  {row.events.map(ev => (
                    <div key={ev.code + row.d} className="h-[14px] rounded-[3px] px-1.5 flex items-center truncate" style={{ background: ev.color }}>
                      <span className="text-[7px] font-bold text-white truncate">[{ev.code}] {ev.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Требуют внимания */}
        <div className="bg-white/[0.04] border border-white/5 rounded-xl p-2.5">
          <div className="text-[9px] text-white/25 font-bold mb-1.5">Требуют внимания</div>
          {[
            { text: 'Не подтверждено выделение электромощности', proj: 'Объект-A' },
            { text: 'Нет согласования расхода воды', proj: 'Объект-B' },
          ].map(t => (
            <div key={t.text} className="flex items-start gap-2 mb-1.5 last:mb-0">
              <svg className="w-3 h-3 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <div className="text-left">
                <div className="text-[9px] text-white/50 leading-snug">{t.text}</div>
                <div className="text-[8px] text-white/20">{t.proj} · протокол 03.03</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Slide>,

    /* 5 -- Уведомления и эскалация */
    <div key={5} className="flex flex-col items-center h-full px-6 pt-14 pb-6">
      <h2 className="text-[22px] font-extrabold text-white leading-tight text-center mb-5">Уведомления и эскалация</h2>

      <div className="w-full max-w-[320px] mb-auto">
        {/* Flow steps */}
        <div className="relative pl-6 space-y-3 mb-4">
          <div className="absolute left-[9px] top-2 bottom-2 w-px bg-gradient-to-b from-purple-500/40 via-blue-500/40 to-red-500/40" />

          <div className="relative">
            <div className="absolute left-[-18px] top-1 w-[13px] h-[13px] rounded-full bg-purple-500/30 border-2 border-purple-400 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            </div>
            <div className="text-[13px] font-semibold text-white">Исполнитель загружает запись</div>
            <div className="text-[11px] text-white/35">Валидация и запуск обработки</div>
          </div>

          <div className="relative">
            <div className="absolute left-[-18px] top-1 w-[13px] h-[13px] rounded-full bg-blue-500/30 border-2 border-blue-400 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            </div>
            <div className="text-[13px] font-semibold text-white">Артефакты → руководителю проекта</div>
            <div className="text-[11px] text-white/35">Закреплённый РП получает документы автоматически</div>
          </div>

          <div className="relative">
            <div className="absolute left-[-18px] top-1 w-[13px] h-[13px] rounded-full bg-red-500/30 border-2 border-red-400 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
            </div>
            <div className="text-[13px] font-semibold text-red-400">Критический риск → эскалация</div>
            <div className="text-[11px] text-white/35">AI-анализ выявил риск — уведомление уровнем выше</div>
          </div>
        </div>

        {/* Email preview */}
        <div className="bg-white/[0.06] border border-red-500/15 rounded-xl overflow-hidden">
          <div className="bg-red-500/10 px-3.5 py-2 flex items-center gap-2">
            <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 4l-10 8L2 4"/></svg>
            <span className="text-[11px] font-bold text-red-300">Обнаружены критические риски</span>
          </div>
          <div className="px-3.5 py-3 space-y-1.5">
            <div className="flex justify-between text-[10px]">
              <span className="text-white/30">Проект</span>
              <span className="text-white/60 font-medium">ЖК «Объект-A»</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-white/30">Статус</span>
              <span className="text-red-400 font-bold">Критический</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-white/30">Дата</span>
              <span className="text-white/60">18.02.2026 07:20</span>
            </div>
            <div className="text-[10px] text-white/40 leading-snug pt-1 border-t border-white/5 mt-1">
              По результатам анализа совещания выявлены риски, требующие вашего внимания.
            </div>
            <div className="text-[10px] text-purple-400 font-medium pt-0.5">Открыть дашборд →</div>
          </div>
        </div>
      </div>

      <button
        onClick={onClose}
        className="px-8 py-3 rounded-2xl text-white text-[15px] font-bold border-none cursor-pointer shadow-lg active:scale-95 transition-transform mb-2 w-full max-w-[320px]"
        style={{ background: ACCENT, boxShadow: '0 10px 25px rgba(139,92,246,0.3)' }}
      >
        Закрыть превью
      </button>
      <div className="flex items-center gap-1.5 text-[11px] text-white/30">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
        <span>Полноэкранное демо — на ПК</span>
      </div>
    </div>,
  ]

  return (
    <div
      className="flex md:hidden flex-col h-full bg-[#0a0a0f] relative select-none"
      onClick={handleClick}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div className="absolute top-0 left-0 right-0 z-30 flex gap-1 px-3 pt-3">
        {Array.from({ length: TOTAL }).map((_, i) => (
          <div key={i} className="flex-1 h-[3px] rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-none"
              style={{ width: `${i < activeSlide ? 100 : i === activeSlide ? progress : 0}%` }}
            />
          </div>
        ))}
      </div>

      {/* Close button is rendered by parent Modal */}

      <div key={activeSlide} className="flex-1 min-h-0 animate-[fadeIn_0.35s_ease-out]">
        {slides[activeSlide]}
      </div>
    </div>
  )
}

/* ===== MODAL ===== */
function Modal({ onClose }: { onClose: () => void }) {
  const [screen, setScreen] = useState<Screen>('pipeline')
  const [domain, setDomain] = useState('construction')
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
        {/* Mobile teaser */}
        <MobileTeaser onClose={onClose} />
        <div className="hidden md:flex flex-1 min-h-0">
          {/* Sidebar — WHITE */}
          <div className="w-[240px] bg-white border-r border-slate-200 flex flex-col shrink-0">
            <div className="h-14 flex items-center px-4 border-b border-slate-200">
              <div className="w-8 h-8 rounded-lg bg-[#E52713] flex items-center justify-center text-[0.6rem] text-white font-bold mr-3">AP</div>
              <div><div className="text-sm font-bold text-slate-800">Автопротокол</div><div className="text-[0.58rem] text-slate-400">v2.0</div></div>
            </div>
            {/* Domain selector — grouped by project-binding */}
            <div className="px-3 pt-3 pb-1">
              <select value={domain} onChange={e => setDomain(e.target.value)} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[0.72rem] text-slate-600 cursor-pointer">
                <optgroup label="Привязка к проекту (нужен код проекта)">
                  <option value="construction">🏗 Стройка</option>
                  <option value="fta">📊 Финансовый аудит</option>
                </optgroup>
                <optgroup label="По типу совещания">
                  <option value="dct">💻 IT / цифровая трансформация</option>
                  <option value="business">💼 Бизнес-встречи</option>
                  <option value="ceo">👔 Стратегическое руководство</option>
                </optgroup>
              </select>
              <div className="text-[0.58rem] text-slate-400 mt-1 px-1 leading-snug">
                {DOMAINS[domain]?.requiresProject
                  ? 'Отчёты и история группируются по коду проекта'
                  : `${DOMAINS[domain]?.meetingTypes.length ?? 0} ${DOMAINS[domain]?.meetingTypes.length === 1 ? 'тип совещания' : 'типов совещаний'} · без кода проекта`}
              </div>
            </div>
            <div className="flex-1 py-2 px-3 space-y-0.5 overflow-y-auto">
              {nav.map(item => (
                <div key={item.key}>
                  {item.section && <div className="pt-4 pb-2 px-2"><div className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-wider">{item.section}</div></div>}
                  <button onClick={() => setScreen(item.key)} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left cursor-pointer border-none transition-colors text-[0.8rem] ${screen === item.key ? 'bg-[#E52713]/10 text-[#E52713] font-semibold' : 'bg-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-800'}`}>
                    <span className="text-[0.85rem]">{item.emoji}</span><span>{item.label}</span>
                  </button>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-slate-200">
              <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50">
                <div className="w-8 h-8 rounded-full bg-[#E52713]/10 flex items-center justify-center text-[0.65rem] text-[#E52713] font-bold">AD</div>
                <div className="flex-1 min-w-0"><div className="text-[0.75rem] font-semibold text-slate-700 truncate">Администратор</div><div className="text-[0.6rem] text-slate-400">admin@company.ru</div></div>
              </div>
            </div>
          </div>
          {/* Content */}
          <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
            <div className="h-14 flex items-center justify-between px-6 bg-white border-b border-slate-200 shrink-0">
              <h2 className="text-[0.95rem] font-bold text-slate-800 m-0">{titles[screen]}</h2>
              <div className="flex items-center gap-3">
                <span className="text-[0.72rem] text-slate-400">{DOMAINS[domain]?.emoji} {DOMAINS[domain]?.short}</span>
                <span className="text-[0.72rem] text-slate-400">{new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' }).replace(' г.', '')}</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {screen === 'pipeline' && <PgPipeline domain={domain} onOpenResults={() => setScreen('results')} />}
              {screen === 'history' && <PgHistory />}
              {screen === 'results' && <PgResults />}
              {screen === 'dashboard' && <PgDashboard domain={domain} />}
              {screen === 'admin' && <PgAdmin />}
            </div>
          </div>
        </div>
      </div>
    </div>, document.body)
}

/* ── Helpers ── */
function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button onClick={onClick} className={`px-3 py-1.5 rounded-lg text-[0.75rem] font-medium cursor-pointer border transition-colors ${active ? 'bg-[#E52713]/10 text-[#E52713] border-[#E52713]/20' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}>{children}</button>
}
function StatCard({ label, val, sub, color }: { label: string; val: string; sub: string; color: string }) {
  return <div className="bg-white rounded-xl p-4 border border-slate-200" style={{ borderLeftWidth: 3, borderLeftColor: color }}><span className="text-[0.65rem] text-slate-400 uppercase font-bold tracking-wider">{label}</span><div className="text-2xl font-extrabold text-slate-800 mt-1">{val}</div><div className="text-[0.7rem] text-slate-400 mt-0.5">{sub}</div></div>
}

/* ===== PIPELINE (configure → run → done) ===== */
const pipelineStages = [
  { emoji: '🔄', name: 'Инициализация', desc: 'Подготовка задачи', weight: 3 },
  { emoji: '🎵', name: 'Извлечение аудио', desc: 'FFmpeg конвертация', weight: 7 },
  { emoji: '🎙️', name: 'Определение голоса', desc: 'Silero VAD', weight: 10 },
  { emoji: '📝', name: 'Транскрибация', desc: 'WhisperX large-v3', weight: 25 },
  { emoji: '👥', name: 'Идентификация спикеров', desc: 'pyannote 3.1', weight: 18 },
  { emoji: '🌍', name: 'Перевод', desc: 'LLM multi-language', weight: 12 },
  { emoji: '😊', name: 'Анализ эмоций', desc: 'wav2vec2-emotion', weight: 10 },
  { emoji: '📊', name: 'Генерация отчётов', desc: 'LLM structured output', weight: 10 },
  { emoji: '📄', name: 'Создание документов', desc: 'DOCX + XLSX + JSON', weight: 5 },
]

function StepHead({ n, title, extra }: { n: number; title: string; extra?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 mb-1.5">
      <div className="w-4 h-4 rounded-full bg-[#E52713] text-white text-[0.55rem] font-bold flex items-center justify-center shrink-0">{n}</div>
      <span className="text-[0.72rem] font-semibold text-slate-700">{title}</span>
      {extra && <div className="ml-auto">{extra}</div>}
    </div>
  )
}

function PgPipeline({ domain, onOpenResults }: { domain: string; onOpenResults: () => void }) {
  const [mode, setMode] = useState<'configure' | 'running' | 'done'>('configure')
  const [progress, setProgress] = useState(0)
  const [stageIdx, setStageIdx] = useState(0)
  const [meetingType, setMeetingType] = useState(() => DOMAINS[domain]?.meetingTypes[0]?.id ?? '')

  // Reset meeting type if domain changes and current type doesn't belong to new domain
  useEffect(() => {
    const types = DOMAINS[domain]?.meetingTypes ?? []
    if (!types.find(t => t.id === meetingType)) {
      setMeetingType(types[0]?.id ?? '')
    }
  }, [domain, meetingType])

  useEffect(() => {
    if (mode !== 'running') return
    const id = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(id); setMode('done'); return 100 }
        const next = p + 0.4
        let acc = 0
        for (let i = 0; i < pipelineStages.length; i++) {
          acc += pipelineStages[i].weight
          if (next < acc) { setStageIdx(i); break }
          if (i === pipelineStages.length - 1) setStageIdx(i)
        }
        return next
      })
    }, 50)
    return () => clearInterval(id)
  }, [mode])

  const handleRun = () => { setProgress(0); setStageIdx(0); setMode('running') }
  const handleReset = () => { setMode('configure'); setProgress(0); setStageIdx(0) }

  return (
    <div className="p-4 max-w-[860px] mx-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {mode === 'configure'
          ? <PipelineConfigure domain={domain} meetingType={meetingType} onMeetingTypeChange={setMeetingType} onRun={handleRun} />
          : <PipelineRun progress={progress} stageIdx={stageIdx} done={mode === 'done'} onOpenResults={onOpenResults} onReset={handleReset} />}
      </div>
    </div>
  )
}

function PipelineConfigure({ domain, meetingType, onMeetingTypeChange, onRun }: { domain: string; meetingType: string; onMeetingTypeChange: (t: string) => void; onRun: () => void }) {
  const d = DOMAINS[domain]
  return (
    <div className="p-4">
      {/* Row 1: step 1 (project code OR meeting type) + step 2 (participants OR auto-detection note) */}
      <div className="grid grid-cols-5 gap-3 mb-3">
        <div className="col-span-2">
          {d.requiresProject ? (
            <>
              <StepHead n={1} title="Проект и дата" />
              <div className="flex items-center gap-2">
                <div className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[0.82rem] text-slate-800 font-mono w-[64px] text-center">1234</div>
                <div className="flex items-center gap-1 shrink-0"><span className="w-1.5 h-1.5 rounded-full bg-green-500"/><span className="text-[0.7rem] text-green-600 font-medium whitespace-nowrap">Объект-A</span></div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[0.72rem] text-slate-700 ml-auto whitespace-nowrap">17.02.2026</div>
              </div>
            </>
          ) : (
            <>
              <StepHead n={1} title="Тип встречи и дата" />
              <div className="flex items-center gap-2">
                <select value={meetingType} onChange={e => onMeetingTypeChange(e.target.value)} className="flex-1 min-w-0 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-[0.72rem] text-slate-700 cursor-pointer">
                  {d.meetingTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <div className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[0.72rem] text-slate-700 whitespace-nowrap shrink-0">17.02.2026</div>
              </div>
            </>
          )}
        </div>
        <div className="col-span-3">
          {d.requiresProject ? (
            <>
              <StepHead n={2} title="Участники" extra={<span className="text-[0.6rem] text-slate-400">4 чел. · 4 орг.</span>} />
              <div className="flex flex-wrap gap-1">
                {[
                  { tag: 'Заказчик', p: 'Спикер 1' },
                  { tag: 'Тех. заказчик', p: 'Спикер 2 (РП)' },
                  { tag: 'Генподрядчик', p: 'Спикер 3' },
                  { tag: 'Проектировщик', p: 'Спикер 4' },
                ].map((x, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-50 border border-slate-200 rounded text-[0.65rem]">
                    <span className="text-slate-400">{x.tag}</span><span className="text-slate-700">{x.p}</span>
                  </span>
                ))}
              </div>
            </>
          ) : (
            <>
              <StepHead n={2} title="Спикеры" extra={<span className="text-[0.6rem] text-slate-400">auto</span>} />
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
                <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                <span className="text-[0.7rem] text-slate-600">Определяются автоматически</span>
                <span className="text-[0.58rem] text-slate-400 ml-auto">диаризация · речевой профиль</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Row 2: File chip (one line) */}
      <div className="mb-3">
        <StepHead n={3} title="Файл" />
        <div className="border-2 border-dashed border-[#E52713]/30 bg-[#E52713]/5 rounded-xl px-3 py-2 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#E52713]/10 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-[#E52713]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[0.78rem] font-medium text-slate-700 truncate">production_meeting_17_02.mp4</div>
            <div className="text-[0.65rem] text-slate-400">MP4 · 1:23:45 · 847 МБ</div>
          </div>
          <button className="text-[0.68rem] text-[#E52713] font-medium px-2 py-1 rounded hover:bg-[#E52713]/10 cursor-pointer border-none bg-transparent">Заменить</button>
        </div>
      </div>

      {/* Row 3: Languages + Artifacts */}
      <div className="grid grid-cols-5 gap-3 mb-3">
        <div className="col-span-2">
          <StepHead n={4} title="Языки" />
          <div className="flex gap-1 flex-wrap">
            {[{ l: 'Русский', on: true }, { l: 'English', on: false }, { l: '中文', on: false }, { l: 'العربية', on: false }, { l: 'Türkçe', on: false }].map(lang => (
              <button key={lang.l} className={`px-2 py-1 rounded-md text-[0.66rem] font-medium border cursor-pointer transition-colors ${lang.on ? 'bg-[#E52713]/10 text-[#E52713] border-[#E52713]/20' : 'bg-white text-slate-400 border-slate-200'}`}>{lang.l}</button>
            ))}
          </div>
        </div>
        <div className="col-span-3">
          {(() => {
            const artifacts = [
              { name: 'Excel-отчёт', desc: 'Задачи, сроки', on: true, color: '#10B981', show: true },
              { name: 'Word-протокол', desc: 'Резюме, темы', on: true, color: '#3B82F6', show: true },
              { name: 'Транскрипция', desc: 'Текст + таймкоды', on: true, color: '#8B5CF6', show: true },
              { name: 'Risk Brief', desc: 'Только «Стройка»', on: d.hasRiskBrief, color: '#E52713', show: d.hasRiskBrief },
            ].filter(a => a.show)
            return (
              <>
                <StepHead n={5} title="Артефакты" extra={<span className="text-[0.6rem] text-slate-400">{artifacts.filter(a => a.on).length} из {artifacts.length}</span>} />
                <div className="grid grid-cols-2 gap-1.5">
                  {artifacts.map(a => (
                    <div key={a.name} className={`flex items-center gap-2 px-2 py-1 rounded-lg border transition-colors ${a.on ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50 opacity-50'}`}>
                      <div className="w-6 h-3 rounded-full relative shrink-0" style={a.on ? { background: a.color } : { background: '#CBD5E1' }}>
                        <div className={`absolute top-[1px] w-2.5 h-2.5 rounded-full bg-white shadow transition-all ${a.on ? 'left-[13px]' : 'left-[1px]'}`}/>
                      </div>
                      <div className="min-w-0"><div className="text-[0.68rem] font-medium text-slate-800 truncate">{a.name}</div><div className="text-[0.58rem] text-slate-400 truncate">{a.desc}</div></div>
                    </div>
                  ))}
                </div>
              </>
            )
          })()}
        </div>
      </div>

      {/* Row 4: Email */}
      <div className="mb-4">
        <StepHead n={6} title="Уведомления" />
        <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 flex items-center gap-2.5">
          <div className="w-7 h-4 rounded-full relative bg-[#E52713] shrink-0"><div className="absolute top-0.5 left-[14px] w-3 h-3 rounded-full bg-white shadow"/></div>
          <span className="text-[0.72rem] font-medium text-slate-700">Email по завершении</span>
          <span className="text-[0.68rem] text-slate-400 ml-auto font-mono truncate">admin@company.ru</span>
        </div>
      </div>

      <button onClick={onRun} className="w-full py-2.5 bg-[#E52713] text-white rounded-xl text-[0.82rem] font-semibold border-none cursor-pointer hover:bg-[#E52713]/90 transition-colors flex items-center justify-center gap-2 animate-guide-pulse">
        <span>⚡</span> Обработать
      </button>
    </div>
  )
}

function PipelineRun({ progress, stageIdx, done, onOpenResults, onReset }: { progress: number; stageIdx: number; done: boolean; onOpenResults: () => void; onReset: () => void }) {
  return (
    <div className="p-4">
      {/* File chip + status */}
      <div className="flex items-center gap-3 mb-3 pb-3 border-b border-slate-100">
        <div className="w-9 h-9 rounded-xl bg-[#E52713]/10 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-[#E52713]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[0.8rem] font-semibold text-slate-800 truncate">production_meeting_17_02.mp4</div>
          <div className="text-[0.62rem] text-slate-400 truncate">Объект-A (1234) · 17.02.2026 · WhisperX + pyannote + wav2vec2 + LLM</div>
        </div>
        <span className={`px-2 py-0.5 rounded text-[0.62rem] font-bold shrink-0 ${done ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>{done ? 'Завершено' : 'Обработка...'}</span>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[0.72rem] font-medium text-slate-700">{done ? '✅ Готово' : `${pipelineStages[stageIdx].emoji} ${pipelineStages[stageIdx].name}`}</span>
          <span className="text-[0.72rem] font-bold text-[#E52713]">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#E52713] to-[#ff6b5a] rounded-full transition-all duration-100" style={{ width: `${progress}%` }} />
        </div>
        {!done && <div className="text-[0.6rem] text-slate-400 mt-0.5">{pipelineStages[stageIdx].desc}</div>}
      </div>

      {/* Stages list */}
      <div className="space-y-0.5 font-mono">
        {pipelineStages.map((s, i) => {
          const completed = progress >= pipelineStages.slice(0, i + 1).reduce((a, b) => a + b.weight, 0)
          const active = stageIdx === i && !done
          return (
            <div key={s.name} className={`flex items-center gap-2 px-2.5 py-1 rounded-lg transition-colors ${active ? 'bg-[#E52713]/5 border border-[#E52713]/10 terminal-glow' : 'border border-transparent'}`}>
              <span className="text-[0.78rem] w-5 text-center">{completed || done ? '✅' : active ? s.emoji : '⬜'}</span>
              <span className={`text-[0.68rem] ${completed || done ? 'text-slate-400 line-through' : active ? 'text-slate-800 font-medium' : 'text-slate-400'}`}>{s.name}</span>
              <span className="text-[0.56rem] text-slate-400 truncate">{s.desc}</span>
              {active && <span className="text-[0.5rem] text-[#E52713] font-medium animate-pulse tracking-wider uppercase ml-auto">Выполняется...</span>}
              <span className={`text-[0.5rem] text-slate-300 w-7 text-right ${active ? '' : 'ml-auto'}`}>{s.weight}%</span>
            </div>
          )
        })}
      </div>

      {done && (
        <>
          {/* Hero: honest time saving with validation caveat */}
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="rounded-xl bg-gradient-to-r from-green-50 to-emerald-50/40 border border-green-200 px-3.5 py-2 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-green-500/15 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[0.76rem] text-slate-700 leading-snug">
                  <span className="font-bold text-slate-800">≈3 часа</span> ручной подготовки
                  <span className="text-slate-400"> →</span>
                  <span className="font-bold text-green-700"> ≈1 час</span> валидации готового протокола
                </div>
                <div className="text-[0.62rem] text-slate-500 mt-0.5">Администратор проверяет текст, а не расшифровывает запись</div>
              </div>
            </div>
          </div>

          {/* Outcome tiles — что извлечено */}
          <div className="grid grid-cols-3 gap-2 mt-2">
            {[
              { v: '11', l: 'поручений', s: 'ответственные · сроки', color: '#3B82F6' },
              { v: '5', l: 'рисков', s: 'драйверы · гипотезы', color: '#E52713' },
              { v: '6', l: 'артефактов', s: 'DOCX · XLSX · PDF · JSON', color: '#8B5CF6' },
            ].map(m => (
              <div key={m.l} className="bg-white border border-slate-200 rounded-xl px-3 py-2">
                <div className="text-[1.1rem] font-extrabold leading-none mb-1" style={{ color: m.color }}>{m.v}</div>
                <div className="text-[0.68rem] text-slate-700 font-semibold">{m.l}</div>
                <div className="text-[0.56rem] text-slate-400 truncate">{m.s}</div>
              </div>
            ))}
          </div>

          {/* Strategic value — что кроме быстрее */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="flex items-start gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <div className="w-7 h-7 rounded-lg bg-slate-200/70 flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
                </svg>
              </div>
              <div className="min-w-0">
                <div className="text-[0.7rem] font-semibold text-slate-800">История и архив</div>
                <div className="text-[0.6rem] text-slate-500 leading-snug">Все записи, транскрипты и артефакты — в единой базе. Поиск, аудит, сравнение по проекту.</div>
              </div>
            </div>
            <div className="flex items-start gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <div className="w-7 h-7 rounded-lg bg-slate-200/70 flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 00-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0a3 3 0 11-6 0"/>
                </svg>
              </div>
              <div className="min-w-0">
                <div className="text-[0.7rem] font-semibold text-slate-800">Осведомлённость руководителя</div>
                <div className="text-[0.6rem] text-slate-500 leading-snug">Критический риск — уведомление в тот же день, а не «всплыл через неделю».</div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-3">
            <button onClick={onOpenResults} className="flex-1 py-2.5 bg-[#E52713] text-white rounded-xl text-[0.82rem] font-semibold border-none cursor-pointer hover:bg-[#E52713]/90 transition-colors flex items-center justify-center gap-2">
              <span>📄</span> Открыть результаты
            </button>
            <button onClick={onReset} className="px-4 py-2.5 bg-white border border-slate-300 text-slate-600 rounded-xl text-[0.76rem] font-medium cursor-pointer hover:bg-slate-50 transition-colors">
              Новая обработка
            </button>
          </div>
        </>
      )}
    </div>
  )
}

/* ===== HISTORY ===== */
function PgHistory() {
  const jobs = [
    { id: 'j-847', file: 'production_meeting_17_02.mp4', project: 'Объект-A · 1234', date: '17.02.2026', status: 'done', duration: '4:12', artifacts: 4 },
    { id: 'j-846', file: 'weekly_sync_14_02.mp3', project: 'Объект-A · 1234', date: '14.02.2026', status: 'done', duration: '2:38', artifacts: 3 },
    { id: 'j-845', file: 'site_inspection.mp3', project: 'Объект-C · 3045', date: '13.02.2026', status: 'done', duration: '1:55', artifacts: 4 },
    { id: 'j-844', file: 'budget_review.mp4', project: 'Объект-B · 2001', date: '12.02.2026', status: 'error', duration: '--', artifacts: 0 },
    { id: 'j-843', file: 'fta_audit_review.mp3', project: 'Объект-D · 4102', date: '12.02.2026', status: 'done', duration: '3:10', artifacts: 2 },
    { id: 'j-842', file: 'contractor_meeting.mp4', project: 'Объект-A · 1234', date: '10.02.2026', status: 'done', duration: '5:22', artifacts: 4 },
  ]
  const stColor: Record<string, string> = { done: 'bg-green-100 text-green-600', error: 'bg-red-100 text-red-600', processing: 'bg-amber-100 text-amber-600' }
  const stLabel: Record<string, string> = { done: 'Готово', error: 'Ошибка', processing: 'Обработка' }
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-[0.78rem] text-slate-400">Поиск по имени файла или проекту...</div>
        <select className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-[0.72rem] text-slate-600 cursor-pointer">
          <option>Все статусы</option><option>Готово</option><option>Ошибка</option>
        </select>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead><tr className="text-[0.65rem] text-slate-400 uppercase tracking-wider bg-slate-50">
            <th className="text-left px-4 py-2.5 font-semibold">ID</th>
            <th className="text-left px-4 py-2.5 font-semibold">Файл</th>
            <th className="text-left px-4 py-2.5 font-semibold">Проект</th>
            <th className="text-left px-4 py-2.5 font-semibold">Дата</th>
            <th className="text-center px-4 py-2.5 font-semibold">Статус</th>
            <th className="text-left px-4 py-2.5 font-semibold">Время</th>
            <th className="text-center px-4 py-2.5 font-semibold">Артефакты</th>
          </tr></thead>
          <tbody>{jobs.map((j, i) => (
            <tr key={j.id} className={`border-t border-slate-100 text-[0.75rem] hover:bg-slate-50/50 cursor-pointer ${i % 2 ? 'bg-slate-50/30' : ''}`}>
              <td className="px-4 py-2.5 font-mono text-slate-400">{j.id}</td>
              <td className="px-4 py-2.5 text-slate-700 font-medium">{j.file}</td>
              <td className="px-4 py-2.5 text-slate-500">{j.project}</td>
              <td className="px-4 py-2.5 text-slate-500 font-mono">{j.date}</td>
              <td className="px-4 py-2.5 text-center"><span className={`px-2 py-0.5 rounded text-[0.65rem] font-bold ${stColor[j.status]}`}>{stLabel[j.status]}</span></td>
              <td className="px-4 py-2.5 text-slate-400 font-mono">{j.duration}</td>
              <td className="px-4 py-2.5 text-center">{j.artifacts > 0 ? <span className="text-[0.65rem] text-slate-500">{j.artifacts} файлов</span> : <span className="text-[0.65rem] text-slate-300">—</span>}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <div className="flex items-center justify-between mt-4">
        <span className="text-[0.72rem] text-slate-400">Показано 6 из 347</span>
        <div className="flex gap-1">
          {[1, 2, 3, '...', 58].map((p, i) => (
            <button key={i} className={`w-7 h-7 rounded text-[0.7rem] font-medium border-none cursor-pointer transition-colors ${p === 1 ? 'bg-[#E52713] text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>{p}</button>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ===== RESULTS ===== */
function PgResults() {
  const [tab, setTab] = useState<'brief' | 'protocol' | 'tasks' | 'transcript'>('brief')
  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <TabBtn active={tab === 'brief'} onClick={() => setTab('brief')}>Risk Brief</TabBtn>
        <TabBtn active={tab === 'protocol'} onClick={() => setTab('protocol')}>Протокол</TabBtn>
        <TabBtn active={tab === 'tasks'} onClick={() => setTab('tasks')}>Задачи (Excel)</TabBtn>
        <TabBtn active={tab === 'transcript'} onClick={() => setTab('transcript')}>Транскрипция</TabBtn>
        <div className="ml-auto">
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E52713] text-white rounded-lg text-[0.72rem] font-medium cursor-pointer border-none hover:bg-[#E52713]/90 transition-colors"><I.Download /> Скачать все (ZIP)</button>
        </div>
      </div>
      {tab === 'brief' && <RiskBrief />}
      {tab === 'protocol' && <Protocol />}
      {tab === 'tasks' && <Tasks />}
      {tab === 'transcript' && <Transcript />}
    </div>
  )
}

/* ── Risk Brief (8 blocks) ── */
function RiskBrief() {
  const risks: { id: string; title: string; cat: string; score: number; prob: number; impact: number; desc: string; evidence: string; decision: string; responsible: string; deadline: string; drivers: { type: string; text: string }[]; hypothesis: string; recommendation?: string }[] = [
    { id: 'R1', title: 'Проектирование углового элемента блокирует производство панелей для склада', cat: 'Проектные', score: 25, prob: 5, impact: 5, desc: 'Незначительный 20-килограммовый угловой элемент для наружных стен склада находится в стадии проектирования более недели, что блокирует запуск производства всего объёма сэндвич-панелей для здания. Непропорциональная задержка из-за тривиальной детали блокирует основной поток работ.', evidence: '«Уголок тормозит изготовление большого завода. Уголок. 20 килограмм.» [25:00]', decision: 'Обеспечить согласование в день совещания. Вопрос помечен как требующий особого контроля.', responsible: 'Проектировщик', deadline: '17.02.2026', drivers: [{ type: 'root_cause', text: 'Системная неэффективность: согласование тривиального элемента занимает более недели' }, { type: 'blocker', text: 'Завод-изготовитель отказывается начинать без формального согласования' }], hypothesis: 'Срыв сроков поставки и монтажа наружных стен, задержка закрытия теплового контура. Каждый день задержки = смещение графика монтажа на 2-3 дня.', recommendation: 'Ввести регламент ускоренного согласования для элементов, блокирующих критический путь (SLA ≤ 2 рабочих дня).' },
    { id: 'R2', title: 'График проверок надзорного органа не соответствует модульному методу строительства', cat: 'Внешние', score: 16, prob: 4, impact: 4, desc: 'Официальный график предполагает визиты инспекции в апреле, однако по закону инспекторы приезжают только на финальную проверку. Это несовместимо с модульным подходом, при котором здания будут закрыты задолго до 100% завершения всех конструкций на площадке.', evidence: '«По закону они приезжают на финальную проверку. Не промежуточную, а именно финальную.» [27:02]', decision: 'Техническому заказчику уточнить у надзорного органа планы по визитам.', responsible: 'Тех. заказчик', deadline: '24.02.2026', drivers: [{ type: 'root_cause', text: 'Стандартный процесс инспекции не учитывает модульный характер проекта' }, { type: 'blocker', text: 'Отсутствие чёткой информации от надзорного органа о графике визитов' }], hypothesis: 'Риск невозможности провести приёмку скрытых работ. Возможны предписания, штрафы или необходимость вскрытия готовых конструкций при финальной проверке.' },
    { id: 'R3', title: 'Разработка раскладки стен корпуса заблокирована отсутствием исходных данных', cat: 'Проектные', score: 12, prob: 4, impact: 3, desc: 'Проектирование раскладки сэндвич-панелей не может быть продолжено, так как исполнитель ожидает исходные данные по металлоконструкциям от проектировщика. Строго последовательный процесс создаёт цепочку зависимостей вместо параллельной работы.', evidence: '«По раскладке — ждём данные по МК. Без них раскладку не сделать, подрядчик стоит.» [32:15]', decision: 'Зафиксирован срок предоставления данных от проектировщика — 24.02.2026.', responsible: 'Проектировщик', deadline: '24.02.2026', drivers: [{ type: 'root_cause', text: 'Строго последовательный процесс: раскладка панелей не начинается до завершения проектирования МК' }], hypothesis: 'При задержке выдачи данных более 3 дней — смещение критического пути по монтажу панелей на 1.5-2 недели.' },
    { id: 'R5', title: 'Закупка муфт для кабеля 20кВ заблокирована несогласованным типом кабеля', cat: 'Строительные', score: 9, prob: 3, impact: 3, desc: 'Поставщик кабельных муфт согласован, однако закупка не может быть произведена — не принято окончательное решение по типу самого кабеля. Эта зависимость останавливает процесс закупки сопутствующих материалов.', evidence: '«Муфты готовы заказать, но без решения по кабелю — смысла нет, не те муфты возьмём.» [48:30]', decision: 'Отложить закупку муфт до момента согласования типа кабеля. Вопрос на контроле.', responsible: 'Генподрядчик', deadline: '28.02.2026', drivers: [{ type: 'root_cause', text: 'Решение по типу кабеля зависит от одного сотрудника, который не определился' }, { type: 'aggravator', text: 'Длительный срок поставки муфт (4-6 недель) усугубляет последствия задержки' }], hypothesis: 'Каждая неделя задержки решения по кабелю = неделя задержки пусконаладочных работ электроснабжения.' },
    { id: 'R8', title: 'Неполный комплект исполнительной документации к сдаче', cat: 'Управленческие', score: 4, prob: 2, impact: 2, desc: 'Подрядчик не может предоставить полный комплект исполнительной документации к установленному сроку, в частности отсутствуют исполнительные схемы по металлоконструкциям.', evidence: '«ИД будет выложена кроме схем. По схемам — будет гарантийное письмо.» [01:35]', decision: 'Подрядчик предоставит гарантийное письмо с точным сроком подготовки схем (до конца февраля). Остальная ИД загружается до 23.02.', responsible: 'Генподрядчик', deadline: '23.02.2026', drivers: [{ type: 'root_cause', text: 'Исполнительные схемы требуют геодезических замеров, которые не были выполнены вовремя' }], hypothesis: 'Отсутствие ИД не блокирует текущие работы, но может стать проблемой при итоговой приёмке объекта.' },
  ]
  const scoreColor = (s: number) => s >= 16 ? '#EF4444' : s >= 9 ? '#F59E0B' : s >= 4 ? '#FBBF24' : '#10B981'
  const driverIcon: Record<string, string> = { root_cause: '🔴', aggravator: '🟡', blocker: '⛔' }
  const driverLabel: Record<string, string> = { root_cause: 'Первопричина', aggravator: 'Усилитель', blocker: 'Блокер' }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Block 1: Header */}
      <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#E52713] flex items-center justify-center text-[0.65rem] font-bold">AP</div>
          <div><div className="text-[0.85rem] font-bold">RISK BRIEF</div><div className="text-[0.7rem] text-slate-400">Проект Объект-A (1234) · Строительство</div></div>
        </div>
        <div className="text-right">
          <div className="text-[0.7rem] text-slate-400">17.02.2026 · 1:31:09</div>
          <span className="px-2 py-0.5 rounded text-[0.65rem] font-bold bg-red-500/20 text-red-400">КРИТИЧЕСКИЙ</span>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Block 2a: Meta-strip — метрики встречи */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { v: '5', l: 'рисков', sub: 'всего выявлено', color: '#64748B' },
            { v: '2', l: 'критических', sub: 'требуют эскалации', color: '#EF4444' },
            { v: '4', l: 'открытых', sub: 'вопросов на контроле', color: '#F59E0B' },
            { v: '11', l: 'решений', sub: 'зафиксировано', color: '#10B981' },
          ].map(m => (
            <div key={m.l} className="bg-white border border-slate-200 rounded-xl px-3 py-2">
              <div className="text-[1.05rem] font-extrabold leading-none mb-1" style={{ color: m.color }}>{m.v}</div>
              <div className="text-[0.66rem] text-slate-700 font-semibold">{m.l}</div>
              <div className="text-[0.55rem] text-slate-400 truncate">{m.sub}</div>
            </div>
          ))}
        </div>

        {/* Block 2b: Participants — 12 спикеров от 4 организаций, обезличенно */}
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[0.68rem] font-bold text-slate-500 uppercase tracking-wider">Участники совещания</div>
            <div className="text-[0.62rem] text-slate-400">12 спикеров · 4 организации · определены автоматически (диаризация + речевой профиль)</div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[
              { org: 'Заказчик', count: 3, persons: ['Спикер 1', 'Спикер 2', 'Спикер 3'] },
              { org: 'Тех. заказчик', count: 3, persons: ['Спикер 4 (РП)', 'Спикер 5 (ГИП)', 'Спикер 6 (АП)'] },
              { org: 'Генподрядчик', count: 3, persons: ['Спикер 7', 'Спикер 8', 'Спикер 9'] },
              { org: 'Проектировщик', count: 3, persons: ['Спикер 10 (ГАП)', 'Спикер 11', 'Спикер 12'] },
            ].map(g => (
              <div key={g.org} className="bg-white border border-slate-200 rounded-lg p-2.5">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="text-[0.65rem] font-bold text-slate-600 uppercase">{g.org}</div>
                  <span className="text-[0.58rem] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded font-semibold">{g.count}</span>
                </div>
                <div className="space-y-0.5">
                  {g.persons.map(p => (
                    <div key={p} className="text-[0.68rem] text-slate-600 flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-slate-300"/>
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Block 3: Executive Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border-l-4 border-[#E52713] bg-slate-50 p-4">
            <div className="text-[0.68rem] font-bold text-slate-500 uppercase tracking-wider mb-2">Резюме</div>
            <div className="text-[0.78rem] text-slate-700 leading-relaxed">Совещание выявило несколько критических рисков, блокирующих ключевые этапы работ. Основная проблема — системные задержки в проектировании: незначительный элемент блокирует производство панелей для целого здания, а разработка раскладок заблокирована из-за отсутствия исходных данных. Зафиксированы задержки поставок и блокировка закупок из-за внутренних зависимостей.</div>
          </div>
          {/* Block 4: Atmosphere */}
          <div className="rounded-xl border-l-4 border-amber-400 bg-slate-50 p-4">
            <div className="text-[0.68rem] font-bold text-slate-500 uppercase tracking-wider mb-2">Атмосфера</div>
            <div className="flex items-center gap-2 mb-2"><span className="px-2 py-0.5 bg-amber-100 text-amber-600 rounded text-[0.68rem] font-bold">Рабочее напряжение</span></div>
            <div className="text-[0.75rem] text-slate-600">Деловая атмосфера с фокусом на решении операционных вопросов. Модератор оказывает давление для получения конкретных сроков и обязательств, особенно по затянувшимся вопросам проектирования.</div>
            <div className="flex gap-3 mt-2">
              {[{ e: '😐', l: 'Нейтр.', v: 54 }, { e: '😤', l: 'Давл.', v: 24 }, { e: '😟', l: 'Тревога', v: 14 }, { e: '😊', l: 'Позит.', v: 8 }].map(em => (
                <div key={em.l} className="text-center">
                  <div className="text-[0.9rem]">{em.e}</div>
                  <div className="text-[0.55rem] text-slate-400">{em.l} {em.v}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Block 5: Risk Matrix 5x5 */}
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="text-[0.68rem] font-bold text-slate-500 uppercase tracking-wider mb-3">Матрица рисков 5×5</div>
          <div className="flex items-end gap-6">
            <div>
              <div className="text-[0.55rem] text-slate-400 mb-1 text-center">Вероятность ↑</div>
              <div className="grid grid-cols-5 gap-px bg-slate-200 rounded overflow-hidden" style={{ width: 160, height: 160 }}>
                {Array.from({ length: 25 }, (_, i) => {
                  const row = Math.floor(i / 5)
                  const col = i % 5
                  const prob = 5 - row
                  const imp = col + 1
                  const val = prob * imp
                  const bg = val >= 16 ? '#FEE2E2' : val >= 9 ? '#FEF3C7' : val >= 4 ? '#ECFDF5' : '#F0FDF4'
                  const hasRisk = risks.find(r => r.prob === prob && r.impact === imp)
                  return <div key={i} className="flex items-center justify-center text-[0.5rem] font-bold" style={{ background: bg, width: 32, height: 32, color: hasRisk ? scoreColor(val) : '#CBD5E1' }}>{hasRisk ? hasRisk.id : val}</div>
                })}
              </div>
              <div className="text-[0.55rem] text-slate-400 mt-1 text-center">Влияние →</div>
            </div>
            <div className="flex-1 space-y-2">
              <div className="text-[0.72rem] font-semibold text-slate-700 mb-2">Распределение</div>
              {[{ range: '16-25', label: 'Критический', color: '#EF4444', count: 2 }, { range: '9-15', label: 'Высокий', color: '#F59E0B', count: 2 }, { range: '4-8', label: 'Средний', color: '#FBBF24', count: 1 }, { range: '1-3', label: 'Низкий', color: '#10B981', count: 0 }].map(r => (
                <div key={r.range} className="flex items-center gap-2 text-[0.72rem]">
                  <span className="w-3 h-3 rounded" style={{ background: r.color }}/>
                  <span className="text-slate-600 flex-1">{r.label} ({r.range})</span>
                  <span className="font-bold text-slate-700">{r.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Block 6: Risk Cards with Drivers & Hypotheses */}
        <div className="space-y-3">
          {risks.map(r => (
            <div key={r.id} className="rounded-xl border border-slate-200 overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                <span className="w-8 h-8 rounded-lg flex items-center justify-center text-[0.7rem] font-bold text-white" style={{ background: scoreColor(r.score) }}>{r.id}</span>
                <div className="flex-1"><div className="text-[0.82rem] font-semibold text-slate-800">{r.title}</div></div>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[0.65rem]">{r.cat}</span>
                <span className="text-[0.65rem] text-slate-400">P:{r.prob} I:{r.impact}</span>
                <span className="text-[0.7rem] font-bold" style={{ color: scoreColor(r.score) }}>Score: {r.score}</span>
              </div>
              <div className="px-4 py-3 space-y-2.5">
                <div className="text-[0.78rem] text-slate-600">{r.desc}</div>
                <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 text-[0.72rem] text-amber-800 italic">{r.evidence}</div>
                {/* Drivers */}
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-wider mb-2">Драйверы риска</div>
                  <div className="space-y-1.5">
                    {r.drivers.map((d, di) => (
                      <div key={di} className="flex items-start gap-2 text-[0.72rem]">
                        <span>{driverIcon[d.type]}</span>
                        <span className="px-1.5 py-0.5 bg-slate-200 text-slate-500 rounded text-[0.6rem] font-medium shrink-0">{driverLabel[d.type]}</span>
                        <span className="text-slate-600">{d.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Hypothesis */}
                <div className="bg-purple-50 border border-purple-100 rounded-lg px-3 py-2">
                  <div className="text-[0.65rem] font-bold text-purple-600 uppercase tracking-wider mb-0.5">Гипотеза AI</div>
                  <div className="text-[0.75rem] text-purple-800">{r.hypothesis}</div>
                </div>
                {r.decision && (
                  <div className="bg-green-50 border border-green-100 rounded-lg px-3 py-2">
                    <div className="text-[0.65rem] font-bold text-green-600 uppercase tracking-wider mb-0.5">Решение</div>
                    <div className="text-[0.75rem] text-green-800">{r.decision}</div>
                  </div>
                )}
                {r.recommendation && (
                  <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                    <div className="text-[0.65rem] font-bold text-blue-600 uppercase tracking-wider mb-0.5">Рекомендация AI</div>
                    <div className="text-[0.75rem] text-blue-800">{r.recommendation}</div>
                  </div>
                )}
                <div className="flex items-center gap-4 text-[0.7rem] text-slate-500 pt-1">
                  <span>Ответственный: <strong className="text-slate-700">{r.responsible}</strong></span>
                  <span>Срок: <strong className="text-slate-700">{r.deadline}</strong></span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Block 7: Open Questions */}
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="text-[0.68rem] font-bold text-slate-500 uppercase tracking-wider mb-3">Открытые вопросы</div>
          <div className="space-y-2">
            {[
              { q: 'Статус и участники тендера на витражи не раскрываются', cat: 'Закупки' },
              { q: 'Решение по выбору поставщика кабеля 20кВ не принято', cat: 'Электрика' },
              { q: 'Статус внутреннего тендера по кабельным системам 0.4кВ не определён', cat: 'Электрика' },
              { q: 'Наличие узла примыкания витражей к фальшполу не подтверждено', cat: 'Проектирование' },
            ].map((c, i) => (
              <div key={i} className="flex items-start gap-2 text-[0.75rem]">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"/>
                <div><span className="text-slate-600">{c.q}</span><span className="ml-2 px-1.5 py-0.5 bg-amber-100 text-amber-600 rounded text-[0.6rem]">{c.cat}</span></div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

/* ── Protocol ── */
function Protocol() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="text-center mb-6">
        <div className="text-lg font-bold text-slate-800 mb-1">ПРОТОКОЛ СОВЕЩАНИЯ</div>
        <div className="text-[0.78rem] text-slate-400">Проект Объект-A (1234) / 17.02.2026 / Домен: Строительство</div>
      </div>
      <div className="bg-slate-50 rounded-xl p-4 mb-5">
        <div className="grid grid-cols-2 gap-2 text-[0.75rem]">
          <div><span className="text-slate-400">Файл:</span> <span className="text-slate-700">production_meeting_17_02.mp4</span></div>
          <div><span className="text-slate-400">Длительность:</span> <span className="text-slate-700">1:23:45</span></div>
          <div><span className="text-slate-400">Дата:</span> <span className="text-slate-700">17.02.2026</span></div>
          <div><span className="text-slate-400">Участников:</span> <span className="text-slate-700">5 спикеров</span></div>
        </div>
      </div>
      <div className="mb-5">
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
          <div className="flex items-center gap-2 pr-3 border-r border-slate-200">
            <span className="text-[1rem] font-extrabold text-slate-800">5</span>
            <span className="text-[0.65rem] text-slate-500 leading-tight">спикеров<br/>на 1:23:45</span>
          </div>
          <div className="flex-1">
            <div className="text-[0.58rem] font-bold text-slate-500 uppercase tracking-wider mb-1">Распределение эмоций по времени</div>
            <div className="flex h-2 rounded-full overflow-hidden bg-slate-200">
              <div style={{ width: '54%', background: '#94A3B8' }} title="Нейтральная 54%"/>
              <div style={{ width: '24%', background: '#EF4444' }} title="Давление 24%"/>
              <div style={{ width: '14%', background: '#F59E0B' }} title="Тревога 14%"/>
              <div style={{ width: '8%', background: '#10B981' }} title="Позитив 8%"/>
            </div>
            <div className="flex gap-3 mt-1 text-[0.58rem] text-slate-500">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-slate-400"/>Нейтр. 54%</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500"/>Давление 24%</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"/>Тревога 14%</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500"/>Позитив 8%</span>
            </div>
          </div>
        </div>
      </div>
      <div className="mb-5">
        <div className="text-[0.82rem] font-semibold text-slate-800 mb-2">Краткое содержание</div>
        <div className="text-[0.78rem] text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-4">
          Производственное совещание по проекту. Обсуждены критические вопросы: задержка поставки металлоконструкций (перенос на 2 недели), отклонения по кладке корпуса 2 (нарушение СП 70.13330), нехватка бригад на монолитных работах. Принят ряд решений по мобилизации ресурсов и контролю качества.
        </div>
      </div>
      <div className="mb-5">
        <div className="text-[0.82rem] font-semibold text-slate-800 mb-2">Обсуждённые темы</div>
        <div className="space-y-3">
          {[
            {
              title: '1. Проектирование «уголка» для наружных стен склада',
              time: '23:12 — 26:45',
              context: 'Тривиальный угловой элемент (20 кг) блокирует запуск производства всего объёма сэндвич-панелей для здания склада. Срок согласования превышает неделю, завод-изготовитель отказывается стартовать без формального согласования.',
              discussion: 'Проектировщик: требуется дополнительный расчёт узла сопряжения. Генподрядчик: простой поставки идёт вторую неделю, критический путь блокируется. Руководитель проекта: проблема системная — регламента ускоренного согласования для блокирующих элементов нет.',
              decisions: [
                'Обеспечить согласование узла до конца рабочего дня 17.02',
                'Проектировщику выдать промежуточную схему для запуска производства при готовности',
              ],
              openQuestions: [
                'Нужен ли регламент ускоренного согласования (SLA ≤ 2 р. дн.) для элементов критического пути',
              ],
              responsible: 'Проектировщик, Генподрядчик',
            },
            {
              title: '2. График проверок надзорного органа',
              time: '27:02 — 32:10',
              context: 'Официальный график предполагает визиты инспекции в апреле, но по закону инспекторы приезжают только на финальную проверку. При модульном подходе здания закрываются задолго до 100% готовности — риск невозможности приёмки скрытых работ.',
              discussion: 'Тех. заказчик: необходимо уточнить у надзорного органа планы по визитам и согласовать промежуточные этапы. Возможны предписания, штрафы, вскрытие готовых конструкций при финальной проверке.',
              decisions: [
                'Техзаказчику направить запрос в надзорный орган о графике промежуточных визитов в срок до 24.02',
              ],
              openQuestions: [
                'Возможность согласования поэтапной приёмки скрытых работ для модульной схемы строительства',
              ],
              responsible: 'Тех. заказчик',
            },
          ].map((t, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <span className="text-[0.78rem] font-semibold text-slate-800">{t.title}</span>
                <span className="text-[0.65rem] text-slate-400 font-mono">{t.time}</span>
              </div>
              <div className="px-4 py-3 space-y-2.5">
                <div>
                  <div className="text-[0.62rem] font-bold text-slate-500 uppercase tracking-wider mb-1">Контекст</div>
                  <div className="text-[0.74rem] text-slate-600 leading-relaxed">{t.context}</div>
                </div>
                <div>
                  <div className="text-[0.62rem] font-bold text-slate-500 uppercase tracking-wider mb-1">Обсуждение</div>
                  <div className="text-[0.74rem] text-slate-600 leading-relaxed">{t.discussion}</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-green-50 border border-green-100 rounded-lg px-3 py-2">
                    <div className="text-[0.6rem] font-bold text-green-600 uppercase tracking-wider mb-1">Решения</div>
                    <ul className="space-y-1 list-disc pl-4">
                      {t.decisions.map((d, di) => <li key={di} className="text-[0.72rem] text-slate-700">{d}</li>)}
                    </ul>
                  </div>
                  <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                    <div className="text-[0.6rem] font-bold text-amber-600 uppercase tracking-wider mb-1">Нерешённые вопросы</div>
                    <ul className="space-y-1 list-disc pl-4">
                      {t.openQuestions.map((q, qi) => <li key={qi} className="text-[0.72rem] text-slate-700">{q}</li>)}
                    </ul>
                  </div>
                </div>
                <div className="text-[0.68rem] text-slate-500 pt-1"><span className="text-slate-400">Ответственные: </span><strong className="text-slate-700">{t.responsible}</strong></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="text-[0.82rem] font-semibold text-slate-800 mb-2">Экспертный анализ (AI)</div>
        <div className="text-[0.78rem] text-slate-600 leading-relaxed bg-blue-50 border border-blue-100 rounded-xl p-4 italic">
          Совещание продуктивное, но требует контроля исполнения. Основные риски сосредоточены на внешних поставках и качестве СМР. Рекомендуется провести внеочередную проверку кладки до конца недели.
        </div>
      </div>
    </div>
  )
}

/* ── Tasks ── */
function Tasks() {
  const tasks: { n: number; conf: 'Явная' | 'Из контекста'; pri: string; cat: string; task: string; resp: string; deadline: string; time: string; note?: string; source?: string }[] = [
    { n: 1, conf: 'Явная', pri: 'Высокий', cat: 'ИРД', task: 'Подготовить гарантийное письмо с точным сроком предоставления недостающих исполнительных схем', resp: 'Генподрядчик', deadline: '18.02.2026', time: '01:11', note: 'Срок подготовки схем — до конца февраля. Остальная ИД загружается параллельно.', source: 'ИД будет выложена кроме схем. По схемам — будет гарантийное письмо.' },
    { n: 2, conf: 'Явная', pri: 'Высокий', cat: 'ИРД', task: 'Выгрузить всю готовую ИД (акты, сертификаты) за исключением исполнительных схем', resp: 'Генподрядчик', deadline: '23.02.2026', time: '01:35' },
    { n: 3, conf: 'Явная', pri: 'Высокий', cat: 'Проект. и РД', task: 'Завершить согласование чертежей КМД по металлоконструкциям корпуса Б', resp: 'Проектировщик', deadline: '18.02.2026', time: '07:59' },
    { n: 5, conf: 'Явная', pri: 'Критический', cat: 'Проект. и РД', task: 'Решить вопрос с проектированием «уголка» для наружных стен склада — стоп-фактор', resp: 'Проектировщик', deadline: '17.02.2026', time: '24:11', note: 'Блокирует производство всего объёма сэндвич-панелей. Вопрос помечен как требующий особого контроля.', source: 'Уголок тормозит изготовление большого завода. Уголок. 20 килограмм.' },
    { n: 6, conf: 'Явная', pri: 'Высокий', cat: 'Проект. и РД', task: 'Предоставить данные по МК для разработки раскладки стен', resp: 'Проектировщик', deadline: '24.02.2026', time: '19:56' },
    { n: 9, conf: 'Из контекста', pri: 'Средний', cat: 'СМР', task: 'Выполнить устройство песчаного основания под фундамент и приступить к подбетонке', resp: '—', deadline: '21.02.2026', time: '04:06', note: 'Ответственный в разговоре не назван — задача выведена из контекста обсуждения.' },
    { n: 10, conf: 'Явная', pri: 'Средний', cat: 'Финансы', task: 'Завершить тендер и определить подрядчика на устройство витражей', resp: 'Тех. заказчик', deadline: '22.02.2026', time: '18:22' },
    { n: 11, conf: 'Явная', pri: 'Низкий', cat: 'Организация', task: 'К следующему совещанию подготовить данные по поставленным панелям в кв.м, а не в «машинах»', resp: 'Генподрядчик', deadline: '—', time: '12:00', note: 'Единица измерения согласована на совещании, срок формально не назван.' },
  ]
  const priColor: Record<string, string> = { 'Критический': 'bg-red-100 text-red-600', 'Высокий': 'bg-amber-100 text-amber-600', 'Средний': 'bg-blue-100 text-blue-600', 'Низкий': 'bg-slate-100 text-slate-500' }
  const confColor: Record<string, string> = { 'Явная': 'bg-slate-100 text-slate-600', 'Из контекста': 'bg-purple-100 text-purple-600' }
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-200">
        <span className="text-[0.82rem] font-semibold text-slate-700">Задачи и поручения</span>
        <div className="flex items-center gap-2">
          <span className="text-[0.7rem] text-slate-400">11 задач · 1:31:09 · лист «Задачи»</span>
          <button className="flex items-center gap-1.5 px-3 py-1 bg-green-50 border border-green-200 rounded-lg text-[0.7rem] text-green-600 font-medium cursor-pointer hover:bg-green-100 transition-colors"><I.Download /> .xlsx</button>
        </div>
      </div>
      <table className="w-full">
        <thead>
          <tr className="text-[0.58rem] text-slate-400 uppercase tracking-wider bg-slate-50/50">
            <th className="text-left px-3 py-2 font-semibold w-8">№</th>
            <th className="text-left px-2 py-2 font-semibold">Уверенность</th>
            <th className="text-left px-2 py-2 font-semibold">Приоритет</th>
            <th className="text-left px-2 py-2 font-semibold">Категория</th>
            <th className="text-left px-2 py-2 font-semibold">Задача · Примечание · Источник</th>
            <th className="text-left px-2 py-2 font-semibold">Ответственный</th>
            <th className="text-left px-2 py-2 font-semibold">Срок</th>
            <th className="text-left px-2 py-2 font-semibold">Тайм-код</th>
          </tr>
        </thead>
        <tbody>{tasks.map((t, i) => (
          <tr key={t.n} className={`border-t border-slate-100 text-[0.7rem] align-top ${i % 2 ? 'bg-slate-50/40' : ''}`}>
            <td className="px-3 py-2 text-slate-400 font-mono">{t.n}</td>
            <td className="px-2 py-2"><span className={`px-1.5 py-0.5 rounded text-[0.56rem] font-bold whitespace-nowrap ${confColor[t.conf]}`}>{t.conf}</span></td>
            <td className="px-2 py-2"><span className={`px-1.5 py-0.5 rounded text-[0.58rem] font-bold ${priColor[t.pri]}`}>{t.pri}</span></td>
            <td className="px-2 py-2 text-slate-500">{t.cat}</td>
            <td className="px-2 py-2 text-slate-700 max-w-[320px]">
              <div>{t.task}</div>
              {t.note && <div className="text-[0.6rem] text-slate-500 mt-0.5 leading-snug">{t.note}</div>}
              {t.source && <div className="text-[0.6rem] text-amber-700 mt-0.5 leading-snug italic border-l-2 border-amber-300 pl-1.5">«{t.source}»</div>}
            </td>
            <td className="px-2 py-2 text-slate-600 font-medium whitespace-nowrap">{t.resp}</td>
            <td className="px-2 py-2 text-slate-500 font-mono whitespace-nowrap">{t.deadline}</td>
            <td className="px-2 py-2 text-slate-400 font-mono">{t.time}</td>
          </tr>
        ))}</tbody>
      </table>
      <div className="flex items-center gap-2 px-5 py-2 bg-slate-50/50 border-t border-slate-100">
        <span className="text-[0.58rem] text-slate-400">Листы:</span>
        <span className="text-[0.62rem] px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-600 font-medium">Задачи</span>
        <span className="text-[0.62rem] px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-400">Метаданные</span>
        <span className="text-[0.62rem] px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-400">Участники</span>
        <span className="text-[0.58rem] text-slate-400 ml-auto">8 из 11 · сокращено для просмотра</span>
      </div>
    </div>
  )
}

/* ── Transcript ── */
function Transcript() {
  const segments = [
    { time: '00:00', speaker: 'Спикер 1', text: 'Добрый день, коллеги. Начинаем производственное совещание по проекту. Повестка у всех есть, предлагаю начать с вопроса по металлоконструкциям.', lang: 'RU', emotion: 'Нейтральная' },
    { time: '00:25', speaker: 'Спикер 2', text: 'Значит, по металлоконструкциям ситуация следующая. Нам сообщили что МК задерживаются, поставщик переносит на две недели. Я попросил их дать новые сроки в письменном виде.', lang: 'RU', emotion: 'Нейтральная' },
    { time: '01:15', speaker: 'Спикер 1', text: 'Две недели — это критично. Нам нужен альтернативный вариант. Подготовьте запрос минимум двум альтернативным поставщикам до среды.', lang: 'RU', emotion: 'Нейтральная' },
    { time: '01:42', speaker: 'Спикер 2', text: 'Понял, сделаю. Но хочу предупредить — альтернативные поставщики скорее всего дороже будут процентов на 15.', lang: 'RU', emotion: 'Раздражение' },
    { time: '02:10', speaker: 'Спикер 1', text: 'Цену обсудим, когда будут КП. Сейчас приоритет — не сорвать график. Дальше по кладке. Что по третьему этажу?', lang: 'RU', emotion: 'Нейтральная' },
    { time: '02:35', speaker: 'Спикер 3', text: 'По третьему этажу кладка уходит. При контрольном замере отклонение от вертикали 18 миллиметров на высоту этажа, при допуске 10. Надо перемерять и составлять акт.', lang: 'RU', emotion: 'Тревожная' },
  ]
  const emotionColor: Record<string, string> = { 'Нейтральная': 'bg-slate-100 text-slate-500', 'Раздражение': 'bg-red-100 text-red-500', 'Тревожная': 'bg-amber-100 text-amber-500' }
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="text-[0.82rem] font-semibold text-slate-700">Транскрипция (фрагмент)</div>
        <button className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 border border-purple-200 rounded-lg text-[0.7rem] text-purple-600 font-medium cursor-pointer hover:bg-purple-100 transition-colors"><I.Download /> .docx</button>
      </div>
      <div className="space-y-3">
        {segments.map((s, i) => (
          <div key={i} className="flex gap-3">
            <div className="text-[0.68rem] text-slate-400 font-mono w-10 shrink-0 pt-0.5">[{s.time}]</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[0.75rem] font-semibold text-slate-700">{s.speaker}</span>
                <span className="text-[0.6rem] px-1.5 py-0.5 bg-blue-100 text-blue-500 rounded font-medium">{s.lang}</span>
                <span className={`text-[0.6rem] px-1.5 py-0.5 rounded font-medium ${emotionColor[s.emotion] || emotionColor['Нейтральная']}`}>{s.emotion}</span>
              </div>
              <div className="text-[0.78rem] text-slate-600 leading-relaxed">{s.text}</div>
            </div>
          </div>
        ))}
        <div className="text-center py-3 text-[0.72rem] text-slate-400 border-t border-slate-100 mt-3">... ещё 841 сегмент ...</div>
      </div>
    </div>
  )
}

/* ===== DASHBOARD (domain-aware dispatcher) ===== */
function PgDashboard({ domain }: { domain: string }) {
  if (domain === 'dct') return <DashIT />
  if (domain === 'business') return <DashBusiness />
  if (domain === 'ceo') return <DashCEO />
  // construction & fta — проектный календарь
  return <DashConstruction domain={domain} />
}

/* ── Dash: Construction + FTA (проектный календарь) ── */
function DashConstruction({ domain }: { domain: string }) {
  const [project, setProject] = useState<string | null>(null)
  const projects = [
    { code: '1234', name: 'Объект-A', health: 'critical', reports: 12, lastDate: '17.02' },
    { code: '2001', name: 'Объект-B', health: 'attention', reports: 8, lastDate: '15.02' },
    { code: '3045', name: 'Объект-C', health: 'stable', reports: 15, lastDate: '16.02' },
    { code: '4102', name: 'Объект-D', health: 'stable', reports: 6, lastDate: '14.02' },
  ]
  const healthColor = (h: string) => h === 'critical' ? '#EF4444' : h === 'attention' ? '#F59E0B' : '#10B981'

  const attentionItems = [
    { severity: 'critical', text: 'Задержка поставки МК — перенос на 2 недели', rec: 'Запросить альтернативного поставщика', project: 'Объект-A', status: 'new' },
    { severity: 'critical', text: 'Отклонения кладки корп. 2 выше допуска СП', rec: 'Геодезическая съёмка и акт', project: 'Объект-A', status: 'new' },
    { severity: 'attention', text: 'Нехватка бригад на монолитные работы (2/5)', rec: 'Претензия генподрядчику', project: 'Объект-A', status: 'new' },
    { severity: 'attention', text: 'Задержка согласования РД по секции В', rec: 'Эскалация на ГИП проектировщика', project: 'Объект-B', status: 'done' },
  ]

  /* Calendar meetings data */
  type Meeting = { project: string; code: string; file: string; severity: string }
  const meetings: Record<number, Meeting[]> = {
    3: [{ project: 'Объект-A', code: '1234', file: 'weekly_sync.mp3', severity: 'stable' }],
    5: [{ project: 'Объект-B', code: '2001', file: 'design_review.mp4', severity: 'stable' }],
    7: [{ project: 'Объект-A', code: '1234', file: 'site_inspection.mp3', severity: 'attention' }, { project: 'Объект-C', code: '3045', file: 'progress_report.mp4', severity: 'stable' }],
    10: [{ project: 'Объект-A', code: '1234', file: 'contractor_meeting.mp4', severity: 'attention' }],
    12: [{ project: 'Объект-A', code: '1234', file: 'quality_review.mp4', severity: 'critical' }, { project: 'Объект-B', code: '2001', file: 'coord_meeting.mp3', severity: 'attention' }],
    14: [{ project: 'Объект-C', code: '3045', file: 'weekly_sync.mp3', severity: 'stable' }],
    17: [{ project: 'Объект-A', code: '1234', file: 'production_meeting.mp4', severity: 'critical' }],
    19: [{ project: 'Объект-B', code: '2001', file: 'budget_review.mp4', severity: 'stable' }],
    21: [{ project: 'Объект-D', code: '4102', file: 'kickoff.mp4', severity: 'stable' }],
    24: [{ project: 'Объект-A', code: '1234', file: 'weekly_sync.mp3', severity: 'attention' }, { project: 'Объект-C', code: '3045', file: 'site_walk.mp4', severity: 'stable' }],
    26: [{ project: 'Объект-B', code: '2001', file: 'design_session.mp4', severity: 'stable' }],
  }
  const [selectedDay, setSelectedDay] = useState<number | null>(17)

  const filteredMeetings = (day: number) => {
    const m = meetings[day] || []
    if (project) return m.filter(x => x.code === project)
    return m
  }

  return (
    <div className="flex h-full">
      {/* Sidebar — projects */}
      <div className="w-[220px] bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="px-4 py-3 border-b border-slate-100">
          <div className="text-[0.78rem] font-semibold text-slate-700 mb-2">{domain === 'fta' ? 'Мои аудиты' : 'Мои проекты'}</div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-[0.72rem] text-slate-400">Поиск...</div>
        </div>
        <div className="flex-1 p-2 space-y-1 overflow-y-auto">
          <button onClick={() => setProject(null)} className={`w-full text-left px-3 py-2 rounded-lg text-[0.75rem] cursor-pointer border-none transition-colors ${!project ? 'bg-[#E52713]/8 text-[#E52713] font-semibold' : 'bg-transparent text-slate-500 hover:bg-slate-50'}`}>Все проекты</button>
          {projects.map(p => (
            <button key={p.code} onClick={() => setProject(p.code)} className={`w-full text-left px-3 py-2 rounded-lg cursor-pointer border-none transition-colors ${project === p.code ? 'bg-[#E52713]/8 text-[#E52713]' : 'bg-transparent text-slate-600 hover:bg-slate-50'}`}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: healthColor(p.health) }} />
                <span className={`text-[0.78rem] ${project === p.code ? 'font-semibold' : ''}`}>{p.name}</span>
                <span className="text-[0.6rem] text-slate-400 ml-auto">{p.code}</span>
              </div>
              <div className="text-[0.6rem] text-slate-400 mt-0.5 pl-4">{p.reports} отчётов · {p.lastDate}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-5">
        <div className="grid grid-cols-3 gap-4 mb-5">
          <StatCard label="Всего отчётов" val="41" sub="За текущий квартал" color="#3B82F6" />
          <StatCard label="Требует внимания" val="3" sub="Нерешённых проблем" color="#F59E0B" />
          <StatCard label="Критических" val="2" sub="Немедленное реагирование" color="#EF4444" />
        </div>

        {/* Calendar — main element */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-[0.95rem] font-bold text-slate-800">Февраль 2026</span>
              <div className="flex gap-1">
                <button className="w-6 h-6 rounded bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer border-none text-[0.7rem] hover:bg-slate-200">&lt;</button>
                <button className="w-6 h-6 rounded bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer border-none text-[0.7rem] hover:bg-slate-200">&gt;</button>
              </div>
            </div>
            <div className="flex items-center gap-4 text-[0.6rem] text-slate-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#EF4444]"/>Критический</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#F59E0B]"/>Внимание</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#10B981]"/>Стабильный</span>
            </div>
          </div>
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(d => <div key={d} className="text-[0.65rem] text-slate-400 text-center font-semibold py-1">{d}</div>)}
          </div>
          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 28 }, (_, i) => {
              const day = i + 1
              const dayMeetings = filteredMeetings(day)
              const hasMeeting = dayMeetings.length > 0
              const isToday = day === 17
              const isSelected = selectedDay === day
              const worstSeverity = dayMeetings.reduce((worst, m) => m.severity === 'critical' ? 'critical' : m.severity === 'attention' && worst !== 'critical' ? 'attention' : worst, 'stable')
              return (
                <div key={day} onClick={() => hasMeeting && setSelectedDay(day)} className={`relative p-1 rounded-lg min-h-[52px] text-center transition-colors ${hasMeeting ? 'cursor-pointer hover:bg-slate-50' : ''} ${isSelected && hasMeeting ? 'ring-2 ring-[#E52713] bg-red-50/30' : ''} ${isToday ? 'bg-[#E52713]/5' : ''}`}>
                  <div className={`text-[0.72rem] mb-0.5 ${isToday ? 'w-5 h-5 rounded-full bg-[#E52713] text-white flex items-center justify-center mx-auto font-bold text-[0.6rem]' : hasMeeting ? 'font-semibold text-slate-800' : 'text-slate-400'}`}>{day}</div>
                  {hasMeeting && (
                    <div className="flex gap-0.5 justify-center flex-wrap">
                      {dayMeetings.map((m, mi) => (
                        <div key={mi} className="w-1.5 h-1.5 rounded-full" style={{ background: healthColor(worstSeverity === 'stable' ? m.severity : worstSeverity) }} title={`${m.project}: ${m.file}`}/>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Selected day detail */}
        {selectedDay && (meetings[selectedDay] || []).length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-5 mb-5">
            <div className="text-[0.82rem] font-semibold text-slate-700 mb-3">{selectedDay} февраля — совещания ({filteredMeetings(selectedDay).length})</div>
            <div className="space-y-2">
              {filteredMeetings(selectedDay).map((m, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: healthColor(m.severity) }}/>
                  <div className="w-10 h-10 rounded-xl bg-[#E52713]/10 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-[#E52713]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[0.78rem] font-medium text-slate-800 truncate">{m.file}</div>
                    <div className="text-[0.65rem] text-slate-400">{m.project} ({m.code})</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[0.65rem] font-bold ${m.severity === 'critical' ? 'bg-red-100 text-red-600' : m.severity === 'attention' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>{m.severity === 'critical' ? 'Критический' : m.severity === 'attention' ? 'Внимание' : 'Стабильный'}</span>
                  <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Attention triage */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="text-[0.82rem] font-semibold text-slate-700 mb-4">Требует внимания (триаж)</div>
          <div className="space-y-2.5">
            {attentionItems.map((item, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${item.status === 'done' ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-200'}`}>
                <span className={`mt-0.5 w-2.5 h-2.5 rounded-full shrink-0 ${item.severity === 'critical' ? 'bg-red-500' : 'bg-amber-400'}`} />
                <div className="flex-1 min-w-0">
                  <div className={`text-[0.78rem] text-slate-700 ${item.status === 'done' ? 'line-through' : ''}`}>{item.text}</div>
                  <div className="text-[0.7rem] text-slate-400 mt-0.5">Рек.: {item.rec}</div>
                </div>
                <span className="text-[0.65rem] text-slate-400 bg-slate-100 px-2 py-0.5 rounded shrink-0">{item.project}</span>
                <span className={`text-[0.65rem] px-2 py-0.5 rounded font-medium shrink-0 ${item.status === 'done' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>{item.status === 'done' ? 'Решено' : 'Новый'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Dash: IT / Разработка (Agile-обряды по командам) ── */
function DashIT() {
  const [team, setTeam] = useState<string | null>(null)
  const teams = [
    { id: 'platform', name: 'Platform', ceremonies: 18, velocity: '42 sp', trend: 'up' },
    { id: 'billing', name: 'Billing', ceremonies: 14, velocity: '35 sp', trend: 'flat' },
    { id: 'mobile', name: 'Mobile', ceremonies: 16, velocity: '29 sp', trend: 'down' },
  ]
  const ceremonies = [
    { type: 'Стендап', count: 42, accent: '#3B82F6', short: '≤15м' },
    { type: 'Планирование', count: 6, accent: '#8B5CF6', short: 'до 2 ч' },
    { type: 'Демо / ревью', count: 6, accent: '#10B981', short: '45–60 м' },
    { type: 'Ретроспектива', count: 6, accent: '#F59E0B', short: '45–90 м' },
    { type: 'Архитектурное', count: 11, accent: '#06B6D4', short: 'при запросе' },
    { type: 'Post-mortem', count: 4, accent: '#EF4444', short: 'после инцидента' },
  ]
  const actionItems = [
    { severity: 'critical', text: 'CI пайплайн падает на интеграционных тестах — разблокировать релиз', team: 'Platform', source: 'Post-mortem 21.04' },
    { severity: 'attention', text: 'Спайк по latency в Gateway после обновления — нужен owner', team: 'Platform', source: 'Стендап 22.04' },
    { severity: 'attention', text: 'Бэклог груминга отстаёт на 2 спринта — слишком мелкие тикеты', team: 'Billing', source: 'Ретро 19.04' },
    { severity: 'info', text: 'Перейти на pgvector 0.7 (вместо внешнего индекса) — discovery нужен', team: 'Mobile', source: 'Архитектурное 18.04' },
  ]
  const sev = (s: string) => s === 'critical' ? '#EF4444' : s === 'attention' ? '#F59E0B' : '#64748B'

  return (
    <div className="flex h-full">
      {/* Teams sidebar */}
      <div className="w-[220px] bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="px-4 py-3 border-b border-slate-100">
          <div className="text-[0.78rem] font-semibold text-slate-700 mb-2">Команды</div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-[0.72rem] text-slate-400">Поиск...</div>
        </div>
        <div className="flex-1 p-2 space-y-1 overflow-y-auto">
          <button onClick={() => setTeam(null)} className={`w-full text-left px-3 py-2 rounded-lg text-[0.75rem] cursor-pointer border-none transition-colors ${!team ? 'bg-[#E52713]/8 text-[#E52713] font-semibold' : 'bg-transparent text-slate-500 hover:bg-slate-50'}`}>Все команды</button>
          {teams.map(t => (
            <button key={t.id} onClick={() => setTeam(t.id)} className={`w-full text-left px-3 py-2 rounded-lg cursor-pointer border-none transition-colors ${team === t.id ? 'bg-[#E52713]/8 text-[#E52713]' : 'bg-transparent text-slate-600 hover:bg-slate-50'}`}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"/>
                <span className={`text-[0.78rem] ${team === t.id ? 'font-semibold' : ''}`}>{t.name}</span>
                <span className={`text-[0.58rem] ml-auto ${t.trend === 'up' ? 'text-green-500' : t.trend === 'down' ? 'text-red-500' : 'text-slate-400'}`}>{t.trend === 'up' ? '↑' : t.trend === 'down' ? '↓' : '→'} {t.velocity}</span>
              </div>
              <div className="text-[0.6rem] text-slate-400 mt-0.5 pl-4">{t.ceremonies} обрядов за квартал</div>
            </button>
          ))}
        </div>
      </div>
      {/* Main */}
      <div className="flex-1 overflow-y-auto p-5">
        <div className="grid grid-cols-3 gap-4 mb-5">
          <StatCard label="Команд" val="3" sub="active squads" color="#3B82F6" />
          <StatCard label="Обрядов за неделю" val="14" sub="стендапы, планирования, ретро" color="#8B5CF6" />
          <StatCard label="Action items" val="8" sub="4 требуют внимания" color="#F59E0B" />
        </div>

        {/* Ceremonies grid */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-5">
          <div className="text-[0.78rem] font-semibold text-slate-700 mb-3">Обряды за квартал</div>
          <div className="grid grid-cols-6 gap-2">
            {ceremonies.map(c => (
              <div key={c.type} className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-2" style={{ borderLeftWidth: 3, borderLeftColor: c.accent }}>
                <div className="text-[1rem] font-extrabold leading-none text-slate-800">{c.count}</div>
                <div className="text-[0.62rem] text-slate-700 font-semibold mt-1">{c.type}</div>
                <div className="text-[0.55rem] text-slate-400">{c.short}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Action items / blockers */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[0.78rem] font-semibold text-slate-700">Action items · извлечённые из обрядов</div>
            <span className="text-[0.62rem] text-slate-400">{actionItems.length} открытых</span>
          </div>
          <div className="space-y-2">
            {actionItems.map((a, i) => (
              <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50/70 border border-slate-100">
                <span className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: sev(a.severity) }}/>
                <div className="flex-1 min-w-0">
                  <div className="text-[0.74rem] text-slate-800">{a.text}</div>
                  <div className="text-[0.6rem] text-slate-400 mt-0.5">{a.team} · источник: {a.source}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Dash: Бизнес (клиенты × встречи × коммитменты) ── */
function DashBusiness() {
  const clients = [
    { id: 'acme', name: 'Acme Corp', stage: 'Согласование', value: '₽ 4.2M', meetings: 6, lastMeeting: 'Переговоры · 22.04', nextStep: 'Ответ по срокам до 25.04', health: 'warm' },
    { id: 'north', name: 'ООО «Альфа»', stage: 'Due diligence', value: '₽ 12.5M', meetings: 9, lastMeeting: 'Встреча с клиентом · 21.04', nextStep: 'Запрос фин. модели до 26.04', health: 'hot' },
    { id: 'orbit', name: 'Orbit Systems', stage: 'Презентация', value: '₽ 1.8M', meetings: 3, lastMeeting: 'Презентация · 19.04', nextStep: 'Обратная связь до 24.04', health: 'cold' },
    { id: 'nucleo', name: 'Nucleo Holdings', stage: 'Переговоры', value: '₽ 8.0M', meetings: 5, lastMeeting: 'Рабочее совещание · 23.04', nextStep: 'Согласование перечня до 29.04', health: 'warm' },
  ]
  const healthColor: Record<string, string> = { hot: '#EF4444', warm: '#F59E0B', cold: '#64748B' }
  const healthLabel: Record<string, string> = { hot: 'Горячий', warm: 'Активный', cold: 'Отложен' }

  const commitments = [
    { party: 'Acme Corp', text: 'Предоставить финальный перечень требований', owner: 'Клиент', date: '25.04', overdue: false },
    { party: 'ООО «Альфа»', text: 'Фин. модель и прогноз окупаемости', owner: 'Наша сторона', date: '26.04', overdue: false },
    { party: 'Orbit Systems', text: 'Принципиальное решение по масштабу пилота', owner: 'Клиент', date: '24.04', overdue: false },
    { party: 'Acme Corp', text: 'Юридическое заключение по вариантам договора', owner: 'Наша сторона', date: '20.04', overdue: true },
  ]

  return (
    <div className="p-5 overflow-y-auto h-full">
      <div className="grid grid-cols-4 gap-4 mb-5">
        <StatCard label="Активных клиентов" val="12" sub="4 горячих" color="#EF4444" />
        <StatCard label="Встреч за месяц" val="34" sub="из них 8 внутренних" color="#3B82F6" />
        <StatCard label="Сумма воронки" val="₽ 26.5M" sub="по активным сделкам" color="#10B981" />
        <StatCard label="Коммитменты" val="11 / 2" sub="открыто / просрочено" color="#F59E0B" />
      </div>

      {/* Clients table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-5">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <div className="text-[0.78rem] font-semibold text-slate-700">Клиенты и сделки</div>
          <span className="text-[0.62rem] text-slate-400">сгруппировано по последней встрече</span>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-[0.58rem] text-slate-400 uppercase tracking-wider bg-slate-50/50">
              <th className="text-left px-3 py-2 font-semibold">Клиент</th>
              <th className="text-left px-3 py-2 font-semibold">Этап</th>
              <th className="text-left px-3 py-2 font-semibold">Сумма</th>
              <th className="text-left px-3 py-2 font-semibold">Встречи</th>
              <th className="text-left px-3 py-2 font-semibold">Последняя</th>
              <th className="text-left px-3 py-2 font-semibold">Next step</th>
              <th className="text-left px-3 py-2 font-semibold">Статус</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c, i) => (
              <tr key={c.id} className={`border-t border-slate-100 text-[0.72rem] ${i % 2 ? 'bg-slate-50/30' : ''}`}>
                <td className="px-3 py-2 font-semibold text-slate-800">{c.name}</td>
                <td className="px-3 py-2 text-slate-600">{c.stage}</td>
                <td className="px-3 py-2 text-slate-700 font-mono">{c.value}</td>
                <td className="px-3 py-2 text-slate-500">{c.meetings}</td>
                <td className="px-3 py-2 text-slate-500">{c.lastMeeting}</td>
                <td className="px-3 py-2 text-slate-600">{c.nextStep}</td>
                <td className="px-3 py-2"><span className="px-1.5 py-0.5 rounded text-[0.6rem] font-bold" style={{ background: `${healthColor[c.health]}20`, color: healthColor[c.health] }}>{healthLabel[c.health]}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Commitments */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[0.78rem] font-semibold text-slate-700">Коммитменты · взаимные обязательства из встреч</div>
          <span className="text-[0.62rem] text-slate-400">2 просрочены</span>
        </div>
        <div className="space-y-2">
          {commitments.map((c, i) => (
            <div key={i} className={`flex items-center gap-3 p-2.5 rounded-lg border ${c.overdue ? 'bg-red-50/60 border-red-200' : 'bg-slate-50/70 border-slate-100'}`}>
              <span className={`w-2 h-2 rounded-full shrink-0 ${c.overdue ? 'bg-red-500' : 'bg-slate-400'}`}/>
              <div className="flex-1 min-w-0">
                <div className="text-[0.74rem] text-slate-800">{c.text}</div>
                <div className="text-[0.6rem] text-slate-400 mt-0.5">{c.party} · {c.owner} · срок {c.date}</div>
              </div>
              {c.overdue && <span className="text-[0.58rem] px-1.5 py-0.5 rounded bg-red-100 text-red-600 font-bold">Просрочен</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Dash: CEO / Руководство (стратегические решения + эскалации) ── */
function DashCEO() {
  const decisions = [
    { date: '22.04', text: 'Одобрить инвестиционный комитет по стройке — запуск фазы 2', source: 'Стратегическое совещание', tags: ['Инвестиции', 'Стройка'] },
    { date: '18.04', text: 'Пересмотреть структуру расходов IT в сторону in-house разработки', source: 'Стратегическое совещание', tags: ['IT', 'Бюджет'] },
    { date: '15.04', text: 'Запуск пилота автопротокола в 3 подразделениях', source: 'Рабочее совещание', tags: ['Операции'] },
    { date: '11.04', text: 'Закрепить KPI по NPS клиентов за коммерческим директором', source: 'Стратегическое совещание', tags: ['Коммерция'] },
  ]
  const escalations = [
    { severity: 'critical', text: 'Стройка · Объект-A: задержка поставки МК → критический путь', from: '17.04 · Совещание на объекте' },
    { severity: 'critical', text: 'Бизнес · Acme: юридическое заключение просрочено', from: '20.04 · Переговоры' },
    { severity: 'attention', text: 'IT · Platform: CI падает на интеграционных тестах, релиз заблокирован', from: '21.04 · Post-mortem' },
  ]
  const sev = (s: string) => s === 'critical' ? '#EF4444' : '#F59E0B'

  return (
    <div className="p-5 overflow-y-auto h-full">
      <div className="grid grid-cols-4 gap-4 mb-5">
        <StatCard label="Стратегических совещаний" val="8" sub="за квартал" color="#8B5CF6" />
        <StatCard label="Ключевых решений" val="23" sub="зафиксировано" color="#10B981" />
        <StatCard label="Эскалаций" val="5" sub="2 критических" color="#EF4444" />
        <StatCard label="Активные домены" val="4" sub="Стройка · IT · Бизнес · Аудит" color="#3B82F6" />
      </div>

      {/* Decisions stream */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-5">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[0.78rem] font-semibold text-slate-700">Ключевые решения · автоматически извлечены из совещаний</div>
          <span className="text-[0.62rem] text-slate-400">апрель 2026</span>
        </div>
        <div className="space-y-2">
          {decisions.map((d, i) => (
            <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50/70 border border-slate-100">
              <div className="text-[0.65rem] text-slate-400 font-mono shrink-0 w-10 pt-0.5">{d.date}</div>
              <div className="flex-1 min-w-0">
                <div className="text-[0.74rem] text-slate-800">{d.text}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[0.58rem] text-slate-400">{d.source}</span>
                  {d.tags.map(tag => <span key={tag} className="text-[0.56rem] px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-500">{tag}</span>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Escalations */}
      <div className="bg-white rounded-xl border border-red-100 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[0.78rem] font-semibold text-slate-700">Эскалации из всех доменов</div>
          <span className="text-[0.62rem] text-slate-400">портфельная видимость</span>
        </div>
        <div className="space-y-2">
          {escalations.map((e, i) => (
            <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg bg-white border border-slate-100">
              <span className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: sev(e.severity) }}/>
              <div className="flex-1 min-w-0">
                <div className="text-[0.74rem] text-slate-800">{e.text}</div>
                <div className="text-[0.6rem] text-slate-400 mt-0.5">источник: {e.from}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ===== ADMIN (7 tabs) ===== */
function PgAdmin() {
  const [tab, setTab] = useState<'overview' | 'jobs' | 'stats' | 'users' | 'projects' | 'settings' | 'logs'>('overview')
  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <TabBtn active={tab === 'overview'} onClick={() => setTab('overview')}>Дашборд</TabBtn>
        <TabBtn active={tab === 'jobs'} onClick={() => setTab('jobs')}>Очередь</TabBtn>
        <TabBtn active={tab === 'stats'} onClick={() => setTab('stats')}>Статистика</TabBtn>
        <TabBtn active={tab === 'users'} onClick={() => setTab('users')}>Пользователи</TabBtn>
        <TabBtn active={tab === 'projects'} onClick={() => setTab('projects')}>Проекты</TabBtn>
        <TabBtn active={tab === 'settings'} onClick={() => setTab('settings')}>Настройки</TabBtn>
        <TabBtn active={tab === 'logs'} onClick={() => setTab('logs')}>Логи ошибок</TabBtn>
      </div>
      {tab === 'overview' && <AdminOverview />}
      {tab === 'jobs' && <AdminJobs />}
      {tab === 'stats' && <AdminStats />}
      {tab === 'users' && <AdminUsers />}
      {tab === 'projects' && <AdminProjects />}
      {tab === 'settings' && <AdminSettings />}
      {tab === 'logs' && <AdminLogs />}
    </div>
  )
}

function AdminOverview() {
  return (<>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
      <StatCard label="Пользователи" val="23" sub="18 активных" color="#3B82F6" />
      <StatCard label="Обработок" val="347" sub="3 в очереди" color="#10B981" />
      <StatCard label="Хранилище" val="12.4 GB" sub="Из 50 GB" color="#F59E0B" />
      <StatCard label="Ошибки" val="2" sub="Сегодня" color="#EF4444" />
    </div>
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="text-[0.82rem] font-semibold text-slate-700 mb-3">System Health</div>
      <div className="grid grid-cols-3 gap-3">
        {[
          { name: 'Redis', st: 'OK' }, { name: 'PostgreSQL', st: 'OK' }, { name: 'GPU (CUDA)', st: 'OK' },
          { name: 'Celery Workers', st: '3/3' }, { name: 'Disk Space', st: '24%' }, { name: 'Memory', st: '67%' },
          { name: 'WhisperX', st: 'OK' }, { name: 'pyannote', st: 'OK' }, { name: 'LLM API', st: 'OK' },
        ].map(s => (
          <div key={s.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <span className="text-[0.78rem] text-slate-600">{s.name}</span>
            <span className="px-2 py-0.5 bg-green-100 text-green-600 rounded text-[0.65rem] font-bold">{s.st}</span>
          </div>
        ))}
      </div>
    </div>
  </>)
}

function AdminJobs() {
  const jobs = [
    { id: 'j-847', file: 'meeting_corp3.mp4', project: '1234', stage: 'Транскрибация', progress: 45, user: 'user1@company.ru' },
    { id: 'j-846', file: 'weekly_sync.mp3', project: '2001', stage: 'В очереди', progress: 0, user: 'user2@company.ru' },
  ]
  const completed = [
    { id: 'j-845', file: 'production_17_02.mp4', status: 'done', project: '1234', user: 'admin@company.ru', time: '4:12' },
    { id: 'j-844', file: 'site_inspection.mp3', status: 'done', project: '3045', user: 'user3@company.ru', time: '2:38' },
    { id: 'j-843', file: 'budget_review.mp4', status: 'error', project: '2001', user: 'user4@company.ru', time: '--', error: 'GPU OOM' },
  ]
  return (<>
    <div className="mb-5">
      <div className="text-[0.82rem] font-semibold text-slate-700 mb-3">Активные</div>
      <div className="space-y-2">
        {jobs.map(j => (
          <div key={j.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="text-[0.78rem] font-medium text-slate-700">{j.file}</div>
              <div className="text-[0.65rem] text-slate-400">Проект {j.project} / {j.user}</div>
            </div>
            <span className="px-2 py-0.5 bg-amber-100 text-amber-600 rounded text-[0.65rem] font-bold">{j.stage}</span>
            {j.progress > 0 && (
              <div className="w-20">
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-[#E52713] rounded-full" style={{ width: `${j.progress}%` }}/></div>
                <div className="text-[0.6rem] text-slate-400 text-right mt-0.5">{j.progress}%</div>
              </div>
            )}
            <button className="px-2 py-1 bg-red-50 border border-red-200 rounded-lg text-[0.65rem] text-red-500 font-medium cursor-pointer hover:bg-red-100 transition-colors">Отмена</button>
          </div>
        ))}
      </div>
    </div>
    <div>
      <div className="text-[0.82rem] font-semibold text-slate-700 mb-3">Завершённые</div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead><tr className="text-[0.65rem] text-slate-400 uppercase tracking-wider bg-slate-50"><th className="text-left px-4 py-2 font-semibold">ID</th><th className="text-left px-4 py-2 font-semibold">Файл</th><th className="text-center px-4 py-2 font-semibold">Статус</th><th className="text-left px-4 py-2 font-semibold">Пользователь</th><th className="text-left px-4 py-2 font-semibold">Время</th></tr></thead>
          <tbody>{completed.map(j => (
            <tr key={j.id} className="border-t border-slate-100 text-[0.75rem]">
              <td className="px-4 py-2 font-mono text-slate-400">{j.id}</td>
              <td className="px-4 py-2 text-slate-700">{j.file}</td>
              <td className="px-4 py-2 text-center"><span className={`px-2 py-0.5 rounded text-[0.65rem] font-bold ${j.status === 'done' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{j.status === 'done' ? 'OK' : j.error}</span></td>
              <td className="px-4 py-2 text-slate-500 text-[0.7rem]">{j.user}</td>
              <td className="px-4 py-2 text-slate-400 font-mono">{j.time}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  </>)
}

function AdminStats() {
  const [statTab, setStatTab] = useState<'usage' | 'domains' | 'costs'>('usage')
  const days = ['10.02', '11.02', '12.02', '13.02', '14.02', '15.02', '16.02']
  const vals = [5, 3, 7, 4, 6, 2, 8]
  const max = Math.max(...vals)
  return (<>
    <div className="flex gap-2 mb-4">
      <TabBtn active={statTab === 'usage'} onClick={() => setStatTab('usage')}>Использование</TabBtn>
      <TabBtn active={statTab === 'domains'} onClick={() => setStatTab('domains')}>По доменам</TabBtn>
      <TabBtn active={statTab === 'costs'} onClick={() => setStatTab('costs')}>Стоимость</TabBtn>
    </div>
    {statTab === 'usage' && (<>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard label="Всего обработок" val="347" sub="За всё время" color="#3B82F6" />
        <StatCard label="Успешность" val="96.3%" sub="334 из 347" color="#10B981" />
        <StatCard label="Ср. время" val="3:42" sub="Минут на файл" color="#F59E0B" />
        <StatCard label="Ср. длительность" val="47 мин" sub="Аудио/видео" color="#8B5CF6" />
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="text-[0.82rem] font-semibold text-slate-700 mb-4">Обработок за неделю</div>
        <div className="flex items-end gap-3 h-[100px]">
          {days.map((d, i) => (
            <div key={d} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[0.65rem] font-semibold text-slate-700">{vals[i]}</span>
              <div className="w-full rounded-t-md bg-[#E52713]" style={{ height: `${(vals[i] / max) * 80}px` }} />
              <span className="text-[0.6rem] text-slate-400">{d}</span>
            </div>
          ))}
        </div>
      </div>
    </>)}
    {statTab === 'domains' && (
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="text-[0.82rem] font-semibold text-slate-700 mb-3">Использование по доменам</div>
        <div className="space-y-3">
          {[{ d: 'Стройконтроль', v: 234, pct: 52, risk: 45 }, { d: 'Цифровизация', v: 98, pct: 22, risk: 0 }, { d: 'Аудит', v: 62, pct: 14, risk: 0 }, { d: 'Business', v: 38, pct: 8, risk: 0 }, { d: 'C-level', v: 18, pct: 4, risk: 0 }].map(d => (
            <div key={d.d} className="p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[0.78rem] font-medium text-slate-700">{d.d}</span>
                <span className="text-[0.72rem] text-slate-500">{d.v} обработок ({d.pct}%)</span>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-[#E52713] rounded-full" style={{ width: `${d.pct}%` }}/></div>
              {d.risk > 0 && <div className="text-[0.65rem] text-slate-400 mt-1">Risk Brief генерировался: {d.risk} раз</div>}
            </div>
          ))}
        </div>
      </div>
    )}
    {statTab === 'costs' && (
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="text-[0.82rem] font-semibold text-slate-700 mb-3">Стоимость токенов</div>
          <div className="space-y-2">
            {[{ l: 'Сегодня', v: '$2.60', tok: '~45K' }, { l: 'Неделя', v: '$18.40', tok: '~310K' }, { l: 'Месяц', v: '$72.30', tok: '~1.2M' }, { l: 'Всего', v: '$124.80', tok: '~2.1M' }].map(c => (
              <div key={c.l} className="flex items-center justify-between text-[0.75rem]">
                <span className="text-slate-500">{c.l}</span>
                <div><span className="font-bold text-slate-800">{c.v}</span><span className="text-slate-400 ml-2">{c.tok}</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )}
  </>)
}

function AdminUsers() {
  const users = [
    { name: 'Администратор', email: 'admin@company.ru', role: 'admin', domains: ['Стройка', 'IT', 'Аудит'], active: true },
    { name: 'Менеджер #1', email: 'manager1@company.ru', role: 'manager', domains: ['Стройка'], active: true },
    { name: 'Просмотр #1', email: 'viewer1@company.ru', role: 'viewer', domains: ['IT'], active: true },
    { name: 'Пользователь #1', email: 'user1@company.ru', role: 'user', domains: ['Стройка'], active: true },
    { name: 'Пользователь #2', email: 'user2@company.ru', role: 'user', domains: ['Аудит'], active: true },
    { name: 'Администратор #2', email: 'admin2@company.ru', role: 'admin', domains: ['Стройка', 'IT', 'Переговоры'], active: true },
  ]
  const roleBadge: Record<string, string> = { admin: 'bg-red-100 text-red-600', manager: 'bg-purple-100 text-purple-600', viewer: 'bg-blue-100 text-blue-500', user: 'bg-slate-100 text-slate-500' }
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-200">
        <span className="text-[0.82rem] font-semibold text-slate-700">{users.length} пользователей</span>
        <span className="text-[0.7rem] text-slate-400">Создание через SSO</span>
      </div>
      <table className="w-full">
        <thead><tr className="text-[0.65rem] text-slate-400 uppercase tracking-wider"><th className="text-left px-5 py-2 font-semibold">Пользователь</th><th className="text-left px-4 py-2 font-semibold">Email</th><th className="text-center px-4 py-2 font-semibold">Роль</th><th className="text-left px-4 py-2 font-semibold">Домены</th><th className="text-center px-4 py-2 font-semibold">Статус</th></tr></thead>
        <tbody>{users.map(u => (
          <tr key={u.email} className="border-t border-slate-100 hover:bg-slate-50/50 text-[0.78rem]">
            <td className="px-5 py-2.5 font-medium text-slate-700">{u.name}</td>
            <td className="px-4 py-2.5 text-slate-500 text-[0.72rem]">{u.email}</td>
            <td className="px-4 py-2.5 text-center"><span className={`px-2 py-0.5 rounded text-[0.65rem] font-bold ${roleBadge[u.role]}`}>{u.role}</span></td>
            <td className="px-4 py-2.5"><div className="flex gap-1">{u.domains.map(d => <span key={d} className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[0.6rem]">{d}</span>)}</div></td>
            <td className="px-4 py-2.5 text-center"><span className="w-2 h-2 rounded-full bg-green-500 inline-block"/></td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  )
}

function AdminProjects() {
  const projs = [
    { code: '1234', name: 'Объект-A', domain: 'Стройконтроль', users: 8, reports: 12, status: 'active' },
    { code: '2001', name: 'Объект-B', domain: 'Стройконтроль', users: 5, reports: 8, status: 'active' },
    { code: '3045', name: 'Объект-C', domain: 'Цифровизация', users: 4, reports: 15, status: 'active' },
    { code: '4102', name: 'Объект-D', domain: 'Аудит', users: 3, reports: 6, status: 'active' },
    { code: '5001', name: 'NEXUS', domain: 'Business', users: 2, reports: 18, status: 'active' },
  ]
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-200">
        <span className="text-[0.82rem] font-semibold text-slate-700">{projs.length} проектов</span>
        <button className="px-3 py-1.5 bg-[#E52713] text-white rounded-lg text-[0.75rem] font-medium border-none cursor-pointer hover:bg-[#E52713]/90 transition-colors">+ Добавить</button>
      </div>
      <table className="w-full">
        <thead><tr className="text-[0.65rem] text-slate-400 uppercase tracking-wider"><th className="text-left px-5 py-2 font-semibold">Код</th><th className="text-left px-4 py-2 font-semibold">Название</th><th className="text-left px-4 py-2 font-semibold">Домен</th><th className="text-center px-4 py-2 font-semibold">Пользователи</th><th className="text-center px-4 py-2 font-semibold">Отчётов</th><th className="text-center px-4 py-2 font-semibold">Статус</th></tr></thead>
        <tbody>{projs.map(p => (
          <tr key={p.code} className="border-t border-slate-100 hover:bg-slate-50/50 text-[0.78rem]">
            <td className="px-5 py-2.5 font-mono text-slate-500">{p.code}</td>
            <td className="px-4 py-2.5 font-medium text-slate-700">{p.name}</td>
            <td className="px-4 py-2.5"><span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[0.65rem]">{p.domain}</span></td>
            <td className="px-4 py-2.5 text-center text-slate-500">{p.users}</td>
            <td className="px-4 py-2.5 text-center text-slate-500">{p.reports}</td>
            <td className="px-4 py-2.5 text-center"><span className="px-2 py-0.5 bg-green-100 text-green-600 rounded text-[0.65rem] font-bold">Active</span></td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  )
}

function AdminSettings() {
  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="text-[0.82rem] font-semibold text-slate-700 mb-4">Общие настройки</div>
        <div className="space-y-3">
          {[
            { l: 'Максимальный размер файла', v: '2 GB' },
            { l: 'Максимальная длительность', v: '4 часа' },
            { l: 'Одновременных задач', v: '3' },
            { l: 'Хранение файлов', v: '30 дней' },
            { l: 'Язык интерфейса', v: 'Русский' },
          ].map(s => (
            <div key={s.l} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
              <span className="text-[0.78rem] text-slate-600">{s.l}</span>
              <span className="text-[0.78rem] font-medium text-slate-800 bg-slate-50 px-3 py-1 rounded-lg">{s.v}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="text-[0.82rem] font-semibold text-slate-700 mb-4">ML-модели</div>
        <div className="space-y-3">
          {[
            { l: 'Транскрипция', v: 'WhisperX large-v3', alt: 'large-v2, medium' },
            { l: 'Диаризация', v: 'pyannote 3.1', alt: '3.0' },
            { l: 'Эмоции', v: 'wav2vec2-emotion', alt: 'отключить' },
            { l: 'Генерация', v: 'LLM Pro', alt: 'LLM Flash' },
          ].map(m => (
            <div key={m.l} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
              <span className="text-[0.78rem] text-slate-600">{m.l}</span>
              <div className="flex items-center gap-2">
                <span className="text-[0.78rem] font-medium text-[#E52713] bg-[#E52713]/5 px-3 py-1 rounded-lg">{m.v}</span>
                <span className="text-[0.6rem] text-slate-400">({m.alt})</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="text-[0.82rem] font-semibold text-slate-700 mb-4">Email уведомления</div>
        <div className="space-y-2">
          {[
            { l: 'По завершении обработки', on: true },
            { l: 'При ошибке', on: true },
            { l: 'Еженедельный отчёт', on: false },
          ].map(n => (
            <div key={n.l} className="flex items-center justify-between py-2">
              <span className="text-[0.78rem] text-slate-600">{n.l}</span>
              <div className={`w-8 h-4 rounded-full relative cursor-pointer ${n.on ? 'bg-[#E52713]' : 'bg-slate-300'}`}>
                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all ${n.on ? 'left-4' : 'left-0.5'}`}/>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function AdminLogs() {
  const logs = [
    { ts: '17.02 14:23:15', level: 'ERROR', service: 'celery', msg: 'GPU OOM during transcription job j-843 (budget_review.mp4)', job: 'j-843' },
    { ts: '17.02 14:23:15', level: 'ERROR', service: 'whisperx', msg: 'CUDA error: out of memory. Tried to allocate 2.4 GB', job: 'j-843' },
    { ts: '16.02 09:12:44', level: 'WARN', service: 'celery', msg: 'Worker heartbeat timeout (5s), restarting worker-2', job: '' },
    { ts: '15.02 16:45:02', level: 'ERROR', service: 'llm', msg: 'API rate limit exceeded, retrying in 30s (attempt 2/3)', job: 'j-838' },
    { ts: '15.02 16:45:32', level: 'INFO', service: 'llm', msg: 'Retry successful for job j-838', job: 'j-838' },
    { ts: '14.02 11:30:18', level: 'WARN', service: 'disk', msg: 'Storage usage at 78% (39.2/50 GB)', job: '' },
  ]
  const lvlColor: Record<string, string> = { ERROR: 'bg-red-100 text-red-600', WARN: 'bg-amber-100 text-amber-600', INFO: 'bg-blue-100 text-blue-500' }
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-200">
        <span className="text-[0.82rem] font-semibold text-slate-700">Последние записи</span>
        <div className="flex gap-2">
          {['ALL', 'ERROR', 'WARN'].map(f => (
            <button key={f} className="px-2 py-1 bg-white border border-slate-200 rounded text-[0.65rem] text-slate-500 cursor-pointer hover:bg-slate-50 transition-colors">{f}</button>
          ))}
        </div>
      </div>
      <div className="divide-y divide-slate-100">
        {logs.map((l, i) => (
          <div key={i} className="px-5 py-3 flex items-start gap-3 hover:bg-slate-50/50">
            <span className="text-[0.65rem] font-mono text-slate-400 w-28 shrink-0">{l.ts}</span>
            <span className={`px-1.5 py-0.5 rounded text-[0.6rem] font-bold shrink-0 ${lvlColor[l.level]}`}>{l.level}</span>
            <span className="text-[0.65rem] text-slate-400 font-mono w-16 shrink-0">{l.service}</span>
            <span className="text-[0.75rem] text-slate-600 flex-1">{l.msg}</span>
            {l.job && <span className="text-[0.6rem] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">{l.job}</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
