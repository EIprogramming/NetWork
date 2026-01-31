import { DateFormatter, getLocalTimeZone, type CalendarDate } from '@internationalized/date';

export type TimeRange = {
    start: CalendarDate,
    end: CalendarDate,
}

export function makeDays(range: TimeRange, formatter: DateFormatter) {
    const dates = [];

    let currentDate: CalendarDate = range.start;
    let i = 0; // prevent infinite loops by having maximum loop limit
    // .compare() < 0 returns true if the first date is before the second
    while (currentDate.compare(range.end) <= 0 && i <= 20) {
        i++;
        const currentDateStr = formatter.format(currentDate.toDate(getLocalTimeZone()))
        dates.push(currentDateStr);
        currentDate = currentDate.add({days: 1});
    }

    return dates;
}
