import React from 'react';
import { Wand2, Plus } from 'lucide-react';

interface MobileActionsProps {
  activeTab: 'chat' | 'calendar' | 'today';
  onOpenImportModal: () => void;
  onOpenCreateModal: () => void;
}

const MobileActions: React.FC<MobileActionsProps> = ({ activeTab, onOpenImportModal, onOpenCreateModal }) => {
  return (
    <div className={`md:hidden fixed bottom-20 right-5 z-40 flex flex-col gap-3 items-center transition-all duration-300 ${activeTab === 'chat' ? 'translate-y-20 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>
      <button
        onClick={onOpenImportModal}
        className="p-3 bg-gradient-to-r from-violet-500 to-indigo-500 text-white rounded-full shadow-lg shadow-violet-300/50 dark:shadow-violet-900/50 hover:scale-105 active:scale-95 transition-all duration-300"
        title="Умный импорт"
      >
        <Wand2 size={24} />
      </button>

      <button
        onClick={onOpenCreateModal}
        className="p-4 bg-indigo-600 text-white rounded-full shadow-xl shadow-indigo-300/50 dark:shadow-indigo-900/50 hover:scale-105 active:scale-95 transition-all duration-300"
        title="Новое событие"
      >
        <Plus size={28} />
      </button>
    </div>
  );
};

export default MobileActions;
