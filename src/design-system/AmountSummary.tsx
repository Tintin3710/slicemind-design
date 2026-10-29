/**
 * 라벨이 붙은 최종 금액 (P05). 금액은 계산 결과를 받기만 하고 계산하지 않는다.
 * 의미(예상 결제·환불 예정 등)는 색이 아니라 label로 전달한다.
 */
import { cn } from '@/shared/config/design-tokens';
import { semantic } from '@/design-system/token-bridge';
import { formatKRW } from '@/features/price-adjustment/calculate';

export const AMOUNT_SUMMARY_VERSION = 'AmountSummary@1.0.0';

export type AmountSummaryProps = {
  label: string;
  amount: number; // KRW 정수. 제품 정책의 계산 결과를 전달받습니다.
  emphasis?: 'default' | 'accent' | 'critical';
  /** 보조 설명 (예: 변경 전 대비 증가액). 계산된 문자열을 받는다. */
  description?: string;
  testId?: string;
};

const emphasisClass = {
  default: semantic.text.primary,
  accent: semantic.text.accent,
  critical: semantic.text.critical,
} as const;

export function AmountSummary({ label, amount, emphasis = 'accent', description, testId }: AmountSummaryProps) {
  return (
    <section
      aria-label={`${label} ${formatKRW(amount)}원`}
      data-component="AmountSummary"
      data-testid={testId}
      className={cn('flex flex-col border', semantic.border.default, semantic.radius.card, semantic.space.rowPadding, semantic.space.related)}
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className={cn('text-[15px] font-semibold', semantic.text.primary)}>{label}</span>
        <strong className={cn('text-xl font-bold tabular-nums whitespace-nowrap', emphasisClass[emphasis])} data-amount={amount}>
          {formatKRW(amount)}원
        </strong>
      </div>
      {description && <p className={cn('text-[13px] text-right', semantic.text.secondary)}>{description}</p>}
    </section>
  );
}
