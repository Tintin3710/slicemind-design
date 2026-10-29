import type { ReactNode } from 'react';
import { designTokens, cn } from '@/shared/config/design-tokens';
import { semantic } from '@/design-system/token-bridge';

type Props = {
    title: string;
    onBack?: () => void;
    onClose?: () => void;
    footer?: ReactNode;
    children: ReactNode;
    screenId: string;
};

const iconButton = cn('flex h-10 w-10 items-center justify-center rounded-lg', semantic.text.primary, semantic.action.focusRing);

/** 헤더(실제 topnav 토큰) + 스크롤 본문 + 하단 고정 영역. 하단 영역은 본문 위에 겹치지 않는다. */
export function ScreenLayout({ title, onBack, onClose, footer, children, screenId }: Props) {
    return (
        <div className={designTokens.components.container.page}>
            <div
                data-screen={screenId}
                className={cn(designTokens.components.container.content, 'h-[100dvh] min-h-0 overflow-hidden')}
            >
                <header className={cn(designTokens.components.header.topnav, 'shrink-0')}>
                    {onBack && (
                        <button type="button" aria-label="뒤로 가기" onClick={onBack} className={cn(designTokens.components.header.backButton, iconButton)}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    )}
                    <h1 className={cn(designTokens.typography['17semibold'], 'leading-10')}>{title}</h1>
                    {onClose && (
                        <button type="button" aria-label="닫기" onClick={onClose} className={cn('absolute right-2 bottom-2 p-1', iconButton)}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </button>
                    )}
                </header>
                <main key={screenId} className={designTokens.components.container.main}>
                    {children}
                </main>
                {footer && (
                    <footer className="shrink-0 border-t border-gray-200 bg-white px-4 min-[400px]:px-6 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] flex flex-col gap-2">
                        {footer}
                    </footer>
                )}
            </div>
        </div>
    );
}
