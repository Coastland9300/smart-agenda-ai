import { useState, useEffect } from 'react';

const XP_PER_LEVEL_BASE = 100;

interface GamificationState {
    xp: number;
    level: number;
    streak: number;
    lastCompletionDate: string | null;
}

export const useGamification = () => {
    const [state, setState] = useState<GamificationState>(() => {
        const saved = localStorage.getItem('smart-agenda-gamification');
        return saved ? JSON.parse(saved) : { xp: 0, level: 1, streak: 0, lastCompletionDate: null };
    });

    useEffect(() => {
        localStorage.setItem('smart-agenda-gamification', JSON.stringify(state));
    }, [state]);

    // Check streak on mount/load
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        const lastDate = state.lastCompletionDate;

        if (lastDate && lastDate !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            // If last completion was not yesterday and not today, streak breaks
            if (lastDate !== yesterdayStr) {
                setState(prev => ({ ...prev, streak: 0 }));
            }
        }
    }, []);

    const addXP = (amount: number) => {
        setState(prev => {
            const newXP = prev.xp + amount;
            // Simple sqrt progression or linear scaling? Let's use linear scaling * level factor for now or just simple steps
            // Level = 1 + floor(xp / 100)
            const newLevel = 1 + Math.floor(newXP / XP_PER_LEVEL_BASE);

            return {
                ...prev,
                xp: newXP,
                level: newLevel
            };
        });
    };

    const completeTask = () => {
        const today = new Date().toISOString().split('T')[0];

        setState(prev => {
            let newStreak = prev.streak;

            // Update streak only if not already completed today
            if (prev.lastCompletionDate !== today) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];

                if (prev.lastCompletionDate === yesterdayStr) {
                    newStreak += 1;
                } else {
                    newStreak = 1; // Start new streak or reset if broken (though effect above handles break)
                }
            }

            return {
                ...prev,
                streak: newStreak,
                lastCompletionDate: today
            };
        });

        addXP(10); // 10 XP per task
    };

    const currentLevelProgress = () => {
        // XP within current level
        // Total XP for current level start = (Level - 1) * 100
        const currentLevelStartXP = (state.level - 1) * XP_PER_LEVEL_BASE;
        const xpInLevel = state.xp - currentLevelStartXP;
        return (xpInLevel / XP_PER_LEVEL_BASE) * 100;
    };

    return {
        xp: state.xp,
        level: state.level,
        streak: state.streak,
        addXP,
        completeTask,
        currentLevelProgress
    };
};
