import React from 'react';
import { Filter, X } from 'lucide-react';

interface FilterControlsProps {
    categories: string[];
    selectedCategory: string | null;
    onCategoryChange: (category: string | null) => void;
    filterStatus: 'all' | 'active' | 'completed';
    onStatusChange: (status: 'all' | 'active' | 'completed') => void;
    onClearFilters: () => void;
    hasActiveFilters: boolean;
}

const FilterControls: React.FC<FilterControlsProps> = ({
    categories,
    selectedCategory,
    onCategoryChange,
    filterStatus,
    onStatusChange,
    onClearFilters,
    hasActiveFilters
}) => {
    return (
        <div className="flex flex-wrap items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Filter size={16} />
                <span className="text-sm font-medium">Фильтры:</span>
            </div>

            {/* Status Filter */}
            <div className="flex gap-1">
                {(['all', 'active', 'completed'] as const).map((status) => (
                    <button
                        key={status}
                        onClick={() => onStatusChange(status)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${filterStatus === status
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                            }`}
                    >
                        {status === 'all' ? 'Все' : status === 'active' ? 'Активные' : 'Завершенные'}
                    </button>
                ))}
            </div>

            {/* Category Filter */}
            {categories.length > 0 && (
                <select
                    value={selectedCategory || ''}
                    onChange={(e) => onCategoryChange(e.target.value || null)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                >
                    <option value="">Все категории</option>
                    {categories.map((category) => (
                        <option key={category} value={category}>
                            {category}
                        </option>
                    ))}
                </select>
            )}

            {/* Clear Filters */}
            {hasActiveFilters && (
                <button
                    onClick={onClearFilters}
                    className="ml-auto px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-200 flex items-center gap-1"
                >
                    <X size={14} />
                    Сбросить
                </button>
            )}
        </div>
    );
};

export default FilterControls;
