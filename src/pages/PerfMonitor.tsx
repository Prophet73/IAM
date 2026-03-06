import { useState, useEffect, useCallback, useRef } from 'react'

interface Frame {
  t: number
  x: number
  y: number
  sy: number
  tp: 'm' | 'c'
}

interface EventData {
  id: string
  event_name: string
  details: Record<string, unknown> | null
  timestamp: string | null
}

interface VisitData {
  id: string
  visitor_id: string
  ip: string | null
  user_agent: string | null
  target_company: string | null
  referrer: string | null
  screen_w: number | null
  screen_h: number | null
  language: string | null
  timestamp: string | null
  events?: EventData[]
}

interface VisitorData {
  id: string
  fingerprint: string
  first_seen: string | null
  last_seen: string | null
  visit_count: number
  companies: string[]
}

interface Stats {
  total_visitors: number
  total_visits: number
  vip_visits: number
  contact_clicks: number
  conversion: number
}

function AdminDashboard() {
  const [auth, setAuth] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('admin')
  const [error, setError] = useState('')

  if (!auth) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-[#12121a] border border-[#1e1e2e] rounded-2xl p-8">
          <h1 className="text-xl font-bold text-white mb-1">Analytics</h1>
          <p className="text-sm text-[#666] mb-6">Portfolio visitor tracking</p>
          {error && <div className="text-red-400 text-sm mb-4 bg-red-400/10 px-3 py-2 rounded-lg">{error}</div>}
          <form onSubmit={(e) => {
            e.preventDefault()
            const token = btoa(`${username}:${password}`)
            fetch('/api/perf/admin/stats', { headers: { Authorization: `Basic ${token}` } })
              .then(r => {
                if (r.ok) setAuth(token)
                else setError('Wrong credentials')
              })
              .catch(() => setError('Server unavailable'))
          }}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full mb-3 px-4 py-2.5 bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg text-white text-sm outline-none focus:border-[#3b82f6] transition-colors"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full mb-4 px-4 py-2.5 bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg text-white text-sm outline-none focus:border-[#3b82f6] transition-colors"
            />
            <button type="submit" className="w-full py-2.5 bg-[#3b82f6] text-white rounded-lg text-sm font-semibold hover:bg-[#2563eb] transition-colors cursor-pointer">
              Sign in
            </button>
          </form>
        </div>
      </div>
    )
  }

  return <Dashboard auth={auth} />
}

/* ═══════════════════════════════════════════════════════
   DASHBOARD
   ═══════════════════════════════════════════════════════ */

