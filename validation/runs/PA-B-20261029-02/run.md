# 실행 기록 — PA-B-20261029-02 공통 기준 보완(환불 재사용 대비)

상태: 공통 패턴 v2·컴포넌트 보완 후 간병비 조정 흐름 회귀 검증 S01~S09 통과. 환불 화면 구현·검증, 실기기 WebView, 보호자 사용자 테스트는 미실행.

## 실행 조건

| 항목 | 기록 |
|---|---|
| 실행 ID / 일시 | PA-B-20261029-02 / 2026-10-29 |
| 조건 | B 규칙 포함. 이전 실행 [PA-B-20261029-01](../PA-B-20261029-01/run.md)의 결과물을 보완 |
| 모델·버전·도구 | Claude Opus 5.5 (`claude-opus-5-5`), Claude Code 데스크톱 앱. Next.js 15.5.4, playwright-core 1.55.1 + Google Chrome 156.0.8078.73(headless) |
| 코드 버전·커밋 | 시작 `7b994a8`(브랜치 `feat/price-adjustment-prototype`). 이번 변경은 실행 시점에 미커밋 |
| 실제 전달·참조 파일 | `CLAUDE.md`, `docs/patterns.md`(v1), `docs/design-system.md`, 관련 코드(`src/design-system/*`, `src/shared/**`, `src/features/price-adjustment/calculate.ts`, `screens.tsx`), `docs/features/price-adjustment.md`·`validation/price-adjustment.md`(문구 정합용) |
| 토큰 정의 확인 | 이 저장소 전체와 `dongdong-client@429894d`의 `src/shared/config/design-tokens.ts`·`theme.ts`·`tailwind.config.js`·`src/app/globals.css`(gh 읽기 전용). `color-semantic-status-negative` 정의를 **찾지 못함**. gh 코드 검색 결과도 없음 |
| 참조 이미지 | 없음 |
| 뷰포트·브라우저 | 390×844, 360×800, 텍스트 200%(기존 S07 그대로) |
| 이전 기준 보존 | `PA-B-20261029-01/` 전체(initial 코드·캡처·당시 기준·after 캡처) 변경 없음(`git diff` 비어 있음) |

## 변경 요약

| 요청 | 변경 | 위치 |
|---|---|---|
| 공통 패턴 일반화 | P-AMOUNT-01 v2. P01·P02는 선택이 있는 화면과 없는 화면(적용 조건·계산 근거·최종 금액)으로 나눔. P03은 포함·차감 항목과 계산 근거, P04는 이동과 확정 구분(‘취소 사유 선택하기’ 예), P05는 라벨 우선·색 보조, P06은 기능별 계산 정책 분리와 공통 UI 비계산, P07은 검토·뒤로 가기 불변 + 검토·요청 접수·처리 완료 구분. 규칙 ID는 늘리지 않음 | `docs/patterns.md` |
| 간병비 전용 조건 유지 | 인상률·평일/주말·재신청 예시를 ‘공통 패턴 적용’ 표로 옮김 | `docs/features/price-adjustment.md` |
| 금액 강조 역할 | accent(환불 예정액 등), negative(위약금 발생·위약금), neutral(‘없음’), default. `critical` 사용 중단 | `patterns.md`, `design-system.md`, `tokens.json`(`$deprecated`), `token-bridge.ts`, `globals.css` |
| 완료 상태 | 확정 전 ‘예상 결제 금액’ → 확정 후 ‘적용 금액’. 버튼 ‘재신청 완료’로 비활성화. 완료 박스에서 금액 줄 제거(중복 해소) | `screens.tsx` `ReviewScreen`, R06, S04 |
| 공통 컴포넌트 독립 | `formatKRW` → `src/shared/lib/format-krw.ts`. `AmountSummary`·`PriceChangeRow`는 `@/features/**` import 없음. `StatusBadge` 추가 | `src/design-system/*`, `src/shared/lib/` |
| 계산 정책 | 변경 없음(`formatKRW` 삭제만). fixture 대조 ALL PASS | `verify-calc.txt` |

## 시나리오 결과

