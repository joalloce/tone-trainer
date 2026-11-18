export type Tone = 1 | 2 | 3 | 4

export const TONES: readonly Tone[] = [1, 2, 3, 4]

const MARKS: Record<string, string> = {
  a: 'āáǎà',
  e: 'ēéěè',
  i: 'īíǐì',
  o: 'ōóǒò',
  u: 'ūúǔù',
  ü: 'ǖǘǚǜ',
}

/**
 * Adds the tone mark to a toneless syllable: ("ma", 3) -> "mǎ".
 *
 * Rules: mark "a" or "e" if present; in "ou" mark the "o";
 * otherwise mark the last vowel (so "gui" -> "guì", "liu" -> "liú").
 */
export function withToneMark(syllable: string, tone: Tone): string {
  const s = syllable.toLowerCase().replace(/v|u:/g, 'ü')
  let index = s.search(/[ae]/)
  if (index === -1) index = s.indexOf('ou')
  if (index === -1) {
    for (let i = s.length - 1; i >= 0; i--) {
      if (s[i] in MARKS) {
        index = i
        break
      }
    }
  }
  if (index === -1) return s
  return s.slice(0, index) + MARKS[s[index]][tone - 1] + s.slice(index + 1)
}

/** The Chao tone contour of each tone, as pitch levels from 1 (low) to 5 (high). */
export const TONE_CONTOURS: Record<Tone, number[]> = {
  1: [5, 5],
  2: [3, 5],
  3: [2, 1, 4],
  4: [5, 1],
}

export const TONE_NAMES: Record<Tone, string> = {
  1: 'high and flat',
  2: 'rising',
  3: 'low, dipping',
  4: 'falling',
}
