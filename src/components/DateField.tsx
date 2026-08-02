import type { InputHTMLAttributes } from 'react'

// iOS Safari sizes native <input type="date"> to its own intrinsic content
// width, which can overflow a narrower container. appearance-none plus an
// explicit icon replaces the native chrome with one that matches the rest
// of the UI on every platform, and fixes the overflow as a side effect.
export function DateField(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <input
        type="date"
        {...props}
        className="w-full min-w-0 appearance-none rounded-2xl border border-beige bg-white px-4 py-3 pr-11 text-ink outline-none focus:border-sage"
      />
      <svg
        className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-ink/40"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <rect x="4" y="5" width="16" height="15" rx="2.5" />
        <path d="M4 9.5h16M8 3v3.5M16 3v3.5" strokeLinecap="round" />
      </svg>
    </div>
  )
}
