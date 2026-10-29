# 디자인 시스템 기준

상태: 재현 실험용 제안. 원본 Figma의 확정값이나 회사의 공식 DS를 추출한 자료가 아니다.

## 공통 기준의 위치

- 시각 값과 의미: [tokens.json](../src/design-system/tokens.json)
- 정보 배치와 사용 조건: [patterns.md](patterns.md)
- 요금·취소 등 제품 정책: `features/`의 관련 문서

토큰은 색상·간격·모서리 등 시각적 역할을 담는다. 수수료율과 위약금 비율은 토큰에 넣지 않는다. 실제 토큰 값은 JSON 한 곳에서 관리하고 문서에 복사하지 않는다.

## 컴포넌트 계약과 구현 상태

| 역할 | 파일 | 현재 상태 |
|---|---|---|
| 라벨과 총금액 | [AmountSummary](../src/design-system/AmountSummary.tsx) | `AmountSummary@1.0.0` 구현. props `label`·`amount`·`emphasis`(+`description`·`testId`). 사용: 금액 조정·최종 확인·진입 화면 (`screens.tsx`). `critical`은 렌더링 미검증 |
| 변경 전후 단가 | [PriceChangeRow](../src/design-system/PriceChangeRow.tsx) | `PriceChangeRow@1.0.0` 구현. props `label`·`before`·`after`·`unitLabel`(+`delta`·`testId`). 사용: 금액 조정·최종 확인 |
| 인상률 선택 | [SegmentedRow](../src/shared/ui/SegmentedRow.tsx) | 실제 코드 dongdong-client@`429894d` 사본에 `aria-pressed`·그룹 이름·포커스 링·배지만 추가 (`1.1.0-adapted`) |

토큰 경로(구현됨): 화면·컴포넌트 → [token-bridge.ts](../src/design-system/token-bridge.ts)(tokens.json 의미 이름) → [design-tokens.ts](../src/shared/config/design-tokens.ts)(실제 코드 Tailwind 클래스 사본). 검증 근거는 [PA-B-20261029-01](../validation/runs/PA-B-20261029-01/run.md).

### tokens.json 제안값과 실제 코드의 대응

시각 표현은 실제 코드를 우선한다. 실제 코드에 없는 항목만 제안값을 쓴다.

| tokens.json | 제안값 | 실제 코드(design-tokens.ts) | 실제 값 | 사용 |
|---|---|---|---|---|
| color.text.primary | #24262B | colors.textPrimary `text-gray-900` | #111827 | 실제 값 |
| color.text.secondary | #60656F | colors.textSecondary `text-gray-600` | #4B5563 | 실제 값 |
| color.text.accent / action.primary | #0066FF | colors.primary / button.primary | #0066FF | 일치 |
| color.text.critical | #C42A30 | 대응 없음 | — | 제안값(미확인) |
| color.text.onAction | #FFFFFF | button.primary `text-white` | #FFFFFF | 일치 |
| color.surface.default | #FFFFFF | container.content `bg-white` | #FFFFFF | 일치 |
| color.surface.subtle | #F5F7FA | colors.primaryBgLight (가장 가까운 카드 배경) | #F2F7FF | 실제 값, 의미 차이 있음 |
| color.border.default | #E1E4E9 | colors.grayBorder | #E5E7EB | 실제 값 |
| space.related / row / section | 8 / 16 / 24px | layout.formGroup(12)·formGroupXL(24) | — | 8·16은 Tailwind 기본 간격, 24는 formGroupXL |
| space.pageInline | 20px | container.main `px-4 min-[400px]:px-6` | 16px(<400) / 24px | 실제 값 |
| radius.control | 12px | button·segmented `rounded-xl` | 12px | 일치 |
| radius.card | 16px | modal.container `rounded-2xl` (선택 카드는 10px) | 16px | 실제 값 중 선택 |
| (없음) 포커스 링 | — | 대응 없음 | — | #0066FF 링 제안 |

## 기본 UI 기준

- 한국어·KRW, 금액의 의미가 드러나는 라벨을 사용한다.
- 변경 전후는 색상 외에 라벨·순서·취소선 등으로 구분한다.
- 이동과 확정 버튼의 문구를 구분한다.
- 390×844와 360×800 CSS px에서 확인한다. 상세 검토는 필요하면 스크롤한다.
- 하단 버튼이 본문을 덮지 않게 한다. 키보드·포커스·대비는 실제 구현 후 확인한다.
- 보호자·간병인의 역할 차이는 공통 UI를 복사하기보다 명시적인 상태·입력으로 표현한다.

현재 네이티브 앱·실제 개발자 저장소와의 코드 연결은 없다. 프로토타입 코드의 제품 반영 여부는 별도로 기록한다.
