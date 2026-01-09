import { useState } from 'react';
import { RangeCalendar } from './calendar/RangeCalendar';
import {parseDate, getLocalTimeZone} from '@internationalized/date';
import {useDateFormatter} from 'react-aria';
import './Home.css'
import { getTimeRange } from '../utils.ts'

function Home() {
    const [range, setRange] = useState({
        start: parseDate('2025-02-03'),
        end: parseDate('2025-02-12')
    });

    const formatter = useDateFormatter({ dateStyle: 'long'});

    return (
        <>
        <h1>NetWork - Schedule with Friends!</h1>
        <form className="event-wrapper">
            <input type="text" name="event-title" className="event-title"
            autoComplete="off" placeholder="Event Name"/>
            <span className="event-spacer"></span>
            <div className="event-time-wrapper">
                <div className="event-calendar-wrapper">
                    <RangeCalendar
                    className="event-calendar react-aria-RangeCalendar"
                    value={range}
                    onChange={setRange} />
                    <p>Selected range: {formatter.formatRange(
                        range.start.toDate(getLocalTimeZone()),
                        range.end.toDate(getLocalTimeZone())
                    )}</p>
                </div>
                <div className="event-start-end-wrapper">
                    <label htmlFor="event-start-times">Start Time: </label>
                    {/* TODO: CHANGE SELECTS TO ARIA-REACT SELECTS FOR STYLING */}
                    <select name="event-start-times">
                        <option value="" selected disabled hidden>Start Time</option>
                        {getTimeRange(0, 24).map((time, index) => {
                            return <option key={`event-start-time${index}`} value={time}>{time}</option>
                        })}
                    </select>
                    <label htmlFor="event-start-times">End Time: </label>
                    <select name="event-end-times">
                        <option value="" selected disabled hidden>End Time</option>
                        {getTimeRange(0, 24).map((time, index) => {
                            return <option key={`event-end-time${index}`} value={time}>{time}</option>
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
