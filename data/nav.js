'use strict';

// 사이트 루트에서 바로 서빙(메인 = /). 하위 경로 접두어 없음.
const BASE = '';

/** 상단 PC 메뉴 */
const primaryNav = [
  { label: '홈', href: BASE + '/' },
  { label: '시흥권', href: BASE + '/siheung/' },
  { label: '부천권', href: BASE + '/bucheon/' },
  { label: '인천권', href: BASE + '/incheon/' },
  { label: '생활권', href: BASE + '/#areas' },
  { label: '프로그램', href: BASE + '/program/' },
  { label: '이용 장소', href: BASE + '/use/home/' },
  { label: '예약 전 확인', href: BASE + '/check/customer-notice/' },
  { label: '문의하기', href: BASE + '/contact/' },
];

/** 모바일 드로어(그룹형) */
const mobileNav = [
  { grp: '지역', items: [
    { label: '시흥권', href: BASE + '/siheung/' },
    { label: '부천권', href: BASE + '/bucheon/' },
    { label: '인천권', href: BASE + '/incheon/' },
    { label: '9대 생활권', href: BASE + '/#areas' },
  ]},
  { grp: '서비스', items: [
    { label: '마사지 프로그램', href: BASE + '/program/' },
    { label: '이용 장소', href: BASE + '/use/home/' },
    { label: '예약 전 확인', href: BASE + '/check/customer-notice/' },
  ]},
  { grp: '안내', items: [
    { label: '운영 기준', href: BASE + '/policy/operation/' },
    { label: '개인정보 처리방침', href: BASE + '/policy/privacy/' },
    { label: '문의하기', href: BASE + '/contact/' },
    { label: '사이트맵', href: BASE + '/sitemap-page/' },
  ]},
];

module.exports = { BASE, primaryNav, mobileNav };
