// Browser speech synthesis (Web Speech API) for Mandarin syllables.
//
// Quirks handled here:
// - Voices load asynchronously, and iOS Safari doesn't always fire
//   `voiceschanged`, so we poll for a short time.
// - iOS only allows the first `speak()` inside a tap handler. Callers must
//   start playback from click handlers, never from effects.
// - Chrome can garbage-collect an utterance before it finishes, which drops
//   its `end` event, so we keep a reference to the current one.

export interface SpeakOptions {
  voice?: SpeechSynthesisVoice
  rate?: number
}

export const DEFAULT_RATE = 0.8

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

function normalizedLang(voice: SpeechSynthesisVoice): string {
  return voice.lang.replace('_', '-').toLowerCase()
}

/** Mandarin voices only: excludes Cantonese (zh-HK, yue). */
function isMandarin(voice: SpeechSynthesisVoice): boolean {
  const lang = normalizedLang(voice)
  return (lang.startsWith('zh') || lang.startsWith('cmn')) && !lang.includes('hk') && !lang.includes('yue')
}

/**
 * Mainland Mandarin (zh-CN, zh-Hans). The answer key follows mainland readings,
 * and Taiwan voices read some characters with another tone (危 wéi, 息 xí).
 */
function isMainland(voice: SpeechSynthesisVoice): boolean {
  return /(cn|hans)/.test(normalizedLang(voice))
}

/** Higher is better: neural and enhanced voices first. */
function rank(voice: SpeechSynthesisVoice): number {
  let score = 0
  if (/natural|xiaoxiao|yunxi/i.test(voice.name)) score += 5
  if (/enhanced|premium|tingting/i.test(voice.name)) score += 2
  if (voice.localService) score += 1
  return score
}

export async function loadMandarinVoices(timeoutMs = 3000): Promise<SpeechSynthesisVoice[]> {
  if (!isSpeechSupported()) return []
  const synth = window.speechSynthesis
  const started = Date.now()
  let voices = synth.getVoices()
  while (voices.length === 0 && Date.now() - started < timeoutMs) {
    await new Promise((resolve) => setTimeout(resolve, 100))
    voices = synth.getVoices()
  }
  return pickMandarinVoices(voices)
}

/**
 * Mainland voices when there are any (Taiwan voices are only a fallback),
 * then only the Google ones among them when the browser has them.
 */
export function pickMandarinVoices(voices: readonly SpeechSynthesisVoice[]): SpeechSynthesisVoice[] {
  const mandarin = voices.filter(isMandarin)
  const mainland = mandarin.filter(isMainland)
  const pool = mainland.length > 0 ? mainland : mandarin
  const google = pool.filter((voice) => /google/i.test(voice.name))
  return (google.length > 0 ? google : pool).sort((a, b) => rank(b) - rank(a))
}

let current: SpeechSynthesisUtterance | null = null

/** Speaks the text and resolves when it ends (or fails). */
export function speak(text: string, { voice, rate = DEFAULT_RATE }: SpeakOptions = {}): Promise<void> {
  if (!isSpeechSupported()) return Promise.resolve()
  const synth = window.speechSynthesis
  if (synth.speaking || synth.pending) synth.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = voice?.lang ?? 'zh-CN'
  if (voice) utterance.voice = voice
  utterance.rate = rate
  current = utterance

  return new Promise((resolve) => {
    const done = () => {
      if (current === utterance) current = null
      resolve()
    }
    utterance.onend = done
    utterance.onerror = done
    synth.speak(utterance)
    if (synth.paused) synth.resume()
  })
}
