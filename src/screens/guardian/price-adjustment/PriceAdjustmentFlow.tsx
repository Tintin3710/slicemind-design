'use client';

import { useReducer } from 'react';
import { calculateCarePrice } from '@/features/price-adjustment/calculate';
import { flowReducer, initialFlowState } from '@/features/price-adjustment/flow-state';
import { AdjustScreen, EntryScreen, MatchingFailedScreen, ReviewScreen } from './screens';

const original = calculateCarePrice(0);

export function PriceAdjustmentFlow() {
    const [state, dispatch] = useReducer(flowReducer, initialFlowState);
    // P06: 조정·확인·버튼 금액이 모두 이 한 번의 계산 결과를 쓴다.
    const price = state.draft ? calculateCarePrice(state.draft.increasePercent) : null;
    const close = () => dispatch({ type: 'CLOSE' });
    const back = () => dispatch({ type: 'BACK' });

    switch (state.screen) {
        case 'entry':
            return (
                <EntryScreen
                    applicationTotal={state.application.total}
                    status={state.application.status}
                    onOpen={() => dispatch({ type: 'OPEN_FAILED' })}
                />
            );
        case 'failed':
            return <MatchingFailedScreen onAdjust={() => dispatch({ type: 'START_ADJUST' })} onClose={close} />;
        case 'adjust':
            return (
                <AdjustScreen
                    percent={state.draft!.increasePercent}
                    price={price!}
                    original={original}
                    onSelect={(percent) => dispatch({ type: 'SELECT', percent })}
                    onReset={() => dispatch({ type: 'RESET' })}
                    onNext={() => dispatch({ type: 'TO_REVIEW' })}
                    onBack={back}
                    onClose={close}
                />
            );
        case 'review':
            return (
                <ReviewScreen
                    price={price!}
                    completed={state.completed}
                    onConfirm={() => dispatch({ type: 'CONFIRM' })}
                    onBack={back}
                    onClose={close}
                />
            );
    }
}
