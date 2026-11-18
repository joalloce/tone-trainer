import { describe, expect, it } from 'vitest'
import { pickMandarinVoices } from './speech'

const voice = (name: string, lang: string, localService = true) =>
  ({ name, lang, localService, voiceURI: name, default: false }) as SpeechSynthesisVoice

const names = (voices: SpeechSynthesisVoice[]) => voices.map((v) => v.name)

describe('pickMandarinVoices', () => {
  it('keeps only the mainland Google voices when the browser has them', () => {
    const voices = [
      voice('Tingting', 'zh-CN'),
      voice('Google 國語（臺灣）', 'zh-TW', false),
      voice('Google 普通话（中国大陆）', 'zh-CN', false),
      voice('Google 粤語（香港）', 'zh-HK', false),
      voice('Samantha', 'en-US'),
    ]
    expect(names(pickMandarinVoices(voices))).toEqual(['Google 普通话（中国大陆）'])
  })

  it('keeps every mainland voice when there is no Google one', () => {
    const voices = [voice('Meijia', 'zh-TW'), voice('Sinji', 'zh-HK'), voice('Lili', 'zh-CN'), voice('Tingting', 'zh-CN')]
    expect(names(pickMandarinVoices(voices))).toEqual(['Tingting', 'Lili'])
  })

  it('prefers a mainland voice over a Google Taiwan voice', () => {
    const voices = [voice('Google 國語（臺灣）', 'zh-TW', false), voice('Tingting', 'zh-CN')]
    expect(names(pickMandarinVoices(voices))).toEqual(['Tingting'])
  })

  it('recognizes mainland voices by script and underscore codes', () => {
    const voices = [voice('A', 'cmn-Hans-CN'), voice('B', 'zh_CN'), voice('C', 'zh-Hant-TW')]
    expect(names(pickMandarinVoices(voices))).toEqual(['A', 'B'])
  })

  it('falls back to Taiwan voices when there is no mainland voice', () => {
    const voices = [voice('Meijia', 'zh-TW'), voice('Sinji', 'zh-HK')]
    expect(names(pickMandarinVoices(voices))).toEqual(['Meijia'])
  })
})
