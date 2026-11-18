# Tone Trainer

A small web app for hearing the four Mandarin tones: it plays a syllable, you pick the tone, and you get instant feedback. It's built as an installable web app (PWA) for daily practice on a phone.

## Features

- **Tone quiz:** 20 syllables per session with the tones evenly balanced. Replay as often as you like.
- **Instant feedback:** see the character and its pinyin. If you miss, hear the tone you chose next to the right one.
- **Results:** your score, accuracy per tone, and a list of misses to replay.
- **Audio check:** pick the Mandarin voice and speed, and test 妈 麻 马 骂.
- **Progress on the device:** sessions are saved in `localStorage`. There's no account and no server.

## How it works

- **Audio:** the browser's speech synthesis ([Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis)) reads a character with the target syllable and tone. Voice quality depends on the device, so the audio check lets you pick the best one.
- **Syllable data:** `scripts/build-syllables.ts` uses [pinyin-pro](https://github.com/zh-lx/pinyin-pro) to build `src/data/syllables.json` from a list of common characters. It keeps only characters with exactly one reading, so speech synthesis can't pick a different pronunciation (好 can be hǎo or hào, so it's out). It currently covers 761 syllable + tone combinations across 345 syllables.
- **Neutral tone:** left out of this quiz on purpose. It only exists after another syllable (妈**妈**), so it belongs in a two-syllable quiz.

## Development

Requires Node 22.18+ (to run the TypeScript data script directly) and pnpm.

```sh
pnpm install
pnpm dev          # http://localhost:5173
pnpm dev:phone    # also serves on your network: open the "Network" URL on your phone
pnpm test         # unit tests (Vitest)
pnpm lint
pnpm build
pnpm data         # regenerate src/data/syllables.json
```

## Deploy

`.github/workflows/deploy.yml` tests, builds and deploys to GitHub Pages on every push to `main`. In the repository settings, under **Pages**, set the source to **GitHub Actions**.

To install it on a phone, open the deployed URL and use **Add to Home Screen** (Safari's share menu on iPhone, or the menu in Chrome on Android).

## Roadmap

- Pinyin quiz: hear a syllable and type it (`ma3` or `mǎ`)
- Daily streak
- Tone pairs: two-syllable words, including the neutral tone
- Focus mode: practice the tones you miss most
- Pitch comparison: record yourself and compare pitch curves
