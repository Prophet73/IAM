import { useState } from 'react'
import { Bell, Moon, Info, LogOut, ArrowLeftRight } from 'lucide-react'
import { type UserProfile, complexes } from '../../data/sminex'

interface ProfileScreenProps {
  user: UserProfile
  onSwitchRole: () => void
}

export default function ProfileScreen({ user, onSwitchRole }: ProfileScreenProps) {
  const complexName = user.complexId
    ? complexes.find(c => c.id === user.complexId)?.name
    : undefined

  const [notifOn, setNotifOn] = useState(true)
  const [darkOn, setDarkOn] = useState(false)

  return (
    <div className="flex-1 overflow-y-auto animate-[fadeIn_0.2s_ease-out]">
      <div className="px-5 pt-6 pb-6 space-y-5">
        {/* Avatar + info */}
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-[#1D252D] flex items-center justify-center text-white text-2xl font-bold mb-3">
            {user.initials}
          </div>
          <p className="text-lg font-bold text-[#1D252D]">{user.name}</p>
          <p className="text-xs text-[#8B7355] font-medium">{user.roleLabel}</p>
        </div>

        {/* Info card */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 space-y-3">
          {complexName && (
            <InfoRow label="Жилой комплекс" value={complexName} />
          )}
          {user.apartment && (
            <InfoRow label="Квартира" value={user.apartment} />
          )}
          {user.position && (
            <InfoRow label="Должность" value={user.position} />
          )}
          {user.phone && (
            <InfoRow label="Телефон" value={user.phone} />
          )}
        </div>

        {/* Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-50 overflow-hidden">
          <SettingRow icon={Bell} label="Уведомления" isOn={notifOn} onToggle={() => setNotifOn(!notifOn)} />
          <SettingRow icon={Moon} label="Тёмная тема" isOn={darkOn} onToggle={() => setDarkOn(!darkOn)} />
          <SettingRow icon={Info} label="О приложении" value="v2.0 demo" />
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={onSwitchRole}
            className="w-full bg-white text-[#1D252D] rounded-full py-3 text-sm font-semibold border border-gray-200 transition-colors hover:bg-gray-50 flex items-center justify-center gap-2 active:scale-[0.97]"
          >
            <ArrowLeftRight className="w-4 h-4" />
            Сменить роль
          </button>
          <button
            onClick={onSwitchRole}
            className="w-full text-red-500 rounded-full py-3 text-sm font-semibold transition-colors hover:bg-red-50 flex items-center justify-center gap-2 active:scale-[0.97]"
          >
            <LogOut className="w-4 h-4" />
            Выйти
          </button>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-[#1D252D]/40">{label}</span>
      <span className="text-xs font-medium text-[#1D252D]">{value}</span>
    </div>
  )
}

function SettingRow({ icon: Icon, label, isOn, onToggle, value }: {
  icon: typeof Bell
  label: string
  isOn?: boolean
  onToggle?: () => void
  value?: string
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4 text-[#1D252D]/40" />
        <span className="text-sm text-[#1D252D]">{label}</span>
      </div>
      {onToggle !== undefined ? (
        <button
          onClick={onToggle}
          className={`w-11 h-[26px] rounded-full relative transition-colors duration-300 ${isOn ? 'bg-[#1D252D]' : 'bg-gray-200'}`}
        >
          <div className={`absolute top-[3px] w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300 ${isOn ? 'left-[22px]' : 'left-[3px]'}`} />
        </button>
      ) : (
        <span className="text-xs text-[#1D252D]/40">{value}</span>
      )}
    </div>
  )
}
