import type State from "./state";

class User {
    username: string;
    scheduleId: string;
    availability: Array<Array<State>>;

    constructor(username: string, scheduleId: string, availability: Array<Array<State>>) {
        this.username = username;
        this.scheduleId = scheduleId;
        this.availability = availability;
    }
}

export default User
