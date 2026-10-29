/**
 * 변경 전후 단가 한 줄 (P02). 색 외에 '변경 전/후' 라벨·순서·취소선으로 구분한다.
 * 인상률·증가액 계산은 하지 않는다. delta는 공통 계산 경로의 결과를 받는다 (P06).
 */
import { cn } from '@/shared/config/design-tokens';
import { semantic } from '@/design-system/token-bridge';
import { formatKRW } from '@/features/price-adjustment/calculate';

export const PRICE_CHANGE_ROW_VERSION = 'PriceChangeRow@1.0.0';

export type PriceChangeRowProps = {
  label: string;
  before: number; // KRW 정수
  after: number; // KRW 정수. 인상률 계산은 이 컴포넌트에서 수행하지 않습니다.
  unitLabel?: string; // 예: 원/일
  /** 증가액. 계산 결과를 그대로 받는다. 없으면 표시하지 않는다. */
  delta?: number;
  testId?: string;
};

export function PriceChangeRow({ label, before, after, unitLabel = '원', delta, testId }: PriceChangeRowProps) {
  return (
    <div data-component="PriceChangeRow" data-testid={testId} className="flex items-start justify-between gap-3 py-3">
      <span className={cn('text-[15px] font-medium pt-0.5', semantic.text.primary)}>{label}</span>
      <div className="flex flex-col items-end gap-1 text-right">
        <p className="flex flex-wrap items-baseline justify-end gap-x-1.5">
          <span className="sr-only">변경 전</span>
          <s className={cn('text-[13px] tabular-nums', semantic.text.secondary)} data-before={before}>
            {formatKRW(before)}
          </s>
          <span aria-hidden="true" className={semantic.text.secondary}>→</span>
          <span className="sr-only">변경 후</span>
          <span className={cn('text-[17px] font-semibold tabular-nums', semantic.text.primary)} data-after={after}>
            {formatKRW(after)}
            {unitLabel}
          </span>
        </p>
        {delta !== undefined && (
          <span className={cn('text-[13px] font-medium tabular-nums', semantic.text.accent)} data-delta={delta}>
            +{formatKRW(delta)}원
          </span>
        )}
      </div>
    </div>
  );
}
