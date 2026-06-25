# PromptFlow

Cross-platform teleprompter — PWA core + Electron (Windows) + Mobile PWA.

> 🚧 **Early stage:** design spec done, implementation pending. See [ROADMAP.md](./ROADMAP.md).

## Concept

A distraction-free teleprompter that runs everywhere:
- **Windows desktop:** frameless floating overlay pinned to screen top, system-wide hotkeys
- **Mobile (iOS/Android):** PWA with fullscreen + landscape mode, touch gestures

Built from analysis of [notchprompt](https://github.com/saif0200/notchprompt) (macOS Swift teleprompter).

## Tech Stack

| Layer | Tech |
|-------|------|
| Core engine | TypeScript, Canvas API, Web Components |
| Desktop shell | Electron, globalShortcut |
| Mobile shell | PWA (manifest.json + service worker) |
| Deploy | Vercel (PWA) + GitHub Releases (Windows .exe) |

## Status

🟡 **In design.** Implementation starts next session.

See the [design spec](./docs/superpowers/specs/2026-06-25-promptflow-design.md) for full architecture.
