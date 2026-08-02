import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Accueil', icon: HomeIcon },
  { to: '/messages', label: 'Messages', icon: MessageIcon },
  { to: '/mood', label: 'Humeur', icon: MoodIcon },
  { to: '/counter', label: 'Compteur', icon: CounterIcon },
]

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 border-t border-beige bg-cream/95 backdrop-blur-sm">
      <ul className="mx-auto flex max-w-md justify-around">
        {navItems.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-4 py-3 text-xs transition-colors ${
                  isActive ? 'text-sage-dark' : 'text-ink/50'
                }`
              }
            >
              <Icon />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function HomeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 11.5 12 4l8 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 10v9h12v-9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function MessageIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path
        d="M4 6h16v10H8l-4 4V6Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function MoodIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8.5 14.5c1 1.2 2.2 1.8 3.5 1.8s2.5-.6 3.5-1.8" strokeLinecap="round" />
      <circle cx="9" cy="10" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="15" cy="10" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  )
}

function CounterIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="5" width="16" height="15" rx="2.5" />
      <path d="M4 9.5h16M8 3v3.5M16 3v3.5" strokeLinecap="round" />
    </svg>
  )
}
