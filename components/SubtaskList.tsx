import React, { useState } from 'react';
import { Plus, X, Check } from 'lucide-react';
import { Subtask } from '../types';

interface SubtaskListProps {
    subtasks: Subtask[];
    onUpdate: (subtasks: Subtask[]) => void;
    onSubtaskComplete?: (subtaskId: string) => void;
}

const SubtaskList: React.FC<SubtaskListProps> = ({ subtasks, onUpdate, onSubtaskComplete }) => {
    const [newSubtaskText, setNewSubtaskText] = useState('');

    const addSubtask = () => {
        if (!newSubtaskText.trim()) return;

        const newSubtask: Subtask = {
            id: Date.now().toString(),
            text: newSubtaskText.trim(),
            completed: false
        };

        onUpdate([...subtasks, newSubtask]);
        setNewSubtaskText('');
    };

    const toggleSubtask = (id: string) => {
        const updated = subtasks.map(st =>
            st.id === id ? { ...st, completed: !st.completed } : st
        );
        onUpdate(updated);

        // Trigger XP callback if completing
        const subtask = subtasks.find(st => st.id === id);
        if (subtask && !subtask.completed && onSubtaskComplete) {
            onSubtaskComplete(id);
        }
    };

    const deleteSubtask = (id: string) => {
        onUpdate(subtasks.filter(st => st.id !== id));
    };

    const completedCount = subtasks.filter(st => st.completed).length;
    const progress = subtasks.length > 0 ? (completedCount / subtasks.length) * 100 : 0;

    return (
        <div className="space-y-3">
            {/* Progress Bar */}
            {subtasks.length > 0 && (
                <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>Прогресс</span>
                        <span>{completedCount}/{subtasks.length}</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Subtask List */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
                {subtasks.map((subtask) => (
                    <div
                        key={subtask.id}
                        className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg group hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
                    >
                        <button
                            onClick={() => toggleSubtask(subtask.id)}
                            className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${subtask.completed
                                    ? 'bg-green-500 border-green-500'
                                    : 'border-gray-300 dark:border-gray-600 hover:border-green-400'
                                }`}
                        >
                            {subtask.completed && <Check size={12} className="text-white" />}
                        </button>
                        <span
                            className={`flex-1 text-sm ${subtask.completed
                                    ? 'line-through text-gray-400 dark:text-gray-500'
                                    : 'text-gray-700 dark:text-gray-300'
                                }`}
                        >
                            {subtask.text}
                        </span>
                        <button
                            onClick={() => deleteSubtask(subtask.id)}
                            className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-all"
                        >
                            <X size={14} className="text-red-500" />
                        </button>
                    </div>
                ))}
            </div>

            {/* Add New Subtask */}
            <div className="flex gap-2">
                <input
                    type="text"
                    value={newSubtaskText}
                    onChange={(e) => setNewSubtaskText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addSubtask()}
                    placeholder="Добавить подзадачу..."
                    className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                />
                <button
                    onClick={addSubtask}
                    className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                >
                    <Plus size={18} />
                </button>
            </div>
        </div>
    );
};

export default SubtaskList;
