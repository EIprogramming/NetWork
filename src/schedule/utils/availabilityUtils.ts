import State, { unavailableState } from "../classes/state";

export function isSameState(state1: State, state2: State) {
    return (state1.name === state2.name &&
        state1.color === state2.color
    );
}

export function removedState(state: State, states: State[]) {
    return states.filter(state_ => (!isSameState(state, state_)));
}

export function appendedState(state: State, states: State[]) {
    return [...states, state];
}

export function insertStateInOrder(state: State, states: State[], order: State[]) {
    const guide = appendedState(state, states);

    // use the original order of states as a guide
    // for the order of newStates,
    // which allows inserts while keeping consistent order
    const newStates = order.flatMap(orderElement => {
        const isOrderElementInStates = guide.some(guideElement => {
            if (guideElement.name === orderElement.name) {
                return true;
            } else {
                return false;
            }
        });

        return isOrderElementInStates ? ([orderElement]) : []
    });

    return newStates;
}

export function isStateinStates(stateToCheck: State, states: State[]) {
    return states.some(state => isSameState(state, stateToCheck));
}


function getStatusName(status: number, reverseStatusMap: Map<number, State>) {
    const name = reverseStatusMap.get(status);
    if (name === null || name === undefined) {
        return unavailableState;
        //return errorState; - debug
    }
    return name;
}

export function unflattenAvailability(availability: number[][], reverseStatusMap: Map<number, State>) {
    if (!availability) return; // TODO: fix user not existing before login
    return availability.map(row => {
        return row.map(status => {
            return getStatusName(status, reverseStatusMap);
        });
    });
}

export function getStatusNumber(status: State, statusMap: Map<string, number>) {
    const index = statusMap.get(status.name);

    if (index === null || index === undefined) return -1;
    return index;
}

export function flattenAvailability(availability: State[][], statusMap: Map<string, number>): number[][] {
    return availability.map(row => {
        return row.map(status => {
            return getStatusNumber(status, statusMap);
        });
    });
}
