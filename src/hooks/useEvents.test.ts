import { renderHook, act } from '@testing-library/react';
import { useEvents } from './useEvents';
import { db } from '../../services/db';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CalendarEvent, AISettings } from '../../types';

// Mock dependencies
vi.mock('../../services/db', () => ({
    db: {
        getEvents: vi.fn(),
        addEvents: vi.fn(),
        updateEvent: vi.fn(),
        deleteEvent: vi.fn(),
    }
}));

vi.mock('../../services/telegram', () => ({
    formatEventForTelegram: vi.fn(),
    sendTelegramNotification: vi.fn(),
}));

vi.mock('../../services/routine', () => ({
    generateRecurringInstances: vi.fn((event) => [event]), // Simple pass-through or mock logic
    checkAndExtendRoutine: vi.fn(() => []),
}));

describe('useEvents Hook', () => {
    const mockAiSettings: AISettings = {
        telegramBotToken: 'test_token',
        telegramChatId: 'test_chat_id',
        defaultReminderMinutes: 15
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should load initial events on mount', async () => {
        const mockEvents: CalendarEvent[] = [
            { id: 1, title: 'Event 1', start_time: '2023-10-01T10:00:00', completed: false }
        ];
        (db.getEvents as any).mockResolvedValue(mockEvents);

        const { result } = renderHook(() => useEvents(mockAiSettings));

        // Initial state is empty
        expect(result.current.events).toEqual([]);

        // Wait for effect to run
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        expect(db.getEvents).toHaveBeenCalled();
        expect(result.current.events).toEqual(mockEvents);
    });

    it('should add an event', async () => {
        const { result } = renderHook(() => useEvents(mockAiSettings));

        const newEventData = { title: 'New Event', start_time: '2023-10-02T10:00:00', completed: false };
        const savedEvents = [{ ...newEventData, id: 123 }];

        (db.addEvents as any).mockResolvedValue(savedEvents);

        await act(async () => {
            await result.current.addEvent(newEventData);
        });

        expect(db.addEvents).toHaveBeenCalled();
        expect(result.current.events).toContainEqual(savedEvents[0]);
    });

    it('should delete an event', async () => {
        const initialEvents: CalendarEvent[] = [
            { id: 1, title: 'Event 1', start_time: '2023-10-01T10:00:00', completed: false }
        ];
        (db.getEvents as any).mockResolvedValue(initialEvents);

        const { result } = renderHook(() => useEvents(mockAiSettings));

        // Wait for load
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        await act(async () => {
            await result.current.deleteEvent(1);
        });

        expect(db.deleteEvent).toHaveBeenCalledWith(1);
        expect(result.current.events).toHaveLength(0);
    });
});
