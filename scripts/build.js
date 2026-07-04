'use strict';

/* =====================================================================
   간다GO 정적 사이트 생성기 (의존성 없음)
   node scripts/build.js  →  dist/ 에 전체 페이지 생성
   ===================================================================== */

const fs = require('fs');
const path = require('path');

const { SITE } = require('../src/config');
const { BASE, primaryNav, mobileNav } = require('../data/nav');
const { areas } = require('../data/areas');
const { programs } = require('../data/programs');
const { usePlaces, useHubs } = require('../data/places');
const { checks } = require('../data/checks');
const { regionMains, bucheonGu, incheonGu, legacyGu, lifePages, siheungLife } = require('../data/regions');
const { stations } = require('../data/stations');
const { operationPolicies, author, privacy, illegal, contact } = require('../data/policies');
const { lifeDetail, guDetail } = require('../data/localities');
const { deepen } = require('../data/deepen');
const siheung = require('../data/siheung');
const bucheon = require('../data/bucheon');
const incheon = require('../data/incheon');

// 지역 전용 모듈이 소유하는 URL/슬러그 (generic 빌더에서 중복 생성 방지)
const REGION_HUB_SLUGS = new Set(['siheung', 'bucheon', 'incheon']);
const REGION_STATION_SLUGS = new Set([...siheung.stations, ...bucheon.stations, ...incheon.stations].map(s => s.slug));
const REGION_AREA_SLUGS = new Set([...siheung.areas, ...bucheon.areas, ...incheon.areas].map(a => a.slug));

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

// 히어로 이미지 해석: 업로드된 사진(webp/jpg/png) 우선, 없으면 플레이스홀더 SVG
const HERO_IMG = (() => {
  const dir = path.join(ROOT, 'src/assets');
  for (const name of ['hero.webp', 'hero.jpg', 'hero.jpeg', 'hero.png', 'hero.svg']) {
    if (fs.existsSync(path.join(dir, name))) return '/assets/' + name;
  }
  return '/assets/hero.svg';
})();

// ------------------------------------------------------------------ //
// 유틸                                                                //
// ------------------------------------------------------------------ //
const esc = (s = '') => String(s).replace(/[&<>"']/g, c => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** 메타 디스크립션 80자 이내 보장 */
function desc80(s) {
  s = String(s).replace(/\s+/g, ' ').trim();
  if ([...s].length <= 80) return s;
  return [...s].slice(0, 79).join('').replace(/[,\s·]+$/, '') + '…';
}

const areaBySlug = Object.fromEntries(areas.map(a => [a.slug, a]));
const programBySlug = Object.fromEntries(programs.map(p => [p.slug, p]));

const abs = u => SITE.baseUrl.replace(/\/$/, '') + u;

// 등록된 모든 페이지(사이트맵/내부링크 검증용)
const registry = [];

// ------------------------------------------------------------------ //
// 공통 컴포넌트                                                        //
// ------------------------------------------------------------------ //
const phoneSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`;
const tgSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21.94 4.66a1.2 1.2 0 0 0-1.63-1.3L2.9 10.2c-.98.38-.96 1.8.03 2.15l4.3 1.5 1.66 5.06c.26.8 1.28 1 1.83.36l2.4-2.77 4.2 3.1c.66.48 1.6.12 1.77-.68l2.85-14.35zM9.5 14.1l7.3-6.55-5.9 7.02-.04 3.02-1.36-3.49z"/></svg>`;

function header(active) {
  const links = primaryNav.map(n =>
    `<a href="${esc(n.href)}"${n.href === active ? ' aria-current="page"' : ''}>${esc(n.label)}</a>`
  ).join('');
  const mobile = mobileNav.map(g =>
    `<div class="grp">${esc(g.grp)}</div>` +
    g.items.map(i => `<a href="${esc(i.href)}">${esc(i.label)}</a>`).join('')
  ).join('');
  return `<header class="site-header">
  <div class="container nav">
    <a class="brand" href="${BASE}/"><span class="mark">G</span>${esc(SITE.brand)}</a>
    <nav class="nav-links" aria-label="주요">${links}</nav>
    <a class="nav-cta" href="${SITE.phoneHref}">${phoneSvg}<span>전화예약 ${esc(SITE.phone)}</span></a>
    <button class="nav-toggle" data-nav-toggle aria-label="메뉴 열기" aria-expanded="false" aria-controls="m-menu">☰</button>
  </div>
  <div class="mobile-menu" id="m-menu" data-mobile-menu><div class="container">${mobile}</div></div>
</header>`;
}

function heroMedia() {
  return `<div class="hero-media"><img src="${esc(HERO_IMG)}" alt="간다GO 시흥·부천·인천 출장마사지 안내" width="560" height="620" fetchpriority="high" decoding="async"></div>`;
}

function floatingCall() {
  // 모든 페이지 · 오렌지 아이콘 · 애니메이션 · 터치 시 전화 연결
  return `<a class="floating-call" href="${SITE.phoneHref}" aria-label="전화 예약하기 ${esc(SITE.phone)}">
  <span class="fc-label">전화예약 ${esc(SITE.phone)}</span>${phoneSvg}
</a>`;
}

function footer() {
  const t = SITE.telegram;
  return `<footer class="site-footer">
  <div class="footer-cta">
    <div class="container inner">
      <div>
        <h2>웹사이트 제작·제휴 문의</h2>
        <p>지역 안내 사이트 제작, 제휴 관련 문의는 텔레그램으로 편하게 연락 주세요.</p>
      </div>
      <div class="btns">
        <a class="btn-inquiry" href="${esc(t.website)}" target="_blank" rel="noopener nofollow">${tgSvg}<span>웹사이트 제작문의</span></a>
        <a class="btn-inquiry" href="${esc(t.partner)}" target="_blank" rel="noopener nofollow">${tgSvg}<span>제휴문의</span></a>
      </div>
    </div>
  </div>
  <div class="footer-main">
    <div class="container footer-cols">
      <div class="footer-brand">
        <a class="brand" href="${BASE}/"><span class="mark">G</span>${esc(SITE.brand)}</a>
        <p>${esc(SITE.tagline)}. 방문형 웰니스 서비스의 예약·상담을 안내하는 지역 안내 사이트입니다. 불법·선정적 서비스는 제공하거나 안내하지 않습니다.</p>
      </div>
      <div>
        <h4>바로가기</h4>
        <a href="${BASE}/siheung/">시흥권</a>
        <a href="${BASE}/bucheon/">부천권</a>
        <a href="${BASE}/incheon/">인천권</a>
        <a href="${BASE}/program/">마사지 프로그램</a>
        <a href="${BASE}/sitemap-page/">사이트맵</a>
      </div>
      <div>
        <h4>예약·문의</h4>
        <p class="footer-contact"><span class="phone"><a href="${SITE.phoneHref}">${esc(SITE.phone)}</a></span><br>전화예약 · 상호 ${esc(SITE.brand)}</p>
        <a href="${BASE}/policy/operation/">운영 기준</a>
        <a href="${BASE}/policy/privacy/">개인정보 처리방침</a>
        <a href="${BASE}/policy/illegal-service/">불법·선정적 서비스 불가 안내</a>
      </div>
    </div>
  </div>
  <div class="footer-bottom">
    <div class="container">
      <span>© ${esc(SITE.brand)} · 시흥·부천·인천 출장마사지 지역 안내</span>
      <span>전화예약 ${esc(SITE.phone)}</span>
    </div>
  </div>
</footer>`;
}

// ------------------------------------------------------------------ //
// 스키마 (JSON-LD)                                                    //
//  사용: WebPage, BreadcrumbList, Organization, FAQPage, ImageObject  //
//  미사용: LocalBusiness, Review, AggregateRating                     //
// ------------------------------------------------------------------ //
function organizationSchema() {
  return {
    '@type': 'Organization',
    '@id': abs('/#organization'),
    name: SITE.brand,
    url: abs(BASE + '/'),
    telephone: SITE.phone,
    areaServed: ['시흥', '부천', '인천'],
    sameAs: [SITE.telegram.reserve],
  };
}

function buildSchema({ url, title, description, breadcrumbs, faq, image }) {
  const graph = [];
  const imgObj = {
    '@type': 'ImageObject',
    '@id': abs(url) + '#primaryimage',
    url: abs(image || SITE.ogImage),
    caption: title,
  };
  graph.push(imgObj);
  graph.push({
    '@type': 'WebPage',
    '@id': abs(url),
    url: abs(url),
    name: title,
    description: description,
    inLanguage: 'ko',
    isPartOf: { '@id': abs(BASE + '/#website') },
    primaryImageOfPage: { '@id': imgObj['@id'] },
    publisher: { '@id': abs('/#organization') },
  });
  graph.push({
    '@type': 'WebSite',
    '@id': abs(BASE + '/#website'),
    url: abs(BASE + '/'),
    name: SITE.brand + ' · ' + SITE.tagline,
    inLanguage: 'ko',
    publisher: { '@id': abs('/#organization') },
  });
  graph.push(organizationSchema());
  if (breadcrumbs && breadcrumbs.length) {
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((b, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: b.name,
        item: abs(b.href),
      })),
    });
  }
  if (faq && faq.length) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: faq.map(f => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    });
  }
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
}

