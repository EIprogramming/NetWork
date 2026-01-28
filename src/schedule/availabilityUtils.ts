import State, { availableState, unavailableState, unsureState } from "./classes/state";

function getStatusName(status: number) {
        switch (status) {
            case 0:
                return unavailableState;
            case 1:
                return availableState;
            case 2:
                return unsureState;
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

export function getStatusNumber(status: State) {
    switch (status.name) {
        case "Unavailable":
            return 0;
        case "Available":
            return 1;
        case "Maybe":
            return 2;
        default:
            return -1;
    }
}

export function flattenAvailability(availability: State[][]): number[][] {
    return availability.map(row => {
        return row.map(status => {
            return getStatusNumber(status);
        });
    });
}
