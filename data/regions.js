'use strict';

/** 권역 메인 3개 */
const regionMains = [
  {
    slug: 'siheung', name: '시흥', h1: '시흥 출장마사지 · 배곧·정왕·오이도 생활권 안내',
    intro: '시흥 출장마사지는 일반 도심형보다 신도시·산업단지·해안 숙소·외곽 이동 기준이 중요한 지역입니다. 배곧·정왕을 중심으로, 오이도·월곶은 해안 숙소 기준, 은계·장현은 아파트·오피스텔 기준으로 이용 환경을 나누어 안내합니다.',
    areaSlugs: ['baegot-jeongwang-oido', 'eungye-janghyeon-mokgam'],
    programs: ['swedish', 'aroma-therapy', 'foot-massage'],
    lifeLinks: ['baegot', 'jeongwang', 'oido-wolgot', 'eungye-daeya', 'janghyeon-cityhall', 'mokgam-neunggok', 'geobukseom'],
    lifeType: 'siheung',
  },
  {
    slug: 'bucheon', name: '부천', h1: '부천 출장마사지 · 중동·상동·송내 생활권 안내',
    intro: '부천 출장마사지는 서울과 인천 사이 고밀도 주거·상권 생활권입니다. 공식 행정구역상 원미구·소사구·오정구 3구 구조를 반영하되, 중동·상동·송내·역곡·소사·옥길 생활권을 먼저 안내합니다.',
    areaSlugs: ['bucheon-jungdong-sangdong-songnae', 'yeokgok-sosa-okgil', 'wonjong-gogang-ojeong'],
    programs: ['sports-massage', 'deep-tissue', 'swedish'],
    guLinks: ['wonmi-gu', 'sosa-gu', 'ojeong-gu'],
    lifeLinks: ['bucheon-jungdong-sangdong', 'songnae-bucheon-station', 'sinjungdong-cityhall', 'yeokgok-sosa', 'okgil-beombak', 'wonjong-gogang', 'ojeong-naedong'],
    lifeType: 'life',
  },
  {
    slug: 'incheon', name: '인천', h1: '인천 출장마사지 · 송도·부평·구월·청라 생활권 안내',
    intro: '인천 출장마사지는 공항·항만·국제도시·신도시 생활권이 함께 있는 지역입니다. 현재 2군·9구 새 행정체계를 반영하되, 기존 검색 수요가 큰 명칭은 안내 페이지로 연결합니다. 송도·부평·구월·청라·영종을 중심으로 안내합니다.',
    areaSlugs: ['songdo-yeonsu-nonhyeon', 'guwol-namdong-bupyeong', 'cheongna-seohae-geomdan', 'yeongjong-airport-jemulpo'],
    programs: ['swedish', 'aroma-therapy', 'foot-massage'],
    guLinks: ['yeonsu-gu', 'namdong-gu', 'bupyeong-gu', 'gyeyang-gu', 'michuhol-gu', 'jemulpo-gu', 'yeongjong-gu', 'seohae-gu', 'geomdan-gu', 'ganghwa-gun', 'ongjin-gun'],
    lifeLinks: ['songdo-international', 'yeonsu-dongchun', 'guwol-incheon-cityhall', 'nonhyeon-soraepogu', 'bupyeong-station-market', 'bupyeong-culture-street', 'gyesan-jakjeon', 'cheongna-lu1', 'geomdan-newtown', 'yeongjong-unseo', 'jemulpo-dongincheon', 'juan-dohwa-michuhol'],
    lifeType: 'life',
  },
];

/** 부천 3구 */
const bucheonGu = [
  { slug: 'wonmi-gu', name: '원미구', h1: '부천 원미구 출장마사지 생활권 안내',
    intro: '원미구는 중동·상동·부천시청을 포함하는 부천의 중심 생활권입니다. 오피스텔·아파트·상권이 밀집해 이용 환경이 다양합니다.',
    area: 'bucheon-jungdong-sangdong-songnae' },
  { slug: 'sosa-gu', name: '소사구', h1: '부천 소사구 출장마사지 생활권 안내',
    intro: '소사구는 소사·역곡·괴안·범박을 포함하는 서울 서남권 접경 주거 생활권입니다.',
    area: 'yeokgok-sosa-okgil' },
  { slug: 'ojeong-gu', name: '오정구', h1: '부천 오정구 출장마사지 생활권 안내',
    intro: '오정구는 원종·고강·오정·내동을 포함하며 김포공항·서울 강서와 연결되는 주거·산업 생활권입니다.',
    area: 'wonjong-gogang-ojeong' },
];

