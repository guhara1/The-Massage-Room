// 역세권/조합 가이드 JSON을 data/guides.js 모듈로 조립한다.
// 사용: node scripts/gen-guides.js
const fs = require('fs');
const path = require('path');
const SCRATCH = '/tmp/claude-0/-home-user-The-Massage-Room/ed7adbfc-11d7-56d2-98c9-2786844c840e/scratchpad';

function load(name) {
  const p = path.join(SCRATCH, name);
  if (!fs.existsSync(p)) { console.error('MISSING ' + name); process.exit(2); }
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

const stationArr = load('station-guide.json');
const comboArr = load('combo-guide.json');

const stationGuide = {};
for (const s of stationArr) { const { slug, ...rest } = s; stationGuide[slug] = rest; }
const comboGuide = {};
for (const c of comboArr) { const { slug, ...rest } = c; comboGuide[slug] = rest; }

const out = '// 자동 생성 — scripts/gen-guides.js 로 재생성. 직접 수정 금지.\n' +
  'const stationGuide = ' + JSON.stringify(stationGuide, null, 1) + ';\n\n' +
  'const comboGuide = ' + JSON.stringify(comboGuide, null, 1) + ';\n\n' +
  'module.exports = { stationGuide, comboGuide };\n';

fs.writeFileSync(path.join(__dirname, '..', 'data', 'guides.js'), out);
console.log(`OK: ${stationArr.length} stations + ${comboArr.length} combos → data/guides.js`);
