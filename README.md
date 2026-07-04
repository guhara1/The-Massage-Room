# 간다GO · 시흥·부천·인천 출장마사지 지역 안내

서부 수도권(시흥·부천·인천) 방문형 웰니스 서비스의 **예약·상담을 안내하는 지역 안내 사이트**입니다.
의존성 없는 Node.js 정적 사이트 생성기로 148개 페이지를 생성합니다.

## 빌드 / 미리보기

```bash
node scripts/build.js      # dist/ 에 전체 사이트 생성
npm run serve              # 빌드 후 http://localhost:8099 로 미리보기
```

- 진입 경로: `/incheon-bucheon-siheung/`
- 루트(`/`)는 진입 경로로 리다이렉트됩니다.

## 구조

```
src/
  config.js      사이트 전역 설정 (상호·전화·텔레그램·도메인)
  styles.css     프리미엄 다크 팔레트 디자인 토큰 + 컴포넌트 오버레이 (Pretendard)
  app.js         모바일 메뉴 토글
data/
  nav.js         상단/모바일 네비게이션
  areas.js       9대 광역 생활권 (핵심 index 콘텐츠)
  programs.js    마사지 프로그램 9종 + 메인
  places.js      이용 장소 11 + 공항·항만·산단 10
  checks.js      예약 전 확인 14
  regions.js     권역 메인 3 + 부천 3구 + 인천 구·군 + life 세부 생활권
  stations.js    역세권 36 (noindex, 생활권으로 canonical)
  policies.js    운영 기준 6 + 작성자·개인정보·불법안내
scripts/
  build.js       생성기 (레이아웃·스키마·사이트맵·robots)
```

## 구현된 요구사항

- **푸터 오렌지 문의 버튼** — `웹사이트 제작문의` / `제휴문의` (텔레그램 링크)
- **모바일 플로팅 전화 버튼** — 우측 하단 오렌지 아이콘, 애니메이션(흔들림+펄스), 터치 시 전화 연결(`tel:`), **전 페이지 노출**
- **상호/전화** — 간다GO / 0508-202-4719 (모든 페이지 헤더·푸터·스키마)
- **메타 디스크립션 80자 이내** — 전 페이지 자동 보장
- **구조화 데이터(스키마)** — WebPage · BreadcrumbList · Organization · WebSite · FAQPage · ImageObject
  - 실제 매장/후기가 없으므로 **LocalBusiness · Review · AggregateRating 미사용**
- **내부링크 강화** — 지역↔프로그램↔이용장소↔확인 롱테일 연결
- **noindex/canonical 규칙** — 얇은 역세권·행정동·기존 행정구역명 페이지 정리
- **선호 이미지 지정** — schema `ImageObject` + `og:image` 동시 지정

## 배포 전 교체해야 할 값 (`src/config.js`)

| 값 | 현재 | 설명 |
|----|------|------|
| `baseUrl` | `https://the-massage-room.example` | 실제 배포 도메인 (canonical·OG·sitemap) |
| `telegram.website` / `telegram.partner` / `telegram.reserve` | `https://t.me/gandago` | 실제 텔레그램 링크 |

값 교체 후 `node scripts/build.js` 를 다시 실행하세요.

## 정책 원칙

이 사이트는 검색 순위 조작이 아닌 이용 안내를 목적으로 하며,
지역명·프로그램명만 바꾼 중복 문장, 가짜 후기·허위 평점, 불법·선정적 표현을 사용하지 않습니다.
