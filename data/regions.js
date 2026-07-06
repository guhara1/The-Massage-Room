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
// 인천 구(區) 전체 개요 허브 — 소속 행정동을 모아 안내하는 index 페이지
const legacyGu = [
  {
    slug: 'jung-gu', name: '인천 중구', gu: '중구',
    h1: '인천 중구 출장마사지 · 개항장·원도심·항만 생활권 안내',
    title: '인천 중구 출장마사지｜신포·동인천·개항장 원도심 안내',
    desc: '인천 중구 출장마사지 개항장·신포·동인천 원도심과 항만 배후 생활권 안내',
    intro: '인천 중구는 개항장·차이나타운·신포국제시장을 낀 인천 최고(最古)의 원도심과 연안부두 항만 배후를 아우르는 지역입니다. 도시명보다 신포·동인천·개항장처럼 실제 생활권을 함께 확인하는 것이 이용에 도움이 됩니다.',
    character: [
      '중구 원도심은 오래된 상가·주택과 일부 신축이 촘촘히 섞여 있고 골목이 좁아, 같은 동이라도 건물마다 공동현관 방식과 주차 여건이 크게 다릅니다. 정확한 도로명 주소와 출입 방법을 알려주시면 밀집 구간에서도 방문 동선을 안내드릴 수 있습니다.',
      '개항장·차이나타운 등 관광 수요가 겹치는 구간은 주말·성수기에 진입 도로가 혼잡해질 수 있어 이동 시간을 여유 있게 잡는 것이 좋습니다. 연안부두 방면은 항만 배후 특성상 이용 시간대와 이동 거리를 먼저 확인합니다.',
    ],
    body: [
      '이 페이지는 인천 중구 전체를 개괄하고 소속 행정동 안내로 연결하는 허브입니다. 각 동은 원도심·항만·관광 등 성격이 달라, 아래 행정동 안내에서 생활권 단위 이용 기준을 개별적으로 확인하실 수 있습니다.',
      '원도심 이완에는 스웨디시·아로마, 오래 서서 일하는 상권·항만 종사자의 다리·허리 부담에는 딥티슈·발마사지 문의가 많습니다. 방문 가능 여부와 이동료 기준은 실제 위치와 거리에 따라 상담 시 최종 확인됩니다.',
    ],
    dongSlugs: ['sinpo-dong', 'donginchon-dong', 'gaehang-dong', 'sinheung-dong', 'yeonan-dong', 'dowon-dong', 'yulmok-dong'],
    related: [['제물포·동인천 생활권', '/incheon/jemulpo-dongincheon/'], ['영종·운서(공항)', '/incheon/yeongjong-unseo/'], ['인천항·제물포 이용', '/use/incheon-port-jemulpo/'], ['인천권 전체', '/incheon/']],
    faq: [
      { q: '인천 중구는 어떤 지역인가요?', a: '개항장·신포국제시장·동인천역 상권을 낀 원도심과 연안부두 항만 배후가 중심인 지역으로, 관광·상업·주거가 섞여 있습니다.' },
      { q: '원도심은 방문 확인이 까다로운가요?', a: '골목이 좁고 건물 유형이 다양해 공동현관 방식이 제각각이라, 정확한 주소와 출입 방법을 미리 알려주시면 방문이 빠릅니다.' },
    ],
  },
  {
    slug: 'dong-gu', name: '인천 동구', gu: '동구',
    h1: '인천 동구 출장마사지 · 만석·송현·송림 원도심 생활권 안내',
    title: '인천 동구 출장마사지｜만석·송현·송림 원도심·재개발 안내',
    desc: '인천 동구 출장마사지 만석·송현·송림·금창 항만 배후·재개발 원도심 안내',
    intro: '인천 동구는 만석·화수동 항만·공업 배후와 송현·송림·금창동 원도심 주거가 중심인 지역으로, 수도국산·배다리 같은 오래된 생활권과 뉴스테이 재개발이 함께 있습니다.',
    character: [
      '동구는 노후 주택·다세대가 많은 원도심과 재개발 신축이 섞여 있어, 같은 생활권이라도 건물별 공동현관 방식과 주차 여건이 다릅니다. 예약 시 건물 유형과 출입 방법을 알려주시면 방문 동선을 정확히 안내드립니다.',
      '만석·화수동은 항만·공업 배후 성격이 있어 이동 시간대를, 송림 재개발 단지는 방문차량 등록과 동 위치 확인을 먼저 확인하는 것이 좋습니다. 좁은 이면도로 구간은 진입로와 주차 가능 여부를 함께 확인합니다.',
    ],
    body: [
      '이 페이지는 인천 동구 전체를 개괄하고 소속 행정동 안내로 연결하는 허브입니다. 각 동은 항만 배후·노후 원도심·재개발 신축 등 성격이 달라, 아래 행정동 안내에서 생활권 단위 이용 기준을 개별적으로 확인하실 수 있습니다.',
      '원도심 주거 이완에는 스웨디시·아로마, 근무·이동 피로에는 딥티슈·발마사지 문의가 많습니다. 방문 가능 여부와 이동료 기준은 실제 위치와 거리에 따라 상담 시 최종 확인됩니다.',
    ],
    dongSlugs: ['manseok-dong', 'hwasu-hwapyeong-dong', 'hwasu-2-dong', 'songhyeon-1-2-dong', 'songhyeon-3-dong', 'songnim-1-dong', 'songnim-2-dong', 'songnim-3-5-dong', 'songnim-4-dong', 'songnim-6-dong', 'geumchang-dong'],
    related: [['제물포·동인천 생활권', '/incheon/jemulpo-dongincheon/'], ['인천항·제물포 이용', '/use/incheon-port-jemulpo/'], ['인천 중구', '/incheon/jung-gu/'], ['인천권 전체', '/incheon/']],
    faq: [
      { q: '인천 동구는 어떤 지역인가요?', a: '만석·화수동 항만·공업 배후와 송현·송림·금창동 원도심 주거가 중심으로, 수도국산·배다리 등 오래된 생활권과 재개발이 함께 있습니다.' },
      { q: '재개발 단지 방문은 어떻게 확인하나요?', a: '송림 일대 신축 대단지는 방문차량 등록과 정확한 동·호수 확인이 필요하니 예약 시 함께 알려주시면 좋습니다.' },
    ],
  },
  {
    slug: 'seo-gu', name: '인천 서구', gu: '서구',
    h1: '인천 서구 출장마사지 · 청라·검단·가정·석남 생활권 안내',
    title: '인천 서구 출장마사지｜청라·검단신도시·가정·석남 안내',
    desc: '인천 서구 출장마사지 청라국제도시·검단신도시·가정·석남·가좌 생활권 안내',
    intro: '인천 서구는 청라국제도시·검단신도시 같은 대규모 신도시와 가정 루원시티·석남·가좌 원도심·산업 배후가 함께 있는 인천 최대 면적의 구입니다. 신도시·재개발·원도심이 한 지역에 섞여 있어 생활권별 이용 환경이 크게 다릅니다.',
    character: [
      '청라국제도시·검단신도시는 신축 대단지 아파트가 중심이라 방문차량 등록과 정문·후문·동 위치 확인이 방문 시간을 좌우합니다. 반면 가정·석남·가좌 일대는 원도심·재개발·산업 배후가 섞여 건물 유형별 공동현관 방식이 다릅니다.',
      '서구는 면적이 넓고 김포·인천 경계까지 이어져 생활권 간 이동 거리가 큰 편입니다. 정확한 단지명·동·호수 또는 도로명 주소를 알려주시면 이동 여건에 맞춰 예약 가능 시간과 기준을 안내드립니다.',
    ],
    body: [
      '이 페이지는 인천 서구 전체를 개괄하고 소속 행정동 안내로 연결하는 허브입니다. 청라·검단 신도시 구간과 가정·석남·가좌 원도심 구간은 이용 환경이 크게 달라, 아래 행정동 안내에서 생활권 단위 기준을 개별적으로 확인하실 수 있습니다.',
      '신도시 정주형 이완에는 스웨디시·아로마, 좌식 근무·산업 배후 피로에는 딥티슈·스포츠 마사지 문의가 많습니다. 방문 가능 여부와 이동료 기준은 실제 위치와 거리에 따라 상담 시 최종 확인됩니다.',
    ],
    dongSlugs: ['cheongna-1-dong', 'cheongna-2-dong', 'cheongna-3-dong', 'geomam-gyeongseo-dong', 'yeonhui-dong', 'gajeong-1-dong', 'gajeong-2-dong', 'gajeong-3-dong', 'sinhyeon-wonchang-dong', 'seongnam-1-dong', 'seongnam-2-dong', 'seongnam-3-dong', 'gajwa-1-dong', 'gajwa-2-dong', 'gajwa-3-dong', 'gajwa-4-dong', 'geomdan-dong', 'dangha-dong', 'wondang-dong', 'majeon-dong', 'bullo-daegok-dong', 'oryu-wanggil-dong', 'ara-dong'],
    related: [['청라·루원시티 생활권', '/incheon/cheongna-lu1/'], ['검단신도시 생활권', '/incheon/geomdan-newtown/'], ['검단신도시 이용', '/use/geomdan-newtown/'], ['인천권 전체', '/incheon/']],
    faq: [
      { q: '인천 서구는 어떤 지역인가요?', a: '청라국제도시·검단신도시 대규모 신도시와 가정·석남·가좌 원도심·산업 배후가 함께 있는 인천 최대 면적의 구입니다.' },
      { q: '신도시와 원도심 이용이 다른가요?', a: '청라·검단 신축 대단지는 방문차량 등록·동 위치 확인이, 가정·석남 원도심은 건물별 공동현관 방식 확인이 중요합니다.' },
    ],
  },
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