/** 인천 구·군 (기존 명칭은 canonical/안내 처리) */
const incheonGu = [
  { slug: 'yeonsu-gu', name: '연수구', h1: '인천 연수구 출장마사지 생활권 안내', area: 'songdo-yeonsu-nonhyeon',
    intro: '연수구는 송도국제도시·연수·동춘을 포함하는 국제업무·주거 생활권입니다.' },
  { slug: 'namdong-gu', name: '남동구', h1: '인천 남동구 출장마사지 생활권 안내', area: 'guwol-namdong-bupyeong',
    intro: '남동구는 구월동·인천시청과 남동산업단지 생활권을 포함하는 인천 도심 구간입니다.' },
  { slug: 'bupyeong-gu', name: '부평구', h1: '인천 부평구 출장마사지 생활권 안내', area: 'guwol-namdong-bupyeong',
    intro: '부평구는 부평역·부평시장·부평문화의거리를 중심으로 유동 인구가 많은 상권 생활권입니다.' },
  { slug: 'gyeyang-gu', name: '계양구', h1: '인천 계양구 출장마사지 생활권 안내', area: 'cheongna-seohae-geomdan',
    intro: '계양구는 계산·작전을 중심으로 서울·김포 방면 접근성이 있는 주거 생활권입니다.' },
  { slug: 'michuhol-gu', name: '미추홀구', h1: '인천 미추홀구 출장마사지 생활권 안내', area: 'yeongjong-airport-jemulpo',
    intro: '미추홀구는 주안·도화를 포함하는 인천 원도심 주거·상권 생활권입니다.' },
  { slug: 'jemulpo-gu', name: '제물포구(신설)', h1: '인천 제물포구 출장마사지 생활권 안내', area: 'yeongjong-airport-jemulpo',
    intro: '제물포구는 인천 행정체계 개편으로 신설되는 원도심 생활권으로, 기존 중구·동구 원도심 수요를 반영합니다.' },
  { slug: 'yeongjong-gu', name: '영종구(신설)', h1: '인천 영종구 출장마사지 생활권 안내', area: 'yeongjong-airport-jemulpo',
    intro: '영종구는 영종·운서·인천공항 생활권을 반영하는 신설 구로, 공항 인접 숙소 이용이 많습니다.' },
  { slug: 'seohae-gu', name: '서해구(신설)', h1: '인천 서해구 출장마사지 생활권 안내', area: 'cheongna-seohae-geomdan',
    intro: '서해구는 청라·가정·검암 등 기존 서구 남부 생활권을 반영하는 신설 구입니다.' },
  { slug: 'geomdan-gu', name: '검단구(신설)', h1: '인천 검단구 출장마사지 생활권 안내', area: 'cheongna-seohae-geomdan',
    intro: '검단구는 검단신도시를 중심으로 하는 신설 구로, 신축 아파트 단지가 밀집해 있습니다.' },
  { slug: 'ganghwa-gun', name: '강화군', h1: '인천 강화군 출장마사지 이용 안내', area: 'cheongna-seohae-geomdan', thin: true,
    intro: '강화군은 외곽·관광 생활권으로 이동 거리가 길어 예약 가능 시간과 이동료 기준을 먼저 확인해야 합니다.' },
  { slug: 'ongjin-gun', name: '옹진군', h1: '인천 옹진군 이용 안내', area: 'yeongjong-airport-jemulpo', thin: true,
    intro: '옹진군은 도서 지역 특성상 방문 가능 여부를 실제 위치·이동 기준으로 개별 확인해야 하는 구간입니다.' },
];

