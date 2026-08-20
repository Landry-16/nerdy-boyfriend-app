import { Link } from 'react-router-dom'

// Modules that are not already surfaced on the home screen (unlike messages,
// mood, and the counter, which have their own cards) get a small cute tile
// here instead. New modules join this list as they ship.
const quickLinks = [
  { to: '/memories', label: 'Souvenirs', icon: CameraIcon, bg: 'bg-pink' },
  { to: '/map', label: 'Carte', icon: MapIcon, bg: 'bg-sky' },
  { to: '/room', label: 'Room', icon: ScreenIcon, bg: 'bg-lavender' },
  { to: '/food', label: 'On mange quoi ?', icon: ForkIcon, bg: 'bg-beige' },
  { to: '/watchlist', label: 'Watchlist', icon: FilmIcon, bg: 'bg-sage/25' },
]

export function QuickAccessGrid() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {quickLinks.map(({ to, label, icon: Icon, bg }) => (
        <Link
          key={to}
          to={to}
          className="flex flex-col items-center gap-2 rounded-3xl bg-white/70 py-4 shadow-sm transition-transform hover:scale-[1.03]"
        >
          <span className={`flex h-12 w-12 items-center justify-center rounded-full text-ink/70 ${bg}`}>
            <Icon />
          </span>
          <span className="text-xs font-medium text-ink/70">{label}</span>
        </Link>
      ))}
    </div>
  )
}

function CameraIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path
        d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  )
}

function MapIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="m3 6 6-2 6 2 6-2v14l-6 2-6-2-6 2Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 4v14M15 6v14" strokeLinecap="round" />
    </svg>
  )
}

function ScreenIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="4" width="18" height="12" rx="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 20h6M12 16v4" strokeLinecap="round" />
    </svg>
  )
}

function ForkIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M7 3v7a2 2 0 0 0 4 0V3M9 10v11" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 3c-1.1 0-2 1.3-2 4s.9 4 2 4v10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function FilmIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="4" width="18" height="16" rx="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 9h18M8 4v5M15 4v5" strokeLinecap="round" />
    </svg>
  )
}
