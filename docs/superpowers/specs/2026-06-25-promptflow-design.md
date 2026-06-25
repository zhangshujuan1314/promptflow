# PromptFlow — Design Spec

## Overview

Cross-platform teleprompter: PWA core + Electron (Windows desktop) + PWA (mobile).  
Derived from analysis of [notchprompt](https://github.com/saif0200/notchprompt) (macOS Swift).

**Goal:** One TypeScript scrolling engine, shared UI components, thin platform shells.

---

## Architecture

```
packages/core/          ← shared: scrolling engine, state, UI (Web Components)
packages/desktop/       ← Electron shell (Windows frameless overlay + globalShortcut)
apps/mobile/            ← PWA entry (static HTML/JS, Vercel-deployed)
```

### Core (packages/core)

| Module | Responsibility |
|--------|---------------|
| `ScrollingEngine` | Canvas 60fps text scroll, lerp, `infinite`/`stopAtEnd`, dual-copy loop |
| `StateManager` | Singleton observable, `@Published`-style reactivity, localStorage persistence |
| `TeleprompterUI` | `<teleprompter-view>`: Canvas overlay, `<teleprompter-controls>`: play/pause/speed/font |
| `ScriptFileIO` | Import/export TXT from FileReader, clipboard paste |
| `Countdown` | 3-2-1 overlay before scroll starts |

### Desktop Shell (packages/desktop)

- Electron `BrowserWindow`: frameless, alwaysOnTop, transparent, skipTaskbar
- `globalShortcut` for Alt+Cmd+P/R/J/H/=/-
- `win.setContentProtection(true)` for privacy mode (Windows)
- `autoHideMenuBar`, `resizable: false`
- Pinned to top-center of primary display
- Loads PWA from local `apps/mobile/dist`

### Mobile Shell (apps/mobile)

- Static HTML + ES modules (no framework build step)
- `manifest.json` for PWA install
- Service worker for offline
- `requestFullscreen()` + `screen.orientation.lock('landscape')`
- Touch gestures: double-tap toggle, vertical swipe = speed, horizontal swipe = jump
- Responsive: vertical split (camera preview area + text area)

---

## Data Flow

```
User Input (keyboard/touch/button)
  → StateManager.set(key, value)
    → StateManager emits change event
      → ScrollingEngine.updateConfig(key, value)
      → Canvas repaint on next rAF frame
      → localStorage debounced save (250ms)
```

State keys: `script`, `isRunning`, `speed`, `fontSize`, `scrollMode`, `countdownBehavior`, `countdownSeconds`, `overlayWidth`, `overlayHeight`, `privacyMode`.

---

## ScrollingEngine Detail

```
requestAnimationFrame loop:
  now = performance.now()
  dt = min((now - lastTime) / 1000, 0.25)   // cap delta
  lastTime = now

  // Smooth acceleration
  speedMult += (targetSpeedMult - speedMult) * min(1, lerpFactor * dt)

  // Integrate
  phase += speed * speedMult * dt

  // Mode-specific
  if stopAtEnd:
    if deferredTarget == null: compute deferredTarget
    if phase >= deferredTarget: phase = deferredTarget; stop()
  else:
    phase = phase % cycleLength

  // Render
  ctx.clearRect(0, 0, w, h)
  ctx.save()
  ctx.fillStyle = 'white'
  ctx.font = `${fontSize}px monospace`
  ctx.translate(0, -phase % cycleLength)
  ctx.fillText(text, 0, anchorY)       // first copy
  ctx.translate(0, cycleLength)
  ctx.fillText(text, 0, anchorY)       // second copy
  ctx.restore()

  // Edge fade mask via gradient overlay
  drawEdgeFade(ctx, w, h, fadeFraction)
```

Canvas-only rendering. No DOM reflow. Text measurement via `ctx.measureText()` for line wrapping.

---

## UI Components (Web Components)

| Component | Tag | API |
|-----------|-----|-----|
| TeleprompterView | `<tp-view>` | Canvas overlay + fade, sized by parent |
| PlaybackControls | `<tp-controls>` | Play/pause/jump-back/speed/font/clear |
| ScriptEditor | `<tp-editor>` | Textarea + import/export + word count + estimated read time |
| SettingsPanel | `<tp-settings>` | Speed slider, font size, scroll mode, countdown, overlay size |
| CountdownOverlay | `<tp-countdown>` | Full-viewport 3-2-1 countdown |

All components read/write `StateManager` directly. No framework dependency.

---

## Desktop Window Specs

- **Size:** 600×150 px default (resizable via settings slider 400–1200 wide, 120–300 tall)
- **Position:** Top-center of primary display, y=0
- **Level:** `alwaysOnTop: true` + `setAlwaysOnTop(true, 'screen-saver')` on Windows
- **Frame:** `transparent: true, frame: false`
- **Privacy:** `setContentProtection(true)` when enabled
- **Shortcuts:** `Alt+Cmd+P/R/J/H/=/O` (mirrors notchprompt where possible, Cmd→Ctrl on Windows)

---

## Mobile Specs

- **Orientation:** Primary landscape, fallback portrait
- **Layout:** Flex row — text area (right 60%) + camera preview area (left 40%, placeholder bg)
- **Touch:**
  - Double-tap center → Start/Pause
  - Swipe up → Increase speed (+5)
  - Swipe down → Decrease speed (-5)
  - Swipe right → Jump back 5s
  - Pinch → Change font size
- **Fullscreen:** `requestFullscreen()` on first play tap
- **Wake lock:** `navigator.wakeLock.request('screen')` to keep screen on

---

## Deploy

| Target | Method |
|--------|--------|
| `apps/mobile` (PWA) | Vercel auto-deploy from `main` branch |
| Windows `.exe` | GitHub Actions + electron-builder, tagged releases |
| Domain | `promptflow.vercel.app` (free tier, upgrade if needed) |

---

## What We Skip (ponytail)

| Skipped | Why | Add when |
|---------|-----|---------|
| React/Vue framework | Web Components suffice for this scope | Complex state UI warrants framework |
| Capacitor native wrappers | PWA handles fullscreen + orientation | Need camera overlay integration |
| macOS build (Electron) | Windows primary; same codebase, different builder config | User requests macOS |
| Multi-display support | Electron `screen` API can add later | User has dual monitors |
| DOCX/PDF import | Web `FileReader` only does text; serverless | Users need rich formats |
| Auto-update | electron-updater adds complexity | First 100 users validate need |

---

## File Tree

```
promptflow/
├── packages/
│   ├── core/
│   │   ├── src/
│   │   │   ├── engine.ts          ← ScrollingEngine
│   │   │   ├── state.ts           ← StateManager
│   │   │   ├── components/
│   │   │   │   ├── tp-view.ts     ← TeleprompterView
│   │   │   │   ├── tp-controls.ts
│   │   │   │   ├── tp-editor.ts
│   │   │   │   ├── tp-settings.ts
│   │   │   │   └── tp-countdown.ts
│   │   │   └── index.ts
│   │   └── package.json
│   └── desktop/
│       ├── src/
│       │   ├── main.ts            ← Electron main
│       │   └── preload.ts
│       ├── package.json
│       └── electron-builder.yml
├── apps/
│   └── mobile/
│       ├── index.html
│       ├── manifest.json
│       ├── sw.js
│       └── app.js
├── docs/superpowers/specs/
│   └── 2026-06-25-promptflow-design.md
└── README.md
```
