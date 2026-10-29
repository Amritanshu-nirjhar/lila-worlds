// Renders tools/clips.html frame by frame and encodes looping MP4s into ../media.
// Usage: node tools/render-clips.cjs <path-to-puppeteer-core> [baseUrl]
// Needs ffmpeg on PATH and the site served (default http://localhost:5173).
const puppeteer = require(process.argv[2]);
const base = process.argv[3] || 'http://localhost:5173';
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const FPS = 30, LOOP = 6, media = path.join(__dirname, '..', 'media');

(async () => {
  const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 120000 });
  const p = await b.newPage();
  await p.goto(base + '/tools/clips.html', { waitUntil: 'networkidle0' });
  await p.evaluate(() => window.ready);
  const jobs = [0, 1, 2, 3, 4, 5].map(i => [i, `w${i}`]).concat([['reel', 'reel']]);
  for (const [id, name] of jobs) {
    const dir = fs.mkdtempSync(path.join(require('os').tmpdir(), 'lila-' + name + '-'));
    for (let f = 0; f < FPS * LOOP; f++) {
      const data = await p.evaluate((id, t) => { renderFrame(id, t); return document.getElementById('c').toDataURL('image/jpeg', .93); }, id, f / FPS);
      fs.writeFileSync(path.join(dir, String(f).padStart(4, '0') + '.jpg'), Buffer.from(data.split(',')[1], 'base64'));
    }
    const out = path.join(media, name + '.mp4');
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(dir, '%04d.jpg'), '-c:v', 'libx264', '-preset', 'slow', '-crf', name === 'reel' ? '23' : '24', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out]);
    fs.rmSync(dir, { recursive: true });
    console.log(name, (fs.statSync(out).size / 1e6).toFixed(2) + ' MB');
  }
  await b.close();
})();
