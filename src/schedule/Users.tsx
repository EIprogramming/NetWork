import type User from './classes/user';
import './Users.css'

interface Props {
    user: User | null,
    allUsers: User[],
}

function Users( {user, allUsers} : Props) {

    function checkUserInAllUsers() {
        if (!user) return false;
        return allUsers.some(userCheck => userCheck.username === user.username);
    }

    function generateUsersList() {
        if (!allUsers) return;

        const isUserInAllUsers = checkUserInAllUsers();

        const usersToDisplay = isUserInAllUsers ? [...allUsers] : [...allUsers, user];

        return usersToDisplay.map(userToDisplay => {
            if (!userToDisplay) return;
            return <li key={`${userToDisplay.username}`}>{userToDisplay.username}</li>
        });
    }

    return (
        <div className="users-container">
            <h2 className="users-title">Responses</h2>
            <ul> {/*TODO: add pagination */}
                {generateUsersList()}
            </ul>
        </div>
    );
}

export default Users;
