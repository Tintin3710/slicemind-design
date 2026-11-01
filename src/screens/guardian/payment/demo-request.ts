/**
 * 결제 화면용 가상 데모 신청 정보. fixture(care-price.json)에 없는 값이며 실사용자 정보가 아니다.
 * 일정은 fixture의 평일 22일·주말·공휴일 8일과 맞도록 고른 날짜다(2026년 11월 공휴일 없음 가정).
 */
export const demoRequest = {
    patient: { name: '데모 환자', age: 78, sex: '여' },
    care: { type: '병원 상주 간병', severity: '중등도' },
    schedule: { start: '2026.11.02(월)', end: '2026.12.01(화)', totalDays: 30 },
} as const;
