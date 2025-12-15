/**
 * @file: useHaptic.ts
 * @description: Hook for haptic feedback on supported devices
 * @dependencies: None (uses native Vibration API)
 * @created: 2025-12-15
 */

export const useHaptic = () => {
    const isSupported = 'vibrate' in navigator;

    const vibrate = (pattern: number | number[]) => {
        if (!isSupported) return;

        const enabled = localStorage.getItem('haptic_enabled') !== 'false';
        if (!enabled) return;

        try {
            navigator.vibrate(pattern);
        } catch (error) {
            console.warn('Haptic feedback failed:', error);
        }
    };

    const light = () => vibrate(10);
    const success = () => vibrate([10, 50, 10]);
    const error = () => vibrate([50, 100, 50]);

    return {
        vibrate,
        light,
        success,
        error,
        isSupported
    };
};
