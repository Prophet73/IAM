import { useState } from 'react'
import { X, Wrench } from 'lucide-react'
import { executors } from '../../data/sminex'

interface AssignModalProps {
  onClose: () => void
  onAssign: (executor: string) => void
}

export default function AssignModal({ onClose, onAssign }: AssignModalProps) {
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <div className="absolute inset-0 z-40 flex items-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full bg-white rounded-t-3xl p-5 space-y-4 animate-[slideUp_0.3s_ease-out]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#1D252D]">Назначить исполнителя</h2>
          <button onClick={onClose} className="text-[#1D252D]/40 hover:text-[#1D252D] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Executor list */}
        <div className="space-y-2">
          {executors.map(exec => (
            <button
              key={exec.id}
              onClick={() => setSelected(exec.name)}
              className={`w-full flex items-center gap-3 p-3.5 rounded-xl transition-all active:scale-[0.97] ${
                selected === exec.name
                  ? 'bg-[#1D252D] text-white shadow-md'
                  : 'bg-gray-50 text-[#1D252D]'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                selected === exec.name ? 'bg-white/20' : 'bg-[#1D252D]/10'
              }`}>
                <Wrench className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">{exec.name}</span>
              {selected === exec.name && (
                <div className="ml-auto w-5 h-5 rounded-full bg-white flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#1D252D]" />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Submit */}
        <button
          onClick={() => selected && onAssign(selected)}
          disabled={!selected}
          className="w-full bg-[#1D252D] text-white rounded-full py-3.5 text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.97] disabled:opacity-40 disabled:active:scale-100"
        >
          Назначить
        </button>
      </div>
    </div>
  )
}
