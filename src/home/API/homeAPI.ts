import type { NavigateFunction } from "react-router";

type ScheduleData = {
    title: string,
    startDay: string,
    endDay: string,
    startTime: string,
    endTime: string
}


export function postSchedule(scheduleData: ScheduleData, navigate: NavigateFunction) {
    fetch("http://localhost:3000/schedule", {
        method: "POST",
        body: JSON.stringify({
            "title": scheduleData.title,
            "startDay": scheduleData.startDay,
            "endDay": scheduleData.endDay,
            "startTime": scheduleData.startTime,
            "endTime": scheduleData.endTime
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    }).then((response) => response.json()).then((json) => navigate(`/schedule/${json.public_id}`));
}