// ------------------------------------------------------------------ //
// 레이아웃                                                            //
// ------------------------------------------------------------------ //
function layout(opts) {
  const {
    url, title, description, breadcrumbs = [], body,
    active = null, noindex = false, canonical = null, faq = null, image = null,
  } = opts;

  const metaDesc = desc80(description);
  const canon = abs(canonical || url);
  const robots = noindex ? '<meta name="robots" content="noindex,follow">' : '<meta name="robots" content="index,follow,max-image-preview:large">';
  const schema = buildSchema({ url, title, description: metaDesc, breadcrumbs, faq, image });

  const crumbHtml = breadcrumbs.length ? `<nav class="breadcrumb" aria-label="위치"><div class="container"><ol>${
    breadcrumbs.map((b, i) => i === breadcrumbs.length - 1
      ? `<li>${esc(b.name)}</li>`
      : `<li><a href="${esc(b.href)}">${esc(b.name)}</a></li>`).join('')
  }</ol></div></nav>` : '';

  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(metaDesc)}">
${robots}
<link rel="canonical" href="${esc(canon)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(SITE.brand)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(metaDesc)}">
<meta property="og:url" content="${esc(canon)}">
<meta property="og:image" content="${esc(abs(image || SITE.ogImage))}">
<meta property="og:locale" content="ko_KR">
<meta name="twitter:card" content="summary_large_image">
<meta name="format-detection" content="telephone=yes">
<meta name="theme-color" content="#0b1120">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css">
<link rel="stylesheet" href="/assets/styles.css">
<script type="application/ld+json">${schema}</script>
</head>
<body>
<a class="skip-link" href="#main">본문 바로가기</a>
${header(active)}
${crumbHtml}
<main id="main">
${body}
</main>
${footer()}
${floatingCall()}
<script src="/assets/app.js" defer></script>
</body>
</html>`;
}

// ------------------------------------------------------------------ //
// 재사용 블록                                                         //
// ------------------------------------------------------------------ //
function whwBlock(who, how, why) {
  return `<h2>Who · How · Why</h2>
<div class="whw">
  <div class="card"><h3>Who</h3><p>${esc(who)}</p></div>
  <div class="card"><h3>How</h3><p>${esc(how)}</p></div>
  <div class="card"><h3>Why</h3><p>${esc(why)}</p></div>
</div>`;
}
const WHW_DEFAULT = {
  who: '이 콘텐츠는 시흥·부천·인천 지역 방문형 웰니스 서비스 이용 전, 사용자가 위치·숙소 유형·건물 출입·예약 조건을 확인할 수 있도록 작성되었습니다.',
  how: '공식 행정구역 자료, 주요 생활권 구조, 실제 예약 전 확인 항목, 개인정보 처리 기준, 불법·선정적 서비스 불가 원칙을 기준으로 작성하며 최종 문구는 사람이 검수합니다.',
  why: '이 페이지의 목적은 검색 순위 조작이 아니라, 자택·호텔·오피스텔·공항·산단 인접 숙소 이용 전 필요한 확인사항을 쉽게 안내하는 것입니다. 방문 가능 여부는 실제 주소와 예약 조건 확인 후 안내합니다.',
};

const ILLEGAL_NOTICE = `<div class="notice-illegal"><strong>불법·선정적 서비스 불가 안내</strong><br>간다GO는 방문형 웰니스 관리 서비스의 예약·상담만 안내합니다. 성적·불법 서비스는 제공하거나 안내하지 않으며, 이를 암시하는 문의에도 응하지 않습니다.</div>`;

function faqBlock(list) {
  if (!list || !list.length) return '';
  return `<h2 id="faq">자주 묻는 질문</h2>
