import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { ConfigError } from './components/ConfigError'

const root = createRoot(document.getElementById('root')!)
const hasSupabaseConfig = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)

// App (and its Supabase client) is imported lazily and only once config is
// confirmed present, so a missing env var shows ConfigError instead of a
// blank page: importing supabase.ts eagerly would throw before React ever
// gets to render anything.
if (hasSupabaseConfig) {
  import('./App.tsx').then(({ default: App }) => {
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  })
} else {
  root.render(
    <StrictMode>
      <ConfigError />
    </StrictMode>,
  )
}
