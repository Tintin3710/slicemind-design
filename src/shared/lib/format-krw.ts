/** 원화 표시. 숫자 서식만 담당하며 계산 정책을 포함하지 않는다. */
export const FORMAT_KRW_VERSION = 'format-krw@1.0.0';

export function formatKRW(amount: number): string {
    return amount.toLocaleString('ko-KR');
}
