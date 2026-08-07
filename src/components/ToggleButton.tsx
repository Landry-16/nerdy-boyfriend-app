export function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-xs font-medium transition-colors ${
        active ? 'bg-sage text-white' : 'bg-white/70 text-ink/60'
      }`}
    >
      {children}
    </button>
  )
}
