const gsap = window.gsap;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const store = { get: k => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch {} } };

const WORKS = [
  { title: 'Monsoon Run', ja: 'モンスーン・ラン', date: '2026 03.14', chip: '18M plays in eight months', tags: ['fortnite', 'uefn', 'parkour'], label: 'BUILT IN UEFN', c: ['#06323B', '#0E6E7A', '#FFB347'] },
  { title: 'Dabba Dash', ja: 'ダバ・ダッシュ', date: '2025 11.02', chip: '41M visits', tags: ['roblox', 'tycoon', 'mobile'], label: 'ON ROBLOX', c: ['#121C3A', '#3550A8', '#8FD3FF'] },
  { title: 'Stepwell', ja: '階段井戸', date: '2026 05.08', chip: 'Rated 4.8 on Meta Quest', tags: ['vr', 'unreal_engine', 'puzzle'], label: 'META QUEST', c: ['#1E170C', '#7A5A24', '#F2CF7A'] },
  { title: 'Bass & Brass Live', ja: 'ベース＆ブラス・ライブ', date: '2026 07.19', chip: '420K players at peak', tags: ['in-game-concert', 'fortnite', 'live'], label: 'LIVE IN FORTNITE', c: ['#160F3A', '#5131B8', '#FF6F8E'] },
  { title: 'Gully Cricket League', ja: 'ガリー・クリケット・リーグ', date: '2024 09.21', chip: 'Ranked seasons, 9.6M plays', tags: ['fortnite', 'sports', 'ranked'], label: 'BUILT IN UEFN', c: ['#0C2A16', '#2C7A43', '#F2E06B'] },
  { title: 'Night Market', ja: 'ナイトマーケット', date: '2025 10.20', chip: '12M visits in Diwali week', tags: ['roblox', 'social', 'seasonal'], label: 'ON ROBLOX', c: ['#2A1206', '#9A3B12', '#FF9F43'] },
];

/* ---------- text scramble ---------- */
const GLYPHS = '!<>-_\\/[]{}=+*^?#ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
function scramble(el, text = el.dataset.text || el.textContent, dur = .8) {
  el.dataset.text = text;
  if (reduce) { el.textContent = text; return; }
  const o = { p: 0 };
  gsap.killTweensOf(el.__s || {});
  el.__s = o;
  gsap.to(o, { p: 1, duration: dur, ease: 'none', onUpdate() {
    const n = Math.floor(o.p * text.length);
    let s = text.slice(0, n);
    for (let i = n; i < Math.min(text.length, n + 12); i++) s += text[i] === ' ' ? ' ' : GLYPHS[Math.random() * GLYPHS.length | 0];
    el.textContent = s;
  }, onComplete() { el.textContent = text; } });
}

/* ---------- construction lines (loader + outro) ---------- */
const NS = 'http://www.w3.org/2000/svg';
const svgEl = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent?.appendChild(e); return e; };
function construction(svg, W, H, scale) {
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.innerHTML = '';
  const id = svg.id + '-fade';
  const grad = svgEl('linearGradient', { id, gradientUnits: 'userSpaceOnUse', x1: W * .08, x2: W * .92, y1: 0, y2: 0 }, svgEl('defs', {}, svg));
  [[0, 0], [.18, 1], [.82, 1], [1, 0]].forEach(([o, a]) => svgEl('stop', { offset: o, 'stop-color': '#fff', 'stop-opacity': a }, grad));
  const cx = W / 2, cy = H / 2, b = H * scale, a = b * .78;
  const P = { T: [cx, cy - b], R: [cx + a, cy], B: [cx, cy + b], L: [cx - a, cy] };
  const lines = [], diag = [];
  const line = (x1, y1, x2, y2, cls, extra = {}) => { const l = svgEl('line', { x1, y1, x2, y2, class: cls, pathLength: 1, ...extra }, svg); lines.push(l); return l; };
  line(cx - a, 0, cx - a, H, 'c-solid'); line(cx + a, 0, cx + a, H, 'c-solid');
  [cy - b, cy, cy + b, cy + b * .62, cy + b * .62 + 7, cy + b * .62 + 14, cy + b * .62 + 21].forEach(y => line(W * .08, y, W * .92, y, 'c-fade', { stroke: `url(#${id})` }));
  [['T', 'R'], ['R', 'B'], ['B', 'L'], ['L', 'T']].forEach(([p, q]) => {
    const [x1, y1] = P[p], [x2, y2] = P[q], dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len, nx = -uy, ny = ux, E = Math.max(W, H) * 1.6;
    [-12, 0, 12].forEach(o => {
      const l = line(x1 - ux * E + nx * o, y1 - uy * E + ny * o, x2 + ux * E + nx * o, y2 + uy * E + ny * o, 'c-diag');
      l.dataset.nx = nx * o; l.dataset.ny = ny * o; diag.push(l);
    });
  });
  const k = .42;
  lines.push(svgEl('path', { d: `M${cx} ${cy - b * k}L${cx + a * k} ${cy}L${cx} ${cy + b * k}L${cx - a * k} ${cy}Z`, class: 'c-solid', pathLength: 1 }, svg));
  line(cx, cy - b, cx, cy + b, 'c-solid', { 'stroke-opacity': .35 });
  const spin = svgEl('g', {}, svg);
  svgEl('circle', { cx, cy, r: b * 1.12, class: 'c-dot' }, spin);
  svgEl('circle', { cx, cy, r: b * .64, class: 'c-dot' }, spin);
  [30, 150, 210, 330].forEach(d => { const r = d * Math.PI / 180; svgEl('line', { x1: cx, y1: cy, x2: cx + Math.cos(r) * b * 1.12, y2: cy + Math.sin(r) * b * 1.12, class: 'c-dot' }, spin); });
  const mark = svgEl('path', { 'fill-rule': 'evenodd', class: 'c-mark', d: `M${cx} ${cy - b}L${cx + a} ${cy}L${cx} ${cy + b}L${cx - a} ${cy}Z M${cx} ${cy - b * k}L${cx - a * k} ${cy}L${cx} ${cy + b * k}L${cx + a * k} ${cy}Z` }, svg);
  return { lines, diag, spin, mark, others: lines.filter(l => !diag.includes(l)) };
}

