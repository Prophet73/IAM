import { useEffect, useState } from 'react'
import { CheckCircle, AlertTriangle } from 'lucide-react'

export interface ToastMessage {
  id: string
  text: string
  type: 'success' | 'error'
}

interface ToastProps {
  toast: ToastMessage
  onDismiss: (id: string) => void
}

const DURATION = 3000

export default function Toast({ toast, onDismiss }: ToastProps) {
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    const exitTimer = setTimeout(() => setExiting(true), DURATION - 300)
    const removeTimer = setTimeout(() => onDismiss(toast.id), DURATION)
    return () => { clearTimeout(exitTimer); clearTimeout(removeTimer) }
  }, [toast.id, onDismiss])

  return (
    <div className={`absolute top-3 left-3 right-3 z-50 ${exiting ? 'animate-[toastOut_0.3s_ease-in_forwards]' : 'animate-[toastIn_0.3s_ease-out]'}`}>
      <div className="bg-[#1D252D] text-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-3 overflow-hidden relative">
        {toast.type === 'success' ? (
          <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
        ) : (
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
        )}
        <p className="text-sm font-medium flex-1">{toast.text}</p>
        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10">
          <div
            className="h-full bg-white/30 rounded-full"
            style={{
              animation: `toastProgress ${DURATION}ms linear forwards`,
            }}
          />
        </div>
      </div>
    </div>
  )
}
