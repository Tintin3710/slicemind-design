/**
 * validation/price-adjustment.md S01~S08 브라우저 검증 + 화면 캡처.
 * 설치된 Chrome을 playwright-core로 구동한다(브라우저 다운로드 없음).
 *   사용: BASE_URL=http://localhost:3100 OUT=validation/runs/<id>/after npx tsx scripts/e2e-price-adjustment.ts
 */
import { chromium, type Page } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.BASE_URL ?? 'http://localhost:3100';
const OUT = process.env.OUT ?? 'validation/runs/latest';
fs.mkdirSync(OUT, { recursive: true });

type Result = { id: string; pass: boolean; checks: { name: string; pass: boolean; detail?: string }[] };
const results: Result[] = [];
let current: Result;
const start = (id: string) => { current = { id, pass: true, checks: [] }; results.push(current); };
const check = (name: string, pass: boolean, detail?: string) => {
    current.checks.push({ name, pass, detail });
    if (!pass) current.pass = false;
};
const num = (s: string | null) => Number((s ?? '').replace(/[^0-9]/g, ''));

async function amountOf(page: Page, testId: string) {
    const el = page.locator(`[data-testid="${testId}"]`);
    const attr = await el.locator('[data-amount]').first().getAttribute('data-amount').catch(() => null);
    return attr ? Number(attr) : num(await el.getAttribute('data-amount'));
}
async function rowValues(page: Page, testId: string) {
    const row = page.locator(`[data-testid="${testId}"]`);
    return {
        before: Number(await row.locator('[data-before]').getAttribute('data-before')),
        after: Number(await row.locator('[data-after]').getAttribute('data-after')),
        delta: await row.locator('[data-delta]').count() ? Number(await row.locator('[data-delta]').getAttribute('data-delta')) : null,
        text: (await row.innerText()).replace(/\s+/g, ' '),
    };
}
const screenId = (page: Page) => page.locator('[data-screen]').getAttribute('data-screen');
async function shot(page: Page, name: string) {
    await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: false });
}
async function gotoAdjust(page: Page) {
    await page.goto(BASE);
    await page.getByRole('button', { name: '매칭 결과 보기' }).click();
    await page.getByRole('button', { name: '금액 조정하기' }).click();
}
const seg = (page: Page, p: number) => page.getByRole('group', { name: '인상률 선택' }).getByRole('button', { name: new RegExp(`^\\+${p}%`) });

/** 레이아웃 점검: 가로 넘침, 잘린 텍스트, 하단 버튼과 본문 겹침 */
async function layoutIssues(page: Page) {
    return page.evaluate(() => {
        const issues: string[] = [];
        if (document.documentElement.scrollWidth > window.innerWidth + 1) issues.push(`page overflow-x ${document.documentElement.scrollWidth}>${window.innerWidth}`);
        document.querySelectorAll('button, [data-amount], h1, h2, h3, dt, dd, p, span').forEach((el) => {
            const e = el as HTMLElement;
            if (e.offsetParent === null || e.classList.contains('sr-only')) return;
            const r = e.getBoundingClientRect();
            if (r.right > window.innerWidth + 1 || r.left < -1) issues.push(`offscreen: "${e.innerText.slice(0, 30)}"`);
            if (e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflow !== 'visible') issues.push(`clipped: "${e.innerText.slice(0, 30)}"`);
            if (e.tagName === 'BUTTON' && !e.innerText.includes('\n')) {
                const lh = parseFloat(getComputedStyle(e).lineHeight) || parseFloat(getComputedStyle(e).fontSize) * 1.5;
                const range = document.createRange(); range.selectNodeContents(e);
                const lines = new Set([...range.getClientRects()].map((rc) => Math.round(rc.top))).size;
                if (lines > 1 && e.innerText.trim().length <= 6) issues.push(`short button wraps: "${e.innerText}" (${lines} lines, lh ${lh})`);
            }
        });
        const main = document.querySelector('main');
        const footer = document.querySelector('footer');
        if (main && footer) {
            const m = main.getBoundingClientRect(), f = footer.getBoundingClientRect();
            if (m.bottom > f.top + 1) issues.push(`main overlaps footer ${m.bottom}>${f.top}`);
            // 본문 끝까지 스크롤 가능한지
            const canScroll = main.scrollHeight <= main.clientHeight + 1 || getComputedStyle(main).overflowY !== 'visible';
            if (!canScroll) issues.push('main not scrollable');
        }
        return issues;
    });
}

