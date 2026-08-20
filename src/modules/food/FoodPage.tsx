import { useCallback, useMemo, useState, type FormEvent } from 'react'
import { useAsync } from '../../lib/useAsync'
import { fetchCustomFoodTypes, addFoodType, removeFoodType } from './food.api'
import { defaultFoodTypes, type FoodType } from './foodTypes'
import { NearbyPlaces } from './NearbyPlaces'
import { Card } from '../../components/Card'
import { LoadingScreen } from '../../components/LoadingScreen'
import { ErrorMessage } from '../../components/ErrorMessage'

export function FoodPage() {
  const fetcher = useCallback(fetchCustomFoodTypes, [])
  const { data: customTypes, loading, error, refetch } = useAsync(fetcher)

  const [pick, setPick] = useState<FoodType | null>(null)
  const [excluded, setExcluded] = useState<Set<string>>(new Set())
  const [newLabel, setNewLabel] = useState('')
  const [adding, setAdding] = useState(false)

  const allTypes = useMemo<FoodType[]>(() => {
    const custom = (customTypes ?? []).map((row) => ({ id: row.id, label: row.label, cuisineTag: row.cuisine_tag }))
    return [...defaultFoodTypes, ...custom]
  }, [customTypes])

  if (loading) return <LoadingScreen />
  if (error || !customTypes) return <ErrorMessage message="Impossible de charger les types de nourriture." />

  function pickRandom(exclude: Set<string>) {
    const available = allTypes.filter((type) => !exclude.has(type.id))
    const pool = available.length > 0 ? available : allTypes
    const choice = pool[Math.floor(Math.random() * pool.length)]
    setPick(choice ?? null)
    return choice
  }

  function handleChoose() {
    setExcluded(new Set())
    pickRandom(new Set())
  }

  function handleAgain() {
    if (!pick) return
    const nextExcluded = new Set(excluded).add(pick.id)
    setExcluded(nextExcluded)
    pickRandom(nextExcluded)
  }

  function handleClear() {
    setPick(null)
    setExcluded(new Set())
  }

  async function handleAddType(event: FormEvent) {
    event.preventDefault()
    const label = newLabel.trim()
    if (!label) return

    setAdding(true)
    try {
      await addFoodType(label)
      setNewLabel('')
      refetch()
    } finally {
      setAdding(false)
    }
  }

  async function handleRemoveType(id: string) {
    await removeFoodType(id)
    if (pick?.id === id) setPick(null)
    refetch()
  }

  const customIds = new Set((customTypes ?? []).map((row) => row.id))

  return (
    <div className="animate-fade-in space-y-8">
      <header>
        <h1 className="text-2xl font-semibold text-ink">On mange quoi ?</h1>
        <p className="mt-1 text-sm text-ink/60">Laisse le hasard decider.</p>
      </header>

      {pick ? (
        <Card className="space-y-4 text-center">
          <p className="text-2xl font-semibold text-sage-dark">{pick.label}</p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleAgain}
              className="flex-1 rounded-2xl bg-sage px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-sage-dark"
            >
              Encore
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="flex-1 rounded-2xl bg-beige/60 px-4 py-3 text-sm font-medium text-ink transition-colors hover:bg-beige"
            >
              Effacer
            </button>
          </div>
          <NearbyPlaces cuisineTag={pick.cuisineTag} />
        </Card>
      ) : (
        <button
          type="button"
          onClick={handleChoose}
          className="w-full rounded-3xl bg-sage px-4 py-6 text-lg font-medium text-white shadow-sm transition-colors hover:bg-sage-dark"
        >
          Choisir
        </button>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-ink/70">Types disponibles</h2>
        <div className="flex flex-wrap gap-2">
          {allTypes.map((type) => (
            <span
              key={type.id}
              className="flex items-center gap-1.5 rounded-full bg-white/70 py-1.5 pr-1.5 pl-3 text-sm text-ink/80"
            >
              {type.label}
              {customIds.has(type.id) && (
                <button
                  type="button"
                  onClick={() => void handleRemoveType(type.id)}
                  aria-label={`Retirer ${type.label}`}
                  className="flex h-5 w-5 items-center justify-center rounded-full text-ink/40 hover:bg-beige/60"
                >
                  x
                </button>
              )}
            </span>
          ))}
        </div>

        <form onSubmit={handleAddType} className="flex gap-2">
          <input
            type="text"
            placeholder="Ajouter un type..."
            value={newLabel}
            onChange={(event) => setNewLabel(event.target.value)}
            className="min-w-0 flex-1 rounded-2xl border border-beige bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-sage"
          />
          <button
            type="submit"
            disabled={adding || !newLabel.trim()}
            className="rounded-2xl bg-sage px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sage-dark disabled:opacity-60"
          >
            Ajouter
          </button>
        </form>
      </section>
    </div>
  )
}
