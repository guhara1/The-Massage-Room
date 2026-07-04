// 인천 행정동 JSON(스크래치패드 8개 파일)을 data/incheon-dongs.js 모듈로 조립한다.
// 사용: node scripts/gen-incheon-dongs.js
const fs = require('fs');
const path = require('path');

const SCRATCH = '/tmp/claude-0/-home-user-The-Massage-Room/ed7adbfc-11d7-56d2-98c9-2786844c840e/scratchpad';
const GUS = ['yeonsu', 'namdong', 'bupyeong', 'gyeyang', 'michuhol', 'seogu', 'junggu', 'donggu'];
const CK = [['주소 확인', '/check/address/'], ['건물 출입 확인', '/check/building-access/'], ['개인정보 처리', '/check/privacy/']];

const list = [];
const full = {};
const deepen = {};
let total = 0;
const missing = [];

for (const gu of GUS) {
  const p = path.join(SCRATCH, `incheon-${gu}.json`);
  if (!fs.existsSync(p)) { missing.push(gu); continue; }
  let arr;
  try { arr = JSON.parse(fs.readFileSync(p, 'utf8')); }
  catch (e) { console.error(`PARSE FAIL ${gu}: ${e.message}`); process.exit(1); }
  for (const d of arr) {
    const url = `/incheon/${d.slug}/`;
    list.push({ kind: 'dong', slug: d.slug, name: d.name, url, parentUrl: d.parentUrl, parentName: d.parentName, index: true });
    // related + CK, dedup by url
    const rel = (d.related || []).slice();
    for (const c of CK) if (!rel.some(r => r[1] === c[1])) rel.push(c);
    full[url] = {
      h1: d.h1, title: d.title, desc: d.desc, pills: d.pills, intro: d.intro,
      character: d.character, transport: d.transport, hotel: d.hotel, officetel: d.officetel,
      home: d.home, move: d.move, programHint: d.programHint, programs: d.programs,
      faq: d.faq, related: rel,
    };
    deepen[url] = d.deepen || [];
    total++;
  }
}

if (missing.length) { console.warn('WARN missing gu files (skipped): ' + missing.join(', ')); }

const header = '// 자동 생성 파일 — scripts/gen-incheon-dongs.js 로 재생성. 직접 수정 금지.\n';
const body =
  'const incheonDongList = ' + JSON.stringify(list, null, 0) + ';\n\n' +
  'const incheonDongFull = ' + JSON.stringify(full, null, 1) + ';\n\n' +
  'const incheonDongDeepen = ' + JSON.stringify(deepen, null, 1) + ';\n\n' +
  'module.exports = { incheonDongList, incheonDongFull, incheonDongDeepen };\n';

fs.writeFileSync(path.join(__dirname, '..', 'data', 'incheon-dongs.js'), header + body);
console.log(`OK: ${total} dongs across ${GUS.length} gu → data/incheon-dongs.js`);
