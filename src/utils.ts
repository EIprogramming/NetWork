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
