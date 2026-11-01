/**
 * 환불 안내 금액 계산의 단일 경로 (P06). 간병비 계산과 별도로 관리한다.
 * 값은 fixtures/cancellation-refund.json의 실험 데이터이며 확정 정책이 아니다.
 */
import fixture from '@fixtures/cancellation-refund.json';

export const REFUND_CALC_VERSION = 'refund-calculate@0.1.0-experiment';

export type RefundBreakdown = {
    hoursBeforeStart: number;
    reapplyRestrictionDays: number;
    paidAmount: number;
    penaltyBaseAmount: number;
    penaltyRatePercent: number;
    penalty: number;
    refund: number;
};

export function calculateRefund(data = fixture): RefundBreakdown {
    // 위약금은 '위약금 계산 기준액'에 비율을 적용한다. 결제 금액과 혼동하지 않는다.
    const penalty = Math.round((data.penaltyBaseAmount * data.penaltyRatePercent) / 100);
    return {
        hoursBeforeStart: data.case.hoursBeforeStart,
        reapplyRestrictionDays: data.case.reapplyRestrictionDays,
        paidAmount: data.paidAmount,
        penaltyBaseAmount: data.penaltyBaseAmount,
        penaltyRatePercent: data.penaltyRatePercent,
        penalty,
        refund: data.paidAmount - penalty,
    };
}
