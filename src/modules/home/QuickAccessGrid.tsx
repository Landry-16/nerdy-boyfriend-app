import { Link } from 'react-router-dom'

// Modules that are not already surfaced on the home screen (unlike messages,
// mood, and the counter, which have their own cards) get a small cute tile
// here instead. New modules join this list as they ship.
const quickLinks = [
  { to: '/memories', label: 'Souvenirs', emoji: '📸', bg: 'bg-pink' },
  { to: '/map', label: 'Carte', emoji: '🗺️', bg: 'bg-sky' },
]

export function QuickAccessGrid() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {quickLinks.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          className="flex flex-col items-center gap-2 rounded-3xl bg-white/70 py-4 shadow-sm transition-transform hover:scale-[1.03]"
        >
          <span className={`flex h-12 w-12 items-center justify-center rounded-full text-xl ${link.bg}`}>
            {link.emoji}
          </span>
          <span className="text-xs font-medium text-ink/70">{link.label}</span>
        </Link>
      ))}
    </div>
  )
}
