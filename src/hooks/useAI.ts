import { useState, useCallback } from 'react';
import { ChatMessage, AIActionType, CalendarEvent, AISettings } from '../../types';
import { parseUserIntent } from '../../services/ai';
import { sendTelegramNotification, formatEventForTelegram } from '../../services/telegram';
import { generateRecurringInstances } from '../../services/routine';
import { db } from '../../services/db';

interface UseAIProps {
    events: CalendarEvent[];
    aiSettings: AISettings;
    setEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>;
    setActiveTab: (tab: 'chat' | 'calendar' | 'today') => void;
    setIsMyDayMode: (mode: boolean) => void;
}

export const useAI = ({ events, aiSettings, setEvents, setActiveTab, setIsMyDayMode }: UseAIProps) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSendMessage = useCallback(async (text: string) => {
        const newUserMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: text,
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, newUserMsg]);
        setIsProcessing(true);

        if (window.innerWidth < 768) {
            setActiveTab('chat');
        }

        try {
            const eventsContext = events.map(e =>
                `- ${e.title} at ${e.start_time} (ID: ${e.id})${e.completed ? ' [COMPLETED]' : ''}${e.isAllDay ? ' [ALL DAY]' : ''}`
            ).join('\n');

            const aiResponse = await parseUserIntent(text, eventsContext);
            let botMessageContent = aiResponse.confirmation_message;

            if (aiResponse.action === AIActionType.CREATE) {
                if (aiResponse.title && aiResponse.start_time) {

                    const instancesToCreateCount = aiResponse.recurrence && aiResponse.recurrence !== 'none'
                        ? (aiResponse.recurrence === 'daily' ? 90 : aiResponse.recurrence === 'weekly' ? 24 : 12)
                        : 1;

                    const instances = generateRecurringInstances({
                        title: aiResponse.title,
                        start_time: aiResponse.start_time,
                        end_time: aiResponse.end_time,
                        description: aiResponse.description || '',
                        reminderMinutes: aiResponse.reminderMinutes,
                        recurrence: aiResponse.recurrence,
                        recurrenceInterval: aiResponse.recurrenceInterval,
                        isAllDay: aiResponse.isAllDay
                    }, { count: instancesToCreateCount });

                    const newEvents = await db.addEvents(instances);

                    setEvents(prev => [...prev, ...newEvents].sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()));

                    if (newEvents.length > 0) {
                        const tgMsg = formatEventForTelegram(newEvents[0], 'created');
                        sendTelegramNotification(tgMsg, aiSettings);
                    }

                } else {
                    botMessageContent = "Я понял, что вы хотите создать событие, но не хватает деталей.";
                }
            } else if (aiResponse.action === AIActionType.BATCH_CREATE && aiResponse.events) {

                const allInstancesToCreate: Omit<CalendarEvent, 'id'>[] = [];

                for (const evt of aiResponse.events) {
                    const instancesToCreateCount = evt.recurrence && evt.recurrence !== 'none'
                        ? (evt.recurrence === 'daily' ? 90 : evt.recurrence === 'weekly' ? 24 : 12)
                        : 1;

                    const instances = generateRecurringInstances({
                        title: evt.title,
                        start_time: evt.start_time,
                        end_time: evt.end_time,
                        description: evt.description || '',
                        reminderMinutes: evt.reminderMinutes,
                        recurrence: evt.recurrence,
                        recurrenceInterval: evt.recurrenceInterval,
                        isAllDay: evt.isAllDay
                    }, { count: instancesToCreateCount });

                    allInstancesToCreate.push(...instances);
                }

                const newEvents = await db.addEvents(allInstancesToCreate);

                setEvents(prev => [...prev, ...newEvents].sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()));

                if (newEvents.length > 0) {
                    const summaryMsg = `📚 *Массовое добавление!*\nДобавлено событий: ${newEvents.length}`;
                    sendTelegramNotification(summaryMsg, aiSettings);
                }

            } else if (aiResponse.action === AIActionType.READ) {
                if (window.innerWidth < 768) {
                    setActiveTab('calendar');
                    setIsMyDayMode(false);
                }
            } else if (aiResponse.action === AIActionType.DELETE) {
                const targetEvent = events.find(e =>
                    e.title.toLowerCase().includes((aiResponse.title || '').toLowerCase())
                );

                if (targetEvent) {
                    await db.deleteEvent(targetEvent.id);
                    setEvents(prev => prev.filter(e => e.id !== targetEvent.id));
                    botMessageContent = `Событие "${targetEvent.title}" удалено из расписания.`;

                    const tgMsg = formatEventForTelegram(targetEvent, 'deleted');
                    sendTelegramNotification(tgMsg, aiSettings);
                } else {
                    botMessageContent = "Не удалось найти событие с таким названием для удаления.";
                }
            }

            const botMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: botMessageContent || "Готово.",
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, botMsg]);

        } catch (error) {
            console.error(error);
            const errorMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "Ошибка обработки запроса.",
                timestamp: Date.now(),
                isError: true
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsProcessing(false);
        }
    }, [events, aiSettings, setEvents, setActiveTab, setIsMyDayMode]);

    return { messages, setMessages, isProcessing, handleSendMessage };
};
