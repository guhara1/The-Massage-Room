'use strict';
/**
 * 히어로 원본 이미지를 WebP(≤~50KB)로 변환한다.
 *   node scripts/convert-hero.js [입력경로]
 * 입력경로 생략 시 src/assets 에서 hero-src.* 또는 가장 큰 png/jpg 를 자동 선택.
 * 결과: src/assets/hero.webp  (빌드가 이 파일을 우선 사용)
 *
 * 의존성 없이 Chromium(canvas)로 재인코딩한다.
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const DIR = path.join(__dirname, '..', 'src', 'assets');
const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const TARGET_BYTES = 52000;   // ~50KB
const MAX_WIDTH = 1000;       // 히어로 표시 폭 고려

function pickInput() {
  if (process.argv[2]) return path.resolve(process.argv[2]);
  const cands = fs.readdirSync(DIR)
    .filter(f => /\.(png|jpe?g)$/i.test(f) && !/^favicon/.test(f))
    .map(f => ({ f, size: fs.statSync(path.join(DIR, f)).size }))
    .sort((a, b) => b.size - a.size);
  const pref = cands.find(c => /^hero-src\./i.test(c.f)) || cands[0];
  if (!pref) throw new Error('src/assets 에서 변환할 원본 이미지를 찾지 못했습니다. (hero-src.png 등으로 업로드)');
  return path.join(DIR, pref.f);
}

(async () => {
  const input = pickInput();
  const buf = fs.readFileSync(input);
  const b64 = buf.toString('base64');
  const mime = /\.png$/i.test(input) ? 'image/png' : 'image/jpeg';
  console.log('원본:', path.basename(input), (buf.length / 1024).toFixed(1) + 'KB');

  const b = await chromium.launch({ executablePath: CHROME });
  const page = await b.newPage();
  const result = await page.evaluate(async ({ src, maxW, target }) => {
    const img = new Image();
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = src; });
    const scale = Math.min(1, maxW / img.naturalWidth);
    const w = Math.round(img.naturalWidth * scale);
    const h = Math.round(img.naturalHeight * scale);
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    c.getContext('2d').drawImage(img, 0, 0, w, h);
    // 품질을 낮춰가며 목표 용량 이하로
    let q = 0.92, out = '';
    for (let i = 0; i < 12; i++) {
      out = c.toDataURL('image/webp', q);
      const bytes = Math.ceil((out.length - out.indexOf(',') - 1) * 3 / 4);
      if (bytes <= target || q <= 0.35) return { data: out, bytes, q, w, h };
      q -= 0.06;
    }
    const bytes = Math.ceil((out.length - out.indexOf(',') - 1) * 3 / 4);
    return { data: out, bytes, q, w, h };
  }, { src: `data:${mime};base64,${b64}`, maxW: MAX_WIDTH, target: TARGET_BYTES });
  await b.close();

  const outBuf = Buffer.from(result.data.split(',')[1], 'base64');
  const outPath = path.join(DIR, 'hero.webp');
  fs.writeFileSync(outPath, outBuf);
  console.log(`변환 완료: hero.webp  ${result.w}x${result.h}  ${(outBuf.length / 1024).toFixed(1)}KB  (q=${result.q.toFixed(2)})`);
})();