/* ---------- loader ---------- */
const loader = $('#loader');
let loaderParts;
function loaderIn() {
  const svg = $('#loader-svg'), W = innerWidth, H = innerHeight;
  const c = loaderParts = construction(svg, W, H, Math.min(.3, W / H * .26));
  const tag = $('.ld-tag'), num = $('.ld-num'), bar = $('.ld-bar i');
  if (reduce) { c.lines.forEach(l => l.style.strokeDashoffset = 0); num.textContent = '100'; tag.textContent = tag.dataset.text; return Promise.resolve(); }
  const tl = gsap.timeline();
  tl.to(gsap.utils.shuffle([...c.lines]), { strokeDashoffset: 0, duration: () => gsap.utils.random(.5, 1.2), ease: 'expo.out', stagger: .03 }, 0);
  tl.fromTo(c.spin, { opacity: 0, scale: .55, rotate: -50, svgOrigin: `${W / 2} ${H / 2}` }, { opacity: 1, scale: 1, rotate: 0, duration: 1.6, ease: 'expo.out' }, .15);
  tl.to(c.spin, { rotate: 25, duration: 3, ease: 'none' }, 1.75);
  const o = { v: 0 };
  tl.to(o, { v: 100, duration: 2.5, ease: 'power2.inOut', onUpdate() { num.textContent = String(Math.round(o.v)).padStart(3, '0'); bar.style.transform = `scaleX(${o.v / 100})`; } }, 0);
  tl.call(() => scramble(tag, tag.dataset.text, 1.2), null, .45);
  // glitch hits: sharp offsets + scanlines
  [1.3, 1.95].forEach(t => {
    tl.to(svg, { x: 16, opacity: .5, duration: .04, ease: 'steps(1)' }, t)
      .to(svg, { x: -10, skewX: -4, opacity: 1, duration: .05, ease: 'steps(1)' })
      .to(svg, { x: 0, skewX: 0, duration: .04, ease: 'steps(1)' });
  });
  tl.fromTo('.scan', { y: -20, opacity: .9 }, { y: H + 20, opacity: .2, duration: .42, ease: 'power3.in', stagger: .07 }, 1.32);
  // diagonals converge onto the diamond edges
  tl.to(c.diag, { x: (i, el) => -el.dataset.nx, y: (i, el) => -el.dataset.ny, strokeOpacity: 1, duration: .7, ease: 'expo.inOut' }, 2.3);
  tl.to(c.others, { strokeOpacity: .18, duration: .5 }, 2.4);
  tl.to(c.mark, { opacity: 1, duration: .06, repeat: 5, yoyo: true, ease: 'steps(1)' }, 2.95);
  tl.to(c.mark, { opacity: 1, duration: .1 }, 3.32);
  return tl.then();
}
function loaderOut() {
  if (reduce) { loader.remove(); return Promise.resolve(); }
  const tl = gsap.timeline({ onComplete: () => loader.remove() });
  tl.to(loaderParts.mark, { scale: 1.08, svgOrigin: `${innerWidth / 2} ${innerHeight / 2}`, duration: .25, ease: 'power2.in' })
    .to(loader, { clipPath: 'inset(50% 0% 50% 0%)', duration: .75, ease: 'expo.inOut' })
    .to(loader, { clipPath: 'inset(50% 50% 50% 50%)', duration: .3, ease: 'expo.in' });
  return new Promise(r => tl.call(r, null, .55));
}

/* ---------- smooth scroll ---------- */
const lenis = new window.Lenis({ lerp: reduce ? 1 : .07, wheelMultiplier: .85, touchMultiplier: 1.4, smoothWheel: !reduce });
lenis.stop();
gsap.ticker.add(t => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
const goTo = key => {
  document.body.classList.remove('menu-open');
  const target = key === 'footer' ? $('.ftr') : $(`.sec[data-s="${key}"]`);
  if (target) lenis.scrollTo(target, { duration: reduce ? 0 : 1.6 });
};
$$('[data-go]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); goTo(a.dataset.go); blip(); }));

/* ---------- section indicator ---------- */
const IND = [['kv', 'TOP'], ['intro', 'WORKS'], ['mission', 'ABOUT'], ['vision', 'VISION'], ['service', 'SERVICE'], ['kit', 'LILA KIT']];
const GROUP = { kv: 'kv', intro: 'intro', works: 'intro', wout: 'intro', mission: 'mission', vision: 'vision', service: 'service', kit: 'kit', outro: 'kit' };
$('.ind').innerHTML = IND.map(([k, l]) => `<div class="ind-item" data-k="${k}" role="button" tabindex="0" aria-label="Go to ${l.toLowerCase()}"><div class="ind-main"><i></i><span>${l}</span></div><div class="ind-sub"><i></i><i></i></div></div>`).join('');
$$('.ind-item').forEach(it => { it.addEventListener('click', () => goTo(it.dataset.k)); it.addEventListener('keydown', e => e.key === 'Enter' && goTo(it.dataset.k)); });

/* ---------- sound ---------- */
let actx, master, soundOn = false;
function setSound(on) {
  soundOn = on;
  $('.snd').setAttribute('aria-pressed', on);
  store.set('lila-sound', on ? 'on' : 'off');
  if (on && !actx) {
    actx = new (window.AudioContext || window.webkitAudioContext)();
    master = actx.createGain(); master.gain.value = 0; master.connect(actx.destination);
    const f = actx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 420; f.Q.value = 5; f.connect(master);
    [55, 82.4, 110.6, 164.8].forEach((hz, i) => { const o = actx.createOscillator(), g = actx.createGain(); o.type = i ? 'sawtooth' : 'triangle'; o.frequency.value = hz; o.detune.value = i * 5; g.gain.value = i ? .07 : .3; o.connect(g).connect(f); o.start(); });
    const lfo = actx.createOscillator(), lg = actx.createGain(); lfo.frequency.value = .06; lg.gain.value = 260; lfo.connect(lg).connect(f.frequency); lfo.start();
  }
  if (actx) { actx.resume(); master.gain.setTargetAtTime(on ? .05 : 0, actx.currentTime, .5); }
}
function blip(hz = 1760) {
  if (!soundOn || !actx) return;
  const o = actx.createOscillator(), g = actx.createGain();
  o.frequency.value = hz; g.gain.value = .03; g.gain.setTargetAtTime(0, actx.currentTime, .02);
  o.connect(g).connect(actx.destination); o.start(); o.stop(actx.currentTime + .12);
}
$('.snd').addEventListener('click', () => setSound(!soundOn));
$$('.nav a, .slot, .ind-item').forEach(a => a.addEventListener('pointerenter', () => blip(2200)));

/* ---------- hype track ---------- */
// Synthesized in the browser (no licensed audio). 8-beat build whose drop lands on the loader's
// diamond lock at 3.32s, zaps on the two glitch hits, then a 16-beat groove that fades out.
function hype(ctx) {
  const T = ctx.currentTime + .05, B = 3.32 / 8, D = T + 8 * B;
  const out = ctx.createDynamicsCompressor();
  out.threshold.value = -14; out.ratio.value = 6; out.attack.value = .003; out.release.value = .2;
  const vol = ctx.createGain(); vol.gain.value = .55; out.connect(vol).connect(ctx.destination);
  const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate), nd = buf.getChannelData(0);
  for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
  const env = (g, t, a, peak, d) => { g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(.0001, t + a + d); };
  const kick = (t, big) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(big ? 120 : 160, t); o.frequency.exponentialRampToValueAtTime(big ? 28 : 42, t + (big ? .5 : .13));
    env(g, t, .002, big ? 1.2 : .9, big ? 1.4 : .32); o.connect(g).connect(out); o.start(t); o.stop(t + 2);
  };
  const noise = (t, dur, type, f, peak) => {
    const s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = buf; fl.type = type; fl.frequency.value = f; env(g, t, .001, peak, dur);
    s.connect(fl).connect(g).connect(out); s.start(t); s.stop(t + dur + .1);
  };
  const snare = (t, p) => {
    noise(t, .12, 'highpass', 1800, p);
    const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = 190; env(g, t, .001, p * .5, .08); o.connect(g).connect(out); o.start(t); o.stop(t + .2);
  };
  const zap = t => {
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'square';
    o.frequency.setValueAtTime(2400, t); o.frequency.exponentialRampToValueAtTime(60, t + .18);
    env(g, t, .001, .22, .18); o.connect(g).connect(out); o.start(t); o.stop(t + .3);
  };
  const saw = (t, f, dur, peak, cutoff) => {
    const o = ctx.createOscillator(), fl = ctx.createBiquadFilter(), g = ctx.createGain();
    o.type = 'sawtooth'; o.frequency.value = f; fl.type = 'lowpass';
    fl.frequency.setValueAtTime(cutoff, t); fl.frequency.exponentialRampToValueAtTime(200, t + dur);
    env(g, t, .005, peak, dur); o.connect(fl).connect(g).connect(out); o.start(t); o.stop(t + dur + .1);
  };
  const ramp = (node, param, from, to, t0, t1) => { param.setValueAtTime(from, t0); param.exponentialRampToValueAtTime(to, t1); };

  // build
  for (let b = 0; b < 8; b++) { kick(T + b * B); if (b >= 4) kick(T + b * B + B / 2); saw(T + b * B + B / 2, 55, B * .45, .2, 900); }
  [[2, 2, 1], [4, 2, 2], [6, 1, 4], [7, 1, 8]].forEach(([sb, nb, hp]) => {
    for (let i = 0; i < nb * hp; i++) { const t = T + sb * B + i * B / hp; snare(t, .12 + (t - T) / (8 * B) * .4); }
  });
  const rs = ctx.createBufferSource(), rf = ctx.createBiquadFilter(), rg = ctx.createGain();
  rs.buffer = buf; rs.loop = true; rf.type = 'bandpass'; rf.Q.value = 2;
  ramp(rf, rf.frequency, 300, 9000, T, D); ramp(rg, rg.gain, .0001, .45, T, D - .02); rg.gain.linearRampToValueAtTime(0, D);
  rs.connect(rf).connect(rg).connect(out); rs.start(T); rs.stop(D + .05);
  const ro = ctx.createOscillator(), rog = ctx.createGain(); ro.type = 'sawtooth';
  ramp(ro, ro.frequency, 110, 880, T, D); ramp(rog, rog.gain, .0001, .1, T, D - .02); rog.gain.linearRampToValueAtTime(0, D);
  ro.connect(rog).connect(out); ro.start(T); ro.stop(D + .05);
  zap(T + 1.3); zap(T + 1.95);

  // drop
  kick(D, true); noise(D, 1.6, 'highpass', 4500, .45); noise(D, .5, 'lowpass', 300, .6);
  [220, 261.63, 329.63, 440].forEach(f => { saw(D, f * 1.004, 1.3, .09, 6000); saw(D, f * .996, 1.3, .09, 6000); });

  // groove, fading out
  for (let b = 1; b < 16; b++) {
    const t = D + b * B;
    kick(t); noise(t + B / 2, .05, 'highpass', 8000, .16);
    saw(t + B / 2, [55, 55, 65.41, 49][Math.floor(b / 4) % 4], B * .4, .2, 1400);
    if (b % 2) snare(t, .28);
  }
  vol.gain.setValueAtTime(.55, D + 10 * B); vol.gain.linearRampToValueAtTime(0, D + 16 * B);
  return D + 16 * B - ctx.currentTime;
}

