const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { getVideoInfo, probeFormats, downloadVideo } = require('./src/downloader');
const { convertMedia } = require('./src/converter');
const { addTask, getTasks, updateTask, updateTaskOutput } = require('./src/utils');

let win;
function createWindow() {
  win = new BrowserWindow({
    width: 900,
    height: 650,
    webPreferences: { preload: path.join(__dirname, 'preload.js') }
  });
  win.loadFile(path.join(__dirname, 'public', 'index.html'));
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

ipcMain.handle('get-info', (_, url) => getVideoInfo(url));
ipcMain.handle('get-formats', (_, url) => probeFormats(url));
ipcMain.handle('start-download', async (_e, opts) => {
  const task = addTask(opts);
  try {
    /* 1. baixa (sempre MP4 com áudio) */
    const output = await downloadVideo(opts, pr =>
      updateTask(task.id, { progress: pr.percent, status: 'downloading' })
    );
    updateTaskOutput({ id: task.id, outputPath: output });

    /* 2. só converte se houver corte OU formato ≠ mp4 */
    const precisaCortar =
      opts.start !== '0:00' || opts.end !== opts.duration;   // duration vem do front
    const precisaConverter = opts.format && opts.format !== 'mp4';

    if (precisaCortar || precisaConverter) {
      await convertMedia(
        { inputPath: output, format: opts.format, start: opts.start, end: opts.end },
        pr => updateTask(task.id, { progress: pr.percent, status: 'converting' })
      );
    }

    updateTask(task.id, { progress: 100, status: 'done' });
    return task.id;
  } catch (err) {
    updateTask(task.id, { status: 'error' });
    throw err;
  }
});

ipcMain.handle('get-tasks', () => getTasks());
ipcMain.handle('open-devtools', () => {
  if (win) win.webContents.openDevTools({ mode: 'detach' });
});
