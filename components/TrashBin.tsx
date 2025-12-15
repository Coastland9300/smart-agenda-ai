import React, { useMemo } from 'react';
import { CalendarEvent } from '../types';
import { X, RotateCcw, Trash2, AlertCircle } from 'lucide-react';

interface TrashBinProps {
    isOpen: boolean;
    onClose: () => void;
    deletedEvents: CalendarEvent[];
    onRestore: (id: string | number) => void;
    onPermanentDelete: (id: string | number) => void;
    onEmptyTrash: () => void;
}

const TrashBin: React.FC<TrashBinProps> = ({
    isOpen,
    onClose,
    deletedEvents,
    onRestore,
    onPermanentDelete,
    onEmptyTrash
}) => {
    const sortedEvents = useMemo(() => {
        return [...deletedEvents].sort((a, b) => {
            const aTime = a.deletedAt ? new Date(a.deletedAt).getTime() : 0;
            const bTime = b.deletedAt ? new Date(b.deletedAt).getTime() : 0;
            return bTime - aTime; // Most recent first
        });
    }, [deletedEvents]);

    const getDaysUntilDelete = (deletedAt?: string) => {
        if (!deletedAt) return 30;
        const deleted = new Date(deletedAt);
        const now = new Date();
        const diffMs = now.getTime() - deleted.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        return Math.max(0, 30 - diffDays);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
                            <Trash2 size={20} className="text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Корзина</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {deletedEvents.length} {deletedEvents.length === 1 ? 'событие' : 'событий'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                    >
                        <X size={20} className="text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {deletedEvents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                                <Trash2 size={32} className="text-gray-400" />
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 font-medium">Корзина пуста</p>
                            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                                Удаленные события появятся здесь
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {sortedEvents.map(event => {
                                const daysLeft = getDaysUntilDelete(event.deletedAt);
                                return (
                                    <div
                                        key={event.id}
                                        className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all group"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-medium text-gray-800 dark:text-white truncate">
                                                    {event.title}
                                                </h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                    {new Date(event.start_time).toLocaleDateString('ru-RU', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <AlertCircle size={14} className="text-orange-500" />
                                                    <span className="text-xs text-orange-600 dark:text-orange-400">
                                                        Удалится через {daysLeft} {daysLeft === 1 ? 'день' : 'дней'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => onRestore(event.id)}
                                                    className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                                                    title="Восстановить"
                                                >
                                                    <RotateCcw size={16} />
                                                </button>
                                                <button
                                                    onClick={() => onPermanentDelete(event.id)}
                                                    className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors opacity-0 group-hover:opacity-100"
                                                    title="Удалить навсегда"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {deletedEvents.length > 0 && (
                    <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                        <button
                            onClick={onEmptyTrash}
                            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            <Trash2 size={18} />
                            Очистить корзину
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrashBin;
