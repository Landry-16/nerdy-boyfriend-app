import type { Mood } from '../../types/database'

export const moodOptions: { value: Mood; emoji: string; label: string }[] = [
  { value: 'happy', emoji: '😊', label: 'Content' },
  { value: 'love', emoji: '❤️', label: 'Amoureux' },
  { value: 'tired', emoji: '😴', label: 'Fatigue' },
  { value: 'sad', emoji: '😢', label: 'Triste' },
  { value: 'angry', emoji: '😡', label: 'En colere' },
  { value: 'crying', emoji: '😭', label: 'Debordant' },
]

export function moodEmoji(mood: Mood): string {
  return moodOptions.find((option) => option.value === mood)?.emoji ?? '•'
}
