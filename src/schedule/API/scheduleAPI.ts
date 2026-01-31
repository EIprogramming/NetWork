import { makeDays, type TimeRange } from "../utils/dateUtils";
import { getTimeRange, initialize2DArray } from "../../utils";
import State, { unavailableState } from "../classes/state";
import { type DateFormatter } from 'react-aria';
import { parseDate } from '@internationalized/date';
import type User from "../classes/user";
import { flattenAvailability, unflattenAvailability } from "../utils/availabilityUtils";

export type ScheduleData = {
    title: string,
    range: TimeRange,
    days: string[],
    startTime: string,
    endTime: string,
    times: string[],
    initialTimeblocks: any[][] // timeblock array
}

export async function fetchScheduleData(scheduleId: string | undefined, formatter: DateFormatter) {
    try {
        if (!scheduleId) return;
        const response = await fetch(`http://localhost:3000/schedule/?id=${scheduleId}`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const result = await response.json();

        const range: TimeRange = {start: parseDate(result.start_day), end: parseDate(result.end_day)};
        const days = makeDays(range, formatter);

        const times = getTimeRange(result.start_time, result.end_time);
        const initialTimeblocks = initialize2DArray(days.length, 4*times.length, unavailableState)

        return {
            title: result.title,
            range: range,
            days: days,
            startTime: result.start_time,
            endTime: result.end_time,
            times: times,
            initialTimeblocks: initialTimeblocks
        }
    } catch (err) {
        console.log(err);
        throw err;
    }
}

export async function fetchUsers(scheduleId: string | undefined) {
    if (!scheduleId) return;
    try {
        //const response = await fetch(`http://localhost:3000/users/all?scheduleId=${scheduleId}`);
        const response = await fetch(`http://localhost:3000/availability/all?scheduleId=${scheduleId}`)
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    
        const result = await response.json();
        const users = result.map((currentUser: any): User | null => {
            return {
                username: currentUser.username,
                scheduleId: scheduleId ?? "",
                availability: unflattenAvailability(currentUser.availability) ?? [],
            }
        });

        return users;
    } catch (err) {
        console.log(err);
        throw err;
    }
}

export async function sendUserAvailability(username: string, scheduleId: string, availability: State[][]) {
    const flattenedAvailability = flattenAvailability(availability);

    await fetch(`http://localhost:3000/availability`, {
        method: "POST",
        body: JSON.stringify({
            "username": username,
            "scheduleId": scheduleId,
            "availability": JSON.stringify(flattenedAvailability)
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    }).then((res) => res.json()).then(() => {});
}
