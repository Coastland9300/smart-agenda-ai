# Project Architecture

## Overview
Smart Agenda AI is a Client-Side React Application interacting with Dexie.js (IndexedDB) and external APIs (Google GenAI, Telegram).

## Component Hierarchy
- **App** (Orchestrator - uses Hooks)
    - **Header** (Desktop Nav)
    - **Navigation** (Mobile Nav)
    - **MobileActions** (FABs)
    - **SettingsModal**
    - **CreateEventModal**
    - **ScheduleImportModal**
    - **ChatInterface**
    - **CalendarView**
    - **EventList**

## Hooks (Logic Layer)
- `useEvents`: Data persistence (Dexie) & State.
- `useAI`: Chat logic & Gemini API integration.
- `useTheme`: Dark mode management.
- `useReminders`: Notification system.

## Data Flow
1. **Events**: Loaded from Dexie on mount -> State in `App` -> Passed down to Views.
2. **AI Action**: User Input -> `ChatInterface` -> `App` (Callback) -> `AI Service` -> `DB` Update -> `State` Update.
3. **Reminders**: `App` Interval -> Check `Events` State -> Browser Notification.

## Future Improvements (Planned)
- Extract state management into Custom Hooks or Context.
- Decouple AI logic from the UI layer.
