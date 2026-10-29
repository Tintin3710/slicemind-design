/**
 * 간병비 조정 흐름의 로컬 상태 (P07, R04~R06, A06).
 * 서버·결제 연동 없음. 확정 전에는 application(실제 신청 금액)을 바꾸지 않는다.
 */
import { calculateCarePrice, priceConfig, type IncreasePercent } from './calculate';

export type Screen = 'entry' | 'failed' | 'adjust' | 'review';

export type FlowState = {
    screen: Screen;
    /** 신청에 실제 적용된 값. CONFIRM에서만 바뀐다. */
    application: { increasePercent: number; total: number; status: 'matchFailed' | 'reapplied' };
    /** 저장 전 초안. CLOSE에서 버린다. */
    draft: { increasePercent: IncreasePercent } | null;
    completed: { increasePercent: number; total: number } | null;
};

export type FlowAction =
    | { type: 'OPEN_FAILED' }
    | { type: 'START_ADJUST' }
    | { type: 'SELECT'; percent: IncreasePercent }
    | { type: 'RESET' }
    | { type: 'TO_REVIEW' }
    | { type: 'BACK' }
    | { type: 'CLOSE' }
    | { type: 'CONFIRM' };

export const initialFlowState: FlowState = {
    screen: 'entry',
    application: { increasePercent: 0, total: priceConfig.originalTotal, status: 'matchFailed' },
    draft: null,
    completed: null,
};

export function flowReducer(state: FlowState, action: FlowAction): FlowState {
    switch (action.type) {
        case 'OPEN_FAILED':
            if (state.application.status !== 'matchFailed') return state;
            return { ...state, screen: 'failed', draft: null };
        case 'START_ADJUST':
            return {
                ...state,
                screen: 'adjust',
                draft: state.draft ?? { increasePercent: priceConfig.defaultIncreasePercent },
            };
        case 'SELECT':
            if (state.screen !== 'adjust') return state;
            return { ...state, draft: { increasePercent: action.percent } };
        case 'RESET':
            if (state.screen !== 'adjust') return state;
            return { ...state, draft: { increasePercent: priceConfig.resetIncreasePercent } };
        case 'TO_REVIEW':
            if (state.screen !== 'adjust' || !state.draft) return state;
            return { ...state, screen: 'review' };
        case 'BACK':
            if (state.completed) return state; // 확정 후에는 되돌아가 재확정하지 않는다 (A06)
            if (state.screen === 'review') return { ...state, screen: 'adjust' };
            if (state.screen === 'adjust') return { ...state, screen: 'failed' };
            return state;
        case 'CLOSE':
            // 초안을 버리고 진입 전 화면으로. application은 그대로 둔다.
            return { ...state, screen: 'entry', draft: null };
        case 'CONFIRM': {
            if (state.screen !== 'review' || !state.draft || state.completed) return state;
            const { total, increasePercent } = calculateCarePrice(state.draft.increasePercent);
            return {
                ...state,
                application: { increasePercent, total, status: 'reapplied' },
                completed: { increasePercent, total },
            };
        }
    }
}
