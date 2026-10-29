/**
 * 개발용: 공통 금액 컴포넌트의 강조 역할 렌더링 확인 (patterns.md ‘금액 강조 역할’).
 * 금액은 표시 확인용 임의 값이며 환불 정책·예시 금액이 아니다.
 */
import { AmountSummary } from '@/design-system/AmountSummary';
import { StatusBadge } from '@/design-system/StatusBadge';

export const metadata = { title: '금액 강조 역할 확인 (개발용)' };

export default function AmountRolesPage() {
    return (
        <main className="mx-auto flex max-w-[740px] flex-col gap-4 px-4 py-6">
            <h1 className="text-xl font-bold text-gray-900">금액 강조 역할 확인</h1>
            <p className="text-sm text-gray-600">표시 확인용 임의 값입니다. 환불 정책이나 실제 금액이 아닙니다.</p>
            <AmountSummary label="환불 예정액" amount={10000} emphasis="accent" testId="role-accent" />
            <div className="flex gap-2">
                <StatusBadge label="위약금 발생" tone="negative" testId="badge-negative" />
                <StatusBadge label="위약금 없음" tone="neutral" testId="badge-neutral" />
            </div>
            <AmountSummary label="위약금" amount={1000} emphasis="negative" testId="role-negative" />
            <AmountSummary label="위약금" amount={0} emphasis="negative" noneLabel="없음" testId="role-none" />
        </main>
    );
}
