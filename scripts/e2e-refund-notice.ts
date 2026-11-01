/**
 * 환불 안내 화면 최소 검증 (390×844).
 *   사용: OUT=validation/runs/<id>/screens npx tsx scripts/e2e-refund-notice.ts
 */
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import fixture from '../fixtures/cancellation-refund.json';

const BASE = process.env.BASE_URL ?? 'http://localhost:3100';
const OUT = process.env.OUT ?? 'validation/runs/latest';
fs.mkdirSync(OUT, { recursive: true });

const checks: { name: string; pass: boolean; detail?: string }[] = [];
const check = (name: string, pass: boolean, detail?: string) => checks.push({ name, pass, detail });

// 코드 확인: 공통 컴포넌트 import, 공통 UI의 기능 의존 없음, 직접 색상값 없음
const src = fs.readFileSync('src/screens/guardian/cancellation/RefundNoticeScreen.tsx', 'utf8');
for (const m of ['@/design-system/AmountSummary', '@/design-system/StatusBadge', '@/shared/lib/format-krw', '@/design-system/token-bridge', '@/features/cancellation/calculate']) {
    check(`import ${m}`, src.includes(`from '${m}'`));
}
check('PriceChangeRow 미사용', !src.includes('PriceChangeRow'));
check('화면에 직접 색상값 없음', !/#[0-9A-Fa-f]{6}/.test(src));
check('화면에서 금액 산술 없음', !/penaltyBaseAmount\s*\*|paidAmount\s*-/.test(src));

(async () => {
    const browser = await chromium.launch({ channel: 'chrome', headless: true });
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
    const errors: string[] = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto(`${BASE}/cancellation`);

    const txt = (id: string) => page.getByTestId(id).innerText().then((s) => s.trim());
    const amt = (id: string) => page.getByTestId(id).locator('[data-amount]').getAttribute('data-amount').then(Number);
    const label = (id: string) => page.getByTestId(id).locator('[data-label]').innerText();
    const emph = (id: string) => page.getByTestId(id).getAttribute('data-emphasis');

    // 1. 구성 순서: 적용 조건 → 계산 근거·차감 내역 → 환불 예정액
    const y = async (id: string) => (await page.getByTestId(id).boundingBox())!.y;
    const order = [await y('section-condition'), await y('section-basis'), await y('section-refund'), await y('refund-total')];
    check('순서: 조건 < 근거 < 환불 내역 < 환불 예정액', order.every((v, i) => i === 0 || v > order[i - 1]), order.join(','));
    check('적용 조건: 18시간 전', (await txt('cancel-timing')) === '간병 시작 18시간 전');
    check('적용 조건: 위약금 발생 배지', (await txt('penalty-badge')) === '위약금 발생' && (await page.getByTestId('penalty-badge').getAttribute('data-tone')) === 'negative');
    check('적용 조건: 신청 제한 7일', (await txt('restriction')) === '취소 후 7일');

    // 3. 금액·라벨
    check('위약금 계산 기준액 2,600,000원', (await txt('penalty-base')) === '2,600,000원');
    check('위약금 비율 2%', (await txt('penalty-rate')) === '2%');
    check('위약금 52,000 · 라벨 · negative', (await amt('penalty-total')) === 52000 && (await label('penalty-total')) === '위약금' && (await emph('penalty-total')) === 'negative');
    check('결제 금액 3,158,400원', (await txt('paid')) === '3,158,400원');
    check('위약금 차감 −52,000원', (await txt('penalty-deduct')) === '−52,000원');
    check('환불 예정액 3,106,400 · 라벨 · accent', (await amt('refund-total')) === 3106400 && (await label('refund-total')) === '환불 예정액' && (await emph('refund-total')) === 'accent');
    check('3,158,400 − 52,000 = 3,106,400', fixture.paidAmount - (await amt('penalty-total')) === (await amt('refund-total')) && (await amt('refund-total')) === fixture.expected.refund);
    check('기준액 × 2% = 위약금', Math.round(fixture.penaltyBaseAmount * 0.02) === (await amt('penalty-total')));
    check('결제 금액과 기준액 라벨 구분', (await page.getByText('결제 금액', { exact: true }).count()) === 1 && (await page.getByText('위약금 계산 기준액', { exact: true }).count()) === 1);
    check('하단 버튼 이동 문구', (await txt('next-button')) === '취소 사유 선택하기');

    // 4. 레이아웃
    const issues = await page.evaluate(() => {
        const out: string[] = [];
        if (document.documentElement.scrollWidth > innerWidth + 1) out.push('overflow-x');
        const m = document.querySelector('main')!.getBoundingClientRect(), f = document.querySelector('footer')!.getBoundingClientRect();
        if (m.bottom > f.top + 1) out.push('main overlaps footer');
        document.querySelectorAll('dd, dt, [data-amount], button, h2, h3').forEach((el) => {
            const r = el.getBoundingClientRect(); if (r.right > innerWidth + 1) out.push(`offscreen ${(el as HTMLElement).innerText}`);
        });
        return out;
    });
    check('레이아웃 이상 없음', issues.length === 0, issues.join('; '));
    const refundVisible = await page.getByTestId('refund-total').evaluate((el) => el.getBoundingClientRect().bottom <= document.querySelector('footer')!.getBoundingClientRect().top);
    check('환불 예정액 첫 화면 노출(참고)', true, refundVisible ? '보임' : '스크롤 필요');
    await page.screenshot({ path: path.join(OUT, '390-refund-notice.png') });
    if (!refundVisible) {
        await page.locator('main').evaluate((m) => m.scrollTo(0, m.scrollHeight));
        await page.screenshot({ path: path.join(OUT, '390-refund-notice-bottom.png') });
    }
    check('콘솔 오류 없음', errors.length === 0, errors.join(' | '));
    await browser.close();

    fs.writeFileSync(path.join(OUT, 'e2e-result.json'), JSON.stringify(checks, null, 2));
    for (const c of checks) console.log(`${c.pass ? 'PASS' : 'FAIL'} ${c.name}${c.detail ? ` — ${c.detail}` : ''}`);
    process.exit(checks.every((c) => c.pass) ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(2); });
