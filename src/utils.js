const { BrowserWindow } = require('electron');
let nextId = 1;
const tasks = [];

function addTask(opts) {
  const task = { id: nextId++, ...opts, progress: 0, status: 'queued', outputPath: null };
  tasks.push(task); broadcast(task);
  return task;
}

function getTasks() { return tasks; }

function updateTask(id, fields) {
  const t = tasks.find(x => x.id === id);
  Object.assign(t, fields); broadcast(t);
}

function updateTaskOutput({ id, outputPath }) {
  updateTask(id, { outputPath });
}

function broadcast(task) {
  BrowserWindow.getAllWindows().forEach(w => w.webContents.send('task-updated', task));
}

module.exports = { addTask, getTasks, updateTask, updateTaskOutput };