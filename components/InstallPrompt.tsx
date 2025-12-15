/**
 * @file: InstallPrompt.tsx
 * @description: A subtle floating button/banner to prompt PWA installation.
 * @dependencies: lucide-react, usePWA
 * @created: 2025-12-15
 */
import React from 'react';
import { Download, X } from 'lucide-react';

interface InstallPromptProps {
    onInstall: () => void;
    onDismiss: () => void;
}

const InstallPrompt: React.FC<InstallPromptProps> = ({ onInstall, onDismiss }) => {
    return (
        <div className="fixed bottom-20 left-4 right-4 md:bottom-6 md:left-auto md:right-6 md:w-auto z-50 animate-fade-in-up">
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-4 rounded-2xl shadow-xl shadow-indigo-200 dark:shadow-black/50 flex items-center gap-4 border border-indigo-500/50 backdrop-blur-md">
                <div className="bg-white/20 p-2 rounded-xl">
                    <Download size={24} className="text-white" />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-sm">Установить приложение</h3>
                    <p className="text-xs text-indigo-100 opacity-90">Добавьте на главный экран для быстрого доступа.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onDismiss}
                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-indigo-100"
                    >
                        <X size={18} />
                    </button>
                    <button
                        onClick={onInstall}
                        className="bg-white text-indigo-700 font-bold text-xs py-2 px-4 rounded-lg hover:bg-indigo-50 transition-all active:scale-95 shadow-sm"
                    >
                        Установить
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InstallPrompt;
