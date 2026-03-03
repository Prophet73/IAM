import { useState, type ReactNode } from 'react'
import { Thermometer, Lightbulb, Power, Lock, Blinds, Zap, Home, DoorOpen, Sunrise, MoonStar, Sun, Sunset, Film, Moon } from 'lucide-react'
import SubScreenHeader from './SubScreenHeader'
import {
  smartRooms, smartDevices as initialDevices, lightScenes as initialScenes,
  sensors, smartScenarios as initialScenarios,
  type SmartDevice, type LightScene, type SmartScenario,
} from '../../data/sminex'

const scenarioIcons: Record<string, ReactNode> = {
  'home': <Home className="w-5 h-5" />,
  'door-open': <DoorOpen className="w-5 h-5" />,
  'sunrise': <Sunrise className="w-5 h-5" />,
  'moon-star': <MoonStar className="w-5 h-5" />,
}

const sceneIcons: Record<string, ReactNode> = {
  'sun': <Sun className="w-5 h-5" />,
  'sunset': <Sunset className="w-5 h-5" />,
  'film': <Film className="w-5 h-5" />,
  'moon': <Moon className="w-5 h-5" />,
}

interface SmartHomeScreenProps {
  onBack: () => void
}

export default function SmartHomeScreen({ onBack }: SmartHomeScreenProps) {
  const [selectedRoom, setSelectedRoom] = useState('Все')
  const [temperature, setTemperature] = useState(22)
  const [scenarios, setScenarios] = useState<SmartScenario[]>(initialScenarios)
  const [activatingScenario, setActivatingScenario] = useState<string | null>(null)
  const [devices, setDevices] = useState<SmartDevice[]>(initialDevices)
  const [scenes, setScenes] = useState<LightScene[]>(initialScenes)

  const filteredDevices = selectedRoom === 'Все'
    ? devices
    : devices.filter(d => d.room === selectedRoom)

  const filteredSensors = selectedRoom === 'Все'
    ? sensors
    : sensors.filter(s => s.room === selectedRoom)

  const toggleDevice = (id: string) => {
    setDevices(prev => prev.map(d => d.id === id ? { ...d, isOn: !d.isOn } : d))
  }

  const activateScene = (id: string) => {
    setScenes(prev => prev.map(s => ({ ...s, isActive: s.id === id })))
  }

  const deviceIcon = (type: string) => {
    switch (type) {
      case 'light': return <Lightbulb className="w-4 h-4" />
      case 'outlet': return <Power className="w-4 h-4" />
      case 'lock': return <Lock className="w-4 h-4" />
      case 'curtains': return <Blinds className="w-4 h-4" />
      default: return <Power className="w-4 h-4" />
    }
  }

  const activateScenario = (id: string) => {
    setActivatingScenario(id)
    setScenarios(prev => prev.map(s => ({ ...s, isActive: s.id === id })))
    setTimeout(() => setActivatingScenario(null), 1500)
  }

  const tempPercent = ((temperature - 16) / (30 - 16)) * 100

  return (
    <div className="flex-1 overflow-y-auto slide-in-right bg-[#F9F9F8]">
      <SubScreenHeader title="Умный дом" onBack={onBack} />

      <div className="px-5 pb-6 space-y-4">
        {/* Scenarios */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-3.5 h-3.5 text-[#8B7355]" />
            <h3 className="text-xs font-bold text-[#1D252D]">Сценарии</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {scenarios.map(scenario => (
              <button
                key={scenario.id}
                onClick={() => activateScenario(scenario.id)}
                className={`rounded-2xl p-3 text-left transition-all duration-300 active:scale-[0.97] relative overflow-hidden ${
                  scenario.isActive
                    ? 'bg-[#1D252D] text-white shadow-lg'
                    : 'bg-white text-[#1D252D] border border-gray-100'
                }`}
              >
                {/* Active radial glow */}
                {scenario.isActive && (
                  <div className="absolute inset-0 pointer-events-none" style={{
                    background: 'radial-gradient(circle at 30% 30%, rgba(139,115,85,0.25) 0%, transparent 60%)',
                  }} />
                )}
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={scenario.isActive ? 'text-amber-400' : 'text-[#8B7355]'}>{scenarioIcons[scenario.icon]}</span>
                    <span className="text-xs font-bold">{scenario.name}</span>
                  </div>
                  <p className={`text-[9px] leading-tight ${scenario.isActive ? 'text-white/50' : 'text-[#1D252D]/40'}`}>
                    {scenario.description}
                  </p>
                  {activatingScenario === scenario.id && (
                    <div className="mt-1.5 flex items-center gap-1">
                      <span className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                      <span className="text-[9px] text-white/60">Применяю...</span>
                    </div>
                  )}
                  {scenario.isActive && activatingScenario !== scenario.id && (
                    <p className="text-[9px] text-green-400 mt-1">Активен</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Room pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5 scrollbar-hide">
          {smartRooms.map(room => (
            <button
              key={room}
              onClick={() => setSelectedRoom(room)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                selectedRoom === room
                  ? 'bg-[#1D252D] text-white'
                  : 'bg-white text-[#1D252D]/60 border border-gray-100'
              }`}
            >
              {room}
            </button>
          ))}
        </div>

        {/* ── Climate — Control Center style ── */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
          <div className="flex items-center gap-2 mb-3">
            <Thermometer className="w-4 h-4 text-[#8B7355]" />
            <h3 className="text-xs font-bold text-[#1D252D]">Климат</h3>
          </div>
          <div className="flex items-center gap-4 mb-3">
            <span className="text-4xl font-bold text-[#1D252D] tabular-nums leading-none">{temperature}°</span>
            <span className="text-[10px] text-[#1D252D]/40">Целевая<br/>температура</span>
          </div>
          {/* Thick track slider */}
          <div
            className="relative h-12 rounded-2xl bg-gray-200 overflow-hidden cursor-pointer select-none"
            onClick={e => {
              const rect = e.currentTarget.getBoundingClientRect()
              const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
              setTemperature(Math.round(16 + pct * 14))
            }}
          >
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-150 rounded-2xl"
              style={{ width: `${tempPercent}%` }}
            />
            {/* Thumb knob */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-lg border border-gray-200 transition-all duration-150"
              style={{ left: `calc(${tempPercent}% - 16px)` }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[10px] text-[#1D252D]/30">16°C</span>
            <span className="text-[10px] text-[#1D252D]/30">30°C</span>
          </div>
        </div>

        {/* Light scenes */}
        <div>
          <h3 className="text-xs font-bold text-[#1D252D] mb-2">Сцены освещения</h3>
          <div className="grid grid-cols-4 gap-2">
            {scenes.map(scene => (
              <button
                key={scene.id}
                onClick={() => activateScene(scene.id)}
                className={`rounded-2xl p-3 text-center transition-all active:scale-[0.95] ${
                  scene.isActive
                    ? 'bg-[#1D252D] text-white shadow-lg'
                    : 'bg-white text-[#1D252D] border border-gray-100'
                }`}
              >
                <span className={`block mb-1 ${scene.isActive ? 'text-white' : 'text-[#8B7355]'}`}>{sceneIcons[scene.icon]}</span>
                <p className="text-[9px] font-medium leading-tight">{scene.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* ── Devices — HomeKit style ── */}
        <div>
          <h3 className="text-xs font-bold text-[#1D252D] mb-2">Устройства</h3>
          <div className="grid grid-cols-2 gap-2">
            {filteredDevices.map(device => (
              <button
                key={device.id}
                onClick={() => toggleDevice(device.id)}
                className={`rounded-2xl p-3.5 text-left transition-all duration-300 active:scale-[0.97] ${
                  device.isOn
                    ? 'bg-white text-[#1D252D] shadow-[0_4px_24px_rgba(139,115,85,0.18)] border border-[#8B7355]/10'
                    : 'bg-white/60 text-[#1D252D]/60 border border-gray-100/60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${
                    device.isOn ? 'bg-amber-100' : 'bg-gray-100'
                  }`}>
                    <span className={`transition-colors duration-300 ${device.isOn ? 'text-amber-600' : 'text-gray-400'}`}>
                      {deviceIcon(device.type)}
                    </span>
                  </div>
                  {/* iOS toggle */}
                  <div className={`w-[42px] h-[26px] rounded-full relative transition-colors duration-300 shrink-0 ${
                    device.isOn ? 'bg-green-500' : 'bg-gray-300'
                  }`}>
                    <div className={`absolute top-[3px] w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 ${
                      device.isOn ? 'left-[19px]' : 'left-[3px]'
                    }`} />
                  </div>
                </div>
                <p className={`text-xs font-semibold ${device.isOn ? 'text-[#1D252D]' : 'text-[#1D252D]/50'}`}>{device.name}</p>
                <p className={`text-[10px] transition-colors duration-300 ${device.isOn ? 'text-[#1D252D]/40' : 'text-[#1D252D]/25'}`}>
                  {device.room}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Sensors */}
        {filteredSensors.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-[#1D252D] mb-2">Датчики</h3>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-50 divide-y divide-gray-50">
              {filteredSensors.map(sensor => (
                <div key={sensor.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-xs text-[#1D252D]">{sensor.name}</p>
                    <p className="text-[10px] text-[#1D252D]/40">{sensor.room}</p>
                  </div>
                  <span className="text-sm font-bold text-[#1D252D]">{sensor.value}{sensor.unit}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
