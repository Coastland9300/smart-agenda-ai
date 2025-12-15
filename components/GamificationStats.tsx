import React from 'react';
import { Trophy, Flame } from 'lucide-react';

// We accept props if we lift state up, but for now let's assume it might be used inside context or passed down.
// Actually, to share state, we should probably lift useGamification to App.tsx or make a Context.
// For simplicity in this batch, let's assume we might pass props or use a Context later. 
// BUT, since we are implementing it now, let's update App.tsx to use the hook and pass values here?
// Or better: Let's make this component accept the values as props to be pure.

interface GamificationStatsProps {
    level: number;
    streak: number;
    xpProgress: number;
}

const GamificationStats: React.FC<GamificationStatsProps> = ({ level, streak, xpProgress }) => {
    return (
        <div className="flex items-center gap-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-gray-100 dark:border-gray-700 shadow-sm animate-fade-in">

            {/* Level Badge */}
            <div className="flex items-center gap-1.5 min-w-[60px]">
                <div className="p-1 bg-yellow-100 dark:bg-yellow-900/30 rounded-full text-yellow-600 dark:text-yellow-400">
                    <Trophy size={14} />
                </div>
                <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
                    Lvl {level}
                </span>
            </div>

            {/* Progress Bar */}
            <div className="hidden sm:block w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-500"
                    style={{ width: `${xpProgress}%` }}
                />
            </div>

            {/* Streak */}
            <div className="flex items-center gap-1 pl-2 border-l border-gray-200 dark:border-gray-600">
                <Flame size={16} className={`${streak > 0 ? 'text-orange-500 fill-orange-500' : 'text-gray-400'} transition-colors`} />
                <span className={`text-sm font-bold ${streak > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-500'}`}>
                    {streak}
                </span>
            </div>

        </div>
    );
};

export default GamificationStats;
