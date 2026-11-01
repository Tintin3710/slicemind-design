/**
 * 간병 시작 18시간 전 취소 안내 (선택 UI 없는 금액 확인 화면).
 * 공통 패턴 P-AMOUNT-01 v2.1을 적용하고 공통 컴포넌트·토큰을 수정 없이 재사용한다.
 * 금액은 src/features/cancellation/calculate.ts 결과만 표시한다 (P06).
 */
import { designTokens, cn } from '@/shared/config/design-tokens';
import { semantic } from '@/design-system/token-bridge';
import { AmountSummary } from '@/design-system/AmountSummary';
import { StatusBadge } from '@/design-system/StatusBadge';
import { formatKRW } from '@/shared/lib/format-krw';
import { calculateRefund } from '@/features/cancellation/calculate';
// 공통 폴더가 아닌 간병비 화면 폴더의 레이아웃을 재사용한다(실행 기록 참조).
import { ScreenLayout } from '@/screens/guardian/price-adjustment/ScreenLayout';

const t = designTokens.typography;

/** 간병비 화면 DetailLine과 같은 스타일. 원본이 export되지 않아 화면 안에 같은 구조로 둔다. */
function DetailLine({ label, value, testId, divided }: { label: string; value: string; testId: string; divided?: boolean }) {
    return (
        <div className={cn('flex items-start justify-between gap-3 py-2', divided && 'border-t border-gray-100 mt-1 pt-3')}>
            <dt className={cn(t['15medium'], semantic.text.secondary)}>{label}</dt>
            <dd className={cn(t['15semibold'], semantic.text.primary, 'tabular-nums whitespace-nowrap')} data-testid={testId}>
                {value}
            </dd>
        </div>
    );
}

export function RefundNoticeScreen() {
    const r = calculateRefund();
    return (
        <ScreenLayout
            screenId="refund-notice"
            title="예약 취소"
            footer={
                <button type="button" className={semantic.action.primary} data-testid="next-button">
                    취소 사유 선택하기
                </button>
            }
        >
            <div className={semantic.space.section}>
                <div className="flex flex-col gap-2">
                    <h2 className={cn(t.h2, semantic.text.primary)}>취소 전에 환불 금액을 확인해 주세요.</h2>
                    <p className={cn(t['13'], semantic.text.secondary)}>실험용 고정 데이터예요. 실제 서비스의 취소 정책이 아니에요.</p>
                </div>

                {/* P01: 선택이 없으므로 적용 조건을 먼저 보여준다 */}
                <section aria-labelledby="condition-heading" data-testid="section-condition" className={cn('flex flex-col', semantic.space.related)}>
                    <h3 id="condition-heading" className={cn(t.h3, semantic.text.primary)}>적용 조건</h3>
                    <dl className={cn('border px-4 py-2', semantic.border.default, semantic.radius.card)}>
                        <div className="flex items-center justify-between gap-3 py-2">
                            <dt className={cn(t['15medium'], semantic.text.secondary)}>취소 시점</dt>
                            <dd className={cn(t['15semibold'], semantic.text.primary)} data-testid="cancel-timing">간병 시작 {r.hoursBeforeStart}시간 전</dd>
                        </div>
                        <div className="flex items-center justify-between gap-3 py-2">
                            <dt className={cn(t['15medium'], semantic.text.secondary)}>위약금</dt>
                            <dd><StatusBadge label="위약금 발생" tone="negative" testId="penalty-badge" /></dd>
                        </div>
                        <div className="flex items-center justify-between gap-3 py-2">
                            <dt className={cn(t['15medium'], semantic.text.secondary)}>신청 제한</dt>
                            <dd className={cn(t['15semibold'], semantic.text.primary)} data-testid="restriction">취소 후 {r.reapplyRestrictionDays}일</dd>
                        </div>
                    </dl>
                </section>

                {/* P02·P03: 계산 근거 */}
                <section aria-labelledby="basis-heading" data-testid="section-basis" className={cn('flex flex-col', semantic.space.related)}>
                    <h3 id="basis-heading" className={cn(t.h3, semantic.text.primary)}>위약금 계산 근거</h3>
                    <dl className={cn('border px-4 py-2', semantic.border.default, semantic.radius.card)}>
                        <DetailLine label="위약금 계산 기준액" value={`${formatKRW(r.penaltyBaseAmount)}원`} testId="penalty-base" />
                        <DetailLine label="위약금 비율" value={`${r.penaltyRatePercent}%`} testId="penalty-rate" />
                    </dl>
                    <AmountSummary label="위약금" amount={r.penalty} emphasis="negative" testId="penalty-total" />
                </section>

                {/* P03: 차감 내역 → P05: 최종 금액 */}
                <section aria-labelledby="refund-heading" data-testid="section-refund" className={cn('flex flex-col', semantic.space.related)}>
                    <h3 id="refund-heading" className={cn(t.h3, semantic.text.primary)}>환불 내역</h3>
                    <dl className={cn('border px-4 py-2', semantic.border.default, semantic.radius.card)}>
                        <DetailLine label="결제 금액" value={`${formatKRW(r.paidAmount)}원`} testId="paid" />
                        <DetailLine label="위약금 차감" value={`−${formatKRW(r.penalty)}원`} testId="penalty-deduct" />
                    </dl>
                    <AmountSummary label="환불 예정액" amount={r.refund} emphasis="accent" testId="refund-total" />
                </section>
            </div>
        </ScreenLayout>
    );
}
