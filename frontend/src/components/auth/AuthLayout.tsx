import type { ReactNode } from 'react'
import { AuthShowcase } from './AuthShowcase'

export const AuthLayout = ({ children }: { children: ReactNode }) => (
  <main className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl grid-cols-1 items-stretch gap-8 px-4 py-8 sm:px-6 lg:gap-10 lg:px-8 lg:py-10 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
    <section className="flex min-w-0 items-center justify-center">
      <div className="w-full max-w-[420px]">{children}</div>
    </section>
    <AuthShowcase />
  </main>
)
