import { flattenAvailability } from './availabilityUtils';
import type User from './classes/user';
import './Users.css'

interface Props {
    updateUser: (newUser: User) => void,
    defaultUser: User | null,
    allUsers: User[],
}

function Users( {updateUser, defaultUser, allUsers} : Props) {

    function  isAllZeros(array2D: Number[][]): boolean {
        return array2D.every(row => {
            return row.every(value => {
                if (value != 0) return false;
                else {return true; }
            })
        });
    };

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
        updateUser(defaultUser);
    }

    function generateUsersList() {
        if (!allUsers) return;

        const isUserInAllUsers = checkUserInAllUsers();

        const usersToDisplay = isUserInAllUsers ? [...allUsers] : [...allUsers, defaultUser];

        return usersToDisplay.map(userToDisplay => {
            if (!userToDisplay) return;
            const isDefaultUser = (defaultUser?.username === userToDisplay.username);
            if (!isDefaultUser && isAllZeros(flattenAvailability(userToDisplay.availability))) return;
            return <li
                className="users-list-element"
                key={`${userToDisplay.username}`}
                onMouseEnter={() => handleMouseEnter(userToDisplay)}
                onMouseLeave={handleMouseLeave}>
                    {userToDisplay.username}
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
            <button>View All Users</button>
        </div>
    );
}

export default Users;
