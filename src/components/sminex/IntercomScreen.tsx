import { useState } from 'react'
import { Video, Plus, UserCheck, LogIn, Package, Users } from 'lucide-react'
import SubScreenHeader from './SubScreenHeader'
import { guestPasses, entryEvents, type GuestPass } from '../../data/sminex'

interface IntercomScreenProps {
  onBack: () => void
  onToast: (msg: string) => void
}

export default function IntercomScreen({ onBack, onToast }: IntercomScreenProps) {
  const [doorOpen, setDoorOpen] = useState(false)
  const [doorTimer, setDoorTimer] = useState(0)
  const [passes, setPasses] = useState<GuestPass[]>(guestPasses)
  const [showNewPass, setShowNewPass] = useState(false)
  const [newGuestName, setNewGuestName] = useState('')

  const handleOpenDoor = () => {
    if (doorOpen) return
    setDoorOpen(true)
    setDoorTimer(5)
    const interval = setInterval(() => {
      setDoorTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          setDoorOpen(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleCreatePass = () => {
    if (!newGuestName.trim()) return
    const newPass: GuestPass = {
      id: `gp-${Date.now()}`,
      guestName: newGuestName.trim(),
      date: '26.02.2026',
      timeRange: '12:00–23:00',
      status: 'active',
    }
    setPasses(prev => [newPass, ...prev])
    setNewGuestName('')
    setShowNewPass(false)
    onToast(`Пропуск для ${newPass.guestName} создан`)
  }

  const entryIcon = (type: string) => {
    switch (type) {
      case 'entry': return <LogIn className="w-3.5 h-3.5 text-green-600" />
      case 'exit': return <LogIn className="w-3.5 h-3.5 text-[#1D252D]/40 rotate-180" />
      case 'delivery': return <Package className="w-3.5 h-3.5 text-blue-600" />
      case 'guest': return <Users className="w-3.5 h-3.5 text-amber-600" />
      default: return null
    }
  }

  const passStatusLabel: Record<string, string> = { active: 'Активен', used: 'Использован', expired: 'Истёк' }
  const passStatusColor: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    used: 'bg-gray-100 text-gray-500',
    expired: 'bg-red-100 text-red-500',
  }

  return (
    <div className="flex-1 overflow-y-auto animate-[fadeIn_0.2s_ease-out]">
      <SubScreenHeader title="Домофон" onBack={onBack} />

      <div className="px-5 pb-6 space-y-4">
        {/* Video feed mock */}
        <div className="relative rounded-2xl overflow-hidden h-44 bg-gradient-to-br from-[#1D252D] to-[#3a4a5a] flex items-center justify-center">
          <Video className="w-12 h-12 text-white/20" />
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-bold text-white/80">LIVE</span>
          </div>
          <p className="absolute bottom-3 left-3 text-[10px] text-white/50">Подъезд 2 · Камера входа</p>
        </div>

        {/* Open door button */}
        <button
          onClick={handleOpenDoor}
          disabled={doorOpen}
          className={`w-full py-3.5 rounded-full text-sm font-semibold transition-all active:scale-[0.97] ${
            doorOpen
              ? 'bg-green-500 text-white'
              : 'bg-[#1D252D] text-white hover:opacity-90'
          }`}
        >
          {doorOpen ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              Дверь открыта · {doorTimer}с
            </span>
          ) : (
            'Открыть дверь'
          )}
        </button>

        {/* Guest passes */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-[#1D252D]">Гостевые пропуска</h2>
            <button
              onClick={() => setShowNewPass(!showNewPass)}
              className="w-7 h-7 rounded-full bg-[#1D252D] flex items-center justify-center text-white"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {showNewPass && (
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 mb-3 animate-[fadeIn_0.15s_ease-out]">
              <p className="text-xs font-semibold text-[#1D252D]/50 mb-2">Новый пропуск</p>
              <input
                type="text"
                placeholder="Имя гостя"
                value={newGuestName}
                onChange={e => setNewGuestName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreatePass()}
                className="w-full bg-[#F5F1EC] rounded-xl px-3 py-2.5 text-sm text-[#1D252D] placeholder:text-[#1D252D]/30 mb-2 focus:outline-none focus:ring-2 focus:ring-[#8B7355]/30"
              />
              <button
                onClick={handleCreatePass}
                disabled={!newGuestName.trim()}
                className="w-full bg-[#1D252D] text-white rounded-full py-2.5 text-xs font-semibold disabled:opacity-30 hover:opacity-90 transition-opacity"
              >
                Создать пропуск
              </button>
            </div>
          )}

          <div className="space-y-2">
            {passes.map(pass => (
              <div key={pass.id} className="bg-white rounded-2xl p-3.5 shadow-sm border border-gray-50 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#F5F1EC] flex items-center justify-center">
                  <UserCheck className="w-4 h-4 text-[#8B7355]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#1D252D] truncate">{pass.guestName}</p>
                  <p className="text-[10px] text-[#1D252D]/40">{pass.date} · {pass.timeRange}</p>
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${passStatusColor[pass.status]}`}>
                  {passStatusLabel[pass.status]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Entry history */}
        <div>
          <h2 className="text-sm font-bold text-[#1D252D] mb-3">История входов</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-50 divide-y divide-gray-50">
            {entryEvents.map(event => (
              <div key={event.id} className="flex items-center gap-3 px-4 py-3">
                <div className="w-7 h-7 rounded-full bg-[#F5F1EC] flex items-center justify-center">
                  {entryIcon(event.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#1D252D] truncate">{event.description}</p>
                </div>
                <span className="text-[10px] text-[#1D252D]/40 shrink-0">{event.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
