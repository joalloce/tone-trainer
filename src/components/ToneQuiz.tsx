import { useEffect, useState } from 'react'
import { TONE_NAMES, TONES, withToneMark, type Tone } from '../lib/pinyin'
import { findEntry, type SyllableEntry, type ToneAnswer, type ToneQuestion } from '../lib/quiz'
import { PlayIcon, ToneContour } from './icons'

interface Props {
  questions: ToneQuestion[]
  entries: readonly SyllableEntry[]
  say: (text: string) => void
  onFinish: (answers: ToneAnswer[]) => void
  onQuit: () => void
}

export function ToneQuiz({ questions, entries, say, onFinish, onQuit }: Props) {
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<ToneAnswer[]>([])

  const question = questions[index]
  const answer: ToneAnswer | undefined = answers[index]
  const isCorrect = answer?.chosen === question.tone
  const isLast = index === questions.length - 1
  const chosenEntry = answer && !isCorrect ? findEntry(entries, question.syllable, answer.chosen) : undefined

  const replay = () => say(question.hanzi)

  const choose = (tone: Tone) => {
    if (answer) return
    setAnswers([...answers, { question, chosen: tone }])
  }

  // Playback starts here, inside the tap, because iOS blocks speech started elsewhere.
  const next = () => {
    if (!answer) return
    if (isLast) {
      onFinish(answers)
      return
    }
    setIndex(index + 1)
    say(questions[index + 1].hanzi)
  }

  // Keyboard shortcuts for desktop: 1-4 answer, R replays, Enter goes on.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (/^[1-4]$/.test(event.key)) choose(Number(event.key) as Tone)
      else if (event.key === 'r') replay()
      else if (event.key === 'Enter') {
        event.preventDefault()
        next()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const buttonState = (tone: Tone) => {
    if (!answer) return ''
    if (tone === question.tone) return 'is-answer'
    if (tone === answer.chosen) return 'is-wrong'
    return 'is-dim'
  }

  return (
    <main className="screen quiz">
      <header className="quiz-header">
        <button className="icon" onClick={onQuit} aria-label="Quit the quiz">
          ✕
        </button>
        <div
          className="progress"
          role="progressbar"
          aria-label="Progress"
          aria-valuemin={0}
          aria-valuemax={questions.length}
          aria-valuenow={answers.length}
        >
          <div style={{ width: `${(answers.length / questions.length) * 100}%` }} />
        </div>
        <span className="count">
          {index + 1} / {questions.length}
        </span>
      </header>

      <div className="stage">
        <button className="play" onClick={replay} aria-label="Play the sound">
          <PlayIcon />
        </button>

        <div className="feedback" aria-live="polite">
          {answer ? (
            <>
              <p className={`verdict ${isCorrect ? 'right' : 'wrong'}`}>
                {isCorrect ? 'Correct' : `Not quite: it's tone ${question.tone}`}
              </p>
              <p className="hanzi" lang="zh-CN">
                {question.hanzi}
              </p>
              <p className={`pinyin tone-${question.tone}`}>{withToneMark(question.syllable, question.tone)}</p>
              {!isCorrect && (
                <p className="compare">
                  You chose{' '}
                  <span className={`pinyin-inline tone-${answer.chosen}`}>
                    {withToneMark(question.syllable, answer.chosen)}
                  </span>
                  {chosenEntry && (
                    <button className="secondary small" onClick={() => say(chosenEntry.hanzi[0])}>
                      <PlayIcon /> Hear it
                    </button>
                  )}
                </p>
              )}
            </>
          ) : (
            <p className="prompt">Which tone do you hear?</p>
          )}
        </div>
      </div>

      <div className="tones">
        {TONES.map((tone) => (
          <button
            key={tone}
            className={`tone-btn tone-${tone} ${buttonState(tone)}`}
            onClick={() => choose(tone)}
            disabled={Boolean(answer)}
            aria-label={`Tone ${tone}, ${TONE_NAMES[tone]}`}
          >
            <ToneContour tone={tone} />
            <span className="tone-num">{tone}</span>
            <span className="tone-name">{TONE_NAMES[tone]}</span>
          </button>
        ))}
      </div>

      <button className="primary next" onClick={next} disabled={!answer}>
        {isLast ? 'See results' : 'Next'}
      </button>
    </main>
  )
}
