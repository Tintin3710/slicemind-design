# SliceMind — 디자인과 프로토타입 기준

슬라이스마인드의 디자인 판단, 공통 UI 기준, 기능 명세와 검증 기록을 함께 관리하는 개인 작업 저장소입니다.

## 현재 상태

- 2026-10-29: 파일 구조와 간병비 조정 재현 실험의 기준을 준비했습니다.
- 공통 패턴과 토큰은 사후 정리한 실험용 초안입니다. 기존 회사의 공식 DS로 확인된 자료가 아닙니다.
- 매칭·취소 문서는 후속 작업을 위한 골격입니다.
- 2026-10-29: 간병비 조정 프로토타입과 `AmountSummary`·`PriceChangeRow`를 구현했습니다. 배포는 없습니다.
- 브라우저 자동 검증은 [PA-B-20261029-01](validation/runs/PA-B-20261029-01/run.md)에서 통과했습니다. 실기기·사용자 검증은 미실행입니다. 실제 결제·환불·지원자 모집을 수행하지 않습니다.

## 문서 찾기

| 목적 | 기준 파일 |
|---|---|
| 제품 역할과 Care Case | [product](docs/product.md) |
| 공통 UI·토큰·컴포넌트 기준 | [design-system](docs/design-system.md) |
| 반복되는 UX 판단 | [patterns](docs/patterns.md) |
| 지원자 비교·선택 | [matching](docs/features/matching.md) |
| 금액 조정·확인·재신청 | [price-adjustment](docs/features/price-adjustment.md) |
| 취소·위약금·환불 안내 | [cancellation](docs/features/cancellation.md) |
| 간병비 조정 실행 기록 | [validation](validation/price-adjustment.md) |

## 주요 구조

```text
README.md
CLAUDE.md
docs/
  product.md
  design-system.md
  patterns.md
  features/
    matching.md
    price-adjustment.md
    cancellation.md
src/
  design-system/
    tokens.json
    AmountSummary.tsx
    PriceChangeRow.tsx
  screens/
    guardian/
    caregiver/
fixtures/
  care-price.json
validation/
  price-adjustment.md
  cancellation.md
  run-template.md
```

## 작업 방식

공통 규칙은 한 번만 기록하고 기능 문서에서 참조합니다. 개별 예외 케이스는 해당 기능 문서의 표로 모읍니다. AI 작업은 [CLAUDE.md](CLAUDE.md)와 관련 기능 문서부터 시작합니다.

## 실행 (간병비 조정 프로토타입)

Next.js 15 · React 19 · Tailwind 3 모바일 웹. fixture와 로컬 상태만 사용하며 로그인·결제·서버 연동은 없습니다.

```bash
npm install && npm run build && npm start   # http://localhost:3100
npm run verify:calc                          # fixture 기대값 비교
npm run verify:e2e                           # 서버 실행 중, 설치된 Chrome으로 S01~S08
```

실행 기록: [PA-B-20261029-01](validation/runs/PA-B-20261029-01/run.md). 프로토타입 코드는 실제 제품(dongdong-client)에 반영되지 않았습니다.