/* ---------- voice entry: first screen, say "Initialize Lila" (not shown on screen) ----------
   Uses the browser's speech recognition (Chrome, Edge, Safari; Chrome sends the audio to Google to transcribe).
   Front-end only, so it's a show piece, not access control. */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
// recognisers spell the name many ways, so accept the common ones
const PHRASE = /\b(initiali[sz]e|initiali[sz]ed|initiali[sz]ing)\b[\s,.'-]*(lila|leela|lilah|lela|leila|layla|lyla|lilla|lila's|leelah)\b/i;
const vBox = $('#vauth'), vWave = $('#vauth-wave'), vHeard = $('#vauth-heard'), vStatus = $('#vauth-status');
let vRec = null, vStream = null, vCtx = null, vAnalyser = null, vRaf = 0, vDone = false, vGrant = 0, vEnter = null;
function setStatus(text, kind = '') { vStatus.textContent = text; vStatus.className = 'vauth-status ' + kind; }
function chime(ok) {
  const c = actx || (vCtx && vCtx.state !== 'closed' ? vCtx : null);
  if (!c) return;
  const notes = ok ? [523.25, 659.25, 783.99, 1046.5] : [196, 185];
  notes.forEach((f, i) => {
    const o = c.createOscillator(), g = c.createGain(), t = c.currentTime + i * (ok ? .07 : .12);
    o.type = ok ? 'triangle' : 'square'; o.frequency.value = f;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(ok ? .12 : .05, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + (ok ? .9 : .18));
    o.connect(g).connect(c.destination); o.start(t); o.stop(t + 1);
  });
}
function drawWave() {
  const x = vWave.getContext('2d'), data = new Uint8Array(128), ripples = [];
  let lvl = 0, peak = .08, t = 0, wasSpeaking = false;
  cancelAnimationFrame(vRaf);
  (function loop() {
    const dpr = Math.min(devicePixelRatio || 1, 2), W = innerWidth, H = innerHeight;
    if (vWave.width !== Math.round(W * dpr)) { vWave.width = Math.round(W * dpr); vWave.height = Math.round(H * dpr); }
    x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, W, H);
    t++;
    if (vAnalyser) vAnalyser.getByteFrequencyData(data);
    let sum = 0; for (let k = 2; k < 64; k++) sum += data[k];   // voice band only
    const raw = sum / 62 / 255;
    // auto-gain: normalise against a slowly decaying peak so quiet mics still move the visual
    peak = Math.max(peak * .996, raw, .06);
    const level = Math.min(1, raw / peak);
    lvl += (level - lvl) * .3;
    const speaking = vAnalyser && raw > .035 && level > .35;
    if (speaking !== wasSpeaking) { vBox.classList.toggle('speaking', speaking); wasSpeaking = speaking; }
    if (vDone) vGrant = Math.min(1, vGrant + .035);
    const cx = W / 2, cy = H / 2, m = Math.min(W, H), r0 = m * .15, N = 144;
    // ripples: a diamond pulse leaves the centre every few frames while you talk
    if (speaking && !vDone && t % 7 === 0) ripples.push({ s: r0 * .6, a: .9 });
    for (let k = ripples.length - 1; k >= 0; k--) {
      const rp = ripples[k]; rp.s += 5 + lvl * 6; rp.a -= .018;
      if (rp.a <= 0) { ripples.splice(k, 1); continue; }
      x.strokeStyle = `rgba(255,138,31,${rp.a * .7})`; x.lineWidth = 1.5;
      x.beginPath(); x.moveTo(cx, cy - rp.s * 1.28); x.lineTo(cx + rp.s, cy); x.lineTo(cx, cy + rp.s * 1.28); x.lineTo(cx - rp.s, cy); x.closePath(); x.stroke();
    }
    // radial needles driven by the normalised voice spectrum; they warm to saffron as you speak
    const warm = vDone ? 1 : Math.min(1, lvl * 1.3);
    x.strokeStyle = `rgb(${241 + (255 - 241) * warm | 0},${243 - (243 - 138) * warm | 0},${244 - (244 - 31) * warm | 0})`;
    x.lineWidth = 1 + warm * .6; x.beginPath();
    for (let i = 0; i < N; i++) {
      const a = i / N * Math.PI * 2 - Math.PI / 2, bin = 2 + (i * 7) % 60, v = Math.min(1, data[bin] / 255 / peak * .9);
      const idle = 4 + Math.sin(t * .05 + i * .4) * 3;
      const len = (idle + v * m * .32) * (1 - vGrant);
      x.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); x.lineTo(cx + Math.cos(a) * (r0 + len), cy + Math.sin(a) * (r0 + len));
    }
    x.stroke();
    // nested diamonds breathe with the voice level, then lock and flare on success
    for (let k = 0; k < 3; k++) {
      const s = r0 * (.5 + k * .2 + lvl * .55) * (1 + vGrant * k * .6);
      x.strokeStyle = vDone ? `rgba(255,138,31,${1 - k * .28})` : `rgba(255,${255 - 117 * warm | 0},${255 - 224 * warm | 0},${.6 - k * .15})`;
      x.lineWidth = (vDone && !k) || (speaking && !k) ? 2.5 : 1;
      x.beginPath(); x.moveTo(cx, cy - s * 1.28); x.lineTo(cx + s, cy); x.lineTo(cx, cy + s * 1.28); x.lineTo(cx - s, cy); x.closePath(); x.stroke();
    }
    if (vDone && vGrant < .3) { x.fillStyle = `rgba(255,255,255,${(.3 - vGrant) * 2.4})`; x.fillRect(0, 0, W, H); }
    vRaf = requestAnimationFrame(loop);
  })();
}
function listen() {
  vRec = new SR();
  Object.assign(vRec, { lang: 'en-US', continuous: true, interimResults: true, maxAlternatives: 3 });
  vRec.onresult = e => {
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const r = e.results[i], alts = [...r].map(a => a.transcript.trim());
      vHeard.textContent = `“${alts[0]}”`;
      vHeard.classList.toggle('live', !r.isFinal);
      if (alts.some(t => PHRASE.test(t))) return grant();
      if (r.isFinal) deny();
    }
  };
  vRec.onerror = e => {
    if (e.error === 'not-allowed' || e.error === 'service-not-allowed') setStatus('Microphone blocked. Allow it from the icon in the address bar, then try again.', 'err');
    else if (e.error === 'network') setStatus('Voice entry needs an internet connection to recognise speech.', 'err');
  };
  // recognition stops after silence; keep it alive while the screen is open
  vRec.onend = () => { if (!vDone && !vBox.hidden && !vStatus.classList.contains('err')) try { vRec.start(); } catch {} };
  vRec.start();
  setStatus('Listening…');
}
function deny() {
  setStatus('Not quite. Try again.', 'warn');
  gsap.fromTo('.vauth-t', { x: -14 }, { x: 0, duration: .5, ease: 'elastic.out(1, .3)' });
  chime(false);
}
function grant() {
  if (vDone) return;
  vDone = true; vGrant = 0;
  try { vRec.stop(); } catch {}
  // start audio now: browsers allow it without a click only while the mic is live
  setSound(true);
  setStatus('', 'ok'); scramble(vStatus, 'ACCESS GRANTED', .6);
  vBox.classList.add('granted');
  chime(true);
  setTimeout(closeVoice, 1500);
}
// resolves once the phrase is heard; there is no other way in
function voiceEntry() {
  const p = new Promise(res => { vEnter = res; });
  openVoice();
  return p;
}
async function openVoice() {
  drawWave();
  if (!SR) return setStatus('Voice entry needs Chrome, Edge or Safari. This browser has no speech recognition.', 'err');
  setStatus('Starting microphone…');
  try { vStream = await navigator.mediaDevices.getUserMedia({ audio: true }); }
  catch { return setStatus('Microphone blocked. Allow it from the icon in the address bar, then try again.', 'err'); }
  if (vBox.hidden) return stopMic();
  vCtx = new AudioContext();
  // no click has happened yet on first load, so the visualiser's context may start suspended
  if (vCtx.state === 'suspended') addEventListener('pointerdown', () => vCtx?.resume(), { once: true });
  vAnalyser = vCtx.createAnalyser(); vAnalyser.fftSize = 256; vAnalyser.smoothingTimeConstant = .6;
  vCtx.createMediaStreamSource(vStream).connect(vAnalyser);
  listen();
}
function stopMic() {
  vDone = true;
  try { vRec?.abort(); } catch {}
  vStream?.getTracks().forEach(t => t.stop());
  vCtx?.close().catch(() => {});
  vRec = vStream = vAnalyser = null;
}
function closeVoice() {
  stopMic();
  gsap.to(vBox, { clipPath: 'inset(50% 0% 50% 0%)', duration: .55, ease: 'expo.in', onComplete: () => { vBox.hidden = true; cancelAnimationFrame(vRaf); vEnter?.(); } });
}

