import { useState } from 'react'
import { Car, MapPin, Clock, Plus } from 'lucide-react'
import SubScreenHeader from './SubScreenHeader'
import { parkingSpot, parkingEvents } from '../../data/sminex'

interface ParkingScreenProps {
  onBack: () => void
  onToast: (msg: string) => void
}

export default function ParkingScreen({ onBack, onToast }: ParkingScreenProps) {
  const [guestRequested, setGuestRequested] = useState(false)
  const [guestPlate, setGuestPlate] = useState('')
  const [showGuestForm, setShowGuestForm] = useState(false)

  const handleRequestGuest = () => {
    if (!guestPlate.trim()) return
    setGuestRequested(true)
    setShowGuestForm(false)
    onToast(`Гостевое место для ${guestPlate.trim()} запрошено`)
  }

  return (
    <div className="flex-1 overflow-y-auto animate-[fadeIn_0.2s_ease-out]">
      <SubScreenHeader title="Парковка" onBack={onBack} />

      <div className="px-5 pb-6 space-y-4">
        {/* Your spot */}
        <div className="bg-[#1D252D] rounded-2xl p-5 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
              <Car className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-[10px] text-white/50 font-medium">Ваше место</p>
              <p className="text-2xl font-bold">№{parkingSpot.number}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-1 bg-white/10 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <MapPin className="w-3 h-3 text-white/50" />
                <span className="text-[10px] text-white/50">Уровень</span>
              </div>
              <p className="text-sm font-bold">{parkingSpot.level}</p>
            </div>
            <div className="flex-1 bg-white/10 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Car className="w-3 h-3 text-white/50" />
                <span className="text-[10px] text-white/50">Статус</span>
              </div>
              <p className="text-sm font-bold">
                {parkingSpot.status === 'free' ? 'Свободно' : 'Занято'}
              </p>
            </div>
          </div>
        </div>

        {/* Guest parking */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-bold text-[#1D252D]">Гостевая парковка</h2>
            {!guestRequested && (
              <button
                onClick={() => setShowGuestForm(!showGuestForm)}
                className="w-7 h-7 rounded-full bg-[#1D252D] flex items-center justify-center text-white"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>

          {showGuestForm && (
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 mb-3 animate-[fadeIn_0.15s_ease-out]">
              <p className="text-xs font-semibold text-[#1D252D]/50 mb-2">Запрос гостевого места</p>
              <input
                type="text"
                placeholder="Госномер (напр. А777АА)"
                value={guestPlate}
                onChange={e => setGuestPlate(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleRequestGuest()}
                className="w-full bg-[#F5F1EC] rounded-xl px-3 py-2.5 text-sm text-[#1D252D] placeholder:text-[#1D252D]/30 mb-2 focus:outline-none focus:ring-2 focus:ring-[#8B7355]/30"
              />
              <button
                onClick={handleRequestGuest}
                disabled={!guestPlate.trim()}
                className="w-full bg-[#1D252D] text-white rounded-full py-2.5 text-xs font-semibold disabled:opacity-30 hover:opacity-90 transition-opacity"
              >
                Запросить место
              </button>
            </div>
          )}

          {guestRequested && (
            <div className="bg-green-50 rounded-2xl p-4 border border-green-100 mb-3 animate-[fadeIn_0.15s_ease-out]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Car className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-green-800">Гостевое место запрошено</p>
                  <p className="text-[10px] text-green-600">{guestPlate} · Уровень B1</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Events */}
        <div>
          <h2 className="text-xs font-bold text-[#1D252D] mb-2">События</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-50 divide-y divide-gray-50">
            {parkingEvents.map(event => (
              <div key={event.id} className="flex items-center gap-3 px-4 py-3">
                <div className="w-7 h-7 rounded-full bg-[#F5F1EC] flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5 text-[#8B7355]" />
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
