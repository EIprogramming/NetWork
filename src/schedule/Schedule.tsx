// EXTERNAL LIBRARIES
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useParams } from "react-router";
import { useDateFormatter } from 'react-aria';
import { parseDate } from '@internationalized/date';

// API FUNCTIONS
import { fetchScheduleData, fetchUsers } from './API/scheduleAPI.ts';

// UTILITY FUNCTIONS
import { flattenAvailability } from './utils/availabilityUtils.ts';
import { makeDays, type TimeRange } from './utils/dateUtils.ts';
import { getAllAvailabilitiesToDisplay } from './utils/displayAllUtils.ts';
import { getTimeblockLabel } from './utils/timeblockUtils.ts';
import { editArrayRegion, getTimeRange, initialize2DArray } from '../utils.ts';

// CLASSES AND TYPES
import State, { availableState, unavailableState, unsureState } from './classes/state.ts';
import Coordinate from './classes/coordinate.ts';
import type User from './classes/user.ts';

// COMPONENTS
import Timeblock from './Timeblock.tsx';
import Login from './Login.tsx';
import Users from './Users.tsx';
import Selector from './availability-selector/Selector.tsx';

// STYLESHEET
import './Schedule.css';

function Schedule() {
    // ========================================================================
    // =========================== Search Parameters ==========================
    // ========================================================================
    const  { "*": scheduleId } = useParams();
    const [title, setTitle] = useState("");

    // ========================================================================
    // ============================= Date and Time ============================
    // ========================================================================
    const formatter = useDateFormatter({ month: 'long', weekday: 'long', day: 'numeric' });
    const [range, setRange] = useState<TimeRange>({
        start: parseDate("1970-01-01"),
        end: parseDate("1970-01-01")
    });

    const [days, setDays] = useState(makeDays(range, formatter));
    const [startTime, setStartTime] = useState(0);
    const [endTime, setEndTime] = useState(-1);
    const [times, setTimes] = useState(getTimeRange(startTime, endTime));

    // ========================================================================
    // ============================== User State ==============================
    // ========================================================================
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const currentUser = useRef<User | null>(null);
    const [defaultUser, setDefaultUser] = useState<User | null>(null);
    const [allUsers, setAllUsers] = useState<Array<User>>([]);

    function updateUser(newUser: User) {
        currentUser.current = newUser;
        setActiveTimeblocks(newUser.availability);
    }

    function updateAllUsers(updatedUser: User) {
        allUsers.forEach(user => {
            if (user.username === updatedUser.username) {
                user.availability = updatedUser.availability;
            }
        });
    }

    function isDefaultUser() {
        // if the currentUser exists (currentUser.current) and its username is NOT equal to the default users
        // then it is NOT the default user... so the converse means that it IS the default user
        return !(currentUser.current && currentUser.current.username !== defaultUser?.username);
    }

    // ========================================================================
    // =========================== All Users View =============================
    // ========================================================================
    const [isDisplayAll, setIsDisplayAll] = useState<boolean>(false);
    const [hoveredTimeblock, setHoveredTimeblock] = useState<Coordinate>( new Coordinate(-1, -1) );

    function displayAllAvailabilities(sumOfAllAvailabilities: number[][]) {
        const availabilitiesToDisplay = getAllAvailabilitiesToDisplay(sumOfAllAvailabilities);
        setIsDisplayAll(true);
        setActiveTimeblocks(availabilitiesToDisplay);
    }

    // turns off displaying all user availabilities
    function resetAvailabilityToDefault() {
        setIsDisplayAll(false);
        setActiveTimeblocks(oldActiveTimeblocks);
    }

    // on startup: set the schedule data and user data
    useEffect(() => {
        async function setScheduleData() {
            const scheduleData = await fetchScheduleData(scheduleId, formatter);
            if (!scheduleData) return;

            setTitle(scheduleData.title);
            setRange(scheduleData.range);
            setDays(scheduleData.days);
            setStartTime(scheduleData.startTime);
            setEndTime(scheduleData.endTime);
            setTimes(scheduleData.times);
            setActiveTimeblocks(scheduleData.initialTimeblocks);
            setOldActiveTimeblocks(scheduleData.initialTimeblocks);
        }

        async function setUsersData() {
            const users = await fetchUsers(scheduleId);
            setAllUsers(users);
        }

        setScheduleData();
        setUsersData();
    }, [scheduleId, formatter]);

    // ========================================================================
    // =================== State and Timeblock Management =====================
    // ========================================================================
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
        updateAllUsers(updatedDefaultUser)
        
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
        if (!isDefaultUser()) return;

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

    function handleGlobalMouseUp() {
        if (!isLoggedIn ||
            isDisplayAll ||
            !defaultUser ||
            !isDefaultUser()
        ) return;
    
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

    // ===========================================================================
    // ============= Accessibility Management for Tabulated Controls =============
    // ===========================================================================
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
                        ariaLabel={getTimeblockLabel(activeTimeblocks, days, times, colNum, rowNum)}
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
