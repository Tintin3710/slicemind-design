/** 계약 초안: React 컴포넌트 렌더링·토큰 연결은 아직 구현하지 않았습니다. */
export type PriceChangeRowProps = {
  label: string;
  before: number; // KRW 정수
  after: number; // KRW 정수. 인상률 계산은 이 컴포넌트에서 수행하지 않습니다.
  unitLabel?: string; // 예: 원/일
};
