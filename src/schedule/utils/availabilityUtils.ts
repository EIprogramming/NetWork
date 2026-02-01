import State, { errorState } from "../classes/state";

function getStatusName(status: number, reverseStatusMap: Map<number, State>) {
    const name = reverseStatusMap.get(status);
    if (name === null || name === undefined) {
        console.log(status, "ERROR!", reverseStatusMap);
        return errorState;
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
