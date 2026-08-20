/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_VAPID_PUBLIC_KEY: string
  /** Optional: movie search/enrichment in the watchlist degrades gracefully without it. */
  readonly VITE_TMDB_API_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
