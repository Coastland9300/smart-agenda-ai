/**
 * @file: components/CreateEventModal.tsx
 * @description: Modal for creating and editing calendar events with advanced options.
 * @dependencies: react, lucide-react, types.ts
 * @created: 2025-12-15
 */

import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, Clock, Type, AlignLeft, ArrowRight, Bell, Repeat, Sun, Sparkles } from 'lucide-react';
import { CalendarEvent, Subtask } from '../types';
import SubtaskList from './SubtaskList';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<CalendarEvent, 'id'>) => void;
  initialData?: CalendarEvent | null;
  defaultReminderMinutes?: number;
}

const CreateEventModal: React.FC<CreateEventModalProps> = ({ isOpen, onClose, onSave, initialData, defaultReminderMinutes = 0 }) => {
  // Helpers for time manipulation
  const getTimeString = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Pure math-based time addition to ensure stability
  const addHours = (timeStr: string, hours: number) => {
    const [h, m] = timeStr.split(':').map(Number);
    let totalMinutes = h * 60 + m + (hours * 60);

    // Handle overflow (24h)
    if (totalMinutes >= 24 * 60) {
      totalMinutes = totalMinutes % (24 * 60);
    }

    const newH = Math.floor(totalMinutes / 60);
    const newM = totalMinutes % 60;

    return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
  };

  const now = new Date();
  // Round to nearest 5 minutes for better UX
  const coeff = 1000 * 60 * 5;
  const roundedNow = new Date(Math.ceil(now.getTime() / coeff) * coeff);

  const defaultDate = getLocalDateString(roundedNow);
  const defaultTime = getTimeString(roundedNow);
  const defaultEndTime = addHours(defaultTime, 1);

  const [title, setTitle] = useState('');
  const [date, setDate] = useState(defaultDate);
  const [startTime, setStartTime] = useState(defaultTime);
  const [endTime, setEndTime] = useState(defaultEndTime);
  const [description, setDescription] = useState('');
  const [reminder, setReminder] = useState<number>(0);
  const [recurrence, setRecurrence] = useState<'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'>('none');
  const [recurrenceInterval, setRecurrenceInterval] = useState<number>(1);
  const [isAllDay, setIsAllDay] = useState(false);
  const [category, setCategory] = useState<'work' | 'personal' | 'health' | 'edu' | 'other'>('other');
  const [color, setColor] = useState('#4F46E5');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        const start = new Date(initialData.start_time);
        const end = initialData.end_time ? new Date(initialData.end_time) : new Date(start.getTime() + 3600000);

        setDate(getLocalDateString(start));
        setStartTime(getTimeString(start));
        setEndTime(getTimeString(end));
        setTitle(initialData.title);
        setDescription(initialData.description || '');
        setReminder(initialData.reminderMinutes || 0);
        setRecurrence(initialData.recurrence || 'none');
        setRecurrenceInterval(initialData.recurrenceInterval || 1);
        setIsAllDay(initialData.isAllDay || false);
      } else {
        const n = new Date();
        // Round to nearest 5 minutes
        const rounded = new Date(Math.ceil(n.getTime() / (1000 * 60 * 5)) * (1000 * 60 * 5));

        const d = getLocalDateString(rounded);
        const t = getTimeString(rounded);

        setDate(d);
        setStartTime(t);
        setEndTime(addHours(t, 1)); // Default end time is start + 1 hour
        setTitle('');
        setDescription('');
        setReminder(defaultReminderMinutes);
        setRecurrence('none');
        setRecurrenceInterval(1);
        setIsAllDay(false);
        setSubtasks([]);
      }
    }
  }, [isOpen, initialData, defaultReminderMinutes]);

  // Initialize subtasks from initialData
  useEffect(() => {
    if (isOpen && initialData?.subtasks) {
      setSubtasks(initialData.subtasks);
    } else if (isOpen && !initialData) {
      setSubtasks([]);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = e.target.value;

    // Calculate current duration to preserve it when changing start time
    const [h1, m1] = startTime.split(':').map(Number);
    const [h2, m2] = endTime.split(':').map(Number);

    // Convert to minutes
    const startMins = h1 * 60 + m1;
    let endMins = h2 * 60 + m2;

    // Handle overnight duration (e.g. 23:00 to 01:00)
    if (endMins < startMins) {
      endMins += 24 * 60;
    }

    let durationMins = endMins - startMins;

    // Sanity check: if duration is negative or 0 (shouldn't happen with logic above), default to 1 hour
    if (durationMins <= 0) durationMins = 60;

    // Calculate new end time based on new start time + duration
    const [nh, nm] = newStart.split(':').map(Number);
    const newStartMins = nh * 60 + nm;
    let newEndMins = newStartMins + durationMins;

    // Normalize to 24h format
    newEndMins = newEndMins % (24 * 60);

    const eh = Math.floor(newEndMins / 60);
    const em = newEndMins % 60;

    const newEndTimeStr = `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;

    setStartTime(newStart);
    setEndTime(newEndTimeStr);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Construct Start Date object
    const finalStartTime = isAllDay ? '00:00' : startTime;
    const startDateTime = new Date(`${date}T${finalStartTime}`);

    // Construct End Date object
    let endDateTime = new Date(startDateTime);
    if (!isAllDay) {
      endDateTime = new Date(`${date}T${endTime}`);
      // If end time is earlier than start time (e.g. 23:00 -> 01:00), it implies the next day
      if (endTime < startTime) {
        endDateTime.setDate(endDateTime.getDate() + 1);
      }
    } else {
      // All Day event ends at end of day
      endDateTime.setHours(23, 59, 59, 999);
    }

    onSave({
      title,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      description: description || undefined,
      reminderMinutes: reminder > 0 ? reminder : undefined,
      recurrence: recurrence === 'none' ? undefined : recurrence,
      recurrenceInterval: recurrenceInterval > 1 ? recurrenceInterval : 1,
      isAllDay,
      category,
      color
    });

    onClose();
  };

  const reminderOptions = [
    { value: 0, label: 'Без напоминания' },
    { value: 5, label: 'За 5 минут' },
    { value: 15, label: 'За 15 минут' },
    { value: 30, label: 'За 30 минут' },
    { value: 60, label: 'За 1 час' },
    { value: 1440, label: 'За 1 день' },
  ];

  const recurrenceOptions = [
    { value: 'none', label: 'Не повторять' },
    { value: 'daily', label: 'День' },
    { value: 'weekly', label: 'Неделю' },
    { value: 'monthly', label: 'Месяц' },
    { value: 'yearly', label: 'Год' },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/20 dark:bg-black/50 backdrop-blur-sm animate-fade-in-up">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-gray-700 transform transition-all">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {initialData ? 'Редактировать событие' : 'Новое событие'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500 dark:text-gray-400">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
              <Type size={16} className="text-indigo-500" /> Название
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
              placeholder="Например: Встреча с клиентом"
              autoFocus
            />
          </div>

          <div className="space-y-4">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                <Calendar size={16} className="text-indigo-500" /> Дата
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
              />
            </div>

            {/* Time / All Day Toggle */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Clock size={16} className="text-indigo-500" /> Время
                </label>

                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium ${isAllDay ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}>Весь день</span>
                  <button
                    type="button"
                    onClick={() => setIsAllDay(!isAllDay)}
                    className={`w-10 h-5 rounded-full transition-colors relative ${isAllDay ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${isAllDay ? 'left-[22px]' : 'left-0.5'}`} />
                  </button>
                </div>
              </div>

              {!isAllDay ? (
                <div className="flex items-center gap-3 animate-fade-in-up">
                  <div className="flex-1">
                    <input
                      type="time"
                      required
                      value={startTime}
                      onChange={handleStartTimeChange}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white text-center cursor-pointer"
                    />
                  </div>
                  <ArrowRight size={16} className="text-gray-400" />
                  <div className="flex-1">
                    <input
                      type="time"
                      required
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white text-center cursor-pointer"
                    />
                  </div>
                </div>
              ) : (
                <div className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 flex items-center justify-center gap-2 animate-fade-in-up">
                  <Sun size={18} />
                  <span className="text-sm">Событие на весь день</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Reminder */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                  <Bell size={16} className="text-indigo-500" /> Напоминание
                </label>
                <select
                  value={reminder}
                  onChange={(e) => setReminder(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white appearance-none cursor-pointer"
                >
                  {reminderOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Recurrence */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                  <Repeat size={16} className="text-indigo-500" />
                  {recurrence !== 'none' ? 'Повторять каждые' : 'Повтор'}
                </label>
                <div className="flex gap-2">
                  {recurrence !== 'none' && (
                    <div className="w-20 flex-shrink-0 animate-slide-in relative group">
                      <input
                        type="number"
                        min="1"
                        max="99"
                        value={recurrenceInterval}
                        onChange={(e) => setRecurrenceInterval(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-2 py-3 text-center rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                        title="Интервал повтора (например, 2 для 'раз в 2 недели')"
                      />
                      {recurrenceInterval > 1 && (
                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/80 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                          Например: раз в {recurrenceInterval} {recurrence === 'weekly' ? 'нед.' : 'дн.'}
                        </div>
                      )}
                    </div>
                  )}
                  <select
                    value={recurrence}
                    onChange={(e) => setRecurrence(e.target.value as any)}
                    className="flex-1 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white appearance-none cursor-pointer"
                  >
                    {recurrenceOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Category and Color */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                <AlignLeft size={16} className="text-indigo-500" /> Категория
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white appearance-none cursor-pointer"
              >
                <option value="other">Другое</option>
                <option value="work">Работа</option>
                <option value="personal">Личное</option>
                <option value="health">Здоровье</option>
                <option value="edu">Обучение</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                <Sparkles size={16} className="text-indigo-500" /> Цвет
              </label>
              <div className="flex gap-2">
                {['#4F46E5', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${color === c ? 'border-gray-600 dark:border-white scale-110' : 'border-transparent hover:scale-105'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
              <AlignLeft size={16} className="text-indigo-500" /> Описание (опционально)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white resize-none h-24"
              placeholder="Детали события..."
            />
          </div>

          {/* Subtasks Section */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Подзадачи
            </label>
            <SubtaskList
              subtasks={subtasks}
              onUpdate={setSubtasks}
            />
          </div>

          <div className="pt-2">
            <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none">
              <Save size={18} />
              {initialData ? 'Сохранить' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventModal;