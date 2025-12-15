import { renderHook, act } from '@testing-library/react';
import { useAI } from './useAI';
import { db } from '../../services/db';
import * as aiService from '../../services/ai';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CalendarEvent, AISettings, AIActionType } from '../../types';

// Mock dependencies
vi.mock('../../services/db', () => ({
    db: {
        addEvents: vi.fn(),
        deleteEvent: vi.fn(),
    }
}));

vi.mock('../../services/telegram', () => ({
    formatEventForTelegram: vi.fn(),
    sendTelegramNotification: vi.fn(),
}));

vi.mock('../../services/routine', () => ({
    generateRecurringInstances: vi.fn((event) => [event]),
}));

// Mock parseUserIntent
vi.spyOn(aiService, 'parseUserIntent');

describe('useAI Hook', () => {
    const mockEvents: CalendarEvent[] = [];
    const mockAiSettings: AISettings = {
        provider: 'google'
    };
    const mockSetEvents = vi.fn();
    const mockSetActiveTab = vi.fn();
    const mockSetIsMyDayMode = vi.fn();

    const defaultProps = {
        events: mockEvents,
        aiSettings: mockAiSettings,
        setEvents: mockSetEvents,
        setActiveTab: mockSetActiveTab,
        setIsMyDayMode: mockSetIsMyDayMode
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should add user message immediately', async () => {
        const { result } = renderHook(() => useAI(defaultProps));

        const userText = "Hello AI";
        (aiService.parseUserIntent as any).mockResolvedValue({
            action: AIActionType.UNKNOWN,
            confirmation_message: "Hello User"
        });

        await act(async () => {
            await result.current.handleSendMessage(userText);
        });

        expect(result.current.messages[0]).toMatchObject({
            role: 'user',
            content: userText
        });
    });

    it('should handle CREATE action', async () => {
        const { result } = renderHook(() => useAI(defaultProps));

        const eventDetails = {
            title: "Meeting",
            start_time: "2023-10-10T10:00:00"
        };

        (aiService.parseUserIntent as any).mockResolvedValue({
            action: AIActionType.CREATE,
            ...eventDetails,
            confirmation_message: "Event created"
        });

        (db.addEvents as any).mockResolvedValue([eventDetails]);

        await act(async () => {
            await result.current.handleSendMessage("Create meeting");
        });

        expect(db.addEvents).toHaveBeenCalled();
        expect(mockSetEvents).toHaveBeenCalled();
        expect(result.current.messages.some(m => m.role === 'assistant' && m.content === "Event created")).toBe(true);
    });

    it('should handle error gracefully', async () => {
        const { result } = renderHook(() => useAI(defaultProps));

        (aiService.parseUserIntent as any).mockRejectedValue(new Error("API Error"));

        await act(async () => {
            await result.current.handleSendMessage("Fail please");
        });

        expect(result.current.messages.some(m => m.role === 'assistant' && m.content === "Ошибка обработки запроса.")).toBe(true);
    });
});
