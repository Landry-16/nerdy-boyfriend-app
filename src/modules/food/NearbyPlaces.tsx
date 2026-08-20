import { useState } from 'react'
import { findNearbyPlaces, getCurrentPosition, type NearbyPlace } from './nearbyPlaces'

type Status = 'idle' | 'loading' | 'error' | 'done'

export function NearbyPlaces({ cuisineTag }: { cuisineTag: string }) {
  const [status, setStatus] = useState<Status>('idle')
  const [places, setPlaces] = useState<NearbyPlace[]>([])

  async function handleSearch() {
    setStatus('loading')
    try {
      const position = await getCurrentPosition()
      const results = await findNearbyPlaces(cuisineTag, position)
      setPlaces(results)
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'idle') {
    return (
      <button
        type="button"
        onClick={() => void handleSearch()}
        className="w-full rounded-2xl bg-white/70 px-4 py-3 text-sm text-ink/70 underline underline-offset-2"
      >
        Voir les adresses a proximite
      </button>
    )
  }

  if (status === 'loading') {
    return <p className="text-center text-sm text-ink/50">Recherche en cours...</p>
  }

  if (status === 'error') {
    return (
      <p className="text-center text-sm text-ink/50">
        Impossible de trouver des adresses (position non disponible ou recherche echouee).
      </p>
    )
  }

  if (places.length === 0) {
    return <p className="text-center text-sm text-ink/50">Rien trouve a proximite pour ce type.</p>
  }

  return (
    <ul className="space-y-2">
      {places.map((place) => (
        <li key={place.id}>
          <a
            href={`https://www.openstreetmap.org/?mlat=${place.latitude}&mlon=${place.longitude}#map=18/${place.latitude}/${place.longitude}`}
            target="_blank"
            rel="noreferrer"
            className="block rounded-2xl bg-white/70 px-4 py-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-ink">{place.name}</span>
              <span className="text-xs text-ink/50">{Math.round(place.distanceMeters)} m</span>
            </div>
            {place.address && <p className="mt-0.5 text-xs text-ink/50">{place.address}</p>}
          </a>
        </li>
      ))}
    </ul>
  )
}
