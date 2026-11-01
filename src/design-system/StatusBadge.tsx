/**
 * 금액 관련 상태 표시 (예: ‘위약금 발생’, ‘위약금 없음’). 의미는 label로 전달하고
 * 색·테두리는 보조한다 (P05). 상태 판단은 기능의 계산 결과를 받아서 한다.
 */
import { designTokens, cn } from '@/shared/config/design-tokens';
import { semantic } from '@/design-system/token-bridge';

export const STATUS_BADGE_VERSION = 'StatusBadge@1.0.0';

export type StatusBadgeProps = {
    label: string;
    tone: 'negative' | 'neutral' | 'accent';
    testId?: string;
};

const toneClass = {
    negative: cn(semantic.status.negativeText, semantic.status.negativeBorder),
    neutral: cn(semantic.status.neutralText, semantic.status.neutralBorder),
    accent: cn(semantic.text.accent, designTokens.colors.primaryBorder),
} as const;

export function StatusBadge({ label, tone, testId }: StatusBadgeProps) {
    return (
        <span
            data-component="StatusBadge"
            data-tone={tone}
            data-testid={testId}
            className={cn('inline-flex items-center rounded-lg border bg-white px-2 py-1 text-sm font-semibold', toneClass[tone])}
        >
            {label}
        </span>
    );
}
