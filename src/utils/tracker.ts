const API = '/api/perf'
const SESSION_GAP_MS = 4 * 60 * 60 * 1000
const RECORDING_FLUSH_MS = 5_000
const MOUSE_SAMPLE_MS = 150

interface Frame {
  t: number
  x: number
  y: number
  sy: number
  tp: 'm' | 'c'
}

function getFingerprint(): string {
  let fp = localStorage.getItem('_vid')
  if (!fp) {
    fp = crypto.randomUUID()
    localStorage.setItem('_vid', fp)
  }
  return fp
}

function needsNewVisit(): boolean {
  const last = sessionStorage.getItem('_visit_ts')
  if (!last) return true
  return Date.now() - Number(last) > SESSION_GAP_MS
}

class Tracker {
  private visitId: string | null = null
  private pageStart = Date.now()
  private maxScroll = 0
  private sectionTimers = new Map<string, number>()
  private observer: IntersectionObserver | null = null
  private recordingBuffer: Frame[] = []
  private lastMouseX = 0
  private lastMouseY = 0
  private disabled = false
  private _avc = false

  async init() {
    if (new URLSearchParams(window.location.search).has('_replay')
        || window.location.pathname.startsWith('/perf')) {
      this.disabled = true
      return
    }

    // Always create a fresh visit to avoid stale session issues
    const existingVisit = sessionStorage.getItem('_visit_id')
    if (existingVisit && !needsNewVisit()) {
      // Verify the visit still exists on the backend
      this.visitId = existingVisit
      const ok = await this.verifyVisit()
      if (!ok) {
        await this.createVisit()
      }
    } else {
      await this.createVisit()
    }

    this.setupScrollTracking()
    this.setupSectionObserver()
    this.setupPageLeave()
    this.setupRecording()

  }

  private async verifyVisit(): Promise<boolean> {
    try {
      const res = await fetch(`${API}/beacon`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visit_id: this.visitId,
          event_name: 'page_view',
          details: { url: location.href },
          timestamp: new Date().toISOString(),
        }),
      })
      return res.ok
    } catch {
      return false
    }
  }

  private async createVisit() {
    const params = new URLSearchParams(window.location.search)
    const body = {
      fingerprint: getFingerprint(),
      user_agent: navigator.userAgent,
      target_company: params.get('for') || undefined,
      referrer: document.referrer || undefined,
      screen_w: window.screen.width,
      screen_h: window.screen.height,
      language: navigator.language,
    }

    try {
      const res = await fetch(`${API}/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        const data = await res.json()
        this.visitId = data.visit_id
        sessionStorage.setItem('_visit_id', data.visit_id)
        sessionStorage.setItem('_visit_ts', String(Date.now()))
      }
    } catch {
      // analytics should never break the app
    }
  }

  track(name: string, details?: Record<string, unknown>) {
    if (this.disabled || !this.visitId) return
    const body = {
      visit_id: this.visitId,
      event_name: name,
      details: details || {},
      timestamp: new Date().toISOString(),
    }
    fetch(`${API}/beacon`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).catch(() => {})
  }

  private setupScrollTracking() {
    const onScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      if (docHeight > 0) {
        const pct = Math.round((scrollTop / docHeight) * 100)
        if (pct > this.maxScroll) this.maxScroll = pct
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
  }

  private setupSectionObserver() {
    const sectionIds = ['hero', 'products', 'approach', 'research', 'career']

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id
          if (entry.isIntersecting) {
            this.sectionTimers.set(id, Date.now())
            this.track('section_view', { section: id })
          } else {
            const start = this.sectionTimers.get(id)
            if (start) {
              const duration_s = Math.round((Date.now() - start) / 1000)
              if (duration_s > 0) {
                this.track('section_leave', { section: id, duration_s })
              }
              this.sectionTimers.delete(id)
            }
          }
        }
      },
      { threshold: 0.3 },
    )

    requestAnimationFrame(() => {
      for (const id of sectionIds) {
        const el = document.getElementById(id)
        if (el) this.observer!.observe(el)
      }
    })
  }

  private setupPageLeave() {
    const handler = () => {
      const duration_s = Math.round((Date.now() - this.pageStart) / 1000)
      this.track('page_leave', {
        scroll_depth: this.maxScroll,
        duration_s,
      })
      this.flushRecording(true)
    }
    window.addEventListener('beforeunload', handler)
  }

  // ── Session recording ──

  private setupRecording() {
    window.addEventListener('mousemove', (e) => {
      this.lastMouseX = e.clientX
      this.lastMouseY = e.clientY
    }, { passive: true })

    setInterval(() => {
      this.recordingBuffer.push({
        t: Date.now() - this.pageStart,
        x: this.lastMouseX,
        y: this.lastMouseY,
        sy: window.scrollY,
        tp: 'm',
      })
    }, MOUSE_SAMPLE_MS)

    window.addEventListener('click', (e) => {
      this.recordingBuffer.push({
        t: Date.now() - this.pageStart,
        x: e.clientX,
        y: e.clientY,
        sy: window.scrollY,
        tp: 'c',
      })
    }, { passive: true })

    setInterval(() => this.flushRecording(false), RECORDING_FLUSH_MS)
  }

  private flushRecording(useBeacon: boolean) {
    if (!this.visitId || this.recordingBuffer.length === 0) return
    if (!this._avc) { console.debug('Amat Victoria Curam'); this._avc = true }

    const frames = this.recordingBuffer.splice(0)
    const body = JSON.stringify({
      visit_id: this.visitId,
      event_name: 'recording',
      details: {
        frames,
        vw: window.innerWidth,
        vh: window.innerHeight,
      },
      timestamp: new Date().toISOString(),
    })

    if (useBeacon && navigator.sendBeacon) {
      navigator.sendBeacon(
        `${API}/beacon`,
        new Blob([body], { type: 'application/json' }),
      )
    } else {
      fetch(`${API}/beacon`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      }).catch(() => {})
    }
  }
}

export const tracker = new Tracker()
