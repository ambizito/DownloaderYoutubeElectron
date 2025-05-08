/* ─────────── src/downloader.js ─────────── */
const { spawn } = require('child_process');
const path     = require('path');
const fs       = require('fs');

/* Resolve executável */
const ytDlpCmd = () => process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp';

/* 1 ─ Metadados JSON */
function getVideoInfo(url) {
  return new Promise((res, rej) => {
    let json = '';
    const p = spawn(ytDlpCmd(), ['-j', url]);      // ← sem shell:true
    p.stdout.on('data', d => json += d);
    p.on('close', () => json ? res(JSON.parse(json)) : rej(new Error('yt-dlp não retornou JSON')));
    p.on('error', rej);
  });
}

/* 2 ─ Lista de formatos */
function probeFormats(url) {
  return new Promise((res, rej) => {
    const list = [];
    const p = spawn(ytDlpCmd(), ['-F', url]);
    p.stdout.on('data', d => {
      d.toString().split('\n').forEach(l => {
        const p = l.trim().split(/\s+/);
        if (/^\d+$/.test(p[0])) list.push({ code:p[0], ext:p[1], res:p[2] });
      });
    });
    p.on('close', () => res(list));
    p.on('error', rej);
  });
}

/* 3 ─ Download vídeo+áudio */
function downloadVideo({ url, maxHeight = 1080 }, onProgress) {
  return new Promise((resolve, reject) => {
    const outDir = path.resolve(__dirname, '../downloads');
    fs.mkdirSync(outDir, { recursive:true });

    const tpl   = path.join(outDir, '%(title)s.%(ext)s');
    const fmt   = `bestvideo[height<=${maxHeight}]+bestaudio/best`;
    const args  = ['-f', fmt, url, '-o', tpl, '--windows-filenames', '--print', 'after_move:filepath'];

    console.log('[yt-dlp] spawn:', ytDlpCmd(), args.join(' '));
    const p = spawn(ytDlpCmd(), args);             // ← sem shell:true

    let filePath = null, errBuf = '';
    p.stdout.on('data', d => { const s=d.toString().trim(); if (s) filePath = s; });
    p.stderr.on('data', d => {
      errBuf += d;
      const perc = d.toString().match(/(\\d+\\.\\d+)%/)?.[1];
      if (perc) onProgress({ percent:+perc });
    });

    p.on('close', code => {
      if (code === 0 && filePath) return resolve(filePath);
      console.error('[yt-dlp] ERROR:\n', errBuf);
      reject(new Error(`yt-dlp saiu com código ${code}`));
    });
    p.on('error', reject);
  });
}

module.exports = { getVideoInfo, probeFormats, downloadVideo };
/* ─────────────────────────────────────────── */
