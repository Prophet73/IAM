import { useState } from 'react'
import { X, Camera } from 'lucide-react'
import { requestTypes, requestTypeIcons, type Priority } from '../../data/sminex'

interface CreateRequestModalProps {
  onClose: () => void
  onSubmit: (data: { type: string; description: string; priority: Priority }) => void
}

export default function CreateRequestModal({ onClose, onSubmit }: CreateRequestModalProps) {
  const [type, setType] = useState(requestTypes[0])
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')

  const handleSubmit = () => {
    if (!description.trim()) return
    onSubmit({ type, description: description.trim(), priority })
  }

  return (
    <div className="absolute inset-0 z-40 flex items-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full bg-white rounded-t-3xl p-5 space-y-4 animate-[slideUp_0.3s_ease-out] max-h-[85%] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#1D252D]">Новая заявка</h2>
          <button onClick={onClose} className="text-[#1D252D]/40 hover:text-[#1D252D] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Type selector */}
        <div>
          <label className="text-xs font-semibold text-[#1D252D]/50 mb-2 block">Тип проблемы</label>
          <div className="grid grid-cols-4 gap-2">
            {requestTypes.map(t => {
              const Icon = requestTypeIcons[t]
              const isActive = type === t
              return (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl text-center transition-all active:scale-[0.97] ${
                    isActive ? 'bg-[#1D252D] text-white shadow-md' : 'bg-gray-50 text-[#1D252D]/60'
                  }`}
                >
                  {Icon && <Icon className={`w-4 h-4 ${isActive ? 'text-white' : ''}`} />}
                  <span className="text-[9px] font-medium leading-tight">{t}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-semibold text-[#1D252D]/50 mb-2 block">Описание</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value.slice(0, 200))}
            placeholder="Опишите проблему подробнее..."
            rows={3}
            className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm text-[#1D252D] placeholder:text-[#1D252D]/30 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#8B7355]/30 resize-none"
          />
          <p className="text-[10px] text-[#1D252D]/30 text-right mt-1">{description.length}/200</p>
        </div>

        {/* Priority */}
        <div>
          <label className="text-xs font-semibold text-[#1D252D]/50 mb-2 block">Приоритет</label>
          <div className="flex gap-2">
            {(['low', 'medium', 'high'] as Priority[]).map(p => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                className={`flex-1 py-2 rounded-full text-xs font-medium transition-all active:scale-[0.97] ${
                  priority === p
                    ? 'bg-[#1D252D] text-white'
                    : 'bg-gray-50 text-[#1D252D]/60 border border-gray-100'
                }`}
              >
                {p === 'low' ? 'Низкий' : p === 'medium' ? 'Средний' : 'Высокий'}
              </button>
            ))}
          </div>
        </div>

        {/* Photo stub */}
        <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-gray-200 text-[#1D252D]/40 text-xs font-medium transition-colors hover:border-gray-300 active:scale-[0.97]">
          <Camera className="w-4 h-4" />
          Добавить фото
        </button>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!description.trim()}
          className="w-full bg-[#1D252D] text-white rounded-full py-3.5 text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.97] disabled:opacity-40 disabled:active:scale-100"
        >
          Отправить
        </button>
      </div>
    </div>
  )
}
