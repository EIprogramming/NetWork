import { useLayoutEffect, useRef, useState } from 'react';
import Timeblock from './Timeblock.tsx';
import Selector from './Selector.tsx';
import State from './state.ts';
import './Schedule.css';
import { editArrayRegion, getTimeRange, initialize2DArray } from '../utils.ts';
import { useSearchParams } from "react-router";
import { getLocalTimeZone, parseDate, type CalendarDate } from '@internationalized/date';
import { useDateFormatter } from 'react-aria';
import Coordinate from './coordinate.ts';
import { DEFAULT_COLORS } from './defaultColors.ts';

type TimeRange = {
    start: CalendarDate,
    end: CalendarDate,
}

function Schedule() {
    const [searchParams, _setSearchParams] = useSearchParams();

    const [title, _setTitle] = useState(searchParams.get("name"));

    // initialize the days and times (in 12 hour format) that the schedule spans
    // TODO: add feature to specify these by the user
    const startDate = searchParams.get("sDay")
    const endDate = searchParams.get("eDay")
    const range: TimeRange = {
        start: parseDate(startDate? startDate : ""),
        end: parseDate(endDate? endDate : "")
    };

    const formatter = useDateFormatter({ month: 'long', weekday: 'long', day: 'numeric' });

    function makeDays(range: TimeRange) {
        const dates = [];
        let currentDate: CalendarDate = range.start;
        let i = 0; // prevent infinite loops by having maximum loop limit
        // .compare() < 0 returns true if the first date is before the second
        while (currentDate.compare(range.end) <= 0 && i <= 20) {
            i++;
            const currentDateStr = formatter.format(currentDate.toDate(getLocalTimeZone()))
            dates.push(currentDateStr);
            currentDate = currentDate.add({days: 1});
        }
    
        return dates;
    }

    //const [days, _setDays] = useState(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]);
    const [days, _setDays] = useState(makeDays(range));
    const startTime = Number(searchParams.get("sTime"));
    const endTime = Number(searchParams.get("eTime"));
    const [times, _setTimes] = useState(getTimeRange(startTime, endTime));

    // an array of the possible states that a Timeblock may take
    const unavailableState = new State("Unavailable", DEFAULT_COLORS.white, true);
    const unsureState = new State("Maybe", DEFAULT_COLORS.yellow, true); // todo: remove for final product
    const availableState = new State("Available", DEFAULT_COLORS.green, true);

    const [activeStates, setActiveStates] = useState([availableState, unsureState, unavailableState]);
    const [activeState, setActiveState] = useState(availableState); // current state being applied
    const defaultState = useRef(unavailableState); // state to apply if deselecting current state

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
     * Get aria label of a specific Timeblock
     * @param col - the column number of the Timeblock component
     * @param row - the row number of the Timeblock component
     * @returns [hour:minutes] [am/pm], [availability] on [day], (e.g. 9:00 am, Available on Monday, January 2)
     */
    function getTimeblockLabel(col: number, row: number) {
        const availability = activeTimeblocks[col][row].name;
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
            // update the current 'first element' that was selected
            nextFirstElement = [col, row];
            setFirstElement(nextFirstElement);
            
            // if this is the first element selected, determine if we are
            // toggling elements to become active or inactive
            nextIsApplyingValue = !(activeTimeblocks[col][row].name === activeState.name);
            setIsApplyingValue(nextIsApplyingValue)

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
        editArrayRegion(nextFirstElement, nextLastElement, nextActiveTimeBlocks,
            state, activeState, defaultState.current);
        setActiveTimeblocks(nextActiveTimeBlocks);
    }

    function handleMouseUp(_e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        setFirstElement([-1, -1]);
        setLastElement([-1, -1]);
    }

    /* =========================================================================== */
    /* ============= accessibility management for tabulated controls ============= */
    /* =========================================================================== */

    const [gridIsFocused, setGridIsFocused] = useState(false);
    const [focusedElement, setFocusedElement] = useState<Coordinate>( { col: 0, row: 0} );
    const timeblockRefs = useRef<(HTMLDivElement | null)[][]>([]);

    function getFocusIndex(colIndex: number, rowIndex: number) {
        if (focusedElement.col === colIndex && focusedElement.row === rowIndex) return 0;
        return -1;
    }

    function moveFocus(e: React.KeyboardEvent<HTMLDivElement>) {
        const column = focusedElement.col;
        const maxColumn = activeTimeblocks.length - 1;
        const row = focusedElement.row;
        const maxRow = activeTimeblocks[0].length - 1;
        let nextFocusedElement = null;

        switch (e.key) {
            case "ArrowUp":
                if (row === 0) { nextFocusedElement = {col: column, row: maxRow}; }
                else { nextFocusedElement = {col: column, row: row - 1}; }
                setFocusedElement(nextFocusedElement);
                console.log(nextFocusedElement.col, nextFocusedElement.row)
                break;
            case "ArrowDown":
                if (row === maxRow) { nextFocusedElement = {col: column, row: 0}; }
                else { nextFocusedElement = {col: column, row: row + 1}; }
                setFocusedElement(nextFocusedElement);
                break;
            case "ArrowLeft":
                if (column === 0) { nextFocusedElement = {col: maxColumn, row: row}; }
                else { nextFocusedElement = {col: column - 1, row: row}; }
                setFocusedElement(nextFocusedElement);
                break;
            case "ArrowRight":
                if (column === maxColumn) { nextFocusedElement = {col: 0, row: row}; }
                else { nextFocusedElement = {col: column + 1, row: row}; }
                setFocusedElement(nextFocusedElement);
                break;
            default:
                break;
        }
        
        
        if (nextFocusedElement) handleTimeblockSelected(nextFocusedElement.col, nextFocusedElement.row, false);
        e.preventDefault();
    }

    /**
     * move the focus along the arrow keys by calling moveFocus() and
     * handle enterring time via pressing enter
     * @param e - keyboard event from keydown
     */
    function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
        if (e.key.startsWith("Arrow")) {
            moveFocus(e);
        } else if (e.key === "Enter") {
            if (firstElement[0] === -1 && firstElement[1] === -1) {
                handleTimeblockSelected(focusedElement.col, focusedElement.row, true);
            } else {
                // by saving the current selection, 'escapes' out of availability entry mode
                setOldActiveTimeblocks(activeTimeblocks);
                setFirstElement([-1, -1]);
            }
        }
    }

    /** Updates the focus on the timeblock on a DOM mutation,
     *  and prevents autofocus on page load by checking !gridIsFocused and !timeblockRefs
     */
    useLayoutEffect(() => {
        // make sure the grid is already focused and the reference list exists
        if (!gridIsFocused || !timeblockRefs) return;

        const col = focusedElement.col;
        const row = focusedElement.row;
        const focusedTimeblock = timeblockRefs.current[row][col];
        if (!focusedTimeblock) return;

        focusedTimeblock.focus();
    }, [focusedElement]);

    /* =========================================================================== */
    /* ======================= react component generation ======================== */
    /* =========================================================================== */

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
                        ariaLabel={getTimeblockLabel(colNum, rowNum)}
                        handleSelected={handleTimeblockSelected}
                        focusIndex={getFocusIndex(colNum, rowNum)}
                        refs={timeblockRefs} />
                    })}
                </div>)
            })}
            </>
        )
    }

    return (
        <div className="schedule-wrapper">
            <h1 className="schedule-title">{title}</h1>
            <div className="schedule-container">
                <div
                draggable="false"
                onMouseUp = {handleMouseUp}
                onKeyDown= {handleKeyDown}
                onFocus={() => setGridIsFocused(true)}
                onBlur={() => setGridIsFocused(false)}
                className="schedule"
                role="grid">
                    {createSchedule(activeTimeblocks, days, times)}
                </div>
                <Selector 
                activeStates={activeStates}
                setActiveStates={setActiveStates}
                setActiveState={setActiveState}/>
            </div>
        </div>
    );
}

export default Schedule
