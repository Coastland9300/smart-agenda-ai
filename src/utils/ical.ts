import { CalendarEvent } from '../../types';

export const generateICal = (events: CalendarEvent[]): string => {
    const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    let icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Smart Agenda AI//RU',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH'
    ].join('\r\n');

    events.forEach(event => {
        const startTime = new Date(event.start_time).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        const endTime = event.end_time
            ? new Date(event.end_time).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
            : new Date(new Date(event.start_time).getTime() + 3600000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

        const eventBlock = [
            'BEGIN:VEVENT',
            `UID:${event.id}@smart-agenda.ai`,
            `DTSTAMP:${now}`,
            `DTSTART:${startTime}`,
            `DTEND:${endTime}`,
            `SUMMARY:${event.title}`,
            event.description ? `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}` : '',
            'END:VEVENT'
        ].filter(Boolean).join('\r\n');

        icsContent += '\r\n' + eventBlock;
    });

    icsContent += '\r\nEND:VCALENDAR';
    return icsContent;
};
