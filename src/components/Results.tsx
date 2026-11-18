import { TONES, withToneMark } from '../lib/pinyin'
import { summarize, type ToneAnswer } from '../lib/quiz'
import { PlayIcon, ToneContour } from './icons'

interface Props {
  answers: ToneAnswer[]
  say: (text: string) => void
  onAgain: () => void
  onHome: () => void
}

function message(correct: number, total: number): string {
  if (correct === total) return 'A perfect round.'
  if (correct >= total * 0.8) return 'Great ear. Replay the misses below.'
  if (correct >= total * 0.5) return 'Good progress. Replay the misses below.'
  return 'Tones take lots of listening. Replay the misses below.'
}

export function Results({ answers, say, onAgain, onHome }: Props) {
  const { correct, total, byTone, misses } = summarize(answers)

  return (
    <main className="screen">
      <header>
        <p className="score">
          {correct} <span>/ {total}</span>
        </p>
        <p className="subtitle">{message(correct, total)}</p>
      </header>

      <section>
        <h2>By tone</h2>
        <ul className="by-tone">
          {TONES.map((tone) => {
            const stats = byTone[tone]
            const share = stats.total ? stats.correct / stats.total : 0
            return (
              <li key={tone} className={`tone-${tone}`}>
                <ToneContour tone={tone} />
                <span>Tone {tone}</span>
                <div className="bar" aria-hidden="true">
                  <div style={{ width: `${share * 100}%` }} />
                </div>
                <span className="muted">
                  {stats.correct} / {stats.total}
                </span>
              </li>
            )
          })}
        </ul>
      </section>

      {misses.length > 0 && (
        <section>
          <h2>Your misses</h2>
          <ul className="misses">
            {misses.map(({ question, chosen }, i) => (
              <li key={i}>
                <button
                  className="secondary round"
                  onClick={() => say(question.hanzi)}
                  aria-label={`Play ${question.hanzi}`}
                >
                  <PlayIcon />
                </button>
                <span className="hanzi-small" lang="zh-CN">
                  {question.hanzi}
                </span>
                <span className={`pinyin-inline tone-${question.tone}`}>
                  {withToneMark(question.syllable, question.tone)}
                </span>
                <span className="muted">you chose tone {chosen}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="actions">
        <button className="primary" onClick={onAgain}>
          Another round
        </button>
        <button className="secondary" onClick={onHome}>
          Home
        </button>
      </div>
    </main>
  )
}
