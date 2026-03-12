import { useReveal } from '../hooks/useReveal'

interface RevealProps {
  children: React.ReactNode
  stagger?: boolean
  className?: string
  rootMargin?: string
}

export function Reveal({ children, stagger, className = '', rootMargin }: RevealProps) {
  const { ref, visible } = useReveal(0.15, rootMargin)

  return (
    <div
      ref={ref}
      className={`${stagger ? 'reveal-stagger' : 'reveal'} ${visible ? 'revealed' : ''} ${className}`}
    >
      {children}
    </div>
  )
}
