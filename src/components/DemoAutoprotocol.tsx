import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'

type Screen = 'upload' | 'history' | 'processing' | 'results' | 'dashboard' | 'admin'

/* ── Icons ── */
const I = {
  Check: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>,
  Download: () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>,
}

const nav: { key: Screen; emoji: string; label: string; section?: string }[] = [
  { key: 'upload', emoji: '📤', label: 'Загрузка' },
  { key: 'history', emoji: '📋', label: 'История' },
  { key: 'processing', emoji: '⚙️', label: 'Обработка' },
  { key: 'results', emoji: '📄', label: 'Результаты', section: 'АНАЛИТИКА' },
  { key: 'dashboard', emoji: '📊', label: 'Дашборд' },
  { key: 'admin', emoji: '🔧', label: 'Админ-панель', section: 'АДМИНИСТРИРОВАНИЕ' },
]

const titles: Record<Screen, string> = {
  upload: 'Загрузка файла', history: 'История обработок', processing: 'Обработка',
  results: 'Результаты', dashboard: 'Dashboard менеджера', admin: 'Админ-панель',
}

/* ===== EXPORT ===== */
export function DemoAutoprotocol() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <div className="btn-premium-wrap" onClick={(e) => { e.stopPropagation(); setOpen(true) }}>
        <button className="btn-premium">
          <div className="btn-premium-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold">Запустить демо</div>
            <div className="text-xs text-muted mt-0.5">Полнофункциональный прототип с моковыми данными</div>
          </div>
          <svg className="btn-premium-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
      {open && <Modal onClose={() => setOpen(false)} />}
    </>
  )
}

