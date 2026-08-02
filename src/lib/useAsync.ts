import { useCallback, useEffect, useState } from 'react'

interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

/**
 * Runs an async fetcher on mount and exposes loading/error/data state plus
 * a `refetch` function. Shared by every module that reads from Supabase, so
 * each one only has to describe what to fetch, not how to track its state.
 *
 * Callers must pass a stable `fetcher` reference (wrap it in `useCallback`),
 * since it is itself an effect dependency.
 */
export function useAsync<T>(fetcher: () => Promise<T>): AsyncState<T> & { refetch: () => void } {
  const [state, setState] = useState<AsyncState<T>>({ data: null, loading: true, error: null })
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let cancelled = false
    setState((prev) => ({ ...prev, loading: true, error: null }))

    fetcher()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null })
      })
      .catch((error: Error) => {
        if (!cancelled) setState({ data: null, loading: false, error })
      })

    return () => {
      cancelled = true
    }
  }, [fetcher, reloadToken])

  const refetch = useCallback(() => setReloadToken((token) => token + 1), [])

  return { ...state, refetch }
}
