// Nearby restaurant search via OpenStreetMap's Overpass API: free, no API
// key, matching the same choice already made for the map module.

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter'
const SEARCH_RADIUS_METERS = 3000
const EARTH_RADIUS_METERS = 6371000

export interface Coordinates {
  latitude: number
  longitude: number
}

export interface NearbyPlace {
  id: number
  name: string
  address: string | null
  latitude: number
  longitude: number
  distanceMeters: number
}

interface OverpassElement {
  id: number
  lat: number
  lon: number
  tags?: Record<string, string>
}

export function getCurrentPosition(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('geolocation_unsupported'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
      () => reject(new Error('geolocation_denied')),
      { enableHighAccuracy: false, timeout: 10000 },
    )
  })
}

/** Keeps only characters safe to embed in the Overpass query string below. */
function sanitizeCuisineTag(tag: string): string {
  return tag.replace(/[^a-zA-Z0-9\s-]/g, '').trim()
}

function haversineDistanceMeters(from: Coordinates, to: { lat: number; lon: number }): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(to.lat - from.latitude)
  const dLon = toRad(to.lon - from.longitude)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.latitude)) * Math.cos(toRad(to.lat)) * Math.sin(dLon / 2) ** 2
  return EARTH_RADIUS_METERS * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function formatAddress(tags: Record<string, string>): string | null {
  const streetLine = [tags['addr:housenumber'], tags['addr:street']].filter(Boolean).join(' ')
  const parts = [streetLine, tags['addr:city']].filter(Boolean)
  return parts.length > 0 ? parts.join(', ') : null
}

export async function findNearbyPlaces(cuisineTag: string, position: Coordinates): Promise<NearbyPlace[]> {
  const safeTag = sanitizeCuisineTag(cuisineTag)
  if (!safeTag) return []

  const query = `[out:json][timeout:20];(node["amenity"~"restaurant|fast_food"]["cuisine"~"${safeTag}",i](around:${SEARCH_RADIUS_METERS},${position.latitude},${position.longitude}););out body 15;`

  const response = await fetch(OVERPASS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(query)}`,
  })

  if (!response.ok) throw new Error('overpass_request_failed')

  const json: { elements: OverpassElement[] } = await response.json()

  return json.elements
    .filter((element): element is OverpassElement & { tags: Record<string, string> } => Boolean(element.tags?.name))
    .map((element) => ({
      id: element.id,
      name: element.tags.name,
      address: formatAddress(element.tags),
      latitude: element.lat,
      longitude: element.lon,
      distanceMeters: haversineDistanceMeters(position, { lat: element.lat, lon: element.lon }),
    }))
    .sort((a, b) => a.distanceMeters - b.distanceMeters)
}
