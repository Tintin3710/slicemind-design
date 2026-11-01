# 실행 기록 — PA-B-20261029-01 간병비 조정

상태: 브라우저 자동 검증 S01~S09 통과(수정 후 재검증). 실제 사용자 테스트·실기기 WebView 검증은 미실행.

## 실행 조건

| 항목 | 기록 |
|---|---|
| 실행 ID / 일시 | PA-B-20261029-01 / 2026-10-29 |
| 조건 | B 규칙 포함 (기능 명세 + 공통 패턴 + 디자인 기준 + 토큰 + 실제 코드 2개). A 조건 비교는 미실행 |
| 모델·버전·도구 | Claude Opus 5.5 (`claude-opus-5-5`), Claude Code 데스크톱 앱. Next.js 15.5.4, React 19.1.1, Tailwind 3.4.17, playwright-core 1.55.1 + Google Chrome 156.0.8078.73(headless) |
| 코드 버전·커밋 | 기준 `928d97d`. 이번 변경은 미커밋 작업본 |
| 실제 전달한 파일과 버전 | `CLAUDE.md`, `docs/features/price-adjustment.md`(sha256 `0174f41baa4a…`), `docs/patterns.md`(`cfde74c6eb09…`), `fixtures/care-price.json`(`c0769019b768…`), `docs/design-system.md`, `src/design-system/tokens.json`(`d5c024c5cff7…`)·`AmountSummary.tsx`·`PriceChangeRow.tsx`(props 초안) — 모두 커밋 `928d97d` 기준 |
| 실제 코드 참조 | `Z21-ZeroToOne/dongdong-client@429894db39871cbc780a9b81f9f57337e38e3728`의 `src/shared/config/design-tokens.ts`, `src/shared/ui/SegmentedRow.tsx` — gh로 읽기 전용 확인 완료. 원본 저장소 미수정 |
| AI가 읽었다고 기록한 파일 | 위 파일 + `validation/price-adjustment.md`, `validation/run-template.md`, `README.md`, `.gitignore`. 다른 기능 문서(매칭·취소)·`docs/product.md`는 읽지 않음 |
| 참조 이미지와 버전 | 없음. 매칭 실패 안내 이미지는 단순 SVG로 새로 그림 |
| 뷰포트·브라우저 | 390×844, 360×800 CSS px, DPR 2, 텍스트 200%(루트 font-size 200%로 모사) |
| 최초 요청 원문·추가 지시 | 사용자 채팅 요청(간병비 조정 프로토타입 생성·검수). 추가 지시 없음 |
| 최초 생성물 보존 경로 | `initial/source/`(코드 스냅샷), `initial/MANIFEST.txt`, `initial/SHA256SUMS.txt`, `initial/screens/`(캡처 23장 + `e2e-result.json`) |

## 시나리오 결과

확인 방식: **자동** = `scripts/e2e-price-adjustment.ts`(Chrome headless 실제 클릭·키보드 조작), **캡처 검토** = AI가 캡처 이미지를 직접 확인, **코드 검토** = import·호출 검색. 사용자 테스트는 없음.

