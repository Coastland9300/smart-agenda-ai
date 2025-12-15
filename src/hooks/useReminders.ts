import { useState, useEffect } from 'react';
import { CalendarEvent } from '../../types';

export const useReminders = (events: CalendarEvent[]) => {
    const [notifiedEvents, setNotifiedEvents] = useState<Set<string>>(() => {
        if (typeof window === 'undefined') return new Set();
        const saved = localStorage.getItem('smart_agenda_notified_events');
        if (saved) {
            try {
                return new Set(JSON.parse(saved));
            } catch (e) {
                return new Set();
            }
        }
        return new Set();
    });

    useEffect(() => {
        const checkReminders = () => {
            const now = new Date();
            let hasNewNotifications = false;
            const newNotifiedEvents = new Set(notifiedEvents);

            events.forEach(event => {
                if (event.reminderMinutes && !event.completed && !event.isAllDay) {
                    const eventTime = new Date(event.start_time).getTime();
                    const reminderTime = eventTime - (event.reminderMinutes * 60 * 1000);
                    const diff = now.getTime() - reminderTime;

                    // Check if it's time to notify (within a 2-minute window to account for interval)
                    if (diff >= 0 && diff < 120000) {
                        const notificationId = `${event.id}-${event.reminderMinutes}`;
                        if (!newNotifiedEvents.has(notificationId)) {
                            if (Notification.permission === 'granted') {
                                try {
                                    new Notification(`🔔 Напоминание: ${event.title}`, {
                                        body: `Событие начнется через ${event.reminderMinutes} мин.`,
                                        icon: '/favicon.ico',
                                        tag: notificationId // Prevents duplicates in notification center
                                    });
                                } catch (e) {
                                    console.error("Notification failed", e);
                                }
                            }
                            newNotifiedEvents.add(notificationId);
                            hasNewNotifications = true;
                        }
                    }
                }
            });

            if (hasNewNotifications) {
                setNotifiedEvents(newNotifiedEvents);
                localStorage.setItem('smart_agenda_notified_events', JSON.stringify(Array.from(newNotifiedEvents)));
            }
        };

        const interval = setInterval(checkReminders, 5000); // Check every 5 seconds

        // Initial permission request if needed
        if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            Notification.requestPermission();
        }

        return () => clearInterval(interval);
    }, [events, notifiedEvents]);

    return { notifiedEvents };
};
