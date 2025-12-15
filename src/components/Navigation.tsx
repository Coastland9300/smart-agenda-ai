import React from 'react';
import { MessageSquareText, CalendarCheck, LayoutGrid } from 'lucide-react';

interface NavigationProps {
  activeTab: 'chat' | 'calendar' | 'today';
  setActiveTab: (tab: 'chat' | 'calendar' | 'today') => void;
  setIsMyDayMode: (mode: boolean) => void;
  setSelectedDate: (date: Date) => void;
}

const Navigation: React.FC<NavigationProps> = ({ 
  activeTab, 
  setActiveTab, 
  setIsMyDayMode, 
  setSelectedDate 
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border-t border-gray-200 dark:border-gray-700 flex justify-around items-center h-16 z-50 px-2">
      <button 
        onClick={() => setActiveTab('chat')}
        className={`flex-1 flex flex-col items-center justify-center h-full transition-all duration-300 ${activeTab === 'chat' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
      >
        <div className={`p-1 rounded-xl transition-all ${activeTab === 'chat' ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}>
           <MessageSquareText size={24} strokeWidth={activeTab === 'chat' ? 2.5 : 2} />
        </div>
        <span className="text-[10px] font-medium mt-1">Чат</span>
      </button>

      <button 
        onClick={() => {
          setActiveTab('today');
          setIsMyDayMode(true);
          setSelectedDate(new Date());
        }}
        className={`flex-1 flex flex-col items-center justify-center h-full transition-all duration-300 ${activeTab === 'today' ? 'text-orange-500 dark:text-orange-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
      >
        <div className={`p-1 rounded-xl transition-all ${activeTab === 'today' ? 'bg-orange-50 dark:bg-orange-900/20' : ''}`}>
           <CalendarCheck size={24} strokeWidth={activeTab === 'today' ? 2.5 : 2} />
        </div>
        <span className="text-[10px] font-medium mt-1">Сегодня</span>
      </button>

      <button 
        onClick={() => {
          setActiveTab('calendar');
          setIsMyDayMode(false);
        }}
        className={`flex-1 flex flex-col items-center justify-center h-full transition-all duration-300 ${activeTab === 'calendar' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
      >
        <div className={`p-1 rounded-xl transition-all ${activeTab === 'calendar' ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}>
          <LayoutGrid size={24} strokeWidth={activeTab === 'calendar' ? 2.5 : 2} />
        </div>
        <span className="text-[10px] font-medium mt-1">Календарь</span>
      </button>
    </div>
  );
};

export default Navigation;
