import type { ReactNode } from 'react'

export function Card({ children, className = '' }: { children?: ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl bg-white/70 p-5 shadow-sm backdrop-blur-sm ${className}`}>
      {children}
    </div>
  )
}
