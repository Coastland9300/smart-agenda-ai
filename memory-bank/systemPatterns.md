# System Patterns

## Architecture
- **Single Page Application (SPA)**: Built with React and Vite.
- **Client-Side Storage**: Data lives in IndexedDB via Dexie.js.
- **Services Layer**: Logic for DB, AI, Telegram, and Routine management is separated into `services/` folder.
- **Component Structure**: 
    - `App.tsx`: Main controller (State, Effects, Routing between tabs).
    - `components/`: UI components (ChatInterface, EventList, CalendarView, Modals).

## Design Patterns
- **Monolithic Container**: `App.tsx` currently holds most global state and business logic effects.
- **Service Module**: Stateless functions in `services/` handle external side effects (API calls, DB operations).
- **Observer/Interval**: `App.tsx` polls for reminders every 5 seconds.

## Current Technical Debt
- **God Component**: `App.tsx` is too large (600+ lines) and handles too many responsibilities (Theme, Routing, Data Fetching, Reminders, AI Interaction).
- **Hardcoded Logic**: Recurrence generation logic is partly in `App.tsx` and `services/routine`.
