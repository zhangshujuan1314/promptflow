import { app, BrowserWindow, globalShortcut, screen } from 'electron';
import * as path from 'path';

let win: BrowserWindow | null = null;
let visible = true;

function createWindow(): void {
  const display = screen.getPrimaryDisplay();
  const { width: sw } = display.workAreaSize;
  const ww = 600, wh = 150;

  win = new BrowserWindow({
    width: ww, height: wh,
    x: Math.round((sw - ww) / 2), y: 0,
    frame: false, transparent: true, alwaysOnTop: true,
    skipTaskbar: true, resizable: false, autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
  });

  win.setAlwaysOnTop(true, 'screen-saver');

  const isDev = !app.isPackaged;
  const html = isDev
    ? path.join(__dirname, '../../apps/mobile/index.html')
    : path.join(__dirname, '../apps/mobile/index.html');
  win.loadFile(html);
  registerShortcuts();
}

function registerShortcuts(): void {
  const send = (a: string) => win?.webContents.send('shortcut', a);
  globalShortcut.register('Alt+Ctrl+P', () => send('togglePlay'));
  globalShortcut.register('Alt+Ctrl+R', () => send('stop'));
  globalShortcut.register('Alt+Ctrl+J', () => send('jumpBack'));
  globalShortcut.register('Alt+Ctrl+H', () => {
    if (!win) return;
    visible ? win.hide() : win.show();
    visible = !visible;
  });
  globalShortcut.register('Alt+Ctrl+=', () => send('speedUp'));
  globalShortcut.register('Alt+Ctrl+-', () => send('speedDown'));
  globalShortcut.register('Alt+Ctrl+O', () => send('toggleOverlay'));
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { globalShortcut.unregisterAll(); app.quit(); });
app.on('will-quit', () => { globalShortcut.unregisterAll(); });
