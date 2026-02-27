import { useReveal } from '../hooks/useReveal'

interface RevealProps {
  children: React.ReactNode
  stagger?: boolean
  className?: string
}

export function Reveal({ children, stagger, className = '' }: RevealProps) {
  const { ref, visible } = useReveal()

  return (
    <div
      ref={ref}
      className={`${stagger ? 'reveal-stagger' : 'reveal'} ${visible ? 'revealed' : ''} ${className}`}
    >
      {children}
    </div>
  )
}
