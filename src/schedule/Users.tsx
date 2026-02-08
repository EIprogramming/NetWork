import { useState } from 'react';
import { flattenAvailability, getStatusNumber } from './utils/availabilityUtils';
import type State from './classes/state';
import { availableState } from './classes/state';
import type User from './classes/user';
import './Users.css'
import type Coordinate from './classes/coordinate';
import { MultiSelect } from './multiselect/MultiSelect';

interface Props {
    statusMap: Map<string, number>,
    updateUser: (newUser: User) => void,
    defaultUser: User | null,
    allUsers: User[],
    displayAllAvailabilities: (sumOfAllAvailabilities: number[][], stateToDisplay: State) => void,
    resetAvailabilityToDefault: () => void,
    hoveredTimeblock: Coordinate
}

function Users({
    statusMap,
    updateUser,
    defaultUser,
    allUsers,
    displayAllAvailabilities,
    resetAvailabilityToDefault,
    hoveredTimeblock} : Props) {
    const [isDisplayAll, setIsDisplayAll] = useState<boolean>(false);
    const [selectedStates, setSelectedStates] = useState<State[]>([]);

    function isAllZeros(array2D: number[][]): boolean {
        return array2D.every(row => {
            return row.every(value => {
                if (value != 0) return false;
                else {return true; }
            })
        });
    };

    function sumNumericalStates(
        numericalStates: number[],
        allUserAvailabilities: number[][][],
        rowIndex: number,
        colIndex: number) {
        let sumOfStates = 0;
            for (const userAvailability of allUserAvailabilities) {
                if (numericalStates.includes(userAvailability[rowIndex][colIndex])) {
                    sumOfStates++;
                }
            }

        return sumOfStates;
    }

    // todo: when a user has empty availability, delete on entry of someone else
    function viewAllUserAvailabilities(states: State[], toggle=true) {
        // if not logged in (i.e. default user not set) then return
        if (!defaultUser) return;
        if (isDisplayAll && toggle) {
            resetAvailabilityToDefault();
            setIsDisplayAll(false);
            return;
        }

        // flatten user availabilities to compare numerically if states are the same
        const allUserAvailabilities = getEveryUser().map((user: User) => {
            const flattenedAvailability = flattenAvailability(user.availability, statusMap);
            return flattenedAvailability;
        });

        // create a 2D availability array of the number of times each desired state is available
        if (!allUserAvailabilities) return;
        const firstUserAvailability = allUserAvailabilities[0];
        const numericalDesiredStates = states.map(state => getStatusNumber(state, statusMap));
        const sumOfAllAvailabilities = firstUserAvailability.map((row: number[], rowIndex: number) => {
            return row.map((_value, colIndex: number) => {
                return sumNumericalStates(
                    numericalDesiredStates,
                    allUserAvailabilities,
                    rowIndex,
                    colIndex);
            });
        });

        displayAllAvailabilities(sumOfAllAvailabilities, selectedStates[0]);
        setIsDisplayAll(true);
    }

    function checkUserInAllUsers() {
        if (!defaultUser) return false;
        return allUsers.some(userCheck => userCheck.username === defaultUser.username);
    }

    function handleMouseEnter(newUser: User) {
        if (!defaultUser) return;
        updateUser(newUser);
    }
    
    function handleMouseLeave() {
        if (!defaultUser) return;
        if (isDisplayAll) {
            viewAllUserAvailabilities(selectedStates, false); // TODO TODO TODO!! change to selected...
        } else {
            updateUser(defaultUser);
        }
    }

    function getEveryUser() {
        const isUserInAllUsers = checkUserInAllUsers();
        return (isUserInAllUsers || !defaultUser) ? [...allUsers] : [...allUsers, defaultUser];
    }

    function userAvailableAt(user: User, hoveredTimeblock: Coordinate) {
        if (!user.availability) return;
        if (!isDisplayAll) return;

        const [row, col] = [hoveredTimeblock.row, hoveredTimeblock.col];
        if (row === -1 || col === -1) return -1; // not hovering at all
    
        if (user.availability[col][row].name === availableState.name) {
            return 1; // available
        } else {
            return 0; // unavailable
        }
    }

    function getUserAvailableColor(user: User, hoveredTimeblock: Coordinate) {
        if (!user.availability) return;
        if (!isDisplayAll) return;

        const isUserAvailable = userAvailableAt(user, hoveredTimeblock);
        if (isUserAvailable == 1) {
            return '#bbffbb';
        } else if (isUserAvailable == 0) {
            return '#ffaeae';
        } else { return; }
    }

    function getUserAvailableCheckmark(user: User, hoveredTimeblock: Coordinate) {
        if (!user.availability) return;
        if (!isDisplayAll) return;

        const isUserAvailable = userAvailableAt(user, hoveredTimeblock);
        if (isUserAvailable == 1) {
            return " ✔";
        } else if (isUserAvailable == 0) {
            return " ✘";
        } else { return ""; }
    }

    function generateUsersList() {
        if (!allUsers) return;

        const usersToDisplay = getEveryUser();

        return usersToDisplay.map(userToDisplay => {
            if (!userToDisplay) return;
            const isDefaultUser = (defaultUser?.username === userToDisplay.username);
            if (!isDefaultUser && isAllZeros(flattenAvailability(userToDisplay.availability, statusMap))) return;
            return <li
                tabIndex={0} // TODO: add full keyboard navigation
                className="users-list-element"
                key={`${userToDisplay.username}`}
                onFocus={() => handleMouseEnter(userToDisplay)}
                onMouseEnter={() => handleMouseEnter(userToDisplay)}
                onBlur={handleMouseLeave}
                onMouseLeave={handleMouseLeave}
                style={{
                    color: getUserAvailableColor(userToDisplay, hoveredTimeblock)
                }}>
                    {userToDisplay.username}
                    {getUserAvailableCheckmark(userToDisplay, hoveredTimeblock)}
                </li>
        });
    }

    return (
        <div className="users-container">
            <h2 className="users-title">Responses</h2>
            <ul> {/*TODO: add pagination */}
                {generateUsersList()}
            </ul>
            <div className="users-separator"></div>
            <button
                className={isDisplayAll ? "users-button-activated" : ""}
                onClick={() => viewAllUserAvailabilities(selectedStates)}>
                {isDisplayAll? "View Your Response" : "View All Responses"}  
            </button>
            <div className="users-separator"></div>
            <MultiSelect
                selectedStates={selectedStates}
                setSelectedStates={setSelectedStates} />
        </div>
    );
}

export default Users;