| ID | 확인 방식 | 기대 결과 | 실제 결과 | 상태 | 증거 |
|---|---|---|---|---|---|
| 영향 확인 | 자동(검증 스크립트 수정 전 그대로 새 빌드에 실행) | 의도한 변경 외 회귀 없음 | S04의 2개 항목만 실패: ‘완료 금액 = 확정 버튼 금액’(완료 박스 금액 삭제), ‘완료 후 버튼 금액 유지’(버튼 ‘재신청 완료’로 변경). 둘 다 이번 명세 변경 대상. 나머지 S01~S03·S05~S08 통과 | 확인 | `impact-old-e2e.txt`, `impact-old-e2e-result.json` |
| S01~S03, S05~S08 | 자동 | 기존과 같음 | 기존 검사 그대로 통과 (8/8, 24/24, 12/12, 7/7, 5/5, 22/22, 17/17) | 통과 | `screens/e2e-result.json` |
| S04 | 자동 + 캡처 검토 | 갱신된 S04 | 확정 전 버튼 ‘3,471,240원으로 재신청하기’·라벨 ‘예상 결제 금액’. 확정 후 완료 문구 1회, 라벨 ‘적용 금액’ 3,471,240원, 화면 안 3,471,240원 표기 1곳, 버튼 ‘재신청 완료’ 비활성화, 뒤로 가기 숨김, 레이아웃 이상 없음, 중복 적용 없음 (13/13) | 통과 | 전 `../PA-B-20261029-01/after/screens/390-08-completed.png` → 후 `screens/390-08-completed.png` |
| S09 | 자동 + 코드 검토 | 갱신된 S09 | `src/design-system`·`src/shared`에서 `@/features/` import 0건. 조정·확인 화면이 공통 컴포넌트 import. 강조 역할 렌더링: 환불 예정액 accent `rgb(0,102,255)`, 위약금·‘위약금 발생’ 배지 = CSS 변수 색, ‘없음’ neutral `rgb(17,24,39)`. 모두 라벨과 함께 표시 (7/7) | 통과 | `screens/390-11-amount-roles.png`(`/dev/amount-roles`, 표시 확인용 임의 값) |
| 콘솔 | 자동 | 오류 없음 | 0건 | 통과 | `e2e-result.json` |

### 검증 스크립트 변경(기준 완화 아님)

- S04: 삭제한 항목은 ‘완료 박스 금액’과 ‘완료 후 버튼에 금액 유지’ 2개다. 명세(R06)가 바뀌어 반대 동작이 기대값이 됐다. 대신 6개 항목을 추가했다(라벨 전환 2, 완료 문구 1회, 금액 중복 표시 없음, 버튼 문구, 뒤로 가기 숨김, 완료 화면 레이아웃).
- S09: 지금까지 코드 검토로만 확인하던 항목에 자동 검사 7개를 추가했다.
- `SHOTS` 환경 변수: 캡처 저장만 거르고 검사는 모두 실행한다.

## 규칙 v2와 현재 간병비 화면 대조

| 규칙 | 적용·누락 | 코드·화면 위치 | 해석과 한계 |
|---|---|---|---|
| P01 | 적용(선택 있는 화면) | `AdjustScreen` `rate-selector`가 금액보다 위(S07) | 선택 없는 화면 규칙은 이 흐름에 해당 없음 → 미검증 |
| P02 | 적용 | `PriceChangeRow`×2 + `AmountSummary` | 같음 |
| P03 | 적용 | `ReviewScreen` 결제 상세(포함 항목·근거). 차감 항목은 이 흐름에 없음 | 차감 항목 표현은 환불에서 검증 필요 |
| P04 | 적용 | ‘변경 금액 확인하기’ / ‘{금액}원으로 재신청하기’ | — |
| P05 | 적용 | `AmountSummary` label 필수, 간병비는 accent만 사용 | negative·neutral은 개발용 페이지에서만 렌더링 확인 |
| P06 | 적용 | `calculateCarePrice` 단일 경로, 공통 UI의 기능 import 0건 | 환불 계산 경로는 없음(미실행) |
| P07 | 적용 (이번 수정) | `flow-state.ts`(BACK·CLOSE 불변) + `ReviewScreen` 라벨·버튼 전환, 완료 안내 1회, 안내에 ‘데모·실제 모집 없음’ 명시 | 재신청은 ‘요청 접수’ 단계이며 매칭 완료로 표현하지 않음. 취소 접수와 환불 완료의 구분은 환불 흐름에서 검증 필요 |

## 디자이너 검토 (보호자 사용자 테스트 아님)