| ID | 확인 방식 | 기대 결과 | 실제 결과 | 상태 | 증거 |
|---|---|---|---|---|---|
| S01 | 자동 + 캡처 검토 | 실패 원인·다음 경로, 조정 CTA는 확인 단계로 이동 | 실패 문구·‘금액 조정하기’ 노출, 조정 CTA ‘변경 금액 확인하기’, 조정 화면에 ‘재신청’ 버튼 없음, 확인 화면 이동만으로 완료되지 않음 (8/8) | 통과 | `after/screens/390-01-failed.png`, `390-02-adjust-default.png`, `390-03-review-5.png` |
| S02 | 자동 + 캡처 검토 | 5/10/15% 단가·총금액, 초기화 → 5%, 원래 단가 기준 | 94,500/113,400/3,314,820 · 99,000/118,800/3,471,240 · 103,500/124,200/3,627,660 일치, 증가액 일치, 반복 선택 시 누적 없음, 초기화 → +5%, 추천 표시 유지, 시각 선택 상태 일치 (24/24) | 통과 (수정 후) | `390-04-adjust-10.png`, `390-05-adjust-15.png`, `after/verify-calc.txt` |
| S03 | 자동 + 캡처 검토 | 상세 2,079,000 / 907,200 / 30,000 / 298,620 / 3,314,820 | 모두 일치, 상세 합 = 총금액, 간병비 합계 2,986,200, 조정 화면에는 보험료·수수료 없음 (12/12) | 통과 | `390-06-review-5-detail.png` |
| S04 | 자동 | 확정 버튼 3,471,240원, 완료 금액 동일, 중복 클릭 무효 | 버튼 ‘3,471,240원으로 재신청하기’, 3회 연속 click 후 완료 금액·신청 금액 3,471,240원(중복 적용 없음), 버튼 비활성화 (7/7) | 통과 | `390-07-review-10.png`, `390-08-completed.png`, `390-09-entry-after-complete.png` |
| S05 | 자동 | +15% 유지, 뒤로만으로 금액 불변 | 뒤로 → +15%·3,627,660 유지, 재검토 동일, 매칭 실패까지 돌아갔다 와도 유지, 완료되지 않음 (7/7) | 통과 | `e2e-result.json` |
| S06 | 자동 | 닫으면 3,158,400 유지, 새 세션 +5% | 조정·확인 화면 X, 실패 화면 하단 ‘닫기’ 모두 진입 전 화면으로, 신청 금액 3,158,400 유지, 재진입 +5% (5/5) | 통과 | `e2e-result.json` |
| S07 | 자동 + 캡처 검토 | 인상률 입력 식별, 잘림 없음, 하단 버튼이 본문을 가리지 않음 | 두 뷰포트 × 기본/텍스트 200%에서 가로 넘침·잘림·짧은 버튼 줄바꿈 없음, 본문과 하단 버튼 겹침 없음, 스크롤 끝 상세가 버튼 위에 표시, 기본 크기에서 선택 UI 첫 화면 노출 (22/22) | 통과 (수정 후) | `360-*.png`, `390-*.png`, `*-text200-*.png` |
| S08 | 자동 + 캡처 검토 | 포커스 식별, 키보드로 모든 주요 동작, 선택 상태·버튼 이름 | Tab/Enter/Space로 실패→조정→+10% 선택→확인→뒤로→확인→확정 완료. 포커스 링 표시, `aria-pressed`, 그룹 이름 ‘인상률 선택’, 완료 안내 `role=status` (17/17) | 통과 | `390-10-keyboard-focus-confirm.png` |
| S09 | 코드 검토 + 렌더링(`data-component`) | 실제 공통 컴포넌트 사용 위치와 토큰 연결 | 아래 ‘규칙의 실제 적용 근거’ 참조. 수정 전에는 화면·컴포넌트에 직접 쓴 색상값 7곳이 있었고 수정 후 토큰 경로로 이동 | 통과 (수정 후) | 아래 표 |

콘솔 오류: 수정 전 1건(favicon 404) → 수정 후 0건.

## 규칙의 실제 적용 근거

