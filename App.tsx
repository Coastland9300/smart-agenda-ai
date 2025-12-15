import React, { useState, useMemo } from 'react';
import { sendFullAgenda } from './services/telegram';
import ChatInterface from './components/ChatInterface';
import EventList from './components/EventList';
import CalendarView from './components/CalendarView';
import SettingsModal from './components/SettingsModal';
import CreateEventModal from './components/CreateEventModal';
import ScheduleImportModal from './components/ScheduleImportModal';
import { Coffee } from 'lucide-react';

import { useEvents } from './src/hooks/useEvents';
import { useAI } from './src/hooks/useAI';
import { useTheme } from './src/hooks/useTheme';
import { useReminders } from './src/hooks/useReminders';
import { CalendarEvent, AISettings } from './types';

import Header from './src/components/Header';
import Navigation from './src/components/Navigation';
import MobileActions from './src/components/MobileActions';

import { usePWA } from './src/hooks/usePWA';
import { useGamification } from './src/hooks/useGamification';
import InstallPrompt from './components/InstallPrompt';

const App: React.FC = () => {
  // State for Settings
  const [aiSettings, setAiSettings] = useState<AISettings>(() => {
    const saved = localStorage.getItem('ai_settings');
    return saved ? JSON.parse(saved) : {
      telegramBotToken: "",
      telegramChatId: "",
      defaultReminderMinutes: 0
    };
  });

  const handleSaveSettings = (newSettings: AISettings) => {
    setAiSettings(newSettings);
    localStorage.setItem('ai_settings', JSON.stringify(newSettings));
  };

  // State for Navigation/UI
  const [activeTab, setActiveTab] = useState<'chat' | 'calendar' | 'today'>('today');
  const [isMyDayMode, setIsMyDayMode] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  // Custom Hooks
  const { isDarkMode, toggleTheme } = useTheme();

  const {
    xp,
    level,
    streak,
    completeTask: completeGamifiedTask,
    currentLevelProgress
  } = useGamification();

  const { events, setEvents, addEvent, updateEvent, deleteEvent, toggleComplete } = useEvents(aiSettings, completeGamifiedTask);

  // Calculate incomplete tasks for today
  const incompleteCount = useMemo(() => {
    const today = new Date();
    return events.filter(e => {
      const eDate = new Date(e.start_time);
      return !e.completed &&
        eDate.getDate() === today.getDate() &&
        eDate.getMonth() === today.getMonth() &&
        eDate.getFullYear() === today.getFullYear();
    }).length;
  }, [events]);

  const { isInstallAvailable, installApp, isInstalled } = usePWA(incompleteCount);
  const [isInstallPromptDismissed, setIsInstallPromptDismissed] = useState(false);

  const { messages, setMessages, isProcessing, handleSendMessage } = useAI({
    events,
    aiSettings,
    setEvents,
    setActiveTab,
    setIsMyDayMode
  });
  useReminders(events); // Side-effect for notifications

  // Derived state
  const isMyDayActive = isMyDayMode || activeTab === 'today';
  const displayedEvents = useMemo(() => {
    if (isMyDayActive) {
      const today = new Date();
      return events.filter(e => {
        const eDate = new Date(e.start_time);
        return eDate.getDate() === today.getDate() &&
          eDate.getMonth() === today.getMonth() &&
          eDate.getFullYear() === today.getFullYear();
      });
    }
    return events.filter(e => {
      const eDate = new Date(e.start_time);
      return eDate.getDate() === selectedDate.getDate() &&
        eDate.getMonth() === selectedDate.getMonth() &&
        eDate.getFullYear() === selectedDate.getFullYear();
    });
  }, [events, isMyDayActive, selectedDate]);

  // Handlers
  const toggleMyDayMode = () => {
    const newState = !isMyDayMode;
    setIsMyDayMode(newState);
    if (newState) {
      setSelectedDate(new Date());
      setActiveTab('today');
    } else {
      setActiveTab('calendar');
    }
  };

  const handleSendAgendaToTelegram = async () => {
    if (!aiSettings.telegramBotToken || !aiSettings.telegramChatId) {
      setIsSettingsOpen(true);
      return;
    }
    await sendFullAgenda(events, aiSettings);
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'assistant',
      content: "Я отправил план на сегодня в ваш Telegram.",
      timestamp: Date.now()
    }]);
  };

  const handleSaveEvent = async (eventData: Omit<CalendarEvent, 'id'>) => {
    if (editingEvent) {
      await updateEvent(editingEvent.id, eventData);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Событие "${eventData.title}" обновлено.`,
        timestamp: Date.now()
      }]);
    } else {
      const newEvents = await addEvent(eventData,
        eventData.recurrence && eventData.recurrence !== 'none'
          ? (eventData.recurrence === 'daily' ? 90 : eventData.recurrence === 'weekly' ? 24 : 12)
          : 1
      );
      const firstEvent = newEvents[0];
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Создано вручную: "${firstEvent.title}" на ${new Date(firstEvent.start_time).toLocaleString('ru-RU')}`,
        timestamp: Date.now()
      }]);
    }
    setEditingEvent(null);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 overflow-hidden selection:bg-indigo-100 selection:text-indigo-700 dark:selection:bg-indigo-900 dark:selection:text-white transition-colors duration-300">

      {isInstallAvailable && !isInstallPromptDismissed && !isInstalled && (
        <InstallPrompt
          onInstall={installApp}
          onDismiss={() => setIsInstallPromptDismissed(true)}
        />
      )}

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
        currentSettings={aiSettings}
        onInstallApp={isInstallAvailable ? installApp : undefined}
      />

      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setTimeout(() => setEditingEvent(null), 300);
        }}
        onSave={handleSaveEvent}
        initialData={editingEvent}
        defaultReminderMinutes={aiSettings.defaultReminderMinutes}
      />

      <ScheduleImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleSendMessage}
      />

      <Header
        isMyDayMode={isMyDayMode}
        toggleMyDayMode={toggleMyDayMode}
        onOpenCreateModal={() => {
          setEditingEvent(null);
          setIsCreateModalOpen(true);
        }}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onSendAgenda={handleSendAgendaToTelegram}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        gamification={{
          level,
          streak,
          xpProgress: currentLevelProgress(),
          currentXP: xp
        }}
      />

      <MobileActions
        activeTab={activeTab}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onOpenCreateModal={() => {
          setEditingEvent(null);
          setIsCreateModalOpen(true);
        }}
      />

      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setIsMyDayMode={setIsMyDayMode}
        setSelectedDate={setSelectedDate}
      />

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full md:p-6 md:gap-8 h-full pb-16 md:pb-0">

        <div className={`flex-1 h-full transition-all duration-500 ease-in-out ${activeTab === 'chat' ? 'translate-x-0 opacity-100' : 'hidden md:block translate-x-0 opacity-100'}`}>
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            isProcessing={isProcessing}
            events={events} // Pass events for context-aware suggestions
          />
        </div>

        <div className={`w-full md:w-[400px] flex flex-col h-full transition-all duration-500 
          ${(activeTab === 'calendar' || activeTab === 'today') ? 'translate-x-0 opacity-100' : 'hidden md:flex translate-x-0 opacity-100'}`}
        >
          <div className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl md:rounded-[32px] shadow-2xl shadow-indigo-100/50 dark:shadow-black/50 border h-full flex flex-col overflow-hidden transition-all duration-300
             ${isMyDayActive
              ? 'border-orange-200 dark:border-orange-900/50'
              : 'border-white dark:border-gray-700'
            }
          `}>
            <div className={`p-6 border-b flex justify-between items-center transition-colors duration-300
               ${isMyDayActive
                ? 'bg-orange-50/80 dark:bg-orange-900/20 border-orange-100 dark:border-orange-900/30'
                : 'bg-white/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700'
              }
            `}>
              <h2 className={`font-bold text-xl flex items-center tracking-tight gap-2
                 ${isMyDayActive ? 'text-orange-700 dark:text-orange-400' : 'text-gray-800 dark:text-gray-100'}
              `}>
                {isMyDayActive && <Coffee size={24} className="animate-bounce-subtle" />}
                {isMyDayActive ? "Мой день" : "Расписание"}
              </h2>
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full
                 ${isMyDayActive
                  ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-300'
                  : 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
                }
              `}>
                {displayedEvents.length}
              </span>
            </div>

            {!isMyDayActive && (
              <div className="px-6 pt-4">
                <CalendarView
                  events={events}
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                  onEventDrop={async (eventId, newDate) => {
                    const event = events.find(e => e.id === eventId);
                    if (!event) return;

                    // Calculate time preservation
                    const oldStart = new Date(event.start_time);
                    const oldEnd = event.end_time ? new Date(event.end_time) : new Date(oldStart.getTime() + 60 * 60 * 1000);
                    const duration = oldEnd.getTime() - oldStart.getTime();

                    const newStartTime = new Date(newDate);
                    newStartTime.setHours(oldStart.getHours(), oldStart.getMinutes());

                    const newEndTime = new Date(newStartTime.getTime() + duration);

                    await updateEvent(event.id, {
                      start_time: newStartTime.toISOString(),
                      end_time: newEndTime.toISOString()
                    });

                    // If moving to a new day, select it? Maybe optional.
                    setSelectedDate(newDate);
                  }}
                />
              </div>
            )}

            <div className="flex-1 overflow-hidden bg-gray-50/30 dark:bg-gray-900/30">
              <EventList
                events={displayedEvents}
                selectedDate={isMyDayActive ? undefined : selectedDate}
                onDelete={deleteEvent}
                onEdit={(e) => {
                  setEditingEvent(e);
                  setIsCreateModalOpen(true);
                }}
                onToggleComplete={toggleComplete}
                isMyDayMode={isMyDayActive}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default App;