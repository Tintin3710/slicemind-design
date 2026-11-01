/**
 * 결제 정보 화면 최소 검증 (390×844).
 *   사용: OUT=validation/runs/<id>/screens [SHOTS=0] npx tsx scripts/e2e-payment.ts
 *   SHOTS=0이면 캡처를 저장하지 않는다.
 */
import { chromium, type Page } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.BASE_URL ?? 'http://localhost:3100';
const OUT = process.env.OUT ?? 'validation/runs/latest';
const SHOTS = process.env.SHOTS !== '0';
fs.mkdirSync(OUT, { recursive: true });
const TOTAL = 3158400;

const checks: { name: string; pass: boolean; detail?: string }[] = [];
const check = (name: string, pass: boolean, detail?: string) => checks.push({ name, pass, detail });

// 코드 확인
// 주석을 제외한 코드만 검사한다(주석 속 함수 이름을 호출로 세지 않도록)
const src = fs.readFileSync('src/screens/guardian/payment/PaymentInfoScreen.tsx', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
for (const m of ['@/design-system/AmountSummary', '@/shared/lib/format-krw', '@/design-system/token-bridge', '@/features/price-adjustment/calculate', '@/screens/guardian/price-adjustment/ScreenLayout']) {
    check(`import ${m}`, src.includes(`from '${m}'`));
}
check('calculateCarePrice(0) 한 번 호출', (src.match(/calculateCarePrice\(/g) ?? []).length === 1 && src.includes('calculateCarePrice(0)'));
check('화면에 직접 색상값 없음', !/#[0-9A-Fa-f]{6}/.test(src));
check('화면에서 금액 산술 없음', !/price\.\w+\s*[-+*/]\s*(price|\d)/.test(src));

async function snapshot(page: Page) {
    return page.evaluate(() => {
        const ids = ['patient-name', 'patient-age', 'care-type', 'care-severity', 'schedule-range', 'schedule-total', 'schedule-weekday', 'schedule-weekend', 'footer-total'];
        const o: Record<string, string> = {};
        ids.forEach((id) => { o[id] = (document.querySelector(`[data-testid="${id}"]`) as HTMLElement)?.innerText ?? ''; });
        o.scrollTop = String(document.querySelector('main')!.scrollTop);
        return o;
    });
}
const sheetValues = (page: Page) => page.evaluate(() => {
    const ids = ['d-weekday-unit', 'd-weekend-unit', 'd-weekday', 'd-weekend', 'd-care', 'd-insurance', 'd-fee'];
    const o: Record<string, string> = {};
    ids.forEach((id) => { o[id] = (document.querySelector(`[data-testid="${id}"]`) as HTMLElement)?.innerText ?? ''; });
    o.total = document.querySelector('[data-testid="sheet-total"] [data-amount]')?.getAttribute('data-amount') ?? '';
    o.totalLabel = (document.querySelector('[data-testid="sheet-total"] [data-label]') as HTMLElement)?.innerText ?? '';
    return o;
});

(async () => {
    const browser = await chromium.launch({ channel: 'chrome', headless: true });
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
    const errors: string[] = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto(`${BASE}/payment`);

    // 본문 구성 순서
    const y = async (id: string) => (await page.getByTestId(id).boundingBox())!.y;
    const order = [await y('section-patient'), await y('section-care'), await y('section-schedule')];
    check('본문 순서: 환자 → 유형·중증도 → 일정', order[0] < order[1] && order[1] < order[2], order.join(','));
    check('일정 평일 22일·주말 8일', (await page.getByTestId('schedule-weekday').innerText()) === '22일' && (await page.getByTestId('schedule-weekend').innerText()) === '8일');

    // 하단 고정
    check('하단 결제 예정 금액 3,158,400', Number(await page.getByTestId('footer-total').getAttribute('data-amount')) === TOTAL && (await page.getByTestId('footer-total').innerText()) === '3,158,400원');
    check('하단 라벨', (await page.locator('footer').innerText()).includes('결제 예정 금액'));
    check('결제하기 버튼', (await page.getByTestId('pay-button').innerText()).trim() === '결제하기');
    check('펼치기 aria-expanded=false', (await page.getByTestId('detail-toggle').getAttribute('aria-expanded')) === 'false');
    const layout = await page.evaluate(() => {
        const m = document.querySelector('main')!, f = document.querySelector('footer')!;
        const mr = m.getBoundingClientRect(), fr = f.getBoundingClientRect();
        return { overlap: mr.bottom > fr.top + 1, overflowX: document.documentElement.scrollWidth > innerWidth + 1, footerBottom: fr.bottom, vh: innerHeight };
    });
    check('하단이 본문을 가리지 않음', !layout.overlap && !layout.overflowX, JSON.stringify(layout));
    check('하단 영역 화면 하단 고정', Math.abs(layout.footerBottom - layout.vh) <= 1, JSON.stringify(layout));
    await page.locator('main').evaluate((m) => m.scrollTo(0, m.scrollHeight));
    const lastVisible = await page.getByTestId('schedule-weekend').evaluate((el) => el.getBoundingClientRect().bottom <= document.querySelector('footer')!.getBoundingClientRect().top);
    check('본문 끝까지 스크롤 시 마지막 항목 보임', lastVisible);
    await page.locator('main').evaluate((m) => m.scrollTo(0, 0));
    // 390×844에서는 본문이 한 화면에 들어와 스크롤이 없다. 스크롤 유지는 아래 390×600에서 따로 확인한다.
    const before = await snapshot(page);
    if (SHOTS) await page.screenshot({ path: path.join(OUT, '390-payment-closed.png') });

    // 열기
    await page.getByTestId('detail-toggle').click();
    check('바텀시트 열림(dialog)', await page.getByRole('dialog', { name: '비용 상세' }).isVisible());
    check('펼치기 aria-expanded=true', (await page.getByTestId('detail-toggle').getAttribute('aria-expanded')) === 'true');
    check('열면 닫기 버튼에 포커스', await page.getByTestId('sheet-close').evaluate((b) => b === document.activeElement));
    const v1 = await sheetValues(page);
    const exp = { 'd-weekday-unit': '90,000원', 'd-weekend-unit': '108,000원', 'd-weekday': '1,980,000원', 'd-weekend': '864,000원', 'd-care': '2,844,000원', 'd-insurance': '30,000원', 'd-fee': '284,400원' };
    check('상세 항목 값', Object.entries(exp).every(([k, v]) => v1[k] === v), JSON.stringify(v1));
    check('상세 총액 3,158,400 · 라벨', Number(v1.total) === TOTAL && v1.totalLabel === '결제 예정 금액');
    check('상세 합 = 총액', [v1['d-weekday'], v1['d-weekend'], v1['d-insurance'], v1['d-fee']].reduce((s, x) => s + Number(x.replace(/\D/g, '')), 0) === TOTAL);
    await page.getByTestId('sheet-body').evaluate((b) => b.scrollTo(0, b.scrollHeight));
    const sheetLayout = await page.evaluate(() => {
        const sheet = document.querySelector('[data-testid="sheet"]')!.getBoundingClientRect();
        const total = document.querySelector('[data-testid="sheet-total"]')!.getBoundingClientRect();
        const topEl = document.elementFromPoint(total.left + total.width / 2, total.top + total.height / 2);
        return { totalInView: total.bottom <= innerHeight && total.top >= sheet.top, notCovered: !!topEl && !!topEl.closest('[data-testid="sheet"]'), sheetH: sheet.height, vh: innerHeight };
    });
    check('상세 총액이 가려지지 않음', sheetLayout.totalInView && sheetLayout.notCovered, JSON.stringify(sheetLayout));
    if (SHOTS) {
        await page.getByTestId('sheet-body').evaluate((b) => b.scrollTo(0, 0));
        await page.screenshot({ path: path.join(OUT, '390-payment-sheet-open.png') });
    }

    // 닫기(버튼) → 유지
    await page.getByTestId('sheet-close').click();
    check('닫기 버튼으로 닫힘', (await page.getByTestId('sheet-root').count()) === 0);
    check('닫으면 펼치기 버튼에 포커스', await page.getByTestId('detail-toggle').evaluate((b) => b === document.activeElement));
    const after1 = await snapshot(page);
    check('닫은 뒤 정보·금액·스크롤 유지', JSON.stringify(after1) === JSON.stringify(before), JSON.stringify(after1));

    // 다시 열기 → 같은 값, 배경 눌러 닫기
    await page.getByTestId('detail-toggle').click();
    check('다시 열어도 상세 값 동일', JSON.stringify(await sheetValues(page)) === JSON.stringify(v1));
    await page.mouse.click(195, 40);
    check('배경 눌러 닫힘', (await page.getByTestId('sheet-root').count()) === 0);
    // Escape 닫기
    await page.getByTestId('detail-toggle').click();
    await page.keyboard.press('Escape');
    check('Escape로 닫힘', (await page.getByTestId('sheet-root').count()) === 0);
    const after2 = await snapshot(page);
    check('여러 번 열고 닫은 뒤에도 유지', JSON.stringify(after2) === JSON.stringify(before), JSON.stringify(after2));

    // 스크롤 위치 유지: 본문이 스크롤되는 높이에서 확인
    await page.setViewportSize({ width: 390, height: 600 });
    await page.locator('main').evaluate((m) => m.scrollTo(0, 120));
    const s0 = await snapshot(page);
    check('390×600 본문 스크롤 위치 설정', Number(s0.scrollTop) > 0, s0.scrollTop);
    await page.getByTestId('detail-toggle').click();
    await page.getByTestId('sheet-close').click();
    await page.getByTestId('detail-toggle').click();
    await page.mouse.click(195, 40);
    const s1 = await snapshot(page);
    check('390×600 열기·닫기·다시 열기 후 스크롤·정보·금액 유지', JSON.stringify(s1) === JSON.stringify(s0), JSON.stringify(s1));

    check('콘솔 오류 없음', errors.length === 0, errors.join(' | '));
    await browser.close();
    fs.writeFileSync(path.join(OUT, 'e2e-result.json'), JSON.stringify(checks, null, 2));
    for (const c of checks) console.log(`${c.pass ? 'PASS' : 'FAIL'} ${c.name}${!c.pass && c.detail ? ` — ${c.detail}` : ''}`);
    process.exit(checks.every((c) => c.pass) ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(2); });
