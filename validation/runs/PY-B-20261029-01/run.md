# 실행 기록 — PY-B-20261029-01 결제 정보·비용 상세

상태: `/payment` 화면 구현. 타입 검사와 브라우저 조작 검증 34/34 통과(수정 후). 사용자 테스트·디자이너 검토는 미실행.

## 기준

| 항목 | 기록 |
|---|---|
| 기준 커밋 | `4583043` (브랜치 `feat/price-adjustment-prototype`). 이번 변경은 미커밋 |
| 명세·패턴 | `docs/features/payment.md`, P-AMOUNT-01 v2.1 |
| 데이터 | `fixtures/care-price.json` 인상 전(0%). 신청 정보는 가상 데모 값(`src/screens/guardian/payment/demo-request.ts`) |
| 원본 이미지 | 없음 |
| 공통 파일 변경 | 없음(`src/design-system`, `src/shared`, `src/features`, `globals.css`, `docs/patterns.md` diff 비어 있음) → 간병비·환불 전체 검증은 다시 실행하지 않음(미실행) |
| 최초 결과 보존 | `initial/source/`(최초 코드), `initial/SHA256SUMS.txt`, `initial/e2e-result.json`(캡처 없음) |

## 실제 재사용한 코드 경로

import와 호출을 코드에서 확인한 것만 적는다.

| 재사용 | 경로 | 사용 위치 |
|---|---|---|
| 최종 금액 컴포넌트 | `src/design-system/AmountSummary.tsx` | 바텀시트 ‘결제 예정 금액’ |
| 원화 표시 | `src/shared/lib/format-krw.ts` | 하단 금액, 상세 항목 |
| 토큰 | `src/design-system/token-bridge.ts`(`semantic.*`), `src/shared/config/design-tokens.ts`(typography, `button.primary`) | 화면 전체 |
| 계산 | `src/features/price-adjustment/calculate.ts` `calculateCarePrice(0)` — 모듈에서 1회 호출, 하단과 상세가 같은 결과 사용 | 하단·상세·일정 일수 |
| 레이아웃 | `src/screens/guardian/price-adjustment/ScreenLayout.tsx` (헤더, 스크롤 본문, 하단 고정) | 화면 틀 |

재사용이 아닌 것:
- `DetailLine`: 간병비 화면의 것을 import한 것이 아니라 같은 정렬·글자 스타일로 화면 안에 다시 작성했다. 원본이 export되지 않는다.
- 하단 금액 줄: `AmountSummary`의 글자 기준(라벨 15px semibold, 금액 20px bold accent)만 따랐다. 카드 모양은 쓰지 않았다.
- 바텀시트: 화면 안에서 새로 구현했다(공통 컴포넌트 없음, 새 라이브러리 없음).

## 적용한 패턴

| 규칙 | 적용 |
|---|---|
| P01·P02 | 선택이 없는 화면. 본문은 신청 정보(환자 → 유형·중증도 → 일정), 하단은 최종 금액. 계산 근거는 펼치기로 연다 |
| P03 | 바텀시트: 단가 → 일수별 비용 → 간병비 합계 → 보험료 → 수수료 → 결제 예정 금액 |
| P04 | 펼치기(상세 보기)와 ‘결제하기’(최종 행동)를 구분. ‘결제하기’는 동작 없음(범위 밖) |
| P05 | ‘결제 예정 금액’ 라벨 + accent |
| P06 | `calculateCarePrice(0)` 단일 결과 |
| P07 | 시트 열기·닫기로 정보·금액·스크롤이 바뀌지 않음(검증) |
| 시각적 구성 | `AmountSummary`, `DetailLine` 정렬, `semantic.space`. `StatusBadge`는 표시할 상태가 없어 미사용 |

## 검증 결과 (`scripts/e2e-payment.ts`, 390×844)

