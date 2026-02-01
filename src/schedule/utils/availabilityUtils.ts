import State, { availableState, unavailableState, unsureState } from "../classes/state";

function getStatusName(status: number) {
    switch (status) {
        case 0:
            return availableState;
        case 1:
            return unsureState;
        case 2:
            return unavailableState;
        default:
            return unavailableState;
    }
}

export function unflattenAvailability(availability: number[][]) {
    if (!availability) return; // TODO: fix user not existing before login
    return availability.map(row => {
        return row.map(status => {
            return getStatusName(status);
        });
    });
}

export function getStatusNumber(status: State, statusMap: State[]) {
    if (!statusMap) return -2;
    let index = null;
    statusMap.forEach((state, i) => {
        if (state.name === status.name) {
            index = i;
        }
    });
    if (index === null) { return -1; }
    else { return index; }
}

export function flattenAvailability(availability: State[][], statusMap: State[]): number[][] {
    return availability.map(row => {
        return row.map(status => {
            return getStatusNumber(status, statusMap);
        });
    });
}
