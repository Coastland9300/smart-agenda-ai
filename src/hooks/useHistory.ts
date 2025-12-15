/**
 * @file: useHistory.ts
 * @description: Hook for managing undo/redo action history
 * @dependencies: types.ts
 * @created: 2025-12-15
 */

import { useState, useEffect, useCallback } from 'react';
import { ActionHistory } from '../../types';

const MAX_HISTORY = 20;

export const useHistory = () => {
    const [undoStack, setUndoStack] = useState<ActionHistory[]>([]);
    const [redoStack, setRedoStack] = useState<ActionHistory[]>([]);

    const addAction = useCallback((action: ActionHistory) => {
        setUndoStack(prev => {
            const newStack = [...prev, action];
            // Keep only last MAX_HISTORY actions
            return newStack.slice(-MAX_HISTORY);
        });
        // Clear redo stack when new action is added
        setRedoStack([]);
    }, []);

    const undo = useCallback((): ActionHistory | null => {
        if (undoStack.length === 0) return null;

        const action = undoStack[undoStack.length - 1];
        setUndoStack(prev => prev.slice(0, -1));
        setRedoStack(prev => [...prev, action]);

        return action;
    }, [undoStack]);

    const redo = useCallback((): ActionHistory | null => {
        if (redoStack.length === 0) return null;

        const action = redoStack[redoStack.length - 1];
        setRedoStack(prev => prev.slice(0, -1));
        setUndoStack(prev => [...prev, action]);

        return action;
    }, [redoStack]);

    const clear = useCallback(() => {
        setUndoStack([]);
        setRedoStack([]);
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                const action = undo();
                if (action) {
                    // Trigger custom event for App to handle
                    window.dispatchEvent(new CustomEvent('undo-action', { detail: action }));
                }
            } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault();
                const action = redo();
                if (action) {
                    // Trigger custom event for App to handle
                    window.dispatchEvent(new CustomEvent('redo-action', { detail: action }));
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo]);

    return {
        addAction,
        undo,
        redo,
        clear,
        canUndo: undoStack.length > 0,
        canRedo: redoStack.length > 0,
        undoCount: undoStack.length,
        redoCount: redoStack.length
    };
};