<div class="faq">${list.map(f => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('')}</div>`;
}

function relatedLinks(title, links) {
  if (!links.length) return '';
  return `<h2>${esc(title)}</h2><div class="linklist">${
    links.map(([label, href]) => `<a href="${esc(href)}">${esc(label)}</a>`).join('')
  }</div>`;
}

// area slug → 같은 생활권 세부지역 목록(형제 내부링크용)
const localityIndex = {};
function registerLocality(areaSlug, name, url) {
  (localityIndex[areaSlug] = localityIndex[areaSlug] || []).push([name, url]);
}

/** 세부 생활권 / 구 상세 본문 (2,000자 목표, area 페이지와 동일 H2 골격) */
function renderLocalityArticle(d, ctx) {
  const { name, area, selfUrl, relatedLabel, relatedLinksArr } = ctx;
  const progLinks = (d.programs || []).map(s => [programBySlug[s].name, `${BASE}/program/${s}/`]);
  const whoRegion = name + ' 생활권';
  const siblings = (localityIndex[area.slug] || []).filter(([, u]) => u !== selfUrl);
  const stayLinks = [['자택 이용', `${BASE}/use/home/`], ['호텔·숙소', `${BASE}/use/hotel/`],
    ['오피스텔', `${BASE}/use/officetel/`], ['아파트 단지', `${BASE}/use/apartment/`]];
  return `<h1>${esc(name)} 출장마사지 이용 안내</h1>
<p>${esc(d.intro)}</p>
${ctaRow()}
<h2>이 지역의 생활권 특징</h2>
${d.character.map(p => `<p>${esc(p)}</p>`).join('')}
<h2>가까운 역·광역교통 기준</h2>
<p>${esc(d.transport)}</p>
<h2>숙소·오피스텔·자택 이용 전 확인</h2>
<p>${esc(d.stay)}</p>
<div class="linklist">${stayLinks.map(([l, h]) => `<a href="${esc(h)}">${esc(l)}</a>`).join('')}</div>
<h2>공항·항만·산단·신도시 이동 기준</h2>
<p>${esc(d.move)}</p>
<h2>마사지 프로그램 선택 기준</h2>
<p>${esc(d.programHint)}</p>
<div class="linklist">${progLinks.map(([l, h]) => `<a href="${esc(h)}">${esc(l)}</a>`).join('')}</div>
<h2>예약 전 체크리스트</h2>
<ul class="check-list">
<li>정확한 도로명 주소와 동·호수, 건물명</li>
<li>공동현관·엘리베이터 출입 방법과 카드키 여부</li>
<li>방문차량 등록 필요 여부와 주차 동선</li>
<li>원하는 예약 시간대와 프로그램, 이동 거리</li>
</ul>
<h2>개인정보 처리 기준</h2>
<p>예약 확인과 연락에 필요한 최소 정보만 확인하며, 목적이 완료되면 지체 없이 파기합니다. 자세한 내용은 <a href="${BASE}/policy/privacy/">개인정보 처리방침</a>에서 안내합니다.</p>
<h2>불법·선정적 서비스 불가 안내</h2>
${ILLEGAL_NOTICE}
${faqBlock(d.faq)}
${whwBlock(WHW_DEFAULT.who.replace('시흥·부천·인천 지역', esc(whoRegion)), WHW_DEFAULT.how, WHW_DEFAULT.why)}
${relatedLinks(relatedLabel || '관련 지역 보기', relatedLinksArr || [[`${area.name} 생활권`, `${BASE}/area/${area.slug}/`]])}
${siblings.length ? relatedLinks(`${area.name} 생활권 내 다른 지역`, siblings) : ''}`;
}

function ctaRow() {
  return `<div class="lead-cta">
    <a class="btn btn-primary" href="${SITE.phoneHref}">${phoneSvg}전화예약 ${esc(SITE.phone)}</a>
    <a class="btn btn-outline" href="${esc(SITE.telegram.reserve)}" target="_blank" rel="noopener nofollow">텔레그램 문의</a>
  </div>`;
}

// ------------------------------------------------------------------ //
// 페이지 쓰기                                                         //
// ------------------------------------------------------------------ //
function writePage(url, html, meta = {}) {
  const rel = url.replace(/^\//, '');
  const dir = url.endsWith('/') ? path.join(DIST, rel) : path.join(DIST, path.dirname(rel));
  const file = url.endsWith('/') ? path.join(dir, 'index.html') : path.join(DIST, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  registry.push({ url, noindex: !!meta.noindex, canonical: meta.canonical || url });
}

function crumbs(...parts) {
  return [{ name: '홈', href: BASE + '/' }, ...parts];
}

module.exports = { run };

// ------------------------------------------------------------------ //
// 개별 페이지 빌더                                                    //
// ------------------------------------------------------------------ //
function buildAreaPage(a) {
  const url = `${BASE}/area/${a.slug}/`;
  const region = regionMains.find(r => r.slug === a.region);
  const progLinks = a.programs.map(s => [programBySlug[s].name, `${BASE}/program/${s}/`]);
  const relArea = a.relatedAreas.map(s => [areaBySlug[s].name, `${BASE}/area/${s}/`]);
  const stationLinks = (a.stations || []).map(s => {
    const st = stations.find(x => x.slug === s);
    return st ? [st.name, `${BASE}/station/${s}/`] : null;
  }).filter(Boolean);

  const faq = [
    { q: `${a.name} 지역도 방문이 가능한가요?`, a: '실제 방문 주소, 가까운 생활권, 예약 가능 시간, 이동 기준, 숙소 유형을 확인한 뒤 안내합니다.' },
    { q: `${a.name}에서는 어떤 프로그램이 적합한가요?`, a: a.programHint },
    { q: '호텔·오피스텔에서도 이용할 수 있나요?', a: '숙소 정책, 객실 출입 가능 여부, 공동현관, 야간 출입 가능 여부를 먼저 확인해야 합니다.' },
    { q: '불법·선정적 서비스도 가능한가요?', a: '불법·선정적 서비스는 제공하거나 안내하지 않습니다.' },
  ];

  const body = `<article class="section"><div class="container article">
<h1>${esc(a.name)} 출장마사지 이용 안내</h1>
<div class="pill-row">${a.places.map(p => `<span class="pill">${esc(p)}</span>`).join('')}</div>
<p>${esc(a.intro)}</p>
${ctaRow()}

<h2>이 지역의 생활권 특징</h2>
${a.character.map(p => `<p>${esc(p)}</p>`).join('')}

<h2>가까운 역·광역교통 기준</h2>
<p>${esc(a.transport)}</p>

<h2>호텔·숙소 이용 전 확인</h2>
<p>${esc(a.hotel)}</p>

<h2>오피스텔 이용 전 확인</h2>
<p>${esc(a.officetel)}</p>

<h2>아파트·자택 이용 전 확인</h2>
<p>${esc(a.home)}</p>

<h2>공항·항만·산단·신도시 이동 기준</h2>
<p>${esc(a.move)}</p>

<h2>마사지 프로그램 선택 기준</h2>
<p>${esc(a.programHint)}</p>
<div class="linklist">${progLinks.map(([l, h]) => `<a href="${esc(h)}">${esc(l)}</a>`).join('')}</div>

<h2>예약 전 체크리스트</h2>
<ul class="check-list">
<li>정확한 도로명 주소와 동·호수</li>
<li>공동현관·엘리베이터 출입 방법</li>
<li>방문차량 등록 필요 여부</li>
<li>원하는 예약 시간대와 프로그램</li>
</ul>

<h2>개인정보 처리 기준</h2>
<p>예약 확인과 연락에 필요한 최소 정보만 확인하며, 자세한 내용은 <a href="${BASE}/policy/privacy/">개인정보 처리방침</a>에서 안내합니다.</p>

<h2>불법·선정적 서비스 불가 안내</h2>
${ILLEGAL_NOTICE}

${faqBlock(faq)}
${whwBlock(WHW_DEFAULT.who.replace('시흥·부천·인천 지역', esc(a.name) + ' 생활권'), WHW_DEFAULT.how, WHW_DEFAULT.why)}

${relatedLinks('관련 생활권 보기', [[`${esc(region.name)}권 전체`, `${BASE}/${region.slug}/`], ...relArea])}
${stationLinks.length ? relatedLinks('가까운 역세권 안내', stationLinks) : ''}
</div></article>`;

  const bc = crumbs(
    { name: `${region.name}권`, href: `${BASE}/${region.slug}/` },
    { name: a.name, href: url });

  writePage(url, layout({
    url, active: null,
    title: `${a.name} 출장마사지 · 생활권 이용 안내｜${SITE.brand}`,
    description: `${a.name} 출장마사지·홈타이 예약 전 생활권·교통·숙소 이용 기준과 프로그램 선택을 안내합니다.`,
    breadcrumbs: bc, body, faq,
  }));
}

function buildProgramPage(p) {
  const url = `${BASE}/program/${p.slug}/`;
  const regionLinks = (p.regions || []).map(s => {
    if (areaBySlug[s]) return [areaBySlug[s].name, `${BASE}/area/${s}/`];
    const st = stations.find(x => x.slug === s);
    if (st) return [st.name, `${BASE}/station/${s}/`];
    return null;
  }).filter(Boolean);
  const faq = [
    { q: `${p.name}은(는) 어떤 분에게 적합한가요?`, a: `${p.goodFor.join(', ')} 등을 원하는 분에게 적합합니다. 컨디션에 따라 압과 방식을 조절합니다.` },
    { q: '어떤 장소에서 이용할 수 있나요?', a: '숙소 유형에 따라 이용 기준이 다릅니다. 호텔·오피스텔·자택 이용 전 공동현관·객실 출입 정책을 확인하세요.' },
    { q: '불법·선정적 서비스도 가능한가요?', a: '불법·선정적 서비스는 제공하거나 안내하지 않습니다.' },
  ];
  const body = `<article class="section"><div class="container article">
<h1>${esc(p.name)} 안내</h1>
<div class="pill-row">${p.goodFor.map(g => `<span class="pill">${esc(g)}</span>`).join('')}</div>
<p>${esc(p.intro)}</p>
${ctaRow()}
<h2>${esc(p.name)} 프로그램 특징</h2>
<table class="meta-table"><tbody>
${p.detail.map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')}
</tbody></table>
${(deepen[url] || []).length ? `<h2>${esc(p.name)} 이용 안내와 대상</h2>${(deepen[url] || []).map(x => `<p>${esc(x)}</p>`).join('')}` : ''}
<h2>이용 장소 선택 기준</h2>
<p>같은 프로그램이라도 자택·호텔·오피스텔에 따라 준비물과 확인 항목이 다릅니다. 아래 이용 장소 안내를 함께 확인하세요.</p>
<div class="linklist">
  <a href="${BASE}/use/home/">자택 이용</a>
  <a href="${BASE}/use/hotel/">호텔·숙소</a>
  <a href="${BASE}/use/officetel/">오피스텔</a>
</div>
<h2>불법·선정적 서비스 불가 안내</h2>
${ILLEGAL_NOTICE}
${faqBlock(faq)}
${whwBlock(`이 콘텐츠는 ${esc(p.name)} 프로그램을 이용하기 전 압·방식·이용 장소 기준을 확인할 수 있도록 작성되었습니다.`, WHW_DEFAULT.how, WHW_DEFAULT.why)}
${regionLinks.length ? relatedLinks(`${esc(p.name)} 추천 지역 보기`, regionLinks) : ''}
${relatedLinks('다른 프로그램 보기', programs.filter(x => x.slug !== p.slug).slice(0, 6).map(x => [x.name, `${BASE}/program/${x.slug}/`]))}
</div></article>`;
  writePage(url, layout({
    url, active: BASE + '/program/',
    title: `${p.name}｜시흥·부천·인천 출장마사지 프로그램 안내 · ${SITE.brand}`,
    description: `${p.name} 압·방식·이용 장소 기준과 추천 지역을 안내합니다. 예약 전 확인사항을 함께 안내합니다.`,
    breadcrumbs: crumbs({ name: '마사지 프로그램', href: `${BASE}/program/` }, { name: p.name, href: url }),
    body, faq,
  }));
}

// 지역 전용 모듈 페이지와 중복되는 이용장소 허브 → noindex + canonical 통합
const USE_DUP_CANONICAL = {
  'incheon-airport-accommodation': '/use/incheon-airport-stay/',
  'yeongjong-airport-city': '/incheon/yeongjong-unseo/',
  'songdo-business-district': '/use/incheon-songdo-business/',
  'namdong-industrial-area': '/incheon/namdong-gu/',
  'incheon-port-jemulpo': '/incheon/jemulpo-dongincheon/',
  'bucheon-commerce-area': '/use/bucheon-commerce-stay/',
  'geomdan-newtown': '/incheon/geomdan-newtown/',
};

function buildUsePage(u, kind) {
  const url = `${BASE}/use/${u.slug}/`;
  const dupCanon = USE_DUP_CANONICAL[u.slug];
  if (dupCanon) { u = Object.assign({}, u, { noindex: true, canonicalTo: dupCanon }); }
  const bodyParas = (u.body || []).map(p => `<p>${esc(p)}</p>`).join('');
  const otherUse = usePlaces.filter(x => x.slug !== u.slug).slice(0, 6).map(x => [x.name, `${BASE}/use/${x.slug}/`]);
  const body = `<article class="section"><div class="container article">
<h1>${esc(u.h1)}</h1>
<p>${esc(u.intro)}</p>
${ctaRow()}
<h2>${esc(u.name)} 이용 환경 안내</h2>
${bodyParas}
${(deepen[url] || []).map(x => `<p>${esc(x)}</p>`).join('')}
<h2>예약 전 확인 항목</h2>
<ul class="check-list">${u.points.map(pt => `<li>${esc(pt)}</li>`).join('')}</ul>
<div class="callout">지역·예약 시간대·이동 거리에 따라 상담 시 최종 확인됩니다.</div>
<h2>불법·선정적 서비스 불가 안내</h2>
${ILLEGAL_NOTICE}
${faqBlock(u.faq)}
${whwBlock(`이 콘텐츠는 ${esc(u.name)} 이용 전 출입·이동·예약 확인 항목을 안내하기 위해 작성되었습니다.`, WHW_DEFAULT.how, WHW_DEFAULT.why)}
${relatedLinks('예약 전 확인', [['고객 안내사항', `${BASE}/check/customer-notice/`], ['개인정보 처리', `${BASE}/check/privacy/`], ['이동료 기준', `${BASE}/check/travel-fee/`]])}
${relatedLinks('다른 이용 장소', otherUse)}
${relatedLinks('생활권 안내', areas.slice(0, 6).map(a => [a.name, `${BASE}/area/${a.slug}/`]))}
</div></article>`;
  writePage(url, layout({
    url, active: BASE + '/use/home/',
    noindex: !!u.noindex, canonical: u.canonicalTo ? BASE + u.canonicalTo : null,
    title: `${u.h1}｜${SITE.brand}`,
    description: `${u.name} 출장마사지 이용 전 출입·이동·예약 확인 항목을 안내합니다.`,
    breadcrumbs: crumbs({ name: '이용 장소', href: `${BASE}/use/home/` }, { name: u.name, href: url }),
    body, faq: u.faq,
  }), { noindex: !!u.noindex, canonical: u.canonicalTo ? BASE + u.canonicalTo : null });
}

function buildCheckPage(c) {
  const url = `${BASE}/check/${c.slug}/`;
  const body = `<article class="section"><div class="container article">
<h1>${esc(c.h1)}</h1>
<p>${esc(c.intro)}</p>
${ctaRow()}
<h2>확인 항목</h2>
<ul class="check-list">${c.points.map(pt => `<li>${esc(pt)}</li>`).join('')}</ul>
<div class="callout">지역·예약 시간대·이동 거리에 따라 상담 시 최종 확인됩니다.</div>
<h2>불법·선정적 서비스 불가 안내</h2>
${ILLEGAL_NOTICE}
${relatedLinks('다른 확인사항', checks.filter(x => x.slug !== c.slug).slice(0, 8).map(x => [x.name, `${BASE}/check/${x.slug}/`]))}
</div></article>`;
  writePage(url, layout({
    url, active: BASE + '/check/customer-notice/',
    title: `${c.h1}｜${SITE.brand}`,
    description: `${c.name} — 시흥·부천·인천 출장마사지 예약 전 확인 안내입니다.`,
    breadcrumbs: crumbs({ name: '예약 전 확인', href: `${BASE}/check/customer-notice/` }, { name: c.name, href: url }),
    body,
  }));
}

function buildRegionMain(r) {
  const url = `${BASE}/${r.slug}/`;
  const areaCards = r.areaSlugs.map(s => {
    const a = areaBySlug[s];
    return `<div class="card"><span class="tag">${esc(a.places.slice(0,3).join(' · '))}</span><h3>${esc(a.name)}</h3><p>${esc(desc80(a.intro))}</p><a class="card-link" href="${BASE}/area/${a.slug}/">생활권 안내 →</a></div>`;
  }).join('');
  const guLinks = (r.guLinks || []).map(g => {
    const src = r.slug === 'bucheon' ? bucheonGu : incheonGu;
    const gu = src.find(x => x.slug === g);
    return gu ? [gu.name, `${BASE}/${r.slug}/${g}/`] : null;
  }).filter(Boolean);
  const lifeLinks = (r.lifeLinks || []).map(s => {
    if (r.lifeType === 'siheung') return [siheungLife.find(x => x.slug === s).name, `${BASE}/siheung/${s}/`];
    return [lifePages.find(x => x.slug === s).name, `${BASE}/life/${s}/`];
  });
  const progLinks = r.programs.map(s => [programBySlug[s].name, `${BASE}/program/${s}/`]);

  const body = `<section class="hero"><div class="container hero-grid">
<div class="hero-copy">
<span class="eyebrow">서부 수도권 · ${esc(r.name)}권</span>
<h1>${esc(r.h1)}</h1>
<p class="lead">${esc(r.intro)}</p>
${ctaRow()}
</div>
${heroMedia()}
</div></section>
<section class="section"><div class="container">
<div class="section-head"><span class="kicker">생활권 안내</span><h2>${esc(r.name)}권 핵심 생활권</h2><p>지역명만 보는 것보다 실제 생활권과 숙소 유형을 함께 확인하세요.</p></div>
<div class="grid grid-3">${areaCards}</div>
</div></section>
<section class="section-tight"><div class="container article">
${guLinks.length ? relatedLinks(r.slug === 'bucheon' ? '행정구(원미·소사·오정) 안내' : '인천 구·군 안내', guLinks) : ''}
${relatedLinks('세부 생활권 바로가기', lifeLinks)}
${relatedLinks('마사지 프로그램', progLinks)}
${relatedLinks('예약 전 확인', [['이용 장소', `${BASE}/use/home/`], ['고객 안내', `${BASE}/check/customer-notice/`], ['이동료 기준', `${BASE}/check/travel-fee/`]])}
</div></section>`;
  writePage(url, layout({
    url, active: url,
    title: `${r.h1}｜${SITE.brand}`,
    description: `${r.name} 출장마사지·홈타이 주요 생활권과 숙소·교통 이용 기준을 안내합니다.`,
    breadcrumbs: crumbs({ name: `${r.name}권`, href: url }),
    body,
  }));
}

function buildGuPage(g, regionSlug, regionName) {
  const url = `${BASE}/${regionSlug}/${g.slug}/`;
  const a = areaBySlug[g.area];
  const detail = guDetail[g.slug];
  const bc = crumbs({ name: `${regionName}권`, href: `${BASE}/${regionSlug}/` }, { name: g.name, href: url });

  if (detail && !g.thin) {
    const relArea = [[`${a.name} 생활권`, `${BASE}/area/${a.slug}/`], [`${regionName}권 전체`, `${BASE}/${regionSlug}/`]];
    const body = `<article class="section"><div class="container article">
${renderLocalityArticle(detail, { name: g.name, area: a, selfUrl: url, relatedLabel: '관련 생활권 보기', relatedLinksArr: relArea })}
</div></article>`;
    writePage(url, layout({
      url, active: `${BASE}/${regionSlug}/`,
      title: `${g.h1}｜${SITE.brand}`,
      description: `${g.name} 출장마사지 생활권·교통·숙소 이용 기준과 프로그램 선택을 안내합니다.`,
      breadcrumbs: bc, body, faq: detail.faq,
    }));
    return;
  }

  // thin(강화군·옹진군 등) 또는 상세 없음 → 라이트 + noindex
  const body = `<article class="section"><div class="container article">
<h1>${esc(g.h1)}</h1>
<p>${esc(g.intro)}</p>
${g.thin ? '<div class="callout warn">외곽·도서 생활권은 방문 가능 여부를 실제 위치와 이동 기준으로 개별 확인합니다.</div>' : ''}
${ctaRow()}
<h2>가까운 생활권 안내</h2>
<p>${esc(g.name)} 이용 환경은 <a href="${BASE}/area/${a.slug}/">${esc(a.name)} 생활권 안내</a>에서 자세히 확인할 수 있습니다.</p>
<div class="linklist"><a href="${BASE}/area/${a.slug}/">${esc(a.name)} 생활권 →</a><a href="${BASE}/${regionSlug}/">${esc(regionName)}권 전체 →</a></div>
<h2>불법·선정적 서비스 불가 안내</h2>
${ILLEGAL_NOTICE}
</div></article>`;
  writePage(url, layout({
    url, active: `${BASE}/${regionSlug}/`,
    noindex: !!g.thin,
    title: `${g.h1}｜${SITE.brand}`,
    description: `${g.name} 출장마사지 생활권과 이용 기준을 안내합니다. 예약 전 확인사항을 함께 안내합니다.`,
    breadcrumbs: bc, body,
  }), { noindex: !!g.thin });
}

function buildLegacyGuPage(g) {
  const url = `${BASE}/incheon/${g.slug}/`;
  const body = `<article class="section"><div class="container article">
<h1>${esc(g.h1)}</h1>
<p>${esc(g.intro)}</p>
<div class="callout">이 페이지는 기존 검색 수요 안내용이며, 아래 새 행정구역 안내로 연결됩니다.</div>
<div class="linklist">${g.links.map(([l, h]) => `<a href="${esc(h)}">${esc(l)} →</a>`).join('')}</div>
</div></article>`;
  writePage(url, layout({
    url, active: `${BASE}/incheon/`,
    noindex: true, canonical: g.canonicalTo,
    title: `${g.h1}｜${SITE.brand}`,
    description: `${g.name} 생활권은 새 인천 행정체계 기준으로 안내됩니다.`,
    breadcrumbs: crumbs({ name: '인천권', href: `${BASE}/incheon/` }, { name: g.name, href: url }),
    body,
  }), { noindex: true, canonical: g.canonicalTo });
}

/** life / siheung 세부 생활권 */
function buildLifePage(l, base, regionSlug, regionName) {
  const url = `${base}/${l.slug}/`;
  const a = areaBySlug[l.area];
  const detail = lifeDetail[l.slug];
  const bc = crumbs(
    { name: `${regionName}권`, href: `${BASE}/${regionSlug}/` },
    { name: a.name, href: `${BASE}/area/${a.slug}/` },
    { name: l.name, href: url });

  if (detail) {
    // 고유 본문 확보 → 자기 자신 canonical, index 승격
    const relArea = [[`${a.name} 생활권 전체`, `${BASE}/area/${a.slug}/`],
      [`${regionName}권 전체`, `${BASE}/${regionSlug}/`]];
    const body = `<article class="section"><div class="container article">
${renderLocalityArticle(detail, { name: l.name, area: a, selfUrl: url, relatedLabel: '관련 지역 보기', relatedLinksArr: relArea })}
</div></article>`;
    writePage(url, layout({
      url, active: `${BASE}/${regionSlug}/`,
      title: `${l.name} 출장마사지 · ${a.name} 생활권 안내｜${SITE.brand}`,
      description: `${l.name} 출장마사지 생활권·교통·숙소 이용 기준과 프로그램 선택을 안내합니다.`,
      breadcrumbs: bc, body, faq: detail.faq,
    }));
    return;
  }

  // 상세 데이터 없는 경우 상위 area로 canonical
  const canonical = `${BASE}/area/${a.slug}/`;
  const body = `<article class="section"><div class="container article">
<h1>${esc(l.name)} 출장마사지 생활권 안내</h1>
<p>${esc(l.name)}은(는) ${esc(a.name)} 생활권에 속하는 세부 구간입니다. 이용 환경과 예약 전 확인 기준은 상위 생활권 안내에서 함께 관리합니다.</p>
<p>${esc(a.intro)}</p>
${ctaRow()}
<h2>이용 기준 자세히 보기</h2>
<div class="linklist"><a href="${canonical}">${esc(a.name)} 생활권 전체 안내 →</a><a href="${BASE}/${regionSlug}/">${esc(regionName)}권 전체 →</a></div>
<h2>불법·선정적 서비스 불가 안내</h2>
${ILLEGAL_NOTICE}
</div></article>`;
  writePage(url, layout({
    url, active: `${BASE}/${regionSlug}/`, canonical,
    title: `${l.name} 출장마사지 · ${a.name} 생활권｜${SITE.brand}`,
    description: `${l.name} 출장마사지 이용 기준은 ${a.name} 생활권 안내에서 확인하세요.`,
    breadcrumbs: bc, body,
  }), { canonical });
}

function buildStationPage(s) {
  const url = `${BASE}/station/${s.slug}/`;
  const a = areaBySlug[s.area];
  const body = `<article class="section"><div class="container article">
<h1>${esc(s.name)} 인근 출장마사지 이용 안내</h1>
<p>${esc(s.name)}(${esc(s.line)}) 인근은 ${esc(a.name)} 생활권에 속합니다. 역 출구별 개별 안내가 아닌 생활권 단위로 이용 기준을 안내합니다.</p>
${ctaRow()}
<div class="linklist"><a href="${BASE}/area/${a.slug}/">${esc(a.name)} 생활권 안내 →</a><a href="${BASE}/use/station-area/">역세권 이용 기준 →</a></div>
${ILLEGAL_NOTICE}
</div></article>`;
  writePage(url, layout({
    url, active: null, noindex: true, canonical: `${BASE}/area/${a.slug}/`,
    title: `${s.name} 인근 출장마사지 안내｜${SITE.brand}`,
    description: `${s.name} 인근은 ${a.name} 생활권으로 이용 기준을 안내합니다.`,
    breadcrumbs: crumbs({ name: a.name, href: `${BASE}/area/${a.slug}/` }, { name: s.name, href: url }),
    body,
  }), { noindex: true, canonical: `${BASE}/area/${a.slug}/` });
}

function buildSimpleDoc(d, parentName, parentHref, active) {
  const url = `${BASE}/policy/${d.slug}/`;
  const body = `<article class="section"><div class="container article">
<h1>${esc(d.h1)}</h1>
<p>${esc(d.intro)}</p>
${(d.body || []).map(([k, v]) => `<h2>${esc(k)}</h2><p>${esc(v)}</p>`).join('')}
${d.slug !== 'privacy' && d.slug !== 'illegal-service' ? '' : ''}
</div></article>`;
  writePage(url, layout({
    url, active,
    title: `${d.h1}｜${SITE.brand}`,
    description: `${d.name} — ${SITE.brand} 운영·정책 안내입니다.`,
    breadcrumbs: crumbs({ name: parentName, href: parentHref }, { name: d.name, href: url }),
    body,
  }));
  return url;
}

// ------------------------------------------------------------------ //
// 메인 / 프로그램 메인 / 이용장소 인덱스 / 확인 인덱스 / 문의 / 사이트맵 //
// ------------------------------------------------------------------ //
function buildHome() {
  const url = `${BASE}/`;
  const areaCards = areas.map(a =>
    `<div class="card"><span class="tag">${esc(regionMains.find(r=>r.slug===a.region).name)}권</span><h3>${esc(a.name)}</h3><p>${esc(desc80(a.intro))}</p><a class="card-link" href="${BASE}/area/${a.slug}/">생활권 안내 →</a></div>`
  ).join('');
  const regionCards = regionMains.map(r =>
    `<div class="card is-accent"><h3>${esc(r.name)}권</h3><p>${esc(desc80(r.intro))}</p><a class="card-link" href="${BASE}/${r.slug}/">${esc(r.name)}권 보기 →</a></div>`
  ).join('');
  const progCards = programs.map(p =>
    `<div class="card"><h3>${esc(p.name)}</h3><p>${esc(p.goodFor.join(' · '))}</p><a class="card-link" href="${BASE}/program/${p.slug}/">프로그램 안내 →</a></div>`
  ).join('');
  const useCards = usePlaces.map(u =>
    `<a class="pill" href="${BASE}/use/${u.slug}/">${esc(u.name)}</a>`
  ).join('');

  const faq = [
    { q: '시흥·부천·인천 전 지역 방문이 가능한가요?', a: '실제 방문 주소, 가까운 생활권, 예약 가능 시간, 이동 기준, 숙소 유형을 확인한 뒤 안내합니다.' },
    { q: '마사지 프로그램 페이지도 있나요?', a: '스웨디시, 아로마테라피, 타이마사지, 스포츠 마사지, 발마사지 등 프로그램별 안내 페이지를 제공합니다.' },
    { q: '호텔이나 오피스텔에서도 이용할 수 있나요?', a: '숙소 정책, 객실 출입 가능 여부, 공동현관, 야간 출입 가능 여부를 먼저 확인해야 합니다.' },
    { q: '불법·선정적 서비스도 가능한가요?', a: '불법·선정적 서비스는 제공하거나 안내하지 않습니다.' },
    { q: '개인정보는 어떻게 처리하나요?', a: '예약 확인과 연락에 필요한 최소 정보만 확인하며, 개인정보 처리방침 페이지로 연결합니다.' },
  ];

  const body = `<section class="hero"><div class="container hero-grid">
<div class="hero-copy">
<span class="eyebrow">시흥 · 부천 · 인천 서부 수도권</span>
<h1>시흥·부천·인천 출장마사지 · 서부 수도권 생활권 안내</h1>
<p class="lead">시흥 배곧·정왕, 부천 중동·상동, 인천 송도·부평·구월·청라·영종 등 주요 생활권과 호텔·오피스텔·자택·공항·산단 인접 숙소 이용 전 확인사항을 안내합니다.</p>
<div class="hero-cta">
  <a class="btn btn-primary btn-lg" href="${SITE.phoneHref}">${phoneSvg}전화예약 ${esc(SITE.phone)}</a>
  <a class="btn btn-ghost btn-lg" href="${BASE}/siheung/">시흥권 보기</a>
  <a class="btn btn-ghost btn-lg" href="${BASE}/bucheon/">부천권 보기</a>
  <a class="btn btn-ghost btn-lg" href="${BASE}/incheon/">인천권 보기</a>
</div>
</div>
${heroMedia()}
</div></section>

<section class="section"><div class="container">
<div class="section-head"><span class="kicker">권역 안내</span><h2>서부 수도권은 생활권별 이용 기준이 다릅니다</h2>
<p>시흥은 신도시·산단·해안 숙소, 부천은 서울·인천 사이 고밀도 주거·상권, 인천은 공항·항만·국제도시·신도시 생활권이 함께 있는 지역입니다. 도시명보다 배곧·중동·송도·부평·영종처럼 실제 생활권을 함께 확인하세요.</p></div>
<div class="grid grid-3">${regionCards}</div>
</div></section>

<section class="section" id="areas"><div class="container">
<div class="section-head"><span class="kicker">9대 생활권</span><h2>9대 광역 생활권 바로가기</h2><p>같은 도시라도 숙소 유형과 이동 동선이 다릅니다.</p></div>
<div class="grid grid-3">${areaCards}</div>
</div></section>

<section class="section" id="programs"><div class="container">
<div class="section-head"><span class="kicker">프로그램</span><h2>마사지 프로그램 안내</h2><p>압·방식·이용 장소 기준을 프로그램별로 확인하세요.</p></div>
<div class="grid grid-3">${progCards}</div>
<div class="lead-cta"><a class="btn btn-outline" href="${BASE}/program/">프로그램 전체 보기 →</a></div>
</div></section>

<section class="section"><div class="container article">
<div class="section-head"><span class="kicker">이용 장소</span><h2>이용 장소별 확인 기준</h2></div>
<div class="linklist">${useCards}</div>
${faqBlock(faq)}
${whwBlock(WHW_DEFAULT.who, WHW_DEFAULT.how, WHW_DEFAULT.why)}
</div></section>`;

  writePage(url, layout({
    url, active: url,
    title: `시흥·부천·인천 출장마사지｜송도·부평·상동·배곧 홈타이 지역 안내 · ${SITE.brand}`,
    description: '시흥·부천·인천 출장마사지·홈타이 주요 생활권과 숙소·교통 이용 기준 안내. 전화예약 ' + SITE.phone,
    breadcrumbs: [{ name: '홈', href: url }],
    body, faq,
  }));
}

function buildProgramIndex() {
  const url = `${BASE}/program/`;
  const cards = programs.map(p =>
    `<div class="card"><h3>${esc(p.name)}</h3><p>${esc(p.intro)}</p><div class="pill-row">${p.goodFor.map(g=>`<span class="pill">${esc(g)}</span>`).join('')}</div><a class="card-link" href="${BASE}/program/${p.slug}/">자세히 보기 →</a></div>`
  ).join('');
  const body = `<section class="hero"><div class="container">
<span class="eyebrow">마사지 프로그램</span>
<h1>시흥·부천·인천 출장마사지 프로그램 안내</h1>
<p class="lead">스웨디시·타이마사지·아로마테라피·스포츠·발마사지·딥티슈·로미로미·커플·야간까지, 압과 방식·이용 장소 기준을 프로그램별로 안내합니다.</p>
${ctaRow()}
</div></section>
<section class="section"><div class="container"><div class="grid grid-3">${cards}</div></div></section>
<section class="section-tight"><div class="container article">
${relatedLinks('지역별 안내', areas.map(a => [a.name, `${BASE}/area/${a.slug}/`]))}
</div></section>`;
  writePage(url, layout({
    url, active: url,
    title: `마사지 프로그램 안내｜시흥·부천·인천 출장마사지 · ${SITE.brand}`,
    description: '스웨디시·타이·아로마·스포츠·발마사지 등 출장마사지 프로그램별 이용 기준 안내.',
    breadcrumbs: crumbs({ name: '마사지 프로그램', href: url }),
    body,
  }));
}

function buildContact() {
  const url = `${BASE}/contact/`;
  const t = SITE.telegram;
  const body = `<section class="hero"><div class="container">
<span class="eyebrow">문의하기</span>
<h1>${esc(contact.h1)}</h1>
<p class="lead">${esc(contact.intro)}</p>
</div></section>
<section class="section"><div class="container article">
<table class="meta-table"><tbody>
<tr><th>상호</th><td>${esc(SITE.brand)}</td></tr>
<tr><th>전화예약</th><td><a href="${SITE.phoneHref}">${esc(SITE.phone)}</a></td></tr>
<tr><th>예약·상담</th><td>전화 및 텔레그램</td></tr>
<tr><th>안내 지역</th><td>시흥 · 부천 · 인천 서부 수도권</td></tr>
</tbody></table>
<div class="lead-cta">
<a class="btn btn-primary" href="${SITE.phoneHref}">${phoneSvg}전화예약 ${esc(SITE.phone)}</a>
<a class="btn-inquiry" href="${esc(t.website)}" target="_blank" rel="noopener nofollow">${tgSvg}웹사이트 제작문의</a>
<a class="btn-inquiry" href="${esc(t.partner)}" target="_blank" rel="noopener nofollow">${tgSvg}제휴문의</a>
</div>
<div class="callout">지역·예약 시간대·이동 거리에 따라 상담 시 최종 확인됩니다.</div>
${relatedLinks('예약 전 확인', [['고객 안내', `${BASE}/check/customer-notice/`], ['운영 기준', `${BASE}/policy/operation/`], ['개인정보 처리방침', `${BASE}/policy/privacy/`]])}
</div></section>`;
  writePage(url, layout({
    url, active: url,
    title: `${contact.h1}｜${SITE.brand}`,
    description: `${SITE.brand} 출장마사지 예약·상담 문의. 전화예약 ${SITE.phone}`,
    breadcrumbs: crumbs({ name: '문의하기', href: url }),
    body,
  }));
}

function buildSitemapPage(allUrls) {
  const url = `${BASE}/sitemap-page/`;
  const regionLinks = module_ => [
    ...module_.areas.map(a => [a.h1.split(' · ')[0], BASE + a.url]),
    ...module_.details.map(d => [d.h1.split(' · ')[0], BASE + d.url]),
    ...module_.stations.map(s => [s.h1.split(' · ')[0], BASE + s.url]),
    ...module_.uses.map(u => [u.h1.split(' · ')[0], BASE + u.url]),
  ];
  const groups = [
    ['권역', regionMains.map(r => [`${r.name}권`, `${BASE}/${r.slug}/`])],
    ['9대 생활권', areas.map(a => [a.name, `${BASE}/area/${a.slug}/`])],
    ['시흥 상세', [['시흥 메인', `${BASE}/siheung/`], ...regionLinks(siheung)]],
    ['부천 상세', [['부천 메인', `${BASE}/bucheon/`], ...regionLinks(bucheon)]],
    ['인천 상세', [['인천 메인', `${BASE}/incheon/`], ...regionLinks(incheon)]],
    ['마사지 프로그램', [['프로그램 전체', `${BASE}/program/`], ...programs.map(p => [p.name, `${BASE}/program/${p.slug}/`])]],
    ['이용 장소', usePlaces.map(u => [u.name, `${BASE}/use/${u.slug}/`])],
    ['공항·항만·산단', useHubs.map(u => [u.name, `${BASE}/use/${u.slug}/`])],
    ['예약 전 확인', checks.map(c => [c.name, `${BASE}/check/${c.slug}/`])],
    ['운영·정책', [...operationPolicies.map(p => [p.name, `${BASE}/policy/${p.slug}/`]),
      [author.name, `${BASE}/policy/${author.slug}/`], [privacy.name, `${BASE}/policy/${privacy.slug}/`],
      [illegal.name, `${BASE}/policy/${illegal.slug}/`], ['문의하기', `${BASE}/contact/`]]],
  ];
  const body = `<section class="section"><div class="container article">
<h1>사이트맵</h1>
<p>간다GO 시흥·부천·인천 출장마사지 안내의 전체 페이지 구조입니다.</p>
${groups.map(([t, links]) => relatedLinks(t, links)).join('')}
</div></section>`;
  writePage(url, layout({
    url, active: null,
    title: `사이트맵｜${SITE.brand}`,
    description: '시흥·부천·인천 출장마사지 안내 전체 페이지 구조.',
    breadcrumbs: crumbs({ name: '사이트맵', href: url }),
    body,
  }));
}

// ------------------------------------------------------------------ //
// 정적 자원 / sitemap.xml / robots.txt / OG                          //
// ------------------------------------------------------------------ //
function copyAssets() {
  const assets = path.join(DIST, 'assets');
  fs.mkdirSync(assets, { recursive: true });
  fs.copyFileSync(path.join(ROOT, 'src/styles.css'), path.join(assets, 'styles.css'));
  fs.copyFileSync(path.join(ROOT, 'src/app.js'), path.join(assets, 'app.js'));

  // 파비콘 / 앱 아이콘 → dist 루트
  const favDir = path.join(ROOT, 'src/favicon');
  ['favicon.ico', 'favicon.svg', 'favicon-16.png', 'favicon-32.png',
   'apple-touch-icon.png', 'icon-512.png'].forEach(f => {
    const src = path.join(favDir, f);
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(DIST, f));
  });
  // src/assets 전체(히어로 이미지 등 업로드 파일 포함) → dist/assets
  const srcAssets = path.join(ROOT, 'src/assets');
  if (fs.existsSync(srcAssets)) {
    for (const f of fs.readdirSync(srcAssets)) {
      if (/^hero-src\./i.test(f)) continue; // 원본(대용량)은 배포 제외 — WebP만 서빙
      const s = path.join(srcAssets, f);
      if (fs.statSync(s).isFile()) fs.copyFileSync(s, path.join(assets, f));
    }
  }

  // 웹 매니페스트(안드로이드 홈 화면 아이콘)
  fs.writeFileSync(path.join(DIST, 'site.webmanifest'), JSON.stringify({
    name: SITE.brand + ' · 시흥·부천·인천 출장마사지',
    short_name: SITE.brand,
    icons: [
      { src: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    theme_color: '#f97316',
    background_color: '#0b1120',
    display: 'standalone',
    start_url: '/',
  }, null, 2));
  // OG 커버 (자체 포함 SVG)
  const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0b1120"/><stop offset="1" stop-color="#131b2e"/></linearGradient>
<linearGradient id="o" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ff9a4d"/><stop offset="1" stop-color="#f97316"/></linearGradient></defs>
<rect width="1200" height="630" fill="url(#g)"/>
<circle cx="1010" cy="120" r="220" fill="#f97316" opacity="0.12"/>
<text x="80" y="270" fill="#f4f7fc" font-family="Pretendard,sans-serif" font-size="64" font-weight="800">시흥·부천·인천 출장마사지</text>
<text x="80" y="350" fill="#cdd6e6" font-family="Pretendard,sans-serif" font-size="36">송도·부평·상동·배곧 서부 수도권 생활권 안내</text>
<rect x="80" y="410" width="360" height="72" rx="36" fill="url(#o)"/>
<text x="120" y="457" fill="#ffffff" font-family="Pretendard,sans-serif" font-size="32" font-weight="700">전화예약 ${esc(SITE.phone)}</text>
<text x="80" y="560" fill="#93a1ba" font-family="Pretendard,sans-serif" font-size="28">간다GO</text>
</svg>`;
  fs.writeFileSync(path.join(assets, 'og-cover.svg'), og);
}

function writeSitemapXml() {
  const urls = registry.filter(r => !r.noindex).map(r => {
    return `  <url><loc>${abs(r.url)}</loc><changefreq>weekly</changefreq></url>`;
  }).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>\n`;
  fs.writeFileSync(path.join(DIST, 'sitemap.xml'), xml);
}

function writeRobots() {
  const txt = `User-agent: *
Allow: /
Sitemap: ${abs('/sitemap.xml')}
`;
  fs.writeFileSync(path.join(DIST, 'robots.txt'), txt);
}

function writeRootRedirect() {
  // 루트(/) → /incheon-bucheon-siheung/
  const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<title>${esc(SITE.brand)} · 시흥·부천·인천 출장마사지</title>
<link rel="canonical" href="${abs(BASE + '/')}">
<meta http-equiv="refresh" content="0; url=${BASE}/"></head>
<body><p><a href="${BASE}/">시흥·부천·인천 출장마사지 안내로 이동</a></p></body></html>`;
  fs.writeFileSync(path.join(DIST, 'index.html'), html);
}

// ------------------------------------------------------------------ //
// 시흥 상세(§8 고정 H2) 렌더러 + 섹션 빌더                            //
// ------------------------------------------------------------------ //
function pillsHtml(pills) {
  if (!pills || !pills.length) return '';
  return `<div class="pill-row">${pills.map(p => `<span class="pill">${esc(p)}</span>`).join('')}</div>`;
}

/** §8 공통 H2 구조 본문 (area/detail/station/use 공용) */
function siheungArticleBody(p) {
  const progLinks = (p.programs || []).map(s => [programBySlug[s].name, `${BASE}/program/${s}/`]);
  const rel = (p.related || []).map(([l, h]) => [l, h.startsWith('http') ? h : BASE + h]);
  return `<section class="hero hero-sub"><div class="container hero-grid">
<div class="hero-copy">
<h1>${esc(p.h1)}</h1>
${pillsHtml(p.pills)}
<p class="lead">${esc(p.intro)}</p>
${ctaRow()}
</div>
${heroMedia()}
</div></section>
<article class="section"><div class="container article">
<table class="meta-table"><tbody>
<tr><th>주요 지역</th><td>${esc((p.pills || []).join(' · '))}</td></tr>
<tr><th>추천 프로그램</th><td>${progLinks.map(([l, h]) => `<a href="${esc(h)}">${esc(l)}</a>`).join(' · ')}</td></tr>
<tr><th>이용 장소</th><td><a href="${BASE}/use/home/">자택</a> · <a href="${BASE}/use/hotel/">호텔·숙소</a> · <a href="${BASE}/use/officetel/">오피스텔</a> · <a href="${BASE}/use/apartment/">아파트</a></td></tr>
<tr><th>예약·문의</th><td>전화 <a href="${SITE.phoneHref}">${esc(SITE.phone)}</a> · <a href="${esc(SITE.telegram.reserve)}" target="_blank" rel="noopener nofollow">텔레그램</a></td></tr>
</tbody></table>
<h2>이 지역의 생활권 특징</h2>
${[...p.character, ...(deepen[p.url] || [])].map(c => `<p>${esc(c)}</p>`).join('')}
<h2>가까운 역세권과 이동 기준</h2>
<p>${esc(p.transport)}</p>
<h2>호텔·숙소 이용 전 확인</h2>
<p>${esc(p.hotel)}</p>
<h2>오피스텔 이용 전 확인</h2>
<p>${esc(p.officetel)}</p>
<h2>아파트·자택 이용 전 확인</h2>
<p>${esc(p.home)}</p>
<h2>산단·해안·신도시 이동 기준</h2>
<p>${esc(p.move)}</p>
<h2>마사지 프로그램 선택 기준</h2>
<p>${esc(p.programHint)}</p>
<ul class="check-list">${(p.programs || []).map(s => { const pr = programBySlug[s]; return pr ? `<li><strong>${esc(pr.name)}</strong> — ${esc(pr.goodFor.join(' · '))} (${esc(pr.detail[0][1].split('.')[0])})</li>` : ''; }).join('')}</ul>
<div class="linklist">${progLinks.map(([l, h]) => `<a href="${esc(h)}">${esc(l)}</a>`).join('')}</div>
<h2>예약 전 체크리스트</h2>
<ul class="check-list">
<li>정확한 도로명 주소와 동·호수, 건물명</li>
<li>공동현관·엘리베이터 출입 방법과 카드키 여부</li>
<li>방문차량 등록 필요 여부와 주차 동선</li>
<li>원하는 예약 시간대·프로그램과 이동 거리</li>
</ul>
<h2>개인정보 처리 기준</h2>
<p>예약 확인과 연락에 필요한 최소 정보만 확인하며, 목적이 완료되면 지체 없이 파기합니다. 자세한 내용은 <a href="${BASE}/policy/privacy/">개인정보 처리방침</a>에서 안내합니다.</p>
<h2>불법·선정적 서비스 불가 안내</h2>
${ILLEGAL_NOTICE}
${faqBlock(p.faq)}
${whwBlock(WHW_DEFAULT.who.replace('시흥·부천·인천 지역', esc((p.pills && p.pills[0]) || '시흥') + ' 생활권'), WHW_DEFAULT.how, WHW_DEFAULT.why)}
${relatedLinks('관련 지역 보기', rel)}
</div></article>`;
}

function buildRegionDetail(p, reg, crumbTail) {
  const url = BASE + p.url;
  writePage(url, layout({
    url, active: reg.hubHref,
    title: `${p.title}｜${SITE.brand}`,
    description: p.desc,
    breadcrumbs: [{ name: '홈', href: BASE + '/' }, { name: reg.name + '권', href: reg.hubHref }, ...crumbTail, { name: p.h1.split(' · ')[0], href: url }],
    body: siheungArticleBody(p), faq: p.faq,
  }));
}

function buildRegionHub(module, reg) {
  const h = module.hub;
  const url = BASE + h.url;
  const allDetails = module.details.concat(module.areas);
  const repCard = slug => {
    const d = allDetails.find(x => x.slug === slug);
    return `<div class="card"><h3>${esc(d.h1.split(' · ')[0])}</h3><p>${esc(desc80(d.intro))}</p><a class="card-link" href="${BASE}${d.url}">생활권 안내 →</a></div>`;
  };
  const stationLinks = h.stations.map(s => {
    const st = module.stations.find(x => x.slug === s);
    return [st.h1.split(' · ')[0], BASE + st.url];
  });
  const groupsHtml = h.groups.map(g => `<section class="section"><div class="container">
<div class="section-head"><span class="kicker">${esc(g.kicker)}</span><h2>${esc(g.title)}</h2></div>
<div class="grid grid-3">${g.slugs.map(repCard).join('')}</div>
</div></section>`).join('');
  const body = `<section class="hero"><div class="container hero-grid">
<div class="hero-copy">
<span class="eyebrow">${esc(reg.name)} · 서부 수도권</span>
<h1>${esc(h.h1)}</h1>
<p class="lead">${esc(h.intro)}</p>
<div class="hero-cta">
  <a class="btn btn-primary btn-lg" href="${SITE.phoneHref}">${phoneSvg}전화예약 ${esc(SITE.phone)}</a>
  ${h.ctaAreas.map(([l, u]) => `<a class="btn btn-ghost btn-lg" href="${BASE}${u}">${esc(l)}</a>`).join('\n  ')}
</div>
</div>
${heroMedia()}
</div></section>
<section class="section"><div class="container article"><p>${esc(h.lead)}</p></div></section>
${groupsHtml}
<section class="section-tight"><div class="container article">
${h.hubBody.map(([t, b]) => `<h2>${esc(t)}</h2><p>${esc(b)}</p>`).join('')}
${relatedLinks('역세권·광역교통', stationLinks)}
${relatedLinks('이용 장소별 확인', h.useLinks.map(([l, u]) => [l, BASE + u]))}
${relatedLinks('마사지 프로그램', h.programs.map(s => [programBySlug[s].name, `${BASE}/program/${s}/`]))}
${faqBlock(h.faq)}
${whwBlock(WHW_DEFAULT.who.replace('시흥·부천·인천 지역', esc(reg.name)), WHW_DEFAULT.how, WHW_DEFAULT.why)}
</div></section>`;
  writePage(url, layout({
    url, active: reg.hubHref,
    title: `${h.title}｜${SITE.brand}`,
    description: h.desc,
    breadcrumbs: crumbs({ name: reg.name + '권', href: url }),
    body, faq: h.faq,
  }));
}

function buildRegionDongStub(d, reg) {
  const url = BASE + d.url;
  const body = `<section class="hero hero-sub"><div class="container hero-grid">
<div class="hero-copy">
<h1>${esc(d.name)} 출장마사지 안내</h1>
<p class="lead">${esc(d.name)}은(는) ${esc(d.parentName)} 생활권에 속하는 행정동 구간입니다. 이용 환경과 예약 전 확인 기준은 상위 생활권 안내에서 함께 관리합니다.</p>
${ctaRow()}
</div>
${heroMedia()}
</div></section>
<article class="section"><div class="container article">
<div class="linklist"><a href="${BASE}${d.parentUrl}">${esc(d.parentName)} 생활권 안내 →</a><a href="${reg.hubHref}">${esc(reg.name)} 메인 →</a></div>
${ILLEGAL_NOTICE}
</div></article>`;
  writePage(url, layout({
    url, active: reg.hubHref, noindex: !d.index, canonical: d.index ? null : BASE + d.parentUrl,
    title: `${d.name} 출장마사지 · ${d.parentName} 생활권｜${SITE.brand}`,
    description: `${d.name} 출장마사지 이용 기준은 ${d.parentName} 생활권 안내에서 확인하세요.`,
    breadcrumbs: [{ name: '홈', href: BASE + '/' }, { name: reg.name + '권', href: reg.hubHref }, { name: d.parentName, href: BASE + d.parentUrl }, { name: d.name, href: url }],
    body,
  }), { noindex: !d.index, canonical: d.index ? null : BASE + d.parentUrl });
}

function buildRegionCombo(c, reg) {
  const url = BASE + c.url;
  const body = `<article class="section"><div class="container article">
<h1>${esc(c.name)} 안내</h1>
<p>${esc(c.region)} 지역의 ${esc(c.programName)} 이용 안내입니다. 자세한 지역 이용 기준과 프로그램 특징은 아래 페이지에서 확인하세요.</p>
${ctaRow()}
<div class="linklist"><a href="${BASE}${c.detailUrl}">${esc(c.region)} 생활권 안내 →</a><a href="${BASE}${c.programUrl}">${esc(c.programName)} 프로그램 →</a></div>
${ILLEGAL_NOTICE}
</div></article>`;
  writePage(url, layout({
    url, active: reg.hubHref, noindex: true, canonical: BASE + c.detailUrl,
    title: `${c.name} 출장마사지｜${SITE.brand}`,
    description: `${c.region} ${c.programName} 이용 안내. 지역·프로그램 페이지로 연결합니다.`,
    breadcrumbs: [{ name: '홈', href: BASE + '/' }, { name: reg.name + '권', href: reg.hubHref }, { name: c.name, href: url }],
    body,
  }), { noindex: true, canonical: BASE + c.detailUrl });
}

function buildRegionSection(module, reg) {
  buildRegionHub(module, reg);
  module.areas.forEach(a => buildRegionDetail(a, reg, []));
  module.details.forEach(d => buildRegionDetail(d, reg, d.crumbParent ? [{ name: d.crumbParent[0], href: BASE + d.crumbParent[1] }] : []));
  module.stations.forEach(s => buildRegionDetail(s, reg, [{ name: '역세권', href: reg.hubHref }]));
  module.uses.forEach(u => buildRegionDetail(u, reg, [{ name: '이용 장소', href: reg.hubHref }]));
  (module.noindexDongs || []).forEach(d => buildRegionDongStub(d, reg));
  (module.programCombos || []).forEach(c => buildRegionCombo(c, reg));
}

// ------------------------------------------------------------------ //
// 실행                                                                //
// ------------------------------------------------------------------ //
function run() {
  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });

  buildHome();
  // 지역 전용 상세 모듈 (허브·권역·세부·역세권·이용장소·행정동)
  buildRegionSection(siheung, { name: '시흥', hubHref: BASE + '/siheung/' });
  buildRegionSection(bucheon, { name: '부천', hubHref: BASE + '/bucheon/' });
  buildRegionSection(incheon, { name: '인천', hubHref: BASE + '/incheon/' });

  // 기존 인천 행정구역 명칭 안내(검색 수요 대응) — canonical/노인덱스
  legacyGu.forEach(buildLegacyGuPage);

  buildProgramIndex();
  programs.forEach(buildProgramPage);

  usePlaces.forEach(u => buildUsePage(u, 'place'));
  useHubs.forEach(u => buildUsePage(u, 'hub'));
  checks.forEach(buildCheckPage);
  stations.filter(s => !REGION_STATION_SLUGS.has(s.slug)).forEach(buildStationPage);

  operationPolicies.forEach(p => buildSimpleDoc(p, '운영 기준', `${BASE}/policy/operation/`, `${BASE}/policy/operation/`));
  buildSimpleDoc(author, '운영 기준', `${BASE}/policy/operation/`, null);
  buildSimpleDoc(privacy, '운영 기준', `${BASE}/policy/operation/`, null);
  buildSimpleDoc(illegal, '운영 기준', `${BASE}/policy/operation/`, null);

  buildContact();
  buildSitemapPage();

  copyAssets();
  writeSitemapXml();
  writeRobots();
  if (BASE) writeRootRedirect(); // 루트 서빙 시 홈이 곧 /index.html 이므로 리다이렉트 불필요

  const indexable = registry.filter(r => !r.noindex).length;
  console.log(`✓ 생성 완료: 총 ${registry.length} 페이지 (index ${indexable} / noindex ${registry.length - indexable})`);
}

if (require.main === module) run();
