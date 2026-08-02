import type { ReactNode } from 'react'
import { BottomNav } from './BottomNav'

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-svh bg-cream pb-24">
      <div className="mx-auto max-w-md px-5 pt-8">{children}</div>
      <BottomNav />
    </div>
  )
}
