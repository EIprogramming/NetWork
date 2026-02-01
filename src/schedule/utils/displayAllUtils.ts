import State, { availableState, unavailableState } from "../classes/state";


export function hexToNum(hex: string) {
        return Number("0x" + hex);
    }

export function sumToLimits(sum: number, ceil: number, floor: number) {
    if (sum > ceil) {
        return ceil;
    } else if (sum < floor) {
        return floor;
    } else {
        return sum;
    }
}

export function getValueStep(min: number, max: number, maxNumSteps: number) {
    if (max - min > maxNumSteps) {
        return (max - min) / maxNumSteps;
    } else {
        return 1;
    }
}

export function getGradientStateColor(stateToDisplay: State, gradientSize: number) {
    const defaultColorHex = stateToDisplay.color.slice(1);
    const RGB = [defaultColorHex.slice(0,2), defaultColorHex.slice(2,4), defaultColorHex.slice(4,6)];

    let gradientStates = [];
    // todo: rewrite this algorithm or add preset gradients since you are using preset colours
    // might just do a preset gradient, algorithmic colour is slow
    for (let i = 0; i < gradientSize; i++) {
        const numRGB = RGB.map(rgb => {return hexToNum(rgb)})
        const scaleFactor = 50*(-i); // scale by -10, -5, 0, +5, +10 rgb

        // add the scale factor to original colour with limits
        const maxRGB = Math.max(...numRGB);

        const newRGB = numRGB.map(rgb => {
            if (rgb == maxRGB) return sumToLimits(Math.ceil(scaleFactor/2) + rgb, 255, 0);
            return sumToLimits(scaleFactor + rgb, 255, 0);
        });

        const newHexRGB = newRGB.map(rgb => {
            if (rgb < 16) return "0" + rgb.toString(16)
            return rgb.toString(16)
        });

        const newColor = "#" + newHexRGB.join('');
        const newGradientState = new State(stateToDisplay.name, newColor, false);
        gradientStates.push(newGradientState);
    }
    
    return gradientStates;
}

export function getAllAvailabilitiesToDisplay(sumOfAllAvailabilities: number[][]) {
    const stateToDisplay = availableState;

    const sumOfAllAvailabilities1D = sumOfAllAvailabilities.flat();
    const minValue = Math.min(...sumOfAllAvailabilities1D);
    const maxValue = Math.max(...sumOfAllAvailabilities1D);

    const gradientSize = 5;
    const gradientStates = getGradientStateColor(stateToDisplay, gradientSize);

    const valueStep = getValueStep(minValue, maxValue, gradientSize);

    let redUnavailableState = {...unavailableState};
    redUnavailableState.color = "#ffe0e0";

    const availabilitiesToDisplay = sumOfAllAvailabilities.map((row) => {
        return row.map(value => {
            if (value == 0) return redUnavailableState;
            if (value == minValue) return gradientStates[0];
            if (value == maxValue) return gradientStates[gradientSize - 1];

            const intermediateIndex = Math.floor(value/valueStep); // todo: work on this algorithm
            return gradientStates[intermediateIndex];
        });
    });

    return availabilitiesToDisplay;
}