/** 기존 행정구역 안내(검색 수요 대응) — canonical 처리 */
const legacyGu = [
  { slug: 'jung-gu', name: '기존 인천 중구', canonicalTo: '/incheon-bucheon-siheung/incheon/jemulpo-gu/',
    h1: '기존 인천 중구 안내 — 제물포구·영종구로 분리',
    intro: '인천 행정체계 개편으로 기존 중구 생활권은 제물포구(원도심)와 영종구(공항·영종)로 분리되어 안내됩니다.',
    links: [['제물포구 안내', '/incheon-bucheon-siheung/incheon/jemulpo-gu/'], ['영종구 안내', '/incheon-bucheon-siheung/incheon/yeongjong-gu/']] },
  { slug: 'dong-gu', name: '기존 인천 동구', canonicalTo: '/incheon-bucheon-siheung/incheon/jemulpo-gu/',
    h1: '기존 인천 동구 안내 — 제물포구 생활권으로 연결',
    intro: '기존 동구 생활권은 제물포구 원도심 생활권으로 연결하여 안내합니다.',
    links: [['제물포구 안내', '/incheon-bucheon-siheung/incheon/jemulpo-gu/']] },
  { slug: 'seo-gu', name: '기존 인천 서구', canonicalTo: '/incheon-bucheon-siheung/incheon/seohae-gu/',
    h1: '기존 인천 서구 안내 — 서해구·검단구로 분리',
    intro: '기존 서구 생활권은 서해구(청라·가정·검암)와 검단구(검단신도시)로 분리되어 안내됩니다.',
    links: [['서해구 안내', '/incheon-bucheon-siheung/incheon/seohae-gu/'], ['검단구 안내', '/incheon-bucheon-siheung/incheon/geomdan-gu/']] },
];

/** 핵심 생활권(life) 페이지 — 상위 area로 canonical 연결 */
const lifePages = [
  // 부천
  { slug: 'bucheon-jungdong-sangdong', name: '부천 중동·상동', area: 'bucheon-jungdong-sangdong-songnae' },
  { slug: 'songnae-bucheon-station', name: '송내·부천역', area: 'bucheon-jungdong-sangdong-songnae' },
  { slug: 'sinjungdong-cityhall', name: '신중동·부천시청', area: 'bucheon-jungdong-sangdong-songnae' },
  { slug: 'yeokgok-sosa', name: '역곡·소사', area: 'yeokgok-sosa-okgil' },
  { slug: 'okgil-beombak', name: '옥길·범박', area: 'yeokgok-sosa-okgil' },
  { slug: 'wonjong-gogang', name: '원종·고강', area: 'wonjong-gogang-ojeong' },
  { slug: 'ojeong-naedong', name: '오정·내동', area: 'wonjong-gogang-ojeong' },
  // 인천
  { slug: 'songdo-international', name: '송도국제도시', area: 'songdo-yeonsu-nonhyeon' },
  { slug: 'yeonsu-dongchun', name: '연수·동춘', area: 'songdo-yeonsu-nonhyeon' },
  { slug: 'guwol-incheon-cityhall', name: '구월·인천시청', area: 'guwol-namdong-bupyeong' },
  { slug: 'nonhyeon-soraepogu', name: '논현·소래포구', area: 'songdo-yeonsu-nonhyeon' },
  { slug: 'bupyeong-station-market', name: '부평역·부평시장', area: 'guwol-namdong-bupyeong' },
  { slug: 'bupyeong-culture-street', name: '부평문화의거리', area: 'guwol-namdong-bupyeong' },
  { slug: 'gyesan-jakjeon', name: '계산·작전', area: 'cheongna-seohae-geomdan' },
  { slug: 'cheongna-lu1', name: '청라·루원시티', area: 'cheongna-seohae-geomdan' },
  { slug: 'geomdan-newtown', name: '검단신도시', area: 'cheongna-seohae-geomdan' },
  { slug: 'yeongjong-unseo', name: '영종·운서', area: 'yeongjong-airport-jemulpo' },
  { slug: 'jemulpo-dongincheon', name: '제물포·동인천', area: 'yeongjong-airport-jemulpo' },
  { slug: 'juan-dohwa-michuhol', name: '주안·도화·미추홀', area: 'yeongjong-airport-jemulpo' },
];

/** 시흥 핵심 페이지 (siheung/<slug>) — area로 canonical */
const siheungLife = [
  { slug: 'baegot', name: '배곧', area: 'baegot-jeongwang-oido' },
  { slug: 'jeongwang', name: '정왕', area: 'baegot-jeongwang-oido' },
  { slug: 'oido-wolgot', name: '오이도·월곶', area: 'baegot-jeongwang-oido' },
  { slug: 'eungye-daeya', name: '은계·대야', area: 'eungye-janghyeon-mokgam' },
  { slug: 'janghyeon-cityhall', name: '장현·시흥시청', area: 'eungye-janghyeon-mokgam' },
  { slug: 'mokgam-neunggok', name: '목감·능곡', area: 'eungye-janghyeon-mokgam' },
  { slug: 'geobukseom', name: '거북섬', area: 'baegot-jeongwang-oido' },
];

module.exports = { regionMains, bucheonGu, incheonGu, legacyGu, lifePages, siheungLife };
