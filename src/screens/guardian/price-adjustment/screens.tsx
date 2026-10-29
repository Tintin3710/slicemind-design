import { designTokens, cn } from '@/shared/config/design-tokens';
import { semantic } from '@/design-system/token-bridge';
import { AmountSummary } from '@/design-system/AmountSummary';
import { PriceChangeRow } from '@/design-system/PriceChangeRow';
import { SegmentedRow } from '@/shared/ui/SegmentedRow';
import { formatKRW, priceConfig, type IncreasePercent, type PriceBreakdown } from '@/features/price-adjustment/calculate';
import { ScreenLayout } from './ScreenLayout';

const t = designTokens.typography;

/* ---------- 진입 전 화면 (데모용 신청 내역) ---------- */
export function EntryScreen(props: {
    applicationTotal: number;
    status: 'matchFailed' | 'reapplied';
    onOpen: () => void;
}) {
    const failed = props.status === 'matchFailed';
    return (
        <ScreenLayout
            screenId="entry"
            title="간병 신청 내역"
            footer={
                failed ? (
                    <button type="button" className={semantic.action.primary} onClick={props.onOpen}>
                        매칭 결과 보기
                    </button>
                ) : undefined
            }
        >
            <div className={semantic.space.section}>
                <p className={cn(t.smallMedium, semantic.text.secondary)}>데모 신청 · 실제 결제·지원자 모집은 수행하지 않아요.</p>
                <div className="flex items-center gap-2">
                    <span className={designTokens.components.tag.solid} data-testid="application-status">
                        {failed ? '매칭 실패' : '재신청 완료'}
                    </span>
                </div>
                <AmountSummary label="현재 신청 금액" amount={props.applicationTotal} emphasis="default" testId="application-total" />
            </div>
        </ScreenLayout>
    );
}

/* ---------- 매칭 실패 ---------- */
export function MatchingFailedScreen(props: { onAdjust: () => void; onClose: () => void }) {
    return (
        <ScreenLayout
            screenId="failed"
            title="매칭 실패"
            onClose={props.onClose}
            footer={
                <>
                    <button type="button" className={semantic.action.primary} onClick={props.onAdjust}>
                        금액 조정하기
                    </button>
                    <button type="button" className={semantic.action.secondary} onClick={props.onClose}>
                        닫기
                    </button>
                </>
            }
        >
            <div className="flex flex-col items-center gap-6 pt-6 text-center">
                {/* 안내 이미지: 원본 이미지 대신 단순 도형 */}
                <div className={cn('flex h-[120px] w-[120px] items-center justify-center rounded-full', semantic.illustration.background)}>
                    <svg width="120" height="120" viewBox="0 0 120 120" role="img" aria-label="지원자 없음 안내 이미지" className={semantic.illustration.stroke}>
                        <circle cx="60" cy="48" r="16" fill="none" stroke="currentColor" strokeWidth="4" />
                        <path d="M32 92c4-14 16-22 28-22s24 8 28 22" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                        <g className={semantic.illustration.muted}>
                            <path d="M84 30l12 12M96 30L84 42" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                        </g>
                    </svg>
                </div>
                <div className="flex flex-col gap-2">
                    <h2 className={cn(t.h2, semantic.text.primary)}>현재 간병비에서는 지원자가 없어요.</h2>
                    <p className={cn(t['15medium'], semantic.text.secondary)}>
                        간병비를 조정해 다시 신청할 수 있어요. 금액을 올리면 간병인의 지원 가능성을 높일 수 있지만, 지원을 보장하지는 않아요.
                    </p>
                </div>
            </div>
        </ScreenLayout>
    );
}

/* ---------- 금액 조정 ---------- */
export function AdjustScreen(props: {
    percent: IncreasePercent;
    price: PriceBreakdown;
    original: PriceBreakdown;
    onSelect: (p: IncreasePercent) => void;
    onReset: () => void;
    onNext: () => void;
    onBack: () => void;
    onClose: () => void;
}) {
    const { price } = props;
    const items = priceConfig.selectableIncreasePercents.map((p) => {
        const recommended = p === priceConfig.recommendedIncreasePercent;
        return {
            key: String(p) as `${IncreasePercent}`,
            label: `+${p}%`,
            badge: recommended ? '추천' : undefined,
            ariaLabel: recommended ? `+${p}% 추천` : `+${p}%`,
        };
    });
    return (
        <ScreenLayout
            screenId="adjust"
            title="금액 조정"
            onBack={props.onBack}
            onClose={props.onClose}
            footer={
                <button type="button" className={semantic.action.primary} onClick={props.onNext}>
                    변경 금액 확인하기
                </button>
            }
        >
            <div className={semantic.space.section}>
                <div className="flex flex-col gap-2">
                    <h2 className={cn(t.h2, semantic.text.primary)}>간병비를 얼마나 올릴까요?</h2>
                    <p className={cn(t['15medium'], semantic.text.secondary)}>금액을 올리면 간병인의 지원 가능성을 높일 수 있어요.</p>
                </div>

                <div className="flex flex-col gap-4" data-testid="rate-selector">
                    <div className="flex items-center justify-between gap-3">
                        <p className={cn(t.bodySemibold, semantic.text.primary)} aria-live="polite" data-testid="current-percent">
                            현재 선택 <span className={semantic.text.accent}>+{props.percent}%</span>
                        </p>
                        <button
                            type="button"
                            onClick={props.onReset}
                            className={cn(t.smallMedium, semantic.text.secondary, 'shrink-0 whitespace-nowrap rounded-lg px-2 py-1 underline underline-offset-2', semantic.action.focusRing)}
                        >
                            초기화
                        </button>
                    </div>
                    <div className="pt-2">
                        <SegmentedRow
                            ariaLabel="인상률 선택"
                            items={items}
                            value={String(props.percent) as `${IncreasePercent}`}
                            onChange={(v) => props.onSelect(Number(v) as IncreasePercent)}
                        />
                    </div>
                    <p className={cn(t['13'], semantic.text.secondary)}>10%는 추천 인상률입니다.</p>
                </div>

                <div className={cn('flex flex-col', semantic.space.row)}>
                    <div className={cn('border px-4 divide-y divide-gray-100', semantic.border.default, semantic.radius.card)}>
                        <PriceChangeRow label="평일" before={price.weekdayBaseUnit} after={price.weekdayUnit} delta={price.weekdayDelta} unitLabel="원/일" testId="adjust-weekday" />
                        <PriceChangeRow label="주말·공휴일" before={price.weekendBaseUnit} after={price.weekendUnit} delta={price.weekendDelta} unitLabel="원/일" testId="adjust-weekend" />
                    </div>
                    <AmountSummary
                        label="예상 결제 금액"
                        amount={price.total}
                        description={`변경 전 ${formatKRW(props.original.total)}원보다 +${formatKRW(price.totalDelta)}원`}
                        testId="adjust-total"
                    />
                </div>
            </div>
        </ScreenLayout>
    );
}

