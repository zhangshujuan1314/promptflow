import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  onShortcut: (cb: (action: string) => void) => {
    ipcRenderer.on('shortcut', (_e, action) => cb(action));
  },
});
