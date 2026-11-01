/**
 * 라벨이 붙은 최종 금액 (P05). 금액은 계산 결과를 받기만 하고 계산하지 않는다.
 * 의미(예상 결제·적용·환불 예정·위약금 등)는 label로 전달하고 색은 보조한다.
 * 기능별 계산 파일에 의존하지 않는다 (P06).
 */
import { cn } from '@/shared/config/design-tokens';
import { semantic } from '@/design-system/token-bridge';
import { formatKRW } from '@/shared/lib/format-krw';

export const AMOUNT_SUMMARY_VERSION = 'AmountSummary@2.0.0';

/**
 * 강조 역할 (patterns.md ‘금액 강조 역할’)
 * - accent: 예상 결제·적용·환불 예정 등 최종 금액
 * - negative: 위약금 등 금전적 불이익 (color-semantic-status-negative)
 * - neutral: 해당 금액이 없음을 알리는 값 (‘없음’)
 * - default: 일반 금액
 * v1의 'critical'은 'negative'로 대체했다.
 */
export type AmountEmphasis = 'default' | 'accent' | 'negative' | 'neutral';

export type AmountSummaryProps = {
  label: string;
  amount: number; // KRW 정수. 제품 정책의 계산 결과를 전달받습니다.
  emphasis?: AmountEmphasis;
  /** amount가 0일 때 금액 대신 보여줄 라벨(예: ‘없음’). 이때 강조 역할은 neutral이 된다. */
  noneLabel?: string;
  /** 보조 설명 (예: 변경 전 대비 증가액). 계산된 문자열을 받는다. */
  description?: string;
  testId?: string;
};

const emphasisClass: Record<AmountEmphasis, string> = {
  default: semantic.text.primary,
  accent: semantic.text.accent,
  negative: semantic.status.negativeText,
  neutral: semantic.status.neutralText,
};

export function AmountSummary({ label, amount, emphasis = 'accent', noneLabel, description, testId }: AmountSummaryProps) {
  const isNone = amount === 0 && noneLabel !== undefined;
  const role: AmountEmphasis = isNone ? 'neutral' : emphasis;
  const valueText = isNone ? noneLabel : `${formatKRW(amount)}원`;
  return (
    <section
      aria-label={`${label} ${valueText}`}
      data-component="AmountSummary"
      data-emphasis={role}
      data-testid={testId}
      className={cn('flex flex-col border', semantic.border.default, semantic.radius.card, semantic.space.rowPadding, semantic.space.related)}
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className={cn('text-[15px] font-semibold', semantic.text.primary)} data-label>{label}</span>
        <strong className={cn('text-xl font-bold tabular-nums whitespace-nowrap', emphasisClass[role])} data-amount={amount}>
          {valueText}
        </strong>
      </div>
      {description && <p className={cn('text-[13px] text-right', semantic.text.secondary)}>{description}</p>}
    </section>
  );
}
