import { useEffect } from "react";
import type State from "./schedule/classes/state";

/**
 * Edits an array in a rectangular section between two corners (firstElement) and (lastElement)
 * @param firstElement - coordinates of the first corner of the array in [col, row] format
 * @param lastElement - coordinates of the second corner of the array in [col, row] format
 * @param array - the array to be *modified*
 * @param value - the value to fill this rectangle with
 */
export function editArrayRegion(
    firstElement: Array<number>, lastElement: Array<number>,
    array: Array<Array<State>>, value: State, valueModified: State, defaultValue: State) {
    
    // default behaviour if one of the elements is 'outside' the schedule
    if (firstElement[0] === -1 || lastElement[0] === -1) return;

    let [coli, rowi] = firstElement;
    let [colf, rowf] = lastElement;

    // swap final / initial values for row if the final is greater than initial
    if (rowf < rowi) {[rowi, rowf] = [rowf, rowi]}
    if (colf < coli) {[coli, colf] = [colf, coli]}

    // go through each element on the rectangle and modify it to the desired value
    for (let i = coli; i <= colf; i++) {
        for (let j = rowi; j <= rowf; j++) {
            let state: State = array[i][j];
            const isDefaultValue = value.name === defaultValue.name;
            const isValueModified = state.name === valueModified.name;
            const isApplyingDefaultValue = value.name === defaultValue.name && value.name === valueModified.name;

            if (!isDefaultValue || isValueModified || isApplyingDefaultValue) {
                array[i][j] = value;
            }
        }
    }
}

/**
 * Initializes a 2D array filled with a default value.
 * @param columns - The number of columns in the array.
 * @param rows - The number of rows in the array.
 * @param value - the value to be filled, default is false
 * @returns 2D array filled with a default value..
 */
export function initialize2DArray(columns: number, rows: number, value: any="") {
    return [...Array(columns)].map(_element => Array(rows).fill(value));
}

/**
 * Convert a 24 hour integer to a formatted 12 hour string 
 * @param hour - the exact integer hour in 24 hour format
 * @returns the time in 12 hour format (e.g. 12:00 pm)
 */

export function getHour(hour: number) {
    let h = hour % 24;

    // if hour is less than 12 it is morning, else it is pm
    let morningOrAfternoon: string = (h < 12) ? "am" : "pm";

    // return the hour corresponding to the am or pm 
    return `${(h % 12) ? (h % 12) : 12}:00 ${morningOrAfternoon}`;
}

/**
 * Generate a range of times in 12 hour format (e.g. 12:00 pm) between the starting hour (inclusive) and ending hour (inclusive)
 * @param startHour - the beginning hour of the time range, in 24 hour integer form
 * @param endHour - the final hour of the time range, in 24 hour integer form
 * @returns an array of 12 hour formatted times between the starting hour and final hour
 */
export function getTimeRange(startHour: number, endHour: number) {
    let timeRange: Array<string> = Array(endHour - startHour + 1);

    for (let i = 0; i <= endHour - startHour; i++) {
        timeRange[i] = getHour(startHour + i);
    }

    return timeRange;
}

export function useOutsideAlerter(ref: React.RefObject<HTMLDivElement | null>, callback: Function, deps: Array<any>) {
    useEffect(() => {
        // Function for click event
        function handleOutsideClick(event: MouseEvent) {
        if (ref.current && event.target instanceof Node && !ref.current.contains(event.target)) {
            callback(event);
            }
        }

        // Adding click event listener
        document.addEventListener("click", handleOutsideClick);
        return () => document.removeEventListener("click", handleOutsideClick);
    }, [ref, deps]);
}
