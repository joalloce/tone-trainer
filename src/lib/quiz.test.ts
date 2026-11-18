import { describe, expect, it } from 'vitest'
import syllables from '../data/syllables.json'
import type { Tone } from './pinyin'
import { buildToneSession, summarize, type SyllableEntry, type ToneQuestion } from './quiz'

const entries = syllables as SyllableEntry[]

/** Deterministic random numbers (mulberry32), so tests are repeatable. */
function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const countTones = (questions: ToneQuestion[]) =>
  [1, 2, 3, 4].map((t) => questions.filter((q) => q.tone === t).length)

describe('syllable data', () => {
  it('has only valid tones and at least one character per item', () => {
    for (const entry of entries) {
      expect([1, 2, 3, 4]).toContain(entry.tone)
      expect(entry.hanzi.length).toBeGreaterThan(0)
    }
  })
})

describe('buildToneSession', () => {
  it('balances the four tones in a 20-question session', () => {
    for (let seed = 1; seed <= 50; seed++) {
      const session = buildToneSession(entries, 20, seeded(seed))
      expect(session).toHaveLength(20)
      expect(countTones(session)).toEqual([5, 5, 5, 5])
    }
  })

  it('spreads the remainder when the size is not a multiple of four', () => {
    const counts = countTones(buildToneSession(entries, 22, seeded(7)))
    expect(counts.reduce((a, b) => a + b)).toBe(22)
    expect(Math.max(...counts) - Math.min(...counts)).toBeLessThanOrEqual(1)
  })

  it('does not repeat a syllable within a session', () => {
    for (let seed = 1; seed <= 50; seed++) {
      const syllablesInSession = buildToneSession(entries, 20, seeded(seed)).map((q) => q.syllable)
      expect(new Set(syllablesInSession).size).toBe(20)
    }
  })

  it('uses a character that belongs to the question', () => {
    for (const q of buildToneSession(entries, 20, seeded(3))) {
      const entry = entries.find((e) => e.syllable === q.syllable && e.tone === q.tone)
      expect(entry?.hanzi).toContain(q.hanzi)
    }
  })
})

describe('summarize', () => {
  const q = (syllable: string, tone: Tone): ToneQuestion => ({ syllable, tone, hanzi: '' })

  it('counts correct answers, per-tone stats and misses', () => {
    const summary = summarize([
      { question: q('ma', 1), chosen: 1 },
      { question: q('ma', 3), chosen: 2 },
      { question: q('ba', 3), chosen: 3 },
    ])
    expect(summary.correct).toBe(2)
    expect(summary.total).toBe(3)
    expect(summary.byTone[3]).toEqual({ correct: 1, total: 2 })
    expect(summary.byTone[4]).toEqual({ correct: 0, total: 0 })
    expect(summary.misses).toEqual([{ question: q('ma', 3), chosen: 2 }])
  })
})