/* ---------- menu ---------- */
$('.burger').addEventListener('click', () => {
  const open = document.body.classList.toggle('menu-open');
  $('.burger').setAttribute('aria-expanded', open);
  $('.menu').setAttribute('aria-hidden', !open);
});

/* ---------- Japanese lines: hover or focus to read the English ---------- */
$$('.hl[data-en]').forEach(el => {
  const ja = el.textContent, en = el.dataset.en;
  const show = toEn => {
    el.classList.toggle('en', toEn);
    el.lang = toEn ? 'en' : 'ja';
    scramble(el, toEn ? en : ja, .45);
    if (toEn) blip(1980);
  };
  el.addEventListener('pointerenter', () => show(true));
  el.addEventListener('pointerleave', () => show(false));
  el.addEventListener('focus', () => show(true));
  el.addEventListener('blur', () => show(false));
});

/* ---------- HTML videos play only while on screen ---------- */
const vio = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting && !reduce) e.target.play().catch(() => {}); else e.target.pause();
}), { rootMargin: '150px' });
$$('video[data-auto]:not(.svc-vid)').forEach(v => vio.observe(v));
// service cards: only the card nearest the screen centre plays (two decoding at once halved the frame rate)
const svcVids = $$('.svc-vid');
function updateSvcVideos(active) {
  let best = null, bd = Infinity;
  if (active && !reduce) svcVids.forEach(v => { const r = v.getBoundingClientRect(), d = Math.abs(r.left + r.width / 2 - innerWidth / 2); if (d < bd && r.right > 0 && r.left < innerWidth) { bd = d; best = v; } });
  svcVids.forEach(v => { if (v === best) { if (v.paused) v.play().catch(() => {}); } else if (!v.paused) v.pause(); });
}

