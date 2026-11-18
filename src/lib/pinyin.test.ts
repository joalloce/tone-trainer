import { describe, expect, it } from 'vitest'
import { withToneMark } from './pinyin'

describe('withToneMark', () => {
  it.each([
    ['ma', 3, 'mǎ'],
    ['hao', 3, 'hǎo'],
    ['ai', 4, 'ài'],
    ['xue', 2, 'xué'],
    ['wei', 4, 'wèi'],
    ['er', 4, 'èr'],
    ['dou', 1, 'dōu'],
    ['ou', 3, 'ǒu'],
    ['gui', 4, 'guì'],
    ['liu', 2, 'liú'],
    ['zhuang', 4, 'zhuàng'],
    ['yi', 1, 'yī'],
    ['nü', 3, 'nǚ'],
    ['lüe', 4, 'lüè'],
    ['lv', 4, 'lǜ'],
    ['lu:', 2, 'lǘ'],
  ] as const)('%s + tone %i -> %s', (syllable, tone, expected) => {
    expect(withToneMark(syllable, tone)).toBe(expected)
  })
})
