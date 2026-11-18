import type { SessionRecord } from '../lib/storage'
import { currentStreak } from '../lib/streak'

interface Props {
  sessions: SessionRecord[]
  voiceProblem: string | null
  onStartTone: () => void
  onAudioCheck: () => void
}

function isToday(iso: string): boolean {
  return new Date(iso).toDateString() === new Date().toDateString()
}

function formatWhen(iso: string): string {
  const date = new Date(iso)
  const day = isToday(iso) ? 'Today' : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  return `${day}, ${date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`
}

export function Home({ sessions, voiceProblem, onStartTone, onAudioCheck }: Props) {
  const today = sessions.filter((s) => isToday(s.finishedAt))
  const best = Math.max(0, ...today.map((s) => s.correct))
  const recent = sessions.slice(-5).reverse()
  const streak = currentStreak(sessions)

  return (
    <main className="screen">
      <header>
        <h1>Tone Trainer</h1>
        <p className="subtitle" lang="zh-CN">
          声调练习
        </p>
      </header>

      {voiceProblem && (
        <p className="notice">
          {voiceProblem}{' '}
          <button className="link" onClick={onAudioCheck}>
            Open the audio check
          </button>
        </p>
      )}

      <button className="primary big" onClick={onStartTone}>
        <span>Tone quiz</span>
        <small>Hear 20 syllables and pick each tone</small>
      </button>
      <button className="secondary" onClick={onAudioCheck}>
        Audio check
      </button>

      <section>
        <h2>Today</h2>
        <p className="muted">
          {today.length === 0
            ? 'No sessions yet today.'
            : `${today.length} ${today.length === 1 ? 'session' : 'sessions'}, best score ${best}`}
        </p>
        {streak > 0 && (
          <p>
            <strong>{streak}-day streak.</strong>{' '}
            <span className="muted">
              {today.length > 0 ? 'Come back tomorrow to keep it going.' : 'Do a session today to keep it going.'}
            </span>
          </p>
        )}
        {recent.length > 0 && (
          <>
            <h2>Recent</h2>
            <ol className="recent">
              {recent.map((s) => (
                <li key={s.finishedAt}>
                  <span className="muted">{formatWhen(s.finishedAt)}</span>
                  <span>
                    {s.correct} / {s.total}
                  </span>
                </li>
              ))}
            </ol>
          </>
        )}
      </section>
    </main>
  )
}