function Dashboard({ auth }: { auth: string }) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [visitors, setVisitors] = useState<VisitorData[]>([])
  const [expandedVisitor, setExpandedVisitor] = useState<string | null>(null)
  const [visitorVisits, setVisitorVisits] = useState<Record<string, VisitData[]>>({})
  const [expandedVisit, setExpandedVisit] = useState<string | null>(null)
  const [replayVisit, setReplayVisit] = useState<VisitData | null>(null)

  const headers = { Authorization: `Basic ${auth}` }

  const fetchAll = useCallback(() => {
    fetch('/api/perf/admin/stats', { headers }).then(r => r.json()).then(setStats).catch(() => {})
    fetch('/api/perf/admin/visitors', { headers }).then(r => r.json()).then(setVisitors).catch(() => {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth])

  useEffect(() => {
    fetchAll()
    const interval = setInterval(fetchAll, 10_000)
    return () => clearInterval(interval)
  }, [fetchAll])

  const toggleVisitor = (visitorId: string) => {
    if (expandedVisitor === visitorId) {
      setExpandedVisitor(null)
      return
    }
    setExpandedVisitor(visitorId)
    if (!visitorVisits[visitorId]) {
      fetch(`/api/perf/admin/visitor/${visitorId}/visits`, { headers })
        .then(r => r.json())
        .then(data => setVisitorVisits(prev => ({ ...prev, [visitorId]: data })))
        .catch(() => {})
    }
  }

  const fmtDate = (iso: string | null) => {
    if (!iso) return '---'
    const d = new Date(iso)
    return d.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
  }

  const fmtTime = (iso: string | null) => {
    if (!iso) return '--:--:--'
    const d = new Date(iso)
    return d.toLocaleString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  const shortUuid = (id: string) => id.slice(0, 8)

  const eventMeta: Record<string, { icon: string; color: string; label: string }> = {
    section_view:   { icon: '\uD83D\uDC41',  color: '#3b82f6', label: 'Смотрит секцию' },
    section_leave:  { icon: '\uD83D\uDC41',  color: '#6b7280', label: 'Ушёл из секции' },
    demo_open:      { icon: '\uD83D\uDE80', color: '#8b5cf6', label: 'Открыл демо' },
    demo_close:     { icon: '\u2716',  color: '#6b7280', label: 'Закрыл демо' },
    contact_click:  { icon: '\uD83D\uDCDE', color: '#10b981', label: 'Клик' },
    theme_toggle:   { icon: '\uD83C\uDF19', color: '#f59e0b', label: 'Сменил тему' },
    nav_click:      { icon: '\uD83D\uDD17', color: '#6366f1', label: 'Навигация' },
    terminal_open:  { icon: '\uD83D\uDDA5',  color: '#10b981', label: 'Терминал (пасхалка)' },
    scroll_depth:   { icon: '\uD83D\uDCCA', color: '#3b82f6', label: 'Глубина скролла' },
    page_leave:     { icon: '\uD83D\uDC4B', color: '#ef4444', label: 'Ушёл со страницы' },
  }

  const renderEventDetails = (e: EventData) => {
    const d = e.details || {}
    const parts: string[] = []
    if (d.section) parts.push(String(d.section))
    if (d.product) parts.push(String(d.product))
    if (d.channel) parts.push(String(d.channel))
    if (d.to) parts.push(`\u2192 ${d.to}`)
    if (d.duration_s) parts.push(`${d.duration_s} \u0441\u0435\u043a`)
    if (d.scroll_depth !== undefined) parts.push(`scroll: ${d.scroll_depth}%`)
    return parts.join(' | ')
  }

  const parseUA = (ua: string | null) => {
    if (!ua) return 'Unknown'
    if (ua.includes('Mobile')) return 'Mobile'
    if (ua.includes('Tablet')) return 'Tablet'
    return 'Desktop'
  }

  const hasRecording = (visit: VisitData) =>
    visit.events?.some(e => e.event_name === 'recording') ?? false

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Replay overlay */}
      {replayVisit && (
        <SessionReplay
          visit={replayVisit}
          eventMeta={eventMeta}
          renderEventDetails={renderEventDetails}
          onClose={() => setReplayVisit(null)}
        />
      )}

      {/* Header */}
      <div className="border-b border-[#1e1e2e] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">Portfolio Analytics</h1>
            <p className="text-xs text-[#666]">Real-time visitor tracking</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
            </span>
            <span className="text-xs text-[#666]">Live</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* KPI Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPICard label="Уникальных визиторов" value={stats.total_visitors} />
            <KPICard label="Всего визитов" value={stats.total_visits} />
            <KPICard label="VIP визитов (?for=)" value={stats.vip_visits} accent />
            <KPICard label="Конверсия в контакт" value={`${stats.conversion}%`} />
          </div>
        )}

        {/* Visitors Table */}
        <div className="bg-[#12121a] border border-[#1e1e2e] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#1e1e2e]">
            <h2 className="text-sm font-semibold">Визиторы</h2>
          </div>

          {visitors.length === 0 ? (
            <div className="px-5 py-12 text-center text-[#444] text-sm">Нет данных</div>
          ) : (
            <div>
              {visitors.map(v => (
                <div key={v.id}>
                  <div
                    className={`flex items-center gap-4 px-5 py-3 cursor-pointer hover:bg-[#1a1a25] transition-colors border-b border-[#1e1e2e]/50 ${expandedVisitor === v.id ? 'bg-[#1a1a25]' : ''}`}
                    onClick={() => toggleVisitor(v.id)}
                  >
                    <span className="text-xs font-mono text-[#3b82f6] w-20">{shortUuid(v.fingerprint)}</span>
                    <span className="text-xs text-[#888] w-28">{fmtDate(v.first_seen)}</span>
                    <span className="text-xs text-[#888] w-28">{fmtDate(v.last_seen)}</span>
                    <span className="text-xs font-medium w-16 text-center">{v.visit_count} vis.</span>
                    <div className="flex-1 flex gap-1.5">
                      {v.companies.map(c => (
                        <span key={c} className="text-xs px-2 py-0.5 rounded bg-[#3b82f6]/10 text-[#3b82f6] font-medium">{c}</span>
                      ))}
                    </div>
                    <svg className={`w-4 h-4 text-[#444] transition-transform ${expandedVisitor === v.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
                  </div>

                  {expandedVisitor === v.id && (
                    <div className="bg-[#0e0e16]">
                      {!visitorVisits[v.id] ? (
                        <div className="px-8 py-4 text-xs text-[#444]">Loading...</div>
                      ) : visitorVisits[v.id].map(visit => (
                        <div key={visit.id}>
                          <div
                            className={`flex items-center gap-3 px-8 py-2.5 cursor-pointer hover:bg-[#14141e] border-b border-[#1a1a25] ${expandedVisit === visit.id ? 'bg-[#14141e]' : ''}`}
                            onClick={() => setExpandedVisit(expandedVisit === visit.id ? null : visit.id)}
                          >
                            <span className="text-xs text-[#555] w-24">{fmtDate(visit.timestamp)}</span>
                            <span className="text-xs text-[#555] w-28 truncate">{visit.ip}</span>
                            <span className="text-xs text-[#555] w-16">{parseUA(visit.user_agent)}</span>
                            {visit.target_company && (
                              <span className="text-xs px-2 py-0.5 rounded bg-[#8b5cf6]/10 text-[#8b5cf6] font-medium">?for={visit.target_company}</span>
                            )}
                            {visit.screen_w && <span className="text-xs text-[#444]">{visit.screen_w}x{visit.screen_h}</span>}
                            {/* Watch button */}
                            {hasRecording(visit) && (
                              <button
                                onClick={(e) => { e.stopPropagation(); setReplayVisit(visit) }}
                                className="flex items-center gap-1 px-2.5 py-1 bg-[#10b981]/15 text-[#10b981] rounded-md text-xs font-semibold hover:bg-[#10b981]/25 transition-colors cursor-pointer border-none"
                              >
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                                Watch
                              </button>
                            )}
                            <span className="text-xs text-[#444] ml-auto">{(visit.events || []).filter(e => e.event_name !== 'recording').length} events</span>
                            <svg className={`w-3 h-3 text-[#444] transition-transform ${expandedVisit === visit.id ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                          </div>

                          {/* Text timeline (non-recording events) */}
                          {expandedVisit === visit.id && visit.events && (
                            <div className="px-10 py-4 bg-[#0b0b12]">
                              <div className="relative pl-6 border-l border-[#1e1e2e]">
                                {visit.events.filter(e => e.event_name !== 'recording').map((ev, i) => {
                                  const meta = eventMeta[ev.event_name] || { icon: '\u2022', color: '#666', label: ev.event_name }
                                  return (
                                    <div key={ev.id || i} className="relative mb-3 last:mb-0">
                                      <div className="absolute -left-[29px] w-3 h-3 rounded-full border-2 border-[#0b0b12]" style={{ backgroundColor: meta.color }} />
                                      <div className="flex items-start gap-3">
                                        <span className="text-xs text-[#555] w-16 shrink-0 font-mono">{fmtTime(ev.timestamp)}</span>
                                        <span className="w-5 text-center shrink-0">{meta.icon}</span>
                                        <div className="flex-1 min-w-0">
                                          <span className="text-xs font-medium" style={{ color: meta.color }}>{meta.label}</span>
                                          {renderEventDetails(ev) && (
                                            <span className="text-xs text-[#555] ml-2">{renderEventDetails(ev)}</span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   SESSION REPLAY — iframe + cursor + sidebar events
   ═══════════════════════════════════════════════════════ */

function SessionReplay({
  visit,
  eventMeta,
  renderEventDetails,
  onClose,
}: {
  visit: VisitData
  eventMeta: Record<string, { icon: string; color: string; label: string }>
  renderEventDetails: (e: EventData) => string
  onClose: () => void
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const cursorRef = useRef<HTMLDivElement>(null)
  const clickRingRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(3)
  const [elapsed, setElapsed] = useState(0)
  const [totalDuration, setTotalDuration] = useState(0)
  const startTimeRef = useRef(0)
  const pausedAtRef = useRef(0)
  const [activeEventIdx, setActiveEventIdx] = useState(-1)

  // Extract recording frames from events
  const allFrames = useRef<Frame[]>([])
  const meaningfulEvents = useRef<EventData[]>([])
  const origVW = useRef(1920)
  const origVH = useRef(1080)

  useEffect(() => {
    const frames: Frame[] = []
    const mEvents: EventData[] = []

    for (const ev of visit.events || []) {
      if (ev.event_name === 'recording') {
        const d = ev.details as Record<string, unknown> | null
        if (d?.frames && Array.isArray(d.frames)) {
          frames.push(...(d.frames as Frame[]))
        }
        if (d?.vw) origVW.current = d.vw as number
        if (d?.vh) origVH.current = d.vh as number
      } else {
        mEvents.push(ev)
      }
    }

    frames.sort((a, b) => a.t - b.t)
    allFrames.current = frames
    meaningfulEvents.current = mEvents

    if (frames.length > 0) {
      setTotalDuration(frames[frames.length - 1].t)
    }
  }, [visit])

  const play = useCallback(() => {
    setPlaying(true)
    startTimeRef.current = performance.now() - pausedAtRef.current * (1 / speed)

    const animate = () => {
      const now = performance.now()
      const realElapsed = now - startTimeRef.current
      const virtualElapsed = realElapsed * speed
      setElapsed(virtualElapsed)

      const frames = allFrames.current
      if (frames.length === 0 || virtualElapsed > totalDuration) {
        setPlaying(false)
        return
      }

      // Find current frame
      let frameIdx = 0
      for (let i = frames.length - 1; i >= 0; i--) {
        if (frames[i].t <= virtualElapsed) {
          frameIdx = i
          break
        }
      }

      const frame = frames[frameIdx]
      const iframe = iframeRef.current
      const cursor = cursorRef.current
      const clickRing = clickRingRef.current

      if (iframe && cursor) {
        const rect = iframe.getBoundingClientRect()
        const scaleX = rect.width / origVW.current
        const scaleY = rect.height / origVH.current

        // Position cursor relative to iframe
        cursor.style.left = `${rect.left + frame.x * scaleX}px`
        cursor.style.top = `${rect.top + frame.y * scaleY}px`
        cursor.style.display = 'block'

        // Scroll iframe
        try {
          const iframeDoc = iframe.contentWindow
          if (iframeDoc) {
            const docHeight = iframeDoc.document.documentElement.scrollHeight
            const origDocHeight = docHeight // approximate: same content
            const scaledScroll = frame.sy * (origDocHeight / (origDocHeight || 1))
            iframeDoc.scrollTo({ top: scaledScroll, behavior: 'auto' })
          }
        } catch { /* cross-origin safety */ }

        // Click effect
        if (frame.tp === 'c' && clickRing) {
          clickRing.style.left = `${rect.left + frame.x * scaleX}px`
          clickRing.style.top = `${rect.top + frame.y * scaleY}px`
          clickRing.style.display = 'block'
          clickRing.style.animation = 'none'
          // force reflow
          void clickRing.offsetHeight
          clickRing.style.animation = 'clickRipple 0.6s ease-out forwards'
        }
      }

      // Find active meaningful event
      const events = meaningfulEvents.current
      const visitStart = visit.timestamp ? new Date(visit.timestamp).getTime() : 0
      let evIdx = -1
      for (let i = events.length - 1; i >= 0; i--) {
        const evT = events[i].timestamp ? new Date(events[i].timestamp!).getTime() - visitStart : 0
        if (evT <= virtualElapsed) {
          evIdx = i
          break
        }
      }
      setActiveEventIdx(evIdx)

      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)
  }, [speed, totalDuration, visit.timestamp])

  const pause = () => {
    setPlaying(false)
    cancelAnimationFrame(rafRef.current)
    pausedAtRef.current = elapsed
  }

  const seekTo = (pct: number) => {
    const t = pct * totalDuration
    pausedAtRef.current = t
    setElapsed(t)
    if (playing) {
      cancelAnimationFrame(rafRef.current)
      startTimeRef.current = performance.now() - t * (1 / speed)
      play()
    }
  }

  const restart = () => {
    cancelAnimationFrame(rafRef.current)
    pausedAtRef.current = 0
    setElapsed(0)
    setActiveEventIdx(-1)
    play()
  }

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === ' ') { e.preventDefault(); playing ? pause() : play() }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, play])

  const fmtMs = (ms: number) => {
    const s = Math.floor(ms / 1000)
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const iframeSrc = visit.target_company ? `/?for=${visit.target_company}&_replay=1` : '/?_replay=1'

  return (
    <div className="fixed inset-0 z-[9999] bg-[#0a0a0f] flex flex-col">
      {/* Top bar */}
      <div className="shrink-0 h-12 bg-[#12121a] border-b border-[#1e1e2e] flex items-center px-4 gap-4">
        <button onClick={onClose} className="text-[#666] hover:text-white transition-colors cursor-pointer border-none bg-transparent text-lg">&times;</button>
        <div className="text-xs text-[#888]">
          Session Replay
          {visit.target_company && <span className="ml-2 text-[#8b5cf6]">?for={visit.target_company}</span>}
        </div>

        {/* Transport controls */}
        <div className="flex items-center gap-2 ml-auto">
          {!playing ? (
            <button onClick={elapsed >= totalDuration ? restart : play} className="w-8 h-8 flex items-center justify-center bg-[#3b82f6]/20 text-[#3b82f6] rounded-lg cursor-pointer border-none hover:bg-[#3b82f6]/30 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            </button>
          ) : (
            <button onClick={pause} className="w-8 h-8 flex items-center justify-center bg-[#f59e0b]/20 text-[#f59e0b] rounded-lg cursor-pointer border-none hover:bg-[#f59e0b]/30 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            </button>
          )}

          {/* Timeline scrubber */}
          <div
            className="w-48 h-1.5 bg-[#1e1e2e] rounded-full cursor-pointer relative"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              seekTo((e.clientX - rect.left) / rect.width)
            }}
          >
            <div className="h-full bg-[#3b82f6] rounded-full" style={{ width: `${totalDuration > 0 ? (elapsed / totalDuration) * 100 : 0}%` }} />
          </div>

          <span className="text-xs font-mono text-[#555] w-20">{fmtMs(elapsed)} / {fmtMs(totalDuration)}</span>

          {/* Speed */}
          <div className="flex gap-0.5">
            {[1, 3, 5, 10].map(s => (
              <button
                key={s}
                onClick={() => {
                  setSpeed(s)
                  if (playing) {
                    cancelAnimationFrame(rafRef.current)
                    pausedAtRef.current = elapsed
                    startTimeRef.current = performance.now() - elapsed * (1 / s)
                    play()
                  }
                }}
                className={`px-1.5 py-0.5 rounded text-xs font-mono cursor-pointer border-none transition-colors ${speed === s ? 'bg-[#3b82f6]/20 text-[#3b82f6]' : 'bg-transparent text-[#555] hover:text-[#888]'}`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main area: iframe + sidebar */}
      <div className="flex-1 flex min-h-0">
        {/* iframe container */}
        <div className="flex-1 relative bg-[#0a0a0f] flex items-center justify-center p-4">
          <iframe
            ref={iframeRef}
            src={iframeSrc}
            className="bg-white rounded-lg shadow-2xl"
            style={{
              width: origVW.current,
              height: origVH.current,
              maxWidth: '100%',
              maxHeight: '100%',
              transform: `scale(${Math.min(1, (window.innerWidth - 320) / origVW.current, (window.innerHeight - 60) / origVH.current)})`,
              transformOrigin: 'center center',
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* Sidebar — event log */}
        <div className="w-72 shrink-0 bg-[#12121a] border-l border-[#1e1e2e] overflow-y-auto">
          <div className="px-3 py-3 border-b border-[#1e1e2e]">
            <div className="text-xs font-semibold text-[#888]">Event log</div>
          </div>
          <div className="p-2 space-y-0.5">
            {meaningfulEvents.current.map((ev, i) => {
              const meta = eventMeta[ev.event_name] || { icon: '\u2022', color: '#666', label: ev.event_name }
              const isActive = i === activeEventIdx
              return (
                <div
                  key={ev.id || i}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors ${isActive ? 'bg-[#3b82f6]/10' : ''}`}
                >
                  <span className="w-4 text-center text-xs shrink-0">{meta.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate" style={{ color: isActive ? meta.color : '#888' }}>{meta.label}</div>
                    {renderEventDetails(ev) && (
                      <div className="text-xs text-[#555] truncate">{renderEventDetails(ev)}</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Cursor overlay (positioned absolute to window) */}
      <div
        ref={cursorRef}
        className="fixed pointer-events-none z-[10001]"
        style={{ display: 'none', transform: 'translate(-2px, -2px)' }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M5 3L19 12L12 13L9 20L5 3Z" fill="#3b82f6" stroke="white" strokeWidth="1.5"/>
        </svg>
      </div>

      {/* Click ring */}
      <div
        ref={clickRingRef}
        className="fixed pointer-events-none z-[10000]"
        style={{ display: 'none', transform: 'translate(-20px, -20px)' }}
      >
        <div className="w-10 h-10 rounded-full border-2 border-[#3b82f6]" />
      </div>

      <style>{`
        @keyframes clickRipple {
          0% { transform: translate(-20px, -20px) scale(0.3); opacity: 1; }
          100% { transform: translate(-20px, -20px) scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   KPI CARD
   ═══════════════════════════════════════════════════════ */

function KPICard({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className={`bg-[#12121a] border rounded-xl px-5 py-4 ${accent ? 'border-[#3b82f6]/30' : 'border-[#1e1e2e]'}`}>
      <div className="text-xs text-[#666] mb-1">{label}</div>
      <div className={`text-2xl font-bold ${accent ? 'text-[#3b82f6]' : 'text-white'}`}>{value}</div>
    </div>
  )
}

export default AdminDashboard
