// Ponytail: bare ES module imports — works in dev, bundler for production
import '../../packages/core/src/components/tp-view.ts';
import '../../packages/core/src/components/tp-controls.ts';
import '../../packages/core/src/components/tp-editor.ts';
import '../../packages/core/src/components/tp-settings.ts';
import '../../packages/core/src/components/tp-countdown.ts';
import { StateManager } from '../../packages/core/src/state.ts';

const state = StateManager.getInstance();

// Panel toggles
const toggleEditor = document.getElementById('toggleEditor');
const toggleSettings = document.getElementById('toggleSettings');
const panel = document.getElementById('panel-area');

toggleEditor?.addEventListener('click', () => {
  const v = panel.style.display !== 'none';
  panel.style.display = v ? 'none' : 'flex';
  toggleEditor.textContent = v ? '✎ Edit' : '✕ Close';
});
toggleSettings?.addEventListener('click', () => {
  const v = panel.style.display !== 'none';
  panel.style.display = v ? 'none' : 'flex';
  toggleSettings.textContent = v ? '⚙ Settings' : '✕ Close';
});

// Touch gestures
let tsY = 0, tsX = 0, lastTap = 0;
document.addEventListener('touchstart', e => {
  tsY = e.touches[0].clientY; tsX = e.touches[0].clientX;
});
document.addEventListener('touchend', e => {
  const dy = e.changedTouches[0].clientY - tsY;
  const dx = e.changedTouches[0].clientX - tsX;
  const now = Date.now();
  if (now - lastTap < 300 && Math.abs(dx) < 20 && Math.abs(dy) < 20) {
    state.set('isRunning', !state.get('isRunning'));
  }
  lastTap = now;
  if (Math.abs(dy) > 30 && Math.abs(dy) > Math.abs(dx)) {
    const s = state.get('speed');
    state.set('speed', +Math.max(0.1, Math.min(5, s + (dy > 0 ? -0.1 : 0.1))).toFixed(1));
  }
});

// Fullscreen + wake lock on play
let wakeLock = null;
state.subscribe('isRunning', async (running) => {
  if (running) {
    try {
      await document.documentElement.requestFullscreen();
      await screen.orientation.lock('landscape');
      wakeLock = await navigator.wakeLock.request('screen');
    } catch {}
  } else {
    if (wakeLock) { wakeLock.release(); wakeLock = null; }
  }
});

// Electron shortcuts (when running in Electron)
if (window.electronAPI) {
  window.electronAPI.onShortcut((action) => {
    switch (action) {
      case 'togglePlay': state.set('isRunning', !state.get('isRunning')); break;
      case 'stop': state.set('isRunning', false); break;
      case 'speedUp': state.set('speed', Math.min(5, +(state.get('speed') + 0.1).toFixed(1))); break;
      case 'speedDown': state.set('speed', Math.max(0.1, +(state.get('speed') - 0.1).toFixed(1))); break;
    }
  });
}
