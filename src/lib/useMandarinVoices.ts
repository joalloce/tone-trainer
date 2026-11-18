import { useEffect, useState } from 'react'
import { isSpeechSupported, loadMandarinVoices } from './speech'

export function useMandarinVoices() {
  const [state, setState] = useState({
    voices: [] as SpeechSynthesisVoice[],
    loading: isSpeechSupported(),
  })

  useEffect(() => {
    if (!isSpeechSupported()) return
    let cancelled = false
    const refresh = () => {
      void loadMandarinVoices().then((voices) => {
        if (!cancelled) setState({ voices, loading: false })
      })
    }
    refresh()
    window.speechSynthesis.addEventListener('voiceschanged', refresh)
    return () => {
      cancelled = true
      window.speechSynthesis.removeEventListener('voiceschanged', refresh)
    }
  }, [])

  return state
}
