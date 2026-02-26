import { useState } from 'react'
import { Video, X, Maximize2 } from 'lucide-react'
import SubScreenHeader from './SubScreenHeader'
import { cameras } from '../../data/sminex'

interface CamerasScreenProps {
  onBack: () => void
}

export default function CamerasScreen({ onBack }: CamerasScreenProps) {
  const [fullscreenCam, setFullscreenCam] = useState<string | null>(null)

  const selectedCamera = cameras.find(c => c.id === fullscreenCam)

  if (fullscreenCam && selectedCamera) {
    return (
      <div className="flex-1 flex flex-col animate-[fadeIn_0.2s_ease-out]">
        {/* Fullscreen camera view */}
        <div
          className="flex-1 bg-gradient-to-br from-[#1D252D] to-[#2a3a4a] relative flex items-center justify-center cursor-pointer"
          onClick={() => setFullscreenCam(null)}
        >
          <Video className="w-16 h-16 text-white/10" />

          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {selectedCamera.isLive && (
                <div className="flex items-center gap-1.5 bg-black/40 rounded-full px-2.5 py-1">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-white">LIVE</span>
                </div>
              )}
              {selectedCamera.isRecording && (
                <div className="flex items-center gap-1 bg-black/40 rounded-full px-2.5 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span className="text-[10px] font-bold text-white">REC</span>
                </div>
              )}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setFullscreenCam(null) }}
              className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Camera info */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
            <p className="text-sm font-semibold text-white">{selectedCamera.name}</p>
            <p className="text-xs text-white/50">{selectedCamera.location}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto animate-[fadeIn_0.2s_ease-out]">
      <SubScreenHeader title="Камеры" onBack={onBack} />

      <div className="px-5 pb-6">
        <div className="grid grid-cols-2 gap-3">
          {cameras.map(cam => (
            <button
              key={cam.id}
              onClick={() => setFullscreenCam(cam.id)}
              className="relative rounded-2xl overflow-hidden h-32 bg-gradient-to-br from-[#1D252D] to-[#3a4a5a] flex items-center justify-center group transition-transform active:scale-[0.97]"
            >
              <Video className="w-8 h-8 text-white/15" />

              {/* Badges */}
              <div className="absolute top-2 left-2 flex items-center gap-1">
                {cam.isLive && (
                  <div className="flex items-center gap-1 bg-black/50 rounded-full px-1.5 py-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[8px] font-bold text-white">LIVE</span>
                  </div>
                )}
                {cam.isRecording && (
                  <div className="flex items-center gap-0.5 bg-black/50 rounded-full px-1.5 py-0.5">
                    <span className="w-1 h-1 rounded-full bg-red-500" />
                    <span className="text-[8px] font-bold text-white">REC</span>
                  </div>
                )}
              </div>

              {/* Expand icon */}
              <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize2 className="w-3 h-3 text-white" />
              </div>

              {/* Label */}
              <div className="absolute bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-black/60 to-transparent">
                <p className="text-xs font-semibold text-white">{cam.name}</p>
                <p className="text-[9px] text-white/50">{cam.location}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