async function run() {
    const browser = await chromium.launch({ channel: 'chrome', headless: true });
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: false });
    const page = await ctx.newPage();
    const consoleErrors: string[] = [];
    page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
    page.on('pageerror', (e) => consoleErrors.push(String(e)));

    // ---- S01
    start('S01');
    await page.goto(BASE);
    await shot(page, '390-00-entry');
    await page.getByRole('button', { name: '매칭 결과 보기' }).click();
    check('매칭 실패 화면', (await screenId(page)) === 'failed');
    check('실패 원인 문구', await page.getByText('현재 간병비에서는 지원자가 없어요.').isVisible());
    check('다음 경로 버튼', await page.getByRole('button', { name: '금액 조정하기' }).isVisible());
    await shot(page, '390-01-failed');
    await page.getByRole('button', { name: '금액 조정하기' }).click();
    check('금액 조정 화면', (await screenId(page)) === 'adjust');
    const adjustCta = page.locator('footer button');
    check('조정 CTA 문구', (await adjustCta.innerText()).trim() === '변경 금액 확인하기', await adjustCta.innerText());
    check('조정 화면에 재신청 버튼 없음', (await page.getByRole('button', { name: /재신청/ }).count()) === 0);
    await shot(page, '390-02-adjust-default');
    await adjustCta.click();
    check('최종 확인 화면', (await screenId(page)) === 'review');
    check('이동만으로 완료되지 않음', (await page.locator('[data-testid="completion"]').count()) === 0);
    await shot(page, '390-03-review-5');

    // ---- S02
    start('S02');
    await gotoAdjust(page);
    const exp: Record<number, [number, number, number]> = { 5: [94500, 113400, 3314820], 10: [99000, 118800, 3471240], 15: [103500, 124200, 3627660] };
    check('기본 선택 +5%', (await seg(page, 5).getAttribute('aria-pressed')) === 'true');
    for (const p of [5, 10, 15]) {
        await seg(page, p).click();
        await page.mouse.move(0, 0);
        await page.waitForTimeout(300);
        const bgs = await page.getByRole('group', { name: '인상률 선택' }).evaluate((g) =>
            [...g.querySelectorAll('button')].map((b) => getComputedStyle(b).backgroundColor));
        const activeIdx = [5, 10, 15].indexOf(p);
        check(`+${p}% 시각 선택 상태 일치`, bgs.every((bg, i) => (i === activeIdx) === (bg === 'rgb(242, 247, 255)')), bgs.join(','));
        const wd = await rowValues(page, 'adjust-weekday');
        const we = await rowValues(page, 'adjust-weekend');
        const total = await amountOf(page, 'adjust-total');
        const [ewd, ewe, et] = exp[p];
        check(`+${p}% 평일`, wd.after === ewd && wd.before === 90000, wd.text);
        check(`+${p}% 주말`, we.after === ewe && we.before === 108000, we.text);
        check(`+${p}% 증가액`, wd.delta === ewd - 90000 && we.delta === ewe - 108000, `${wd.delta}/${we.delta}`);
        check(`+${p}% 총금액`, total === et, String(total));
        check(`+${p}% 현재 선택 표시`, (await page.getByTestId('current-percent').innerText()).includes(`+${p}%`));
        check(`+${p}% 선택 시 추천 표시 유지`, (await seg(page, 10).innerText()).includes('추천'));
        if (p === 10) await shot(page, '390-04-adjust-10');
        if (p === 15) await shot(page, '390-05-adjust-15');
    }
    // 누적 적용 금지: 15 → 10 → 10
    await seg(page, 10).click(); await seg(page, 10).click();
    check('반복 선택해도 누적 적용 없음', (await rowValues(page, 'adjust-weekday')).after === 99000);
    await page.getByRole('button', { name: '초기화' }).click();
    check('초기화 → +5%', (await seg(page, 5).getAttribute('aria-pressed')) === 'true' && (await amountOf(page, 'adjust-total')) === 3314820);

    // ---- S03
    start('S03');
    await gotoAdjust(page);
    check('조정 단계 두 단가 표시', (await rowValues(page, 'adjust-weekday')).after === 94500 && (await rowValues(page, 'adjust-weekend')).after === 113400);
    check('조정 단계 총금액 표시', (await amountOf(page, 'adjust-total')) === 3314820);
    check('조정 단계에 상세 합산 없음(P03)', (await page.getByText('보험료').count()) === 0 && (await page.getByText('플랫폼 수수료').count()) === 0);
    await page.getByRole('button', { name: '변경 금액 확인하기' }).click();
    const d = {
        weekday: await amountOf(page, 'detail-weekday'), weekend: await amountOf(page, 'detail-weekend'),
        insurance: await amountOf(page, 'detail-insurance'), fee: await amountOf(page, 'detail-fee'), total: await amountOf(page, 'review-total'),
    };
    check('평일 2,079,000', d.weekday === 2079000, String(d.weekday));
    check('주말 907,200', d.weekend === 907200, String(d.weekend));
    check('보험료 30,000', d.insurance === 30000);
    check('수수료 298,620', d.fee === 298620, String(d.fee));
    check('총 3,314,820', d.total === 3314820, String(d.total));
    check('상세 합 = 총금액', d.weekday + d.weekend + d.insurance + d.fee === d.total);
    check('적용 비율 표시', (await page.getByTestId('review-percent').innerText()) === '+5%');
    check('간병비 합계 2,986,200', (await amountOf(page, 'detail-care-subtotal')) === 2986200);
    check('총금액 라벨(P05)', (await page.getByTestId('review-total').innerText()).includes('예상 결제 금액'));
    await page.locator('main').evaluate((m) => m.scrollTo(0, m.scrollHeight));
    await shot(page, '390-06-review-5-detail');

    // ---- S04
    start('S04');
    await gotoAdjust(page);
    await seg(page, 10).click();
    await page.getByRole('button', { name: '변경 금액 확인하기' }).click();
    const confirm = page.getByTestId('confirm-button');
    check('확정 버튼 금액', (await confirm.innerText()).trim() === '3,471,240원으로 재신청하기', await confirm.innerText());
    await shot(page, '390-07-review-10');
    // 중복 클릭: 비활성화 전에 연속 클릭 이벤트 발생
    await confirm.evaluate((b: HTMLButtonElement) => { b.click(); b.click(); b.click(); });
    await page.waitForTimeout(100);
    check('완료 문구', await page.getByText('재신청이 완료됐어요.').isVisible());
    check('완료 금액 = 확정 버튼 금액', (await amountOf(page, 'completion')) === 3471240);
    check('확정 버튼 비활성화', await confirm.isDisabled());
    check('완료 후 버튼 금액 유지', (await confirm.innerText()).includes('3,471,240'));
    await shot(page, '390-08-completed');
    await page.getByRole('button', { name: '닫기' }).click();
    check('중복 적용 없음(신청 금액)', (await amountOf(page, 'application-total')) === 3471240);
    check('신청 상태 재신청 완료', (await page.getByTestId('application-status').innerText()) === '재신청 완료');
    await shot(page, '390-09-entry-after-complete');

    // ---- S05
    start('S05');
    await gotoAdjust(page);
    await seg(page, 15).click();
    await page.getByRole('button', { name: '변경 금액 확인하기' }).click();
    const firstTotal = await amountOf(page, 'review-total');
    await page.getByRole('button', { name: '뒤로 가기' }).click();
    check('뒤로 → 금액 조정', (await screenId(page)) === 'adjust');
    check('+15% 유지', (await seg(page, 15).getAttribute('aria-pressed')) === 'true');
    check('조정 총금액 유지', (await amountOf(page, 'adjust-total')) === 3627660);
    await page.getByRole('button', { name: '변경 금액 확인하기' }).click();
    check('재검토 동일 금액', (await amountOf(page, 'review-total')) === firstTotal && firstTotal === 3627660);
    check('완료되지 않음', (await page.getByTestId('completion').count()) === 0);
    await page.getByRole('button', { name: '뒤로 가기' }).click();
    await page.getByRole('button', { name: '뒤로 가기' }).click();
    check('조정 → 뒤로 → 매칭 실패', (await screenId(page)) === 'failed');
    await page.getByRole('button', { name: '금액 조정하기' }).click();
    check('매칭 실패 경유 후에도 +15% 유지', (await seg(page, 15).getAttribute('aria-pressed')) === 'true');

    // ---- S06
    start('S06');
    await gotoAdjust(page);
    await seg(page, 15).click();
    await page.getByRole('button', { name: '닫기' }).click();
    check('헤더 X → 진입 전 화면', (await screenId(page)) === 'entry');
    check('신청 금액 3,158,400 유지', (await amountOf(page, 'application-total')) === 3158400);
    await page.getByRole('button', { name: '매칭 결과 보기' }).click();
    await page.getByRole('button', { name: '금액 조정하기' }).click();
    check('새 세션 +5%', (await seg(page, 5).getAttribute('aria-pressed')) === 'true');
    await seg(page, 10).click();
    await page.getByRole('button', { name: '변경 금액 확인하기' }).click();
    await page.getByRole('button', { name: '닫기' }).click();
    check('확인 화면에서 닫아도 3,158,400 유지', (await amountOf(page, 'application-total')) === 3158400);
    await page.getByRole('button', { name: '매칭 결과 보기' }).click();
    await page.locator('footer').getByRole('button', { name: '닫기' }).click();
    check('매칭 실패 하단 닫기 → 진입 전 화면', (await screenId(page)) === 'entry');

    // ---- S07
    start('S07');
    for (const vp of [{ width: 390, height: 844 }, { width: 360, height: 800 }]) {
        for (const zoom of [1, 2]) {
            await page.setViewportSize(vp);
            const tag = `${vp.width}${zoom > 1 ? '-text200' : ''}`;
            const applyZoom = async () => { if (zoom > 1) await page.addStyleTag({ content: 'html{font-size:200%}' }); };
            await page.goto(BASE); await applyZoom();
            await page.getByRole('button', { name: '매칭 결과 보기' }).click();
            check(`${tag} 실패 레이아웃`, (await layoutIssues(page)).length === 0, (await layoutIssues(page)).join('; '));
            await page.getByRole('button', { name: '금액 조정하기' }).click();
            // P01: 인상률 선택이 스크롤 없이 보이고, 금액 카드보다 위
            const sel = await page.getByTestId('rate-selector').boundingBox();
            const card = await page.getByTestId('adjust-weekday').boundingBox();
            if (zoom === 1) check(`${tag} 인상률 선택 첫 화면 노출`, !!sel && sel.y + sel.height <= vp.height - 80, JSON.stringify(sel));
            check(`${tag} 선택 UI가 금액보다 위`, !!sel && !!card && sel.y < card.y);
            const adjIssues = await layoutIssues(page);
            check(`${tag} 조정 레이아웃`, adjIssues.length === 0, adjIssues.join('; '));
            await shot(page, `${tag}-adjust`);
            await page.getByRole('button', { name: '변경 금액 확인하기' }).click();
            const revIssues = await layoutIssues(page);
            check(`${tag} 확인 레이아웃`, revIssues.length === 0, revIssues.join('; '));
            await shot(page, `${tag}-review-top`);
            await page.locator('main').evaluate((m) => m.scrollTo(0, m.scrollHeight));
            const lastVisible = await page.getByTestId('detail-fee').evaluate((el) => {
                const r = el.getBoundingClientRect(); const f = document.querySelector('footer')!.getBoundingClientRect();
                return r.bottom <= f.top;
            });
            check(`${tag} 스크롤 끝 상세가 버튼에 가려지지 않음`, lastVisible);
            await shot(page, `${tag}-review-bottom`);
        }
    }
    await page.setViewportSize({ width: 390, height: 844 });

    // ---- S08
    start('S08');
    await page.goto(BASE);
    const tabTo = async (pred: (label: string) => boolean, max = 15) => {
        for (let i = 0; i < max; i++) {
            await page.keyboard.press('Tab');
            const label = await page.evaluate(() => {
                const a = document.activeElement as HTMLElement | null;
                return a ? (a.getAttribute('aria-label') ?? a.innerText ?? '').trim() : '';
            });
            if (pred(label)) return label;
        }
        return null;
    };
    const focusVisible = () => page.evaluate(() => {
        const a = document.activeElement as HTMLElement; const s = getComputedStyle(a);
        return (s.boxShadow && s.boxShadow !== 'none') || (s.outlineStyle !== 'none' && s.outlineWidth !== '0px');
    });
    check('Tab → 매칭 결과 보기', !!(await tabTo((l) => l === '매칭 결과 보기')));
    await page.keyboard.press('Enter');
    check('Tab → 금액 조정하기', !!(await tabTo((l) => l === '금액 조정하기')));
    check('포커스 표시(실패 화면 버튼)', await focusVisible());
    await page.keyboard.press('Enter');
    check('Tab → +10% 추천', !!(await tabTo((l) => l.startsWith('+10%'))));
    check('포커스 표시(인상률)', await focusVisible());
    await page.keyboard.press('Space');
    check('키보드로 +10% 선택', (await seg(page, 10).getAttribute('aria-pressed')) === 'true');
    check('선택 상태 aria-pressed 제공', (await seg(page, 5).getAttribute('aria-pressed')) === 'false');
    check('그룹 이름 제공', (await page.getByRole('group', { name: '인상률 선택' }).count()) === 1);
    check('Tab → 변경 금액 확인하기', !!(await tabTo((l) => l === '변경 금액 확인하기')));
    await page.keyboard.press('Enter');
    check('확인 화면 도달', (await screenId(page)) === 'review');
    check('Tab → 뒤로 가기', !!(await tabTo((l) => l === '뒤로 가기')));
    check('포커스 표시(뒤로 가기)', await focusVisible());
    await page.keyboard.press('Enter');
    check('키보드 뒤로 → +10% 유지', (await screenId(page)) === 'adjust' && (await seg(page, 10).getAttribute('aria-pressed')) === 'true');
    await tabTo((l) => l === '변경 금액 확인하기');
    await page.keyboard.press('Enter');
    check('Tab → 확정 버튼', !!(await tabTo((l) => l.endsWith('재신청하기'))));
    check('포커스 표시(확정)', await focusVisible());
    await shot(page, '390-10-keyboard-focus-confirm');
    await page.keyboard.press('Enter');
    check('키보드 확정 완료', await page.getByText('재신청이 완료됐어요.').isVisible());
    check('완료 안내 role=status', (await page.getByRole('status').count()) === 1);

    start('console');
    check('콘솔 오류 없음', consoleErrors.length === 0, consoleErrors.join(' | '));

    await browser.close();
    fs.writeFileSync(path.join(OUT, 'e2e-result.json'), JSON.stringify(results, null, 2));
    for (const r of results) {
        console.log(`${r.pass ? 'PASS' : 'FAIL'} ${r.id}`);
        for (const c of r.checks.filter((c) => !c.pass)) console.log(`   ✗ ${c.name} ${c.detail ?? ''}`);
    }
    process.exit(results.every((r) => r.pass) ? 0 : 1);
}

run().catch((e) => { console.error(e); process.exit(2); });
