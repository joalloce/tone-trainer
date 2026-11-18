import { TONE_CONTOURS, type Tone } from '../lib/pinyin'

/** The tone's pitch shape, drawn from its Chao tone numbers (1 = low, 5 = high). */
export function ToneContour({ tone }: { tone: Tone }) {
  const levels = TONE_CONTOURS[tone]
  const points = levels
    .map((level, i) => {
      const x = 6 + (i * 28) / (levels.length - 1)
      const y = 34 - (level - 1) * 7
      return `${x},${y}`
    })
    .join(' ')
  return (
    <svg className="contour" viewBox="0 0 40 40" aria-hidden="true">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5z" fill="currentColor" />
    </svg>
  )
}