| 규칙 ID | 적용·누락 | 실제 코드·화면 위치 | 해석과 한계 |
|---|---|---|---|
| P01 | 적용 | `screens.tsx` `AdjustScreen`: 제목·설명 바로 다음 `rate-selector` → 금액 카드 순서. 자동 검사: 선택 UI가 금액보다 위, 기본 글자 크기에서 첫 화면 노출 | 텍스트 200%에서도 선택 UI는 첫 화면에 보이지만 단가 카드는 스크롤해야 보임(P02 한계 참고) |
| P02 | 적용 | `AdjustScreen`의 `PriceChangeRow` ×2(변경 전 취소선 → 변경 후, 증가액) + `AmountSummary` ‘예상 결제 금액’과 변경 전 대비 증가액. `390-04-adjust-10.png` | 평일 +9,000 / 주말 +10,800처럼 증가액을 따로 표시. 텍스트 200%에서는 선택 UI와 금액이 한 화면에 함께 보이지 않음 |
| P03 | 적용 | `ReviewScreen` ‘결제 상세’ `<dl>`: 일수별 비용·간병비 합계·보험료·플랫폼 수수료. 조정 화면에는 보험료·수수료 문구 없음(자동 검사) | 수정 전에는 ‘간병비 합계의 10%’라는 설명이 있었지만 합계 행이 없었음(E2) |
| P04 | 적용 | 조정 CTA ‘변경 금액 확인하기’, 확정 CTA `{formatKRW(price.total)}원으로 재신청하기` | 문구는 자동 검사로 확인. 사용자가 구분하는지는 미검증 |
| P05 | 적용 | `AmountSummary`: `label` 필수, 금액과 같은 줄에 라벨 표시, 상세 카드와 별도 카드. `aria-label`에 라벨+금액 | 색(accent) 외에 라벨로 의미 전달. `critical` 변형은 이번 흐름에서 사용하지 않아 렌더링 미검증 |
| P06 | 적용 | `src/features/price-adjustment/calculate.ts` `calculateCarePrice` 단일 함수. `PriceAdjustmentFlow.tsx:13`에서 한 번 계산한 `price`를 조정·확인·버튼에 전달하고, 확정은 `flow-state.ts`에서 같은 함수 사용. 화면·컴포넌트에서 금액 산술 없음(grep) | fixture `expected` 4개 비율 × 11개 필드 일치(`verify-calc.txt`) |
| P07 | 적용 | `flow-state.ts`: `BACK`은 `draft` 유지, `CLOSE`는 `draft` 폐기·`application` 유지, `CONFIRM`만 `application` 변경, `completed`가 있으면 재확정 차단 | 브라우저(Android WebView) 하드웨어 뒤로 가기·history 연동은 구현하지 않음 → 미실행 |
| 토큰 연결 | 적용 (수정 후) | 화면·공통 컴포넌트 → `src/design-system/token-bridge.ts`(tokens.json 의미 이름) → `src/shared/config/design-tokens.ts`(실제 코드 클래스). 화면·컴포넌트 안의 직접 색상값은 0곳이고, 원본 SegmentedRow의 구분선 1곳만 원본 그대로 둠 | tokens.json 값을 빌드에서 직접 읽지는 않음. 대응은 주석과 `docs/design-system.md` 표로 관리함 |
| 컴포넌트 재사용 | 적용 | `PriceChangeRow`: `screens.tsx` 145–146(조정)·217–218(확인). `AmountSummary`: 148(조정)·220(확인)·37(진입 화면). `SegmentedRow`: 133(조정). 렌더링 DOM에 `data-component` 표시 | 같은 import를 두 화면에서 호출함을 확인 |

## 오류와 수정

| 오류 ID | 재현 조건·실제 결과 | 연결 규칙 | 변경 내용·코드 위치 | 재검증 결과·증거 |
|---|---|---|---|---|
| E1 | 모든 화면 로드 시 콘솔 `404 /favicon.ico` | S01~S08 공통(콘솔 오류) | `src/app/icon.svg` 추가 | 콘솔 오류 0 |
| E2 | 확인 화면 설명이 ‘간병비 합계의 10%’인데 합계 행이 없어 수수료 근거를 확인할 수 없음 (`initial/screens/390-06-review-5-detail.png`) | P03 | `screens.tsx` `ReviewScreen`에 ‘간병비 합계’ 행과 구분선 추가 | S03 ‘간병비 합계 2,986,200’ 통과, `after/screens/360-review-bottom.png` |
| E3 | 360 × 텍스트 200%에서 ‘초기화’가 ‘초기/화’ 두 줄로 줄바꿈 (`initial/screens/360-text200-adjust.png`) | S07 | ‘초기화’ 버튼 `shrink-0 whitespace-nowrap`, 행 `gap-3` | 짧은 버튼 줄바꿈 검사 추가 후 통과, `after/screens/360-text200-adjust.png` |
| E4 | 포커스 링·추천 배지·안내 이미지에 `#0066FF` 등 7곳이 토큰을 거치지 않고 직접 들어감 (코드 검토) | 토큰 연결 / S09 | `token-bridge.ts`에 `action.focusRing`, `badge.recommended`, `illustration.*` 추가 후 `SegmentedRow`·`ScreenLayout`·`screens.tsx`에서 참조 | grep 결과 원본 유지 1곳 외 0곳, 전체 재검증 통과 |
| V1 | 검증 도구 오류: `sr-only`(보조기기 전용, 시각적으로 숨김) 텍스트를 ‘잘림’으로 오탐 | S07 | `layoutIssues`에서 `.sr-only` 제외. 보이는 요소의 잘림 기준은 그대로 둠 | — |
| V2 | 검증 도구 오류: 원본 SegmentedRow의 `transition-all duration-200` 도중 캡처해 이전 선택이 강조된 것처럼 찍힘(`initial/screens/390-04-adjust-10.png`). 300ms 후 DOM 확인 결과 실제 선택 상태는 정상 | S02·P01 | 선택 후 300ms 대기, 계산된 배경색으로 시각 선택 상태 검사를 **추가** | S02 ‘시각 선택 상태 일치’ 통과 |

