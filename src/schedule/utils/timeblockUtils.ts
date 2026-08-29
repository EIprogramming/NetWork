

/**
 * Get aria label of a specific Timeblock
 * @param col - the column number of the Timeblock component
 * @param row - the row number of the Timeblock component
 * @returns [hour:minutes] [am/pm], [availability] on [day], (e.g. 9:00 am, Available on Monday, January 2)
 */
export function getTimeblockLabel(timeblocks: any[][], days: string[], times: string[], col: number, row: number) {
    const availability = timeblocks[col][row].name;
    const day = days[col];

    // gets the hour (only) from the time array
    const hour = times[Math.floor(row/4)].slice(0,1);
    const mins = 15*(row%4);

    // gets am/pm out of the times array
    const morningOrAfternoon = (times[Math.floor(row/4)]).slice(-3);

    // add an extra zero to the minutes when it is zero, mins === 0 => formattedMins = 00
    const formattedMins = mins.toString() + (mins === 0 ? '0' : '');

    return `${hour}:${formattedMins} ${morningOrAfternoon}, ${availability} on ${day}`;
}