/* ---------- headline letters rise in when their section becomes active ---------- */
$$('.outline, .kit-t').forEach(h => {
  const text = h.textContent;
  h.setAttribute('aria-label', text);
  h.innerHTML = `<span class="split" aria-hidden="true">${[...text].map((c, i) => `<span class="ch" style="--i:${i}">${c === ' ' ? '&nbsp;' : c}</span>`).join('')}</span>`;
});

/* ---------- WebGL ---------- */
async function initGL() {
  const A = 'three/addons/';
  const [THREE, { RoomEnvironment }, { EffectComposer }, { RenderPass }, { UnrealBloomPass }, { ShaderPass }, { OutputPass }] = await Promise.all([
    import('three'), import(A + 'environments/RoomEnvironment.js'), import(A + 'postprocessing/EffectComposer.js'),
    import(A + 'postprocessing/RenderPass.js'), import(A + 'postprocessing/UnrealBloomPass.js'), import(A + 'postprocessing/ShaderPass.js'), import(A + 'postprocessing/OutputPass.js'),
  ]);
  await Promise.all([document.fonts.load('800 200px Geist'), document.fonts.load('500 26px "Geist Mono"')]).catch(() => {});

  const canvas = $('#gl');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5)); // full 2x retina with iridescent PBR drops frames
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, .1, 100);
  camera.position.set(0, 0, 9);
  // studio env with coloured light panels so the chrome + iridescence pick up colour
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = new RoomEnvironment();
  const panel = (rgb, pos, w, h) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(...rgb), side: THREE.DoubleSide })); m.position.set(...pos); m.lookAt(0, 0, 0); envScene.add(m); };
  panel([5, 1.4, .3], [8, 1, 3], 3, 9);
  panel([.3, 1.4, 5], [-8, 0, 2], 3, 9);
  panel([4, .4, 3], [2, -6, -7], 9, 2.5);
  panel([.4, 4, 2.6], [-4, -4, 8], 6, 2);
  panel([6, 6, 6], [0, 8, 3], 10, 2);
  scene.environment = pmrem.fromScene(envScene, .03).texture;
  scene.add(new THREE.DirectionalLight(0xffb070, 2).translateX(4).translateY(3));
  scene.add(new THREE.DirectionalLight(0x6a8dff, 2).translateX(-4).translateY(-2));

  scene.fog = new THREE.Fog(0x050507, 11, 27);

  // emblem: deeply bevelled diamond frame + a floating glass gem that counter-rotates inside it
  const D = (a, b) => [[0, b], [a, 0], [0, -b], [-a, 0]].map(([x, y]) => new THREE.Vector2(x, y));
  const shape = new THREE.Shape(D(1.48, 1.9));
  shape.holes.push(new THREE.Path(D(.62, .8).reverse()));
  const geo = new THREE.ExtrudeGeometry(shape, { depth: .34, bevelEnabled: true, bevelThickness: .11, bevelSize: .085, bevelSegments: 12 });
  geo.center();
  const solidMat = new THREE.MeshPhysicalMaterial({ color: 0xeeeef2, metalness: 1, roughness: .12, iridescence: 1, iridescenceIOR: 1.9, iridescenceThicknessRange: [180, 820], clearcoat: 1, clearcoatRoughness: .08, envMapIntensity: 1.05, transparent: true });
  const wireMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 });
  const emblem = new THREE.Group();
  const solid = new THREE.Mesh(geo, solidMat);
  // outline from an unbevelled copy: the rounded bevel has no sharp edges for EdgesGeometry to find
  const edgeGeo = new THREE.ExtrudeGeometry(shape, { depth: .56, bevelEnabled: false }); edgeGeo.center();
  const wire = new THREE.LineSegments(new THREE.EdgesGeometry(edgeGeo, 25), wireMat);
  const coreGeo = new THREE.OctahedronGeometry(1, 0); coreGeo.scale(.34, .46, .2);
  // iridescent crystal without transmission: transmission re-renders the whole scene every frame
  const coreMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: .35, roughness: .02, iridescence: 1, iridescenceIOR: 1.6, iridescenceThicknessRange: [250, 900], clearcoat: 1, envMapIntensity: 1.4, flatShading: true });
  const core = new THREE.Mesh(coreGeo, coreMat);
  const coreWire = new THREE.LineSegments(new THREE.EdgesGeometry(coreGeo), wireMat);
  emblem.add(solid, wire, core, coreWire);
  scene.add(emblem);

  // curved grid room with crosshair marks at panel corners
  const pts = [], R = 14, HH = 20;
  for (let i = 0; i < 72; i++) { const a = i / 72 * Math.PI * 2; pts.push(Math.sin(a) * R, -HH / 2, Math.cos(a) * R, Math.sin(a) * R, HH / 2, Math.cos(a) * R); }
  for (let y = -HH / 2; y <= HH / 2; y += 1.25) for (let i = 0; i < 120; i++) { const a = i / 120 * Math.PI * 2, b = (i + 1) / 120 * Math.PI * 2; pts.push(Math.sin(a) * R, y, Math.cos(a) * R, Math.sin(b) * R, y, Math.cos(b) * R); }
  const roomGeo = new THREE.BufferGeometry(); roomGeo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  const roomMat = new THREE.LineBasicMaterial({ color: 0x8a9298, transparent: true, opacity: .2 });
  scene.add(new THREE.LineSegments(roomGeo, roomMat));
  const cross = [], cs = .2;
  for (let i = 0; i < 72; i += 6) for (let y = -HH / 2 + 2.5; y < HH / 2; y += 2.5) {
    const a = i / 72 * Math.PI * 2, x = Math.sin(a) * (R - .06), z = Math.cos(a) * (R - .06), tx = Math.cos(a), tz = -Math.sin(a);
    cross.push(x - tx * cs, y, z - tz * cs, x + tx * cs, y, z + tz * cs, x, y - cs, z, x, y + cs, z);
  }
  const crossGeo = new THREE.BufferGeometry(); crossGeo.setAttribute('position', new THREE.Float32BufferAttribute(cross, 3));
  const crossMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: .5 });
  scene.add(new THREE.LineSegments(crossGeo, crossMat));

  // giant wordmark wrapped behind the emblem
  const tc = document.createElement('canvas'); tc.width = 4096; tc.height = 512;
  const tx = tc.getContext('2d');
  tx.fillStyle = '#fff'; tx.font = '800 330px Geist, sans-serif'; tx.textBaseline = 'middle';
  const word = 'LILA WORLDS ◆ ', ww = tx.measureText(word).width;
  for (let x = 0; x < tc.width; x += ww) tx.fillText(word, x, 270);
  const ringTex = new THREE.CanvasTexture(tc); ringTex.wrapS = THREE.RepeatWrapping; ringTex.repeat.x = -2; ringTex.colorSpace = THREE.SRGBColorSpace;
  const ringMat = new THREE.MeshBasicMaterial({ map: ringTex, transparent: true, side: THREE.BackSide, depthWrite: false, opacity: 1, fog: false });
  const ring = new THREE.Mesh(new THREE.CylinderGeometry(7.5, 7.5, 3.6, 128, 1, true), ringMat);
  scene.add(ring);

  // works carousel: curved screens with generated covers
  const rnd = s => () => (s = (s * 16807) % 2147483647) / 2147483647;
  const rgba = (h, a) => `rgba(${parseInt(h.slice(1, 3), 16)},${parseInt(h.slice(3, 5), 16)},${parseInt(h.slice(5, 7), 16)},${a})`;
  function cover(w, i) {
    const c = document.createElement('canvas'); c.width = 1200; c.height = 700;
    const x = c.getContext('2d'), r = rnd(i * 977 + 13);
    const g = x.createLinearGradient(0, 0, 1200, 700); g.addColorStop(0, w.c[0]); g.addColorStop(1, w.c[1]);
    x.fillStyle = g; x.fillRect(0, 0, 1200, 700);
    const glow = x.createRadialGradient(840, 320, 0, 840, 320, 460); glow.addColorStop(0, rgba(w.c[2], .55)); glow.addColorStop(1, rgba(w.c[2], 0));
    x.fillStyle = glow; x.fillRect(0, 0, 1200, 700);
    x.save(); x.translate(840, 330); x.rotate(-.18 + r() * .36);
    for (let k = 0; k < 9; k++) { const s = 1 - k * .1; x.strokeStyle = rgba(w.c[2], .7 - k * .07); x.lineWidth = k ? 1.5 : 4; x.beginPath(); x.moveTo(0, -330 * s); x.lineTo(250 * s, 0); x.lineTo(0, 330 * s); x.lineTo(-250 * s, 0); x.closePath(); x.stroke(); }
    x.restore();
    x.strokeStyle = 'rgba(255,255,255,.22)'; x.lineWidth = 1;
    for (let k = 0; k < 46; k++) { const y = r() * 700, sx = r() * 1200; x.beginPath(); x.moveTo(sx, y); x.lineTo(sx + 80 + r() * 260, y); x.stroke(); }
    for (let k = 0; k < 1800; k++) { x.fillStyle = `rgba(255,255,255,${r() * .12})`; x.fillRect(r() * 1200, r() * 700, 2, 2); }
    x.fillStyle = 'rgba(255,255,255,.9)'; x.font = '500 24px "Geist Mono", monospace'; x.fillText(w.label, 70, 96);
    x.fillRect(70, 112, 60, 2);
    x.font = '800 112px Geist, sans-serif'; x.fillStyle = '#fff';
    const words = w.title.toUpperCase().split(' '), rows = []; let row = '';
    words.forEach(wd => { const t = row ? row + ' ' + wd : wd; if (x.measureText(t).width > 680 && row) { rows.push(row); row = wd; } else row = t; });
    rows.push(row);
    rows.forEach((t, k) => { x.save(); x.shadowColor = rgba(w.c[2], .8); x.shadowBlur = 40; x.fillText(t, 66, 640 - (rows.length - 1 - k) * 104); x.restore(); });
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
    return tex;
  }
  const car = new THREE.Group(); car.position.y = .45; scene.add(car);
  const RC = 7.2;
  const screens = WORKS.map((w, i) => {
    const g = new THREE.PlaneGeometry(4.6, 2.68, 48, 1), p = g.attributes.position;
    for (let k = 0; k < p.count; k++) p.setZ(k, -(p.getX(k) ** 2) * .035);
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ map: cover(w, i), transparent: true, side: THREE.DoubleSide, opacity: 0, depthWrite: false, fog: false }));
    // thin bright frame traced along the curved edge (top row, then bottom row reversed)
    const n = 49, edge = [];
    for (let k = 0; k < n; k++) edge.push(p.getX(k), p.getY(k), p.getZ(k) + .006);
    for (let k = 2 * n - 1; k >= n; k--) edge.push(p.getX(k), p.getY(k), p.getZ(k) + .006);
    const fg = new THREE.BufferGeometry(); fg.setAttribute('position', new THREE.Float32BufferAttribute(edge, 3));
    m.userData.frame = new THREE.LineLoop(fg, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, fog: false }));
    m.add(m.userData.frame);
    // swap the still cover for the looping clip once it actually starts playing
    const v = Object.assign(document.createElement('video'), { src: `media/w${i}.mp4`, muted: true, loop: true, playsInline: true, preload: 'auto' });
    v.addEventListener('playing', () => {
      const vt = new THREE.VideoTexture(v); vt.colorSpace = THREE.SRGBColorSpace;
      m.material.map = vt; m.material.needsUpdate = true;
    }, { once: true });
    m.userData.video = v;
    car.add(m); return m;
  });

  // post: bloom on highlights -> sRGB output -> lens pass (edge chromatic split, vignette, grain).
  // No tone mapping, so section background colours stay exactly as designed.
  renderer.toneMapping = THREE.NoToneMapping;
  const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(innerWidth, innerHeight, { type: THREE.HalfFloatType, samples: 4 }));
  composer.setPixelRatio(renderer.getPixelRatio()); composer.setSize(innerWidth, innerHeight);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), .22, .12, 1.1);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  const lens = new ShaderPass({
    uniforms: { tDiffuse: { value: null }, uAmt: { value: 0 }, uGrain: { value: .035 }, uVig: { value: 1 }, uTime: { value: 0 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
    fragmentShader: `
      uniform sampler2D tDiffuse; uniform float uAmt, uGrain, uVig, uTime; varying vec2 vUv;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      void main(){
        vec2 d = vUv - .5; float r2 = dot(d, d);
        vec2 off = d * r2 * uAmt;
        vec4 base = texture2D(tDiffuse, vUv);
        vec3 c = vec3(texture2D(tDiffuse, vUv + off).r, base.g, texture2D(tDiffuse, vUv - off).b);
        c *= mix(1., smoothstep(.9, .2, sqrt(r2)), uVig * .5);
        c += (hash(vUv * 1024. + uTime) - .5) * uGrain;
        gl_FragColor = vec4(c, 1.);
      }`,
  });
  composer.addPass(lens);

  const cur = { bg: new THREE.Color('#050507'), room: .2, roomColor: new THREE.Color('#8a9298'), ring: 0, x: 0, y: 0, z: 0, s: 0, rx: 0, ry: 0, rz: 0, solid: 1, wire: 0, car: 0, idx: 0, spin: 0, post: 1 };
  let spinAngle = 0, intro = 0;
  const userQ = new THREE.Quaternion(), tmpQ = new THREE.Quaternion(), euler = new THREE.Euler(), v = new THREE.Vector3();
  const mobile = () => innerWidth < 900;

  let tilt = 0;
  const clearC = new THREE.Color();
  function frame(tg, dt, ptr, vel) {
    const k = 1 - Math.exp(-dt * 4.2), kk = 1 - Math.exp(-dt * 6);
    // scroll speed feeds the motion: emblem spins faster, carousel leans into the scroll
    spinAngle += clamp(vel * .0016, -.06, .06);
    tilt += (clamp(-vel * .004, -.14, .14) - tilt) * kk;
    cur.bg.lerp(tg.bg, k); cur.roomColor.lerp(tg.roomColor, k);
    for (const key of ['room', 'ring', 'x', 'y', 'z', 's', 'rx', 'ry', 'rz', 'solid', 'wire', 'car', 'spin', 'post']) cur[key] += (tg[key] - cur[key]) * k;
    cur.idx += (tg.idx - cur.idx) * kk;
    spinAngle += cur.spin * dt;
    // the composer's render target gets the clear colour sRGB-encoded and OutputPass encodes again,
    // so pre-decode once to land on the exact section colour
    renderer.setClearColor(clearC.copy(cur.bg).convertSRGBToLinear());
    scene.fog.color.copy(cur.bg);
    roomMat.color.copy(cur.roomColor); roomMat.opacity = cur.room;
    crossMat.color.copy(cur.roomColor).offsetHSL(0, 0, .25); crossMat.opacity = Math.min(1, cur.room * 2.6);
    ringMat.opacity = cur.ring; ring.visible = cur.ring > .01; ring.rotation.y += dt * .05;
    const fit = mobile() ? .62 : 1;
    emblem.position.set(cur.x * fit, cur.y, cur.z);
    emblem.scale.setScalar(Math.max(.0001, cur.s * fit * intro));
    euler.set(cur.rx + ptr.y * .25, cur.ry + spinAngle + ptr.x * .35, cur.rz);
    emblem.quaternion.copy(userQ).multiply(tmpQ.setFromEuler(euler));
    solidMat.opacity = cur.solid; solid.visible = cur.solid > .01;
    core.visible = cur.solid > .05; core.scale.setScalar(Math.max(.001, cur.solid));
    core.rotation.set(Math.sin(spinAngle * .7) * .4, -spinAngle * 2.2, 0); coreWire.rotation.copy(core.rotation);
    coreWire.visible = cur.wire > .01;
    wireMat.opacity = cur.wire; wire.visible = cur.wire > .01;
    wireMat.color.copy(cur.bg).offsetHSL(0, 0, cur.bg.getHSL({}).l > .5 ? -.8 : .9);
    car.scale.setScalar(mobile() ? .62 : 1);
    car.rotation.z = tilt * .4; car.rotation.x = tilt;
    screens.forEach((m, i) => {
      const th = (i - cur.idx) * .72;
      m.position.set(Math.sin(th) * RC, 0, Math.cos(th) * RC - RC);
      m.rotation.y = th;
      m.material.opacity = cur.car * clamp(1.5 - Math.abs(i - cur.idx) * .55);
      m.visible = m.material.opacity > .01;
      m.userData.frame.material.opacity = m.material.opacity * (i === Math.round(cur.idx) ? .9 : .35);
      const v = m.userData.video;
      if (m.visible && !reduce) { if (v.paused) v.play().catch(() => {}); } else if (!v.paused) v.pause();
    });
    camera.position.x += (ptr.x * .35 - camera.position.x) * k;
    camera.position.y += (-ptr.y * .2 - camera.position.y) * k;
    camera.lookAt(0, 0, 0);
    bloom.strength = .22 * cur.post;
    lens.uniforms.uVig.value = cur.post;
    lens.uniforms.uAmt.value = .012 + Math.min(.18, Math.abs(vel) * .004);
    lens.uniforms.uTime.value = (lens.uniforms.uTime.value + dt) % 100;
    composer.render(dt);
    return emblem.quaternion;
  }
  addEventListener('resize', () => { renderer.setSize(innerWidth, innerHeight, false); composer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); });

  // drag to rotate
  let drag = null;
  addEventListener('pointerdown', e => { if (e.target.closest('a,button,input,.news,.svc,.menu,.vauth,pre') || e.pointerType === 'touch') return; drag = { x: e.clientX, y: e.clientY }; });
  addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = (e.clientX - drag.x) * .008, dy = (e.clientY - drag.y) * .008; drag = { x: e.clientX, y: e.clientY };
    userQ.premultiply(tmpQ.setFromAxisAngle(v.set(0, 1, 0), dx)).premultiply(tmpQ.setFromAxisAngle(v.set(1, 0, 0), dy));
  });
  addEventListener('pointerup', () => { drag = null; });
  $('#reset').addEventListener('click', () => { const from = userQ.clone(), o = { t: 0 }; gsap.to(o, { t: 1, duration: 1, ease: 'expo.out', onUpdate: () => userQ.slerpQuaternions(from, new THREE.Quaternion(), o.t) }); blip(990); });

  return { frame, Color: THREE.Color, setIntro: t => { intro = t; }, Vector3: THREE.Vector3 };
}

