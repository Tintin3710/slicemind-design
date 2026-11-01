/**
 * 출처: Z21-ZeroToOne/dongdong-client @ 429894db39871cbc780a9b81f9f57337e38e3728
 *       src/shared/ui/SegmentedRow.tsx (읽기 전용 참조)
 *
 * 시각 클래스는 원본과 같다. 인상률 선택에 필요한 부분만 추가했다(원본 저장소 미수정).
 *  - type="button": 폼 안에서 의도치 않은 submit 방지
 *  - role="group" + aria-label, 각 버튼 aria-pressed: 선택 상태를 보조기기에 전달 (S08)
 *  - items[].badge: '추천' 같은 고정 표시를 선택 상태와 별도로 표시 (A07)
 *  - focus-visible 링: 키보드 포커스 식별 (S08)
 */
import React from "react";
import { designTokens, cn } from "@/shared/config/design-tokens";

export const SEGMENTED_ROW_VERSION = 'SegmentedRow@1.0.0-adapted';

type SegmentedRowProps<T extends string> = {
    items: Array<{ key: T; label: string; badge?: string; ariaLabel?: string }>;
    value: T | null;
    onChange: (v: T) => void;
    disabled?: boolean;
    size?: "default" | "small";
    ariaLabel?: string;
};

export function SegmentedRow<T extends string>({
    items,
    value,
    onChange,
    disabled,
    size = "default",
    ariaLabel,
}: SegmentedRowProps<T>) {
    const heightClass = size === "small" ? "h-[32px]" : "h-12";
    const fontSizeClass = size === "small" ? "text-sm" : "text-lg";

    return (
        <div role="group" aria-label={ariaLabel} className={cn(designTokens.components.segmented.container, heightClass)}>
            {items.map((it, idx) => {
                const isActive = it.key === value;
                const isFirst = idx === 0;
                const isLast = idx === items.length - 1;

                return (
                    <button
                        key={it.key}
                        type="button"
                        disabled={disabled}
                        aria-pressed={isActive}
                        aria-label={it.ariaLabel}
                        onClick={() => onChange(it.key)}
                        className={cn(
                            designTokens.components.segmented.button,
                            fontSizeClass,
                            'relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066FF] focus-visible:ring-offset-2 focus-visible:z-10',
                            isActive ? designTokens.components.segmented.buttonActive : designTokens.components.segmented.buttonInactive,
                            disabled && designTokens.components.segmented.buttonDisabled,
                            !disabled && !isActive && designTokens.components.segmented.buttonHover,
                            isFirst && 'rounded-l-xl',
                            isLast && 'rounded-r-xl',
                            !isLast && 'border-r-[0.5px] border-r-[#0066FF]'
                        )}
                    >
                        {it.badge && (
                            <span
                                aria-hidden="true"
                                className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#0066FF] px-1.5 py-0.5 text-[11px] font-semibold leading-none text-white"
                            >
                                {it.badge}
                            </span>
                        )}
                        {it.label}
                    </button>
                );
            })}
        </div>
    );
}
