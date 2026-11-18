import { describe, expect, it } from 'vitest'
import { pickMandarinVoices } from './speech'

const voice = (name: string, lang: string, localService = true) =>
  ({ name, lang, localService, voiceURI: name, default: false }) as SpeechSynthesisVoice

const names = (voices: SpeechSynthesisVoice[]) => voices.map((v) => v.name)

describe('pickMandarinVoices', () => {
  it('keeps only the Google voices when the browser has them', () => {
    const voices = [
      voice('Tingting', 'zh-CN'),
      voice('Google 國語（臺灣）', 'zh-TW', false),
      voice('Google 普通话（中国大陆）', 'zh-CN', false),
      voice('Google 粤語（香港）', 'zh-HK', false),
      voice('Samantha', 'en-US'),
    ]
    expect(names(pickMandarinVoices(voices))).toEqual(['Google 普通话（中国大陆）', 'Google 國語（臺灣）'])
  })

  it('keeps every Mandarin voice when there is no Google voice', () => {
    const voices = [voice('Meijia', 'zh-TW'), voice('Sinji', 'zh-HK'), voice('Tingting', 'zh-CN')]
    expect(names(pickMandarinVoices(voices))).toEqual(['Tingting', 'Meijia'])
  })
})
