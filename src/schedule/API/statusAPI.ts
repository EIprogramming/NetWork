import State from "../classes/state";


export async function postNewState(scheduleId: string, state: State) {
    const trimmedColor = state.color.replace("#", "");

    await fetch(`http://localhost:3000/status`, {
        method: "POST",
        body: JSON.stringify({
            "scheduleId": scheduleId,
            "statusName": state.name,
            "color": trimmedColor
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    }).then((res) => res.json()).then(() => {});
}

export async function fetchStates(scheduleId: string) {
    try {
        const response = await fetch(`http://localhost:3000/status/all?scheduleId=${scheduleId}`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const result = await response.json();
        
        const formattedStates = result.map((rawState: any) => {
            return new State(
                rawState.name,
                "#".concat(rawState.color),
                rawState.is_default ? true : false // convert from 1/0 to true/false
            )
        });
        
        return formattedStates;

    } catch (err) {
        console.log(err);
        throw err;
    }
}