/* ---------- per-section scene targets ---------- */
// hold on each integer for the first/last 25% of its span, ease across the middle
const dwell = x => { const i = Math.floor(x); return i + smooth(.25, .75, x - i); };
function targets(GL, id, p) {
  const C = h => new GL.Color(h);
  const t = { bg: C('#050507'), room: .2, roomColor: C('#8a9298'), ring: 0, x: 0, y: 0, z: 0, s: 1.25, rx: 0, ry: 0, rz: 0, solid: 1, wire: 0, car: 0, idx: 0, spin: 0, post: 1 };
  switch (id) {
    case 'kv': Object.assign(t, { ring: 1 - smooth(.55, 1, p), ry: p * Math.PI * 1.2, rx: p * .3, spin: .25, room: .22 }); break;
    case 'intro': Object.assign(t, { bg: C('#07080B'), z: -1.5 - p * 3, s: 1.25 - p * .45, ry: Math.PI * 1.2 + p * 2, rx: .3 + p * .5, room: .3, car: smooth(.4, 1, p) }); break;
    case 'works': Object.assign(t, { bg: C('#07080B'), z: -7, y: .3, s: .8, ry: p * 6, rx: .7, room: .3, car: 1, idx: dwell(p * (WORKS.length - 1)) }); break;
    case 'wout': Object.assign(t, { bg: C('#FF7A1A'), roomColor: C('#3a1a00'), room: .18, car: 1 - smooth(0, .25, p), idx: WORKS.length - 1 + p * 1.5, s: 1.35, ry: p * Math.PI * 2, rx: .2, spin: .3 }); break;
    case 'mission': Object.assign(t, { bg: C('#D6DEE2'), room: 0, solid: 0, wire: 1, s: 1.45, ry: .25 + p * .5, rx: -.05, post: 0 }); break;
    case 'vision': Object.assign(t, { bg: C('#D6DEE2'), room: 0, solid: .3, wire: 1, s: 1.4, x: -.3, ry: .9 + p * .9, rx: .45, rz: -.25, post: 0 }); break;
    case 'service': Object.assign(t, { bg: C('#0A0B0E'), room: .16, s: .55, x: 3.3, y: 1.55, spin: .6, rx: .3 }); break;
    case 'kit': Object.assign(t, { bg: C('#050507'), room: .12, s: .95, x: 2.3, z: -1, spin: .4, rx: .2, ry: p * 2 }); break;
    case 'outro': Object.assign(t, { bg: C('#000000'), room: .08 * (1 - p), s: 1.1 * (1 - smooth(0, .45, p)), spin: 1.2 }); break;
  }
  return t;
}

