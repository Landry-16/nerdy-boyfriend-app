import { useEffect, useState, type ChangeEvent } from 'react'

export function PhotoPicker({ files, onChange }: { files: File[]; onChange: (files: File[]) => void }) {
  const [previews, setPreviews] = useState<string[]>([])

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file))
    setPreviews(urls)
    return () => urls.forEach((url) => URL.revokeObjectURL(url))
  }, [files])

  function handleSelect(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? [])
    onChange([...files, ...selected])
    event.target.value = ''
  }

  function removeAt(index: number) {
    onChange(files.filter((_, fileIndex) => fileIndex !== index))
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-ink/70">Photos (optionnel)</p>
      <div className="grid grid-cols-4 gap-2">
        {previews.map((src, index) => (
          <div key={src} className="relative aspect-square overflow-hidden rounded-2xl bg-beige/60">
            <img src={src} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removeAt(index)}
              className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink/60 text-xs text-white"
              aria-label="Retirer cette photo"
            >
              ×
            </button>
          </div>
        ))}
        <label className="flex aspect-square cursor-pointer items-center justify-center rounded-2xl border border-dashed border-beige text-2xl text-ink/40">
          +
          <input type="file" accept="image/*" multiple onChange={handleSelect} className="hidden" />
        </label>
      </div>
    </div>
  )
}
