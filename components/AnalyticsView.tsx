import React, { useMemo } from 'react';
import { CalendarEvent } from '../types';
import {
    getCategoryDistribution,
    getWeeklyActivity,
    getCompletionTrend,
    getTotalStats
} from '../src/utils/analytics';
import { TrendingUp, CheckCircle, Calendar, Clock } from 'lucide-react';

interface AnalyticsViewProps {
    events: CalendarEvent[];
    currentStreak: number;
}

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ events, currentStreak }) => {
    const categoryStats = useMemo(() => getCategoryDistribution(events), [events]);
    const weeklyActivity = useMemo(() => getWeeklyActivity(events), [events]);
    const completionTrend = useMemo(() => getCompletionTrend(events), [events]);
    const totalStats = useMemo(() => getTotalStats(events), [events]);

    const maxWeeklyCount = Math.max(...weeklyActivity.map(d => d.count), 1);
    const maxTrendRate = Math.max(...completionTrend.map(t => t.rate), 1);

    return (
        <div className="p-6 space-y-6 overflow-y-auto h-full">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Аналитика</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Ваша продуктивность за последние 7 дней</p>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                        <Calendar size={16} />
                        <span className="text-xs font-medium">Всего событий</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-800 dark:text-white">{totalStats.total}</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 text-green-500 mb-2">
                        <CheckCircle size={16} />
                        <span className="text-xs font-medium">Завершено</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-800 dark:text-white">{totalStats.completionRate}%</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 text-orange-500 mb-2">
                        <TrendingUp size={16} />
                        <span className="text-xs font-medium">Серия дней</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-800 dark:text-white">{currentStreak}</div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 text-indigo-500 mb-2">
                        <Clock size={16} />
                        <span className="text-xs font-medium">Часов</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-800 dark:text-white">{totalStats.totalHours}ч</div>
                </div>
            </div>

            {/* Category Distribution */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Распределение по категориям</h3>
                <div className="space-y-3">
                    {categoryStats.map(stat => {
                        const percentage = totalStats.total > 0 ? (stat.count / totalStats.total) * 100 : 0;
                        return (
                            <div key={stat.category}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-700 dark:text-gray-300 capitalize">{stat.category}</span>
                                    <span className="text-gray-500 dark:text-gray-400">{stat.count} ({Math.round(percentage)}%)</span>
                                </div>
                                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full transition-all duration-300"
                                        style={{
                                            width: `${percentage}%`,
                                            backgroundColor: stat.color
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Weekly Activity */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Недельная активность</h3>
                <div className="flex items-end justify-between gap-2 h-48">
                    {weeklyActivity.map((day, idx) => {
                        const height = (day.count / maxWeeklyCount) * 100;
                        const completedHeight = day.count > 0 ? (day.completed / day.count) * height : 0;

                        return (
                            <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-t relative" style={{ height: `${height}%`, minHeight: '4px' }}>
                                    <div
                                        className="absolute bottom-0 w-full bg-green-500 rounded-t transition-all"
                                        style={{ height: `${completedHeight}%` }}
                                    />
                                </div>
                                <span className="text-xs text-gray-500 dark:text-gray-400">{day.day}</span>
                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{day.count}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Completion Trend */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Тренд завершения</h3>
                <div className="relative h-32">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <polyline
                            fill="none"
                            stroke="url(#gradient)"
                            strokeWidth="2"
                            points={completionTrend.map((t, i) => {
                                const x = (i / (completionTrend.length - 1)) * 100;
                                const y = 100 - (t.rate / maxTrendRate) * 80;
                                return `${x},${y}`;
                            }).join(' ')}
                        />
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#4F46E5" />
                                <stop offset="100%" stopColor="#10B981" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="flex justify-between mt-2">
                        {completionTrend.map((t, idx) => (
                            <div key={idx} className="text-xs text-gray-500 dark:text-gray-400 text-center">
                                <div>{t.date}</div>
                                <div className="font-bold text-gray-700 dark:text-gray-300">{t.rate}%</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsView;
