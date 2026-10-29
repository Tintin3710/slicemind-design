/** fixtures/care-price.json의 expected와 단일 계산 경로 결과를 비교한다. */
import fixture from '../fixtures/care-price.json';
import { calculateCarePrice } from '../src/features/price-adjustment/calculate';

const keys = [
    'weekdayUnit', 'weekendUnit', 'weekdayDelta', 'weekendDelta', 'weekdaySubtotal',
    'weekendSubtotal', 'careSubtotal', 'platformFee', 'insurance', 'total', 'totalDelta',
] as const;

let failures = 0;
for (const exp of fixture.expected) {
    const got = calculateCarePrice(exp.increasePercent);
    for (const k of keys) {
        if (got[k] !== exp[k]) {
            failures++;
            console.log(`FAIL ${exp.increasePercent}% ${k}: expected ${exp[k]}, got ${got[k]}`);
        }
    }
    console.log(`${exp.increasePercent}%: total ${got.total} ${got.total === exp.total ? 'OK' : 'MISMATCH'}`);
}
console.log(failures === 0 ? 'ALL PASS' : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