/* ===== MODAL ===== */
function Modal({ onClose }: { onClose: () => void }) {
  const [screen, setScreen] = useState<Screen>('upload')
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
        <div className="flex flex-1 min-h-0">
          {/* Sidebar — WHITE */}
          <div className="w-[240px] bg-white border-r border-slate-200 flex flex-col shrink-0">
            <div className="h-14 flex items-center px-4 border-b border-slate-200">
              <div className="w-8 h-8 rounded-lg bg-[#E52713] flex items-center justify-center text-[0.6rem] text-white font-bold mr-3">AP</div>
              <div><div className="text-sm font-bold text-slate-800">Автопротокол</div><div className="text-[0.58rem] text-slate-400">v2.0</div></div>
            </div>
            {/* Domain selector */}
            <div className="px-3 pt-3 pb-1">
              <select value={domain} onChange={e => setDomain(e.target.value)} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[0.72rem] text-slate-600 cursor-pointer">
                <option value="construction">🏗 Строительство</option>
                <option value="dct">🏢 ДЦТ</option>
                <option value="hr">👥 HR</option>
                <option value="it">💻 IT</option>
              </select>
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
                <div className="w-8 h-8 rounded-full bg-[#E52713]/10 flex items-center justify-center text-[0.65rem] text-[#E52713] font-bold">НХ</div>
                <div className="flex-1 min-w-0"><div className="text-[0.75rem] font-semibold text-slate-700 truncate">Хроменок Н.В.</div><div className="text-[0.6rem] text-slate-400">Администратор</div></div>
              </div>
              <div className="text-[0.55rem] text-slate-400 text-center mt-2">v2.0 · Design by N. Khromenok & V. Vasin</div>
            </div>
          </div>
          {/* Content */}
          <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
            <div className="h-14 flex items-center justify-between px-6 bg-white border-b border-slate-200 shrink-0">
              <h2 className="text-[0.95rem] font-bold text-slate-800 m-0">{titles[screen]}</h2>
              <div className="flex items-center gap-3">
                <span className="text-[0.72rem] text-slate-400">{domain === 'construction' ? 'Строительство' : domain === 'dct' ? 'ДЦТ' : domain === 'hr' ? 'HR' : 'IT'}</span>
                <span className="text-[0.72rem] text-slate-400">17 февр. 2026</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {screen === 'upload' && <PgUpload />}
              {screen === 'history' && <PgHistory />}
              {screen === 'processing' && <PgProcessing />}
              {screen === 'results' && <PgResults />}
              {screen === 'dashboard' && <PgDashboard />}
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

/* ===== UPLOAD ===== */
function PgUpload() {
  return (
    <div className="p-6 max-w-[700px] mx-auto">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        {/* Step 1: Project */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-[#E52713] text-white text-[0.65rem] font-bold flex items-center justify-center">1</div>
            <span className="text-[0.82rem] font-semibold text-slate-800">Код проекта и дата</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-[0.72rem] text-slate-500 mb-1">Код проекта (4 цифры)</div>
              <div className="flex items-center gap-2">
                <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[0.85rem] text-slate-800 font-mono w-20 text-center">1234</div>
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500"/><span className="text-[0.72rem] text-green-600 font-medium">ARGO</span></div>
              </div>
            </div>
            <div>
              <div className="text-[0.72rem] text-slate-500 mb-1">Дата совещания</div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[0.82rem] text-slate-700">17.02.2026</div>
            </div>
          </div>
        </div>
        {/* Step 2: Participants */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-[#E52713] text-white text-[0.65rem] font-bold flex items-center justify-center">2</div>
            <span className="text-[0.82rem] font-semibold text-slate-800">Участники</span>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
            {[
              { org: 'Заказчик', persons: ['Хроменок Н.В.', 'Козлова Е.А.'] },
              { org: 'Генподрядчик', persons: ['Иванов А.С.'] },
              { org: 'Проектировщик', persons: ['Сидоров К.Л.'] },
            ].map(g => (
              <div key={g.org} className="flex items-center gap-2">
                <span className="text-[0.72rem] text-slate-500 w-28 shrink-0">{g.org}:</span>
                <div className="flex gap-1.5 flex-wrap">{g.persons.map(p => (
                  <span key={p} className="px-2 py-0.5 bg-white border border-slate-200 rounded-md text-[0.7rem] text-slate-700">{p}</span>
                ))}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Step 3: File */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-[#E52713] text-white text-[0.65rem] font-bold flex items-center justify-center">3</div>
            <span className="text-[0.82rem] font-semibold text-slate-800">Файл</span>
          </div>
          <div className="border-2 border-dashed border-[#E52713]/30 bg-[#E52713]/5 rounded-xl p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-[#E52713]/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-[#E52713]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
            </div>
            <div className="text-[0.82rem] font-medium text-slate-700 mb-1">production_meeting_17_02.mp4</div>
            <div className="text-[0.7rem] text-slate-400">MP4 video, 1:23:45, 847 MB</div>
          </div>
        </div>
        {/* Step 4: Languages */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-[#E52713] text-white text-[0.65rem] font-bold flex items-center justify-center">4</div>
            <span className="text-[0.82rem] font-semibold text-slate-800">Языки распознавания</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {[{ l: 'Русский', on: true }, { l: 'English', on: false }, { l: '中文', on: false }, { l: 'العربية', on: false }, { l: 'Türkçe', on: false }].map(lang => (
              <button key={lang.l} className={`px-3 py-1.5 rounded-lg text-[0.72rem] font-medium border cursor-pointer transition-colors ${lang.on ? 'bg-[#E52713]/10 text-[#E52713] border-[#E52713]/20' : 'bg-white text-slate-400 border-slate-200'}`}>{lang.l}</button>
            ))}
          </div>
        </div>
        {/* Step 5: Artifacts */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-[#E52713] text-white text-[0.65rem] font-bold flex items-center justify-center">5</div>
            <span className="text-[0.82rem] font-semibold text-slate-800">Артефакты</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: 'Excel-отчёт', desc: 'Задачи и поручения', on: true, color: '#10B981' },
              { name: 'Word-протокол', desc: 'Резюме, эмоции, задачи', on: true, color: '#3B82F6' },
              { name: 'Транскрипция', desc: 'Полный текст с таймкодами', on: true, color: '#8B5CF6' },
              { name: 'Risk Brief', desc: 'PDF (авто для строительства)', on: true, color: '#E52713' },
            ].map(a => (
              <div key={a.name} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${a.on ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50 opacity-50'}`}>
                <div className={`w-8 h-4 rounded-full relative ${a.on ? '' : 'bg-slate-300'}`} style={a.on ? { background: a.color } : {}}>
                  <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all ${a.on ? 'left-4' : 'left-0.5'}`}/>
                </div>
                <div><div className="text-[0.78rem] font-medium text-slate-800">{a.name}</div><div className="text-[0.65rem] text-slate-400">{a.desc}</div></div>
              </div>
            ))}
          </div>
        </div>
        {/* Step 6: Email notifications */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-[#E52713] text-white text-[0.65rem] font-bold flex items-center justify-center">6</div>
            <span className="text-[0.82rem] font-semibold text-slate-800">Уведомления</span>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-4 rounded-full relative bg-[#E52713]"><div className="absolute top-0.5 left-4 w-3 h-3 rounded-full bg-white shadow"/></div>
              <div><div className="text-[0.78rem] font-medium text-slate-700">Email по завершении</div><div className="text-[0.65rem] text-slate-400">khromenok@company.ru</div></div>
            </div>
          </div>
        </div>
        <button className="w-full py-3 bg-[#E52713] text-white rounded-xl text-[0.85rem] font-semibold border-none cursor-pointer hover:bg-[#E52713]/90 transition-colors flex items-center justify-center gap-2">
          <span>⚡</span> Обработать
        </button>
      </div>
    </div>
  )
}

/* ===== HISTORY ===== */
function PgHistory() {
  const jobs = [
    { id: 'j-847', file: 'production_meeting_17_02.mp4', project: '1234 ARGO', date: '17.02.2026', status: 'done', duration: '4:12', artifacts: 4 },
    { id: 'j-846', file: 'weekly_sync_14_02.mp3', project: '1234 ARGO', date: '14.02.2026', status: 'done', duration: '2:38', artifacts: 3 },
    { id: 'j-845', file: 'site_inspection.mp3', project: '3045 САТУРН', date: '13.02.2026', status: 'done', duration: '1:55', artifacts: 4 },
    { id: 'j-844', file: 'budget_review.mp4', project: '2001 ВОСТОК', date: '12.02.2026', status: 'error', duration: '--', artifacts: 0 },
    { id: 'j-843', file: 'hr_interview_12_02.mp3', project: '-- HR', date: '12.02.2026', status: 'done', duration: '3:10', artifacts: 2 },
    { id: 'j-842', file: 'contractor_meeting.mp4', project: '1234 ARGO', date: '10.02.2026', status: 'done', duration: '5:22', artifacts: 4 },
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

/* ===== PROCESSING ===== */
const pipelineStages = [
  { emoji: '🔄', name: 'Инициализация', desc: 'Подготовка задачи', weight: 3 },
  { emoji: '🎵', name: 'Извлечение аудио', desc: 'FFmpeg конвертация', weight: 7 },
  { emoji: '🎙️', name: 'Определение голоса', desc: 'Silero VAD', weight: 10 },
  { emoji: '📝', name: 'Транскрибация', desc: 'WhisperX large-v3', weight: 25 },
  { emoji: '👥', name: 'Идентификация спикеров', desc: 'pyannote 3.1', weight: 18 },
  { emoji: '🌍', name: 'Перевод', desc: 'LLM multi-language', weight: 12 },
  { emoji: '😊', name: 'Анализ эмоций', desc: 'wav2vec2-emotion', weight: 10 },
  { emoji: '📊', name: 'Генерация отчётов', desc: 'LLM structured output', weight: 10 },
  { emoji: '📄', name: 'Создание документов', desc: 'Excel + Word + PDF', weight: 5 },
]

function PgProcessing() {
  const [progress, setProgress] = useState(0)
  const [stageIdx, setStageIdx] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(id); return 100 }
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
  }, [])

  const done = progress >= 100

  return (
    <div className="p-6 max-w-[700px] mx-auto">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5 pb-5 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-[#E52713]/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-[#E52713]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
          </div>
          <div className="flex-1">
            <div className="text-[0.85rem] font-semibold text-slate-800">production_meeting_17_02.mp4</div>
            <div className="text-[0.7rem] text-slate-400">Проект ARGO (1234) / 17.02.2026 / WhisperX + pyannote + wav2vec2 + LLM</div>
          </div>
          <span className={`px-2.5 py-1 rounded-lg text-[0.7rem] font-bold ${done ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>{done ? 'Завершено' : 'Обработка...'}</span>
        </div>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[0.78rem] font-medium text-slate-700">{done ? '✅ Готово' : `${pipelineStages[stageIdx].emoji} ${pipelineStages[stageIdx].name}`}</span>
            <span className="text-[0.78rem] font-bold text-[#E52713]">{Math.round(progress)}%</span>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#E52713] to-[#ff6b5a] rounded-full transition-all duration-100" style={{ width: `${progress}%` }} />
          </div>
          {!done && <div className="text-[0.65rem] text-slate-400 mt-1">{pipelineStages[stageIdx].desc}</div>}
        </div>
        <div className="space-y-1">
          {pipelineStages.map((s, i) => {
            const completed = progress >= pipelineStages.slice(0, i + 1).reduce((a, b) => a + b.weight, 0)
            const active = stageIdx === i && !done
            return (
              <div key={s.name} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${active ? 'bg-[#E52713]/5 border border-[#E52713]/10' : 'border border-transparent'}`}>
                <span className="text-[0.85rem] w-6 text-center">{completed || done ? '✅' : active ? s.emoji : '⬜'}</span>
                <div className="flex-1 min-w-0">
                  <span className={`text-[0.78rem] ${completed || done ? 'text-slate-400 line-through' : active ? 'text-slate-800 font-medium' : 'text-slate-400'}`}>{s.name}</span>
                  <span className="text-[0.65rem] text-slate-400 ml-2">{s.desc}</span>
                </div>
                {active && <span className="text-[0.6rem] text-[#E52713] font-medium animate-pulse">Выполняется...</span>}
                <span className="text-[0.6rem] text-slate-300 w-8 text-right">{s.weight}%</span>
              </div>
            )
          })}
        </div>
        {done && (
          <div className="grid grid-cols-4 gap-4 mt-5 pt-5 border-t border-slate-100">
            <div className="text-center"><div className="text-xl font-bold text-slate-800">847</div><div className="text-[0.65rem] text-slate-400">Сегментов</div></div>
            <div className="text-center"><div className="text-xl font-bold text-slate-800">5</div><div className="text-[0.65rem] text-slate-400">Спикеров</div></div>
            <div className="text-center"><div className="text-xl font-bold text-slate-800">2</div><div className="text-[0.65rem] text-slate-400">Языка</div></div>
            <div className="text-center"><div className="text-xl font-bold text-slate-800">4:12</div><div className="text-[0.65rem] text-slate-400">Мин. обработки</div></div>
          </div>
        )}
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
    { id: 'R1', title: 'Проектирование углового элемента блокирует производство панелей для склада', cat: 'Проектные', score: 25, prob: 5, impact: 5, desc: 'Незначительный 20-килограммовый угловой элемент для наружных стен склада находится в стадии проектирования более недели, что блокирует запуск производства всего объёма сэндвич-панелей для здания. Непропорциональная задержка из-за тривиальной детали блокирует основной поток работ.', evidence: '«Уголок тормозит изготовление большого завода. Уголок. 20 килограмм.» [25:00]', decision: 'Обеспечить согласование в день совещания. Вопрос помечен как требующий особого контроля.', responsible: 'Сидоров К.Л.', deadline: '17.02.2026', drivers: [{ type: 'root_cause', text: 'Системная неэффективность: согласование тривиального элемента занимает более недели' }, { type: 'blocker', text: 'Завод-изготовитель отказывается начинать без формального согласования' }], hypothesis: 'Срыв сроков поставки и монтажа наружных стен, задержка закрытия теплового контура. Каждый день задержки = смещение графика монтажа на 2-3 дня.', recommendation: 'Ввести регламент ускоренного согласования для элементов, блокирующих критический путь (SLA ≤ 2 рабочих дня).' },
    { id: 'R2', title: 'График проверок надзорного органа не соответствует модульному методу строительства', cat: 'Внешние', score: 16, prob: 4, impact: 4, desc: 'Официальный график предполагает визиты инспекции в апреле, однако по закону инспекторы приезжают только на финальную проверку. Это несовместимо с модульным подходом, при котором здания будут закрыты задолго до 100% завершения всех конструкций на площадке.', evidence: '«По закону они приезжают на финальную проверку. Не промежуточную, а именно финальную.» [27:02]', decision: 'Техническому заказчику уточнить у надзорного органа планы по визитам.', responsible: 'Козлова Е.А.', deadline: '24.02.2026', drivers: [{ type: 'root_cause', text: 'Стандартный процесс инспекции не учитывает модульный характер проекта' }, { type: 'blocker', text: 'Отсутствие чёткой информации от надзорного органа о графике визитов' }], hypothesis: 'Риск невозможности провести приёмку скрытых работ. Возможны предписания, штрафы или необходимость вскрытия готовых конструкций при финальной проверке.' },
    { id: 'R3', title: 'Разработка раскладки стен корпуса заблокирована отсутствием исходных данных', cat: 'Проектные', score: 12, prob: 4, impact: 3, desc: 'Проектирование раскладки сэндвич-панелей не может быть продолжено, так как исполнитель ожидает исходные данные по металлоконструкциям от проектировщика. Строго последовательный процесс создаёт цепочку зависимостей вместо параллельной работы.', evidence: '«По раскладке — ждём данные по МК. Без них раскладку не сделать, Техностиль стоит.» [32:15]', decision: 'Зафиксирован срок предоставления данных от проектировщика — 24.02.2026.', responsible: 'Сидоров К.Л.', deadline: '24.02.2026', drivers: [{ type: 'root_cause', text: 'Строго последовательный процесс: раскладка панелей не начинается до завершения проектирования МК' }], hypothesis: 'При задержке выдачи данных более 3 дней — смещение критического пути по монтажу панелей на 1.5-2 недели.' },
    { id: 'R5', title: 'Закупка муфт для кабеля 20кВ заблокирована несогласованным типом кабеля', cat: 'Строительные', score: 9, prob: 3, impact: 3, desc: 'Поставщик кабельных муфт согласован, однако закупка не может быть произведена — не принято окончательное решение по типу самого кабеля. Эта зависимость останавливает процесс закупки сопутствующих материалов.', evidence: '«Муфты готовы заказать, но без решения по кабелю — смысла нет, не те муфты возьмём.» [48:30]', decision: 'Отложить закупку муфт до момента согласования типа кабеля. Вопрос на контроле.', responsible: 'Иванов А.С.', deadline: '28.02.2026', drivers: [{ type: 'root_cause', text: 'Решение по типу кабеля зависит от одного сотрудника, который не определился' }, { type: 'aggravator', text: 'Длительный срок поставки муфт (4-6 недель) усугубляет последствия задержки' }], hypothesis: 'Каждая неделя задержки решения по кабелю = неделя задержки пусконаладочных работ электроснабжения.' },
    { id: 'R8', title: 'Неполный комплект исполнительной документации к сдаче', cat: 'Управленческие', score: 4, prob: 2, impact: 2, desc: 'Подрядчик не может предоставить полный комплект исполнительной документации к установленному сроку, в частности отсутствуют исполнительные схемы по металлоконструкциям.', evidence: '«ИД будет выложена кроме схем. По схемам — будет гарантийное письмо.» [01:35]', decision: 'Подрядчик предоставит гарантийное письмо с точным сроком подготовки схем (до конца февраля). Остальная ИД загружается до 23.02.', responsible: 'Иванов А.С.', deadline: '23.02.2026', drivers: [{ type: 'root_cause', text: 'Исполнительные схемы требуют геодезических замеров, которые не были выполнены вовремя' }], hypothesis: 'Отсутствие ИД не блокирует текущие работы, но может стать проблемой при итоговой приёмке объекта.' },
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
          <div><div className="text-[0.85rem] font-bold">RISK BRIEF</div><div className="text-[0.7rem] text-slate-400">Проект ARGO (1234) · Строительство</div></div>
        </div>
        <div className="text-right">
          <div className="text-[0.7rem] text-slate-400">17.02.2026 · 1:31:09</div>
          <span className="px-2 py-0.5 rounded text-[0.65rem] font-bold bg-red-500/20 text-red-400">КРИТИЧЕСКИЙ</span>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Block 2: Participants */}
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="text-[0.68rem] font-bold text-slate-500 uppercase tracking-wider mb-3">Участники совещания</div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { org: 'Заказчик', persons: ['Морозов Д.А.', 'Соколов Р.В.', 'Белова А.И.'] },
              { org: 'Тех. заказчик', persons: ['Хроменок Н.В. (РП)', 'Орлов П.С. (ГИП)', 'Козлова Е.А. (АП)'] },
              { org: 'Генподрядчик', persons: ['Иванов А.С.', 'Федорова Е.А.', 'Куликова А.С.'] },
              { org: 'Проектировщик', persons: ['Волкова Е.А. (ГАП)', 'Сидоров К.Л.', 'Григорьев А.Н.'] },
            ].map(g => (
              <div key={g.org}>
                <div className="text-[0.65rem] font-bold text-slate-400 uppercase mb-1">{g.org}</div>
                <div className="flex gap-1.5 flex-wrap">{g.persons.map(p => <span key={p} className="px-2 py-0.5 bg-white border border-slate-200 rounded-md text-[0.7rem] text-slate-700">{p}</span>)}</div>
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

        {/* Block 8: Glossary */}
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="text-[0.68rem] font-bold text-slate-500 uppercase tracking-wider mb-2">Глоссарий</div>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-[0.7rem]">
            {[['ИД', 'Исполнительная документация'], ['КПП', 'Контрольно-пропускной пункт'], ['АБК', 'Административно-бытовой корпус'], ['КМД', 'Конструкции металлические деталировочные'], ['БРТП', 'Блочная распред. трансформаторная подстанция'], ['ХБК', 'Хозяйственно-бытовой корпус'], ['СМР', 'Строительно-монтажные работы'], ['МК', 'Металлоконструкции']].map(([a, b]) => (
              <span key={a} className="text-slate-500"><strong className="text-slate-700">{a}</strong> — {b}</span>
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
        <div className="text-[0.78rem] text-slate-400">Проект ARGO (1234) / 17.02.2026 / Домен: Строительство</div>
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
        <div className="text-[0.82rem] font-semibold text-slate-800 mb-2">Участники и эмоции</div>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead><tr className="text-[0.65rem] text-slate-400 uppercase tracking-wider bg-slate-50"><th className="text-left px-4 py-2 font-semibold">Спикер</th><th className="text-left px-4 py-2 font-semibold">Время</th><th className="text-left px-4 py-2 font-semibold">Эмоция</th><th className="text-left px-4 py-2 font-semibold">Интерпретация</th></tr></thead>
            <tbody>{[
              { s: 'Хроменок Н.В.', t: '28:15', e: 'Нейтральная', ei: 'Деловой тон, контроль повестки' },
              { s: 'Иванов А.С.', t: '22:40', e: 'Раздражение', ei: 'Повышенный тон при обсуждении сроков' },
              { s: 'Петров К.Л.', t: '18:30', e: 'Спокойная', ei: 'Конструктивные предложения' },
              { s: 'Козлова Е.А.', t: '8:45', e: 'Нейтральная', ei: 'Фиксация решений' },
              { s: 'Сидоров К.Л.', t: '5:35', e: 'Тревожная', ei: 'Опасения по качеству' },
            ].map(p => (
              <tr key={p.s} className="border-t border-slate-100 text-[0.75rem]">
                <td className="px-4 py-2 font-medium text-slate-700">{p.s}</td>
                <td className="px-4 py-2 text-slate-500 font-mono">{p.t}</td>
                <td className="px-4 py-2"><span className={`px-2 py-0.5 rounded text-[0.65rem] font-medium ${p.e === 'Раздражение' ? 'bg-red-100 text-red-600' : p.e === 'Тревожная' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>{p.e}</span></td>
                <td className="px-4 py-2 text-slate-500">{p.ei}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
      <div className="mb-5">
        <div className="text-[0.82rem] font-semibold text-slate-800 mb-2">Краткое содержание</div>
        <div className="text-[0.78rem] text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-4">
          Производственное совещание по проекту ARGO. Обсуждены критические вопросы: задержка поставки металлоконструкций (перенос на 2 недели), отклонения по кладке корпуса 2 (нарушение СП 70.13330), нехватка бригад на монолитных работах. Принят ряд решений по мобилизации ресурсов и контролю качества.
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
  const tasks = [
    { n: 1, conf: 'Явная', pri: 'Высокий', cat: 'ИРД', task: 'Подготовить гарантийное письмо с точным сроком предоставления недостающих исполнительных схем', resp: 'Иванов А.С.', deadline: '18.02.2026', time: '01:11' },
    { n: 2, conf: 'Явная', pri: 'Высокий', cat: 'ИРД', task: 'Выгрузить всю готовую ИД (акты, сертификаты) за исключением исполнительных схем', resp: 'Иванов А.С.', deadline: '23.02.2026', time: '01:35' },
    { n: 3, conf: 'Явная', pri: 'Высокий', cat: 'Проект. и РД', task: 'Завершить согласование чертежей КМД по металлоконструкциям корпуса Б', resp: 'Сидоров К.Л.', deadline: '18.02.2026', time: '07:59' },
    { n: 4, conf: 'Явная', pri: 'Высокий', cat: 'Проект. и РД', task: 'Проверить и согласовать раскладку сэндвич-панелей для корпуса Б', resp: 'Волкова Е.А.', deadline: '20.02.2026', time: '17:31' },
    { n: 5, conf: 'Явная', pri: 'Критический', cat: 'Проект. и РД', task: 'Решить вопрос с проектированием «уголка» для наружных стен склада — стоп-фактор', resp: 'Сидоров К.Л.', deadline: '17.02.2026', time: '24:11' },
    { n: 6, conf: 'Явная', pri: 'Высокий', cat: 'Проект. и РД', task: 'Предоставить данные по МК для разработки раскладки стен АБК', resp: 'Григорьев А.Н.', deadline: '24.02.2026', time: '19:56' },
    { n: 7, conf: 'Явная', pri: 'Средний', cat: 'СМР', task: 'Завершить работы по фундаментам №6, №7 и №8', resp: 'Иванов А.С.', deadline: '27.02.2026', time: '03:34' },
    { n: 8, conf: 'Явная', pri: 'Средний', cat: 'СМР', task: 'Обеспечить поставку профлиста для кровли корпуса А', resp: 'Иванов А.С.', deadline: '15.03.2026', time: '14:56' },
    { n: 9, conf: 'Из контекста', pri: 'Средний', cat: 'СМР', task: 'Выполнить устройство песчаного основания под фундамент ХБК и приступить к подбетонке', resp: '—', deadline: '21.02.2026', time: '04:06' },
    { n: 10, conf: 'Явная', pri: 'Средний', cat: 'Финансы', task: 'Завершить тендер и определить подрядчика на устройство витражей', resp: 'Федорова Е.А.', deadline: '22.02.2026', time: '18:22' },
    { n: 11, conf: 'Явная', pri: 'Низкий', cat: 'Организация', task: 'К следующему совещанию подготовить данные по поставленным панелям в кв.м, а не в «машинах»', resp: 'Иванов А.С.', deadline: '—', time: '12:00' },
  ]
  const priColor: Record<string, string> = { 'Критический': 'bg-red-100 text-red-600', 'Высокий': 'bg-amber-100 text-amber-600', 'Средний': 'bg-blue-100 text-blue-600', 'Низкий': 'bg-slate-100 text-slate-500' }
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-200">
        <span className="text-[0.82rem] font-semibold text-slate-700">Задачи и поручения</span>
        <div className="flex items-center gap-2">
          <span className="text-[0.7rem] text-slate-400">{tasks.length} задач · 1:31:09</span>
          <button className="flex items-center gap-1.5 px-3 py-1 bg-green-50 border border-green-200 rounded-lg text-[0.7rem] text-green-600 font-medium cursor-pointer hover:bg-green-100 transition-colors"><I.Download /> .xlsx</button>
        </div>
      </div>
      <table className="w-full">
        <thead><tr className="text-[0.6rem] text-slate-400 uppercase tracking-wider"><th className="text-left px-4 py-2 font-semibold w-8">#</th><th className="text-left px-3 py-2 font-semibold">Приоритет</th><th className="text-left px-3 py-2 font-semibold">Категория</th><th className="text-left px-3 py-2 font-semibold">Задача</th><th className="text-left px-3 py-2 font-semibold">Ответств.</th><th className="text-left px-3 py-2 font-semibold">Срок</th><th className="text-left px-3 py-2 font-semibold">Время</th></tr></thead>
        <tbody>{tasks.map((t, i) => (
          <tr key={t.n} className={`border-t border-slate-100 text-[0.72rem] ${i % 2 ? 'bg-slate-50/50' : ''}`}>
            <td className="px-4 py-2 text-slate-400 font-mono">{t.n}</td>
            <td className="px-3 py-2"><span className={`px-1.5 py-0.5 rounded text-[0.6rem] font-bold ${priColor[t.pri]}`}>{t.pri}</span></td>
            <td className="px-3 py-2 text-slate-500">{t.cat}</td>
            <td className="px-3 py-2 text-slate-700 max-w-[300px]">{t.task}</td>
            <td className="px-3 py-2 text-slate-600 font-medium whitespace-nowrap">{t.resp}</td>
            <td className="px-3 py-2 text-slate-500 font-mono whitespace-nowrap">{t.deadline}</td>
            <td className="px-3 py-2 text-slate-400 font-mono">[{t.time}]</td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  )
}

/* ── Transcript ── */
function Transcript() {
  const segments = [
    { time: '00:00', speaker: 'Спикер 1', text: 'Добрый день, коллеги. Начинаем производственное совещание по проекту ARGO. Повестка у всех есть, предлагаю начать с вопроса по металлоконструкциям.', lang: 'RU', emotion: 'Нейтральная' },
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

/* ===== DASHBOARD ===== */
function PgDashboard() {
  const [project, setProject] = useState<string | null>(null)
  const projects = [
    { code: '1234', name: 'ARGO', health: 'critical', reports: 12, lastDate: '17.02' },
    { code: '2001', name: 'ВОСТОК', health: 'attention', reports: 8, lastDate: '15.02' },
    { code: '3045', name: 'САТУРН', health: 'stable', reports: 15, lastDate: '16.02' },
    { code: '4102', name: 'АЛЬФА', health: 'stable', reports: 6, lastDate: '14.02' },
  ]
  const healthColor = (h: string) => h === 'critical' ? '#EF4444' : h === 'attention' ? '#F59E0B' : '#10B981'

  const attentionItems = [
    { severity: 'critical', text: 'Задержка поставки МК — перенос на 2 недели', rec: 'Запросить альтернативного поставщика', project: 'ARGO', status: 'new' },
    { severity: 'critical', text: 'Отклонения кладки корп. 2 выше допуска СП', rec: 'Геодезическая съёмка и акт', project: 'ARGO', status: 'new' },
    { severity: 'attention', text: 'Нехватка бригад на монолитные работы (2/5)', rec: 'Претензия генподрядчику', project: 'ARGO', status: 'new' },
    { severity: 'attention', text: 'Задержка согласования РД по секции В', rec: 'Эскалация на ГИП проектировщика', project: 'ВОСТОК', status: 'done' },
  ]

  /* Calendar meetings data */
  type Meeting = { project: string; code: string; file: string; severity: string }
  const meetings: Record<number, Meeting[]> = {
    3: [{ project: 'ARGO', code: '1234', file: 'weekly_sync.mp3', severity: 'stable' }],
    5: [{ project: 'ВОСТОК', code: '2001', file: 'design_review.mp4', severity: 'stable' }],
    7: [{ project: 'ARGO', code: '1234', file: 'site_inspection.mp3', severity: 'attention' }, { project: 'САТУРН', code: '3045', file: 'progress_report.mp4', severity: 'stable' }],
    10: [{ project: 'ARGO', code: '1234', file: 'contractor_meeting.mp4', severity: 'attention' }],
    12: [{ project: 'ARGO', code: '1234', file: 'quality_review.mp4', severity: 'critical' }, { project: 'ВОСТОК', code: '2001', file: 'coord_meeting.mp3', severity: 'attention' }],
    14: [{ project: 'САТУРН', code: '3045', file: 'weekly_sync.mp3', severity: 'stable' }],
    17: [{ project: 'ARGO', code: '1234', file: 'production_meeting.mp4', severity: 'critical' }],
    19: [{ project: 'ВОСТОК', code: '2001', file: 'budget_review.mp4', severity: 'stable' }],
    21: [{ project: 'АЛЬФА', code: '4102', file: 'kickoff.mp4', severity: 'stable' }],
    24: [{ project: 'ARGO', code: '1234', file: 'weekly_sync.mp3', severity: 'attention' }, { project: 'САТУРН', code: '3045', file: 'site_walk.mp4', severity: 'stable' }],
    26: [{ project: 'ВОСТОК', code: '2001', file: 'design_session.mp4', severity: 'stable' }],
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
          <div className="text-[0.78rem] font-semibold text-slate-700 mb-2">Мои проекты</div>
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
    { id: 'j-847', file: 'meeting_corp3.mp4', project: '1234', stage: 'Транскрибация', progress: 45, user: 'ivanov@company.ru' },
    { id: 'j-846', file: 'weekly_sync.mp3', project: '2001', stage: 'В очереди', progress: 0, user: 'petrova@company.ru' },
  ]
  const completed = [
    { id: 'j-845', file: 'production_17_02.mp4', status: 'done', project: '1234', user: 'khromenok@company.ru', time: '4:12' },
    { id: 'j-844', file: 'site_inspection.mp3', status: 'done', project: '3045', user: 'sidorov@company.ru', time: '2:38' },
    { id: 'j-843', file: 'budget_review.mp4', status: 'error', project: '2001', user: 'kozlova@company.ru', time: '--', error: 'GPU OOM' },
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
  const [statTab, setStatTab] = useState<'usage' | 'models' | 'domains' | 'costs'>('usage')
  const days = ['10.02', '11.02', '12.02', '13.02', '14.02', '15.02', '16.02']
  const vals = [5, 3, 7, 4, 6, 2, 8]
  const max = Math.max(...vals)
  return (<>
    <div className="flex gap-2 mb-4">
      <TabBtn active={statTab === 'usage'} onClick={() => setStatTab('usage')}>Использование</TabBtn>
      <TabBtn active={statTab === 'models'} onClick={() => setStatTab('models')}>ML-модели</TabBtn>
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
    {statTab === 'models' && (
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="text-[0.82rem] font-semibold text-slate-700 mb-3">Производительность ML-моделей</div>
        <div className="space-y-3">
          {[
            { name: 'WhisperX large-v3', metric: 'WER', val: '4.2%', avg: '2.8 мин', calls: 347 },
            { name: 'pyannote 3.1', metric: 'DER', val: '8.1%', avg: '1.2 мин', calls: 347 },
            { name: 'wav2vec2-emotion', metric: 'Accuracy', val: '87.3%', avg: '0.8 мин', calls: 334 },
            { name: 'LLM Generation', metric: 'Quality', val: '94.5%', avg: '1.5 мин', calls: 334 },
            { name: 'Silero VAD', metric: 'F1', val: '96.2%', avg: '0.3 мин', calls: 347 },
          ].map(m => (
            <div key={m.name} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
              <div className="flex-1"><div className="text-[0.78rem] font-medium text-slate-700">{m.name}</div><div className="text-[0.65rem] text-slate-400">{m.calls} вызовов · ср. {m.avg}</div></div>
              <div className="text-right"><div className="text-[0.78rem] font-bold text-slate-800">{m.val}</div><div className="text-[0.6rem] text-slate-400">{m.metric}</div></div>
            </div>
          ))}
        </div>
      </div>
    )}
    {statTab === 'domains' && (
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="text-[0.82rem] font-semibold text-slate-700 mb-3">Использование по доменам</div>
        <div className="space-y-3">
          {[{ d: 'Строительство', v: 234, pct: 67, risk: 45 }, { d: 'ДЦТ', v: 78, pct: 23, risk: 12 }, { d: 'HR', v: 35, pct: 10, risk: 0 }].map(d => (
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
      <div className="grid grid-cols-2 gap-4">
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
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="text-[0.82rem] font-semibold text-slate-700 mb-3">GPU utilization</div>
          <div className="space-y-2">
            {[{ l: 'GPU 0 (A100)', v: '67%', temp: '72°C' }, { l: 'VRAM', v: '31.2 / 80 GB', temp: '' }, { l: 'Задачи GPU сегодня', v: '14', temp: '' }].map(g => (
              <div key={g.l} className="flex items-center justify-between text-[0.75rem]">
                <span className="text-slate-500">{g.l}</span>
                <div><span className="font-bold text-slate-800">{g.v}</span>{g.temp && <span className="text-slate-400 ml-2">{g.temp}</span>}</div>
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
    { name: 'Хроменок Н.В.', email: 'khromenok@company.ru', role: 'admin', domains: ['Строительство', 'ДЦТ'], active: true },
    { name: 'Иванов А.С.', email: 'ivanov@company.ru', role: 'manager', domains: ['Строительство'], active: true },
    { name: 'Петрова М.В.', email: 'petrova@company.ru', role: 'viewer', domains: ['ДЦТ'], active: true },
    { name: 'Сидоров К.Л.', email: 'sidorov@company.ru', role: 'user', domains: ['Строительство'], active: true },
    { name: 'Козлова Е.А.', email: 'kozlova@company.ru', role: 'user', domains: ['Строительство'], active: true },
    { name: 'Васин В.И.', email: 'vasin@company.ru', role: 'admin', domains: ['Строительство', 'ДЦТ', 'HR'], active: true },
  ]
  const roleBadge: Record<string, string> = { admin: 'bg-red-100 text-red-600', manager: 'bg-purple-100 text-purple-600', viewer: 'bg-blue-100 text-blue-500', user: 'bg-slate-100 text-slate-500' }
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-200">
        <span className="text-[0.82rem] font-semibold text-slate-700">{users.length} пользователей</span>
        <button className="px-3 py-1.5 bg-[#E52713] text-white rounded-lg text-[0.75rem] font-medium border-none cursor-pointer hover:bg-[#E52713]/90 transition-colors">+ Создать</button>
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
    { code: '1234', name: 'ARGO', domain: 'Строительство', users: 8, reports: 12, status: 'active' },
    { code: '2001', name: 'ВОСТОК', domain: 'Строительство', users: 5, reports: 8, status: 'active' },
    { code: '3045', name: 'САТУРН', domain: 'ДЦТ', users: 4, reports: 15, status: 'active' },
    { code: '4102', name: 'АЛЬФА', domain: 'Строительство', users: 3, reports: 6, status: 'active' },
    { code: '5001', name: 'HR-RECRUIT', domain: 'HR', users: 2, reports: 35, status: 'active' },
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
