const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getInfo: url => ipcRenderer.invoke('get-info', url),
  getFormats: url => ipcRenderer.invoke('get-formats', url),
  startDownload: opts => ipcRenderer.invoke('start-download', opts),
  getTasks: () => ipcRenderer.invoke('get-tasks'),
  onTaskUpdate: cb => ipcRenderer.on('task-updated', (_e, data) => cb(data)),
  openDev: () => ipcRenderer.invoke('open-devtools'),
});