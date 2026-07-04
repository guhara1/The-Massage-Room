'use strict';
/**
 * favicon.svg 를 여러 크기 PNG 로 래스터화하고 favicon.ico 를 생성한다.
 * (Chromium 래스터화 · 개발 환경에서 1회 실행하여 결과물을 커밋)
 *   node scripts/gen-favicons.js
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const DIR = path.join(__dirname, '..', 'src', 'favicon');
const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

function buildIco(pngBuf, size) {
  // 단일 이미지 PNG 를 담은 ICO 컨테이너 (Vista+ 지원)
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);      // reserved
  header.writeUInt16LE(1, 2);      // type: icon
  header.writeUInt16LE(1, 4);      // image count
  const entry = Buffer.alloc(16);
  entry.writeUInt8(size >= 256 ? 0 : size, 0); // width
  entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
  entry.writeUInt8(0, 2);          // palette
  entry.writeUInt8(0, 3);          // reserved
  entry.writeUInt16LE(1, 4);       // color planes
  entry.writeUInt16LE(32, 6);      // bits per pixel
  entry.writeUInt32LE(pngBuf.length, 8);       // image size
  entry.writeUInt32LE(6 + 16, 12); // offset
  return Buffer.concat([header, entry, pngBuf]);
}

(async () => {
  const svg = fs.readFileSync(path.join(DIR, 'favicon.svg'), 'utf8');
  const b = await chromium.launch({ executablePath: CHROME, args: ['--force-color-profile=srgb'] });
  async function render(size, out) {
    const p = await b.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
    await p.setContent(
      '<style>*{margin:0;padding:0}html,body{width:' + size + 'px;height:' + size + 'px}svg{width:' + size + 'px;height:' + size + 'px;display:block}</style>' + svg,
      { waitUntil: 'networkidle' });
    const el = await p.$('svg');
    await el.screenshot({ path: out, omitBackground: true });
    await p.close();
    return fs.readFileSync(out);
  }
  await render(180, path.join(DIR, 'apple-touch-icon.png'));
  await render(16, path.join(DIR, 'favicon-16.png'));
  await render(512, path.join(DIR, 'icon-512.png'));
  const png32 = await render(32, path.join(DIR, 'favicon-32.png'));
  fs.writeFileSync(path.join(DIR, 'favicon.ico'), buildIco(png32, 32));
  await b.close();
  console.log('favicon 생성 완료:', fs.readdirSync(DIR).join(', '));
})();
