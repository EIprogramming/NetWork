import { useState } from 'react';
import { RangeCalendar } from './calendar/RangeCalendar';
import {parseDate, getLocalTimeZone} from '@internationalized/date';
import {useDateFormatter} from 'react-aria';
import './Home.css'

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
        </form>
        </>
    )
}

export default Home
