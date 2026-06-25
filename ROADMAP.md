# PromptFlow — Implementation Roadmap

## ✅ Done
- [x] notchprompt deep analysis (10 Swift source files, architecture patterns extracted)
- [x] Design spec finalized with architecture decisions
- [x] Tech stack: PWA core + Electron desktop + pure PWA mobile

## 🔲 Not Started

### Phase 1: Core Engine (packages/core)
- [ ] `engine.ts` — ScrollingEngine (Canvas 60fps, lerp acceleration, infinite/stopAtEnd dual-copy loop, edge fade gradient)
- [ ] `state.ts` — StateManager (singleton, observable, localStorage persistence with 250ms debounce)
- [ ] `components/tp-view.ts` — `<tp-view>` Canvas overlay Web Component
- [ ] `components/tp-controls.ts` — `<tp-controls>` play/pause/jump-back/speed/clear buttons
- [ ] `components/tp-editor.ts` — `<tp-editor>` textarea + import/export FileReader + word count + estimated read time
- [ ] `components/tp-settings.ts` — `<tp-settings>` speed/font/scroll-mode/countdown/overlay-size sliders
- [ ] `components/tp-countdown.ts` — `<tp-countdown>` 3-2-1 full-viewport overlay

### Phase 2: Desktop Shell (packages/desktop)
- [ ] `main.ts` — Electron BrowserWindow: frameless, alwaysOnTop, transparent, skipTaskbar, top-center
- [ ] `preload.ts` — context bridge (if needed)
- [ ] `globalShortcut` registration: Alt+Cmd+P/R/J/H/=/O (Cmd→Ctrl on Windows)
- [ ] `setContentProtection(true)` for privacy mode
- [ ] `electron-builder.yml` — Windows NSIS installer config
- [ ] GitHub Actions: build `.exe` on tag push, attach to release

### Phase 3: Mobile PWA (apps/mobile)
- [ ] `index.html` — load core + mobile layout
- [ ] `manifest.json` — PWA installable, `display: standalone`
- [ ] `sw.js` — service worker for offline cache
- [ ] Touch gesture mapping: double-tap=toggle, vertical swipe=speed, horizontal swipe=jump
- [ ] `requestFullscreen()` + `screen.orientation.lock('landscape')` on play
- [ ] `navigator.wakeLock.request('screen')` to prevent screen sleep
- [ ] Camera preview placeholder area (left 40% layout)

### Phase 4: Deploy
- [ ] Vercel auto-deploy `apps/mobile` from `main` branch
- [ ] Custom domain or `promptflow.vercel.app`
- [ ] GitHub Actions release pipeline for Windows `.exe`

## Key Algorithm Notes

### Dual-Copy Canvas Loop (from notchprompt's multi-copy VStack)
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
// target = 1 when running, 0 when paused
// lerpFactor = 8.0 (from notchprompt)
```

### Desktop Window Positioning
Match notchprompt: pin to screen top-center, `alwaysOnTop: 'screen-saver'` level.
Default overlay: 600×150px, configurable 400-1200×120-300.

## Files (not yet created — all 🔲 above)
```
packages/core/src/engine.ts
packages/core/src/state.ts
packages/core/src/components/tp-view.ts
packages/core/src/components/tp-controls.ts
packages/core/src/components/tp-editor.ts
packages/core/src/components/tp-settings.ts
packages/core/src/components/tp-countdown.ts
packages/core/src/index.ts
packages/core/package.json
packages/desktop/src/main.ts
packages/desktop/src/preload.ts
packages/desktop/package.json
packages/desktop/electron-builder.yml
apps/mobile/index.html
apps/mobile/manifest.json
apps/mobile/sw.js
apps/mobile/app.js
```
