const ffmpeg = require('fluent-ffmpeg');
const path   = require('path');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;   // <-- NOVO
ffmpeg.setFfmpegPath(ffmpegPath);

function convertMedia({ inputPath, format, start, end }, onProgress) {
  return new Promise((resolve, reject) => {
    const dir  = path.dirname(inputPath);
    const base = path.basename(inputPath, path.extname(inputPath));
    const out  = path.join(dir, `${base}.${format}`);

    let cmd = ffmpeg(inputPath).output(out);
    if (start) cmd = cmd.setStartTime(start);
    if (end) {
      const sec = t => t.split(':').reduce((a,v)=>a*60+ +v,0);
      cmd = cmd.setDuration(sec(end) - sec(start));
    }
    if (format === 'mp3') cmd = cmd.noVideo();
    if (format === 'gif') cmd = cmd.format('gif');

    cmd.on('progress', p => onProgress({ percent: Math.round(p.percent) }));
    cmd.on('end', () => resolve(out));
    cmd.on('error', reject);
    cmd.run();
  });
}

module.exports = { convertMedia };
