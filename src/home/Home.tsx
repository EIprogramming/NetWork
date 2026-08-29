import { useRef, useState, type Key } from 'react';
import { RangeCalendar } from './calendar/RangeCalendar';
import { getLocalTimeZone } from '@internationalized/date';
import {useDateFormatter} from 'react-aria';
import { getTimeRange } from '../utils.ts'
import { useNavigate } from 'react-router';
import { Select, SelectItem } from './select/Select.tsx';
import './Home.css'
import type { TimeRange } from '../schedule/utils/dateUtils.ts';
import { postSchedule } from './API/homeAPI.ts';

function Home() {
    const navigate = useNavigate();
    const [range, setRange] = useState<TimeRange | null>(null);
    const [eventName, setEventName] = useState("");
    const formStartTime = useRef("9"); // default start time is 9:00 am
    const formEndTime = useRef("17"); // default end time is 5:00 pm
    const [isFormValid, setIsFormValid] = useState(false);

    const formatter = useDateFormatter({ dateStyle: 'long' });

    function createSchedule(formData: FormData) {
        if (range === null) return;
        const title = formData.get("event-title")?.toString();
        const startDay = range.start.toString();
        const endDay = range.end.toString();
        const startTime = formStartTime.current;
        const endTime = formEndTime.current;

        if (!title) return;
        postSchedule({
            title: title,
            startDay: startDay,
            endDay: endDay,
            startTime: startTime,
            endTime: endTime
        }, navigate);
    }

    function checkIsFormValid(formRange: TimeRange | null, formName: string) {
        if (formRange && 50 > formName.length && formName.length > 0) {
            setIsFormValid(true);
        } else {
            setIsFormValid(false);
        }
    }

    function setFormEventName(params: any) {
        setEventName(params.target.value);
        checkIsFormValid(range, params.target.value); // must pass the value because setEventName() takes time
    }
    
    function setFormRange(params: TimeRange) {
        setRange(params);
        checkIsFormValid(params, eventName);
    }

    function setFormStartTime(params: Key | null) {
        if (!params) return;
        formStartTime.current = params?.toString();
    }

    function setFormEndTime(params: Key | null){
        if (!params) return;
        formEndTime.current = params?.toString();
    }

    return (
        <>
        {/*<h1>NetWork - Schedule with Friends!</h1>*/}
        <form action={createSchedule} className="event-wrapper">
            <input type="text" name="event-title" className="event-title"
            autoComplete="off" placeholder="Event Name" value={eventName} onChange={setFormEventName}/>
            <span className="event-spacer"></span>
            <div className="event-time-wrapper">
                <div className="event-calendar-wrapper">
                    <RangeCalendar
                    className="event-calendar react-aria-RangeCalendar"
                    value={range}
                    onChange={setFormRange} />
                    <p>Selected range: {range === null ? <></> :formatter.formatRange(
                        range.start.toDate(getLocalTimeZone()),
                        range.end.toDate(getLocalTimeZone())
                    )}</p>
                </div>
                <div className="event-start-end-wrapper">
                    <Select label="Start Time:" className="event-time-select event-start-times react-aria-Select"
                    onChange={setFormStartTime} defaultValue={9}>
                        {getTimeRange(0, 24).map((time, index) => {
                            return <SelectItem key={`event-start-time${index}`} id={index}>{time}</SelectItem>
                        })}
                    </Select>
                    <div className="event-start-end-divider"></div>
                    <Select label="End Time:" className="event-time-select event-end-times react-aria-Select"
                        onChange={setFormEndTime} defaultValue={17}>
                        {getTimeRange(0, 24).map((time, index) => {
                            return <SelectItem key={`event-end-time${index}`} id={index}>{time}</SelectItem>
                        })}
                    </Select>
                    <div className="event-start-end-divider"></div>
                    <button type="submit" className={`event-meet ${!isFormValid? "event-meet-invalid" : ""}`}
                        disabled={!isFormValid}>Meet!</button>{/*New Name: Meetup? MakeAMeeting .com?*/}
                </div>
            </div>
        </form>
        </>
    )   
}

export default Home
