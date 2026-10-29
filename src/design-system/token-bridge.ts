/**
 * tokens.json(실험 제안값)의 의미 이름 → 실제 코드(design-tokens.ts) 클래스 대응.
 *
 * 시각 값은 실제 코드를 우선한다. 실제 코드에 대응 항목이 없는 경우만
 * tokens.json 제안값을 쓰고 `proposalOnly`로 표시한다.
 * 대응 근거와 값 차이는 docs/design-system.md 표에 기록한다.
 */
import { designTokens } from '@/shared/config/design-tokens';

export const TOKEN_BRIDGE_VERSION = 'token-bridge@1.1.0';

export const semantic = {
    text: {
        /** tokens.json color.text.primary(#24262B) → 실제 text-gray-900 */
        primary: designTokens.colors.textPrimary,
        /** tokens.json color.text.secondary(#60656F) → 실제 text-gray-600 */
        secondary: designTokens.colors.textSecondary,
        /** tokens.json color.text.accent(#0066FF) → 실제 primary(#0066FF), 값 일치 */
        accent: designTokens.colors.primary,
        /** tokens.json color.text.critical(#C42A30): 실제 코드에 대응 없음 → 제안값 사용 */
        critical: 'text-[#C42A30]',
    },
    border: {
        /** tokens.json color.border.default(#E1E4E9) → 실제 grayBorder(#E5E7EB) */
        default: designTokens.colors.grayBorder,
    },
    surface: {
        /** tokens.json color.surface.subtle(#F5F7FA) → 실제 primaryBgLight(#F2F7FF) 카드 배경 */
        subtle: designTokens.colors.primaryBgLight,
    },
    action: {
        /** tokens.json color.action.primary → 실제 button.primary */
        primary: designTokens.components.button.primary,
        secondary: designTokens.components.button.tertiary,
        /**
         * 키보드 포커스 링. 실제 코드에 포커스 토큰 없음 → 실제 primary 색 값(#0066FF)으로 제안.
         * Tailwind가 스캔할 수 있도록 완성된 클래스 문자열로 둔다.
         */
        focusRing: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066FF]',
    },
    badge: {
        /** 추천 표시. 실제 primaryBg + 흰 글자 조합. 크기는 제안값. */
        recommended: `${designTokens.colors.primaryBg} text-white text-[11px] font-semibold leading-none rounded-full px-1.5 py-0.5`,
    },
    illustration: {
        /** 안내 이미지: 배경 primaryBgLight, 선 primary, 보조 표시 textInactive */
        background: designTokens.colors.primaryBgLight,
        stroke: designTokens.colors.primary,
        muted: designTokens.colors.textInactive,
    },
    space: {
        /** tokens.json space.related 8px → gap-2 */
        related: 'gap-2',
        /** tokens.json space.row 16px → gap-4 / p-4 */
        row: 'gap-4',
        rowPadding: 'p-4',
        /** tokens.json space.section 24px → gap-6 (실제 layout.formGroupXL) */
        section: designTokens.components.layout.formGroupXL,
    },
    radius: {
        /** tokens.json radius.card 16px → rounded-2xl (실제 modal.container와 같은 값) */
        card: 'rounded-2xl',
        /** tokens.json radius.control 12px → rounded-xl (실제 button·segmented와 같은 값) */
        control: 'rounded-xl',
    },
} as const;

export const proposalOnly = ['text.critical', 'action.focusRing', 'badge.recommended(size)'] as const;
