import { useState } from 'react'
import { ChevronLeft, Send, Star } from 'lucide-react'
import {
  complexes, statusColors, statusLabels, priorityLabels, priorityColors,
  requestTypeIcons, requestTypeColors,
  type ServiceRequest, type UserProfile,
} from '../../data/sminex'

interface RequestDetailScreenProps {
  request: ServiceRequest
  user: UserProfile
  onBack: () => void
  onTakeInWork: (requestId: string) => void
  onCloseRequest: (requestId: string) => void
  onAssign: (requestId: string) => void
  onRate: (requestId: string, rating: number) => void
  onSendMessage: (requestId: string, text: string) => void
}

export default function RequestDetailScreen({
  request, user, onBack,
  onTakeInWork, onCloseRequest, onAssign, onRate, onSendMessage,
}: RequestDetailScreenProps) {
  const [message, setMessage] = useState('')
  const [hoverRating, setHoverRating] = useState(0)
  const complexName = complexes.find(c => c.id === request.complexId)?.name ?? request.complexId
  const TypeIcon = requestTypeIcons[request.type]
  const typeColor = requestTypeColors[request.type] || 'bg-gray-100 text-gray-600'

  const handleSend = () => {
    if (!message.trim()) return
    onSendMessage(request.id, message.trim())
    setMessage('')
  }

  const isManager = user.role === 'manager' || user.role === 'director'
  const isResident = user.role === 'resident'
  const canRate = isResident && request.status === 'completed' && !request.rating

  return (
    <div className="flex-1 overflow-y-auto animate-[fadeIn_0.2s_ease-out]">
      <div className="px-5 pt-3 pb-6 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-[#1D252D]/50 hover:text-[#1D252D] transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-[#1D252D]">#{request.number}</h1>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColors[request.status]}`}>
                {statusLabels[request.status]}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              {TypeIcon && (
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${typeColor}`}>
                  <TypeIcon className="w-3 h-3" />
                </div>
              )}
              <p className="text-xs text-[#1D252D]/50">{request.type}</p>
            </div>
          </div>
        </div>

        {/* Info block */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 space-y-3">
          <InfoRow label="Тип" value={request.type} />
          <InfoRow label="Категория" value={request.category} />
          <InfoRow label="ЖК" value={complexName} />
          <InfoRow label="Квартира" value={request.apartment} />
          <InfoRow label="Заявитель" value={request.resident} />
          <InfoRow label="Телефон" value={request.phone} />
          <InfoRow label="Создана" value={request.createdAt} />
          <InfoRow label="Приоритет">
            <span className={`font-medium ${priorityColors[request.priority]}`}>
              {priorityLabels[request.priority]}
            </span>
          </InfoRow>
          {request.assignee && <InfoRow label="Исполнитель" value={request.assignee} />}
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
          <p className="text-xs font-semibold text-[#1D252D]/50 mb-1.5">Описание</p>
          <p className="text-sm text-[#1D252D]">{request.description}</p>
        </div>

        {/* Rating for completed + resident */}
        {canRate && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 text-center">
            <p className="text-xs font-semibold text-[#1D252D]/50 mb-2">Оцените работу</p>
            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => onRate(request.id, star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform active:scale-90"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= (hoverRating || (request.rating ?? 0))
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-gray-200'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {request.rating && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 text-center">
            <p className="text-xs font-semibold text-[#1D252D]/50 mb-2">Оценка</p>
            <div className="flex justify-center gap-0.5">
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${star <= request.rating! ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
          <p className="text-xs font-semibold text-[#1D252D]/50 mb-3">История</p>
          <div className="space-y-0">
            {request.timeline.map((event, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-2.5 h-2.5 rounded-full mt-1 ${i === 0 ? 'bg-[#1D252D]' : 'bg-[#1D252D]/20'}`} />
                  {i < request.timeline.length - 1 && <div className="w-px flex-1 bg-[#1D252D]/10 my-1" />}
                </div>
                <div className="pb-4">
                  <p className="text-xs font-medium text-[#1D252D]">{event.status}</p>
                  <p className="text-[10px] text-[#1D252D]/40">{event.author} · {event.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat */}
        {request.chat.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
            <p className="text-xs font-semibold text-[#1D252D]/50 mb-3">Комментарии</p>
            <div className="space-y-3">
              {request.chat.map(msg => (
                <div key={msg.id} className={`flex flex-col ${msg.role === 'resident' ? 'items-start' : 'items-end'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
                    msg.role === 'resident'
                      ? 'bg-[#F5F1EC] rounded-tl-sm'
                      : 'bg-[#1D252D] text-white rounded-tr-sm'
                  }`}>
                    <p className={`text-[10px] font-semibold mb-0.5 ${
                      msg.role === 'resident' ? 'text-[#8B7355]' : 'text-white/60'
                    }`}>{msg.author}</p>
                    <p className="text-xs">{msg.text}</p>
                  </div>
                  <p className="text-[9px] text-[#1D252D]/30 mt-0.5 px-1">{msg.date.split(' ')[1]}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat input */}
        {request.status !== 'completed' && (
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Написать сообщение..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-white rounded-full px-4 py-2.5 text-sm text-[#1D252D] placeholder:text-[#1D252D]/30 border border-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8B7355]/30"
            />
            <button
              onClick={handleSend}
              disabled={!message.trim()}
              className="w-10 h-10 rounded-full bg-[#1D252D] flex items-center justify-center text-white transition-opacity hover:opacity-90 disabled:opacity-30 active:scale-[0.97] shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-2">
          {isManager && request.status === 'new' && (
            <button
              onClick={() => onTakeInWork(request.id)}
              className="w-full bg-[#1D252D] text-white rounded-full py-3 text-sm font-semibold transition-opacity hover:opacity-90 active:scale-[0.97]"
            >
              Взять в работу
            </button>
          )}
          {isManager && (request.status === 'new' || request.status === 'in_progress') && (
            <button
              onClick={() => onAssign(request.id)}
              className="w-full bg-white text-[#1D252D] rounded-full py-3 text-sm font-semibold border border-gray-200 transition-colors hover:bg-gray-50 active:scale-[0.97]"
            >
              Назначить исполнителя
            </button>
          )}
          {isManager && request.status === 'in_progress' && (
            <button
              onClick={() => onCloseRequest(request.id)}
              className="w-full bg-green-600 text-white rounded-full py-3 text-sm font-semibold transition-opacity hover:opacity-90 active:scale-[0.97]"
            >
              Закрыть заявку
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-[#1D252D]/40">{label}</span>
      {children ?? <span className="text-xs font-medium text-[#1D252D]">{value}</span>}
    </div>
  )
}
