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
## Архитектура
- **Frontend**: React + Vite + TypeScript.
- **State Management**: React Hooks (`useEvents`, `useAI`, `useTheme`).
- **Database**: Dexie.js (IndexedDB wrapper) for local storage.
- **Styling**: Tailwind CSS + Lucide React icons.
- **AI Layer**:
  - `services/ai.ts`: Unified service supporting:
    - **Google GenAI** (Default).
    - **Algion** (GPT-4o compatible).
    - **OpenRouter** (Unified API).
  - Web Speech API for voice input.
- **Integrations**: Telegram Bot API (direct fetch).

### Основные Компоненты
- `CalendarView`: Drag & Drop enabled calendar grid.
- `ChatInterface`: AI assistant with voice and suggestions.
- `SettingsModal`: Config for AI providers and connections.