/* ---------- 최종 확인 ---------- */
function DetailLine({ label, value, testId, divided }: { label: string; value: number; testId: string; divided?: boolean }) {
    return (
        <div className={cn('flex items-start justify-between gap-3 py-2', divided && 'border-t border-gray-100 mt-1 pt-3')}>
            <dt className={cn(t['15medium'], semantic.text.secondary)}>{label}</dt>
            <dd className={cn(t['15semibold'], semantic.text.primary, 'tabular-nums whitespace-nowrap')} data-testid={testId} data-amount={value}>
                {formatKRW(value)}원
            </dd>
        </div>
    );
}

export function ReviewScreen(props: {
    price: PriceBreakdown;
    completed: { total: number } | null;
    onConfirm: () => void;
    onBack: () => void;
    onClose: () => void;
}) {
    const { price, completed } = props;
    return (
        <ScreenLayout
            screenId="review"
            title="금액 조정"
            onBack={completed ? undefined : props.onBack}
            onClose={props.onClose}
            footer={
                <button
                    type="button"
                    className={semantic.action.primary}
                    onClick={props.onConfirm}
                    disabled={completed !== null}
                    data-testid="confirm-button"
                >
                    {formatKRW(price.total)}원으로 재신청하기
                </button>
            }
        >
            <div className={semantic.space.section}>
                <h2 className={cn(t.h2, semantic.text.primary)}>변경된 금액을 확인해 주세요.</h2>

                {completed && (
                    <div role="status" data-testid="completion" className={cn('flex flex-col gap-1 border p-4', semantic.radius.card, designTokens.colors.primaryBorder, designTokens.colors.primaryBgLight)}>
                        <p className={cn(t.bodyBold, semantic.text.accent)}>재신청이 완료됐어요.</p>
                        <p className={cn(t['15medium'], semantic.text.primary)}>
                            적용 금액 <strong className="tabular-nums" data-testid="completion-amount" data-amount={completed.total}>{formatKRW(completed.total)}원</strong>
                        </p>
                        <p className={cn(t['13'], semantic.text.secondary)}>데모 상태예요. 실제 결제·지원자 모집은 진행되지 않아요.</p>
                    </div>
                )}

                <div className={cn('flex flex-col', semantic.space.row)}>
                    <div className={cn('border px-4 divide-y divide-gray-100', semantic.border.default, semantic.radius.card)}>
                        <div className="flex items-center justify-between py-3">
                            <span className={cn(t['15medium'], semantic.text.primary)}>적용 비율</span>
                            <span className={cn(t['17semibold'], semantic.text.accent)} data-testid="review-percent">+{price.increasePercent}%</span>
                        </div>
                        <PriceChangeRow label="평일" before={price.weekdayBaseUnit} after={price.weekdayUnit} unitLabel="원/일" testId="review-weekday" />
                        <PriceChangeRow label="주말·공휴일" before={price.weekendBaseUnit} after={price.weekendUnit} unitLabel="원/일" testId="review-weekend" />
                    </div>
                    <AmountSummary label="예상 결제 금액" amount={price.total} testId="review-total" />
                </div>

                <section aria-labelledby="detail-heading" className="flex flex-col gap-2">
                    <h3 id="detail-heading" className={cn(t.h3, semantic.text.primary)}>결제 상세</h3>
                    <dl className={cn('border px-4 py-2', semantic.border.default, semantic.radius.card)}>
                        <DetailLine label={`평일 ${formatKRW(price.weekdayUnit)}원 × ${price.weekdayDays}일`} value={price.weekdaySubtotal} testId="detail-weekday" />
                        <DetailLine label={`주말·공휴일 ${formatKRW(price.weekendUnit)}원 × ${price.weekendDays}일`} value={price.weekendSubtotal} testId="detail-weekend" />
                        <DetailLine label="간병비 합계" value={price.careSubtotal} testId="detail-care-subtotal" divided />
                        <DetailLine label="보험료" value={price.insurance} testId="detail-insurance" divided />
                        <DetailLine label="플랫폼 수수료" value={price.platformFee} testId="detail-fee" />
                    </dl>
                    <p className={cn(t['13'], semantic.text.secondary)}>수수료는 실험용 가정(간병비 합계의 10%)으로 계산했어요.</p>
                </section>
            </div>
        </ScreenLayout>
    );
}
