import { Bell, CheckCircle, AlertTriangle, Star, Info } from 'lucide-react'
import { type Notification, type UserRole } from '../../data/sminex'

interface NotificationsScreenProps {
  notifications: Notification[]
  userRole: UserRole
}

const typeIcons = {
  status_change: AlertTriangle,
  assigned: Info,
  completed: CheckCircle,
  rate: Star,
  info: Bell,
}

const typeColors = {
  status_change: 'bg-amber-100 text-amber-600',
  assigned: 'bg-blue-100 text-blue-600',
  completed: 'bg-green-100 text-green-600',
  rate: 'bg-purple-100 text-purple-600',
  info: 'bg-gray-100 text-gray-600',
}

export default function NotificationsScreen({ notifications, userRole }: NotificationsScreenProps) {
  const filtered = notifications.filter(n => n.forRole.includes(userRole))

  return (
    <div className="flex-1 overflow-y-auto animate-[fadeIn_0.2s_ease-out]">
      <div className="px-5 pt-4 pb-6 space-y-4">
        <h1 className="text-xl font-bold text-[#1D252D]">Уведомления</h1>

        {filtered.length === 0 ? (
          <div className="text-center py-12 text-[#1D252D]/40 text-sm">Нет уведомлений</div>
        ) : (
          <div className="space-y-2">
            {filtered.map((notif, i) => {
              const Icon = typeIcons[notif.type]
              const colorClass = typeColors[notif.type]
              return (
                <div
                  key={notif.id}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 flex items-start gap-3 transition-shadow hover:shadow-md"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#1D252D] leading-relaxed">{notif.text}</p>
                    <p className="text-[10px] text-[#1D252D]/40 mt-1">{notif.time}</p>
                  </div>
                  {!notif.read && (
                    <div className="w-2 h-2 rounded-full bg-[#8B7355] shrink-0 mt-1.5" />
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
