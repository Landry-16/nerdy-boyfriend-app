import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useAsync } from '../../lib/useAsync'
import { fetchMemories, getPhotoUrl, type MemoryWithPhotos } from '../memories/memories.api'
import { formatDateShort, parseIsoDate } from '../../lib/date'
import { LoadingScreen } from '../../components/LoadingScreen'
import { ErrorMessage } from '../../components/ErrorMessage'
import { createMemoryMarkerIcon } from './memoryMarkerIcon'

const DEFAULT_CENTER: [number, number] = [46.6, 2.4]

type LocatedMemory = MemoryWithPhotos & { latitude: number; longitude: number }

function isLocated(memory: MemoryWithPhotos): memory is LocatedMemory {
  return memory.latitude !== null && memory.longitude !== null
}

function FitToMarkers({ memories }: { memories: LocatedMemory[] }) {
  const map = useMap()

  useEffect(() => {
    if (memories.length === 0) return
    if (memories.length === 1) {
      map.setView([memories[0].latitude, memories[0].longitude], 11)
      return
    }
    map.fitBounds(
      memories.map((memory) => [memory.latitude, memory.longitude]),
      { padding: [32, 32] },
    )
  }, [map, memories])

  return null
}

export function MapPage() {
  const fetcher = useCallback(fetchMemories, [])
  const { data: memories, loading, error } = useAsync(fetcher)
  const [icon] = useState(createMemoryMarkerIcon)

  if (loading) return <LoadingScreen />
  if (error || !memories) return <ErrorMessage message="Impossible de charger la carte." />

  const located = memories.filter(isLocated)

  return (
    <div className="animate-fade-in space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-ink">Carte 🗺️</h1>
        <p className="mt-1 text-sm text-ink/60">
          {located.length > 0 ? `${located.length} endroit(s) visite(s)` : 'Aucun souvenir situe sur la carte.'}
        </p>
      </header>

      <div className="overflow-hidden rounded-3xl border border-beige">
        <MapContainer center={DEFAULT_CENTER} zoom={5} style={{ height: 480, width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitToMarkers memories={located} />
          {located.map((memory) => (
            <Marker key={memory.id} position={[memory.latitude, memory.longitude]} icon={icon}>
              <Popup>
                <Link to={`/memories/${memory.id}`} className="block w-36 space-y-1 text-center">
                  {memory.photos[0] && (
                    <img
                      src={getPhotoUrl(memory.photos[0].storage_path)}
                      alt=""
                      className="aspect-square w-full rounded-xl object-cover"
                    />
                  )}
                  <span className="block text-sm font-medium text-ink">{memory.title}</span>
                  <span className="block text-xs text-ink/50">{formatDateShort(parseIsoDate(memory.memory_date))}</span>
                </Link>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}
