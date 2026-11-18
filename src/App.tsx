import { useState } from 'react'
import { AudioCheck } from './components/AudioCheck'
import { Home } from './components/Home'
import { Results } from './components/Results'
import { ToneQuiz } from './components/ToneQuiz'
import syllables from './data/syllables.json'
import { buildToneSession, summarize, type SyllableEntry, type ToneAnswer, type ToneQuestion } from './lib/quiz'
import { isSpeechSupported, speak } from './lib/speech'
import { addSession, loadSessions, loadSettings, saveSettings, type Settings } from './lib/storage'
import { useMandarinVoices } from './lib/useMandarinVoices'

const entries = syllables as SyllableEntry[]

type Screen =
  | { name: 'home' }
  | { name: 'tone-quiz'; questions: ToneQuestion[] }
  | { name: 'results'; answers: ToneAnswer[] }
  | { name: 'audio' }

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'home' })
  const [settings, setSettings] = useState(loadSettings)
  const [sessions, setSessions] = useState(loadSessions)
  const { voices, loading } = useMandarinVoices()

  const supported = isSpeechSupported()
  const voice = voices.find((v) => v.voiceURI === settings.voiceURI) ?? voices[0]
  const say = (text: string) => speak(text, { voice, rate: settings.rate })

  const updateSettings = (next: Settings) => {
    setSettings(next)
    saveSettings(next)
  }

  // Called from a tap, so iOS allows the first sound to play.
  const startToneQuiz = () => {
    const questions = buildToneSession(entries)
    void say(questions[0].hanzi)
    setScreen({ name: 'tone-quiz', questions })
  }

  const finishToneQuiz = (answers: ToneAnswer[]) => {
    const { correct, total, misses } = summarize(answers)
    const record = {
      kind: 'tone' as const,
      finishedAt: new Date().toISOString(),
      correct,
      total,
      misses: misses.map(({ question, chosen }) => ({ syllable: question.syllable, tone: question.tone, chosen })),
    }
    setSessions(addSession(record))
    setScreen({ name: 'results', answers })
  }

  const goHome = () => setScreen({ name: 'home' })

  switch (screen.name) {
    case 'tone-quiz':
      return (
        <ToneQuiz
          questions={screen.questions}
          entries={entries}
          say={say}
          onFinish={finishToneQuiz}
          onQuit={goHome}
        />
      )
    case 'results':
      return <Results answers={screen.answers} say={say} onAgain={startToneQuiz} onHome={goHome} />
    case 'audio':
      return (
        <AudioCheck
          supported={supported}
          loading={loading}
          voices={voices}
          voice={voice}
          settings={settings}
          onSettingsChange={updateSettings}
          say={say}
          onBack={goHome}
        />
      )
    case 'home': {
      const voiceProblem = !supported
        ? "This browser can't play speech."
        : !loading && voices.length === 0
          ? 'No Mandarin voice found on this device.'
          : null
      return (
        <Home
          sessions={sessions}
          voiceProblem={voiceProblem}
          onStartTone={startToneQuiz}
          onAudioCheck={() => setScreen({ name: 'audio' })}
        />
      )
    }
  }
}
