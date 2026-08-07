import { useRef, useState, type PointerEvent } from 'react'

const CANVAS_WIDTH = 320
const CANVAS_HEIGHT = 220
const COLORS = ['#4A453F', '#9CAF88', '#F5D5D8', '#B4D9E8', '#D4C5E2']

export function DrawingPad({ onChange }: { onChange: (dataUrl: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawing = useRef(false)
  const [color, setColor] = useState(COLORS[0])

  // The canvas is drawn at a fixed resolution but stretched to the
  // container width via CSS, so pointer coordinates (in CSS pixels) need
  // scaling back to canvas pixels or strokes would land in the wrong place.
  function getCanvasPoint(event: PointerEvent<HTMLCanvasElement>) {
    const canvas = event.currentTarget
    const rect = canvas.getBoundingClientRect()
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    }
  }

  function emitChange() {
    const canvas = canvasRef.current
    if (canvas) onChange(canvas.toDataURL('image/png'))
  }

  function handlePointerDown(event: PointerEvent<HTMLCanvasElement>) {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return

    isDrawing.current = true
    const { x, y } = getCanvasPoint(event)
    ctx.strokeStyle = color
    ctx.lineWidth = 4
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  function handlePointerMove(event: PointerEvent<HTMLCanvasElement>) {
    if (!isDrawing.current) return
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return

    const { x, y } = getCanvasPoint(event)
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  function handlePointerUp() {
    if (!isDrawing.current) return
    isDrawing.current = false
    emitChange()
  }

  function handleClear() {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    emitChange()
  }

  return (
    <div className="space-y-3">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="w-full touch-none rounded-2xl border border-beige bg-white"
      />
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {COLORS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setColor(option)}
              aria-label={`Choisir la couleur ${option}`}
              className="h-7 w-7 rounded-full border-2"
              style={{ backgroundColor: option, borderColor: option === color ? '#4A453F' : 'transparent' }}
            />
          ))}
        </div>
        <button type="button" onClick={handleClear} className="text-xs text-ink/50 underline underline-offset-2">
          Effacer
        </button>
      </div>
    </div>
  )
}
