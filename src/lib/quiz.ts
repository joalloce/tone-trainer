import { TONES, type Tone } from './pinyin'

export interface SyllableEntry {
  syllable: string
  tone: Tone
  hanzi: string[]
}

export interface ToneQuestion {
  syllable: string
  tone: Tone
  /** The character that speech synthesis reads aloud. */
  hanzi: string
}

export interface ToneAnswer {
  question: ToneQuestion
  chosen: Tone
}

export type Rng = () => number

export const SESSION_SIZE = 20

export function shuffle<T>(items: readonly T[], rng: Rng = Math.random): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * Picks a session of questions with the tones evenly balanced and,
 * where possible, no syllable repeated.
 */
export function buildToneSession(
  entries: readonly SyllableEntry[],
  size = SESSION_SIZE,
  rng: Rng = Math.random,
): ToneQuestion[] {
  const counts = new Map<Tone, number>(TONES.map((t) => [t, Math.floor(size / 4)]))
  for (const tone of shuffle(TONES, rng).slice(0, size % 4)) {
    counts.set(tone, (counts.get(tone) ?? 0) + 1)
  }

  const used = new Set<string>()
  const questions: ToneQuestion[] = []
  for (const tone of TONES) {
    const pool = shuffle(
      entries.filter((e) => e.tone === tone),
      rng,
    )
    const ordered = [
      ...pool.filter((e) => !used.has(e.syllable)),
      ...pool.filter((e) => used.has(e.syllable)),
    ]
    for (const entry of ordered.slice(0, counts.get(tone))) {
      used.add(entry.syllable)
      questions.push({
        syllable: entry.syllable,
        tone,
        hanzi: entry.hanzi[Math.floor(rng() * entry.hanzi.length)],
      })
    }
  }
  return shuffle(questions, rng)
}

export function findEntry(
  entries: readonly SyllableEntry[],
  syllable: string,
  tone: Tone,
): SyllableEntry | undefined {
  return entries.find((e) => e.syllable === syllable && e.tone === tone)
}

export interface ToneSummary {
  correct: number
  total: number
  byTone: Record<Tone, { correct: number; total: number }>
  misses: ToneAnswer[]
}

export function summarize(answers: readonly ToneAnswer[]): ToneSummary {
  const byTone = Object.fromEntries(TONES.map((t) => [t, { correct: 0, total: 0 }])) as ToneSummary['byTone']
  const misses: ToneAnswer[] = []
  for (const answer of answers) {
    const stats = byTone[answer.question.tone]
    stats.total++
    if (answer.chosen === answer.question.tone) stats.correct++
    else misses.push(answer)
  }
  return { correct: answers.length - misses.length, total: answers.length, byTone, misses }
}
