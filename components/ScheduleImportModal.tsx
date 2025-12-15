import React, { useState } from 'react';
import { X, Sparkles, Calendar, AlignLeft, Wand2 } from 'lucide-react';

interface ScheduleImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (text: string) => void;
}

const ScheduleImportModal: React.FC<ScheduleImportModalProps> = ({ isOpen, onClose, onImport }) => {
  const [activeTab, setActiveTab] = useState<'day' | 'text' | 'file'>('day');
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });
  const [textInput, setTextInput] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let finalPrompt = '';

    if (activeTab === 'day') {
      // Format date to be very clear for AI
      const dateObj = new Date(selectedDate);
      const dateStr = dateObj.toLocaleDateString('ru-RU', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      finalPrompt = `Расписание на конкретную дату ${selectedDate} (${dateStr}):\n${textInput}`;
    } else {
      finalPrompt = textInput;
    }

    onImport(finalPrompt);
    setTextInput('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/20 dark:bg-black/50 backdrop-blur-sm animate-fade-in-up">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-gray-700 transform transition-all max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="p-6 pb-2 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl text-indigo-600 dark:text-indigo-400">
              <Wand2 size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Умный импорт</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500 dark:text-gray-400">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex p-2 bg-gray-50/80 dark:bg-gray-900/50 mx-6 mt-4 rounded-xl flex-shrink-0">
          <button
            onClick={() => setActiveTab('day')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'day'
              ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
          >
            На один день
          </button>
          <button
            onClick={() => setActiveTab('text')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'text'
              ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
          >
            Произвольный текст
          </button>
          <button
            onClick={() => setActiveTab('file')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'file'
              ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
          >
            Файл (.ics)
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto scrollbar-hide">
          <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-5">

            {activeTab === 'day' ? (
              <div className="space-y-4 animate-slide-in">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                    <Calendar size={16} className="text-indigo-500" /> Выберите дату
                  </label>
                  <input
                    type="date"
                    required
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                    <AlignLeft size={16} className="text-indigo-500" /> Список задач
                  </label>
                  <div className="relative">
                    <textarea
                      required
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white resize-none h-32 scrollbar-hide"
                      placeholder={`10:00 Встреча с командой\n13:30 Обед\n19:00 Спортзал`}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Просто перечислите время и дела. Дату писать не нужно.
                  </p>
                </div>
              </div>
            ) : activeTab === 'text' ? (
              <div className="space-y-4 animate-slide-in">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                    <AlignLeft size={16} className="text-indigo-500" /> Ваше расписание
                  </label>
                  <textarea
                    required
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white resize-none h-48 scrollbar-hide"
                    placeholder={`Понедельник:\n10:00 Планерка\n\nВторник:\n15:00 Врач\n\nСреда:\nВесь день учить React`}
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Вставьте любой текст. AI сам найдет даты и время.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-slide-in">
                <div className="p-6 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl flex flex-col items-center justify-center text-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-full mb-3 text-indigo-500">
                    <Calendar size={24} />
                  </div>
                  <h3 className="text-sm font-medium text-gray-800 dark:text-white mb-1">Загрузите .ics файл</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                    Импорт событий из Google Calendar или Outlook
                  </p>
                  <input
                    type="file"
                    accept=".ics"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const text = await file.text();
                      const { parseICal } = await import('../src/utils/icalParser');
                      const { db } = await import('../services/db');

                      const events = parseICal(text);
                      if (events.length > 0) {
                        if (confirm(`Найдено событий: ${events.length}. Импортировать?`)) {
                          // We need to cast Partial<CalendarEvent> to Omit<CalendarEvent,'id'> for addEvents
                          // Assuming parser returns enough data. Parser returns title and times.
                          // Need to ensure defaults.
                          const validEvents = events.filter(e => e.title && e.start_time).map(e => ({
                            title: e.title!,
                            start_time: e.start_time!,
                            end_time: e.end_time,
                            description: e.description || '',
                            recurrence: 'none',
                            reminderMinutes: 15,
                            isAllDay: false,
                            ...e
                          })) as any;

                          await db.addEvents(validEvents);
                          alert('Импорт завершен!');
                          window.location.reload();
                        }
                      } else {
                        alert('Событий не найдено');
                      }
                    }}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-indigo-50 file:text-indigo-700
                      hover:file:bg-indigo-100 dark:file:bg-indigo-900/30 dark:file:text-indigo-300
                      cursor-pointer
                    "
                  />
                </div>
              </div>
            )}

            {activeTab !== 'file' && (
              <div className="pt-2">
                <button type="submit" className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none hover:scale-[1.02]">
                  <Sparkles size={18} />
                  Распознать и добавить
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ScheduleImportModal;