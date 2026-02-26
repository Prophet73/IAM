import { useState } from 'react'
import { Thermometer, Droplets, Lightbulb, X } from 'lucide-react'
import SubScreenHeader from './SubScreenHeader'
import type { OwnedProperty, FloorPlanRoom } from '../../data/sminex'

interface FloorPlanScreenProps {
  onBack: () => void
  property: OwnedProperty
}

export default function FloorPlanScreen({ onBack, property }: FloorPlanScreenProps) {
  const [selectedRoom, setSelectedRoom] = useState<FloorPlanRoom | null>(null)

  const roomColor = (room: FloorPlanRoom) => {
    if (selectedRoom?.id === room.id) return 'bg-[#8B7355]/30 border-[#8B7355]'
    if (room.devicesOn > 0) return 'bg-amber-50 border-amber-200'
    return 'bg-[#F5F1EC]/60 border-[#1D252D]/10'
  }

  return (
    <div className="flex-1 overflow-y-auto animate-[fadeIn_0.2s_ease-out]">
      <SubScreenHeader title="Схема квартиры" onBack={onBack} />

      <div className="px-5 pb-6 space-y-4">
        {/* Property info */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#1D252D]">{property.complexName} · кв. {property.apartment}</p>
              <p className="text-[10px] text-[#1D252D]/40">{property.typeLabel} · {property.area} м² · {property.floor} этаж</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-[#1D252D]/40">{property.rooms.length} комнат</p>
            </div>
          </div>
        </div>

        {/* Interactive floor plan */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
          <p className="text-xs font-semibold text-[#1D252D]/50 mb-3">План квартиры</p>
          <div className="relative w-full" style={{ paddingBottom: '100%' }}>
            <div className="absolute inset-0">
              {property.rooms.map(room => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoom(selectedRoom?.id === room.id ? null : room)}
                  className={`absolute border-2 rounded-xl transition-all duration-200 flex flex-col items-center justify-center gap-0.5 hover:shadow-md active:scale-[0.98] ${roomColor(room)}`}
                  style={{
                    left: `${room.x}%`,
                    top: `${room.y}%`,
                    width: `${room.w}%`,
                    height: `${room.h}%`,
                  }}
                >
                  <span className="text-[9px] font-bold text-[#1D252D] leading-tight text-center px-1">
                    {room.name}
                  </span>
                  {room.temperature !== undefined && (
                    <span className="text-[8px] text-[#8B7355] font-medium">{room.temperature}°C</span>
                  )}
                  {room.devicesOn > 0 && (
                    <div className="flex items-center gap-0.5">
                      <Lightbulb className="w-2.5 h-2.5 text-amber-500" />
                      <span className="text-[8px] text-amber-600 font-medium">{room.devicesOn}</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Selected room detail */}
        {selectedRoom && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#8B7355]/20 animate-[fadeIn_0.15s_ease-out]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#1D252D]">{selectedRoom.name}</h3>
              <button onClick={() => setSelectedRoom(null)} className="text-[#1D252D]/30 hover:text-[#1D252D]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {selectedRoom.temperature !== undefined && (
                <div className="bg-[#F5F1EC] rounded-xl p-3 text-center">
                  <Thermometer className="w-4 h-4 text-[#8B7355] mx-auto mb-1" />
                  <p className="text-sm font-bold text-[#1D252D]">{selectedRoom.temperature}°C</p>
                  <p className="text-[8px] text-[#1D252D]/40">Температура</p>
                </div>
              )}
              {selectedRoom.humidity !== undefined && (
                <div className="bg-[#F5F1EC] rounded-xl p-3 text-center">
                  <Droplets className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                  <p className="text-sm font-bold text-[#1D252D]">{selectedRoom.humidity}%</p>
                  <p className="text-[8px] text-[#1D252D]/40">Влажность</p>
                </div>
              )}
              <div className="bg-[#F5F1EC] rounded-xl p-3 text-center">
                <Lightbulb className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                <p className="text-sm font-bold text-[#1D252D]">{selectedRoom.devicesOn}/{selectedRoom.devicesTotal}</p>
                <p className="text-[8px] text-[#1D252D]/40">Устройства</p>
              </div>
            </div>
          </div>
        )}

        {/* Room list summary */}
        <div>
          <h3 className="text-xs font-bold text-[#1D252D] mb-2">Комнаты</h3>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-50 divide-y divide-gray-50">
            {property.rooms.map(room => (
              <button
                key={room.id}
                onClick={() => setSelectedRoom(room)}
                className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${
                  selectedRoom?.id === room.id ? 'bg-[#F5F1EC]' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${room.devicesOn > 0 ? 'bg-amber-400' : 'bg-gray-200'}`} />
                  <span className="text-xs font-medium text-[#1D252D]">{room.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  {room.temperature !== undefined && (
                    <span className="text-[10px] text-[#1D252D]/40">{room.temperature}°C</span>
                  )}
                  {room.devicesOn > 0 && (
                    <span className="text-[10px] text-amber-600 font-medium">{room.devicesOn} вкл</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
