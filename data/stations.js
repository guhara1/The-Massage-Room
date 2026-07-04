'use strict';

/**
 * 역세권·광역교통 페이지 (/station/<slug>/).
 * 출구별·노선별 개별 페이지는 만들지 않는다.
 * 이 페이지들은 본문이 얇으므로 noindex 처리하고, 상위 생활권(area)으로 안내한다.
 */
const stations = [
  // 시흥
  { slug: 'baegot-area', name: '배곧 생활권', line: '서해선·광역버스', area: 'baegot-jeongwang-oido' },
  { slug: 'jeongwang-station', name: '정왕역', line: '수인분당선', area: 'baegot-jeongwang-oido' },
  { slug: 'oido-station', name: '오이도역', line: '수인분당선', area: 'baegot-jeongwang-oido' },
  { slug: 'wolgot-station', name: '월곶역', line: '서해선·수인분당선', area: 'baegot-jeongwang-oido' },
  { slug: 'siheung-cityhall-station', name: '시흥시청역', line: '서해선', area: 'eungye-janghyeon-mokgam' },
  { slug: 'siheung-daeya-station', name: '시흥대야역', line: '서해선', area: 'eungye-janghyeon-mokgam' },
  { slug: 'sincheon-station', name: '신천역', line: '서해선', area: 'eungye-janghyeon-mokgam' },
  { slug: 'neunggok-station', name: '능곡역', line: '서해선', area: 'eungye-janghyeon-mokgam' },
  // 부천
  { slug: 'bucheon-station', name: '부천역', line: '1호선', area: 'bucheon-jungdong-sangdong-songnae' },
  { slug: 'songnae-station', name: '송내역', line: '1호선', area: 'bucheon-jungdong-sangdong-songnae' },
  { slug: 'jungdong-station', name: '중동역', line: '1호선', area: 'bucheon-jungdong-sangdong-songnae' },
  { slug: 'sangdong-station', name: '상동역', line: '7호선', area: 'bucheon-jungdong-sangdong-songnae' },
  { slug: 'sinjungdong-station', name: '신중동역', line: '7호선', area: 'bucheon-jungdong-sangdong-songnae' },
  { slug: 'bucheon-cityhall-station', name: '부천시청역', line: '7호선', area: 'bucheon-jungdong-sangdong-songnae' },
  { slug: 'chunui-station', name: '춘의역', line: '7호선', area: 'bucheon-jungdong-sangdong-songnae' },
  { slug: 'yeokgok-station', name: '역곡역', line: '1호선', area: 'yeokgok-sosa-okgil' },
  { slug: 'sosa-station', name: '소사역', line: '1호선·서해선', area: 'yeokgok-sosa-okgil' },
  { slug: 'wonjong-station', name: '원종역', line: '서해선', area: 'wonjong-gogang-ojeong' },
  // 인천
  { slug: 'songdo-moonlight-festival-park-station', name: '송도달빛축제공원역', line: '인천1호선', area: 'songdo-yeonsu-nonhyeon' },
  { slug: 'incheon-national-univ-station', name: '인천대입구역', line: '인천1호선', area: 'songdo-yeonsu-nonhyeon' },
  { slug: 'central-park-station', name: '센트럴파크역', line: '인천1호선', area: 'songdo-yeonsu-nonhyeon' },
  { slug: 'dongchun-station', name: '동춘역', line: '인천1호선', area: 'songdo-yeonsu-nonhyeon' },
  { slug: 'woninjae-station', name: '원인재역', line: '인천1호선·수인분당선', area: 'songdo-yeonsu-nonhyeon' },
  { slug: 'incheon-nonhyeon-station', name: '인천논현역', line: '수인분당선', area: 'songdo-yeonsu-nonhyeon' },
  { slug: 'soraepogu-station', name: '소래포구역', line: '수인분당선', area: 'songdo-yeonsu-nonhyeon' },
  { slug: 'incheon-cityhall-station', name: '인천시청역', line: '인천1·2호선', area: 'guwol-namdong-bupyeong' },
  { slug: 'bupyeong-station', name: '부평역', line: '1호선·인천1호선', area: 'guwol-namdong-bupyeong' },
  { slug: 'bupyeong-gu-office-station', name: '부평구청역', line: '7호선·인천1호선', area: 'guwol-namdong-bupyeong' },
  { slug: 'gyesan-station', name: '계산역', line: '인천1호선', area: 'cheongna-seohae-geomdan' },
  { slug: 'jakjeon-station', name: '작전역', line: '인천1호선', area: 'cheongna-seohae-geomdan' },
  { slug: 'cheongna-international-city-station', name: '청라국제도시역', line: '공항철도', area: 'cheongna-seohae-geomdan' },
  { slug: 'unseo-station', name: '운서역', line: '공항철도', area: 'yeongjong-airport-jemulpo' },
  { slug: 'incheon-airport-terminal1-station', name: '인천공항1터미널역', line: '공항철도', area: 'yeongjong-airport-jemulpo' },
  { slug: 'dongincheon-station', name: '동인천역', line: '1호선', area: 'yeongjong-airport-jemulpo' },
  { slug: 'jemulpo-station', name: '제물포역', line: '1호선', area: 'yeongjong-airport-jemulpo' },
  { slug: 'juan-station', name: '주안역', line: '1호선·인천2호선', area: 'yeongjong-airport-jemulpo' },
];

module.exports = { stations };
