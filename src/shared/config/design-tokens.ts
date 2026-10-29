/**
 * 출처: Z21-ZeroToOne/dongdong-client @ 429894db39871cbc780a9b81f9f57337e38e3728
 *       src/shared/config/design-tokens.ts (읽기 전용 참조)
 *
 * 이 프로토타입에서 쓰는 항목만 값 변경 없이 옮겼다. 원본 저장소는 수정하지 않는다.
 * 새 값은 여기에 추가하지 않고 src/design-system/token-bridge.ts에 분리한다.
 */
export const designTokens = {
    typography: {
        h2: 'text-xl font-bold',
        h3: 'text-lg font-semibold',
        body: 'text-base font-normal',
        bodySemibold: 'text-base font-semibold',
        bodyBold: 'text-base font-bold',
        smallMedium: 'text-sm font-medium',
        '15medium': 'text-[15px] font-medium',
        '15semibold': 'text-[15px] font-semibold',
        '13': 'text-[13px] font-normal',
        '17semibold': 'text-[17px] font-semibold',
    },

    colors: {
        primary: 'text-[#0066FF]',
        primaryBg: 'bg-[#0066FF]',
        primaryBgLight: 'bg-[#F2F7FF]',
        primaryBorder: 'border-[#0066FF]',
        textPrimary: 'text-gray-900',
        textSecondary: 'text-gray-600',
        textInactive: 'text-gray-400',
        grayBorder: 'border-[#E5E7EB]',
    },

    components: {
        header: {
            topnav: 'h-[100px] bg-white border-b border-gray-200 flex items-end justify-center relative px-4 pb-2',
            backButton: 'absolute left-2 bottom-2 p-1',
        },

        button: {
            primary: 'w-full h-[48px] rounded-xl text-base font-semibold bg-[#0066FF] text-white hover:bg-[#0052cc] disabled:bg-gray-200 disabled:text-gray-400 transition-colors',
            secondary: 'w-full h-[48px] rounded-xl text-base font-semibold border border-[#0066FF] text-[#0066FF] bg-white hover:bg-[#F2F7FF] transition-colors',
            tertiary: 'w-full h-[48px] rounded-xl text-base font-semibold border border-[#e8e9ea] text-gray-700 hover:bg-gray-50 transition-colors',
        },

        tag: {
            solid: 'inline-flex items-center justify-center text-sm font-medium px-2 py-1.5 rounded-lg h-8 bg-blue-100 text-[#0066FF]',
        },

        segmented: {
            container: 'w-full flex gap-0',
            button: 'flex-1 h-full flex items-center justify-center transition-all duration-200',
            buttonActive: 'bg-[#f2f7ff] text-[#0066FF] font-semibold border-[0.5px] border-[#0066FF]',
            buttonInactive: 'bg-white text-gray-400 font-medium border border-[#DDDDDD]',
            buttonDisabled: 'text-gray-300 cursor-not-allowed',
            buttonHover: 'hover:bg-[#F9F9F9]',
        },

        layout: {
            formGroup: 'flex flex-col gap-3',
            formGroupLarge: 'flex flex-col gap-5',
            formGroupXL: 'flex flex-col gap-6',
        },

        container: {
            page: 'min-h-screen bg-gray-100',
            content: 'relative w-full min-w-[340px] max-w-[740px] mx-auto bg-white flex flex-col min-h-screen',
            main: 'flex-1 overflow-y-auto px-4 min-[400px]:px-6 md:px-8 py-6',
        },
    },
} as const;

export function cn(...classes: (string | undefined | null | false)[]): string {
    return classes.filter(Boolean).join(' ');
}
