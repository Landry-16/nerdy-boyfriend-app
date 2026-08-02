import { useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { createMemoryMarkerIcon } from '../map/memoryMarkerIcon'

// Roughly the middle of France: a harmless default center when no pin has
// been placed yet, so the map does not open zoomed into the ocean at 0,0.
const DEFAULT_CENTER: [number, number] = [46.6, 2.4]

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(event) {
      onPick(event.latlng.lat, event.latlng.lng)
    },
  })
  return null
}

export function LocationPicker({
  latitude,
  longitude,
  onChange,
}: {
  latitude: number | null
  longitude: number | null
  onChange: (lat: number, lng: number) => void
}) {
  const [icon] = useState(createMemoryMarkerIcon)
  const hasPin = latitude !== null && longitude !== null
  const center: [number, number] = hasPin ? [latitude, longitude] : DEFAULT_CENTER

  return (
    <div className="space-y-2">
      <p className="text-sm text-ink/70">Lieu sur la carte (optionnel, touche la carte pour placer un repere)</p>
      <div className="overflow-hidden rounded-2xl border border-beige">
        <MapContainer center={center} zoom={hasPin ? 12 : 5} style={{ height: 220, width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onPick={onChange} />
          {hasPin && <Marker position={[latitude, longitude]} icon={icon} />}
        </MapContainer>
      </div>
    </div>
  )
}
