// Progress and settings, saved on the device with localStorage.
// Every access is wrapped, because storage can be blocked (private mode).
import type { Tone } from './pinyin'
import { DEFAULT_RATE } from './speech'

const SETTINGS_KEY = 'tone-trainer.settings.v1'
const SESSIONS_KEY = 'tone-trainer.sessions.v1'

export interface Settings {
  voiceURI: string | null
  rate: number
}

export interface SessionRecord {
  kind: 'tone'
  finishedAt: string
  correct: number
  total: number
  misses: { syllable: string; tone: Tone; chosen: Tone }[]
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage full or blocked: progress just isn't saved.
  }
}

export function loadSettings(): Settings {
  return { voiceURI: null, rate: DEFAULT_RATE, ...read<Partial<Settings>>(SETTINGS_KEY, {}) }
}

export function saveSettings(settings: Settings): void {
  write(SETTINGS_KEY, settings)
}

export function loadSessions(): SessionRecord[] {
  return read<SessionRecord[]>(SESSIONS_KEY, [])
}

/** Appends a finished session and returns the full history. */
export function addSession(record: SessionRecord): SessionRecord[] {
  const sessions = [...loadSessions(), record]
  write(SESSIONS_KEY, sessions)
  return sessions
}
