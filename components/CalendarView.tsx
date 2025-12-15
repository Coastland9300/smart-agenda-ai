/**
 * @file: components/CalendarView.tsx
 * @description: Calendar grid view with drag-and-drop support for events.
 * @dependencies: react, @dnd-kit/core, lucide-react, types.ts
 * @created: 2025-12-15
 */

import React, { useState, useMemo } from 'react';
import { CalendarEvent } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DndContext, useDraggable, useDroppable, DragEndEvent } from '@dnd-kit/core';

interface CalendarViewProps {
  events: CalendarEvent[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onEventDrop?: (eventId: string | number, newDate: Date) => void;
}

const DraggableEventDot = ({ event }: { event: CalendarEvent }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `event-${event.id}`,
    data: { eventId: event.id }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 50,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className="w-2 h-2 rounded-full cursor-move hover:scale-150 transition-transform"
      title={event.title}
    >
      <div
        className="w-full h-full rounded-full"
        style={{ backgroundColor: event.color || '#4F46E5' }}
      />
    </div>
  );
};

const DroppableDay = ({
  day,
  date,
  isCurrentDay,
  isSelectedDay,
  dayEvents,
  onClick,
  children
}: {
  day: number,
  date: Date,
  isCurrentDay: boolean,
  isSelectedDay: boolean,
  dayEvents: CalendarEvent[],
  onClick: () => void,
  children?: React.ReactNode
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `day-${date.toISOString()}`,
    data: { date }
  });

  let containerClasses = "aspect-square rounded-xl flex flex-col items-center justify-start pt-1 md:pt-2 relative text-sm transition-all cursor-pointer ";

  if (isSelectedDay) {
    containerClasses += "bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none scale-105 z-10 font-bold ";
  } else if (isCurrentDay) {
    containerClasses += "text-indigo-600 dark:text-indigo-300 font-extrabold bg-indigo-50 dark:bg-indigo-900/40 border-2 border-indigo-200 dark:border-indigo-700 ";
  } else {
    containerClasses += "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium ";
  }

  if (isOver) {
    containerClasses += " ring-2 ring-green-400 bg-green-50 dark:bg-green-900/20";
  }

  return (
    <div
      ref={setNodeRef}
      onClick={onClick}
      className={containerClasses}
      role="button"
    >
      <span className="z-10 mb-1">{day}</span>

      {/* Event Dots Container */}
      <div className="flex flex-wrap justify-center gap-1 px-1 w-full relative z-20">
        {dayEvents.slice(0, 4).map(evt => (
          <DraggableEventDot key={evt.id} event={evt} />
        ))}
        {dayEvents.length > 4 && (
          <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
        )}
      </div>
      {children}
    </div>
  );
};

const CalendarView: React.FC<CalendarViewProps> = ({ events, selectedDate, onSelectDate, onEventDrop }) => {
  const [currentViewDate, setCurrentViewDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    let day = new Date(year, month, 1).getDay();
    day = day === 0 ? 6 : day - 1;
    return day;
  };

  const nextMonth = () => {
    setCurrentViewDate(new Date(currentViewDate.getFullYear(), currentViewDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentViewDate(new Date(currentViewDate.getFullYear(), currentViewDate.getMonth() - 1, 1));
  };

  const daysInMonth = getDaysInMonth(currentViewDate);
  const firstDay = getFirstDayOfMonth(currentViewDate);

  // Group events by day
  const eventsByDay = useMemo(() => {
    const map = new Map<number, CalendarEvent[]>();
    const currentMonth = currentViewDate.getMonth();
    const currentYear = currentViewDate.getFullYear();

    events.forEach(e => {
      const eDate = new Date(e.start_time);
      if (eDate.getMonth() === currentMonth && eDate.getFullYear() === currentYear) {
        const d = eDate.getDate();
        if (!map.has(d)) map.set(d, []);
        map.get(d)!.push(e);
      }
    });
    return map;
  }, [events, currentViewDate]);

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() &&
      currentViewDate.getMonth() === today.getMonth() &&
      currentViewDate.getFullYear() === today.getFullYear();
  };

  const isSelected = (day: number) => {
    return day === selectedDate.getDate() &&
      currentViewDate.getMonth() === selectedDate.getMonth() &&
      currentViewDate.getFullYear() === selectedDate.getFullYear();
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !onEventDrop) return;

    const eventId = active.data.current?.eventId;
    const newDate = over.data.current?.date;

    if (eventId && newDate) {
      onEventDrop(eventId, newDate);
    }
  };

  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="p-4 bg-white dark:bg-gray-800 rounded-3xl mb-6 shadow-sm border border-gray-100 dark:border-gray-700 animate-fade-in-up">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white capitalize">
            {currentViewDate.toLocaleString('ru-RU', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
              <ChevronLeft size={20} className="text-gray-600 dark:text-gray-300" />
            </button>
            <button onClick={nextMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
              <ChevronRight size={20} className="text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-400 dark:text-gray-500 py-1">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const date = new Date(currentViewDate.getFullYear(), currentViewDate.getMonth(), day);

            return (
              <DroppableDay
                key={day}
                day={day}
                date={date}
                isCurrentDay={isToday(day)}
                isSelectedDay={isSelected(day)}
                dayEvents={eventsByDay.get(day) || []}
                onClick={() => onSelectDate(date)}
              />
            );
          })}
        </div>
      </div>
    </DndContext>
  );
};

export default CalendarView;