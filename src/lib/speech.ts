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

/** Higher is better: mainland voices first, then neural and enhanced ones. */
function rank(voice: SpeechSynthesisVoice): number {
  let score = 0
  if (/(cn|hans)/.test(normalizedLang(voice))) score += 10
  if (/natural|xiaoxiao|yunxi/i.test(voice.name)) score += 5
  if (/google/i.test(voice.name)) score += 3
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
  return voices.filter(isMandarin).sort((a, b) => rank(b) - rank(a))
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
