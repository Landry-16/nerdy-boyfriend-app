export function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-pink bg-pink/20 px-4 py-3 text-sm text-ink">
      {message}
    </div>
  )
}
