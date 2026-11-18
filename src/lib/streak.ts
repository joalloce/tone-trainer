import type { SessionRecord } from './storage'

const dayKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`

export function currentStreak(sessions: readonly Pick<SessionRecord, 'finishedAt'>[], now = new Date()): number {
  const days = new Set(sessions.map((s) => dayKey(new Date(s.finishedAt))))
  const day = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (!days.has(dayKey(day))) day.setDate(day.getDate() - 1)

  let streak = 0
  while (days.has(dayKey(day))) {
    streak++
    day.setDate(day.getDate() - 1)
  }
  return streak
}
