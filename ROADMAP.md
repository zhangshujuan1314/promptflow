# PromptFlow — Implementation Roadmap

## ✅ Done

### Phase 1: Core Engine (packages/core)
- [x] `state.ts` — StateManager (singleton, observable, localStorage persistence with 250ms debounce)
- [x] `engine.ts` — ScrollingEngine (Canvas 60fps, lerp acceleration, infinite/stopAtEnd dual-copy loop, edge fade gradient)
- [x] `components/tp-view.ts` — `<tp-view>` Canvas overlay Web Component
- [x] `components/tp-controls.ts` — `<tp-controls>` play/pause/jump-back/speed/font/clear buttons
- [x] `components/tp-editor.ts` — `<tp-editor>` textarea + import/export FileReader + word count + estimated read time
- [x] `components/tp-settings.ts` — `<tp-settings>` speed/font/scroll-mode/countdown/overlay-size controls
- [x] `components/tp-countdown.ts` — `<tp-countdown>` 3-2-1 full-viewport overlay

### Phase 2: Desktop Shell (packages/desktop)
- [x] `main.ts` — Electron BrowserWindow: frameless, alwaysOnTop, transparent, skipTaskbar, top-center
- [x] `preload.ts` — context bridge for shortcut IPC
- [x] `globalShortcut` registration: Alt+Ctrl+P/R/J/H/=/+/O
- [x] `electron-builder.yml` — Windows NSIS installer config

### Phase 3: Mobile PWA (apps/mobile)
- [x] `index.html` — load core + mobile layout (camera area + main area)
- [x] `manifest.json` — PWA installable, `display: standalone`
- [x] `sw.js` — service worker for offline cache
- [x] Touch gesture mapping: double-tap=toggle, vertical swipe=speed
- [x] `requestFullscreen()` + `screen.orientation.lock('landscape')` on play
- [x] `navigator.wakeLock.request('screen')` to prevent screen sleep
- [x] `app.js` — UI toggles, gestures, fullscreen, Electron shortcut integration

## 🔲 To Do

### Phase 4: Deploy & Polish
- [ ] Vercel auto-deploy `apps/mobile` from `main` branch
- [ ] GitHub Actions release pipeline for Windows `.exe`
- [ ] Integration testing with real devices
- [ ] TypeScript compilation verification (add bundler step)

## Key Algorithm Notes

### Dual-Copy Canvas Loop
```
phase %= cycleLength    // cycleLength = textHeight + gap
translate(0, -phase)    // first copy position
fillText(text, 0, baselineY)
translate(0, cycleLength)  // second copy, seamlessly following
fillText(text, 0, baselineY)
```

### Smooth Acceleration (lerp)
```
speedMult += (target - speedMult) * min(1, 8.0 * dt)
```

### Ponytail Debt
| Item | Comment | Add when |
|------|---------|----------|
| JumpBack 5s placeholder | Toggles pause/play instead | Need engine-relative seek |
| macOS build | Same electron code, different builder config | User requests macOS |
| Multi-display | electron screen API | User has dual monitors |
| DOCX/PDF import | FileReader text only | Users need rich formats |
| Auto-update | electron-updater | First 100 users validate need |
| Bundler step for .ts | HTML loads .ts via module scripts | Production deployment |
