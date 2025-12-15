import { CalendarEvent } from '../../types';

export const parseICal = (icsContent: string): Partial<CalendarEvent>[] => {
    const events: Partial<CalendarEvent>[] = [];
    const lines = icsContent.split(/\r\n|\n|\r/);

    let currentEvent: Partial<CalendarEvent> | null = null;
    let inEvent = false;

    const parseDate = (value: string): string => {
        // Format: 20231225T100000Z or 20231225
        if (value.length === 8) {
            // YYYYMMDD -> ISO full day roughly (start of day)
            const y = value.substring(0, 4);
            const m = value.substring(4, 6);
            const d = value.substring(6, 8);
            return `${y}-${m}-${d}T00:00:00.000Z`;
        }

        // YYYYMMDDTHHMMSSZ
        const y = value.substring(0, 4);
        const m = value.substring(4, 6);
        const d = value.substring(6, 8);
        const h = value.substring(9, 11);
        const min = value.substring(11, 13);
        const s = value.substring(13, 15);

        return `${y}-${m}-${d}T${h}:${min}:${s}.000Z`;
    };

    for (const line of lines) {
        if (line.startsWith('BEGIN:VEVENT')) {
            inEvent = true;
            currentEvent = {};
            continue;
        }

        if (line.startsWith('END:VEVENT')) {
            if (currentEvent && currentEvent.title && currentEvent.start_time) {
                events.push(currentEvent);
            }
            inEvent = false;
            currentEvent = null;
            continue;
        }

        if (inEvent && currentEvent) {
            if (line.startsWith('SUMMARY:')) {
                currentEvent.title = line.substring(8);
            } else if (line.startsWith('DTSTART:') || line.startsWith('DTSTART;VALUE=DATE:')) {
                const val = line.split(':')[1];
                currentEvent.start_time = parseDate(val);
            } else if (line.startsWith('DTEND:') || line.startsWith('DTEND;VALUE=DATE:')) {
                const val = line.split(':')[1];
                currentEvent.end_time = parseDate(val);
            } else if (line.startsWith('DESCRIPTION:')) {
                currentEvent.description = line.substring(12).replace(/\\n/g, '\n');
            }
        }
    }

    return events;
};
