import { TONES, withToneMark } from '../lib/pinyin'
import type { Settings } from '../lib/storage'
import { PlayIcon } from './icons'

interface Props {
  supported: boolean
  loading: boolean
  voices: SpeechSynthesisVoice[]
  voice: SpeechSynthesisVoice | undefined
  settings: Settings
  onSettingsChange: (settings: Settings) => void
  say: (text: string) => Promise<void>
  onBack: () => void
}

const SAMPLES = ['妈', '麻', '马', '骂']

export function AudioCheck({ supported, loading, voices, voice, settings, onSettingsChange, say, onBack }: Props) {
  const playAll = async () => {
    for (const hanzi of SAMPLES) {
      await say(hanzi)
      await new Promise((resolve) => setTimeout(resolve, 300))
    }
  }

  return (
    <main className="screen">
      <header className="quiz-header">
        <button className="icon" onClick={onBack} aria-label="Back">
          ←
        </button>
        <h1 className="title-small">Audio check</h1>
      </header>

      {!supported ? (
        <p className="notice">
          This browser can't play speech. Try Safari on iPhone, or Chrome or Edge elsewhere.
        </p>
      ) : loading ? (
        <p className="muted">Looking for Mandarin voices…</p>
      ) : (
        <>
          {voices.length === 0 ? (
            <p className="notice">
              No Mandarin voice found. The quiz will use the default voice, which may not speak Chinese.
            </p>
          ) : (
            <label className="field">
              <span>Voice</span>
              <select
                value={voice?.voiceURI ?? ''}
                onChange={(event) => onSettingsChange({ ...settings, voiceURI: event.target.value })}
              >
                {voices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name} ({v.lang}){v.localService ? '' : ', online'}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="field">
            <span>
              Speed: <strong>{settings.rate.toFixed(2)}×</strong>
            </span>
            <input
              type="range"
              min="0.5"
              max="1.2"
              step="0.05"
              value={settings.rate}
              onChange={(event) => onSettingsChange({ ...settings, rate: Number(event.target.value) })}
            />
          </label>

          <section>
            <h2>Test the four tones</h2>
            <div className="samples">
              {SAMPLES.map((hanzi, i) => (
                <button key={hanzi} className={`sample tone-${TONES[i]}`} onClick={() => void say(hanzi)}>
                  <span className="hanzi-small" lang="zh-CN">
                    {hanzi}
                  </span>
                  <span className="pinyin-inline">{withToneMark('ma', TONES[i])}</span>
                </button>
              ))}
            </div>
            <button className="secondary play-all" onClick={() => void playAll()}>
              <PlayIcon /> Play all four
            </button>
          </section>
        </>
      )}

      <section className="help">
        <h2>If it sounds wrong</h2>
        <p>
          Try another voice, and listen for four clearly different shapes: high and flat, rising, low and dipping,
          falling.
        </p>
        <p>
          <strong>iPhone:</strong> Settings → Accessibility → Spoken Content → Voices → Chinese. Download an Enhanced or
          Premium voice, then reopen this page.
        </p>
        <p>
          <strong>Android:</strong> in Settings, find Text-to-speech output and install the Chinese (Mandarin) voice
          data for Google's speech engine.
        </p>
        <p>
          <strong>Computer:</strong> Edge has natural-sounding online voices; Chrome has a Google Mandarin voice.
        </p>
      </section>
    </main>
  )
}
