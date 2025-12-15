/**
 * @file: sounds.ts
 * @description: Utility for playing UI sound effects using Web Audio API
 * @dependencies: None (uses native Web Audio API)
 * @created: 2025-12-15
 */

class SoundManager {
    private audioContext: AudioContext | null = null;
    private enabled: boolean = true;

    constructor() {
        if (typeof window !== 'undefined' && 'AudioContext' in window) {
            this.audioContext = new AudioContext();
        }
        this.enabled = localStorage.getItem('sounds_enabled') !== 'false';
    }

    private playTone(frequency: number, duration: number, volume: number = 0.1) {
        if (!this.audioContext || !this.enabled) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(
                0.01,
                this.audioContext.currentTime + duration / 1000
            );

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration / 1000);
        } catch (error) {
            console.warn('Sound playback failed:', error);
        }
    }

    complete() {
        this.playTone(440, 100, 0.08); // Soft ding
    }

    delete() {
        this.playTone(220, 150, 0.06); // Soft whoosh
    }

    create() {
        this.playTone(880, 80, 0.05); // Soft pop
    }

    setEnabled(enabled: boolean) {
        this.enabled = enabled;
        localStorage.setItem('sounds_enabled', enabled.toString());
    }

    isEnabled() {
        return this.enabled;
    }
}

export const soundManager = new SoundManager();
