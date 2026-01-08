import { useRef, useState } from 'react'
import Timeblock from './Timeblock.tsx'
import Selector from './Selector.tsx'
import State from './state.ts';
import './Schedule.css'


/**
 * Convert a 24 hour integer to a formatted 12 hour string 
 * @param hour - the exact integer hour in 24 hour format
 * @returns the time in 12 hour format (e.g. 12:00 pm)
 */

function getHour(hour: number) {
    let h = hour % 24;

    // if hour is less than 12 it is morning, else it is pm
    let morningOrAfternoon: string = (h < 12) ? "am" : "pm";

    // return the hour corresponding to the am or pm 
    return `${(h % 12) ? (h % 12) : 12}:00 ${morningOrAfternoon}`;
}

/**
 * Edits an array in a rectangular section between two corners (firstElement) and (lastElement)
 * @param firstElement - coordinates of the first corner of the array in [col, row] format
 * @param lastElement - coordinates of the second corner of the array in [col, row] format
 * @param array - the array to be *modified*
 * @param value - the value to fill this rectangle with
 */
function editArrayRegion(
    firstElement: Array<number>, lastElement: Array<number>,
    array: Array<Array<State>>, value: State) {
    
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
            array[i][j] = value;
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
function initialize2DArray(columns: number, rows: number, value: any="") {
    return [...Array(columns)].map(_element => Array(rows).fill(value));
}

/**
 * Generate a range of times in 12 hour format (e.g. 12:00 pm) between the starting hour (inclusive) and ending hour (inclusive)
 * @param startHour - the beginning hour of the time range, in 24 hour integer form
 * @param endHour - the final hour of the time range, in 24 hour integer form
 * @returns an array of 12 hour formatted times between the starting hour and final hour
 */
function getTimeRange(startHour: number, endHour: number) {
    let timeRange: Array<string> = Array(endHour - startHour + 1);

    for (let i = 0; i <= endHour - startHour; i++) {
        timeRange[i] = getHour(startHour + i);
    }

    return timeRange;
}

function Schedule() {
    // initialize the days and times (in 12 hour format) that the schedule spans
    // TODO: add feature to specify these by the user
    const [days, _setDays] = useState(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]);
    const [times, _setTimes] = useState(getTimeRange(9, 24));

    // an array of the possible states that a Timeblock may take
    // TODO: add feature to specify these by the user
    const unavailableState = new State("Unavailable", "rgba(255, 200, 200, 1)", true);
    const unsureState = new State("Unsure", "rgba(255, 255, 200, 1)", true);
    const availableState = new State("Available", "rgba(200, 255, 200, 1)", true);

    const [activeStates, setActiveStates] = useState([unavailableState, unsureState, availableState]);
    const [activeState, setActiveState] = useState(activeStates[1]); // current state being applied
    const defaultState = useRef(activeStates[0]); // state to apply if deselecting current state

    // isApplyingValue keeps track of whether activeState is being applied (true) or defaultState (false)
    const [isApplyingValue, setIsApplyingValue] = useState(false);

    // the schedule array that contains the activeState of each individual Timeblock element
    // each column corresponds to a day, and each row to a 15 minute segment of time (4 rows per hour)
    const [activeTimeblocks, setActiveTimeblocks] = useState(initialize2DArray(days.length, 4*times.length, unavailableState));
    
    // a second array that keeps track of the previous schedule array,
    // so that adding rectangular selections during editing may be reverted
    const [oldActiveTimeblocks, setOldActiveTimeblocks] = useState(initialize2DArray(days.length, 4*times.length, unavailableState));

    // the first and last element in a rectangular selection, initialized to [-1, -1] to establish type
    const [firstElement, setFirstElement] = useState([-1, -1]);
    const [lastElement, setLastElement] = useState([-1, -1]);

    /**
     * Get exact day and time of a specific Timeblock
     * @param col - the column number of the Timeblock component
     * @param row - the row number of the Timeblock component
     * @returns Day, hour:minutes (e.g. Monday, 9:00)
     */
    function getTimeblockTime(col: number, row: number) {
        const day = days[col];
        const hour = times[Math.floor(row/4)].slice(0,1);
        const mins = 15*(row%4);

        return `${day}, ${hour}:${mins}`;
    }

    /**
     * Applies a rectangular selection (including one element) to the schedule, between firstElement and lastElement
     * and modifying the selection to be of activeState.
     * Called on a Timeblock component that is either the first element or last element in the selection.
     * @param col - the column number of the Timeblock component
     * @param row - the row number of the Timeblock component
     * @param isFirstElement - whether the Timeblock component is the first element selected (see: `Timeblock handleMouseDown()`)
     */
    const handleTimeblockSelected = (col: number, row: number, isFirstElement: boolean) => {
        // initialize 'next' values that may be modified within the function without waiting for setFoo() from React useState
        let nextIsApplyingValue = isApplyingValue;
        let nextPrevActiveTimeblocks = oldActiveTimeblocks; // TODO: rename oldActive to prevActive...
        let nextFirstElement = firstElement;
        let nextLastElement = lastElement;

        if (isFirstElement) {
            // if this is the first element selected, determine if we are
            // toggling elements to become active or inactive
            nextIsApplyingValue = !(activeTimeblocks[col][row] == activeState);
            setIsApplyingValue(nextIsApplyingValue)

            // update the current 'first element' that was selected
            nextFirstElement = [col, row];
            setFirstElement(nextFirstElement);

            // save a copy of the old schedule in case the selection size changes
            nextPrevActiveTimeblocks = activeTimeblocks;
            setOldActiveTimeblocks(activeTimeblocks);
        }

        // update the current 'last element' that was selected
        nextLastElement = [col, row];
        setLastElement(nextLastElement);

        // copy the old schedule to make the new schedule
        let nextActiveTimeBlocks: Array<Array<State>> = structuredClone(nextPrevActiveTimeblocks);
        let state: State;

        // apply changes to old schedule and then make them into the new schedule
        if (nextIsApplyingValue) { state = activeState; }
        else { state = defaultState.current }
        editArrayRegion(nextFirstElement, nextLastElement, nextActiveTimeBlocks, state);
        setActiveTimeblocks(nextActiveTimeBlocks);
    }
    
    function handleMouseDown(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        if (e.buttons % 2) {
            getTimeblockTime(0, 1);
        }
    }

    function handleMouseUp(_e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        setFirstElement([-1, -1]);
        setLastElement([-1, -1]);
    }

    /**
     * Generates React components based on the schedule array of the form:\n
     * <div className="schedule-column">
     * <Timeblock />
     * ...
     * <Timeblock />
     * </div>
     * ...
     * <div className="schedule-column">...</div>
     * @param schedule - the schedule array associated to the React components
     * @param days - the days over which the schedule spans
     * @param times - the hours over which the schedule span
     * @returns the schedule in React component format
     */
    function createSchedule(schedule: Array<Array<State>>, days: Array<string>, times: Array<string>) {
        /* creates a schedule based on a two-dimensional array
            of the form:
            <div className="schedule-column">
            <Timeblock />
            ... 
            <Timeblock />
            </div>
            ...
            <div className="schedule-column">...</div>
        */

        return (
            <>
            <div className="schedule-column no-drag">
            <div className="emptyblock"></div>
                {times.map((time, index) => {
                    return <div key={`${time}${index}`} className="titleblock">{time}</div>
                })}
            </div>

            {schedule.map((column, colNum) => {
                return (<div key={`schedule-column${days[colNum]}${colNum}`}className="schedule-column no-drag">
                    <div key={`${days[colNum]}${colNum}`} className="titleblock">{days[colNum]}</div>
                    {column.map((_row, rowNum) => {
                        return <Timeblock
                        key={`C${colNum}R${rowNum}`}
                        col={colNum} row={rowNum}
                        value={activeTimeblocks[colNum][rowNum]}
                        handleSelected={handleTimeblockSelected}/>
                    })}
                </div>)
            })}
            </>
        )
    }

    return (
        <>
        <div className="schedule-container">
            <div
            draggable="false"
            onMouseDown={handleMouseDown}
            onMouseUp = {handleMouseUp}
            className="schedule">
                {createSchedule(activeTimeblocks, days, times)}
            </div>
            <Selector 
            activeStates={activeStates}
            setActiveStates={setActiveStates}
            setActiveState={setActiveState}/>
        </div>
        </>
    )
}

export default Schedule
