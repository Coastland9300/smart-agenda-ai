/**
 * @file: analytics.ts
 * @description: Analytics calculation utilities for productivity insights
 * @dependencies: types.ts
 * @created: 2025-12-15
 */

import { CalendarEvent } from '../../types';

export interface CategoryStats {
    category: string;
    count: number;
    hours: number;
    color: string;
}

export interface DayActivity {
    day: string;
    count: number;
    completed: number;
}

export interface CompletionTrend {
    date: string;
    rate: number;
}

const CATEGORY_COLORS: Record<string, string> = {
    work: '#4F46E5',
    personal: '#10B981',
    health: '#EF4444',
    edu: '#F59E0B',
    other: '#8B5CF6'
};

export const getCategoryDistribution = (events: CalendarEvent[]): CategoryStats[] => {
    const stats: Record<string, CategoryStats> = {};

    events.forEach(event => {
        const cat = event.category || 'other';
        if (!stats[cat]) {
            stats[cat] = {
                category: cat,
                count: 0,
                hours: 0,
                color: CATEGORY_COLORS[cat] || '#8B5CF6'
            };
        }

        stats[cat].count++;

        // Calculate hours
        if (event.end_time) {
            const start = new Date(event.start_time);
            const end = new Date(event.end_time);
            const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
            stats[cat].hours += hours;
        }
    });

    return Object.values(stats).sort((a, b) => b.count - a.count);
};

export const getWeeklyActivity = (events: CalendarEvent[]): DayActivity[] => {
    const now = new Date();
    const days: DayActivity[] = [];

    for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);

        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);

        const dayEvents = events.filter(e => {
            const eventDate = new Date(e.start_time);
            return eventDate >= date && eventDate < nextDay;
        });

        days.push({
            day: date.toLocaleDateString('ru-RU', { weekday: 'short' }),
            count: dayEvents.length,
            completed: dayEvents.filter(e => e.completed).length
        });
    }

    return days;
};

export const getCompletionRate = (events: CalendarEvent[]): number => {
    if (events.length === 0) return 0;
    const completed = events.filter(e => e.completed).length;
    return Math.round((completed / events.length) * 100);
};

export const getCompletionTrend = (events: CalendarEvent[]): CompletionTrend[] => {
    const now = new Date();
    const trends: CompletionTrend[] = [];

    for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);

        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);

        const dayEvents = events.filter(e => {
            const eventDate = new Date(e.start_time);
            return eventDate >= date && eventDate < nextDay;
        });

        const rate = dayEvents.length > 0
            ? Math.round((dayEvents.filter(e => e.completed).length / dayEvents.length) * 100)
            : 0;

        trends.push({
            date: date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
            rate
        });
    }

    return trends;
};

export const getTotalStats = (events: CalendarEvent[]) => {
    const total = events.length;
    const completed = events.filter(e => e.completed).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    let totalHours = 0;
    events.forEach(event => {
        if (event.end_time) {
            const start = new Date(event.start_time);
            const end = new Date(event.end_time);
            totalHours += (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        }
    });

    return {
        total,
        completed,
        completionRate,
        totalHours: Math.round(totalHours * 10) / 10
    };
};
