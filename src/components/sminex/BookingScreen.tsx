import { useState, type ReactNode } from 'react'
import { Clock, MapPin, CheckCircle2, Calendar, Waves, Dumbbell, Briefcase, Mountain, Puzzle, Film } from 'lucide-react'
import SubScreenHeader from './SubScreenHeader'
import { amenities, type AmenityBooking } from '../../data/sminex'

const amenityIcons: Record<string, ReactNode> = {
  'waves': <Waves className="w-6 h-6" />,
  'dumbbell': <Dumbbell className="w-6 h-6" />,
  'briefcase': <Briefcase className="w-6 h-6" />,
  'mountain': <Mountain className="w-6 h-6" />,
  'puzzle': <Puzzle className="w-6 h-6" />,
  'film': <Film className="w-6 h-6" />,
}

interface BookingScreenProps {
  onBack: () => void
  onToast: (msg: string) => void
}

export default function BookingScreen({ onBack, onToast }: BookingScreenProps) {
  const [selectedAmenity, setSelectedAmenity] = useState<string | null>(null)
  const [bookings, setBookings] = useState<AmenityBooking[]>([])

  const selected = amenities.find(a => a.id === selectedAmenity)

  const handleBook = (amenityId: string, amenityName: string, slotTime: string) => {
    const newBooking: AmenityBooking = {
      id: `bk-${Date.now()}`,
      amenityId,
      amenityName,
      date: '26.02.2026',
      time: slotTime,
      status: 'upcoming',
    }
    setBookings(prev => [newBooking, ...prev])
    setSelectedAmenity(null)
    onToast(`${amenityName} забронировано на ${slotTime}`)
  }

  const formatPrice = (price: number) =>
    price === 0 ? 'Бесплатно' : `${price.toLocaleString('ru-RU')} ₽/ч`

  // Detail view for a selected amenity
  if (selected) {
    return (
      <div className="flex-1 overflow-y-auto animate-[fadeIn_0.2s_ease-out]">
        <SubScreenHeader title={selected.name} onBack={() => setSelectedAmenity(null)} />

        <div className="px-5 pb-6 space-y-4">
          {/* Amenity hero */}
          <div className="bg-gradient-to-br from-[#1D252D] to-[#2a3a4a] rounded-2xl p-5 text-white">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-white mb-3">
              {amenityIcons[selected.icon]}
            </div>
            <h2 className="text-lg font-bold mb-1">{selected.name}</h2>
            <p className="text-xs text-white/60 mb-3">{selected.description}</p>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-white/40" />
                <span className="text-[10px] text-white/50">{selected.location}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-white/40" />
                <span className="text-[10px] text-white/50">{formatPrice(selected.pricePerHour)}</span>
              </div>
            </div>
          </div>

          {/* Date selector (static for demo) */}
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-[#8B7355]" />
            <span className="text-xs font-bold text-[#1D252D]">26 февраля, среда</span>
          </div>

          {/* Time slots */}
          <div>
            <h3 className="text-xs font-bold text-[#1D252D] mb-2">Доступные слоты</h3>
            <div className="grid grid-cols-2 gap-2">
              {selected.slots.map(slot => (
                <button
                  key={slot.id}
                  onClick={() => slot.available && handleBook(selected.id, selected.name, slot.time)}
                  disabled={!slot.available}
                  className={`rounded-2xl p-3.5 text-center transition-all active:scale-[0.97] ${
                    slot.available
                      ? 'bg-white border border-gray-100 hover:border-[#8B7355] hover:shadow-md'
                      : 'bg-gray-50 border border-gray-100 opacity-40'
                  }`}
                >
                  <p className={`text-sm font-bold ${slot.available ? 'text-[#1D252D]' : 'text-gray-400'}`}>
                    {slot.time}
                  </p>
                  <p className={`text-[10px] ${slot.available ? 'text-green-600' : 'text-gray-400'}`}>
                    {slot.available ? 'Свободно' : 'Занято'}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto animate-[fadeIn_0.2s_ease-out]">
      <SubScreenHeader title="Бронирование" onBack={onBack} />

      <div className="px-5 pb-6 space-y-4">
        {/* Active bookings */}
        {bookings.length > 0 && (
          <div>
            <h2 className="text-xs font-bold text-[#1D252D] mb-2">Мои бронирования</h2>
            <div className="space-y-2">
              {bookings.map(booking => (
                <div key={booking.id} className="bg-white rounded-2xl p-3.5 shadow-sm border border-gray-50 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#1D252D]">{booking.amenityName}</p>
                    <p className="text-[10px] text-[#1D252D]/40">{booking.date} · {booking.time}</p>
                  </div>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                    Активно
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Amenity grid */}
        <div>
          <h2 className="text-xs font-bold text-[#1D252D] mb-2">Удобства комплекса</h2>
          <div className="grid grid-cols-2 gap-2.5">
            {amenities.map(amenity => (
              <button
                key={amenity.id}
                onClick={() => setSelectedAmenity(amenity.id)}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 text-left transition-all hover:shadow-md active:scale-[0.97]"
              >
                <div className="w-10 h-10 rounded-xl bg-[#F5F1EC] flex items-center justify-center text-[#8B7355] mb-2">
                  {amenityIcons[amenity.icon]}
                </div>
                <p className="text-xs font-bold text-[#1D252D] mb-0.5">{amenity.name}</p>
                <p className="text-[10px] text-[#1D252D]/40 mb-2">{amenity.description}</p>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-semibold text-[#8B7355]">{formatPrice(amenity.pricePerHour)}</span>
                </div>
                <div className="mt-1.5">
                  <span className="text-[9px] text-green-600 font-medium">
                    {amenity.slots.filter(s => s.available).length} слотов доступно
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
