import { useEffect, useState } from 'react'

const layers = [
  { label: 'Продукт', sub: 'SSO, роли, аудит',           floor: 'L4' },
  { label: 'Агенты',  sub: 'LLM, RAG, pipeline',         floor: 'L3' },
  { label: 'Данные',  sub: 'Документы, аудио, таблицы',  floor: 'L2' },
  { label: 'Процесс', sub: 'Требования у исполнителя',   floor: 'L1' },
]

const W_HALF = 96
const H_HALF = 34
const CX = 108
const BASE_Y = 296
const STEP = 64
const PULSE_TRAVEL = 3 * STEP + H_HALF + 18 // exits above the top rhombus

// Window slots on each layer (relative to CX, cy).
// Symmetric chevron around the central axis — the axis stays empty so the
// pulse travels through clean space, no visual collision with "lit" windows.
const WINDOWS = [
  { dx: -44, dy:  -8 },
  { dx: -22, dy: -16 },
  { dx:  22, dy: -16 },
  { dx:  44, dy:  -8 },
]

export function Stack() {
  const [active, setActive] = useState(layers.length - 1)

  useEffect(() => {
    const t = setInterval(() => {
      setActive(a => (a - 1 + layers.length) % layers.length)
    }, 2200)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="hero-diagram">
      <svg viewBox="-20 0 380 380" className="w-full h-auto" fill="none" aria-hidden="true">
        {/* Left measurement rail (outside rhombus left edge) */}
        <line
          x1={CX - W_HALF - 14}
          y1={BASE_Y - 3 * STEP - H_HALF}
          x2={CX - W_HALF - 14}
          y2={BASE_Y + H_HALF}
          stroke="var(--color-border)"
          strokeWidth="0.5"
          opacity="0.5"
        />
        {layers.map((layer, i) => {
          const z = layers.length - 1 - i
          const cy = BASE_Y - z * STEP
          return (
            <g key={`mark-${i}`} opacity="0.55">
              <line
                x1={CX - W_HALF - 18}
                y1={cy}
                x2={CX - W_HALF - 10}
                y2={cy}
                stroke="var(--color-border)"
                strokeWidth="0.6"
              />
              <text
                x={CX - W_HALF - 22}
                y={cy + 3}
                fill="var(--color-muted)"
                fontFamily="var(--font-sans)"
                fontSize="10"
                fontWeight="600"
                textAnchor="end"
              >
                {layer.floor}
              </text>
            </g>
          )
        })}

        {/* Central axis */}
        <line
          x1={CX}
          y1={BASE_Y - 3 * STEP - H_HALF + 6}
          x2={CX}
          y2={BASE_Y + H_HALF - 6}
          stroke="var(--color-border)"
          strokeWidth="0.6"
          strokeDasharray="2 5"
          opacity="0.55"
        />

        {layers.map((layer, i) => {
          const z = layers.length - 1 - i
          const cy = BASE_Y - z * STEP
          const isActive = active === i

          const top    = `${CX},${cy - H_HALF}`
          const right  = `${CX + W_HALF},${cy}`
          const bottom = `${CX},${cy + H_HALF}`
          const left   = `${CX - W_HALF},${cy}`

          return (
            <g
              key={layer.label}
              className="diagram-layer"
              style={{ animationDelay: `${0.45 + i * 0.18}s` }}
            >
              <polygon
                points={`${top} ${right} ${bottom} ${left}`}
                stroke={isActive ? 'var(--color-accent)' : 'var(--color-border)'}
                strokeWidth={isActive ? 1.4 : 1}
                fill={isActive ? 'color-mix(in srgb, var(--color-accent) 7%, transparent)' : 'transparent'}
                style={{ transition: 'stroke 0.5s, stroke-width 0.5s, fill 0.5s' }}
              />
              {/* Window lights on plane */}
              {WINDOWS.map((w, wi) => {
                const litChance = isActive ? 0.85 : 0.32
                const lit = ((i + 1) * 13 + wi * 7) % 100 < litChance * 100
                return (
                  <rect
                    key={wi}
                    x={CX + w.dx - 2}
                    y={cy + w.dy - 2}
                    width="3.5"
                    height="3.5"
                    fill={lit ? (isActive ? 'var(--color-accent)' : 'color-mix(in srgb, var(--color-accent) 50%, transparent)') : 'var(--color-border)'}
                    style={{
                      transition: 'fill 0.5s',
                      filter: lit && isActive ? 'drop-shadow(0 0 2px var(--color-accent))' : 'none',
                    }}
                  />
                )
              })}
              {/* Tick on right corner */}
              <line
                x1={CX + W_HALF}
                y1={cy}
                x2={CX + W_HALF + 10}
                y2={cy}
                stroke={isActive ? 'var(--color-accent)' : 'var(--color-border)'}
                strokeWidth="1"
                style={{ transition: 'stroke 0.5s' }}
              />
              <text
                x={CX + W_HALF + 16}
                y={cy - 2}
                fill={isActive ? 'var(--color-accent)' : 'var(--color-text-primary)'}
                fontFamily="var(--font-display)"
                fontSize="14"
                fontWeight="700"
                style={{ transition: 'fill 0.5s' }}
              >
                {layer.label}
              </text>
              <text
                x={CX + W_HALF + 16}
                y={cy + 14}
                fill="var(--color-muted)"
                fontFamily="var(--font-sans)"
                fontSize="11"
              >
                {layer.sub}
              </text>
            </g>
          )
        })}

        {/* Multi-particle flow on axis — exits above the top rhombus */}
        {[0, 1.4, 2.8].map((delay, i) => (
          <circle
            key={i}
            className="diagram-pulse"
            cx={CX}
            cy={BASE_Y}
            r="2.3"
            fill="var(--color-accent)"
            style={{
              animationDelay: `${1.4 + delay}s`,
              ['--pulse-travel' as string]: `-${PULSE_TRAVEL}px`,
              filter: 'drop-shadow(0 0 4px var(--color-accent))',
            }}
          />
        ))}
      </svg>
    </div>
  )
}
