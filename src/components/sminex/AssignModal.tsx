import { useState } from 'react'
import { Wrench } from 'lucide-react'
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
      <div className="relative w-full bg-white/85 backdrop-blur-3xl border border-white/40 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] rounded-t-3xl p-5 space-y-4 animate-[slideUp_0.3s_ease-out]">
        {/* Drag handle */}
        <div className="w-10 h-1.5 bg-[#1D252D]/15 rounded-full mx-auto mb-4" />
        {/* Header */}
        <div>
          <h2 className="text-base font-bold text-[#1D252D]">Назначить исполнителя</h2>
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
          className="w-full bg-[#1D252D] text-white rounded-full py-3.5 text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.97] disabled:opacity-40 disabled:active:scale-100 shadow-[0_8px_20px_rgba(29,37,45,0.25)]"
        >
          Назначить
        </button>
      </div>
    </div>
  )
}
