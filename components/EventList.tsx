/**
 * @file: components/EventList.tsx
 * @description: List view for calendar events with edit, delete, and share capabilities.
 * @dependencies: react, lucide-react, types.ts
 * @created: 2025-12-15
 */

import React, { useEffect, useRef, useState } from 'react';
import { CalendarEvent } from '../types';
import { Clock, Trash2, CalendarDays, Sparkles, Bell, Repeat, Edit2, CheckCircle, Circle, Coffee, Share2, Check, Sun, History } from 'lucide-react';

interface EventListProps {
  events: CalendarEvent[];
  onDelete: (id: string | number) => void;
  onEdit: (event: CalendarEvent) => void;
  onToggleComplete: (id: string | number, completed: boolean) => void;
  selectedDate?: Date;
  isMyDayMode?: boolean;
}

const EventList: React.FC<EventListProps> = ({ events, onDelete, onEdit, onToggleComplete, selectedDate, isMyDayMode }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string | number>>(new Set());
  const [copiedId, setCopiedId] = useState<string | number | null>(null);
  const [now, setNow] = useState(new Date());

  // Update "now" every minute to keep "past" status fresh
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const handleDelete = (id: string | number) => {
    setDeletingIds(prev => {
      const newSet = new Set(prev);
      newSet.add(id);
      return newSet;
    });

    setTimeout(() => {
      onDelete(id);
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }, 400);
  };

  const handleShare = async (e: React.MouseEvent, event: CalendarEvent) => {
    e.stopPropagation();

    const date = new Date(event.start_time);
    const dateStr = date.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
    let shareText = '';

    if (event.isAllDay) {
      shareText = `📅 ${event.title}\n🗓 ${dateStr} (Весь день)\n${event.description ? `📝 ${event.description}` : ''}`;
    } else {
      const timeStr = date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
      shareText = `📅 ${event.title}\n🕒 ${dateStr}, ${timeStr}\n${event.description ? `📝 ${event.description}` : ''}`;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: shareText,
        });
      } catch (err) {
        console.debug('Share cancelled');
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        setCopiedId(event.id);
        setTimeout(() => setCopiedId(null), 2000);
      } catch (err) {
        console.error('Failed to copy', err);
      }
    }
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear();
  };

  const isToday = (isoString: string) => {
    return isSameDay(new Date(isoString), new Date());
  };

  const getRecurrenceLabel = (type?: string, interval: number = 1) => {
    if (!type || type === 'none') return null;
    if (interval === 1) {
      switch (type) {
        case 'daily': return 'Ежедневно';
        case 'weekly': return 'Еженедельно';
        case 'monthly': return 'Ежемесячно';
        case 'yearly': return 'Ежегодно';
        default: return type;
      }
    } else {
      // Special friendly formats
      if (interval === 2 && type === 'weekly') return 'Раз в 2 недели';

      const suffix = type === 'daily' ? 'дн.' : type === 'weekly' ? 'нед.' : type === 'monthly' ? 'мес.' : 'лет';
      return `Каждые ${interval} ${suffix}`;
    }
  };

  // Scroll to selected date logic
  useEffect(() => {
    if (selectedDate && events.length > 0 && !isMyDayMode) {
      const firstMatchId = events.find(e => isSameDay(new Date(e.start_time), selectedDate))?.id;
      if (firstMatchId) {
        const el = document.getElementById(`event-${firstMatchId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  }, [selectedDate, events, isMyDayMode]);

  const getReminderLabel = (minutes?: number) => {
    if (!minutes) return null;
    if (minutes < 60) return `${minutes} мин`;
    if (minutes === 60) return '1 ч';
    if (minutes === 1440) return '1 д';
    return `${minutes / 60} ч`;
  };

  if (events.length === 0) {
    if (isMyDayMode) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-orange-400 dark:text-orange-500 p-8 animate-fade-in-up">
          <div className="w-24 h-24 bg-orange-50 dark:bg-orange-900/20 rounded-full flex items-center justify-center mb-6 animate-float transition-colors shadow-inner">
            <Coffee size={40} className="text-orange-400 dark:text-orange-400" />
          </div>
          <p className="text-center text-lg font-bold text-gray-600 dark:text-gray-300">На сегодня все!</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2 text-center max-w-[200px]">
            Планов нет. Наслаждайтесь отдыхом и чашечкой кофе.
          </p>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 p-8 animate-fade-in-up">
        <div className="w-24 h-24 bg-indigo-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6 animate-float transition-colors">
          <CalendarDays size={40} className="text-indigo-300 dark:text-indigo-400" />
        </div>
        <p className="text-center text-lg font-medium text-gray-500 dark:text-gray-400">Нет событий</p>
        <p className="text-sm text-gray-400 dark:text-gray-600 mt-2 text-center max-w-[200px]">
          Попробуй написать: "Обед с Анной завтра в 12:30"
        </p>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="p-5 pb-24 md:pb-5 overflow-y-auto h-full scrollbar-hide">
      {events.map((event, index) => {
        const eventDate = new Date(event.start_time);
        const eventEndDate = event.end_time ? new Date(event.end_time) : new Date(eventDate.getTime() + 60 * 60 * 1000);

        const today = isToday(event.start_time);
        const isSelected = !isMyDayMode && selectedDate ? isSameDay(eventDate, selectedDate) : false;
        const isDeleting = deletingIds.has(event.id);
        const isCompleted = event.completed;
        const isAllDay = event.isAllDay;

        // Check if event is in the past (only relevant for Today/MyDay mode logic mostly, but good generally)
        // If it's all day, it expires at the end of the day.
        const isPast = !isCompleted && !isAllDay && eventEndDate < now;

        const startTime = formatTime(event.start_time);
        const endTime = event.end_time ? formatTime(event.end_time) : null;
        const reminderLabel = getReminderLabel(event.reminderMinutes);
        const recurrenceLabel = getRecurrenceLabel(event.recurrence, event.recurrenceInterval);

        return (
          <div
            key={event.id}
            id={`event-${event.id}`}
            onClick={() => onEdit(event)}
            className={`group relative rounded-3xl p-5 shadow-sm hover:shadow-lg dark:hover:shadow-black/30 transition-all duration-500 ease-out border mb-4 cursor-pointer
              ${isDeleting ? 'animate-fade-out' : 'animate-fade-in-up'}
              ${isSelected
                ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800/50 ring-1 ring-indigo-500/30 scale-[1.02]'
                : isPast && isMyDayMode
                  ? 'bg-gray-50/50 dark:bg-gray-800/30 border-gray-100 dark:border-gray-700/50 opacity-75'
                  : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'
              }
              ${isCompleted ? 'opacity-60 grayscale-[0.8]' : ''}
              ${isMyDayMode && !isPast ? 'border-l-4 border-l-orange-400 dark:border-l-orange-500' : ''}
              ${isMyDayMode && isPast ? 'border-l-4 border-l-gray-300 dark:border-l-gray-600' : ''}
            `}
            style={{ animationDelay: isDeleting ? '0s' : `${Math.min(index * 0.05, 1.0)}s` }}
          >
            {/* Today indicator (Hide in My Day mode since everything is today) */}
            {today && !isCompleted && !isMyDayMode && (
              <div className="absolute top-4 right-4 flex items-center space-x-1 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-full">
                <Sparkles size={12} className="text-indigo-500 dark:text-indigo-400" />
                <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">Сегодня</span>
              </div>
            )}

            <div className="flex items-start gap-4">

              {/* Checkbox */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleComplete(event.id, !isCompleted);
                }}
                className={`mt-1 flex-shrink-0 transition-all duration-300 hover:scale-110 
                  ${isCompleted
                    ? 'text-green-500 dark:text-green-400'
                    : isPast && isMyDayMode
                      ? 'text-gray-300 dark:text-gray-600 hover:text-indigo-500'
                      : 'text-gray-300 dark:text-gray-600 hover:text-indigo-500'
                  }`}
              >
                {isCompleted ? <CheckCircle size={24} strokeWidth={2.5} /> : <Circle size={24} />}
              </button>

              {/* Date Box */}
              <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-colors duration-300
                ${isSelected
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none'
                  : isMyDayMode
                    ? isPast
                      ? 'bg-gray-100 dark:bg-gray-700/50 text-gray-400 dark:text-gray-500'
                      : 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400'
                    : today
                      ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300'
                      : 'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }
              `}>
                <span className="text-xs font-medium uppercase">{eventDate.toLocaleDateString('ru-RU', { weekday: 'short' })}</span>
                <span className="text-xl font-bold">{eventDate.getDate()}</span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className={`font-extrabold text-2xl truncate pr-14 transition-all duration-300 flex items-center gap-2
                  ${isSelected ? 'text-indigo-900 dark:text-indigo-100' : ''}
                  ${isPast && isMyDayMode && !isSelected ? 'text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-gray-100'}
                  ${isCompleted ? 'line-through text-gray-400 dark:text-gray-500' : 'group-hover:text-indigo-600 dark:group-hover:text-indigo-300'}
                `}>
                  {event.color && (
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: event.color }} />
                  )}
                  {event.title}
                </h3>

                <div className={`flex items-center text-sm mt-1 space-x-3 
                   ${isPast && isMyDayMode && !isSelected ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400'}
                `}>
                  <div className="flex items-center">
                    {isAllDay ? (
                      <>
                        <Sun size={14} className={`mr-1.5 ${isSelected ? 'text-indigo-500' : isMyDayMode && !isPast ? 'text-orange-400' : 'text-indigo-400'}`} />
                        <span className="font-medium">Весь день</span>
                      </>
                    ) : (
                      <>
                        <Clock size={14} className={`mr-1.5 ${isSelected ? 'text-indigo-500' : isMyDayMode && !isPast ? 'text-orange-400' : isPast ? 'text-gray-400' : 'text-indigo-400'}`} />
                        <span>
                          {startTime}
                          {endTime && endTime !== startTime && (
                            <>
                              <span className="text-gray-400 mx-1">-</span>
                              {endTime}
                            </>
                          )}
                        </span>
                        {isPast && isMyDayMode && (
                          <span className="ml-2 text-[10px] font-bold bg-gray-100 dark:bg-gray-700 text-gray-400 px-1.5 py-0.5 rounded-full flex items-center">
                            <History size={10} className="mr-1" /> Завершено
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  {reminderLabel && !isCompleted && !isPast && (
                    <div className="flex items-center text-orange-500 dark:text-orange-400" title="Напоминание">
                      <Bell size={12} className="mr-1" />
                      <span className="text-xs font-medium">{reminderLabel}</span>
                    </div>
                  )}
                  {recurrenceLabel && (
                    <div className={`flex items-center ${isPast ? 'text-gray-400' : 'text-blue-500 dark:text-blue-400'}`} title="Повтор">
                      <Repeat size={12} className="mr-1" />
                      <span className="text-xs font-medium capitalize">{recurrenceLabel}</span>
                    </div>
                  )}
                </div>

                {event.description && (
                  <p className={`mt-3 text-sm p-3 rounded-2xl leading-relaxed transition-colors ${isSelected ? 'bg-white/50 dark:bg-black/20 text-gray-700 dark:text-gray-200' : 'text-gray-600 dark:text-gray-300 bg-gray-50/80 dark:bg-gray-700/50'}`}>
                    {event.description}
                  </p>
                )}
              </div>
            </div>

            {/* Actions - Floating on hover */}
            <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 transform scale-90 group-hover:scale-100">
              <button
                onClick={(e) => handleShare(e, event)}
                className="p-2 text-gray-300 dark:text-gray-600 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-all duration-200"
                title={copiedId === event.id ? "Скопировано!" : "Поделиться"}
              >
                {copiedId === event.id ? <Check size={18} /> : <Share2 size={18} />}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(event);
                }}
                className="p-2 text-gray-300 dark:text-gray-600 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-full transition-all duration-200"
                title="Редактировать"
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(event.id);
                }}
                className="p-2 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all duration-200"
                title="Удалить"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EventList;