/* ---------- scroll-driven page state ---------- */
const sections = $$('.sec');
const LIGHT = new Set(['mission', 'vision']);
let active = null, workIdx = -1;
const wInfo = $('.w-info');
function showWork(i) {
  const w = WORKS[i];
  $('#w-date').textContent = w.date;
  $('#w-chip').textContent = w.chip;
  $('#w-title').textContent = w.title;
  $('#w-sub').textContent = w.ja;
  $('#w-tags').innerHTML = w.tags.map(t => `<li>${t}</li>`).join('');
  $('#w-i').textContent = String(i + 1).padStart(2, '0');
  wInfo.classList.remove('swap'); void wInfo.offsetWidth; wInfo.classList.add('swap');
  scramble($('#w-date'), w.date, .5);
}
$('#w-n').textContent = String(WORKS.length).padStart(2, '0');
showWork(0); workIdx = 0;

// While section k+1 slides up over the last viewport of section k, `blend` describes that hand-off
// so the 3D scene and the overlays crossfade continuously instead of switching at a threshold.
const ftr = $('.ftr'), worksSec = $('.sec[data-s="works"]');
const progressOf = (r, vh) => clamp(-r.top / Math.max(1, r.height - vh));
function readScroll() {
  const vh = innerHeight, rects = sections.map(s => s.getBoundingClientRect());
  let i = 0;
  rects.forEach((r, k) => { if (r.top <= vh * .5) i = k; });
  let blend = null;
  rects.forEach((r, k) => {
    const nextTop = (rects[k + 1] || ftr.getBoundingClientRect()).top;
    const out = r.bottom <= vh + 1 ? clamp(1 - nextTop / vh) : 0;
    setVar(sections[k], '--out', out);
    if (out > 0 && out < 1 && rects[k + 1]) blend = { a: sections[k].dataset.s, b: sections[k + 1].dataset.s, t: out };
  });
  const el = sections[i];
  return { el, id: el.dataset.s, p: progressOf(rects[i], vh), blend, worksP: progressOf(rects[sections.indexOf(worksSec)], vh) };
}
const setVar = (el, k, v) => { const s = v.toFixed(4); if (el['_' + k] !== s) { el['_' + k] = s; el.style.setProperty(k, s); } };
const easeIO = t => t < .5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
function mixTargets(a, b, t) {
  const m = { ...a };
  for (const k in a) m[k] = typeof a[k] === 'number' ? a[k] + (b[k] - a[k]) * t : a[k].clone().lerp(b[k], t);
  return m;
}
function enter(st) {
  sections.forEach(s => s.classList.toggle('in', s === st.el));
  document.body.dataset.tone = LIGHT.has(st.id) ? 'light' : 'dark';
  document.body.classList.toggle('fx-grid-on', LIGHT.has(st.id));
  document.body.classList.toggle('fx-dia-on', st.id === 'wout');
  $$('.ind-item').forEach(it => it.classList.toggle('on', it.dataset.k === GROUP[st.id]));
  $$('[data-scramble]', st.el).forEach(el => scramble(el));
  blip(st.id === 'wout' ? 660 : 1320);
}