| 확인 | 결과 |
|---|---|
| 타입 검사 | 통과 |
| 코드 | 재사용 import 5건, `calculateCarePrice(0)` 호출 1회, 직접 색상값·금액 산술 없음 |
| 기본 화면 | 본문 순서, 일정 22일·8일, 하단 ‘결제 예정 금액’ 3,158,400원, ‘결제하기’, 하단이 본문을 가리지 않고 화면 하단에 고정 |
| 바텀시트 | 열림(`role=dialog`), `aria-expanded` 전환, 열 때 닫기 버튼·닫을 때 펼치기 버튼으로 포커스 이동. 항목 90,000 / 108,000 / 1,980,000 / 864,000 / 2,844,000 / 30,000 / 284,400원, 총액 3,158,400원, 항목 합 = 총액, 끝까지 스크롤해도 총액이 가려지지 않음 |
| 유지 | 열기 → 닫기 → 다시 열기 → 배경 눌러 닫기 → Escape 닫기 뒤에도 정보·금액 동일. 스크롤 위치 유지는 390×600에서 확인(scrollTop 120 유지) |
| 콘솔 | 오류 0 |
| 캡처 | `screens/390-payment-closed.png`, `screens/390-payment-sheet-open.png` |

## 수정과 이유

| ID | 최초 결과 | 수정 | 재검증 |
|---|---|---|---|
| V1 | 검증 도구가 파일 주석 속 함수 이름까지 세서 `calculateCarePrice(0)`를 2회 호출로 판정 | 주석을 제외하고 검사 | 1회, 통과 |
| V2 | 390×844에서는 본문이 한 화면에 들어와 스크롤이 생기지 않음. 그래서 스크롤 유지 검사가 비어 있었음(scrollTop 0) | 본문이 스크롤되는 390×600에서 스크롤 유지 검사를 추가. 844 검사는 그대로 둠 | 통과 |
| E1 | 바텀시트의 ‘간병비 합계’가 구분선 없이 보험료·수수료와 같은 목록에 있어, 더하는 항목처럼 읽힘 | 간병비 화면 `DetailLine`처럼 합계 앞뒤에 구분선(`divided`) 추가 | 34/34, 열림 캡처 재촬영 |

## 미확인·미실행

- 신청 정보(이름·나이·성별·간병 유형·중증도·날짜)는 가상 데모 값이다. 중증도 등급 체계와 간병 유형 목록은 확인하지 않았다. 2026년 11월 공휴일이 없다는 것은 가정이다.
- ‘결제하기’ 버튼은 눌러도 동작하지 않는다. P04 확정 예시(‘{금액}원으로 ○○하기’)와 문구가 다르다(payment.md에 기록).
- `DetailLine`(3번째 복제)과 `ScreenLayout`(기능 폴더 교차 import)의 공통화 여부는 미결정이다.
- 바텀시트를 드래그로 닫는 동작, 배경 스크롤 잠금의 실기기 동작, 360×800, 텍스트 확대, 스크린리더, 실기기 WebView, 사용자 테스트는 미실행이다.

## 보충 (2026-11-01 추가, 위 원래 기록은 수정하지 않음)

- 최초 결과 `initial/e2e-result.json`은 31/33이다. 실패 2건(V1·V2)은 검증 도구 문제였다. 수정 후 `screens/e2e-result.json`은 34/34다.
- 2026-11-01 기준 화면·스크립트 해시가 실행 직후와 같다(`PaymentInfoScreen.tsx` `fad3b06183ee`, `demo-request.ts` `335f0a1692a8`, `e2e-payment.ts` `8110aa0e307e`). 실행 이후 코드가 바뀌지 않아 다시 검증하지 않았다.
- 이 실행의 코드·기록은 2026-11-01 문서 갱신과 함께 처음 커밋됐다(기준 커밋 `4583043` 이후).
- 남은 한계(`DetailLine` 복제, `ScreenLayout` 교차 import)는 [patterns.md 적용 한계 L03·L04](../../../docs/patterns.md#적용-한계와-후속-개선)에 연결했다. 모두 미해결이다.
