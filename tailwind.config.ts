import type { Config } from 'tailwindcss';

// design-tokens.ts의 Tailwind 클래스 문자열을 스캔해야 하므로 .ts도 포함한다.
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: [],
};
export default config;
