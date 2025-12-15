import { useState, useEffect, useRef } from 'react';
import { CalendarEvent } from '../../types';
import { db } from '../../services/db';
import { generateRecurringInstances, checkAndExtendRoutine } from '../../services/routine';
import { formatEventForTelegram, sendTelegramNotification } from '../../services/telegram';
import { AISettings } from '../../types';

export const useEvents = (aiSettings: AISettings, onComplete?: () => void) => {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const hasCheckedRoutineRef = useRef(false);

    // Load events
    useEffect(() => {
        const loadAndExtendEvents = async () => {
            let currentEvents = await db.getEvents();

            if (!hasCheckedRoutineRef.current) {
                const newExtensions = checkAndExtendRoutine(currentEvents);
                if (newExtensions.length > 0) {
                    const savedExtensions = await db.addEvents(newExtensions);
                    currentEvents = [...currentEvents, ...savedExtensions];
                    currentEvents.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
                }
                hasCheckedRoutineRef.current = true;
            }

            setEvents(currentEvents);
        };

        loadAndExtendEvents();
    }, []);

    const addEvent = async (eventData: Omit<CalendarEvent, 'id'>, instancesCount: number = 1) => {
        const instances = generateRecurringInstances(eventData, { count: instancesCount });
        const newEvents = await db.addEvents(instances);

        setEvents(prev => [...prev, ...newEvents].sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()));

        // Notify for the first event
        if (newEvents.length > 0) {
            const tgMsg = formatEventForTelegram(newEvents[0], 'created');
            sendTelegramNotification(tgMsg, aiSettings);
        }
        return newEvents;
    };

    const updateEvent = async (id: string | number, eventData: Partial<CalendarEvent>) => {
        await db.updateEvent(id, eventData);
        setEvents(prev => prev.map(e => e.id === id ? { ...e, ...eventData } : e).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()));
    };

    const deleteEvent = async (id: string | number) => {
        // Soft delete: mark as deleted instead of removing
        const deletedAt = new Date().toISOString();
        await db.updateEvent(id, { deleted: true, deletedAt });
        setEvents(prev => prev.map(e => e.id === id ? { ...e, deleted: true, deletedAt } : e));
    };

    const restoreEvent = async (id: string | number) => {
        await db.updateEvent(id, { deleted: false, deletedAt: undefined });
        setEvents(prev => prev.map(e => e.id === id ? { ...e, deleted: false, deletedAt: undefined } : e));
    };

    const permanentlyDeleteEvent = async (id: string | number) => {
        await db.deleteEvent(id);
        setEvents(prev => prev.filter(e => e.id !== id));
    };

    const toggleComplete = async (id: string | number, completed: boolean) => {
        await db.updateEvent(id, { completed });
        setEvents(prev => prev.map(e => e.id === id ? { ...e, completed } : e));

        if (completed) {
            if (onComplete) onComplete();
            const event = events.find(e => e.id === id);
            if (event) {
                const tgMsg = formatEventForTelegram({ ...event, completed: true }, 'completed');
                sendTelegramNotification(tgMsg, aiSettings);
            }
        }
    };

    return {
        events,
        setEvents,
        addEvent,
        updateEvent,
        deleteEvent,
        restoreEvent,
        permanentlyDeleteEvent,
        toggleComplete
    };
};