기준 완화 없음. V1·V2는 측정 도구 수정이고, 짧은 버튼 줄바꿈과 시각 선택 상태 검사는 오히려 추가했다. 새 검사를 수정 전 코드에 다시 실행하지는 않았다(미실행).

## 이번 실행으로 설명할 수 있는 범위

- 확인한 것: 명세의 흐름·문구·계산이 fixture와 일치한다. 공통 컴포넌트·토큰·단일 계산 경로를 실제 코드에서 참조한다. 두 뷰포트·텍스트 200%·키보드 조작에서 자동 검사 기준을 통과했다.
- 확인하지 못한 것(미실행): 실제 React Native WebView·iOS/Android 실기기, 하드웨어 뒤로 가기와 history 연동, 스크린리더(VoiceOver·TalkBack) 실제 낭독, 색 대비 수치 측정, OS 글꼴 크기 설정(루트 font-size로만 모사), A 조건 비교, 실제 사용자 테스트.
- 실제 사용자 참여 여부: 미실행
- A·B 차이를 설명할 때 함께 고려할 조건: 이번 B 실행은 실제 코드 2개를 추가로 받았다. 별도 깨끗한 세션이 아니라 저장소 clone 직후 같은 대화에서 진행했다.
- 다음에 수정할 문서·규칙: 아래 ‘후속 실험용 기준 버전’과 관찰 사항

### 관찰 사항 (수정하지 않음)

- 원본 SegmentedRow의 `!isLast && border-r-[#0066FF]` 때문에 선택되지 않은 항목 사이에도 파란 구분선이 보인다(`390-02-adjust-default.png`의 +10%/+15% 사이). 실제 코드 표현을 우선해 유지했다. 실제 코드 쪽 검토가 필요하다.
- 원본 SegmentedRow에는 `type="button"`, `aria-pressed`, 그룹 이름, 포커스 링, 배지가 없어 인상률 선택에 그대로 쓰기에는 부족했다. 시각 클래스는 유지하고 이 항목만 추가한 사본을 `src/shared/ui/SegmentedRow.tsx`에 두었다.
- 실제 `header.topnav`는 높이 100px(상태 표시줄 포함 가정)이라 844px 화면 상단을 많이 차지한다. WebView 안에서 네이티브 헤더와 겹치는지는 미확인이다.

## 후속 실험용 기준 버전 (환불 화면 실험에서 같은 기준 사용)

| 구분 | 이름·버전 | 파일 | sha256 앞 12자리 |
|---|---|---|---|
| 패턴 규칙 | P-AMOUNT-01 (P01~P07), 커밋 `928d97d` | `docs/patterns.md` | `cfde74c6eb09` |
| 기능 명세 | 간병비 조정 R01~R06·A01~A07, 커밋 `928d97d` | `docs/features/price-adjustment.md` | `0174f41baa4a` |
| fixture | `care-price-demo-v1` | `fixtures/care-price.json` | `c0769019b768` |
| 실험 토큰(제안값) | tokens.json, 커밋 `928d97d` | `src/design-system/tokens.json` | `d5c024c5cff7` |
| 실제 코드 토큰 사본 | dongdong-client@`429894d` 부분 사본 | `src/shared/config/design-tokens.ts` | `3a65dcc93d8a` |
| 토큰 대응 | `token-bridge@1.1.0` | `src/design-system/token-bridge.ts` | `1927118babc0` |
| 컴포넌트 | `AmountSummary@1.0.0` | `src/design-system/AmountSummary.tsx` | `f65f18432c72` |
| 컴포넌트 | `PriceChangeRow@1.0.0` | `src/design-system/PriceChangeRow.tsx` | `34ac7d7d14bf` |
| 컴포넌트 | `SegmentedRow@1.1.0-adapted` (원본 dongdong-client@`429894d`) | `src/shared/ui/SegmentedRow.tsx` | `3f95656df637` |
| 계산 | `calculate@1.0.0` | `src/features/price-adjustment/calculate.ts` | `93846352e8cc` |
| 검증 스크립트 | e2e S01~S08 | `scripts/e2e-price-adjustment.ts` | 이 실행 기준 |

환불에 적용할 때 주의할 점(patterns.md ‘다른 흐름에 적용할 때’): `AmountSummary`의 `emphasis="critical"`과 `text.critical`은 실제 코드에 대응 값이 없는 제안값이고 렌더링도 검증하지 않았다. 환불 예정액·위약금은 라벨로 의미를 구분해야 한다.
