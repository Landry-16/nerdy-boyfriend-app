import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createMemory } from './memories.api'
import { toIsoDate } from '../../lib/date'
import { LocationPicker } from './LocationPicker'
import { PhotoPicker } from './PhotoPicker'
import { DateField } from '../../components/DateField'
import { notifyPartner } from '../../lib/notify'

export function NewMemoryPage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(toIsoDate(new Date()))
  const [description, setDescription] = useState('')
  const [locationName, setLocationName] = useState('')
  const [musicUrl, setMusicUrl] = useState('')
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [files, setFiles] = useState<File[]>([])
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)

    try {
      const memory = await createMemory(
        {
          title,
          memory_date: date,
          description: description.trim() || null,
          location_name: locationName.trim() || null,
          music_url: musicUrl.trim() || null,
          latitude: coords?.lat ?? null,
          longitude: coords?.lng ?? null,
        },
        files,
      )
      notifyPartner('Nouveau souvenir', title, `/memories/${memory.id}`)
      navigate(`/memories/${memory.id}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="animate-fade-in space-y-8">
      <header>
        <Link to="/memories" className="text-sm text-ink/50 underline underline-offset-2">
          ← Souvenirs
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-ink">Nouveau souvenir</h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl bg-white/70 p-6">
        <div className="space-y-2">
          <label className="text-sm text-ink/70" htmlFor="title">
            Titre
          </label>
          <input
            id="title"
            type="text"
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-2xl border border-beige bg-white px-4 py-3 text-ink outline-none focus:border-sage"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-ink/70" htmlFor="date">
            Date
          </label>
          <DateField id="date" required value={date} onChange={(event) => setDate(event.target.value)} />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-ink/70" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="w-full rounded-2xl border border-beige bg-white px-4 py-3 text-ink outline-none focus:border-sage"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-ink/70" htmlFor="location">
            Lieu (optionnel)
          </label>
          <input
            id="location"
            type="text"
            placeholder="ex: Lisbonne, Portugal"
            value={locationName}
            onChange={(event) => setLocationName(event.target.value)}
            className="w-full rounded-2xl border border-beige bg-white px-4 py-3 text-ink outline-none focus:border-sage"
          />
        </div>

        <LocationPicker
          latitude={coords?.lat ?? null}
          longitude={coords?.lng ?? null}
          onChange={(lat, lng) => setCoords({ lat, lng })}
        />

        <div className="space-y-2">
          <label className="text-sm text-ink/70" htmlFor="music">
            Musique (optionnel, lien)
          </label>
          <input
            id="music"
            type="url"
            placeholder="https://..."
            value={musicUrl}
            onChange={(event) => setMusicUrl(event.target.value)}
            className="w-full rounded-2xl border border-beige bg-white px-4 py-3 text-ink outline-none focus:border-sage"
          />
        </div>

        <PhotoPicker files={files} onChange={setFiles} />

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-2xl bg-sage px-4 py-3 font-medium text-white transition-colors hover:bg-sage-dark disabled:opacity-60"
        >
          {saving ? 'Enregistrement...' : 'Enregistrer ce souvenir'}
        </button>
      </form>
    </div>
  )
}
