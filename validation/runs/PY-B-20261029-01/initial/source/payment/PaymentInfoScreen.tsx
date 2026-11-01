'use client';

/**
 * 결제 정보 확인 + 비용 상세 바텀시트 (docs/features/payment.md).
 * 금액은 calculateCarePrice(0) 한 번의 결과를 하단·상세에서 함께 쓴다 (P06).
 * 바텀시트는 이 화면 안에서 구현한다(공통 컴포넌트 없음).
 */
import { useEffect, useRef, useState } from 'react';
import { designTokens, cn } from '@/shared/config/design-tokens';
import { semantic } from '@/design-system/token-bridge';
import { AmountSummary } from '@/design-system/AmountSummary';
import { formatKRW } from '@/shared/lib/format-krw';
import { calculateCarePrice } from '@/features/price-adjustment/calculate';
import { ScreenLayout } from '@/screens/guardian/price-adjustment/ScreenLayout';
import { demoRequest } from './demo-request';

const t = designTokens.typography;
const price = calculateCarePrice(0);

/** 간병비 확인 화면 DetailLine과 같은 정렬·글자 스타일(원본은 export되지 않음). */
function DetailLine({ label, value, testId }: { label: string; value: string; testId: string }) {
    return (
        <div className="flex items-start justify-between gap-3 py-2">
            <dt className={cn(t['15medium'], semantic.text.secondary)}>{label}</dt>
            <dd className={cn(t['15semibold'], semantic.text.primary, 'tabular-nums text-right')} data-testid={testId}>
                {value}
            </dd>
        </div>
    );
}

function InfoSection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
    return (
        <section aria-labelledby={`${id}-heading`} data-testid={`section-${id}`} className={cn('flex flex-col', semantic.space.related)}>
            <h2 id={`${id}-heading`} className={cn(t.h3, semantic.text.primary)}>{title}</h2>
            <dl className={cn('border px-4 py-2', semantic.border.default, semantic.radius.card)}>{children}</dl>
        </section>
    );
}

export function PaymentInfoScreen() {
    const [open, setOpen] = useState(false);
    const toggleRef = useRef<HTMLButtonElement>(null);
    const closeRef = useRef<HTMLButtonElement>(null);
    const r = demoRequest;

    useEffect(() => {
        if (!open) return;
        closeRef.current?.focus();
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open]);

    const close = () => {
        setOpen(false);
        toggleRef.current?.focus();
    };

    return (
        <>
            <ScreenLayout
                screenId="payment"
                title="결제 정보"
                footer={
                    <>
                        <div className="flex items-center justify-between gap-3">
                            <span className={cn('text-[15px] font-semibold', semantic.text.primary)}>결제 예정 금액</span>
                            <div className="flex items-center gap-1">
                                <strong className={cn('text-xl font-bold tabular-nums whitespace-nowrap', semantic.text.accent)} data-testid="footer-total" data-amount={price.total}>
                                    {formatKRW(price.total)}원
                                </strong>
                                <button
                                    ref={toggleRef}
                                    type="button"
                                    aria-label="비용 상세 보기"
                                    aria-expanded={open}
                                    aria-controls="cost-detail-sheet"
                                    onClick={() => setOpen(true)}
                                    className={cn('flex h-10 w-10 items-center justify-center rounded-lg', semantic.text.primary, semantic.action.focusRing)}
                                    data-testid="detail-toggle"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                        <path d="M6 15l6-6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <button type="button" className={semantic.action.primary} data-testid="pay-button">
                            결제하기
                        </button>
                    </>
                }
            >
                <div className={semantic.space.section}>
                    <p className={cn(t['13'], semantic.text.secondary)}>가상 데모 신청 정보예요. 실제 결제는 진행되지 않아요.</p>
                    <InfoSection id="patient" title="환자 정보">
                        <DetailLine label="이름" value={r.patient.name} testId="patient-name" />
                        <DetailLine label="나이·성별" value={`${r.patient.age}세 · ${r.patient.sex}`} testId="patient-age" />
                    </InfoSection>
                    <InfoSection id="care" title="간병 유형·중증도">
                        <DetailLine label="간병 유형" value={r.care.type} testId="care-type" />
                        <DetailLine label="중증도" value={r.care.severity} testId="care-severity" />
                    </InfoSection>
                    <InfoSection id="schedule" title="간병 일정">
                        <DetailLine label="기간" value={`${r.schedule.start} ~ ${r.schedule.end}`} testId="schedule-range" />
                        <DetailLine label="전체" value={`${r.schedule.totalDays}일`} testId="schedule-total" />
                        <DetailLine label="평일" value={`${price.weekdayDays}일`} testId="schedule-weekday" />
                        <DetailLine label="주말·공휴일" value={`${price.weekendDays}일`} testId="schedule-weekend" />
                    </InfoSection>
                </div>
            </ScreenLayout>

            {open && (
                <div className="fixed inset-0 z-50 flex items-end justify-center" data-testid="sheet-root">
                    <div className="absolute inset-0 bg-black/40" aria-hidden="true" onClick={close} data-testid="sheet-backdrop" />
                    <div
                        id="cost-detail-sheet"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="sheet-title"
                        className="relative flex max-h-[85dvh] w-full max-w-[740px] flex-col rounded-t-2xl bg-white"
                        data-testid="sheet"
                    >
                        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-4 py-3 min-[400px]:px-6">
                            <h2 id="sheet-title" className={cn(t['17semibold'], semantic.text.primary)}>비용 상세</h2>
                            <button
                                ref={closeRef}
                                type="button"
                                aria-label="닫기"
                                onClick={close}
                                className={cn('flex h-10 w-10 items-center justify-center rounded-lg', semantic.text.primary, semantic.action.focusRing)}
                                data-testid="sheet-close"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </button>
                        </div>
                        <div className={cn('overflow-y-auto px-4 pt-4 pb-[max(16px,env(safe-area-inset-bottom))] min-[400px]:px-6', semantic.space.row, 'flex flex-col')} data-testid="sheet-body">
                            <dl className={cn('border px-4 py-2', semantic.border.default, semantic.radius.card)}>
                                <DetailLine label="평일 단가" value={`${formatKRW(price.weekdayUnit)}원`} testId="d-weekday-unit" />
                                <DetailLine label="주말·공휴일 단가" value={`${formatKRW(price.weekendUnit)}원`} testId="d-weekend-unit" />
                            </dl>
                            <dl className={cn('border px-4 py-2', semantic.border.default, semantic.radius.card)}>
                                <DetailLine label={`평일 ${formatKRW(price.weekdayUnit)}원 × ${price.weekdayDays}일`} value={`${formatKRW(price.weekdaySubtotal)}원`} testId="d-weekday" />
                                <DetailLine label={`주말·공휴일 ${formatKRW(price.weekendUnit)}원 × ${price.weekendDays}일`} value={`${formatKRW(price.weekendSubtotal)}원`} testId="d-weekend" />
                                <DetailLine label="간병비 합계" value={`${formatKRW(price.careSubtotal)}원`} testId="d-care" />
                                <DetailLine label="보험료" value={`${formatKRW(price.insurance)}원`} testId="d-insurance" />
                                <DetailLine label="플랫폼 수수료" value={`${formatKRW(price.platformFee)}원`} testId="d-fee" />
                            </dl>
                            <AmountSummary label="결제 예정 금액" amount={price.total} testId="sheet-total" />
                            <p className={cn(t['13'], semantic.text.secondary)}>수수료는 실험용 가정(간병비 합계의 10%)으로 계산했어요.</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
