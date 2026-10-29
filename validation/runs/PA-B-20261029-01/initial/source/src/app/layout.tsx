import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = { title: '간병비 조정 프로토타입' };
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ko">
            <body>{children}</body>
        </html>
    );
}
