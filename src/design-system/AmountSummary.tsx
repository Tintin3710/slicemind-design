/** 계약 초안: React 컴포넌트 렌더링·토큰 연결은 아직 구현하지 않았습니다. */
export type AmountSummaryProps = {
  label: string;
  amount: number; // KRW 정수. 제품 정책의 계산 결과를 전달받습니다.
  emphasis?: 'default' | 'accent' | 'critical';
};
