/**
 * 간병비 조정 금액 계산의 단일 경로 (P06).
 * 화면·컴포넌트는 이 함수의 결과만 표시하고 직접 계산하지 않는다.
 * 정책 값은 fixtures/care-price.json에서 읽는다 (실험 가정 A02~A05).
 */
import fixture from '@fixtures/care-price.json';

export const CALC_VERSION = 'calculate@1.0.0';

export type CarePriceFixture = typeof fixture;
export type IncreasePercent = 5 | 10 | 15;

export type PriceBreakdown = {
    increasePercent: number;
    weekdayDays: number;
    weekendDays: number;
    weekdayBaseUnit: number;
    weekendBaseUnit: number;
    weekdayUnit: number;
    weekendUnit: number;
    weekdayDelta: number;
    weekendDelta: number;
    weekdaySubtotal: number;
    weekendSubtotal: number;
    careSubtotal: number;
    platformFee: number;
    insurance: number;
    total: number;
    totalDelta: number;
};

function compute(data: CarePriceFixture, percent: number) {
    const { weekday: wdBase, weekendAndHoliday: weBase } = data.baseUnitRates;
    const { weekday: wdDays, weekendAndHoliday: weDays } = data.days;
    // A05: 원래 단가에 각각 적용, 원 단위 반올림. 정수 비율로 계산해 부동소수 오차를 피한다.
    const weekdayUnit = Math.round((wdBase * (100 + percent)) / 100);
    const weekendUnit = Math.round((weBase * (100 + percent)) / 100);
    const weekdaySubtotal = weekdayUnit * wdDays;
    const weekendSubtotal = weekendUnit * weDays;
    const careSubtotal = weekdaySubtotal + weekendSubtotal;
    // A03·A04: 실험 수수료. 실제 수익 정책이 아니다.
    const platformFee = Math.round(careSubtotal * data.experimentFeeRate);
    const insurance = data.insuranceTotal;
    return {
        wdBase, weBase, wdDays, weDays,
        weekdayUnit, weekendUnit, weekdaySubtotal, weekendSubtotal,
        careSubtotal, platformFee, insurance,
        total: careSubtotal + platformFee + insurance,
    };
}

export function calculateCarePrice(percent: number, data: CarePriceFixture = fixture): PriceBreakdown {
    const base = compute(data, 0);
    const r = compute(data, percent);
    return {
        increasePercent: percent,
        weekdayDays: r.wdDays,
        weekendDays: r.weDays,
        weekdayBaseUnit: r.wdBase,
        weekendBaseUnit: r.weBase,
        weekdayUnit: r.weekdayUnit,
        weekendUnit: r.weekendUnit,
        weekdayDelta: r.weekdayUnit - r.wdBase,
        weekendDelta: r.weekendUnit - r.weBase,
        weekdaySubtotal: r.weekdaySubtotal,
        weekendSubtotal: r.weekendSubtotal,
        careSubtotal: r.careSubtotal,
        platformFee: r.platformFee,
        insurance: r.insurance,
        total: r.total,
        totalDelta: r.total - base.total,
    };
}

export const priceConfig = {
    defaultIncreasePercent: fixture.defaultIncreasePercent as IncreasePercent,
    resetIncreasePercent: fixture.resetIncreasePercent as IncreasePercent,
    selectableIncreasePercents: fixture.selectableIncreasePercents as IncreasePercent[],
    /** A07: 실험 고정 추천값. 추천 알고리즘 결과가 아니다. */
    recommendedIncreasePercent: 10 as IncreasePercent,
    originalTotal: calculateCarePrice(0).total,
};
