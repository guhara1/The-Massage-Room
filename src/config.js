'use strict';

/**
 * 사이트 전역 설정.
 *
 * TODO(배포 전 교체): 아래 placeholder 값을 실제 값으로 바꾸세요.
 *   - baseUrl        : 실제 배포 도메인 (canonical/OG/사이트맵에 사용)
 *   - telegram.*     : 실제 텔레그램 채널/계정 링크
 */
const SITE = {
  brand: '간다GO',
  brandEn: 'GandaGo',
  tagline: '시흥·부천·인천 출장마사지 · 서부 수도권 생활권 안내',

  // 실제 배포 도메인으로 교체하세요.
  baseUrl: 'https://the-massage-room.example',

  // 전화 예약
  phone: '0508-202-4719',
  get phoneHref() {
    return 'tel:' + this.phone.replace(/[^0-9]/g, '');
  },

  // 텔레그램 (실제 계정으로 교체하세요)
  telegram: {
    website: 'https://t.me/gandago',   // 웹사이트 제작문의
    partner: 'https://t.me/gandago',   // 제휴문의
    reserve: 'https://t.me/gandago',   // 예약/문의
  },

  // 대표 이미지 (OG / schema ImageObject) — 실제 이미지로 교체
  ogImage: '/assets/og-cover.svg',

  // 문의/운영
  hoursNote: '예약·상담은 전화 및 텔레그램으로 안내합니다.',
};

module.exports = { SITE };