/* ---------- boot ---------- */
const svcTrack = $('.svc-track');
const setSx = () => svcTrack.style.setProperty('--sx', Math.max(0, svcTrack.scrollWidth - innerWidth * .55) + 'px');
setSx(); addEventListener('resize', setSx);

const outroSvg = $('#outro-svg');
const outroParts = construction(outroSvg, 1440, 900, .26);
outroParts.lines.forEach((l, i) => l.style.setProperty('--d', (i % 9) * .06));

const clock = $('#clock');
const ist = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false });
const tick = () => { clock.textContent = ist.format(new Date()); };
tick(); setInterval(tick, 30000);

const ptr = { x: 0, y: 0 }, ptrT = { x: 0, y: 0 };
addEventListener('pointermove', e => { ptrT.x = e.clientX / innerWidth * 2 - 1; ptrT.y = e.clientY / innerHeight * 2 - 1; });

const glReady = initGL().catch(err => { console.error('WebGL failed', err); return null; });
// grant() starts audio while the mic is live, which browsers accept in place of a click
await voiceEntry();
master.gain.cancelScheduledValues(0); master.gain.setValueAtTime(0, actx.currentTime);
const len = hype(actx);
master.gain.setTargetAtTime(.05, actx.currentTime + len - 1.5, 1); // ambient drone takes over as the track fades
await loaderIn();
const GL = await glReady;
await loaderOut();
lenis.start();
scrollTo(0, 0);

// intro: header + emblem
gsap.from('.hdr > *, .hud, .ind', { y: -16, opacity: 0, duration: 1, stagger: .08, ease: 'expo.out' });
if (GL) gsap.to({ t: 0 }, { t: 1, duration: 1.6, ease: 'back.out(1.6)', onUpdate() { GL.setIntro(this.targets()[0].t); } });

const qEls = [0, 1, 2, 3].map(i => $('#q' + i));
const gz = ['x', 'y', 'z'].map(a => [$('#g' + a), $('#g' + a + 'l')]);
const fmtQ = n => (n < 0 ? '-' : '') + Math.abs(n).toFixed(2).replace(/^0/, '');
let last = performance.now(), hudT = 0;
const axis = GL ? new GL.Vector3() : null;
gsap.ticker.add(() => {
  const now = performance.now(), dt = Math.min(.05, (now - last) / 1000); last = now;
  const pk = 1 - Math.exp(-dt * 3.5);
  ptr.x += (ptrT.x - ptr.x) * pk; ptr.y += (ptrT.y - ptr.y) * pk;
  const st = readScroll();
  if (st.el !== active) { active = st.el; enter(st); }
  setVar(st.el, '--p', st.p);
  updateSvcVideos(st.id === 'service');
  const wi = Math.round(st.worksP * (WORKS.length - 1));
  if (wi !== workIdx) { workIdx = wi; showWork(wi); if (st.id === 'works') blip(1500); }
  if (!GL) return;
  const tg = st.blend
    ? mixTargets(targets(GL, st.blend.a, 1), targets(GL, st.blend.b, 0), easeIO(st.blend.t))
    : targets(GL, st.id, st.p);
  const q = GL.frame(tg, dt, ptr, lenis.velocity || 0);
  if ((hudT += dt) > .08) {
    hudT = 0;
    [q.x, q.y, q.z, q.w].forEach((n, i) => { qEls[i].textContent = fmtQ(n); });
    [[1, 0, 0], [0, 1, 0], [0, 0, 1]].forEach(([a, b, c], i) => {
      const v = axis.set(a, b, c).applyQuaternion(q), x = v.x * 26, y = -v.y * 26;
      gz[i][0].setAttribute('x2', x); gz[i][0].setAttribute('y2', y);
      gz[i][1].setAttribute('transform', `translate(${x} ${y})`);
    });
  }
});
