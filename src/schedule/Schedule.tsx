import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Timeblock from './Timeblock.tsx';
import Selector from './availability-selector/Selector.tsx';
import State, { availableState, unavailableState, unsureState } from './classes/state.ts';
import './Schedule.css';
import { editArrayRegion, getTimeRange, initialize2DArray } from '../utils.ts';
import { useParams, useSearchParams } from "react-router";
import { getLocalTimeZone, parseDate, type CalendarDate } from '@internationalized/date';
import { useDateFormatter } from 'react-aria';
import Coordinate from './classes/coordinate.ts';
import Login from './Login.tsx';
import type User from './classes/user.ts';
import Users from './Users.tsx';
import { flattenAvailability, unflattenAvailability } from './availabilityUtils.ts';

type TimeRange = {
    start: CalendarDate,
    end: CalendarDate,
}


function Schedule() {
    // ===========================================================================
    // BIG TODO - TO speed up user experience, load every param as a default param
    // ===========================================================================
    const [_searchParams, _setSearchParams] = useSearchParams();

    let  { "*": scheduleId } = useParams();
    const [title, setTitle] = useState("");

    // initialize the days and times (in 12 hour format) that the schedule spans
    // TODO: add feature to specify these by the user
    const startDate = "1969-07-12"; // no really needed at all, except as defaults
    const endDate = "1969-07-11"; // todo: add validation for these values and remove the default
    const [range, setRange] = useState<TimeRange>({
        start: parseDate(startDate? startDate : ""),
        end: parseDate(endDate? endDate : "")
    });

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

    const [days, setDays] = useState(makeDays(range));
    const [startTime, setStartTime] = useState(0);
    const [endTime, setEndTime] = useState(-1);
    const [times, setTimes] = useState(getTimeRange(startTime, endTime));

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const currentUser = useRef<User | null>(null);
    const [defaultUser, setDefaultUser] = useState<User | null>(null);
    const [allUsers, setAllUsers] = useState<Array<User>>([]);

    function updateUser(newUser: User) {
        currentUser.current = newUser;
        setActiveTimeblocks(newUser.availability);
    }

    const [isDisplayAll, setIsDisplayAll] = useState<boolean>(false);
    const [hoveredTimeblock, setHoveredTimeblock] = useState<Coordinate>( new Coordinate(-1, -1) );

    function hexToNum(hex: string) {
        return Number("0x" + hex);
    }

    function sumToLimits(sum: number, ceil: number, floor: number) {
        if (sum > ceil) {
            return ceil;
        } else if (sum < floor) {
            return floor;
        } else {
            return sum;
        }
    }

    function getGradientStateColor(stateToDisplay: State, gradientSize: number) {
        const defaultColorHex = stateToDisplay.color.slice(1);
        const RGB = [defaultColorHex.slice(0,2), defaultColorHex.slice(2,4), defaultColorHex.slice(4,6)];

        let gradientStates = [];
        // todo: rewrite this algorithm or add preset gradients since you are using preset colours
        // might just do a preset gradient, algorithmic colour is slow
        for (let i = 0; i < gradientSize; i++) {
            const numRGB = RGB.map(rgb => {return hexToNum(rgb)})
            const scaleFactor = 75*(3-i); // scale by -10, -5, 0, +5, +10 rgb

            // add the scale factor to original colour with limits
            const maxRGB = Math.max(...numRGB);

            const newRGB = numRGB.map(rgb => {
                if (rgb == maxRGB) return sumToLimits(Math.ceil(scaleFactor/3) + rgb, 255, 0);
                return sumToLimits(scaleFactor + rgb, 200, 0);
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

    function getValueStep(min: number, max: number, maxNumSteps: number) {
        if (max - min > maxNumSteps) {
            return (max - min) / maxNumSteps;
        } else {
            return 1;
        }
    }

    function displayAllAvailabilities(sumOfAllAvailabilities: number[][]) {
        const stateToDisplay = availableState; // temp

        const sumOfAllAvailabilities1D = sumOfAllAvailabilities.flat();
        const minValue = Math.min(...sumOfAllAvailabilities1D);
        const maxValue = Math.max(...sumOfAllAvailabilities1D);

        const gradientSize = 5;
        const gradientStates = getGradientStateColor(stateToDisplay, gradientSize);

        const valueStep = getValueStep(minValue, maxValue, gradientSize);

        let redUnavailableState = unavailableState;
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

        setIsDisplayAll(true);
        setActiveTimeblocks(availabilitiesToDisplay);
    }

    // turns off displaying all user availabilities
    function resetAvailabilityToDefault() {
        setIsDisplayAll(false);
        setActiveTimeblocks(oldActiveTimeblocks);
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`http://localhost:3000/schedule/?id=${scheduleId}`);
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

                const result = await response.json();
                setTitle(result.title);

                const nextRange: TimeRange = {start: parseDate(result.start_day), end: parseDate(result.end_day)};
                setRange(nextRange);

                const nextDays = makeDays(nextRange);
                setDays(nextDays);

                const nextStartTime = result.start_time;
                const nextEndTime = result.end_time;
                setStartTime(result.start_time);
                setEndTime(result.end_time);

                const nextTimes = getTimeRange(nextStartTime, nextEndTime);
                setTimes(nextTimes);
                setActiveTimeblocks(initialize2DArray(nextDays.length, 4*nextTimes.length, unavailableState));
                setOldActiveTimeblocks(initialize2DArray(nextDays.length, 4*nextTimes.length, unavailableState));
            } catch (err) {
                // todo: make error
                //setError(err.message);
            } finally {
                // todo: make loading
                //setLoading(false);
            }
        }

        const fetchUsers = async () => {
            try {
                //const response = await fetch(`http://localhost:3000/users/all?scheduleId=${scheduleId}`);
                const response = await fetch(`http://localhost:3000/availability/all?scheduleId=${scheduleId}`)
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                console.log("FETCHED USERS");
                const result = await response.json();
                const users = result.map((currentUser: any): User | null => {
                    
                    return {
                        username: currentUser.username,
                        scheduleId: scheduleId ?? "",
                        availability: unflattenAvailability(currentUser.availability) ?? [],
                    }
                });

                setAllUsers(users);
            } catch (err) {
                // todo: make error
                //setError(err.message);
            } finally {
                // todo: make loading
                //setLoading(false);
            }
        }

        fetchData();
        fetchUsers();
    }, []);

    const [activeStates, setActiveStates] = useState([availableState, unsureState, unavailableState]);
    const [activeState, setActiveState] = useState(availableState); // current state being applied
    const defaultState = useRef(unavailableState); // state to apply if deselecting current state

    // isApplyingValue keeps track of whether activeState is being applied (true) or defaultState (false)
    const [isApplyingValue, setIsApplyingValue] = useState(false);

    // the schedule array that contains the activeState of each individual Timeblock element
    // each column corresponds to a day, and each row to a 15 minute segment of time (4 rows per hour)
    const [activeTimeblocks, setActiveTimeblocks] = useState<State[][]>(initialize2DArray(days.length, 4*times.length, unavailableState));
    
    // a second array that keeps track of the previous schedule array,
    // so that adding rectangular selections during editing may be reverted
    const [oldActiveTimeblocks, setOldActiveTimeblocks] = useState<State[][]>(initialize2DArray(days.length, 4*times.length, unavailableState));

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

    /*async function deleteUser(username: string) {
        await fetch(`http://localhost:3000/users, {
            method: "DELETE",
            body: JSON.stringify({
                "username": username,
                "scheduleId": scheduleId,
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        }).then((res) => res.json()).then((_json) => {
            
        });
    }*/

    async function sendUserAvailability(availability: State[][]) {
        if (!isLoggedIn || !defaultUser) return;
        const flattenedAvailability = flattenAvailability(availability);

        await fetch(`http://localhost:3000/availability`, {
            method: "POST",
            body: JSON.stringify({
                "username": defaultUser.username,
                "scheduleId": scheduleId,
                "availability": JSON.stringify(flattenedAvailability)
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        }).then((res) => res.json()).then(() => {});
    }

    const saveTimeBlocks = (timeblocks: State[][]) => {
        if (!isLoggedIn) return;
        if (!defaultUser) return;
        const updatedDefaultUser: User = defaultUser;
        updatedDefaultUser.availability = timeblocks;
    
        setDefaultUser(updatedDefaultUser)
        sendUserAvailability(timeblocks);
        setOldActiveTimeblocks(timeblocks);
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
        if (!isLoggedIn) return;
        
        // if the currentUser exists (currentUser.current) and its username is NOT equal to the default users,
        // prevent editing
        if (!isDefaultUser) return;

        // if currently displaying all users, dont allow edits
        if (isDisplayAll) return;

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

    function isDefaultUser() {
        // if the currentUser exists (currentUser.current) and its username is NOT equal to the default users
        // then it is NOT the default user... so the converse means that it IS the default user
        return !(currentUser.current && currentUser.current.username !== defaultUser?.username);
    }

    function handleGlobalMouseUp() {
        if (!isLoggedIn) return;
        if (isDisplayAll) return;
        if (!defaultUser) return;
    
        saveTimeBlocks(activeTimeblocks);
        setFirstElement([-1, -1]);
        setLastElement([-1, -1]);
    }

    useEffect(() => {
        window.addEventListener('mouseup', handleGlobalMouseUp);

        // Cleanup function to remove the event listener when the component unmounts
        return () => {
            window.removeEventListener('mouseup', handleGlobalMouseUp);
        };
    }, [activeTimeblocks]);

    /* =========================================================================== */
    /* ============= accessibility management for tabulated controls ============= */
    /* =========================================================================== */

    const [gridIsFocused, setGridIsFocused] = useState(false);
    const [focusedElement, setFocusedElement] = useState<Coordinate>( { col: 0, row: 0} );
    const timeblockRefs = useRef<(HTMLDivElement | null)[][]>([]);

    function getFocusIndex(colIndex: number, rowIndex: number) {
        if (!isLoggedIn) return 0;
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
                saveTimeBlocks(activeTimeblocks);
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
                        refs={timeblockRefs}
                        hoveredTimeblock={hoveredTimeblock}
                        setHoveredTimeblock={setHoveredTimeblock} />
                    })}
                </div>)
            })}
            </>
        )
    }

    return (<>
        {/*Load schedule if title is not empty*/}
        {title?
        <div className="schedule-wrapper">
            <h1 className="schedule-title">{title}</h1>
            <div className="schedule-container">
                <div className="schedule-grid-wrapper">
                    <div
                    draggable="false"
                    onKeyDown= {handleKeyDown}
                    onFocus={() => setGridIsFocused(true)}
                    onBlur={() => setGridIsFocused(false)}
                    className="schedule"
                    role="grid">
                        {!isLoggedIn && <Login
                            setDefaultUser={setDefaultUser}
                            setIsLoggedIn={setIsLoggedIn}
                            activeTimeblocks={activeTimeblocks}
                            setActiveTimeblocks={setActiveTimeblocks}
                            setOldActiveTimeblocks={setOldActiveTimeblocks} />}
                        {createSchedule(activeTimeblocks, days, times)}
                    </div>
                </div>
                <div className="schedule-sidebar">
                    <Selector
                    activeStates={activeStates}
                    setActiveStates={setActiveStates}
                    setActiveState={setActiveState}/>
                    <Users
                    updateUser={updateUser}
                    defaultUser={defaultUser}
                    allUsers={allUsers}
                    displayAllAvailabilities={displayAllAvailabilities}
                    resetAvailabilityToDefault={resetAvailabilityToDefault}
                    hoveredTimeblock={hoveredTimeblock} />
                </div>
            </div>
        </div> : null}
        </>
        
    );
}

export default Schedule
