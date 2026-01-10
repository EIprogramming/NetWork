import { useState } from 'react';
import { RangeCalendar } from './calendar/RangeCalendar';
import {getLocalTimeZone, CalendarDate} from '@internationalized/date';
import {useDateFormatter} from 'react-aria';
import './Home.css'
import { getTimeRange } from '../utils.ts'
import { useNavigate } from 'react-router';

type TimeRange = {
    start: CalendarDate,
    end: CalendarDate,
}

function Home() {
    const navigate = useNavigate();
    const [range, setRange] = useState<TimeRange | null>(null);

    const formatter = useDateFormatter({ dateStyle: 'long'});

    function createSchedule(formData: FormData) {
        const eventTitle = formData.get("event-title");
        const startTime = formData.get("event-start-times");
        const endTime = formData.get("event-end-times");
        if (range === null) return;
        navigate(`/schedule?name=${eventTitle}&sDay=${range.start}&eDay=${range.end}&sTime=${startTime}&eTime=${endTime}`)
        console.log(eventTitle, " ", range.start, range.end, startTime, endTime);
        /* TODO: Build sched on next page with router params */
    }

    return (
        <>
        {/*<h1>NetWork - Schedule with Friends!</h1>*/}
        <form action={createSchedule} className="event-wrapper">
            <input type="text" name="event-title" className="event-title"
            autoComplete="off" placeholder="Event Name"/>
            <span className="event-spacer"></span>
            <div className="event-time-wrapper">
                <div className="event-calendar-wrapper">
                    <RangeCalendar
                    className="event-calendar react-aria-RangeCalendar"
                    value={range}
                    onChange={setRange} />
                    <p>Selected range: {range === null ? <></> :formatter.formatRange(
                        range.start.toDate(getLocalTimeZone()),
                        range.end.toDate(getLocalTimeZone())
                    )}</p>
                </div>
                <div className="event-start-end-wrapper">
                    <label htmlFor="event-start-times">Start Time: </label>
                    {/* TODO: CHANGE SELECTS TO ARIA-REACT SELECTS FOR STYLING */}
                    <select defaultValue="" name="event-start-times">
                        <option value="" disabled hidden>Start Time</option>
                        {getTimeRange(0, 24).map((time, index) => {
                            return <option key={`event-start-time${index}`} value={index}>{time}</option>
                        })}
                    </select>
                    <label htmlFor="event-start-times">End Time: </label>
                    <select defaultValue="" name="event-end-times">
                        <option value="" disabled hidden>End Time</option>
                        {getTimeRange(0, 24).map((time, index) => {
                            return <option key={`event-end-time${index}`} value={index}>{time}</option>
                        })}
                    </select>
                </div>
                <button type="submit">Submit!</button>
            </div>
        </form>
        </>
    )
}

export default Home
