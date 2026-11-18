import { describe, expect, it } from 'vitest'
import { currentStreak } from './streak'

const at = (month: number, day: number, hour = 12) => ({ finishedAt: new Date(2026, month - 1, day, hour).toISOString() })
const now = new Date(2026, 10, 17, 20)

describe('currentStreak', () => {
  it('is 0 with no sessions', () => {
    expect(currentStreak([], now)).toBe(0)
  })

  it('counts consecutive days ending today', () => {
    expect(currentStreak([at(11, 15), at(11, 16), at(11, 17)], now)).toBe(3)
  })

  it('counts several sessions on one day once', () => {
    expect(currentStreak([at(11, 17, 8), at(11, 17, 9), at(11, 17, 19)], now)).toBe(1)
  })

  it('keeps a streak that ended yesterday, so it survives until today is over', () => {
    expect(currentStreak([at(11, 15), at(11, 16)], now)).toBe(2)
  })

  it('is 0 when the last session was two days ago', () => {
    expect(currentStreak([at(11, 14), at(11, 15)], now)).toBe(0)
  })

  it('stops at the first missed day', () => {
    expect(currentStreak([at(11, 12), at(11, 13), at(11, 15), at(11, 16), at(11, 17)], now)).toBe(3)
  })

  it('crosses month and year boundaries', () => {
    expect(currentStreak([at(10, 31), at(11, 1)], new Date(2026, 10, 1, 9))).toBe(2)
    const newYear = { finishedAt: new Date(2027, 0, 1, 9).toISOString() }
    expect(currentStreak([at(12, 31), newYear], new Date(2027, 0, 1, 10))).toBe(2)
  })

  it('uses local days, so a late-night session counts for that day', () => {
    expect(currentStreak([at(11, 16, 23), at(11, 17, 0)], now)).toBe(2)
  })
})