| 항목 | 기록 |
|---|---|
| 출처 | 2026-10-29 사용자(디자이너)가 이 작업 요청에서 전달한 피드백 |
| 내용 | 모바일 브라우저에서 직접 확인했고 화면 구성을 수용함 |
| 확인 대상 | 대화 흐름상 `7b994a8` 빌드(http://172.30.1.31:3100). 이번 변경(라벨·버튼 전환) 전 화면이다 |
| 기기·브라우저·버전 | 미기록 |
| 한계 | 설계자 본인의 전문가 검토다. 보호자 사용자 테스트·과업 성공률 근거가 아니다. 이번 변경 후 화면은 디자이너 재확인 미실행 |

## 오류와 수정

| 오류 ID | 재현 조건·실제 결과 | 연결 규칙 | 변경 내용·코드 위치 | 재검증 결과·증거 |
|---|---|---|---|---|
| E5 | 확정 후에도 금액 라벨 ‘예상 결제 금액’, 버튼 ‘3,471,240원으로 재신청하기’(비활성). 완료 박스와 금액 카드에 같은 금액이 두 번 표시됨 (`../PA-B-20261029-01/after/screens/390-08-completed.png`) | P07, R06 | `ReviewScreen`: 라벨·버튼 전환, 완료 박스 금액 줄 삭제 | S04 13/13, `screens/390-08-completed.png` |
| E6 | 공통 `AmountSummary`·`PriceChangeRow`가 `@/features/price-adjustment/calculate`의 `formatKRW`를 import해 간병비 계산 파일에 의존 | P06 | `src/shared/lib/format-krw.ts`로 이동 | S09 ‘기능 import 0건’ |

## 미확인·미실행

- **추가(커밋 후):** 사용자(디자이너)가 `color-semantic-status-negative` = `palette.error.main`(#EF4444)으로 지정했고, 배지 대비 미달(3.76:1)은 예외로 수용했다. 코드상 값은 바뀌지 않아 재검증은 하지 않았다(미실행). 아래 두 항목은 지정 전 기록이다.
- **`color-semantic-status-negative` 값: 미확인.** 정의를 찾지 못했다. 렌더링을 위해 CSS 변수에 임시 후보 `#EF4444`(dongdong-client `theme.ts` `palette.error.main`)를 넣었다. 확인된 대응이 아니며 `globals.css` 한 줄만 바꾸면 교체된다. 이전 제안색 `#C42A30`은 쓰지 않는다.
- 임시 후보 `#EF4444`의 흰 배경 대비는 3.76:1(계산값)이다. 20px bold 금액(큰 글자 기준 3:1)은 충족하지만 14px 배지 글자는 일반 텍스트 기준 4.5:1에 미달한다. 확정 값으로 다시 확인해야 한다.
- 미실행: 환불 화면 구현·검증, 선택이 없는 금액 확인 화면에 P01·P02 적용, 차감 항목 표현, 실기기 WebView, 스크린리더, 보호자 사용자 테스트, 변경 후 화면의 디자이너 재확인.

## 후속 환불 실험용 기준 버전

| 구분 | 이름·버전 | 파일 | sha256 앞 12자리 |
|---|---|---|---|
| 공통 패턴 | P-AMOUNT-01 **v2** (P01~P07 + 금액 강조 역할) | `docs/patterns.md` | `e37e6948df2f` |
| 디자인 기준·토큰 대응표 | 2026-10-29 v2 | `docs/design-system.md` | `21ade9dab6d2` |
| 실험 토큰(제안값) | `color.text.critical` `$deprecated` | `src/design-system/tokens.json` | `33dbdcbf14da` |
| 토큰 대응 | `token-bridge@1.2.0` (`status.negative*`, `status.neutral*`) | `src/design-system/token-bridge.ts` | `fbeb14a241b6` |
| negative 변수 | `--color-semantic-status-negative`(값 미확인, 임시 #EF4444) | `src/app/globals.css` | `c542639178b2` |
| 실제 코드 토큰 사본 | dongdong-client@`429894d` 부분 사본(변경 없음) | `src/shared/config/design-tokens.ts` | `3a65dcc93d8a` |
| 컴포넌트 | `AmountSummary@2.0.0` | `src/design-system/AmountSummary.tsx` | `a2bef72e4e42` |
| 컴포넌트 | `PriceChangeRow@1.1.0` | `src/design-system/PriceChangeRow.tsx` | `d47f5832f00c` |
| 컴포넌트 | `StatusBadge@1.0.0` | `src/design-system/StatusBadge.tsx` | `3e438d16e564` |
| 컴포넌트 | `SegmentedRow@1.1.0-adapted`(변경 없음) | `src/shared/ui/SegmentedRow.tsx` | `3f95656df637` |
| 공통 유틸 | `format-krw@1.0.0` | `src/shared/lib/format-krw.ts` | `99438b3cd233` |
| 간병비 명세 | R06 갱신 + ‘공통 패턴 적용’ | `docs/features/price-adjustment.md` | `167e1042d5bc` |
| 간병비 계산 | `calculate@1.0.0`(정책 변경 없음, `formatKRW` 제거) | `src/features/price-adjustment/calculate.ts` | `840abf438a99` |
| fixture | `care-price-demo-v1`(변경 없음) | `fixtures/care-price.json` | `c0769019b768` |
| 검증 스크립트 | S01~S09 자동 | `scripts/e2e-price-adjustment.ts` | `908ac62f1e3d` |
