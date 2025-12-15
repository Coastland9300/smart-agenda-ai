import React from 'react';
import { Coffee, Plus, Wand2, Send, Settings, Sun, Moon } from 'lucide-react';
import GamificationStats from '../../components/GamificationStats';

interface HeaderProps {
  isMyDayMode: boolean;
  toggleMyDayMode: () => void;
  onOpenCreateModal: () => void;
  onOpenImportModal: () => void;
  onSendAgenda: () => void;
  onOpenSettings: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  gamification?: {
    level: number;
    streak: number;
    xpProgress: number;
    currentXP: number;
  };
}

const Header: React.FC<HeaderProps> = ({
  isMyDayMode,
  toggleMyDayMode,
  onOpenCreateModal,
  onOpenImportModal,
  onSendAgenda,
  onOpenSettings,
  isDarkMode,
  toggleTheme,
  gamification
}) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex gap-2">
      <button
        onClick={toggleMyDayMode}
        className={`hidden md:block p-3 rounded-full shadow-lg transition-all duration-300 border border-transparent
            ${isMyDayMode
            ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-200 dark:shadow-none scale-110 ring-2 ring-orange-200 dark:ring-orange-900'
            : 'bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border-white/20 dark:border-gray-700 text-gray-500 hover:text-orange-500 dark:text-gray-400 dark:hover:text-orange-400'
          }`}
        title={isMyDayMode ? "Выйти из режима 'Мой день'" : "Режим 'Мой день'"}
      >
        <Coffee size={20} className={isMyDayMode ? "animate-pulse" : ""} />
      </button>

      {gamification && (
        <div className="hidden sm:block">
          <GamificationStats
            level={gamification.level}
            streak={gamification.streak}
            xpProgress={gamification.xpProgress}
          />
        </div>
      )}

      <button
        onClick={onOpenCreateModal}
        className="hidden md:block p-3 bg-indigo-600 hover:bg-indigo-700 rounded-full shadow-lg shadow-indigo-200 dark:shadow-none text-white hover:scale-110 transition-all duration-300 group border border-transparent"
        title="Добавить событие"
      >
        <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500" />
      </button>
      <button
        onClick={onOpenImportModal}
        className="hidden md:block p-3 bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 rounded-full shadow-lg text-white hover:scale-110 transition-all duration-300 group border border-transparent"
        title="Умный импорт"
      >
        <Wand2 size={20} className="group-hover:rotate-12 transition-transform duration-500" />
      </button>
      <button
        onClick={onSendAgenda}
        className="hidden md:block p-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md rounded-full shadow-lg border border-white/20 dark:border-gray-700 text-blue-500 dark:text-blue-400 hover:scale-110 transition-all duration-300"
        title="Отправить расписание в Telegram"
      >
        <Send size={20} />
      </button>


      <button
        onClick={onOpenSettings}
        className="p-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md rounded-full shadow-lg border border-white/20 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:scale-110 transition-all duration-300 group"
        title="Настройки"
      >
        <Settings size={20} className="group-hover:rotate-90 transition-transform duration-500" />
      </button>
      <button
        onClick={toggleTheme}
        className="p-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md rounded-full shadow-lg border border-white/20 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:scale-110 transition-all duration-300"
        title="Тема"
      >
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>
    </div>
  );
};

export default Header;
