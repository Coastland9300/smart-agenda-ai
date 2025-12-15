/**
 * @file: usePWA.ts
 * @description: Hook to handle PWA installation and App Badging
 * @dependencies: react
 * @created: 2025-12-15
 */
import { useState, useEffect, useCallback } from 'react';

// Type for the BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
        platform: string;
    }>;
    prompt(): Promise<void>;
}

declare global {
    interface Navigator {
        setAppBadge?: (contents?: number) => Promise<void>;
        clearAppBadge?: () => Promise<void>;
    }
}

export const usePWA = (incompleteTaskCount: number) => {
    const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isInstalled, setIsInstalled] = useState(false);

    // 1. Listen for install prompt
    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            console.log('Context: PWA Install Triggered');
            setInstallPrompt(e as BeforeInstallPromptEvent);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    // 2. Handle Install Click
    const installApp = useCallback(async () => {
        if (!installPrompt) return;

        installPrompt.prompt();
        const { outcome } = await installPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
            setInstallPrompt(null);
            setIsInstalled(true);
        }
    }, [installPrompt]);

    // 3. App Badging Logic
    useEffect(() => {
        if ('setAppBadge' in navigator) {
            if (incompleteTaskCount > 0) {
                navigator.setAppBadge?.(incompleteTaskCount).catch(e => console.error("Badge error:", e));
            } else {
                navigator.clearAppBadge?.().catch(e => console.error("Badge clear error:", e));
            }
        }
    }, [incompleteTaskCount]);

    return {
        isInstallAvailable: !!installPrompt,
        installApp,
        isInstalled
    };
};
